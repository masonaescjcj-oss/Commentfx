/**
 * The economic calendar.
 *
 * Every date here comes from the institution that sets it — the BLS release
 * schedule, the Fed's own FOMC calendar, the ECB's meeting calendar. Nothing is
 * inferred from a pattern and nothing is copied from another calendar site. A
 * release time is published only where the source states one: the BLS gives
 * exact times, the Fed and the ECB publish dates without them, and inventing
 * "14:00, probably" for the ones that do not would be the most quietly harmful
 * thing on the site.
 */

export type Impact = 'high' | 'medium' | 'low';

export interface CalendarEvent {
  /** Stable across refreshes: source, date and title decide it. */
  id: string;
  /** Calendar date in the source's own timezone, as YYYY-MM-DD. */
  date: string;
  /** Exact instant, when the source publishes a time. Null means date-only. */
  at: string | null;
  /** Local time as the source states it, e.g. "08:30 ET". Null when date-only. */
  localTime: string | null;
  title: string;
  /** What the release covers, when the source says so ("for December 2025"). */
  detail: string | null;
  currency: 'USD' | 'EUR';
  source: 'BLS' | 'Federal Reserve' | 'ECB';
  sourceUrl: string;
  impact: Impact;
}

/**
 * Which releases move a currency enough to plan around. This is our judgement,
 * not the institution's — the BLS does not rank its own releases — so the rule
 * is published rather than applied quietly, and it is a list of names rather
 * than a model, because a list can be argued with.
 *
 * High: the two releases that reprice the dollar on their own, plus the two
 * rate decisions. Medium: releases that move it when they surprise. Everything
 * else is regional or backward-looking and sits at low.
 */
const HIGH = [
  'employment situation',
  'consumer price index',
  'rate decision',
];

const MEDIUM = [
  'producer price index',
  'job openings and labor turnover',
  'employment cost index',
  'import and export price indexes',
  'productivity and costs',
  'real earnings',
];

export function impactFor(title: string): Impact {
  const t = title.toLowerCase();
  if (HIGH.some((k) => t.includes(k))) return 'high';
  if (MEDIUM.some((k) => t.includes(k))) return 'medium';
  return 'low';
}

/** The published rule, so a reader can check the grading rather than trust it. */
export const IMPACT_RULE: Record<Impact, string[]> = {
  high: HIGH,
  medium: MEDIUM,
  low: ['everything else — regional, sectoral or backward-looking'],
};

export const IMPACT_LABEL: Record<Impact, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/**
 * Converts a wall-clock time in a named timezone to the exact instant.
 *
 * Done through Intl rather than a fixed offset because the whole point of these
 * timestamps is that 08:30 in Washington is a different UTC hour in January and
 * in July, and a trader in Tehran reading a one-hour-wrong NFP time is worse
 * served than one reading no time at all. Two passes settle the DST boundary
 * case where the first guess lands on the wrong side of a transition.
 */
export function zonedTimeToUtc(
  y: number, month: number, day: number, hour: number, minute: number, timeZone: string,
): Date {
  let utc = Date.UTC(y, month - 1, day, hour, minute);
  for (let i = 0; i < 2; i++) {
    const offset = zoneOffsetMs(new Date(utc), timeZone);
    const next = Date.UTC(y, month - 1, day, hour, minute) - offset;
    if (next === utc) break;
    utc = next;
  }
  return new Date(utc);
}

/** How far ahead of UTC the zone is, at this instant, in milliseconds. */
function zoneOffsetMs(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  const asUtc = Date.UTC(
    get('year'), get('month') - 1, get('day'),
    get('hour') % 24, get('minute'), get('second'),
  );
  return asUtc - at.getTime();
}

export const utcDay = (d: Date) => d.toISOString().slice(0, 10);

/** Monday of the week containing `from`, as a UTC date. */
export function weekStart(from: Date): Date {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const shift = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - shift);
  return d;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + n);
  return out;
}

export interface CalendarDay {
  date: string;
  events: CalendarEvent[];
}

/** Groups into consecutive days across a window, empty days included. */
export function groupByDay(events: CalendarEvent[], from: Date, days: number): CalendarDay[] {
  const out: CalendarDay[] = [];
  for (let i = 0; i < days; i++) {
    const date = utcDay(addDays(from, i));
    out.push({
      date,
      events: events
        .filter((e) => e.date === date)
        .sort((a, b) => (a.at ?? '9') .localeCompare(b.at ?? '9') || a.title.localeCompare(b.title)),
    });
  }
  return out;
}

export function eventId(source: string, date: string, title: string): string {
  return `${source}-${date}-${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90);
}
