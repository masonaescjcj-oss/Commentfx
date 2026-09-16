import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { REGULATORS, countryName, brokerReview, effectiveCostPips, hours, leverage } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, financialServiceLd, faqLd } from '@/lib/seo';
import { rankedBrokers, getRanked, alternativesFor } from '@/lib/repo';
import { coverage } from '@/lib/verify';
import { brokerStatus } from '@/lib/status';
import { registerChecksFor } from '@/lib/registers';
import { recordReviews, reviewStats } from '@/lib/reviews';
import { StatusBlock } from '@/components/StatusBlock';
import { VerificationPanel } from '@/components/VerificationPanel';
import { Header, PageHero, Footer } from '@/components/chrome';
import { Faq } from '@/components/Faq';
import { OfficialSite } from '@/components/OfficialSite';
import { Card, CardHead, Logo, Score, Tag, Meter } from '@/components/primitives';
import { RecordHero, QuickJump, StickyActions } from '@/components/RecordHero';
import { IconScore, IconEntity, IconLicence, IconCost, IconStatus, IconReview, IconReviews, IconCompare, IconFaq } from '@/components/icons';
import { EntityMap } from '@/components/EntityMap';
import { LicenceList } from '@/components/LicenceList';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewList, ReviewSummary } from '@/components/ReviewList';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return rankedBrokers().map((r) => ({ slug: r.broker.slug }));
}

export const revalidate = 300;
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
  // The same live review counts the page body uses. A title that advertises a
  // score the page does not show is the kind of drift nobody notices for weeks.
  const r = getRanked(slug, await reviewStats());
  if (!r) return {};
  const b = r.broker;
  return pageMetadata({
    title: `${b.name} review — score ${r.score.total.toFixed(1)}, licences and real costs`,
    description:
      `${b.name} scores ${r.score.total.toFixed(1)} out of 10 and ranks #${r.rank} of ` +
      `${rankedBrokers().length}. Which legal entity you are onboarded to, its licence ` +
      `checked against the regulator's own register, and the published cost of trading.`,
    path: `/brokers/${b.slug}`,
  });
}

export default async function BrokerPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const stats = await reviewStats();
  const r = getRanked(slug, stats);
  if (!r) notFound();

  const b = r.broker;
  const all = rankedBrokers(stats);
  const [cov, status, checks, reviews] = await Promise.all([
    coverage('broker', b.slug),
    brokerStatus(b.slug),
    registerChecksFor(b.slug),
    recordReviews('broker', b.slug),
  ]);
  const alternatives = alternativesFor(b.slug, stats);
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Brokers', path: '/brokers' },
    { name: b.name, path: `/brokers/${b.slug}` },
  ];

  // Said on the mark rather than in a sentence, and said from the licences on
  // the record rather than from a marketing line: the best tier any of this
  // company's entities holds. "Regulated" on its own is what an offshore
  // registration calls itself, which is why the tier is in the words.
  const tiers = b.entities.map((e) => REGULATORS[e.licence.regulator]?.tier);
  const licenceBadge = tiers.includes('A')
    ? { text: 'Tier 1', tone: 'strong' as const }
    : tiers.includes('B')
      ? { text: 'Tier 2', tone: 'plain' as const }
      : b.entities.length > 0
        ? { text: 'Offshore', tone: 'plain' as const }
        : null;

  // The long read, generated from the record above rather than typed about it.
  // See broker-review.ts for why it is generated; the short version is that a
  // paragraph written by hand stops being true the first time a field changes.
  const review = brokerReview({
    broker: b,
    rank: r.rank,
    of: all.length,
    peers: all.map((x) => x.broker),
    components: r.score.components.map((c) => ({ key: c.key, label: c.label, value: c.value })),
  });

  const faq = [
    {
      q: `Is ${b.name} regulated?`,
      a: `${b.name} operates ${b.entities.length} legal ${b.entities.length === 1 ? 'entity' : 'entities'}: ${b.entities
        .map((e) => `${e.legalName} (${REGULATORS[e.licence.regulator]?.name ?? e.licence.regulator}, licence ${e.licence.number})`)
        .join('; ')}. Which one applies to you depends on your country of residence.`,
    },
    {
      q: `What is the minimum deposit at ${b.name}?`,
      a: b.payments.minDepositUsd === 0
        ? `${b.name} states no minimum deposit.`
        : `${b.name} states a minimum deposit of $${b.payments.minDepositUsd}.`,
    },
    {
      q: `How long do ${b.name} withdrawals take?`,
      a: `${b.name} states a processing time of ${hours(b.payments.statedWithdrawalHours)}. That is the broker's own claim; we publish measured times once enough verified user reports exist.`,
    },
  ];

  return (
    <>
      <Header active="/brokers" />
      {/* Room at the bottom for the pinned bar, which is fixed and therefore
          covers whatever is under it. */}
      <main id="main" className="pb-[84px] lg:pb-10">
        <PageHero trail={trail}>
          <RecordHero
            logo={b.logo}
            name={b.name}
            badge={licenceBadge}
            rank={r.rank}
            of={all.length}
            score={r.score.total}
            reviews={{ count: reviews.stats.total, href: '#reviews' }}
            visit={{ href: b.website, label: `Visit ${b.name}` }}
            facts={[
              { label: 'Founded', value: String(b.founded) },
              { label: 'Min deposit', value: b.payments.minDepositUsd === 0 ? 'None' : `$${b.payments.minDepositUsd}` },
              { label: 'Headquarters', value: countryName(b.headquarters), flag: b.headquarters },
              { label: 'Max leverage', value: leverage(b.platforms.maxLeverage) },
            ]}
            parts={r.score.components.slice(0, 4).map((c) => ({
              label: c.label, value: c.value, weight: c.weight,
            }))}
          >
            {/* Who licenses them, at a glance. The list below says the numbers,
                the status and whether we could read the register; this says
                only which regulators are involved, which is the question a
                reader asks before any of that. */}
            <ul className="flex gap-[5px] flex-wrap mt-4">
              {[...new Set(b.entities.map((e) => e.licence.regulator))].map((code) => (
                <li key={code}>
                  <Tag tone={REGULATORS[code]?.tier === 'A' ? 'good' : REGULATORS[code]?.tier === 'B' ? 'warn' : 'neutral'}>
                    {code}
                  </Tag>
                </li>
              ))}
            </ul>
          </RecordHero>
        </PageHero>

        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
          <QuickJump items={[
            { href: '#score', label: 'Score', icon: <IconScore /> },
            { href: '#entity', label: 'Entity', icon: <IconEntity /> },
            { href: '#licences', label: 'Licences', icon: <IconLicence /> },
            { href: '#costs', label: 'Costs', icon: <IconCost /> },
            { href: '#review', label: 'Review', icon: <IconReview /> },
            { href: '#status', label: 'Outages', icon: <IconStatus /> },
            { href: '#reviews', label: 'Reviews', icon: <IconReviews /> },
            { href: '#compare', label: 'Compare', icon: <IconCompare />, ready: alternatives.length > 0 },
            { href: '#faq', label: 'Questions', icon: <IconFaq /> },
          ]} />
          {/* Two columns above 1024px, the narrow one first: who this is and
              what is known about them, then the detail, which is most of the
              page and wants the width. */}
          <div className="split rail-left">
            <div>

            <div id="status" className="contents">
              <StatusBlock brokerSlug={b.slug} brokerName={b.name} status={status} />
            </div>

            <VerificationPanel coverage={cov} />
            </div>

            <div>
            <Card className="p-4 lg:p-6" as="section" id="score">
              <CardHead title="Score breakdown" href="/methodology" hrefLabel="Method" />
              <ul className="flex flex-col gap-[11px]">
                {r.score.components.map((c) => (
                  <li key={c.key}>
                    <div className="flex items-baseline gap-2 mb-[6px]">
                      <span className="text-[12.5px]">{c.label}</span>
                      <span className="text-[11px] text-ink-3 tnum">{Math.round(c.weight * 100)}%</span>
                      <div className="flex-1" />
                      <span className={`text-[13px] font-extrabold tnum ${c.value === null ? 'text-ink-3' : ''}`}>
                        {c.value === null ? '—' : c.value.toFixed(1)}
                      </span>
                    </div>
                    {c.value !== null && <Meter value={c.value} tone={c.value >= 8 ? 'up' : c.value >= 6 ? 'accent' : 'warn'} />}
                    <p className="text-[11px] text-ink-3 mt-[5px]">{c.note}</p>
                  </li>
                ))}
              </ul>
              {r.score.skipped.length > 0 && (
                <p className="mt-3 text-[11.5px] text-ink-3 leading-[1.7]">
                  {r.score.skipped.length} component{r.score.skipped.length > 1 ? 's' : ''} had no data
                  and {r.score.skipped.length > 1 ? 'were' : 'was'} excluded — the remaining weights were
                  renormalised rather than scoring it zero.
                </p>
              )}
            </Card>

            <Card className="p-4 lg:p-6 border-[1.5px] border-accent shadow-none" as="section" id="entity">
              <CardHead title="Which entity will you be under?" />
              <EntityMap broker={b} />
              <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.8]">
                Where you live decides the entity, and the entity decides the protection.{' '}
                <Link href="/learn/which-entity-are-you-signing-with" className="text-accent font-semibold">
                  What changes between them
                </Link>.
              </p>
            </Card>

            <Card className="p-4 lg:p-6" as="section" id="licences">
              <CardHead title="Licences" aside={<span className="text-[11.5px] text-ink-3">{b.entities.length} on record</span>} />
              <LicenceList broker={b} checks={checks} />
              <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.8]">
                Every number here is on a register you can search yourself, for free —{' '}
                <Link href="/learn/check-a-broker-licence" className="text-accent font-semibold">
                  here is where each register is
                </Link>.
              </p>
            </Card>

            <Card className="p-4 lg:p-6" as="section" id="costs">
              <OfficialSite name={b.name} url={b.website} />
              <CardHead title="Costs and terms" />
              <dl>
                {[
                  ['EUR/USD spread', `${b.cost.eurusdSpread.toFixed(1)} pips`],
                  ['Commission', b.cost.commissionPerLot === 0 ? 'None' : `$${b.cost.commissionPerLot} per lot round turn`],
                  ['All-in cost', `${effectiveCostPips(b).toFixed(2)} pips`],
                  ['Swap-free available', b.cost.swapFreeAvailable ? 'Yes' : 'No'],
                  ['Stated withdrawal time', hours(b.payments.statedWithdrawalHours)],
                  ['Funding methods', b.payments.methods.join(', ')],
                  ['Platforms', b.platforms.list.join(', ').toUpperCase()],
                  ['Execution', b.platforms.execution.toUpperCase()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center gap-3 py-[9px] border-b border-line-2 last:border-b-0">
                    <dt className="text-[12.5px] text-ink-3">{k}</dt>
                    <dd className="text-[13px] font-semibold tnum text-right">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.8]">
                All-in cost is the spread plus the commission converted to pips, so two accounts
                charging in different ways can be put in one column —{' '}
                <Link href="/learn/what-a-spread-really-costs" className="text-accent font-semibold">
                  the arithmetic, in money
                </Link>.
              </p>
            </Card>

            {/* The body of the page for a reader who arrived from a search
                result: eight headed sections, every sentence of them a reading
                of a field on this record. It sits after the tables because it
                explains them, and before the user reviews because it is ours
                and those are other people's. */}
            <Card className="p-4 lg:p-6" as="section" id="review">
              <CardHead title={`${b.name} reviewed`} href="/methodology" hrefLabel="How we score" />
              <div className="max-w-[68ch]">
                {review.map((sec) => (
                  <section key={sec.id} id={sec.id} className="mt-5 first:mt-1">
                    <h3 className="font-[family-name:var(--font-display)] text-[15.5px] font-bold tracking-[-0.015em] mb-2">
                      {sec.heading}
                    </h3>
                    {sec.paragraphs.map((para) => (
                      <p key={para.slice(0, 40)} className="text-[13.5px] text-ink-2 leading-[1.9] mb-[10px] last:mb-0">
                        {para}
                      </p>
                    ))}
                  </section>
                ))}
              </div>
              <p className="text-[11.5px] text-ink-3 leading-[1.75] mt-5 pt-4 border-t border-line-2">
                Written from the record on this page, not about it. Every sentence above is a reading of a
                field you can see here, so a correction to the data corrects the text the same day.
              </p>
            </Card>

            <Card className="p-4 lg:p-6" as="section" id="reviews">
              <CardHead
                title="What customers say"
                aside={<span className="text-[11.5px] text-ink-3 tnum">{reviews.stats.total} published</span>}
              />
              <ReviewSummary stats={reviews.stats} kind="broker" />
              <div className="mt-3"><ReviewList reviews={reviews.list} /></div>
            </Card>

            <Card className="p-4 lg:p-6" as="section" id="write">
              <CardHead title={`Write about ${b.name}`} />
              <ReviewForm kind="broker" slug={b.slug} name={b.name} />
            </Card>

            <Card className="p-4 lg:p-6" as="section" id="compare">
              <CardHead title="Compare" />
              <ul className="flex flex-col">
                {alternatives.map((a) => (
                  <li key={a.broker.slug} className="border-b border-line-2 last:border-b-0">
                    <Link href={`/compare/${b.slug}-vs-${a.broker.slug}`} className="flex items-center gap-3 py-[11px] group">
                      <Logo {...a.broker.logo} size={32} />
                      <span className="flex-1 text-[13.5px] font-semibold group-hover:text-accent">
                        {b.name} vs {a.broker.name}
                      </span>
                      <Score value={a.score.total} />
                      <span aria-hidden className="text-ink-3">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-4 lg:p-6" as="section" id="faq">
              <CardHead title={`${b.name} — common questions`} />
              <Faq items={faq} />
            </Card>
            </div>
          </div>
        </div>
      </main>
      <StickyActions compareHref={alternatives.length > 0 ? '#compare' : '#reviews'} writeHref="#write" />
      <Footer />
      <JsonLd graph={[
        breadcrumbLd(trail),
        financialServiceLd({
          name: b.name, slug: b.slug, founded: b.founded,
          reviewAverage: reviews.stats.publishedAverage,
          reviewCount: reviews.stats.total,
        }),
        faqLd(faq),
      ]} />
    </>
  );
}
