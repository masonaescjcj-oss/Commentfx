import { fetchNews, type NewsItem } from '@commentfx/ingest';

export type { NewsItem };

/**
 * Headlines for the front page. Same contract as every other upstream here: it
 * never throws, and a failure is a state the page renders rather than an error
 * that takes the build down.
 *
 * Four newsrooms have to be quiet at once for this to return nothing, which is
 * the only case worth telling a reader about.
 */
export async function news(limit = 6): Promise<{ items: NewsItem[]; at: string } | { error: string }> {
  const res = await fetchNews(limit);
  return res.ok ? { items: res.data, at: res.at } : { error: res.reason };
}

/**
 * "3h ago" for anything inside a week, the date after that.
 *
 * Relative time is rendered on the server, so it is as old as the page's cache
 * — which for this card is fifteen minutes. That is close enough to be useful
 * and the reason the unit never goes below an hour: "2m ago" on a page cached
 * for fifteen would be a precise-looking lie.
 */
export function ago(iso: string | null, now = Date.now()): string {
  if (!iso) return '';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const hours = Math.floor((now - then) / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(then).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}
