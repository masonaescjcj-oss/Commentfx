import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { REGULATORS, effectiveCostPips, hours, leverage } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, financialServiceLd, faqLd } from '@/lib/seo';
import { rankedBrokers, getRanked, alternativesFor } from '@/lib/repo';
import { coverage } from '@/lib/verify';
import { brokerStatus } from '@/lib/status';
import { registerChecksFor } from '@/lib/registers';
import { recordReviews, reviewStats } from '@/lib/reviews';
import { StatusBlock } from '@/components/StatusBlock';
import { VerificationPanel } from '@/components/VerificationPanel';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { OfficialSite } from '@/components/OfficialSite';
import { Card, CardHead, Logo, Score, Tag, Meter } from '@/components/primitives';
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
      <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
        <Breadcrumbs trail={trail} />

        <Card className="p-4" as="article">
          <div className="flex gap-[14px] items-start">
            <Logo {...b.logo} size={64} />
            <div className="flex-1 min-w-0">
              <Tag tone="brass">RANK #{r.rank} OF {all.length}</Tag>
              <h1 className="font-[family-name:var(--font-display)] text-[23px] font-bold mt-2 tracking-[-0.025em]">
                {b.name}
              </h1>
              <div className="flex items-center gap-[9px] mt-2">
                <Score value={r.score.total} size="xl" />
                <span className="text-[11.5px] text-ink-3 leading-[1.4]">
                  out of 10<br />
                  <Link href="/methodology" className="text-brass">how we score</Link>
                </span>
              </div>
            </div>
          </div>

          <dl className="flex flex-wrap mt-4 pt-1 border-t border-line-2">
            {[
              ['Founded', String(b.founded)],
              ['Min deposit', b.payments.minDepositUsd === 0 ? 'None' : `$${b.payments.minDepositUsd}`],
              ['Headquarters', b.headquarters],
              ['Max leverage', leverage(b.platforms.maxLeverage)],
            ].map(([k, v]) => (
              <div key={k} className="basis-1/2 py-2">
                <dt className="text-[11.5px] text-ink-3">{k}</dt>
                <dd className="text-[14px] font-bold tnum">{v}</dd>
              </div>
            ))}
          </dl>

        </Card>

        <StatusBlock brokerSlug={b.slug} brokerName={b.name} status={status} />

        <VerificationPanel coverage={cov} />

        <Card className="p-4" as="section">
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
                {c.value !== null && <Meter value={c.value} tone={c.value >= 8 ? 'up' : c.value >= 6 ? 'brass' : 'warn'} />}
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

        <Card className="p-4 border-[1.5px] border-brass shadow-none" as="section">
          <CardHead title="Which entity will you be under?" />
          <EntityMap broker={b} />
          <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.8]">
            Where you live decides the entity, and the entity decides the protection.
          </p>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Licences" aside={<span className="text-[11.5px] text-ink-3">{b.entities.length} on record</span>} />
          <LicenceList broker={b} checks={checks} />
        </Card>

        <Card className="p-4" as="section">
          <Card className="p-4" as="section">
          <OfficialSite name={b.name} url={b.website} />
        </Card>

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
        </Card>

        <Card className="p-4" as="section" id="reviews">
          <CardHead
            title="What customers say"
            aside={<span className="text-[11.5px] text-ink-3 tnum">{reviews.stats.total} published</span>}
          />
          <ReviewSummary stats={reviews.stats} kind="broker" />
          <div className="mt-3"><ReviewList reviews={reviews.list} /></div>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title={`Write about ${b.name}`} />
          <ReviewForm kind="broker" slug={b.slug} name={b.name} />
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Compare" />
          <ul className="flex flex-col">
            {alternatives.map((a) => (
              <li key={a.broker.slug} className="border-b border-line-2 last:border-b-0">
                <Link href={`/compare/${b.slug}-vs-${a.broker.slug}`} className="flex items-center gap-3 py-[11px] group">
                  <Logo {...a.broker.logo} size={32} />
                  <span className="flex-1 text-[13.5px] font-semibold group-hover:text-brass">
                    {b.name} vs {a.broker.name}
                  </span>
                  <Score value={a.score.total} />
                  <span aria-hidden className="text-ink-3">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title={`${b.name} — common questions`} />
          <dl>
            {faq.map(({ q, a }) => (
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
        financialServiceLd({
          name: b.name, slug: b.slug, founded: b.founded,
          reviewAverage: reviews.stats.verifiedAverage,
          reviewCount: reviews.stats.verified,
        }),
        faqLd(faq),
      ]} />
    </>
  );
}
