import { impactFor, eventId, zonedTimeToUtc, type CalendarEvent } from '@commentfx/core';
import type { NextRequestInit } from '../fetch.ts';
import { MONTHS, stripTags, type CalendarResult, type CalendarSource } from './types.ts';

const ZONE = 'America/New_York';
const URL_FOR = (year: number) => `https://www.bls.gov/schedule/${year}/home.htm`;

/**
 * The BLS publishes its whole release year as one table of date, time and
 * release name. It is the only one of the three sources that states a time, and
 * it states the zone on the page: "All times on calendar are Eastern Time".
 * That sentence is checked for on every fetch — if the BLS ever changes it, the
 * times we publish would silently shift by hours, so its absence fails the
 * fetch rather than being assumed away.
 */
export function parseBls(htmlText: string, year: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const rows = htmlText.split(/<tr\b/i).slice(1);

  for (const row of rows) {
    const date = /date-cell"[^>]*>\s*<p>(.*?)<\/p>/is.exec(row)?.[1];
    const time = /time-cell"[^>]*>\s*<p>(.*?)<\/p>/is.exec(row)?.[1];
    const desc = /desc-cell"[^>]*>\s*<p>(.*?)<\/p>/is.exec(row)?.[1];
    if (!date || !desc) continue;

    const d = /(\w+),\s*(\w+)\s+(\d{1,2}),\s*(\d{4})/.exec(stripTags(date));
    const month = d ? MONTHS[d[2]!.toLowerCase()] : undefined;
    if (!d || !month) continue;

    // A row with no time is a federal holiday, not a release. It is dropped
    // rather than shown, because the federal holiday list is not the market
    // holiday list -- Good Friday closes the exchanges and is not on it -- and
    // a half-right list of closures is worse than none.
    const t = /(\d{1,2}):(\d{2})\s*([AP])M/i.exec(stripTags(time ?? ''));
    if (!t) continue;

    const title = stripTags(/<strong>(.*?)<\/strong>/is.exec(desc)?.[1] ?? '');
    if (!title) continue;
    const detail = stripTags(desc.replace(/<strong>.*?<\/strong>/is, '')) || null;

    const hour12 = Number(t[1]);
    const hour = t[3]!.toUpperCase() === 'P' ? (hour12 % 12) + 12 : hour12 % 12;
    const day = Number(d[3]);
    const at = zonedTimeToUtc(year, month, day, hour, Number(t[2]), ZONE);
    const isoDay = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    events.push({
      id: eventId('bls', isoDay, title),
      date: isoDay,
      at: at.toISOString(),
      localTime: `${String(hour).padStart(2, '0')}:${t[2]} ET`,
      title,
      detail,
      currency: 'USD',
      source: 'BLS',
      sourceUrl: URL_FOR(year),
      impact: impactFor(title),
    });
  }

  return events;
}

export const bls: CalendarSource = {
  source: 'BLS',
  name: 'U.S. Bureau of Labor Statistics',
  sourceUrl: URL_FOR(new Date().getUTCFullYear()),

  async fetch(): Promise<CalendarResult> {
    const fetchedAt = new Date().toISOString();
    const year = new Date().getUTCFullYear();
    const sourceUrl = URL_FOR(year);
    const fail = (reason: string): CalendarResult => ({ ok: false, source: 'BLS', sourceUrl, reason, fetchedAt });

    let htmlText: string;
    try {
      const init: NextRequestInit = {
        headers: { 'user-agent': 'CommentFX/0.1 (+https://commentfx.com)' },
        signal: AbortSignal.timeout(20_000),
        next: { revalidate: 21_600 },
      };
      const res = await fetch(sourceUrl, init);
      if (!res.ok) return fail(`HTTP ${res.status}`);
      htmlText = await res.text();
    } catch (err) {
      return fail(err instanceof Error && err.name === 'TimeoutError' ? 'timeout' : 'network error');
    }

    if (!/all times on calendar are eastern time/i.test(htmlText)) {
      return fail('the page no longer states that its times are Eastern Time');
    }

    const events = parseBls(htmlText, year);
    if (events.length < 50) {
      return fail(`only ${events.length} releases parsed from a full year — the page layout has changed`);
    }

    return { ok: true, source: 'BLS', sourceUrl, events, fetchedAt };
  },
};
