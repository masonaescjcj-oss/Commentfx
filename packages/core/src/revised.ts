import { profileFor } from './data/profiles.ts';
import { propProfileFor } from './data/prop-profiles.ts';
import { exchangeProfileFor } from './data/exchange-profiles.ts';

/**
 * The day a record page last changed, as far as anything on this site knows.
 *
 * This is what the sitemap's `lastmod` says, and until now it said "the moment
 * the sitemap was generated" for every record — regenerated hourly, so every
 * page on the site claimed to have changed within the hour, every hour. Google
 * reads lastmod only while it is "consistently and verifiably accurate", and a
 * map in which everything is always new is one it learns to skip. docs/SEO.md
 * §4.3 had it down as the thing to fix.
 *
 * A record's page is its data plus its research write-up, and neither moves on
 * a clock. The research carries the day a person read the sources (`checked`)
 * and, when the published text was corrected afterwards, the day of that
 * correction (`revised`). Git confirms nothing else touched a record later:
 * every edit to the record files falls on or before its research date, and the
 * one exception — the Coinbase correction of 18 September — is the one record
 * carrying `revised`.
 *
 * Null for a record nobody has researched, which the sitemap turns into no
 * lastmod at all. Absent is never wrong; a guessed date is.
 */
export type RecordKind = 'broker' | 'prop' | 'exchange';

export function recordRevised(kind: RecordKind, slug: string): string | null {
  const p =
    kind === 'broker' ? profileFor(slug)
    : kind === 'prop' ? propProfileFor(slug)
    : exchangeProfileFor(slug);
  if (!p) return null;
  return p.revised && p.revised > p.checked ? p.revised : p.checked;
}

/** The latest of several ISO days, or null if there are none. Lexical order is date order for YYYY-MM-DD. */
export function latestDay(days: Array<string | null | undefined>): string | null {
  const real = days.filter((d): d is string => typeof d === 'string' && d.length > 0);
  return real.length ? real.reduce((a, b) => (b > a ? b : a)) : null;
}
