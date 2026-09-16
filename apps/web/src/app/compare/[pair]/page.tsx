import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { effectiveCostPips, hours, leverage } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd } from '@/lib/seo';
import { comparePairs, pairSlug, parsePair, getRanked, type RankedBroker } from '@/lib/repo';
import { reviewStats } from '@/lib/reviews';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, Logo, Score } from '@/components/primitives';

type Params = { pair: string };

export function generateStaticParams(): Params[] {
  return comparePairs().map(([a, b]) => ({ pair: pairSlug(a, b) }));
}

export const revalidate = 3600;
/**
 * Deliberately NOT `dynamicParams = false`.
 *
 * Every known slug is prerendered by generateStaticParams above, and an unknown
 * one is caught by the notFound() below — so refusing dynamic params bought
 * nothing, and it cost something severe: revalidatePath() from a server action
 * purges the prerendered entry, and with no fallback allowed Next could not
 * regenerate it. Writing a review or reporting an outage took that company's
 * page down with a permanent 404 (`Internal: NoFallbackError`). Found by
 * driving the real form in a browser; no unit test can see this, because it is
 * a property of the rendering runtime rather than of our code.
 */

function rows(a: RankedBroker, b: RankedBroker) {
  const ab = a.broker, bb = b.broker;
  const lower = (x: number, y: number) => (x === y ? 0 : x < y ? 1 : 2);
  const higher = (x: number, y: number) => (x === y ? 0 : x > y ? 1 : 2);
  return [
    { label: 'Overall score', a: a.score.total.toFixed(1), b: b.score.total.toFixed(1), win: higher(a.score.total, b.score.total) },
    { label: 'Rank', a: `#${a.rank}`, b: `#${b.rank}`, win: lower(a.rank, b.rank) },
    { label: 'All-in cost', a: `${effectiveCostPips(ab).toFixed(2)} pips`, b: `${effectiveCostPips(bb).toFixed(2)} pips`, win: lower(effectiveCostPips(ab), effectiveCostPips(bb)) },
    { label: 'Minimum deposit', a: ab.payments.minDepositUsd === 0 ? 'None' : `$${ab.payments.minDepositUsd}`, b: bb.payments.minDepositUsd === 0 ? 'None' : `$${bb.payments.minDepositUsd}`, win: lower(ab.payments.minDepositUsd, bb.payments.minDepositUsd) },
    { label: 'Stated withdrawal', a: hours(ab.payments.statedWithdrawalHours), b: hours(bb.payments.statedWithdrawalHours), win: lower(ab.payments.statedWithdrawalHours, bb.payments.statedWithdrawalHours) },
    { label: 'Max leverage', a: leverage(ab.platforms.maxLeverage), b: leverage(bb.platforms.maxLeverage), win: higher(ab.platforms.maxLeverage, bb.platforms.maxLeverage) },
    { label: 'Licences', a: String(ab.entities.length), b: String(bb.entities.length), win: higher(ab.entities.length, bb.entities.length) },
    { label: 'Platforms', a: String(ab.platforms.list.length), b: String(bb.platforms.list.length), win: higher(ab.platforms.list.length, bb.platforms.list.length) },
    { label: 'Execution', a: ab.platforms.execution.toUpperCase(), b: bb.platforms.execution.toUpperCase(), win: 0 },
    { label: 'Swap-free', a: ab.cost.swapFreeAvailable ? 'Yes' : 'No', b: bb.cost.swapFreeAvailable ? 'Yes' : 'No', win: 0 },
  ];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const stats = await reviewStats();
  const [a, b] = [getRanked(parsed[0], stats), getRanked(parsed[1], stats)];
  if (!a || !b) return {};
  return pageMetadata({
    title: `${a.broker.name} vs ${b.broker.name} — which is the better broker?`,
    description:
      `${a.broker.name} scores ${a.score.total.toFixed(1)}, ${b.broker.name} scores ${b.score.total.toFixed(1)}. ` +
      `Side-by-side on cost, licences, minimum deposit, withdrawals and platforms.`,
    path: `/compare/${pair}`,
  });
}

export default async function ComparePage({ params }: { params: Promise<Params> }) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const stats = await reviewStats();
  const a = getRanked(parsed[0], stats);
  const b = getRanked(parsed[1], stats);
  if (!a || !b) notFound();

  const table = rows(a, b);
  const winner = a.score.total >= b.score.total ? a : b;
  const other = winner === a ? b : a;
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Brokers', path: '/brokers' },
    { name: `${a.broker.name} vs ${b.broker.name}`, path: `/compare/${pair}` },
  ];

  return (
    <>
      <Header active="/brokers" />
      <main id="main" className="shell pt-0 pb-6 sm:pt-3 lg:pb-10 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
        <Breadcrumbs trail={trail} />
        <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold leading-[1.25] tracking-[-0.02em] gutter text-balance">
          {a.broker.name} vs {b.broker.name}
        </h1>

        <div className="flex items-start gap-[10px] gutter">
          {[a, b].map((x, i) => (
            <div key={x.broker.slug} className="flex-1 text-center">
              <Logo {...x.broker.logo} size={48} />
              <p className="text-[13.5px] font-bold mt-2">{x.broker.name}</p>
              <p className="text-[11.5px] text-ink-3">#{x.rank} overall</p>
              {i === 0 && <span className="sr-only">compared with</span>}
            </div>
          ))}
        </div>

        <Card className="px-4 lg:px-6 py-2">
          <table className="w-full">
            <caption className="sr-only">{a.broker.name} compared with {b.broker.name}</caption>
            <thead className="sr-only">
              <tr><th scope="col">Attribute</th><th scope="col">{a.broker.name}</th><th scope="col">{b.broker.name}</th></tr>
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
            {winner.broker.name} takes it overall on {winner.score.total.toFixed(1)} against{' '}
            {other.score.total.toFixed(1)} — {winner.broker.why.charAt(0).toLowerCase() + winner.broker.why.slice(1)}.
            {' '}{other.broker.name} is the better pick if what you need is{' '}
            {effectiveCostPips(other.broker) < effectiveCostPips(winner.broker)
              ? 'the tighter all-in cost'
              : other.broker.payments.minDepositUsd < winner.broker.payments.minDepositUsd
                ? 'the lower minimum deposit'
                : 'a different platform line-up'}.
          </p>
        </Card>

        <div className="flex gap-[10px]">
          {[a, b].map((x) => (
            <Link key={x.broker.slug} href={`/brokers/${x.broker.slug}`}
              className="flex-1 flex items-center justify-center gap-2 bg-card border border-line rounded-[13px] py-3 text-[13.5px] font-semibold hover:border-ink">
              {x.broker.name} <Score value={x.score.total} />
            </Link>
          ))}
        </div>
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail)]} />
    </>
  );
}
