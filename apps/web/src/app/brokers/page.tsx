import Link from 'next/link';
import type { Metadata } from 'next';
import { WEIGHTS, LABELS, type ScoreKey } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, itemListLd, faqLd } from '@/lib/seo';
import { rankedBrokers } from '@/lib/repo';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { reviewStats } from '@/lib/reviews';
import { Card, CardHead, Meter } from '@/components/primitives';
import { BrokerRow } from '@/components/BrokerRow';

const TITLE = 'Forex broker rankings';
const DESC =
  'Every broker with an active licence, ranked on regulation, published trading cost, ' +
  'payments and platforms. Weights are published and the rank is not for sale.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/brokers' });
export const revalidate = 3600;

const FAQ = [
  {
    q: 'How is the broker score calculated?',
    a: 'Six weighted components: regulation and licensing (30%), published trading cost (20%), payments and withdrawals (20%), platforms and execution (15%), verified reviews (10%) and corporate transparency (5%). A component with no data yet is excluded and its weight redistributed, never scored as zero.',
  },
  {
    q: 'Can a broker pay to rank higher?',
    a: 'No. We earn commission from some brokers when a reader opens an account, and that is disclosed on every link. Commission has no input into the score or the order of any list.',
  },
  {
    q: 'Why does a broker show a different licence depending on my country?',
    a: 'Most brokers operate several legal companies. A client in the UK may be onboarded to an FCA-regulated entity while a client elsewhere is onboarded to an offshore one with no compensation scheme. Each broker page shows which entity applies to you.',
  },
];

export default async function BrokersPage() {
  const stats = await reviewStats();
  const list = rankedBrokers(stats);
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
          <p className="text-[13.5px] text-ink-2 leading-[1.75] mt-2 max-w-[48ch]">{DESC}</p>
          <p className="text-[11.5px] text-ink-3 mt-3">
            <b className="text-ink tnum text-[13px]">{list.length}</b> brokers · updated daily
          </p>
        </header>

        <Card className="px-4">
          {list.map((r) => <BrokerRow headingLevel={2} key={r.broker.slug} r={r} />)}
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
          <p className="mt-[13px] p-3 rounded-xl bg-brass-bg text-[11.5px] text-brass-2 leading-[1.7]">
            No broker can buy its rank. The “open account” links are affiliate links — the order of this list is not.
          </p>
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
