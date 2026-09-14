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

## Verification

Nothing on this site claims to be checked unless a person checked it and
recorded where. `verifications` is keyed per field, so a broker page can show
that its licence numbers were read off the regulator's register this week while
its withdrawal terms have never been checked — and it says exactly that, field
by field, with a link to each source.

A verification expires after 90 days. Expired and never-checked are shown as
different states, because they are different facts.

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

## Scheduled jobs

Every parser here fails safe: when a page's markup changes it reports the source
as unavailable rather than publishing nonsense, and the site renders an honest
"we could not read this". That is right for a reader and invisible to us — a
scraper that broke in March would still be politely unavailable in June. So the
silence is turned into a notification:

```sh
pnpm --filter @commentfx/ingest probe             # every upstream, exit 1 if a parser broke
pnpm --filter @commentfx/ingest registers:report  # licence findings, no database, exit 2 if any
pnpm --filter @commentfx/web check-registers      # the same check, written to the database
```

`.github/workflows/sources.yml` runs the first two daily. A broken parser opens
an issue and closes it when the source recovers; licence findings update one
issue in place rather than commenting daily, because an issue that grows a
duplicate comment every morning gets muted, and a muted issue is the same as no
issue.

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
