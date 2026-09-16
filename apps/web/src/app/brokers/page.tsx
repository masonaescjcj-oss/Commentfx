import Link from 'next/link';
import type { Metadata } from 'next';
import { WEIGHTS, LABELS, type ScoreKey } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, itemListLd, faqLd } from '@/lib/seo';
import { rankedBrokers } from '@/lib/repo';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { reviewStats } from '@/lib/reviews';
import { Card, CardHead, Meter } from '@/components/primitives';
import { BrokerRow } from '@/components/BrokerRow';
import { TopTiles, Tabset, StrengthList, CompareTable } from '@/components/rankings';

const TITLE = 'Forex broker rankings';
const DESC =
  'Every broker with an active licence, ranked on regulation, published trading cost, ' +
  'payments and platforms. Weights are published and the rank is not for sale.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/brokers' });
export const revalidate = 3600;

const FAQ = [
  {
    q: 'How is the broker score calculated?',
    a: 'Regulation 30%, trading cost 20%, payments 20%, platforms 15%, verified reviews 10%, transparency 5%. A component with no data is excluded, never scored zero.',
  },
  {
    q: 'Can a broker pay to rank higher?',
    a: 'No. Commission is disclosed on every link and has no input into the score or the order of any list.',
  },
  {
    q: 'Why does a broker show a different licence depending on my country?',
    a: 'Most brokers run several legal companies, and the one you are onboarded to decides whether a compensation scheme covers you. Each broker page shows which entity applies where.',
  },
];

/** The components worth their own ranking. Reviews and transparency are in the
 *  score but make a thin list: one is zero everywhere until editors check
 *  reviews, the other is three booleans. */
const TAB_KEYS = ['regulation', 'cost', 'payments', 'platform'] as const;
const SHORT: Record<(typeof TAB_KEYS)[number], string> = {
  regulation: 'Regulation',
  cost: 'Cost',
  payments: 'Withdrawals',
  platform: 'Platforms',
};

export default async function BrokersPage() {
  const stats = await reviewStats();
  const list = rankedBrokers(stats);
  // A commission is part of the price. $10 per pip on a standard lot is the
  // conversion that makes "0.0 + $7" and "1.2 + nothing" the same number.
  const byCost = [...list].sort((a, b) =>
    (a.broker.cost.eurusdSpread + a.broker.cost.commissionPerLot / 10)
    - (b.broker.cost.eurusdSpread + b.broker.cost.commissionPerLot / 10));
  const trail = [{ name: 'Home', path: '/' }, { name: 'Brokers', path: '/brokers' }];

  return (
    <>
      <Header active="/brokers" />
      <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
        <Breadcrumbs trail={trail} />
        <header className="px-1">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.22] tracking-[-0.02em] text-balance">
            {TITLE}
          </h1>
        </header>

        <Card className="p-4" as="section">
          <CardHead title="The top eight" href="#all" hrefLabel="Every broker" />
          <TopTiles base="/brokers" items={list.slice(0, 8).map((r) => ({ ...r.broker }))} />
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Strongest on each thing" href="/methodology" hrefLabel="How each is scored" />
          <Tabset
            id="strength"
            label="Rank brokers by"
            tabs={TAB_KEYS.map((key) => ({
              label: SHORT[key],
              panel: (
                <StrengthList
                  base="/brokers"
                  rows={list
                    .map((r) => ({ r, c: r.score.components.find((x) => x.key === key) }))
                    .filter((x): x is { r: typeof list[number]; c: NonNullable<typeof x.c> } => Boolean(x.c?.value !== null && x.c))
                    .sort((a, b) => (b.c.value ?? 0) - (a.c.value ?? 0))
                    .slice(0, 6)
                    .map(({ r, c }) => ({
                      slug: r.broker.slug,
                      name: r.broker.name,
                      logo: r.broker.logo,
                      value: c.value ?? 0,
                      note: c.note ?? c.label,
                    }))}
                />
              ),
            }))}
          />
        </Card>

        <Card className="px-4" id="all">
          {list.map((r) => <BrokerRow headingLevel={2} key={r.broker.slug} r={r} />)}
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="What a round turn costs" href="/best/lowest-spread" hrefLabel="Cheapest first" />
          <CompareTable
            head={['Broker', 'EUR/USD', 'Commission']}
            rows={byCost.map((r) => ({
              slug: r.broker.slug,
              cells: [
                <span key="n" className="block">
                  <Link href={`/brokers/${r.broker.slug}`} className="hover:text-brass">{r.broker.name}</Link>
                  <span className="block text-[10.5px] font-normal text-ink-3 uppercase tracking-[0.05em]">
                    {r.broker.platforms.execution}
                  </span>
                </span>,
                `${r.broker.cost.eurusdSpread.toFixed(2)} pips`,
                r.broker.cost.commissionPerLot === 0
                  ? 'none'
                  : `$${r.broker.cost.commissionPerLot.toFixed(0)} / lot`,
              ],
            }))}
            note="Spreads as each broker publishes them. Ordered by spread plus commission."
          />
        </Card>


        <Card className="p-4">
          <CardHead title="How the score is built" href="/methodology" hrefLabel="Full method" />
          <ul className="flex flex-col gap-[10px]">
            {(Object.keys(WEIGHTS) as ScoreKey[]).map((k) => (
              <li key={k}>
                <div className="flex items-baseline gap-2 mb-[6px]">
                  <span className="text-[12.5px]">{LABELS[k]}</span>
                  <div className="flex-1" />
                  <span className="text-[11.5px] text-ink-3 font-bold tnum">{Math.round(WEIGHTS[k] * 100)}%</span>
                </div>
                <Meter value={WEIGHTS[k] * 100} max={30} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Common questions" />
          <dl className="flex flex-col">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="py-3 border-b border-line-2 last:border-b-0">
                <dt className="text-[13.5px] font-semibold mb-[5px]">{q}</dt>
                <dd className="text-[12.5px] text-ink-2 leading-[1.8]">{a}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <p className="text-[11.5px] text-ink-3 px-1 leading-[1.7]">
          Looking for something specific?{' '}
          <Link href="/best/lowest-spread" className="text-brass">lowest cost</Link>,{' '}
          <Link href="/best/tier-1-regulated" className="text-brass">tier-1 regulated</Link>,{' '}
          <Link href="/best/low-minimum-deposit" className="text-brass">low minimum deposit</Link>.
        </p>
      </main>
      <Footer />
      <JsonLd graph={[
        breadcrumbLd(trail),
        itemListLd(TITLE, list.map((r) => ({ name: r.broker.name, path: `/brokers/${r.broker.slug}` }))),
        faqLd(FAQ),
      ]} />
    </>
  );
}
