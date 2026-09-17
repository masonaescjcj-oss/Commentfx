import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { describeDrawdown, countryName, countryInProse, propProfileFor, possessive, indefinite } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd } from '@/lib/seo';
import { rankedProps, getRankedProp, propAlternativesFor, pairSlug } from '@/lib/repo';
import { Header, PageHero, Footer } from '@/components/chrome';
import { Faq } from '@/components/Faq';
import { RecordHero, QuickJump, StickyActions } from '@/components/RecordHero';
import { IconScore, IconCost, IconLicence, IconReviews, IconCompare, IconFaq } from '@/components/icons';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewList, ReviewSummary } from '@/components/ReviewList';
import { recordReviews } from '@/lib/reviews';
import { OfficialSite } from '@/components/OfficialSite';
import { Card, CardHead, Logo, Score, Tag } from '@/components/primitives';
import { coverage } from '@/lib/verify';
import { VerificationPanel } from '@/components/VerificationPanel';
import { ScoreBreakdownCard, FactList } from '@/components/ranking';
import { PropEntities } from '@/components/PropEntities';
import { Profile } from '@/components/Profile';

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
  const profile = propProfileFor(f.slug);
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
      // "No" is a strong claim, and on a firm whose own pages we could not read
      // it is a claim the profile below may be openly disputing — E8 is exactly
      // that case. So the record's answer is given with the standing behind it
      // rather than flatly, and the two halves of the page stop contradicting
      // each other.
      a: f.rules.consistencyRule
        ? `Yes. ${f.name} caps how much of your total profit a single day may contribute, so one outsized day can disqualify an otherwise passing account.`
        : profile && !profile.originReadable
          ? `Not on our record — but ${possessive(f.name)} own pages refuse our requests, so nobody here has confirmed that where the rules are published. Treat it as unchecked rather than settled.`
          : `No. ${f.name} does not cap how much any single day contributes to your total profit.`,
    },
    {
      q: `What does ${indefinite(f.name)} ${f.name} challenge cost?`,
      a: `Normalised to a $100k account, $${f.feeUsdPer100k}. ${f.name} prices several account sizes; comparing per $100k is the only way to compare firms directly.`,
    },
    {
      q: `Is ${f.name} regulated?`,
      a:
        `No, and no prop firm is. ${f.name} sells access to a simulated account rather than a financial `
        + 'service, which is outside what financial regulators license. That is why the company behind it, '
        + 'and the country it is registered in, is the whole of what a trader could ever act on.',
    },
    {
      // Generated from the entity map so it cannot drift from it, and phrased
      // to answer the question a trader actually has: who owes me.
      q: `Which company would I be contracting with at ${f.name}?`,
      a: (() => {
        const contracting = f.entities.find((e) => e.role === 'contracting');
        const trading = f.entities.find((e) => e.role === 'trading');
        if (!contracting) {
          return `Nobody here has read ${possessive(f.name)} terms for the companies behind it yet, so this page does `
            + 'not say. Where a firm names none, the country in the header is where it says it is based, '
            + 'which is not the same thing.';
        }
        const first = `${contracting.legalName}, registered in ${countryInProse(contracting.country)}`;
        return trading && trading.legalName !== contracting.legalName
          ? `${first} — but your account is run by ${trading.legalName} in ${countryInProse(trading.country)}. `
            + `${f.name} names ${f.entities.length} companies in its own terms, and which one owes you `
            + 'depends on what went wrong.'
          : `${first}. It is the company whose terms you accept when you buy the challenge.`;
      })(),
    },
    {
      q: `What profit split does ${f.name} actually pay?`,
      a:
        `${f.payout.splitPct}% to a newly funded trader, which is not always the number a prop firm leads `
        + 'with — four of the eight firms ranked here advertise a higher share that is the top of a range, '
        + 'or in one case a paid upgrade. The figure on this page is what you start on.',
    },
    ...(profile && !profile.originReadable ? [{
      q: `Have these ${f.name} figures been checked?`,
      a:
        `Not at the source. ${possessive(f.name)} own pages refuse our requests, so the rules and costs above were `
        + 'not read where they are published — only where others have quoted them. That is scored openly as '
        + 'the evidence component rather than left as a footnote, and it is a fact about our reading rather '
        + 'than about the firm.',
    }] : []),
  ];

  return (
    <>
      <Header active="/props" />
      <main id="main" className="pb-[84px] lg:pb-10">
        <PageHero trail={trail}>
          <RecordHero
            logo={f.logo}
            name={f.name}
            badge={f.rules.drawdownType === 'static'
              ? { text: 'Static', tone: 'strong' }
              : { text: 'Trailing', tone: 'plain' }}
            rank={r.rank}
            of={all.length}
            score={r.score.total}
            reviews={{ count: reviews.stats.total, href: '#reviews' }}
            visit={{ href: f.website, label: `Visit ${f.name}` }}
            facts={[
              { label: 'Founded', value: String(f.founded) },
              { label: 'Headquarters', value: countryName(f.headquarters), flag: f.headquarters },
              { label: 'Fee per $100k', value: `$${f.feeUsdPer100k}` },
              { label: 'Profit split', value: `${f.payout.splitPct}%` },
            ]}
            parts={r.score.components.slice(0, 4).map((c) => ({ label: c.label, value: c.value, weight: c.weight }))}
          >
            <div className="flex gap-[5px] flex-wrap mt-4">
              <Tag tone={f.rules.drawdownType === 'static' ? 'good' : f.rules.drawdownType === 'intraday-trailing' ? 'bad' : 'warn'}>
                {describeDrawdown(f.rules.drawdownType)} drawdown
              </Tag>
              {f.rules.consistencyRule ? <Tag tone="warn">Consistency rule</Tag> : <Tag tone="good">No consistency rule</Tag>}
              {f.rules.timeLimitDays === null ? <Tag tone="good">No time limit</Tag> : <Tag tone="warn">{f.rules.timeLimitDays}-day limit</Tag>}
              {f.rules.newsTrading ? <Tag tone="good">News trading</Tag> : <Tag tone="bad">No news trading</Tag>}
            </div>
          </RecordHero>
        </PageHero>
        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
          <QuickJump items={[
            { href: '#score', label: 'Score', icon: <IconScore /> },
            { href: '#entities', label: 'Companies', icon: <IconLicence /> },
            { href: '#rules', label: 'Rules', icon: <IconLicence /> },
            { href: '#payout', label: 'Payout', icon: <IconCost /> },
            ...(propProfileFor(f.slug) ? [{ href: '#research', label: 'Research', icon: <IconLicence /> }] : []),
            { href: '#reviews', label: 'Reviews', icon: <IconReviews /> },
            { href: '#compare', label: 'Other firms', icon: <IconCompare /> },
            { href: '#faq', label: 'Questions', icon: <IconFaq /> },
          ]} />
          {/* Two columns above 1024px, the narrow one first: who this is and
              what is known about them, then the detail, which is most of the
              page and wants the width. */}
          <div className="split rail-left">
            <div>

              <VerificationPanel coverage={cov} />
            </div>

            <div>
            <div id="score" className="contents"><ScoreBreakdownCard components={r.score.components} skipped={r.score.skipped} /></div>

            {/* Before the rules, because which company you are dealing with
                decides who the rules bind. */}
            <PropEntities firm={f} />

            <Card className="p-4 lg:p-6" as="section" id="rules">
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

            <Card className="p-4 lg:p-6" as="section" id="payout">
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
              <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.8]">
                The split here is what a newly funded trader is paid, not the best number the firm
                advertises — on four of the eight in this directory those are different numbers.{' '}
                <Link href="/learn/who-is-behind-your-prop-firm" className="text-accent font-semibold">
                  Why the headline is usually a ceiling
                </Link>.
              </p>
            </Card>

            {/* The researched half, after the figures it argues about. */}
            {profile ? <Profile profile={profile} name={f.name} /> : null}

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

            <Card className="p-4 lg:p-6" as="section" id="write">
              <CardHead title={`Write about ${f.name}`} />
              <ReviewForm kind="prop" slug={f.slug} name={f.name} />
            </Card>

            <Card className="p-4 lg:p-6" as="section" id="compare">
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
              {/* Built from the same list this card renders, so a link here
                  cannot point at a comparison page nobody generated. */}
              <ul className="flex flex-wrap gap-[6px] mt-3 pt-3 border-t border-line-2">
                {propAlternativesFor(f.slug).map((x) => (
                  <li key={x.firm.slug}>
                    <Link
                      href={`/props/compare/${pairSlug(f.slug, x.firm.slug)}`}
                      className="inline-block text-[11.5px] text-ink-2 border border-line rounded-full px-[10px] py-[5px] hover:border-ink hover:text-ink"
                    >
                      {f.name} vs {x.firm.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-4 lg:p-6" as="section" id="faq">
              <CardHead title={`${f.name} — common questions`} />
              <Faq items={faq} />
            </Card>
            </div>
          </div>
        </div>
      </main>
      <StickyActions compareHref="#compare" writeHref="#write" />
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail), faqLd(faq)]} />
    </>
  );
}
