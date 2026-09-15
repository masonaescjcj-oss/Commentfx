# @commentfx/db

One schema, two backends. With `DATABASE_URL` set this is real PostgreSQL; with
it unset an embedded PostgreSQL (PGlite, compiled to WASM) runs in-process, so a
fresh checkout needs no database to install and `pnpm test` exercises the exact
DDL that ships.

```sh
pnpm --filter @commentfx/db generate   # SQL migrations from the schema
pnpm --filter @commentfx/db seed       # load the curated records
pnpm --filter @commentfx/db test       # against a throwaway in-memory database
```

## One constraint worth knowing

**A file-backed PGlite database is single-process.** A running dev server holds
it, so a build started alongside cannot open it and every lookup fails. That
cost a full debugging cycle here. Stop the dev server before building, or point
`DATABASE_URL` at a real PostgreSQL and the constraint disappears.

`PGLITE_DIR` chooses the directory (default `.pglite`). Tests always get a fresh
in-memory database and never touch it.

## Why verification is per field

`verifications` is keyed on `(kind, slug, field)`, not on the record, because
that is how checking actually happens: someone reads a licence number off the
regulator's register on Monday and the withdrawal terms off the broker's own
page on Thursday. A single `verified_at` column on the row would claim more than
anyone did.

Three things are required for every row and enforced in the action, not the form:

- **A source URL**, https only. A verification with no source is an opinion.
- **The value as seen at that source**, so drift is detectable later — when a
  re-check records a different value, the admin says so rather than overwriting
  quietly.
- **An audit row.** `audit_log` is append-only and the admin exposes no route
  that deletes from it.

Seeding writes no verification rows. A script running is not a person checking.

## Staleness

A verification expires after 90 days (`STALE_AFTER_DAYS`). Expired is a distinct
state from unverified in the UI, because "checked, but a while ago" and "never
checked" are different facts and the reader is entitled to both.

## Incident reports

`status_reports` answers "is it down, or is it just me?" for each broker. Two
rules shape the table and both are load-bearing:

**No address is ever stored.** `reporter_hash` is a SHA-256 digest of the
network address, the user agent, a process secret and the current date. The date
in the input means the salt rotates daily, so reports cannot be correlated
across days. The hash exists to count *distinct* reporters and to deduplicate,
and it can do nothing else.

**A report is evidence, not a verdict.** The displayed status changes only above
a published threshold of distinct reporters inside a rolling window, and the
count, window and threshold are all shown to the reader either way. A unique
index on `(broker, kind, reporter_hash)` makes a repeat submission a no-op, so
one determined person counts once — there is a test that submits thirty times
from one hash and asserts the status stays normal.

Distinct reporters are counted across the whole broker, not summed per kind:
someone reporting both a withdrawal delay and a login failure is one person, and
summing the per-kind counts would let them count twice.

Incident reports never enter any score. Scores move only on verified facts.

## Register checks

`register_checks` holds one row per (broker, regulator, licence): what the
regulator's own public register said the last time it was read. `register_runs`
holds one row per source per run, so a scraper that silently stops working is
visible rather than looking like a register that stopped confirming things.

Two rules are enforced in `registers.ts` and covered by tests:

- A `source-unavailable` finding never overwrites a real answer. The last thing
  the register actually said is more useful than "we could not reach it today",
  and overwriting would erase a confirmation every time the network hiccupped.
- Nothing here edits a broker record. A register disagreeing with us is a
  finding for an editor, never an automatic correction.

Run the readers with `pnpm --filter @commentfx/web check-registers` (needs
`DATABASE_URL` or `PGLITE_DIR`). It exits 2 when something needs a human.


## One handle, on globalThis

`getDb()` keeps its handle on `globalThis`, not in a module-level `let`. That is
not the usual hot-reload workaround — it is load-bearing.

A bundler splits the server into chunks, and a module-level variable is per
chunk. The chunk holding a server action and the chunk holding a page each
built their own handle. Against real Postgres that is two connection pools and
nobody notices. Against a file-backed PGlite it is **two embedded databases over
one directory**, and they cannot see each other's writes.

What that looked like from outside: a reader publishes a review, is told it is
live, and it never appears — not on the broker page, not on the site feed, not
even on `/admin`, which is force-dynamic and re-renders every request. The row
was really in the database the whole time. Measured after the fix, the same
review is on both pages on the **first** request.

It cost a long detour into Next's revalidation, which was innocent. The lesson
is cheap to state and was expensive to learn: when a write is invisible to a
read, check that they are talking to the same database before blaming the cache
in front of it.

## Two ways to break a file-backed PGlite

Both were hit while driving the real site, and both are dev-only — production
runs `DATABASE_URL` against real Postgres, which has neither problem.

**Never point a `next build` at `PGLITE_DIR`.** Next prerenders in parallel
worker processes and each one opens the database. PGlite is single-process; the
WASM instance aborts, every read in the build returns empty, and the pages come
out looking as though there were no reviews rather than failing. Build with no
database — the way CI and production do — and supply `PGLITE_DIR` to
`next start` only.

**Never `kill -9` a server holding one.** SIGKILL gives PGlite no chance to
close, and the next open aborts on the first write. `kill -TERM` and wait.

Both failures announce themselves the same way, which is worth recognising:

    [reviews] stats lookup failed: [RuntimeError: Aborted().]

That line exists because `lib/reviews.ts` logs before it degrades. Without it
the site would simply have shown no reviews and said nothing.
