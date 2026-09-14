# CommentFX

Independent rankings for forex brokers, prop firms and crypto exchanges.

The product thesis is one sentence: **a rank is only worth reading if you can
check how it was built.** So the scoring weights are published, every input is
traceable to a primary source, and commercial relationships are disclosed on
every link that carries one — and never touch the score.

## Running it

```sh
pnpm install
pnpm --filter @commentfx/web dev     # http://localhost:3000
pnpm --filter @commentfx/core test   # scoring engine
pnpm build                           # all packages
```

No database or API key is needed to run the site. Everything renders from the
seed data in `packages/core/src/data/`.

## Layout

```
apps/web        Next.js 15 — the public site, statically generated
packages/core   types, the scoring engine, regulator registry, seed data
design/         app screen designs (dark, Persian)
design-web/     website designs (light, English) — the tokens the app uses
docs/           the 16-week roadmap
```

## Two constraints that shape the build

**No live spread feed.** We do not run MT5 terminals, so we do not claim live
spreads. Each broker's *published* cost is shown with the date a human last
checked it, and anything unverified is labelled as such in the UI. This removed
the entire Windows-VPS layer from the plan.

**Free data sources only.** CoinGecko (free tier), DefiLlama, GeckoTerminal,
GoPlus, Deribit, alternative.me, Frankfurter, and official release calendars
from BLS / the Fed / the ECB. Nothing in the stack requires a paid plan.

## How the score works

Six weighted components in `packages/core/src/score.ts`:

| Component | Weight |
|---|---|
| Regulation & licensing | 30% |
| Published trading cost | 20% |
| Payments & withdrawals | 20% |
| Platforms & execution | 15% |
| Verified reviews | 10% |
| Corporate transparency | 5% |

One rule matters more than the weights: **a component with no data is excluded
and the remaining weights are renormalised — never scored as zero.** A broker
with no reviews yet is not the same thing as a broker with bad reviews, and
every page says which components were excluded.

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

## Data status

The seed brokers in `packages/core/src/data/brokers.ts` are **development
placeholders**. Every numeric field carries `verifiedAt: null` and the site
renders an unverified state for them. Before launch each record must be checked
against the regulator's own register and the broker's published terms.
