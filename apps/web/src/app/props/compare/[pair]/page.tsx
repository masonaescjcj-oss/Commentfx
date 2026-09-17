import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { describeDrawdown, countryInProse, propProfileFor, propCompareIndexable } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd } from '@/lib/seo';
import { propComparePairs, pairSlug, canonicalPairSlug, parsePair, getRankedProp, type RankedProp } from '@/lib/repo';
import { livePatchMap } from '@/lib/records';
import { Header, PageHero, Footer } from '@/components/chrome';
import { Card, Logo, Score } from '@/components/primitives';

type Params = { pair: string };

export function generateStaticParams(): Params[] {
  return propComparePairs().map(([a, b]) => ({ pair: pairSlug(a, b) }));
}

export const revalidate = 3600;
/**
 * Dynamic params stay on, for the reason written up on the broker comparison
 * page: refusing them turns a revalidatePath() from a server action into a
 * permanent 404 on a page that can no longer be regenerated.
 */

/**
 * Prop firms compare on different things from brokers, and the difference is
 * the point of the page.
 *
 * A broker comparison is mostly about price. A prop comparison is about which
 * set of rules you can actually survive, so drawdown type leads — it is the
 * single rule that decides more passes than any other — and the split is given
 * as what a newly funded trader is paid rather than the number either firm
 * advertises.
 *
 * `win` is 0 where there is no better answer. More markets is not better if you
 * trade one of them, and a firm with no consistency rule is not automatically
 * the right choice, so those rows are left unmarked rather than given a winner
 * the data does not support.
 */
const DD_RANK = { static: 3, 'eod-trailing': 2, 'intraday-trailing': 1 } as const;

function rows(a: RankedProp, b: RankedProp) {
  const af = a.firm, bf = b.firm;
  const lower = (x: number, y: number) => (x === y ? 0 : x < y ? 1 : 2);
  const higher = (x: number, y: number) => (x === y ? 0 : x > y ? 1 : 2);
  const steps = (f: RankedProp['firm']) => (f.rules.steps === 'instant' ? 'Instant' : `${f.rules.steps}-step`);

  return [
    { label: 'Overall score', a: a.score.total.toFixed(1), b: b.score.total.toFixed(1), win: higher(a.score.total, b.score.total) },
    { label: 'Rank', a: `#${a.rank}`, b: `#${b.rank}`, win: lower(a.rank, b.rank) },
    {
      label: 'Drawdown',
      a: describeDrawdown(af.rules.drawdownType),
      b: describeDrawdown(bf.rules.drawdownType),
      win: higher(DD_RANK[af.rules.drawdownType], DD_RANK[bf.rules.drawdownType]),
    },
    { label: 'Max drawdown', a: `${af.rules.maxDrawdownPct}%`, b: `${bf.rules.maxDrawdownPct}%`, win: higher(af.rules.maxDrawdownPct, bf.rules.maxDrawdownPct) },
    { label: 'Daily drawdown', a: `${af.rules.dailyDrawdownPct}%`, b: `${bf.rules.dailyDrawdownPct}%`, win: higher(af.rules.dailyDrawdownPct, bf.rules.dailyDrawdownPct) },
    { label: 'Profit target', a: `${af.rules.profitTargetPct}%`, b: `${bf.rules.profitTargetPct}%`, win: lower(af.rules.profitTargetPct, bf.rules.profitTargetPct) },
    { label: 'Steps', a: steps(af), b: steps(bf), win: 0 },
    { label: 'Minimum days', a: af.rules.minTradingDays === 0 ? 'None' : String(af.rules.minTradingDays), b: bf.rules.minTradingDays === 0 ? 'None' : String(bf.rules.minTradingDays), win: lower(af.rules.minTradingDays, bf.rules.minTradingDays) },
    { label: 'Consistency rule', a: af.rules.consistencyRule ? 'Yes' : 'No', b: bf.rules.consistencyRule ? 'Yes' : 'No', win: 0 },
    { label: 'Split at funding', a: `${af.payout.splitPct}%`, b: `${bf.payout.splitPct}%`, win: higher(af.payout.splitPct, bf.payout.splitPct) },
    { label: 'Payout every', a: `${af.payout.frequencyDays} days`, b: `${bf.payout.frequencyDays} days`, win: lower(af.payout.frequencyDays, bf.payout.frequencyDays) },
    { label: 'Fee per $100k', a: `$${af.feeUsdPer100k}`, b: `$${bf.feeUsdPer100k}`, win: lower(af.feeUsdPer100k, bf.feeUsdPer100k) },
    { label: 'Companies named', a: String(af.entities.length), b: String(bf.entities.length), win: 0 },
    { label: 'Platforms', a: String(af.platforms.length), b: String(bf.platforms.length), win: higher(af.platforms.length, bf.platforms.length) },
  ];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const patches = await livePatchMap();
  const [a, b] = [getRankedProp(parsed[0], patches), getRankedProp(parsed[1], patches)];
  if (!a || !b) return {};
  return pageMetadata({
    title: `${a.firm.name} vs ${b.firm.name} — which prop firm is better?`,
    description:
      `${a.firm.name} scores ${a.score.total.toFixed(1)}, ${b.firm.name} scores ${b.score.total.toFixed(1)}. `
      + 'Side by side on drawdown, profit target, split, cost and the companies behind each one.',
    path: `/props/compare/${pair}`,
    canonicalPath: `/props/compare/${canonicalPairSlug(parsed[0], parsed[1])}`,
    noindex: !propCompareIndexable(a.firm, b.firm).indexable,
  });
}

export default async function PropComparePage({ params }: { params: Promise<Params> }) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const patches = await livePatchMap();
  const a = getRankedProp(parsed[0], patches);
  const b = getRankedProp(parsed[1], patches);
  if (!a || !b) notFound();

  const table = rows(a, b);
  const winner = a.score.total >= b.score.total ? a : b;
  const other = winner === a ? b : a;
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Prop Firms', path: '/props' },
    { name: `${a.firm.name} vs ${b.firm.name}`, path: `/props/compare/${pair}` },
  ];

  // Where one side's rules were never read at the firm's own pages, the table
  // above is comparing a checked record with an unchecked one, and the reader
  // is entitled to know which is which before they weigh a row.
  const unread = [a, b].filter((x) => propProfileFor(x.firm.slug)?.originReadable === false);

  return (
    <>
      <Header active="/props" />
      <main id="main" className="pb-6 lg:pb-10">
        <PageHero trail={trail} />
        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
          <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold leading-[1.25] tracking-[-0.02em] gutter text-balance">
            {a.firm.name} vs {b.firm.name}
          </h1>

          <div className="flex items-start gap-[10px] gutter">
            {[a, b].map((x, i) => (
              <div key={x.firm.slug} className="flex-1 text-center">
                <Logo {...x.firm.logo} size={48} />
                <p className="text-[13.5px] font-bold mt-2">{x.firm.name}</p>
                <p className="text-[11.5px] text-ink-3">#{x.rank} overall</p>
                {i === 0 && <span className="sr-only">compared with</span>}
              </div>
            ))}
          </div>

          <Card className="px-4 lg:px-6 py-2">
            <table className="w-full">
              <caption className="sr-only">{a.firm.name} compared with {b.firm.name}</caption>
              <thead className="sr-only">
                <tr><th scope="col">Attribute</th><th scope="col">{a.firm.name}</th><th scope="col">{b.firm.name}</th></tr>
              </thead>
              <tbody>
                {table.map((row) => (
                  <tr key={row.label} className="border-b border-line-2 last:border-b-0">
                    <td className={`py-[11px] text-[13px] tnum text-center w-[36%] ${row.win === 1 ? 'font-extrabold text-accent' : 'text-ink-2'}`}>{row.a}</td>
                    <th scope="row" className="py-[11px] text-[11px] text-ink-3 font-normal text-center">{row.label}</th>
                    <td className={`py-[11px] text-[13px] tnum text-center w-[36%] ${row.win === 2 ? 'font-extrabold text-accent' : 'text-ink-2'}`}>{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="p-4 lg:p-6 border-[1.5px] border-accent shadow-none">
            <h2 className="text-[14px] font-bold text-accent-2 mb-[6px]">The short version</h2>
            <p className="text-[12.5px] text-ink-2 leading-[1.8]">
              {winner.firm.name} takes it overall on {winner.score.total.toFixed(1)} against{' '}
              {other.score.total.toFixed(1)} — {winner.firm.why.charAt(0).toLowerCase() + winner.firm.why.slice(1)}.
              {' '}{other.firm.name} is the better pick if what you need is{' '}
              {DD_RANK[other.firm.rules.drawdownType] > DD_RANK[winner.firm.rules.drawdownType]
                ? 'the gentler way of measuring drawdown'
                : other.firm.feeUsdPer100k < winner.firm.feeUsdPer100k
                  ? 'the cheaper challenge'
                  : other.firm.payout.splitPct > winner.firm.payout.splitPct
                    ? 'the higher split from day one'
                    : 'a different market or platform'}.
            </p>
            {unread.length > 0 && (
              <p className="text-[11.5px] text-ink-3 leading-[1.8] mt-3 pt-3 border-t border-line-2">
                One caution on reading the table: {unread.map((x) => x.firm.name).join(' and ')}{' '}
                {unread.length === 1 ? 'refuses' : 'refuse'} our requests, so{' '}
                {unread.length === 1 ? 'its' : 'their'} rules were never read where they are published.
                That is scored openly as the evidence component, and{' '}
                <Link href="/learn/who-is-behind-your-prop-firm" className="text-accent font-semibold">
                  the guide explains what it does and does not mean
                </Link>.
              </p>
            )}
          </Card>

          <div className="flex gap-[10px]">
            {[a, b].map((x) => (
              <Link key={x.firm.slug} href={`/props/${x.firm.slug}`}
                className="flex-1 flex items-center justify-center gap-2 bg-card border border-line rounded-[13px] py-3 text-[13.5px] font-semibold hover:border-ink">
                {x.firm.name} <Score value={x.score.total} />
              </Link>
            ))}
          </div>

          <p className="text-[11.5px] text-ink-3 leading-[1.8] gutter">
            Both firms sell access to a simulated account rather than a financial service, so neither
            holds a licence anywhere — {a.firm.name} contracts from{' '}
            {countryInProse(a.firm.entities.find((e) => e.role === 'contracting')?.country ?? a.firm.headquarters)}{' '}
            and {b.firm.name} from{' '}
            {countryInProse(b.firm.entities.find((e) => e.role === 'contracting')?.country ?? b.firm.headquarters)}.
          </p>
        </div>
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail)]} />
    </>
  );
}
