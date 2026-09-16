import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RELEASES, releaseBySlug, scheduleNoun, utcDay, type CalendarEvent } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd, itemListLd } from '@/lib/seo';
import { calendarData } from '@/lib/calendar';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, CardHead, Tag } from '@/components/primitives';

type Params = { release: string };

export function generateStaticParams(): Params[] {
  return RELEASES.map((r) => ({ release: r.slug }));
}

export const revalidate = 21_600;
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

const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { release } = await params;
  const r = releaseBySlug(release);
  if (!r) return {};
  return pageMetadata({
    title: `${r.name} — ${scheduleNoun(r)} and times`,
    description:
      `Every scheduled ${r.name} date, taken from the ${r.publisher}’s own calendar. ` +
      `What it measures, when it lands, and the exact time where the publisher states one.`,
    path: `/calendar/${r.slug}`,
  });
}

export default async function ReleasePage({ params }: { params: Promise<Params> }) {
  const { release } = await params;
  const r = releaseBySlug(release);
  if (!r) notFound();

  const data = await calendarData();
  const today = utcDay(new Date());
  const mine = data.events.filter((e) => e.title === r.title);
  const upcoming = mine.filter((e) => e.date >= today);
  const past = mine.filter((e) => e.date < today).slice(-6).reverse();
  const next = upcoming[0];

  const sourceDown = data.down.find((d) =>
    (r.publisher === 'Bureau of Labor Statistics' && d.source === 'BLS') ||
    (r.publisher === 'Federal Reserve' && d.source === 'Federal Reserve') ||
    (r.publisher === 'European Central Bank' && d.source === 'ECB'));

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Economic calendar', path: '/calendar' },
    { name: r.name, path: `/calendar/${r.slug}` },
  ];

  const faq = [
    next && {
      q: `When is the next ${r.name}?`,
      a: `${longDate(next.date)}${next.localTime ? `, at ${next.localTime}` : ''}. ` +
        (next.localTime
          ? `The ${r.publisher} publishes both the date and the time.`
          : `The ${r.publisher} publishes the date but not a release time, so none is shown here.`),
    },
    {
      q: `What does the ${r.name} measure?`,
      a: r.what,
    },
    {
      q: 'Where do these dates come from?',
      a: `Directly from the ${r.publisher}’s own published calendar, re-read every six hours. Nothing is copied from another calendar site and no date is inferred from a pattern.`,
    },
  ].filter((x): x is { q: string; a: string } => Boolean(x));

  return (
    <>
      <Header active="/calendar" />
      <main id="main" className="shell pt-0 pb-6 sm:pt-3 lg:pb-10 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
        <Breadcrumbs trail={trail} />

        <header className="gutter">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.22] tracking-[-0.02em] text-balance">
            {r.name} {scheduleNoun(r)}
          </h1>
          <p className="text-[13.5px] text-ink-2 leading-[1.75] mt-2 max-w-[48ch]">{r.what}</p>
        </header>

        {sourceDown ? (
          <Card className="p-4 lg:p-6 bg-warn-bg shadow-none border border-[#F3E3C2]" as="section">
            <h2 className="text-[13.5px] font-bold text-warn mb-[6px]">
              The {sourceDown.source} calendar could not be read
            </h2>
            <p className="text-[12px] text-[#8A6420] leading-[1.8]">
              {sourceDown.reason}. No dates are shown rather than dates we could not
              confirm —{' '}
              <a href={r.publisherUrl} rel="nofollow noopener external" target="_blank" className="underline">
                check the publisher directly
              </a>
              .
            </p>
          </Card>
        ) : next ? (
          <Card className="p-4 lg:p-6 border-[1.5px] border-brass shadow-none" as="section">
            <p className="text-[11.5px] text-ink-3 mb-1">
              {r.kind === 'decision' ? 'Next meeting' : 'Next release'}
            </p>
            <p className="font-[family-name:var(--font-display)] text-[21px] font-bold leading-[1.3]">
              {longDate(next.date)}
            </p>
            <p className="text-[13px] text-ink-2 mt-[5px] tnum">
              {next.localTime ? (
                <>
                  {next.localTime}
                  {next.at && <span className="text-ink-3"> · {next.at.slice(11, 16)} UTC</span>}
                </>
              ) : (
                <span className="text-ink-3">
                  The {r.publisher} publishes no release time on its calendar, so none is shown.
                </span>
              )}
            </p>
            {next.detail && <p className="text-[11.5px] text-ink-3 mt-2 leading-[1.7]">{next.detail}</p>}
          </Card>
        ) : (
          <Card className="p-4 lg:p-6" as="section">
            <p className="text-[12.5px] text-ink-2 leading-[1.8]">
              The {r.publisher} has not yet published a forward date for this.
            </p>
          </Card>
        )}

        <Card className="p-4 lg:p-6" as="section">
          <CardHead title="Why it matters" />
          <p className="text-[12.5px] text-ink-2 leading-[1.85]">{r.why}</p>
          <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.75]">
            That is a description of how the market treats it, not a prediction and not a
            reason to trade it. Nothing on this site tells you what a release will say.
          </p>
        </Card>

        {upcoming.length > 1 && (
          <Card className="p-4 lg:p-6" as="section">
            <CardHead
              title="Scheduled dates"
              aside={<span className="text-[11.5px] text-ink-3 tnum">{upcoming.length} ahead</span>}
            />
            <Schedule events={upcoming} />
          </Card>
        )}

        {past.length > 0 && (
          <Card className="p-4 lg:p-6" as="section">
            <CardHead title={r.kind === 'decision' ? 'Recent meetings' : 'Recent releases'} />
            <Schedule events={past} />
            <p className="text-[11.5px] text-ink-3 mt-[10px] leading-[1.75]">
              Dates only. We do not publish the figures themselves — read them at{' '}
              <a href={r.publisherUrl} rel="nofollow noopener external" target="_blank" className="text-brass">
                {r.publisher}
              </a>
              , which is where they are authoritative.
            </p>
          </Card>
        )}

        <Card className="p-4 lg:p-6" as="section">
          <CardHead title="Common questions" />
          <dl>
            {faq.map((f) => (
              <div key={f.q} className="py-[10px] border-b border-line-2 last:border-b-0">
                <dt className="text-[13px] font-semibold">{f.q}</dt>
                <dd className="text-[12px] text-ink-2 leading-[1.8] mt-[5px]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-4 lg:p-6" as="section">
          <CardHead title="Other releases" href="/calendar" hrefLabel="Full calendar" />
          <ul className="flex flex-col">
            {RELEASES.filter((o) => o.slug !== r.slug).map((o) => (
              <li key={o.slug} className="border-b border-line-2 last:border-b-0">
                <Link href={`/calendar/${o.slug}`} className="flex items-center gap-3 py-[10px] group">
                  <span className="text-[13px] font-semibold flex-1 min-w-0 group-hover:text-brass">
                    {o.name}
                  </span>
                  <Tag tone={o.currency === 'USD' ? 'neutral' : 'brass'}>{o.currency}</Tag>
                  <span aria-hidden className="text-ink-3">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </main>
      <Footer />

      <JsonLd
        graph={[
          breadcrumbLd(trail),
          itemListLd(
            `${r.name} ${scheduleNoun(r)}`,
            upcoming.slice(0, 12).map((e) => ({ name: shortDate(e.date), path: `/calendar/${r.slug}` })),
          ),
          faqLd(faq),
        ]}
      />
    </>
  );
}

function Schedule({ events }: { events: CalendarEvent[] }) {
  return (
    <ul>
      {events.map((e) => (
        <li key={e.id} className="flex items-baseline gap-2 py-[9px] border-b border-line-2 last:border-b-0">
          <time dateTime={e.at ?? e.date} className="text-[13px] font-semibold tnum">
            {shortDate(e.date)}
          </time>
          <div className="flex-1" />
          {e.localTime ? (
            <span className="text-[12px] text-ink-2 tnum">{e.localTime}</span>
          ) : (
            <span className="text-[11px] text-ink-3">no time published</span>
          )}
        </li>
      ))}
    </ul>
  );
}
