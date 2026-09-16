import type { Metadata } from 'next';
import {
  WEIGHTS, LABELS, REGULATORS, type ScoreKey,
  PROP_WEIGHTS, PROP_LABELS, type PropKey,
  EXCHANGE_WEIGHTS, EXCHANGE_LABELS, type ExchangeKey,
  MEME_WEIGHTS, MEME_LABELS, type MemeKey,
  IMPACT_RULE, IMPACT_LABEL, MIN_FOR_SCORE,
} from '@commentfx/core';
import { registerCoverage } from '@/lib/register-coverage';
import { pageMetadata, JsonLd, breadcrumbLd } from '@/lib/seo';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, CardHead, Meter, Tag } from '@/components/primitives';

const TITLE = 'How we score';
const DESC =
  'The full method for all three rankings — brokers, prop firms and exchanges. ' +
  'What every component measures, the weight it carries, and what happens when a ' +
  'component has no data yet.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/methodology' });

const WHAT: Record<ScoreKey, string> = {
  regulation: 'The best licence a broker holds, plus a bounded bonus for holding several serious ones. Tier A regulators run a statutory compensation scheme and a public register; tier C is registration only.',
  cost: 'Published EUR/USD spread and round-turn commission reduced to a single figure. A $7 commission per standard lot is worth about 0.7 pips, so the two are directly comparable.',
  payments: 'Breadth of funding methods, the broker’s own stated withdrawal processing time, and how much it takes to open an account.',
  platform: 'How many platforms are offered, the execution model, and whether copy trading is built in.',
  reviews: 'Mean of verified reviews. Counted only once a broker has at least five — below that it is excluded rather than guessed at.',
  transparency: 'Four disclosures: entity mapping, audited accounts, segregated client funds, public ownership.',
};

const PROP_WHAT: Record<PropKey, string> = {
  rules: 'How drawdown is measured carries more than a third of this component on its own. Static drawdown is fixed against your starting balance; trailing drawdown follows equity upward, so an unrealised spike permanently raises the floor. The rest is headroom, profit target, deadline, and whether a consistency rule, news ban or weekend ban applies.',
  payout: 'Profit split, how often a payout can be requested, and how long after funding the first one becomes available.',
  cost: 'Challenge fee normalised to a $100k account. Firms price many account sizes, so a headline fee compares nothing.',
  platform: 'How many platforms are offered and how many markets can be traded.',
  transparency: 'Three disclosures: a published rule-change history, the legal entity behind the firm, and the broker executing the trades.',
};

const EXCHANGE_WHAT: Record<ExchangeKey, string> = {
  solvency: 'What evidence exists that customer funds are there. A self-published proof of reserves is real but the weakest kind — unaudited, chosen by the exchange, silent on liabilities. An audit by a named third party, or the continuous disclosure a public listing forces, scores higher.',
  security: 'Years since the last customer-funds breach, softened by whether users were made whole. An exchange that was hacked and covered every loss is not in the same category as one that was not.',
  fees: 'The taker fee actually charged at the lowest tier.',
  liquidity: 'Reported spot volume, on a logarithmic scale and used only as a band. Volume is self-reported and has been inflated industry-wide for years, which is why it carries the least weight here.',
  transparency: 'Three disclosures: a public fee schedule, the legal entity, and incident reports.',
};

const MEME_WHAT: Record<MemeKey, string> = {
  control: 'What the deployer can still do after launch: print supply, freeze balances, rewrite balances outright, change metadata, or tax transfers. Two findings cap the score no matter what else is true -- a blocked sell path and a mutable balance authority. A name carrying invisible bidi characters caps it too, because a name crafted to render as something it is not is a deliberate act.',
  liquidity: 'Money actually sitting in the pool, on a logarithmic scale. It is the practical measure of whether you can exit at size.',
  tax: 'Buy and sell tax on EVM chains; on Solana, whether a transfer fee or transfer hook is attached.',
  activity: 'Whether trading is genuinely two-sided. A book that is all buys and no sells has not been tested for exit.',
};

function Weights<K extends string>({ keys, weights, labels, what, max }: {
  keys: K[]; weights: Record<K, number>; labels: Record<K, string>; what: Record<K, string>; max: number;
}) {
  return (
    <ul className="flex flex-col gap-4">
      {keys.map((k) => (
        <li key={k}>
          <div className="flex items-baseline gap-2 mb-[6px]">
            <h3 className="text-[13.5px] font-bold">{labels[k]}</h3>
            <div className="flex-1" />
            <span className="text-[12px] font-extrabold text-brass tnum">{Math.round(weights[k] * 100)}%</span>
          </div>
          <Meter value={weights[k] * 100} max={max} />
          <p className="text-[12px] text-ink-2 leading-[1.8] mt-2">{what[k]}</p>
        </li>
      ))}
    </ul>
  );
}

export default function MethodologyPage() {
  const coverage = registerCoverage();
  const trail = [{ name: 'Home', path: '/' }, { name: 'How we score', path: '/methodology' }];
  const tiers = (['A', 'B', 'C'] as const).map((t) => ({
    tier: t,
    regs: Object.values(REGULATORS).filter((r) => r.tier === t),
  }));

  return (
    <>
      <Header />
      <main id="main" className="shell pt-0 pb-6 sm:pt-3 lg:pb-10 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
        <Breadcrumbs trail={trail} />
        <h1 className="sr-only">{TITLE}</h1>

        <Card className="p-4" as="section">
          <h2 className="text-[15px] font-bold mb-4">Brokers</h2>
          <Weights keys={Object.keys(WEIGHTS) as ScoreKey[]} weights={WEIGHTS} labels={LABELS} what={WHAT} max={30} />
        </Card>

        <Card className="p-4" as="section">
          <h2 className="text-[15px] font-bold mb-4">Prop firms</h2>
          <Weights keys={Object.keys(PROP_WEIGHTS) as PropKey[]} weights={PROP_WEIGHTS} labels={PROP_LABELS} what={PROP_WHAT} max={30} />
        </Card>

        <Card className="p-4" as="section">
          <h2 className="text-[15px] font-bold mb-4">Exchanges</h2>
          <Weights keys={Object.keys(EXCHANGE_WEIGHTS) as ExchangeKey[]} weights={EXCHANGE_WEIGHTS} labels={EXCHANGE_LABELS} what={EXCHANGE_WHAT} max={30} />
        </Card>

        <Card className="p-4" as="section">
          <h2 className="text-[15px] font-bold mb-4">Memecoins</h2>
          <Weights keys={Object.keys(MEME_WEIGHTS) as MemeKey[]} weights={MEME_WEIGHTS} labels={MEME_LABELS} what={MEME_WHAT} max={45} />
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Reviews count only after a person checks them" />
          <p className="text-[12.5px] text-ink-2 leading-[1.85] mb-3">
            Reviews are the most attacked surface a ranking site has: the company wants
            good ones, its competitors want bad ones, and from the server&rsquo;s side both
            look exactly like a real customer. So publishing and counting are separate
            acts. A review is live the moment it is written, marked unverified, and
            reaches a score only once an editor has checked the evidence behind it —
            which means buying a hundred five-star reviews buys a hundred unverified
            paragraphs and moves nothing.
          </p>
          <p className="text-[12.5px] text-ink-2 leading-[1.85] mb-3">
            Below {MIN_FOR_SCORE} checked reviews the component is excluded rather than
            scored low, like every other component here. Both averages are shown — the
            checked one the score uses, and the one covering everything anyone wrote —
            because showing only the first hides what people are saying and showing only
            the second hands the score to whoever writes most.
          </p>
          <p className="text-[12.5px] text-ink-2 leading-[1.85]">
            Reviews move the broker ranking and no other. The prop firm and exchange
            models were published without a reviews component, and adding one means
            changing weights that are already public — a decision to make openly, not a
            side effect of shipping a feature. Until then their reviews are read and not
            counted, and every one of those pages says so.
          </p>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Incident reports are not part of any score" />
          <p className="text-[12.5px] text-ink-2 leading-[1.85] mb-3">
            The broker status signal on each page is unverified by design — that is what
            makes it fast enough to be useful during an outage. It is counted by distinct
            reporters over a rolling window, with the count and the threshold published
            so you can weigh it yourself.
          </p>
          <p className="text-[12.5px] text-ink-2 leading-[1.85]">
            It never enters a score. Scores move only on facts a person checked against
            a primary source and recorded with that source. Mixing an unverified crowd
            signal into a number we ask readers to trust would quietly destroy the
            distinction the rest of this page is built on.
          </p>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Where the data comes from" />
          <p className="text-[12.5px] text-ink-2 leading-[1.85] mb-3">
            Every upstream is free and unauthenticated: CoinGecko for coin prices,
            GeckoTerminal for new pools, GoPlus for contract audits. Nothing here depends
            on a paid plan, which is a deliberate constraint — it keeps the cost of
            running this site near zero and means no ranking can quietly become a
            function of what we could afford to license.
          </p>
          <p className="text-[12.5px] text-ink-2 leading-[1.85]">
            Free tiers go quiet. When one does, the affected page says so plainly rather
            than serving figures we could not confirm, and every live page carries the
            timestamp of the fetch behind it.
          </p>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Which registers we can actually read" />
          <p className="text-[12.5px] text-ink-2 leading-[1.85] mb-3">
            Every regulator publishes a register precisely so anyone can check a firm
            before dealing with it. Not every one of them can be read by a machine in a
            datacentre: some need a registered key, some render their search in the
            browser, some refuse our address outright. {coverage.licencesChecked} of the{' '}
            {coverage.licencesTotal} licences on this site are compared against the issuing
            regulator’s own register once a day. The rest are not, and every page that
            carries one says so rather than letting it pass as checked.
          </p>
          <ul className="flex flex-col">
            {coverage.rows.map((r) => (
              <li key={r.code} className="py-[9px] border-b border-line-2 last:border-b-0 flex items-start gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold">
                    {r.code}
                    <span className="text-ink-3 font-normal"> · {r.licences} licence{r.licences === 1 ? '' : 's'}</span>
                  </span>
                  <span className="block text-[11.5px] text-ink-3 leading-[1.6] mt-[2px]">
                    {r.blocked ? r.blocked : `${r.name} — read once a day`}
                  </span>
                </span>
                <Tag tone={r.blocked ? 'neutral' : 'good'}>{r.blocked ? 'not machine-checked' : 'checked'}</Tag>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="How the economic calendar is graded" />
          <p className="text-[12.5px] text-ink-2 leading-[1.85] mb-3">
            Dates come from the institution that sets them — the BLS release schedule, the
            Fed’s FOMC calendar, the ECB’s Governing Council calendar. Nothing is copied
            from another calendar site and nothing is inferred from a pattern. A release
            time is shown only where the source states one: the BLS publishes exact times
            and the zone they are in, the Fed and the ECB publish dates without them, and
            a guessed time on a rate decision would be the most quietly harmful number on
            the site.
          </p>
          <dl className="mb-3">
            {(['high', 'medium', 'low'] as const).map((level) => (
              <div key={level} className="py-[7px] border-b border-line-2 last:border-b-0">
                <dt className="text-[12.5px] font-bold">{IMPACT_LABEL[level]} impact</dt>
                <dd className="text-[11.5px] text-ink-3 mt-[3px] leading-[1.7] capitalize">
                  {IMPACT_RULE[level].join(' · ')}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-[12.5px] text-ink-2 leading-[1.85]">
            The institutions do not rank their own releases, so that grading is ours. It is
            a list of names rather than a model, deliberately: a list can be argued with,
            and if you think a release is in the wrong band you can see exactly what to
            argue about.
          </p>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Why there is no live spread feed" />
          <p className="text-[12.5px] text-ink-2 leading-[1.85]">
            Publishing live spreads honestly means running a terminal on every broker,
            around the clock, and being accountable when it silently stops. We do not run
            that, so we do not claim it. Instead each broker’s <em>published</em> cost is
            shown with the date a human last checked it against the broker’s own pages,
            and anything unverified is labelled as such on the page. A figure you can
            trace beats a figure that merely looks live.
          </p>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Missing data is excluded, not scored zero" />
          <p className="text-[12.5px] text-ink-2 leading-[1.85]">
            A broker with no verified reviews yet is not the same thing as a broker with
            terrible reviews. When a component has no data, it is dropped and the
            remaining weights are renormalised so they still sum to one. Every broker
            page lists which components were excluded, so a score is always readable
            against what actually went into it.
          </p>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Regulator tiers" />
          {tiers.map(({ tier, regs }) => (
            <div key={tier} className="py-3 border-b border-line-2 last:border-b-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-[22px] h-5 grid place-items-center rounded-[5px] text-[10.5px] font-extrabold ${
                  tier === 'A' ? 'bg-up-bg text-up' : tier === 'B' ? 'bg-warn-bg text-warn' : 'bg-card-3 text-ink-2'}`}>
                  {tier}
                </span>
                <span className="text-[12.5px] font-semibold">
                  {tier === 'A' ? 'Compensation scheme and public register'
                    : tier === 'B' ? 'Real supervision, weak or no compensation'
                    : 'Registration only — no practical recourse'}
                </span>
              </div>
              <div className="flex flex-wrap gap-[5px]">
                {regs.map((r) => <Tag key={r.code}>{r.code}</Tag>)}
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-4 border-[1.5px] border-brass shadow-none" as="section">
          <h2 className="text-[14px] font-bold text-brass-2 mb-2">Money, and what it does not buy</h2>
          <p className="text-[12.5px] text-ink-2 leading-[1.85]">
            We earn commission from some brokers when a reader opens an account. That is
            disclosed on every link that carries it. Commission is not an input to any
            component above, and no broker has ever been moved, added to, or removed from
            a list because of a commercial relationship. If that ever changes, this page
            changes first.
          </p>
        </Card>
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail)]} />
    </>
  );
}
