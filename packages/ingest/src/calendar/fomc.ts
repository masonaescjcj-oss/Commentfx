import { eventId, impactFor, type CalendarEvent } from '@commentfx/core';
import type { NextRequestInit } from '../fetch.ts';
import { MONTHS, stripTags, type CalendarResult, type CalendarSource } from './types.ts';

const URL_ = 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm';

const monthNumber = (token: string): number | undefined => {
  const t = token.trim().toLowerCase();
  const exact = MONTHS[t];
  if (exact) return exact;
  const key = Object.keys(MONTHS).find((m) => m.startsWith(t.slice(0, 3)));
  return key ? MONTHS[key] : undefined;
};

/**
 * The Fed publishes its meeting calendar as a panel per year, each meeting a
 * month label and a day range: "27-28", "17-18*", or "Apr/May" with "30-1" when
 * a meeting straddles two months. The asterisk is the Fed's own mark for a
 * meeting that comes with a Summary of Economic Projections.
 *
 * Only the second day is published as an event, because that is the day the
 * decision lands. No time is attached: this calendar does not state one, and a
 * guessed release time on a rate decision is exactly the kind of number a
 * reader would plan around and be hurt by.
 */
export function parseFomc(htmlText: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const panel of htmlText.split(/panel panel-default/).slice(1)) {
    const year = Number(/>(\d{4}) FOMC Meetings/.exec(panel)?.[1]);
    if (!year) continue;

    const rows = panel.matchAll(
      /fomc-meeting__month[^>]*>(.*?)<\/div>.*?fomc-meeting__date[^>]*>(.*?)<\/div>/gs,
    );

    for (const row of rows) {
      const months = stripTags(row[1] ?? '').split('/');
      const raw = stripTags(row[2] ?? '');

      // A notation vote is a procedural poll, not a scheduled meeting, and has
      // no decision day to plan around. Only two-day meetings are published.
      const range = /^(\d{1,2})\s*[-–]\s*(\d{1,2})\*?$/.exec(raw);
      if (!range) continue;

      const firstMonth = monthNumber(months[0] ?? '');
      const lastMonth = monthNumber(months[months.length - 1] ?? '');
      if (!firstMonth || !lastMonth) continue;

      const day = Number(range[2]);
      const date = `${year}-${String(lastMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const startDay = Number(range[1]);
      const projections = raw.includes('*');
      const title = 'FOMC rate decision';

      events.push({
        id: eventId('fomc', date, 'rate decision'),
        date,
        at: null,
        localTime: null,
        title,
        detail:
          `Second day of the ${startDay}–${day} ${months.join('/')} meeting` +
          (projections ? ', with the Summary of Economic Projections.' : '.') +
          ' The Fed does not publish a release time on this calendar.',
        currency: 'USD',
        source: 'Federal Reserve',
        sourceUrl: URL_,
        impact: impactFor(title),
      });
    }
  }

  return events;
}

export const fomc: CalendarSource = {
  source: 'Federal Reserve',
  name: 'Federal Open Market Committee',
  sourceUrl: URL_,

  async fetch(): Promise<CalendarResult> {
    const fetchedAt = new Date().toISOString();
    const fail = (reason: string): CalendarResult =>
      ({ ok: false, source: 'Federal Reserve', sourceUrl: URL_, reason, fetchedAt });

    let htmlText: string;
    try {
      const init: NextRequestInit = {
        headers: { 'user-agent': 'CommentFX/0.1 (+https://commentfx.com)' },
        signal: AbortSignal.timeout(20_000),
        next: { revalidate: 21_600 },
      };
      const res = await fetch(URL_, init);
      if (!res.ok) return fail(`HTTP ${res.status}`);
      htmlText = await res.text();
    } catch (err) {
      return fail(err instanceof Error && err.name === 'TimeoutError' ? 'timeout' : 'network error');
    }

    const events = parseFomc(htmlText);
    // The committee holds eight scheduled meetings a year and the page carries
    // several years at once, so a handful of rows means the markup moved.
    if (events.length < 8) {
      return fail(`only ${events.length} meetings parsed — the page layout has changed`);
    }

    return { ok: true, source: 'Federal Reserve', sourceUrl: URL_, events, fetchedAt };
  },
};
