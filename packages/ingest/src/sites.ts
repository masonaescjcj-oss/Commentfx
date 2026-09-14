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

export type SiteState = 'ok' | 'moved' | 'mismatch' | 'gone' | 'blocked' | 'unreachable';

export interface SiteCheck {
  slug: string;
  name: string;
  kind: 'broker' | 'prop' | 'exchange';
  website: string;
  state: SiteState;
  detail: string;
}

const UA = 'Mozilla/5.0 (compatible; CommentFX/0.1; +https://commentfx.com)';

const readable = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();

/** "IC Markets (EU) Ltd" -> ["ic","markets","eu"] — the words worth matching. */
const nameWords = (name: string) =>
  name
    .toLowerCase()
    .replace(/\b(ltd|limited|plc|inc|llc|l\.l\.c|pty|group|holdings|global|services|markets?|capital|trading|com)\b/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);

/**
 * Does this page look like it belongs to the company we think it does?
 *
 * A link can be perfectly alive and still be wrong, which is not hypothetical:
 * a broker's record on this site pointed at octa.com, which answers 200 and
 * sells tablet mounts. Liveness checking would have passed that forever.
 *
 * The test is deliberately generous — any distinctive word from the company's
 * name or from one of its legal entities is enough — because the cost of a
 * false alarm is someone re-checking a fine link, while the cost of missing one
 * is publishing a stranger's business as a broker's. A page with too little
 * text to judge is reported as unknown rather than accused.
 */
export function identifies(html: string, names: string[]): 'yes' | 'no' | 'unknown' {
  const text = readable(html);
  if (text.length < 400) return 'unknown';

  const words = new Set(names.flatMap(nameWords));
  if (words.size === 0) return 'unknown';
  for (const w of words) if (text.includes(w)) return 'yes';
  return 'no';
}

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
  status: number, body: string, movedHost: boolean, landedOrigin = '', names: string[] = [],
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

  // Alive is not the same as right.
  if (names.length > 0 && identifies(body, names) === 'no') {
    return {
      state: 'mismatch',
      detail: 'the page answers but never names this company or any of its legal entities',
    };
  }

  // A link that works but lands somewhere else is not broken, so it does not
  // fail the run — but it is worth a look, and not always for the obvious
  // reason. icmarkets.com redirects this region to ic.com, which says in its
  // own footer that it is the Seychelles entity; that is not a rename, it is
  // the broker routing us to a different licence. Either way a person should
  // see it.
  if (movedHost) return { state: 'moved', detail: `redirects to ${landedOrigin}` };
  return { state: 'ok', detail: `HTTP ${status}` };
}

async function checkOne(url: string, names: string[]): Promise<{ state: SiteState; detail: string }> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html' },
      signal: AbortSignal.timeout(20_000),
    });

    const landed = new URL(res.url);
    const movedHost = landed.hostname !== new URL(url).hostname;
    // Both the gone check and the identity check need the body now.
    const body = res.status < 400 || res.status === 404 || res.status === 410
      ? await res.text().catch(() => '')
      : '';

    return classifyResponse(res.status, body, movedHost, landed.origin, names);
  } catch (err) {
    const reason = err instanceof Error && err.name === 'TimeoutError' ? 'timeout' : 'connection failed';
    return { state: 'unreachable', detail: reason };
  }
}

export async function checkSites(): Promise<SiteCheck[]> {
  // The legal entity names go in alongside the brand: a broker's site often
  // leads with the brand and names the entity only in the footer, and either
  // one is proof enough that we are looking at the right company.
  const records: Array<Omit<SiteCheck, 'state' | 'detail'> & { names: string[] }> = [
    ...BROKERS.map((b) => ({
      slug: b.slug, name: b.name, kind: 'broker' as const, website: b.website,
      names: [b.name, b.slug, ...b.entities.map((e) => e.legalName)],
    })),
    ...PROPS.map((p) => ({
      slug: p.slug, name: p.name, kind: 'prop' as const, website: p.website,
      names: [p.name, p.slug],
    })),
    ...EXCHANGES.map((e) => ({
      slug: e.slug, name: e.name, kind: 'exchange' as const, website: e.website,
      names: [e.name, e.slug],
    })),
  ];

  const out: SiteCheck[] = [];
  // Sequential and unhurried: this runs once a day against two dozen companies,
  // and hammering them in parallel is exactly the behaviour their bot
  // protection exists to stop.
  for (const { names, ...r } of records) {
    out.push({ ...r, ...(await checkOne(r.website, names)) });
  }
  return out;
}
