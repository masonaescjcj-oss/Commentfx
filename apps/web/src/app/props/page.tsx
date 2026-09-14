import type { Metadata } from 'next';
import { PROP_WEIGHTS, PROP_LABELS, describeDrawdown, type PropKey } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, itemListLd, faqLd } from '@/lib/seo';
import { rankedProps } from '@/lib/repo';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, CardHead, Meter } from '@/components/primitives';
import { RankingIntro, RankRow, SeedNotice } from '@/components/ranking';

const TITLE = 'Prop firm rankings';
const DESC =
  'Funded-trader challenges ranked on the rules you actually have to survive, ' +
  'what the payout terms really are, and what the challenge costs per $100k.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/props' });
export const revalidate = 3600;

const FAQ = [
  {
    q: 'What matters most when choosing a prop firm?',
    a: 'How drawdown is measured. Static drawdown is fixed against your starting balance. Trailing drawdown follows your equity upward, so an unrealised spike permanently raises the floor you must stay above — which is why the same trader can pass one firm and fail another on identical trades. It carries the heaviest weight in our rule-fairness score.',
  },
  {
    q: 'What is a consistency rule?',
    a: 'A cap on how much of your total profit any single day may contribute, often 25 to 40 percent. One good day can therefore disqualify an otherwise passing account. Firms that impose one score lower on rule fairness.',
  },
  {
    q: 'Why compare challenge fees per $100k?',
    a: 'Firms price many account sizes, so a headline fee tells you nothing on its own. Normalising to a $100k account is the only way to compare them directly.',
  },
];

export default function PropsPage() {
  const list = rankedProps();
  const trail = [{ name: 'Home', path: '/' }, { name: 'Prop Firms', path: '/props' }];

  return (
    <>
      <Header active="/props" />
      <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
        <Breadcrumbs trail={trail} />
        <RankingIntro title={TITLE} lead={DESC} count={list.length} unit="firms" />
        <SeedNotice what="Prop firms change their rules often and rarely announce it." />

        <Card className="px-4">
          {list.map((r) => (
            <RankRow
              key={r.firm.slug}
              rank={r.rank}
              href={`/props/${r.firm.slug}`}
              logo={r.firm.logo}
              name={r.firm.name}
              score={r.score.total}
              why={r.firm.why}
              facts={[
                {
                  label: 'Drawdown',
                  value: describeDrawdown(r.firm.rules.drawdownType),
                  tone: r.firm.rules.drawdownType === 'static' ? 'good' : r.firm.rules.drawdownType === 'intraday-trailing' ? 'bad' : 'warn',
                },
                { label: 'Fee', value: `$${r.firm.feeUsdPer100k}` },
                { label: 'Split', value: `${r.firm.payout.splitPct}%` },
              ]}
            />
          ))}
        </Card>

        <Card className="p-4">
          <CardHead title="How the score is built" href="/methodology" hrefLabel="Full method" />
          <ul className="flex flex-col gap-[10px]">
            {(Object.keys(PROP_WEIGHTS) as PropKey[]).map((k) => (
              <li key={k}>
                <div className="flex items-baseline gap-2 mb-[6px]">
                  <span className="text-[12.5px]">{PROP_LABELS[k]}</span>
                  <div className="flex-1" />
                  <span className="text-[11.5px] text-ink-3 font-bold tnum">{Math.round(PROP_WEIGHTS[k] * 100)}%</span>
                </div>
                <Meter value={PROP_WEIGHTS[k] * 100} max={30} />
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
        itemListLd(TITLE, list.map((r) => ({ name: r.firm.name, path: `/props/${r.firm.slug}` }))),
        faqLd(FAQ),
      ]} />
    </>
  );
}
