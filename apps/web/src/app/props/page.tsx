import type { Metadata } from 'next';
import { PROP_WEIGHTS, PROP_LABELS, describeDrawdown, type PropKey } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, itemListLd, faqLd } from '@/lib/seo';
import { rankedProps } from '@/lib/repo';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, CardHead, Meter } from '@/components/primitives';
import { RankingIntro, RankRow } from '@/components/ranking';
import { TopTiles, Tabset, StrengthList, CompareTable } from '@/components/rankings';
import Link from 'next/link';

const TITLE = 'Prop firm rankings';
const DESC =
  'Funded-trader challenges ranked on the rules you actually have to survive, ' +
  'what the payout terms really are, and what the challenge costs per $100k.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/props' });
export const revalidate = 3600;

const FAQ = [
  {
    q: 'What matters most when choosing a prop firm?',
    a: 'How drawdown is measured. Static is fixed against your starting balance; trailing follows equity upward, so an unrealised spike permanently raises the floor. It carries the heaviest weight in rule fairness.',
  },
  {
    q: 'What is a consistency rule?',
    a: 'A cap on how much of your total profit one day may contribute, often 25 to 40 percent — so a single good day can disqualify a passing account. Firms that impose one score lower.',
  },
  {
    q: 'Why compare challenge fees per $100k?',
    a: 'Firms price many account sizes, so a headline fee tells you nothing on its own. Normalising to a $100k account is the only way to compare them directly.',
  },
];

/** Transparency is in the score but is three booleans — a thin list of its own. */
const TAB_KEYS = ['rules', 'payout', 'cost', 'platform'] as const;
const SHORT: Record<(typeof TAB_KEYS)[number], string> = {
  rules: 'Rule fairness',
  payout: 'Payout terms',
  cost: 'Challenge cost',
  platform: 'Platforms',
};

export default function PropsPage() {
  const list = rankedProps();
  const byFee = [...list].sort((a, b) => a.firm.feeUsdPer100k - b.firm.feeUsdPer100k);
  const trail = [{ name: 'Home', path: '/' }, { name: 'Prop Firms', path: '/props' }];

  return (
    <>
      <Header active="/props" />
      <main id="main" className="shell pt-0 pb-6 sm:pt-3 lg:pb-10 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
        <Breadcrumbs trail={trail} />
        <RankingIntro title={TITLE} />

        {/* Two columns above 1024px. The ranking is the page, so it takes the
            width; how the score is built and what people ask about it are the
            material beside it. Source order is unchanged, so a phone reads the
            list first and then the rest, exactly as before. */}
        <div className="split">
          <div>

          <Card className="p-4" as="section">
            <CardHead title="The top eight" href="#all" hrefLabel="Every firm" />
            <TopTiles base="/props" items={list.slice(0, 8).map((r) => ({ ...r.firm, score: r.score.total }))} />
          </Card>

          <Card className="p-4" as="section">
            <CardHead title="Strongest on each thing" href="/methodology" hrefLabel="How each is scored" />
            <Tabset
              id="prop-strength"
              label="Rank prop firms by"
              tabs={TAB_KEYS.map((key) => ({
                label: SHORT[key],
                panel: (
                  <StrengthList
                    base="/props"
                    rows={list
                      .map((r) => ({ r, c: r.score.components.find((x) => x.key === key) }))
                      .filter((x): x is { r: typeof list[number]; c: NonNullable<typeof x.c> } => Boolean(x.c?.value !== null && x.c))
                      .sort((a, b) => (b.c.value ?? 0) - (a.c.value ?? 0))
                      .slice(0, 6)
                      .map(({ r, c }) => ({
                        slug: r.firm.slug,
                        name: r.firm.name,
                        logo: r.firm.logo,
                        value: c.value ?? 0,
                        note: c.note ?? c.label,
                      }))}
                  />
                ),
              }))}
            />
          </Card>

          <Card className="px-4" id="all">
            {list.map((r) => (
              <RankRow
                headingLevel={2}
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

          <Card className="p-4" as="section">
            <CardHead title="What the challenge costs, and what you keep" href="/props" hrefLabel="Full ranking" />
            <CompareTable
              head={['Firm', 'Fee / $100k', 'Split']}
              rows={byFee.map((r) => ({
                slug: r.firm.slug,
                cells: [
                  <span key="n" className="block">
                    <Link href={`/props/${r.firm.slug}`} className="hover:text-brass">{r.firm.name}</Link>
                    <span className="block text-[10.5px] font-normal text-ink-3">
                      {describeDrawdown(r.firm.rules.drawdownType)} drawdown
                    </span>
                  </span>,
                  `$${r.firm.feeUsdPer100k}`,
                  `${r.firm.payout.splitPct}%`,
                ],
              }))}
              note="Fees normalised to a $100k account. Split is the trader’s share."
            />
          </Card>
          </div>

          <div>
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
          </div>
        </div>
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
