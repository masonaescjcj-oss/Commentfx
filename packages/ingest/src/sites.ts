import { BROKERS, PROPS, EXCHANGES } from '@commentfx/core';

/**
 * Checks that every company site we link to still exists.
 *
 * The distinction that matters is the same one the register readers make:
 * a site that is **gone** is a fact about the company, and a site that merely
 * **refuses us** is a fact about our IP address. Trading venues sit behind
 * aggressive bot protection and answer a datacentre with 403 or 429 all day
 * while serving every real visitor perfectly, so treating that as a dead link
 * would fill the report with false alarms and train everyone to ignore it.
 *
 * Only 404, 410 and a name that does not resolve are reported as broken. This
 * found a real one on its first run: octafx.com answers 410 Gone, because the
 * company rebranded to Octa.
 */

export type SiteState = 'ok' | 'moved' | 'gone' | 'blocked' | 'unreachable';

export interface SiteCheck {
  slug: string;
  name: string;
  kind: 'broker' | 'prop' | 'exchange';
  website: string;
  state: SiteState;
  detail: string;
}

const UA = 'Mozilla/5.0 (compatible; CommentFX/0.1; +https://commentfx.com)';

async function checkOne(url: string): Promise<{ state: SiteState; detail: string }> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html' },
      signal: AbortSignal.timeout(20_000),
    });

    if (res.status === 404 || res.status === 410) {
      return { state: 'gone', detail: `HTTP ${res.status} — the company no longer serves this address` };
    }
    if (res.status === 403 || res.status === 429) {
      return { state: 'blocked', detail: `HTTP ${res.status} — bot protection, not a dead link` };
    }
    if (res.status >= 500) {
      return { state: 'unreachable', detail: `HTTP ${res.status}` };
    }
    // A link that works but lands somewhere else is usually a rebrand. It is
    // not broken, so it does not fail the run, but the URL we hold is stale
    // and the record behind it probably is too.
    const landed = new URL(res.url);
    if (landed.hostname !== new URL(url).hostname) {
      return { state: 'moved', detail: `redirects to ${landed.origin}` };
    }
    return { state: 'ok', detail: `HTTP ${res.status}` };
  } catch (err) {
    const reason = err instanceof Error && err.name === 'TimeoutError' ? 'timeout' : 'connection failed';
    return { state: 'unreachable', detail: reason };
  }
}

export async function checkSites(): Promise<SiteCheck[]> {
  const records: Array<Omit<SiteCheck, 'state' | 'detail'>> = [
    ...BROKERS.map((b) => ({ slug: b.slug, name: b.name, kind: 'broker' as const, website: b.website })),
    ...PROPS.map((p) => ({ slug: p.slug, name: p.name, kind: 'prop' as const, website: p.website })),
    ...EXCHANGES.map((e) => ({ slug: e.slug, name: e.name, kind: 'exchange' as const, website: e.website })),
  ];

  const out: SiteCheck[] = [];
  // Sequential and unhurried: this runs once a day against two dozen companies,
  // and hammering them in parallel is exactly the behaviour their bot
  // protection exists to stop.
  for (const r of records) {
    out.push({ ...r, ...(await checkOne(r.website)) });
  }
  return out;
}
