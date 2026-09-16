import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { describeDrawdown } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd } from '@/lib/seo';
import { rankedProps, getRankedProp } from '@/lib/repo';
import { Header, PageHero, Footer } from '@/components/chrome';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewList, ReviewSummary } from '@/components/ReviewList';
import { recordReviews } from '@/lib/reviews';
import { OfficialSite } from '@/components/OfficialSite';
import { Card, CardHead, Logo, Score, Tag } from '@/components/primitives';
import { coverage } from '@/lib/verify';
import { VerificationPanel } from '@/components/VerificationPanel';
import { ScoreBreakdownCard, FactList } from '@/components/ranking';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return rankedProps().map((r) => ({ slug: r.firm.slug }));
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

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const r = getRankedProp(slug);
  if (!r) return {};
  const f = r.firm;
  return pageMetadata({
    title: `${f.name} review — rules, payout terms and the real cost`,
    description:
      `${f.name} scores ${r.score.total.toFixed(1)} and ranks #${r.rank} of ${rankedProps().length}. ` +
      `${describeDrawdown(f.rules.drawdownType)} drawdown, ${f.payout.splitPct}% split, ` +
      `$${f.feeUsdPer100k} per $100k account. Every rule that decides whether you pass.`,
    path: `/props/${f.slug}`,
  });
}

export default async function PropPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const r = getRankedProp(slug);
  if (!r) notFound();

  const f = r.firm;
  const all = rankedProps();
  const [cov, reviews] = await Promise.all([
    coverage('prop', f.slug),
    recordReviews('prop', f.slug),
  ]);
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Prop Firms', path: '/props' },
    { name: f.name, path: `/props/${f.slug}` },
  ];

  const ddTone = f.rules.drawdownType === 'static' ? 'good' : f.rules.drawdownType === 'intraday-trailing' ? 'bad' : 'warn';

  const faq = [
    {
      q: `How does ${f.name} measure drawdown?`,
      a: f.rules.drawdownType === 'static'
        ? `${f.name} uses static drawdown: the ${f.rules.maxDrawdownPct}% limit is fixed against your starting balance and does not move as your equity rises.`
        : f.rules.drawdownType === 'eod-trailing'
          ? `${f.name} trails the ${f.rules.maxDrawdownPct}% limit on your end-of-day balance, so profits locked in at the close permanently raise the floor.`
          : `${f.name} trails the ${f.rules.maxDrawdownPct}% limit on intraday equity — the strictest form. An unrealised spike raises the floor even if you never close the trade.`,
    },
    {
      q: `Does ${f.name} have a consistency rule?`,
      a: f.rules.consistencyRule
        ? `Yes. ${f.name} caps how much of your total profit a single day may contribute, so one outsized day can disqualify an otherwise passing account.`
        : `No. ${f.name} does not cap how much any single day contributes to your total profit.`,
    },
    {
      q: `What does a ${f.name} challenge cost?`,
      a: `Normalised to a $100k account, $${f.feeUsdPer100k}. ${f.name} prices several account sizes; comparing per $100k is the only way to compare firms directly.`,
    },
  ];

  return (
    <>
      <Header active="/props" />
      <main id="main" className="pb-6 lg:pb-10">
        <PageHero trail={trail} />
        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
          {/* Two columns above 1024px, the narrow one first: who this is and
              what is known about them, then the detail, which is most of the
              page and wants the width. */}
          <div className="split rail-left">
            <div>

            <Card className="p-4 lg:p-6" as="article">
              <div className="flex gap-[14px] items-start">
                <Logo {...f.logo} size={64} />
                <div className="flex-1 min-w-0">
                  <Tag tone="accent">RANK #{r.rank} OF {all.length}</Tag>
                  <h1 className="font-[family-name:var(--font-display)] text-[23px] font-bold mt-2 tracking-[-0.025em]">
                    {f.name}
                  </h1>
                  {/* Baseline-aligned, not centred: a 46px figure centred against
                      two 11px lines hangs them off its middle, which is where the
                      eye reads a fraction. On the baseline they read as a caption
                      to the number, which is what they are. */}
                  <div className="flex items-end gap-[10px] mt-3">
                    <Score value={r.score.total} size="xl" />
                    <span className="text-[11.5px] text-ink-3 leading-[1.5] pb-[3px]">
                      out of 10<br />
                      <Link href="/methodology" className="text-accent">how we score</Link>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-[5px] flex-wrap mt-4">
                <Tag tone={ddTone}>{describeDrawdown(f.rules.drawdownType)} drawdown</Tag>
                {f.rules.consistencyRule ? <Tag tone="warn">Consistency rule</Tag> : <Tag tone="good">No consistency rule</Tag>}
                {f.rules.timeLimitDays === null ? <Tag tone="good">No time limit</Tag> : <Tag tone="warn">{f.rules.timeLimitDays}-day limit</Tag>}
                {f.rules.newsTrading ? <Tag tone="good">News trading</Tag> : <Tag tone="bad">No news trading</Tag>}
              </div>
            </Card>
              <VerificationPanel coverage={cov} />
            </div>

            <div>
            <ScoreBreakdownCard components={r.score.components} skipped={r.score.skipped} />

            <Card className="p-4 lg:p-6" as="section">
              <CardHead title="Challenge rules" />
              <FactList rows={[
                ['Steps', f.rules.steps === 'instant' ? 'Instant funding' : `${f.rules.steps}-step`],
                ['Profit target (phase 1)', `${f.rules.profitTargetPct}%`],
                ['Daily drawdown', `${f.rules.dailyDrawdownPct}%`],
                ['Max drawdown', `${f.rules.maxDrawdownPct}%`],
                ['Drawdown type', describeDrawdown(f.rules.drawdownType)],
                ['Minimum trading days', f.rules.minTradingDays === 0 ? 'None' : String(f.rules.minTradingDays)],
                ['Time limit', f.rules.timeLimitDays === null ? 'None' : `${f.rules.timeLimitDays} days`],
                ['Consistency rule', f.rules.consistencyRule ? 'Yes' : 'No'],
                ['Weekend holding', f.rules.weekendHolding ? 'Allowed' : 'Not allowed'],
              ]} />
            </Card>

            <Card className="p-4 lg:p-6" as="section">
              <CardHead title="Payout and cost" />
              <FactList rows={[
                ['Profit split', `${f.payout.splitPct}%`],
                ['Payout frequency', `Every ${f.payout.frequencyDays} days`],
                ['First payout after', `${f.payout.firstPayoutDays} days`],
                ['Challenge fee per $100k', `$${f.feeUsdPer100k}`],
                ['Verified payout proofs', f.payout.verifiedProofs === 0 ? 'None yet' : String(f.payout.verifiedProofs)],
                ['Markets', f.markets.join(', ')],
                ['Platforms', f.platforms.join(', ')],
              ]} />
            </Card>

            <Card className="p-4 lg:p-6" as="section">
              <OfficialSite name={f.name} url={f.website} />
            </Card>

            <Card className="p-4 lg:p-6" as="section" id="reviews">
              <CardHead
                title="What customers say"
                aside={<span className="text-[11.5px] text-ink-3 tnum">{reviews.stats.total} published</span>}
              />
              <ReviewSummary stats={reviews.stats} kind="prop" />
              <div className="mt-3"><ReviewList reviews={reviews.list} /></div>
            </Card>

            <Card className="p-4 lg:p-6" as="section">
              <CardHead title={`Write about ${f.name}`} />
              <ReviewForm kind="prop" slug={f.slug} name={f.name} />
            </Card>

            <Card className="p-4 lg:p-6" as="section">
              <CardHead title="Other firms" href="/props" hrefLabel="Full ranking" />
              <ul>
                {all.filter((x) => x.firm.slug !== f.slug).slice(0, 4).map((x) => (
                  <li key={x.firm.slug} className="border-b border-line-2 last:border-b-0">
                    <Link href={`/props/${x.firm.slug}`} className="flex items-center gap-3 py-[11px] group">
                      <Logo {...x.firm.logo} size={32} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13.5px] font-semibold group-hover:text-accent">{x.firm.name}</span>
                        <span className="block text-[11px] text-ink-3">{describeDrawdown(x.firm.rules.drawdownType)} · ${x.firm.feeUsdPer100k}</span>
                      </span>
                      <Score value={x.score.total} />
                      <span aria-hidden className="text-ink-3">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-4 lg:p-6" as="section">
              <CardHead title={`${f.name} — common questions`} />
              <dl>
                {faq.map(({ q, a }) => (
                  <div key={q} className="py-3 border-b border-line-2 last:border-b-0">
                    <dt className="text-[13.5px] font-semibold mb-[5px]">{q}</dt>
                    <dd className="text-[12.5px] text-ink-2 leading-[1.8]">{a}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail), faqLd(faq)]} />
    </>
  );
}
