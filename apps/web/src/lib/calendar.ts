import 'server-only';
import { fetchCalendars, type CalendarResult } from '@commentfx/ingest';
import { weekStart, addDays, utcDay, type CalendarEvent } from '@commentfx/core';

export interface CalendarData {
  events: CalendarEvent[];
  /** Sources that answered, and sources that did not, with the reason. */
  live: Array<{ source: string; sourceUrl: string; count: number }>;
  down: Array<{ source: string; sourceUrl: string; reason: string }>;
  fetchedAt: string;
}

/**
 * Merges the three official calendars into one list. A source that failed is
 * carried through as a named gap rather than dropped, because a calendar
 * missing the ECB looks exactly like a fortnight with no euro events, and a
 * reader planning around it would never know the difference.
 */
export async function calendarData(): Promise<CalendarData> {
  const results: CalendarResult[] = await fetchCalendars();
  const events: CalendarEvent[] = [];
  const live: CalendarData['live'] = [];
  const down: CalendarData['down'] = [];

  for (const r of results) {
    if (r.ok) {
      events.push(...r.events);
      live.push({ source: r.source, sourceUrl: r.sourceUrl, count: r.events.length });
    } else {
      console.error(`[calendar] ${r.source} unavailable: ${r.reason}`);
      down.push({ source: r.source, sourceUrl: r.sourceUrl, reason: r.reason });
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date) || (a.at ?? '9').localeCompare(b.at ?? '9'));
  return { events, live, down, fetchedAt: new Date().toISOString() };
}

/** The fortnight the page shows: this week and next, Monday to Sunday. */
export function window14(now = new Date()) {
  const from = weekStart(now);
  return { from, to: addDays(from, 13), fromDay: utcDay(from), toDay: utcDay(addDays(from, 13)) };
}

export function inWindow(events: CalendarEvent[], fromDay: string, toDay: string) {
  return events.filter((e) => e.date >= fromDay && e.date <= toDay);
}

/** The next few things worth planning around, whenever they are. */
export function upcomingHigh(events: CalendarEvent[], fromDay: string, limit = 6) {
  return events.filter((e) => e.impact === 'high' && e.date >= fromDay).slice(0, limit);
}
