import type { Metadata } from 'next';
import { EXCHANGE_WEIGHTS, EXCHANGE_LABELS, volumeBand, type ExchangeKey } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, itemListLd, faqLd } from '@/lib/seo';
import { rankedExchanges } from '@/lib/repo';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, CardHead, Meter } from '@/components/primitives';
import { RankingIntro, RankRow, SeedNotice } from '@/components/ranking';

const TITLE = 'Crypto exchange rankings';
const DESC =
  'Exchanges ranked on what evidence exists that customer funds are there, the ' +
  'security record behind them, the fee you are actually charged and real liquidity.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/exchanges' });
export const revalidate = 3600;

const FAQ = [
  {
    q: 'Is a proof of reserves enough to trust an exchange?',
    a: 'No. A self-published proof of reserves is a snapshot the exchange chooses to publish, it is unaudited, and on its own it says nothing about liabilities. It is real evidence but the weakest kind — which is why an audited or publicly listed exchange scores higher on solvency than one with only a reserve snapshot.',
  },
  {
    q: 'How do you treat an exchange that has been hacked?',
    a: 'Separately from one that was hacked and left users short. Time since the incident is the base, and covering every loss earns back a meaningful part of the score. An exchange that made users whole is not in the same category as one that did not.',
  },
  {
    q: 'Why is reported volume only used as a band?',
    a: 'Spot volume is self-reported and has been inflated across the industry for years. We use it on a logarithmic scale to place an exchange in a liquidity band, never as a precise figure, and it carries only 15% of the score.',
  },
];

export default function ExchangesPage() {
  const list = rankedExchanges();
  const trail = [{ name: 'Home', path: '/' }, { name: 'Exchanges', path: '/exchanges' }];

  return (
    <>
      <Header active="/exchanges" />
      <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
        <Breadcrumbs trail={trail} />
        <RankingIntro title={TITLE} lead={DESC} count={list.length} unit="exchanges" />
        <SeedNotice what="Volumes here are self-reported by exchanges and used only as a liquidity band." />

        <Card className="px-4">
          {list.map((r) => (
            <RankRow
              headingLevel={2}
              key={r.exchange.slug}
              rank={r.rank}
              href={`/exchanges/${r.exchange.slug}`}
              logo={r.exchange.logo}
              name={r.exchange.name}
              score={r.score.total}
              why={r.exchange.why}
              facts={[
                { label: 'Taker', value: `${r.exchange.takerFeePct}%` },
                { label: 'Volume', value: volumeBand(r.exchange.spotVolumeUsd) },
                {
                  label: 'Breach',
                  value: r.exchange.security.lastBreachYear === null ? 'None' : String(r.exchange.security.lastBreachYear),
                  tone: r.exchange.security.lastBreachYear === null ? 'good' : r.exchange.security.madeUsersWhole ? 'warn' : 'bad',
                },
              ]}
            />
          ))}
        </Card>

        <Card className="p-4">
          <CardHead title="How the score is built" href="/methodology" hrefLabel="Full method" />
          <ul className="flex flex-col gap-[10px]">
            {(Object.keys(EXCHANGE_WEIGHTS) as ExchangeKey[]).map((k) => (
              <li key={k}>
                <div className="flex items-baseline gap-2 mb-[6px]">
                  <span className="text-[12.5px]">{EXCHANGE_LABELS[k]}</span>
                  <div className="flex-1" />
                  <span className="text-[11.5px] text-ink-3 font-bold tnum">{Math.round(EXCHANGE_WEIGHTS[k] * 100)}%</span>
                </div>
                <Meter value={EXCHANGE_WEIGHTS[k] * 100} max={30} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Common questions" />
          <dl>
            {FAQ.map(({ q, a }) => (
              <div key={q} className="py-3 border-b border-line-2 last:border-b-0">
                <dt className="text-[13.5px] font-semibold mb-[5px]">{q}</dt>
                <dd className="text-[12.5px] text-ink-2 leading-[1.8]">{a}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </main>
      <Footer />
      <JsonLd graph={[
        breadcrumbLd(trail),
        itemListLd(TITLE, list.map((r) => ({ name: r.exchange.name, path: `/exchanges/${r.exchange.slug}` }))),
        faqLd(FAQ),
      ]} />
    </>
  );
}
