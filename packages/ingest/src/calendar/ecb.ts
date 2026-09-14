import { eventId, impactFor, type CalendarEvent } from '@commentfx/core';
import type { NextRequestInit } from '../fetch.ts';
import { stripTags, type CalendarResult, type CalendarSource } from './types.ts';

const URL_ = 'https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html';

/**
 * The ECB publishes its Governing Council calendar as a definition list of
 * dd/mm/yyyy against a description. Only the rate-setting day is published
 * here: the Governing Council also meets on supervisory and administrative
 * business, and listing those as euro events would fill the calendar with days
 * on which nothing is decided about rates.
 *
 * The filter is written against "non-monetary policy meeting" explicitly,
 * because that phrase contains "monetary policy meeting" and a naive substring
 * match would publish exactly the meetings it means to exclude.
 */
export function parseEcb(htmlText: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const body = htmlText.slice(Math.max(0, htmlText.toLowerCase().indexOf('<main')));

  for (const row of body.matchAll(/<dt>(.*?)<\/dt>\s*<dd>(.*?)<\/dd>/gs)) {
    const raw = stripTags(row[1] ?? '');
    const text = stripTags(row[2] ?? '');
    const lower = text.toLowerCase();

    if (lower.includes('non-monetary')) continue;
    if (!lower.includes('monetary policy meeting')) continue;
    // Day 1 of a two-day meeting decides nothing; the rate and the press
    // conference both land on the second day.
    if (lower.includes('(day 1)')) continue;

    const d = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
    if (!d) continue;
    const date = `${d[3]}-${d[2]}-${d[1]}`;

    const title = 'ECB rate decision';

    events.push({
      id: eventId('ecb', date, 'rate decision'),
      date,
      at: null,
      localTime: null,
      title,
      detail:
        (lower.includes('press conference')
          ? 'Governing Council monetary policy meeting, followed by the press conference.'
          : 'Governing Council monetary policy meeting.') +
        ' The ECB does not publish a release time on this calendar.',
      currency: 'EUR',
      source: 'ECB',
      sourceUrl: URL_,
      impact: impactFor(title),
    });
  }

  return events;
}

export const ecb: CalendarSource = {
  source: 'ECB',
  name: 'European Central Bank',
  sourceUrl: URL_,

  async fetch(): Promise<CalendarResult> {
    const fetchedAt = new Date().toISOString();
    const fail = (reason: string): CalendarResult =>
      ({ ok: false, source: 'ECB', sourceUrl: URL_, reason, fetchedAt });

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

    const events = parseEcb(htmlText);
    // The calendar runs roughly eighteen months ahead and the Council sets
    // rates eight times a year, so a near-empty parse is a broken parse.
    if (events.length < 6) {
      return fail(`only ${events.length} meetings parsed — the page layout has changed`);
    }

    return { ok: true, source: 'ECB', sourceUrl: URL_, events, fetchedAt };
  },
};
