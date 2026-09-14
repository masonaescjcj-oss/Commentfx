import Link from 'next/link';
import type { Metadata } from 'next';
import { THRESHOLD, WINDOW_HOURS, INCIDENT_LABELS } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd } from '@/lib/seo';
import { allStatus } from '@/lib/status';
import { rankedBrokers } from '@/lib/repo';
import { reviewStats } from '@/lib/reviews';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, CardHead, Logo, Tag } from '@/components/primitives';
import { StatusChip } from '@/components/StatusBlock';
import { Unavailable } from '@/components/Unavailable';

const TITLE = 'Broker status — is it down, or is it just you?';
const DESC =
  'Live incident reports for every broker we rank: withdrawal delays, platform ' +
  'outages and login failures, counted by distinct reporters over a rolling window.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/status' });

/** An incident signal is worthless stale, so this page is never cached. */
export const dynamic = 'force-dynamic';

const FAQ = [
  {
    q: 'How does a broker end up marked as having problems?',
    a: `By ${THRESHOLD.degraded} distinct people reporting one inside a rolling ${WINDOW_HOURS}-hour window, and ${THRESHOLD.down} for "widespread". Repeat reports from the same person count once, so no individual can move a broker's status, and the count and threshold are shown on every page so you can judge the signal yourself.`,
  },
  {
    q: 'Do you store my IP address?',
    a: 'No. Reports are counted by a salted digest of your network address and browser, and the salt is rotated every day. It exists to count distinct reporters and to stop one person reporting twice; it cannot be reversed to an address and cannot link your reports across days.',
  },
  {
    q: 'Does a report affect the broker’s score?',
    a: 'No. Incident reports are shown beside the score, never inside it. They are unverified by design — that is what makes them fast — and the score only moves on things a person checked against a primary source.',
  },
];

export default async function StatusPage() {
  const brokers = rankedBrokers(await reviewStats());
  const statuses = await allStatus(brokers.map((b) => b.broker.slug));
  const trail = [{ name: 'Home', path: '/' }, { name: 'Broker status', path: '/status' }];

  const byLevel = statuses
    ? brokers
        .map((b, i) => ({ b, s: statuses[i]! }))
        .sort((x, y) => y.s.reporters - x.s.reporters || x.b.rank - y.b.rank)
    : [];
  const affected = byLevel.filter((r) => r.s.level !== 'normal').length;

  return (
    <>
      <Header />
      <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
        <Breadcrumbs trail={trail} />
        <header className="px-1">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.22] tracking-[-0.02em] text-balance">
            Is it down, or is it just you?
          </h1>
          <p className="text-[13.5px] text-ink-2 leading-[1.75] mt-2 max-w-[48ch]">{DESC}</p>
          {statuses && (
            <p className="text-[11.5px] text-ink-3 mt-3">
              {affected === 0
                ? `No broker is above the reporting threshold right now.`
                : `${affected} broker${affected > 1 ? 's are' : ' is'} above the threshold.`}
              {' '}Rolling {WINDOW_HOURS}-hour window.
            </p>
          )}
        </header>

        {!statuses ? (
          <Unavailable what="Incident reporting" reason="no database configured on this deployment" />
        ) : (
          <Card className="px-4">
            {byLevel.map(({ b, s }) => (
              <article key={b.broker.slug} className="flex items-center gap-[11px] py-[13px] border-b border-line-2 last:border-b-0">
                <Logo {...b.broker.logo} size={34} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-[14px] font-semibold leading-tight">
                    <Link href={`/brokers/${b.broker.slug}`} className="hover:text-brass">{b.broker.name}</Link>
                  </h2>
                  <div className="mt-[3px]"><StatusChip status={s} /></div>
                  {s.leading && s.reporters > 0 && (
                    <p className="text-[11px] text-ink-3 mt-[3px]">Mostly: {INCIDENT_LABELS[s.leading].toLowerCase()}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[16px] font-extrabold tnum leading-none">{s.reporters}</p>
                  <p className="text-[10.5px] text-ink-3">reporters</p>
                </div>
              </article>
            ))}
          </Card>
        )}

        <Card className="p-4 bg-brass-bg shadow-none" as="section">
          <h2 className="text-[14px] font-bold text-brass-2 mb-[6px]">Reports are evidence, not a verdict</h2>
          <p className="text-[12.5px] text-ink-2 leading-[1.8]">
            Nothing here is verified — that is the point, it is what makes it fast. A
            quiet broker may still have a problem nobody has reported, and a noisy one
            may be having a bad hour rather than a bad week. The count, the window and
            the threshold are all published so you can weigh it yourself, and none of it
            touches the broker&rsquo;s score.
          </p>
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
      <JsonLd graph={[breadcrumbLd(trail), faqLd(FAQ)]} />
    </>
  );
}
