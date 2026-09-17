# Deploying CommentFX

The repository builds and serves without any configuration at all. That is
deliberate — a missing key must never be able to take the site down — but it
also means a deployment with nothing set is a **read-only** site: nobody can
write a review, report an outage, or edit a record, and the pages say so rather
than pretending otherwise.

This page says what each variable buys you, in the order worth adding them.

## What you need

- **Node 20.9 or newer.** The repo pins `pnpm@10.11.0` in `packageManager`, so
  a host with corepack enabled installs the right pnpm by itself.
- **A Postgres database**, if you want anyone to be able to write. Any managed
  Postgres does; the schema is applied by the app on first connect (see
  [Migrations](#migrations)).
- **Nothing else.** Every upstream this site reads — CoinGecko, GeckoTerminal,
  GoPlus, the BLS, Fed and ECB calendars, and four newsroom RSS feeds — is free
  and unauthenticated. There is no key to buy and no plan to sign up for, and
  that is a constraint the project keeps on purpose: it means no ranking can
  quietly become a function of what we could afford to license.

## Build and run

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm --filter @commentfx/web start   # listens on $PORT, default 3000
```

`pnpm build` reaches the free APIs to prerender prices, the calendar and the
news card. **Every one of those calls is allowed to fail.** A build on a
rate-limited network produces a site whose live cards say they could not be
read, not a broken build — which is why a red upstream never reddens a deploy.

## Environment

### `DATABASE_URL`

A Postgres connection string. Without it the app falls back to PGlite, an
embedded database written to `.pglite` on local disk.

**On a server, that fallback is a trap, and the app treats it as one.** An
ephemeral filesystem means the first review anyone writes goes into a database
nobody knows about and the next deploy erases it, while the writer sees it
succeed. So every write action checks for a real database first and says plainly
that there is nowhere to record it. Set this, or accept a read-only site — but
do not accept a site that looks writable and is not.

The read paths never need it. Rankings, licences, scores, the calendar and
every coin page are checked-in data or live upstream fetches, and all of them
serve with no database at all.

### `REPORT_HASH_SECRET`

A long random string. It salts the digest of address and user agent that
enforces the once-per-day limit on reports and reviews.

Unset, the salt is generated per process. That means the limit resets on every
restart and differs between instances, so on a deployment with two of them a
writer gets two allowances. The app logs this loudly at startup rather than
degrading quietly. Set it once and keep it — changing it resets everyone's
allowance, which is harmless but pointless.

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### `SESSION_SECRET`

What signs the session cookie, and the switch that turns accounts on. Generate
it the same way as the one above and keep it: changing it signs everybody out,
which is harmless and annoying.

Unset, there are no accounts on the deployment — the admin is reachable only
with the shared token below, and nothing can be written through it, because
every write asks who is signed in.

### `ADMIN_TOKEN`

Break-glass for `/admin`. It is how the first account is created on a fresh
deployment and how somebody gets back in after locking themselves out.

**With neither this nor `SESSION_SECRET` set, every `/admin` route rewrites to a
404** — the whole surface is invisible, so an accidental deploy exposes nothing.

It has no name to put in an audit row and no role to check, so it reaches every
screen and writes nothing. Send it as `Authorization: Bearer <token>`, or set a
`cfx_admin` cookie, open `/admin/setup`, make the first admin account, and then
unset it. A deployment with accounts on it loses nothing by having no token, and
keeping one around is keeping a key that nobody's name is on.

Note that a deployment with `SESSION_SECRET`, no `ADMIN_TOKEN` and no accounts
has no way in at all. That is deliberate rather than a gap: whoever can set one
environment variable can set the other, and the alternative — letting anyone who
finds the URL first become the admin of somebody else's site — is not a
trade worth making.

### `NEXT_PUBLIC_SITE_URL`

The site's own origin, e.g. `https://commentfx.com`. Defaults to
`https://commentfx.com`.

Set this on any deployment that is not that domain — a staging host, a preview.
It is what canonical URLs, the sitemap, `robots.txt` and every piece of
structured data are built from, so a preview deploy with the default is telling
search engines that the production site is the canonical copy of the page they
are looking at. Harmless if the preview is `noindex`, wrong otherwise.

### `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION`

Optional. The content value each webmaster tool gives you for its "HTML tag"
verification method — not the whole tag, just the string inside `content="…"`.

Set it, redeploy, then press Verify in the console. Unset, nothing is rendered:
an empty verification tag is worse than none, because it looks like it ought to
work and fails without saying why.

Both are read at **build** time, not at runtime — Next bakes root metadata into
the output — and Turborepo only passes through the variables named in
`turbo.json`, which these are. Setting one on the running process and restarting
does nothing; it has to be present for the build. This cost a confused half hour
the first time and is the only surprising thing about either of them.

Neither is committed, because the token is per-property. It changes if the
property is deleted and re-created, and a stale one in the repository would fail
verification with nothing on the page to explain it.

Once verified, submit `https://<your domain>/sitemap.xml` in Search Console. It
is generated from the data and lists only the pages that pass the indexing gate
in `packages/core/src/indexing.ts`, so it is always in step with the `noindex`
each page carries — `pnpm --filter @commentfx/web check:seo` fails the build if
the two ever disagree.

## Migrations

There is no separate migration step and no `drizzle-kit push` to remember.

`makeDb()` applies the schema on first connect, against both backends, and
records what it applied in a `_migrations` ledger so a second boot is a no-op.
On Postgres it takes a session-level advisory lock first, because a deploy that
starts three instances at once has three of them reaching that line in the same
second, and concurrent `CREATE TABLE` is how one of them dies. The lock is
released in a `finally` on a dedicated connection.

This was not free advice. The embedded path applied its migrations on connect
and the Postgres path did not, so a deployment with `DATABASE_URL` set installed
cleanly, built cleanly, served every read-only page, and answered the first
write with `relation "regulators" does not exist`. The `postgres` job in CI
exists to stop that coming back: it runs the whole write suite against a real
Postgres, and it fails with that exact error if the migration step is removed.

## Seeding

A fresh database has no brokers, prop firms or exchanges in it. The records are
checked into `packages/core/src/data/`, and this copies them in:

```sh
node --experimental-strip-types packages/db/src/seed.ts
```

Run it once against `DATABASE_URL`. It is idempotent.

## Keeping the checked-in data current

Two scripts regenerate files that are deliberately **committed rather than
fetched**, because their whole job is to have an answer when the network does
not:

```sh
# Which coins have pages. Without it, an unreachable CoinGecko and a made-up
# slug look identical, and /coins/[slug] has to guess.
node --experimental-strip-types packages/ingest/src/refresh-coins.ts

# Which regulator registers can actually be read from a datacentre.
pnpm --filter @commentfx/web check-registers
```

Run them by hand, review the diff, commit. Neither belongs in the build: a file
whose purpose is to survive an outage must not be produced by something that
needs the network to succeed.

## What runs in CI, and what that buys a deploy

Everything below runs on every push, and each one exists because something got
through without it:

| Job | What it proves |
| --- | --- |
| `check` | Types, 156 unit tests, the build, axe at 390/1440px, the SEO contract over every URL in the sitemap, site search, CLS at both widths, the writing flows and the editor flows against a real database |
| `degraded` | The site built with **every** upstream unreachable still serves every page, publishes no number it could not fetch, and keeps its sitemap intact |
| `postgres` | The production database path, against a real Postgres |

A green `check` means a deploy will build. A green `degraded` means it will
survive the day a free tier goes quiet, which is the failure this project is
actually shaped around.

## A deployment checklist

1. `DATABASE_URL` set, or you have decided the site is read-only.
2. `REPORT_HASH_SECRET` set to something long and kept.
3. `SESSION_SECRET` set if anybody is going to edit anything.
4. `ADMIN_TOKEN` set for as long as it takes to open `/admin/setup` and make the
   first account, then unset.
5. `NEXT_PUBLIC_SITE_URL` set if this is not the production domain.
6. Seed once.
7. Open `/status` and `/brokers/exness`, write a review, withdraw it with the
   code you are given. That is the one path that touches the database in both
   directions, and it is the only check that has ever caught the two worst bugs
   this project has had.
