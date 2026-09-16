import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { volumeBand } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd } from '@/lib/seo';
import { rankedExchanges, getRankedExchange } from '@/lib/repo';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
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
  return rankedExchanges().map((r) => ({ slug: r.exchange.slug }));
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
  const r = getRankedExchange(slug);
  if (!r) return {};
  const e = r.exchange;
  return pageMetadata({
    title: `${e.name} review — fees, reserves and security record`,
    description:
      `${e.name} scores ${r.score.total.toFixed(1)} and ranks #${r.rank} of ${rankedExchanges().length}. ` +
      `${e.takerFeePct}% taker fee, ${volumeBand(e.spotVolumeUsd)} reported volume, and what evidence ` +
      `exists that customer funds are actually there.`,
    path: `/exchanges/${e.slug}`,
  });
}

export default async function ExchangePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const r = getRankedExchange(slug);
  if (!r) notFound();

  const e = r.exchange;
  const all = rankedExchanges();
  const [cov, reviews] = await Promise.all([
    coverage('exchange', e.slug),
    recordReviews('exchange', e.slug),
  ]);
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Exchanges', path: '/exchanges' },
    { name: e.name, path: `/exchanges/${e.slug}` },
  ];

  const faq = [
    {
      q: `Is ${e.name} safe?`,
      a: e.security.lastBreachYear === null
        ? `${e.name} has no customer-funds breach on record. On solvency evidence it ${solvencySentence(e)}. Neither is a guarantee — an exchange is a counterparty, and holding coins on one means trusting it.`
        : `${e.name} was breached in ${e.security.lastBreachYear} and users were ${e.security.madeUsersWhole ? 'made whole' : 'not made whole'}. On solvency evidence it ${solvencySentence(e)}.`,
    },
    {
      q: `What does ${e.name} charge?`,
      a: `${e.takerFeePct}% taker and ${e.makerFeePct}% maker at the lowest tier. Fee tiers fall with volume, so most readers pay the figures quoted here.`,
    },
    {
      q: `Does ${e.name} publish a proof of reserves?`,
      a: e.reserves.proofOfReserves
        ? `Yes. Remember what that is: a snapshot the exchange chooses to publish, unaudited, saying nothing about liabilities. It is real evidence, but weaker than an audit.`
        : `No. ${e.reserves.publiclyListed ? 'It does file audited accounts as a listed company, which is stronger evidence.' : 'There is no public reserve attestation on record.'}`,
    },
  ];

  return (
    <>
      <Header active="/exchanges" />
      <main id="main" className="shell pt-0 pb-6 sm:pt-3 lg:pb-10 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
        <Breadcrumbs trail={trail} />

        {/* Two columns above 1024px, the narrow one first: who this is and
            what is known about them, then the detail, which is most of the
            page and wants the width. */}
        <div className="split rail-left">
          <div>

          <Card className="p-4" as="article">
            <div className="flex gap-[14px] items-start">
              <Logo {...e.logo} size={64} />
              <div className="flex-1 min-w-0">
                <Tag tone="brass">RANK #{r.rank} OF {all.length}</Tag>
                <h1 className="font-[family-name:var(--font-display)] text-[23px] font-bold mt-2 tracking-[-0.025em]">
                  {e.name}
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
            <div className="flex gap-[5px] flex-wrap mt-4">
              {e.reserves.publiclyListed && <Tag tone="good">Publicly listed</Tag>}
              {e.reserves.thirdPartyAudit && <Tag tone="good">Third-party audit</Tag>}
              {e.reserves.proofOfReserves && <Tag tone="brass">Proof of reserves</Tag>}
              {e.security.lastBreachYear === null
                ? <Tag tone="good">No breach on record</Tag>
                : <Tag tone={e.security.madeUsersWhole ? 'warn' : 'bad'}>Breach {e.security.lastBreachYear}</Tag>}
            </div>
          </Card>
            <VerificationPanel coverage={cov} />
          </div>

          <div>
          <ScoreBreakdownCard components={r.score.components} skipped={r.score.skipped} />

          <Card className="p-4" as="section">
            <CardHead title="Fees and liquidity" />
            <FactList rows={[
              ['Taker fee', `${e.takerFeePct}%`],
              ['Maker fee', `${e.makerFeePct}%`],
              ['Reported 24h spot volume', volumeBand(e.spotVolumeUsd)],
              ['Type', e.kind === 'centralised' ? 'Centralised' : 'Decentralised'],
              ['Founded', String(e.founded)],
              ['Headquarters', e.headquarters],
            ]} />
          </Card>

          <Card className="p-4" as="section">
            <CardHead title="Solvency and security" />
            <FactList rows={[
              ['Proof of reserves', e.reserves.proofOfReserves ? 'Published' : 'None'],
              ['Third-party audit', e.reserves.thirdPartyAudit ? 'Yes' : 'No'],
              ['Publicly listed', e.reserves.publiclyListed ? 'Yes' : 'No'],
              ['Last customer-funds breach', e.security.lastBreachYear === null ? 'None on record' : String(e.security.lastBreachYear)],
              ['Users made whole', e.security.madeUsersWhole === null ? '—' : e.security.madeUsersWhole ? 'Yes' : 'No'],
              ['Insurance fund', e.security.insuranceFund ? 'Yes' : 'No'],
            ]} />
            <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.8]">
              An exchange is a counterparty, not a wallet.
            </p>
          </Card>

          <Card className="p-4" as="section">
            <OfficialSite name={e.name} url={e.website} />
          </Card>

          <Card className="p-4" as="section" id="reviews">
            <CardHead
              title="What customers say"
              aside={<span className="text-[11.5px] text-ink-3 tnum">{reviews.stats.total} published</span>}
            />
            <ReviewSummary stats={reviews.stats} kind="exchange" />
            <div className="mt-3"><ReviewList reviews={reviews.list} /></div>
          </Card>

          <Card className="p-4" as="section">
            <CardHead title={`Write about ${e.name}`} />
            <ReviewForm kind="exchange" slug={e.slug} name={e.name} />
          </Card>

          <Card className="p-4" as="section">
            <CardHead title="Other exchanges" href="/exchanges" hrefLabel="Full ranking" />
            <ul>
              {all.filter((x) => x.exchange.slug !== e.slug).slice(0, 4).map((x) => (
                <li key={x.exchange.slug} className="border-b border-line-2 last:border-b-0">
                  <Link href={`/exchanges/${x.exchange.slug}`} className="flex items-center gap-3 py-[11px] group">
                    <Logo {...x.exchange.logo} size={32} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13.5px] font-semibold group-hover:text-brass">{x.exchange.name}</span>
                      <span className="block text-[11px] text-ink-3">{x.exchange.takerFeePct}% taker · {volumeBand(x.exchange.spotVolumeUsd)}</span>
                    </span>
                    <Score value={x.score.total} />
                    <span aria-hidden className="text-ink-3">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4" as="section">
            <CardHead title={`${e.name} — common questions`} />
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
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail), faqLd(faq)]} />
    </>
  );
}

function solvencySentence(e: { reserves: { proofOfReserves: boolean; thirdPartyAudit: boolean; publiclyListed: boolean } }): string {
  const bits = [
    e.reserves.publiclyListed && 'files audited accounts as a listed company',
    e.reserves.thirdPartyAudit && !e.reserves.publiclyListed && 'is audited by a named third party',
    e.reserves.proofOfReserves && 'publishes a proof of reserves',
  ].filter(Boolean) as string[];
  return bits.length ? bits.join(' and ') : 'publishes nothing verifiable';
}
