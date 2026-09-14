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
 * A dead status is not enough on its own either, and this is not hypothetical:
 * octafx.com answers **410 Gone and then serves its full homepage**, titled
 * "Octa: the leading broker for online trading". Reading only the status code
 * said the broker had vanished, and acting on that put an unrelated company's
 * address on a broker's record — the exact kind of wrong fact this site exists
 * to keep out. So a 404 or 410 is only believed when the body is genuinely
 * empty of a page.
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

/** A response that still carries a real page, whatever its status line says. */
function servesAPage(body: string): string | null {
  const title = /<title[^>]*>([^<]{2,160})<\/title>/i.exec(body)?.[1]?.trim();
  if (title && body.length > 2000) return title;
  return null;
}

/**
 * The whole judgement, separated from the fetch so it can be tested against
 * the responses that actually caused trouble rather than only against a live
 * internet that changes underneath.
 */
export function classifyResponse(
  status: number, body: string, movedHost: boolean, landedOrigin = '',
): { state: SiteState; detail: string } {
  if (status === 404 || status === 410) {
    const title = servesAPage(body);
    if (title) {
      return { state: 'ok', detail: `HTTP ${status} but still serving a page — "${title.slice(0, 60)}"` };
    }
    return { state: 'gone', detail: `HTTP ${status} and no page served` };
  }
  if (status === 403 || status === 429) {
    return { state: 'blocked', detail: `HTTP ${status} — bot protection, not a dead link` };
  }
  if (status >= 500) return { state: 'unreachable', detail: `HTTP ${status}` };

  // A link that works but lands somewhere else is not broken, so it does not
  // fail the run — but it is worth a look, and not always for the obvious
  // reason. icmarkets.com redirects this region to ic.com, which says in its
  // own footer that it is the Seychelles entity; that is not a rename, it is
  // the broker routing us to a different licence. Either way a person should
  // see it.
  if (movedHost) return { state: 'moved', detail: `redirects to ${landedOrigin}` };
  return { state: 'ok', detail: `HTTP ${status}` };
}

async function checkOne(url: string): Promise<{ state: SiteState; detail: string }> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html' },
      signal: AbortSignal.timeout(20_000),
    });

    const landed = new URL(res.url);
    const movedHost = landed.hostname !== new URL(url).hostname;
    // Only read the body where the answer depends on it.
    const body = res.status === 404 || res.status === 410
      ? await res.text().catch(() => '')
      : '';

    return classifyResponse(res.status, body, movedHost, landed.origin);
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
