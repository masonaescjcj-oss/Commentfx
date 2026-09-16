import Link from 'next/link';
import type { Metadata } from 'next';
import { groupByDay, utcDay, IMPACT_RULE, IMPACT_LABEL, RELEASES } from '@commentfx/core';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd, itemListLd } from '@/lib/seo';
import { calendarData, window14, inWindow, upcomingHigh } from '@/lib/calendar';
import { Header, PageHero, Footer } from '@/components/chrome';
import { Faq } from '@/components/Faq';
import { Card, CardHead, Tag } from '@/components/primitives';
import { CalendarList } from '@/components/CalendarList';
import { Unavailable } from '@/components/Unavailable';

const TITLE = 'Economic calendar — release dates straight from the source';
const DESC =
  'US and euro-area data releases and rate decisions, taken from the BLS release ' +
  'schedule, the Fed’s own FOMC calendar and the ECB’s meeting calendar. Times are ' +
  'published only where the institution publishes one.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/calendar' });

/** Six hours: the schedules change rarely, and the page must not be stale on the day. */
export const revalidate = 21_600;

const dateText = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });

export default async function CalendarPage() {
  const data = await calendarData();
  const { from, fromDay, toDay } = window14();
  const today = utcDay(new Date());

  const fortnight = inWindow(data.events, fromDay, toDay);
  const days = groupByDay(fortnight, from, 14);
  const ahead = upcomingHigh(data.events, today);
  const trail = [{ name: 'Home', path: '/' }, { name: 'Economic calendar', path: '/calendar' }];

  const nextJobs = data.events.find((e) => e.title === 'Employment Situation' && e.date >= today);
  const nextCpi = data.events.find((e) => e.title === 'Consumer Price Index' && e.date >= today);
  const nextFomc = data.events.find((e) => e.title === 'FOMC rate decision' && e.date >= today);
  const nextEcb = data.events.find((e) => e.title === 'ECB rate decision' && e.date >= today);

  // Built only from dates that were actually fetched. A question with no answer
  // in the data is not asked.
  const faq = [
    nextJobs && {
      q: 'When is the next US jobs report?',
      a: `The Employment Situation report is released on ${dateText(nextJobs.date)} at ${nextJobs.localTime}. The date comes from the Bureau of Labor Statistics release schedule, which is set a year ahead.`,
    },
    nextCpi && {
      q: 'When is the next US inflation report?',
      a: `The Consumer Price Index for the preceding month is released on ${dateText(nextCpi.date)} at ${nextCpi.localTime}, from the same BLS schedule.`,
    },
    nextFomc && {
      q: 'When does the Fed next decide on rates?',
      a: `The next scheduled FOMC decision is ${dateText(nextFomc.date)}. The Fed publishes meeting dates but no release time on its calendar, so none is shown here.`,
    },
    nextEcb && {
      q: 'When does the ECB next decide on rates?',
      a: `The next Governing Council monetary policy meeting is ${dateText(nextEcb.date)}. The ECB publishes the date without a time, so none is shown here.`,
    },
    {
      q: 'Where do these dates come from?',
      a: 'Directly from the institutions that set them: the BLS release schedule, the Federal Reserve’s FOMC calendar and the ECB’s Governing Council calendar. Nothing is copied from another calendar site and nothing is inferred from a pattern — if a source cannot be read, this page says which one and links to it.',
    },
  ].filter((x): x is { q: string; a: string } => Boolean(x));

  return (
    <>
      <Header active="/calendar" />
      <main id="main" className="pb-6 lg:pb-10">
        <PageHero title="Economic calendar" trail={trail} />
        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
          {ahead.length > 0 && (
            <Card className="p-4 lg:p-6" as="section">
              <CardHead title="Next, worth planning around" />
              <ul className="flex flex-col">
                {ahead.map((e) => (
                  <li key={e.id} className="flex items-baseline gap-2 py-[8px] border-b border-line-2 last:border-b-0">
                    <span className="text-[12.5px] font-semibold flex-1 min-w-0">{e.title}</span>
                    <span className="text-[10.5px] font-bold text-ink-3">{e.currency}</span>
                    <time dateTime={e.at ?? e.date} className="text-[12px] tnum text-ink-2">
                      {new Date(`${e.date}T00:00:00Z`).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', timeZone: 'UTC',
                      })}
                      {e.localTime ? ` · ${e.localTime}` : ''}
                    </time>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {data.down.length > 0 && (
            <Card className="p-4 lg:p-6 bg-warn-bg shadow-none border border-[#F3E3C2]" as="section">
              <h2 className="text-[13.5px] font-bold text-warn mb-[6px]">
                {data.down.length} of {data.down.length + data.live.length} calendars could not be read
              </h2>
              <ul className="text-[12px] text-[#8A6420] leading-[1.8]">
                {data.down.map((d) => (
                  <li key={d.source}>
                    <strong>{d.source}</strong>: {d.reason} —{' '}
                    <a href={d.sourceUrl} rel="nofollow noopener external" target="_blank" className="underline">
                      check it directly
                    </a>
                    .
                  </li>
                ))}
              </ul>
              <p className="text-[11.5px] text-[#8A6420] mt-2 leading-[1.7]">
                The days below are missing whatever that source publishes. Nothing has been
                filled in from memory or from another calendar.
              </p>
            </Card>
          )}

          {data.live.length === 0 ? (
            <Unavailable what="The economic calendar" reason="no official schedule answered" />
          ) : (
            <CalendarList days={days} todayUtc={today} />
          )}

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Every date for one release" />
            <p className="text-[12px] text-ink-3 leading-[1.8] mb-[10px]">
              The releases worth a page of their own: the whole forward schedule, what each
              one measures, and the exact time where the publisher states one.
            </p>
            <ul className="flex flex-col">
              {RELEASES.map((r) => (
                <li key={r.slug} className="border-b border-line-2 last:border-b-0">
                  <Link href={`/calendar/${r.slug}`} className="flex items-center gap-3 py-[10px] group">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold group-hover:text-accent">{r.name}</span>
                      <span className="block text-[11.5px] text-ink-3 mt-[2px]">{r.publisher}</span>
                    </span>
                    <Tag tone={r.currency === 'USD' ? 'neutral' : 'accent'}>{r.currency}</Tag>
                    <span aria-hidden className="text-ink-3">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="How impact is graded" href="/methodology" hrefLabel="Method" />
            <p className="text-[12px] text-ink-3 leading-[1.8] mb-[10px]">
              The institutions do not rank their own releases, so this grading is ours. It is a
              list of names rather than a model, because a list can be argued with.
            </p>
            <dl>
              {(['high', 'medium', 'low'] as const).map((level) => (
                <div key={level} className="py-[8px] border-b border-line-2 last:border-b-0">
                  <dt className="text-[12.5px] font-bold">{IMPACT_LABEL[level]}</dt>
                  <dd className="text-[11.5px] text-ink-3 mt-[3px] leading-[1.7] capitalize">
                    {IMPACT_RULE[level].join(' · ')}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Sources" />
            <ul>
              {data.live.map((s) => (
                <li key={s.source} className="flex items-baseline gap-2 py-[8px] border-b border-line-2 last:border-b-0">
                  <a href={s.sourceUrl} rel="nofollow noopener external" target="_blank" className="text-[12.5px] font-semibold text-accent">
                    {s.source}
                  </a>
                  <div className="flex-1" />
                  <span className="text-[11.5px] text-ink-3 tnum">{s.count} dates</span>
                </li>
              ))}
            </ul>
            <p className="text-[11.5px] text-ink-3 mt-[10px] leading-[1.75]">
              Read{' '}
              <time dateTime={data.fetchedAt}>
                {new Date(data.fetchedAt).toUTCString().replace('GMT', 'UTC')}
              </time>
              . This page refreshes every six hours.
            </p>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Common questions" />
            <Faq items={faq} />
          </Card>

          <p className="text-[11.5px] text-ink-3 gutter leading-[1.8]">
            A calendar is not a signal. If you are choosing where to trade these releases,{' '}
            <Link href="/brokers" className="text-accent font-semibold">the broker rankings</Link>{' '}
            and <Link href="/status" className="text-accent font-semibold">broker status</Link> are
            the pages that matter.
          </p>
        </div>
      </main>
      <Footer />

      <JsonLd
        graph={[
          breadcrumbLd(trail),
          itemListLd(
            TITLE,
            ahead.map((e) => ({ name: `${e.title} — ${e.date}`, path: '/calendar' })),
          ),
          faqLd(faq),
        ]}
      />
    </>
  );
}
