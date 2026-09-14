import Link from 'next/link';
import type { Metadata } from 'next';
import { MIN_FOR_SCORE, SCORED_KINDS, type ReviewKind } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd } from '@/lib/seo';
import { latestReviews, pathForKind } from '@/lib/reviews';
import { getBroker, getProp, getExchange } from '@/lib/repo';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, CardHead } from '@/components/primitives';
import { ReviewFeed, type FeedItem } from '@/components/ReviewFeed';

const TITLE = 'What customers actually say about brokers, prop firms and exchanges';
const DESC =
  'Every review published here, newest first, each marked checked or unverified. ' +
  'Reviews are published the moment they are written and count towards a score only ' +
  'after an editor has checked the evidence behind them.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/reviews' });

/** Reviews arrive at any time, so this page is never cached for long. */
export const revalidate = 60;

const nameOf = (kind: ReviewKind, slug: string) =>
  (kind === 'broker' ? getBroker(slug) : kind === 'prop' ? getProp(slug) : getExchange(slug))?.name;

const FAQ = [
  {
    q: 'Can a company buy good reviews here?',
    a: `It can buy paragraphs. A review is published the moment it is written and marked unverified, and it reaches a score only once an editor has checked the evidence behind it — so a hundred bought five-star reviews move a ranking by exactly nothing. Below ${MIN_FOR_SCORE} checked reviews the component is excluded from the score entirely rather than scored low.`,
  },
  {
    q: 'Do I need an account to write one?',
    a: 'No, and there is no way to make one. No email, no address, nothing that identifies you is stored — authorship is a salted digest that rotates every day, which exists to stop one person writing fifty reviews and can do nothing else.',
  },
  {
    q: 'Can I take a review down?',
    a: 'Yes, with the code you are shown once when you publish it. Because there are no accounts, that code is the only thing that distinguishes you from someone else asking us to delete your review, and we cannot give it back to you if you lose it.',
  },
  {
    q: 'Why do some reviews not affect the ranking at all?',
    a: 'Only the broker model has a reviews component. The prop firm and exchange models were published without one, and adding it means changing published weights — a decision we would make and publish openly, not slip in as a side effect. Until then those reviews are read, not counted, and every page says so.',
  },
];

export default async function ReviewsPage() {
  const reviews = await latestReviews();

  const items: FeedItem[] = reviews.flatMap((r) => {
    const name = nameOf(r.kind, r.slug);
    // A review whose company left the directory has nothing to point at.
    if (!name) return [];
    return [{
      id: r.id, kind: r.kind, slug: r.slug, name,
      path: pathForKind(r.kind, r.slug),
      rating: r.rating, topic: r.topic, body: r.body,
      verified: r.verified, createdAt: r.createdAt.toISOString(),
    }];
  });

  const trail = [{ name: 'Home', path: '/' }, { name: 'Reviews', path: '/reviews' }];
  const checked = items.filter((i) => i.verified).length;

  return (
    <>
      <Header />
      <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
        <Breadcrumbs trail={trail} />

        <header className="px-1">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.22] tracking-[-0.02em] text-balance">
            What customers actually say
          </h1>
          <p className="text-[13.5px] text-ink-2 leading-[1.75] mt-2 max-w-[48ch]">
            Published the moment they are written, and counted only after a person has
            checked the evidence. Both states are on the page, because hiding the
            unchecked ones would be a different kind of dishonesty.
          </p>
          {items.length > 0 && (
            <p className="text-[11.5px] text-ink-3 mt-3 tnum">
              {items.length} published · {checked} checked by an editor
            </p>
          )}
        </header>

        {items.length === 0 ? (
          <Card className="p-5 text-center" as="section">
            <p className="text-[14px] font-semibold mb-1">Nobody has written one yet</p>
            <p className="text-[12.5px] text-ink-2 leading-[1.8] max-w-[42ch] mx-auto">
              Reviews appear here as they are written. Open any{' '}
              <Link href="/brokers" className="text-brass font-semibold">broker</Link>,{' '}
              <Link href="/props" className="text-brass font-semibold">prop firm</Link> or{' '}
              <Link href="/exchanges" className="text-brass font-semibold">exchange</Link>{' '}
              to be the first.
            </p>
          </Card>
        ) : (
          <ReviewFeed items={items} />
        )}

        <Card className="p-4" as="section">
          <CardHead title="How this works" href="/methodology" hrefLabel="Method" />
          <dl>
            {FAQ.map((f) => (
              <div key={f.q} className="py-[10px] border-b border-line-2 last:border-b-0">
                <dt className="text-[13px] font-semibold">{f.q}</dt>
                <dd className="text-[12px] text-ink-2 leading-[1.8] mt-[5px]">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.75]">
            Reviews currently move {SCORED_KINDS.length} of the three rankings. Wrote one
            you want gone?{' '}
            <Link href="/reviews/withdraw" className="text-brass font-semibold">
              Withdraw it here
            </Link>
            .
          </p>
        </Card>
      </main>
      <Footer />

      <JsonLd graph={[breadcrumbLd(trail), faqLd(FAQ)]} />
    </>
  );
}
