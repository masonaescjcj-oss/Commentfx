import type { CalendarEvent } from '@commentfx/core';

/**
 * One source's schedule. Same discipline as the regulator registers: a source
 * we could not read returns `unavailable` with the reason, never an empty
 * schedule, because a calendar showing no releases and a calendar we failed to
 * fetch look identical to a reader and mean opposite things.
 */
export type CalendarResult =
  | { ok: true; source: string; sourceUrl: string; events: CalendarEvent[]; fetchedAt: string }
  | { ok: false; source: string; sourceUrl: string; reason: string; fetchedAt: string };

export interface CalendarSource {
  source: string;
  name: string;
  sourceUrl: string;
  fetch(): Promise<CalendarResult>;
}

export const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

export const stripTags = (s: string) =>
  s.replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
