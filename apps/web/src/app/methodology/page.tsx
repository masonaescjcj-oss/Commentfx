import type { Metadata } from 'next';
import {
  WEIGHTS, LABELS, REGULATORS, type ScoreKey,
  PROP_WEIGHTS, PROP_LABELS, type PropKey,
  EXCHANGE_WEIGHTS, EXCHANGE_LABELS, type ExchangeKey,
} from '@commentfx/core';
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
  const trail = [{ name: 'Home', path: '/' }, { name: 'How we score', path: '/methodology' }];
  const tiers = (['A', 'B', 'C'] as const).map((t) => ({
    tier: t,
    regs: Object.values(REGULATORS).filter((r) => r.tier === t),
  }));

  return (
    <>
      <Header />
      <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
        <Breadcrumbs trail={trail} />
        <header className="px-1">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.22] tracking-[-0.02em] text-balance">
            {TITLE}
          </h1>
          <p className="text-[13.5px] text-ink-2 leading-[1.75] mt-2 max-w-[50ch]">{DESC}</p>
        </header>

        <Card className="p-4" as="section">
          <h2 className="text-[15px] font-bold mb-1">Brokers</h2>
          <p className="text-[11.5px] text-ink-3 mb-4">Six components. Live spreads are deliberately not among them — see below.</p>
          <Weights keys={Object.keys(WEIGHTS) as ScoreKey[]} weights={WEIGHTS} labels={LABELS} what={WHAT} max={30} />
        </Card>

        <Card className="p-4" as="section">
          <h2 className="text-[15px] font-bold mb-1">Prop firms</h2>
          <p className="text-[11.5px] text-ink-3 mb-4">Five components, weighted toward the rules that decide whether you can pass at all.</p>
          <Weights keys={Object.keys(PROP_WEIGHTS) as PropKey[]} weights={PROP_WEIGHTS} labels={PROP_LABELS} what={PROP_WHAT} max={30} />
        </Card>

        <Card className="p-4" as="section">
          <h2 className="text-[15px] font-bold mb-1">Exchanges</h2>
          <p className="text-[11.5px] text-ink-3 mb-4">Five components, weighted toward evidence that customer funds exist.</p>
          <Weights keys={Object.keys(EXCHANGE_WEIGHTS) as ExchangeKey[]} weights={EXCHANGE_WEIGHTS} labels={EXCHANGE_LABELS} what={EXCHANGE_WHAT} max={30} />
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
