# CommentFX

Independent rankings for forex brokers, prop firms and crypto exchanges.

The product thesis is one sentence: **a rank is only worth reading if you can
check how it was built.** So the scoring weights are published, every input is
traceable to a primary source, and commercial relationships are disclosed on
every link that carries one — and never touch the score.

## Data sources - all free, none authenticated

| What | Source | Cost |
|---|---|---|
| Coin prices, market caps, 7-day trend | CoinGecko | free tier |
| New DEX pools | GeckoTerminal | free |
| Token contract audits | GoPlus | free |
| Broker, prop and exchange records | curated, checked against regulators | free |
| Licence verification | CySEC public register (scraped) | free |
| Economic calendar | BLS release schedule, FOMC calendar, ECB calendar | free |

No API key is needed to run or build the site. A free tier going quiet must never
take the site down, so every fetch has a timeout, returns null on failure, and the
page renders an honest "unavailable" state with the reason. Nothing is ever served
as current that could not be confirmed, and every live page carries the timestamp
of the fetch behind it.

That claim is now checked rather than asserted — see [Degraded flows](#degraded-flows).
The first time anyone looked, it was false: an unanswered CoinGecko call took
every coin page on the site to 404.

## Broker status

`/status`, and a block on every broker page, answers the question a trader
actually has during an outage: is it down, or is it just me? Reports need no
account, store no address — they are counted by a salted digest rotated daily —
and one person cannot move a broker's status, because the count is of *distinct*
reporters and the threshold is published on the page.

None of it touches a score. Unverified crowd signal beside a verified number is
useful; unverified crowd signal *inside* it would destroy the number.

## Register checks

Once a day every licence we publish is compared against the register of the
regulator that issued it. The result is stored per licence and shown on the
broker page: confirmed and under what name, not on the register, or explicitly
not machine-checked with the reason.

Only CySEC is readable from a datacentre today. The FCA, ASIC, the Mauritius FSC
and the NFA were each probed and are **declared as blocked with the reason**
rather than omitted, so register coverage never looks wider than it is.

Two rules hold, and both are tested:

- "The register says nothing" and "we could not read the register" never collapse
  into the same answer. A fetch failure is not evidence about a licence, and it
  never overwrites what the register last actually said.
- Nothing is corrected automatically. A register disagreeing with us is a
  question for an editor — a scraper is wrong often enough that automatic
  correction would eventually publish a falsehood about a real company.

## Economic calendar

`/calendar` carries US and euro-area releases and rate decisions, each taken from
the institution that sets it. Nothing is copied from another calendar site and
nothing is inferred from a pattern.

A release time appears only where the source publishes one. The BLS states exact
times and names the zone; the Fed and the ECB publish dates without them, and
those rows say so. Times convert through `Intl`, not a fixed offset — 08:30 in
Washington is 12:30 UTC in October and 13:30 UTC in December — and the BLS fetch
fails outright if the page stops stating that its times are Eastern, because that
one sentence is what every clock on the page depends on.

Impact grading is ours, not the institutions'. It is a published list of release
names rather than a model, deliberately: a list can be argued with.

Seven releases get a page of their own at `/calendar/[release]` — the whole
forward schedule, what the release measures, and the exact time where the
publisher states one. The page list is fixed in `packages/core/src/releases.ts`
rather than derived from whatever the schedule happened to contain at build
time: a URL that appears and disappears with an upstream fetch is a URL nobody
can link to. We publish the dates, never the figures — those are authoritative
at the publisher and nowhere else.

## Reviews

Reviews are the most attacked surface a ranking site has: the broker wants good
ones, its competitors want bad ones, and from the server's side both look
exactly like a real customer. So publishing and counting are separate acts.

A review appears the moment it is written, labelled unverified, and reaches the
10% reviews component only when an editor has checked the evidence behind it.
Buying a hundred reviews buys a hundred unverified paragraphs and moves nothing
— that is asserted by a test, not just intended. Below five verified reviews the
component is excluded rather than scored low, like every other component.

No account, no email, no address stored: authorship is the same salted,
daily-rotated digest the incident reports use, and the unique index on
(broker, topic, author) is the rate limit. Someone with a genuine second
experience can write it tomorrow; a flood cannot happen today.

Because there are no accounts, the only honest way to let an author take a
review down is a secret handed over once at submission, stored as a digest. It
is said plainly on the form that losing it means losing the ability to withdraw,
and `/reviews/withdraw` is where it is used. A site that could reconstruct that
code would not be making a promise, it would be making a claim.

The evidence a reviewer offers an editor privately — a ticket number, a transfer
date — is never published. Publishing it would expose exactly the people acting
in good faith.

Reviews cover all three verticals, each with its own vocabulary — a complaint
about a broker is a withdrawal, about a prop firm a denied payout or a rule
applied after the fact, about an exchange a frozen account. A single shared list
would push most of those into "other" and lose the only structure a reader could
filter by. `/reviews` is every one of them, newest first, filterable.

They move the broker ranking and no other. The prop firm and exchange models
were published without a reviews component, and adding one means changing
weights that are already public — a decision to make openly, not a side effect
of shipping a feature. Until then those reviews are read and not counted, and
every one of those pages says so.

One structural rule keeps the numbers honest across the site: **anything that
shows a score reads the live review counts; anything that only needs the set of
slugs does not.** That includes `generateMetadata`, because a title advertising
a score the page does not show is the kind of drift nobody notices for weeks.

The `AggregateRating` in the structured data is the review average out of five,
never our composite out of ten. Those measure different things, and publishing
the composite under a count of reviews would claim five people awarded a number
none of them chose.

## Security posture

The site publishes what strangers write, so the surface is worth stating
plainly rather than implying it was considered.

**What protects the reviews.** React escapes everything it renders, and no user
text reaches `dangerouslySetInnerHTML` — the two places that use it take our own
data, and the JSON-LD one escapes `<` so a string can never close the script
tag. A test asserts the evidence a reviewer offers an editor privately never
appears in what a reader gets.

**Content-Security-Policy**, with its limit first: `script-src` carries
`'unsafe-inline'`, because Next inlines its own bootstrap and the alternative —
a nonce per response — means rendering every page dynamically, which would cost
the static generation this site is built on. So it does not stop injected inline
script. It does stop script from any other origin, plugins, framing, form posts
elsewhere, and `<base>` rewriting every relative URL. Verified against a real
browser across twelve pages: no violations, and hydration still works.

**The admin token is the weakest part** and is meant to be replaced by real
accounts. It fails closed (no `ADMIN_TOKEN` and every `/admin` route 404s),
compares in constant time, and every write records an actor into an append-only
audit log.

**A write with nowhere to go says so.** The read paths always degraded politely
when no database was configured; the write actions did not — they called
`getDb()` regardless, which falls back to an embedded database in a local
directory. On a deployment with nothing configured, the first report quietly
created a database on the server's disk that nobody knew about and a redeploy
would wipe, and the reader saw no error because from their side it had worked.
Every write action now checks first and says plainly that there is nowhere to
record it.

The forms themselves are still always offered, and that is deliberate. Gating
them on "is a database configured" is a build-time answer to a runtime question:
these pages are prerendered and the build has no database, so the answer would
describe the build machine. Tried it, and it hid the forms on a deployment that
had one. Only something running at request time may answer it.

**What is not solved.** The once-per-day limit on reports and reviews is a
salted digest of address and user agent; someone rotating both can write more.
The 80-character floor raises the cost, the score is unmoved either way because
nothing counts until an editor checks it, and there is no CAPTCHA. If
`REPORT_HASH_SECRET` is unset the salt is per process, so the limit resets on
restart — the app now says so loudly in production instead of degrading
quietly.

## Verification

Nothing on this site claims to be checked unless a person checked it and
recorded where. `verifications` is keyed per field, so a broker page can show
that its licence numbers were read off the regulator's register this week while
its withdrawal terms have never been checked — and it says exactly that, field
by field, with a link to each source.

A verification expires after 90 days. Expired and never-checked are shown as
different states, because they are different facts.

The slowest part of checking a record is not reading the number, it is finding
the page that carries it, so every field in the admin carries a link to where it
is published -- the regulator's register for licence numbers, the company's own
site for everything else -- and the source box comes prefilled with it. Prefilled,
and labelled as a starting point rather than a check, because the whole value of
that field is that a person opened the page.

`sites:report` keeps those links honest, and makes the same distinction the
register readers do: a site that is **gone** is a fact about the company, a site
that merely **refuses us** is a fact about our IP address. Trading venues answer
datacentres with 403 all day while serving every real visitor, so only 404, 410
and a name that does not resolve count as broken -- **and only when the response
carries no page**. That last clause was learned the hard way: octafx.com answers
410 Gone and then serves its full homepage, titled "Octa: the leading broker for
online trading". Reading the status line alone said the broker had vanished, and
acting on it put an unrelated company's address on a broker's record. The check
now reads the body before believing a dead status, and a test pins that case.

A redirect to another hostname is reported but never failed. It is not always a
rename: icmarkets.com sends this region to ic.com, whose own footer says it is
Raw Trading Ltd of the Seychelles -- the broker routing a visitor to a different
licence, which is precisely the thing the entity map on each broker page exists
to show.

The check also asks whether the page **belongs to the company we have it
against**, because a link can be alive and still be wrong and liveness checking
would pass that forever. Any distinctive word from the brand or from one of its
legal entities counts, deliberately generously: the cost of a false alarm is
someone re-checking a fine link, the cost of a miss is publishing a stranger's
business as a broker's.

Its limit is written into a test rather than left for someone to discover. It
would **not** have caught the octa.com mistake, because the tablet-mount company
there is also called Octa and the record's own name vouches for it. Two
businesses sharing a name is beyond what name matching can settle, and a green
run is not proof that every link points where it should. Six of the 26 sites
also refuse this host outright, so they are not checked at all rather than
quietly counted as fine.

The admin that records these **fails closed**: with no `ADMIN_TOKEN` configured,
every `/admin` route 404s, so an accidental deploy exposes nothing. The token is
a deliberate stopgap and not an auth system — it has no per-user identity and no
revocation — which is why every write records an actor into an append-only audit
log. Replace it with real accounts before anyone but its author touches it.

## Running it

```sh
pnpm install
pnpm --filter @commentfx/web dev     # http://localhost:3000
pnpm --filter @commentfx/core test   # scoring engine
pnpm build                           # all packages
```

No database or API key is needed to run the site. Everything renders from the
seed data in `packages/core/src/data/`.

## Accessibility

`pnpm --filter @commentfx/web audit:a11y` runs axe against the built site on a
390px viewport, and CI runs it on every push. It is not a formality — the first
run found **twenty distinct failing colour pairs**, because a palette that looks
restrained on a designer's monitor is unreadable on a phone outdoors:

| token | was | ratio | now | ratio |
|---|---|---|---|---|
| `--ink-3` (secondary text) | `#9AA3B5` | 2.21:1 | `#616C84` | 4.58:1 |
| `--up` | `#14B87C` | 2.31:1 | `#0E7E55` | 4.56:1 |
| `--warn` | `#BE7A09` | 3.18:1 | `#9B6307` | 4.55:1 |
| `--brass` (links) | `#A87528` | 3.66:1 | `#8F6522` | 4.61:1 |
| `--down` | `#E0393F` | 3.78:1 | `#D22127` | 4.58:1 |

Each ratio is against the darkest surface that colour is actually painted on,
measured rather than judged by eye, and the numbers are in `globals.css` beside
the tokens. Two habits went with them: text is never de-emphasised with
`opacity` (it composites toward the background and takes the contrast with it),
and links inside a sentence carry an underline, because colour alone is not a
distinction everyone can see.

Logo tiles are the case a stylesheet cannot fix, because those colours arrive as
data. `legibleTile` in `packages/core/src/contrast.ts` takes the brand pairing as
a preference and overrides it when it fails — keeping the hue, switching the text
to whichever of black or white works, and darkening the tile when neither does. A
test asserts every logo in the seed data comes out readable.

The audit is also what showed the skip link works: first Tab lands on it at
122×39, Enter moves focus to `#main`. Worth checking rather than assuming, since
`sr-only` renders it 1×1 until focused and it is easy to mistake that for a bug.

## Writing flows

`pnpm --filter @commentfx/web smoke` drives publishing a review, seeing it
appear, refusing a wrong withdrawal code, accepting the right one, seeing it go,
and reporting an outage — through the real forms, in a real browser, against a
real database. CI runs it on every push.

It exists because the two worst bugs this project has had were both invisible to
the unit suite, and both took about a minute to find by clicking the button:

- Every record page had `dynamicParams = false` while every write called
  `revalidatePath()`. Purging a prerendered entry Next may not regenerate does
  not refresh it — it 404s it permanently. Publishing one review took that
  broker off the site.
- `getDb()` cached its handle in a module-level variable, which a bundler gives
  to each chunk separately. Two PGlite instances over one directory meant every
  write was invisible to every page, including force-dynamic ones.

Neither is a bug in our logic, which is why the unit suite had nothing to say
about them. Both are properties of the runtime the code lives in.

`smoke:admin` does the same for the editor's side, which matters more than it
sounds: the whole product rests on the claim that a number counts only once a
person checked it, and that claim is only as good as the screen the person uses.
It drives the token gate, checking a review and watching the public page relabel
it, recording a field verification and watching the count move, and renewing an
expired one — a verification lapses after 90 days, so renewing has to update
rather than add.

## Degraded flows

`pnpm --filter @commentfx/web smoke:degraded` walks the site with every upstream
it reads unreachable — the three market APIs and the three official calendars,
which is the whole of what it fetches — and CI runs it as its own job on every
push.

The job breaks them at the host level *before* the build, which is the only
arrangement that tests anything. Next caches a successful fetch for the
revalidate window and prerenders the top coins, so a site built against a working
network keeps serving real prices through the first minutes of an outage —
correct behaviour, and the reason a check run against that build is theatre.
Broken first, every page renders live against nothing. The script also asserts
the upstreams really are unreachable before it asserts anything else: a
degradation test that runs against a working network passes every time.

It found the third bug of the kind above. `/coins/[slug]` called `notFound()`
whenever the market data did not arrive, and a free tier not answering is a
Tuesday. Every coin page went to 404, Bitcoin's included — and because a
prerendered page that revalidates mid-outage writes its result back to the cache,
the 404 stuck there. Same shape as the `dynamicParams` bug: a transient condition
deleting a permanent page.

A 404 has to mean "there is no such page", not "the network is quiet this
minute", and telling those apart needs an answer we already have. That is
`packages/core/src/data/coins.ts` — the ids, tickers and names of the coins we
cover, checked in, no numbers. A slug it does not know is still a 404. A coin it
knows renders its page with the numbers missing and a sentence saying why,
keeping the half that never needed the feed. `/coins` does the same: during an
outage it still lists what it covers, so the pages behind it stay reachable by
anyone browsing rather than arriving from a search result.

Refresh it with `node --experimental-strip-types packages/ingest/src/refresh-coins.ts`.
It is deliberately not generated at build time: a file whose whole job is to be
an answer we already have when the network has none cannot be fetched.

The calendar had this shape before the coin pages did — a release page keys off
checked-in data and reports its source's silence separately, naming the
publisher and linking to it rather than showing a date it could not confirm. The
job asserts that too, so it stays that way.

That page is served as 200 rather than the 503 the situation deserves, because
Next's App Router gives a page no way to set a status — and standing in a 404 for
a 503 is what caused this. The body says plainly that the data is missing.

## Search

`/search` renders the whole directory into the page, so what a reader types
never leaves their browser — there is no search request and nothing to log.
`pnpm --filter @commentfx/web smoke:search` drives it in CI.

Nothing had ever driven it, and it was missing a hundred pages. Searching
"bitcoin" on a site that publishes a Bitcoin page returned the `/coins` list and
stopped — the same cause as the sitemap gap, since coin ids only existed behind
a fetch and the index is built synchronously. And searching "nfp", which is what
a trader types, returned the calendar index rather than the release's own page;
nobody searches "Employment Situation". Releases now carry an `aka` list in the
data, with a test on it, because forgetting one fails silently: the page exists,
it is in the sitemap, and the only name anyone knows does not find it.

The first block of the smoke is coverage — one query per kind of page the site
publishes, asserting search reaches that kind at all. That is the check that
would have caught both.

The page also used to emit an `ItemList` of all 178 entries, twenty kilobytes on
every load, and it earned nothing: `ItemList` is for a carousel of one content
type, and a mixed list of brokers, coins, comparisons and utility pages is not
one. Discovery was never the argument either — every entry is already a real
link in the HTML, which is what a crawler follows. Removed; the page went from
191 KB to 150 KB.

## Sitemap

`pnpm --filter @commentfx/web check:sitemap` holds the sitemap to the site, in
both CI jobs. The rule needs no allowlist, which is what makes it worth running:
a page declares whether it wants to be indexed, and the sitemap has to agree.

    indexable  →  in the sitemap
    noindex    →  not in the sitemap
    listed     →  serves 200, and its canonical points at itself

The sitemap is generated from the data rather than hand-maintained, which makes
it feel self-maintaining and is exactly why nobody looked at it. It was missing
every coin page — fifty built, a hundred served, all of them linked from
`/coins`, none of them listed: the site's largest block of pages and its most
searched-for ones. The generator is synchronous and coin ids only ever came from
a fetch, so they could not be listed and quietly were not. They come from the
checked-in index now, which also means the sitemap cannot shrink because an
upstream was rate-limited the minute it regenerated — that would be the coin-page
404s again, told to a crawler. The degraded job asserts exactly that.

It also caught the homepage disagreeing with itself: the sitemap said
`https://commentfx.com/` and the canonical said `https://commentfx.com`. Next
renders canonicals with `trailingSlash` false, so `absoluteUrl` strips it too.

## Scheduled jobs

Every parser here fails safe: when a page's markup changes it reports the source
as unavailable rather than publishing nonsense, and the site renders an honest
"we could not read this". That is right for a reader and invisible to us — a
scraper that broke in March would still be politely unavailable in June. So the
silence is turned into a notification:

```sh
pnpm --filter @commentfx/ingest probe             # every upstream, exit 1 if a parser broke
pnpm --filter @commentfx/ingest registers:report  # licence findings, no database, exit 2 if any
pnpm --filter @commentfx/ingest sites:report      # company sites, exit 2 if one has gone
pnpm --filter @commentfx/web check-registers      # the register check, written to the database
```

`.github/workflows/sources.yml` runs the first three daily. A broken parser opens
an issue and closes it when the source recovers; licence findings update one
issue in place rather than commenting daily, because an issue that grows a
duplicate comment every morning gets muted, and a muted issue is the same as no
issue.

The probe's dividing line is not API against scraper, it is **transient against
structural**. A rate-limited free tier warns: it is expected, temporary, and the
page already says so. An upstream that answers with something we can no longer
read fails, because nothing else would ever find out. So an API probe checks the
fields the site actually reads rather than only that the call returned —
CoinGecko renaming `current_price` would leave every price on the site rendering
a dash while a probe that counted the array called it healthy. That check is a
pure function with a test on it, because the case worth being sure about is one
nobody can produce on demand.

It also refuses to cry wolf. When every probe fails the same way on the same run
— a scraped register, three central bank calendars and three unrelated APIs —
that is a runner with no network, not seven upstreams breaking at once. The job
still goes red, and it says so instead of opening "a parser is broken".

`index: coins` is in there too, and is not an upstream: it compares the
checked-in coin index against the live top 100. Drift is expected and mostly
harmless. A coin in the live **top 25** that the index does not know is not: that
is a page people land on, missing from the sitemap and from the site's own
search, and 404ing during an outage. That one fails.

In production `check-registers` is the one that matters — it needs `DATABASE_URL`
and should run on the same daily schedule.

## Layout

```
apps/web          Next.js 15 — the public site, statically generated
packages/core     types, the scoring engines, regulator registry, seed data
packages/db       schema, migrations, verification tracking, audit log
packages/ingest   free-tier upstreams behind one failure-tolerant contract
.github/workflows CI, and the daily upstream probe
design/           app screen designs (dark, Persian)
design-web/       website designs (light, English) — the tokens the app uses
docs/             the 16-week roadmap
```

## Two constraints that shape the build

**No live spread feed.** We do not run MT5 terminals, so we do not claim live
spreads. Each broker's *published* cost is shown with the date a human last
checked it, and anything unverified is labelled as such in the UI. This removed
the entire Windows-VPS layer from the plan.

**Free data sources only.** CoinGecko (free tier), DefiLlama, GeckoTerminal,
GoPlus, Deribit, alternative.me, Frankfurter, and official release calendars
from BLS / the Fed / the ECB. Nothing in the stack requires a paid plan.

## How the scores work

Three verticals, three models, one shared mechanism.

| Brokers | | Prop firms | | Exchanges | |
|---|---|---|---|---|---|
| Regulation & licensing | 30% | Rule fairness | 30% | Solvency evidence | 30% |
| Published trading cost | 20% | Payout terms | 25% | Security record | 25% |
| Payments & withdrawals | 20% | Challenge cost | 20% | Trading fees | 20% |
| Platforms & execution | 15% | Platforms & markets | 15% | Liquidity | 15% |
| Verified reviews | 10% | Transparency | 10% | Transparency | 10% |
| Corporate transparency | 5% | | | | |

One rule matters more than any weight, and it lives in
`packages/core/src/scoring-kit.ts` so all three verticals share it: **a component
with no data is excluded and the remaining weights are renormalised — never
scored as zero.** A broker with no reviews yet is not the same thing as a broker
with bad reviews, and every page says which components were excluded.

Three judgements are worth knowing before reading a number:

- **Prop firms** are weighted toward how drawdown is measured. Static drawdown
  is fixed against your starting balance; trailing follows equity upward, so an
  unrealised spike permanently raises the floor. The same trader passes one firm
  and fails another on identical trades because of it.
- **Exchanges** treat a self-published proof of reserves as the weakest form of
  solvency evidence — unaudited, chosen by the exchange, silent on liabilities.
  An audit or a public listing scores higher.
- **A breach is not a breach.** An exchange that was hacked and covered every
  loss scores materially above one that did not.
- **Memecoin names are treated as hostile input.** Token names come from whoever
  deployed the token. A name can carry an invisible right-to-left override that
  makes it render as something it is not, or a Cyrillic letter standing in for a
  Latin one to impersonate a known token. Names are stripped of invisible
  characters before they reach the page, mixed alphabets are flagged, and a
  hidden-character name caps the safety score outright. This turned up in live
  data on the first run - it was not anticipated.


## SEO

Every page is statically generated with a unique title, description and
canonical. Structured data is emitted as a single `@graph` per page:
`Organization` and `WebSite` site-wide, plus `BreadcrumbList`, `ItemList` on
rankings, `FinancialService` on broker pages and `FAQPage` where there are real
questions. `AggregateRating` is only emitted once reviews actually exist —
shipping a rating with nothing behind it is how a site loses rich results.

Programmatic pages come from real queries over the data, not templates:
`/best/[criterion]` and `/compare/[a]-vs-[b]`. The sitemap is generated from the
same source, so it can never drift from what exists.

`/search` renders the whole directory into the page and filters it in the
browser — no request, nothing logged, and with JavaScript off it is a plain
directory, which is also the internal link hub the site needed.

Comparison pages are generated from the same function the broker pages use to
pick their alternatives. These were allowed to drift once: the pages linked three
alternatives each while only the top six brokers got a built page, so most
"X vs Y" links on the site were 404s. Anything linked is now built, and a sweep
of every internal href across all prerendered pages finds nothing dead.

## Data status

The seed brokers in `packages/core/src/data/brokers.ts` are **development
placeholders**. Every numeric field carries `verifiedAt: null` and the site
renders an unverified state for them. Before launch each record must be checked
against the regulator's own register and the broker's published terms.
