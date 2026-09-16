import { safeText, type Fetched } from './fetch.ts';

/**
 * Crypto headlines, read from the publishers themselves.
 *
 * Every aggregator with a news API wants a key, and the free tiers of the ones
 * that do not are the sort that disappear. A newsroom's own RSS feed is offered
 * for exactly this, costs nothing, needs no account, and has one property no
 * aggregator has: the byline on our page is the masthead that actually wrote
 * the story, so a reader can see who to trust before they click.
 *
 * Nothing here is rewritten or summarised. Headline, publisher, time, and a
 * link straight out to the article — we are a signpost, not a copy of a
 * newspaper.
 */
export interface NewsSource {
  /** The publisher's name, as it appears on our page. */
  name: string;
  feed: string;
  /** Where a reader lands if they click the publisher rather than the story. */
  site: string;
}

export const NEWS_SOURCES: NewsSource[] = [
  { name: 'CoinDesk', feed: 'https://www.coindesk.com/arc/outboundfeeds/rss/', site: 'https://www.coindesk.com/' },
  { name: 'Decrypt', feed: 'https://decrypt.co/feed', site: 'https://decrypt.co/' },
  { name: 'The Block', feed: 'https://www.theblock.co/rss.xml', site: 'https://www.theblock.co/' },
  { name: 'Cointelegraph', feed: 'https://cointelegraph.com/rss', site: 'https://cointelegraph.com/' },
];

/**
 * The image hosts these four publishers actually serve from, and the only ones
 * a thumbnail may come from.
 *
 * This exists because the site runs a content security policy with an explicit
 * img-src allowlist. Without the filter the two could disagree — a publisher
 * moves CDN, the feed points somewhere new, and the browser refuses the picture
 * while the markup still asks for it, which is a console error and a broken
 * square rather than the sized empty box the layout is built to survive. Drop
 * it here and the page degrades the way it was designed to.
 *
 * news.test.ts asserts that next.config.ts's img-src carries every host below,
 * so adding a publisher cannot silently ship a card of broken pictures.
 */
export const NEWS_IMAGE_HOSTS = [
  'cdn.sanity.io',        // CoinDesk
  'cdn.decrypt.co',       // Decrypt
  'img.decrypt.co',       // Decrypt, through their resizing proxy
  'www.tbstat.com',       // The Block
  's3-images.ctmedia.io', // Cointelegraph
];

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  /** ISO string, or null where the feed gave no usable date. */
  publishedAt: string | null;
  image: string | null;
}

/** `<![CDATA[x]]>` or plain text, then the five XML entities, then whitespace. */
function text(raw: string | undefined): string {
  if (!raw) return '';
  const inner = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(raw);
  return (inner?.[1] ?? raw)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const tag = (item: string, name: string): string | undefined =>
  new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i').exec(item)?.[1];

const attr = (item: string, pattern: RegExp): string | undefined => pattern.exec(item)?.[1];

/**
 * The picture, from wherever this particular feed puts it. The four we read use
 * three different conventions between them and one of them uses two, so this
 * tries each in the order of how much the feed meant it: a media:content or an
 * enclosure is a declared image for the item, an <img> inside the description is
 * the article's own lead picture, which is the same thing said less formally.
 */
function image(item: string): string | null {
  const url =
    attr(item, /<media:content[^>]*\burl="([^"]+)"/i) ??
    attr(item, /<media:thumbnail[^>]*\burl="([^"]+)"/i) ??
    attr(item, /<enclosure[^>]*\burl="([^"]+)"[^>]*type="image\//i) ??
    attr(item, /<enclosure[^>]*type="image\/[^"]*"[^>]*\burl="([^"]+)"/i) ??
    attr(item, /<img[^>]*\bsrc=["']([^"']+)["']/i);
  if (!url) return null;
  const clean = text(url);
  // Only over TLS, and only from a host the page's own policy admits. Both
  // rejections are the same shape: no picture, and a headline that still works.
  if (!clean.startsWith('https://')) return null;
  try {
    return NEWS_IMAGE_HOSTS.includes(new URL(clean).host) ? clean : null;
  } catch {
    return null;
  }
}

function date(raw: string | undefined): string | null {
  const s = text(raw);
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

/**
 * One feed's XML to items. Pure, and regex rather than an XML parser on purpose:
 * this reads four known feeds, adding a dependency to walk a tree we do not use
 * would be the larger risk, and anything malformed here produces fewer items
 * rather than an exception.
 */
export function parseRss(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  for (const m of xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)) {
    const item = m[1] ?? '';
    const title = text(tag(item, 'title'));
    // Atom-style feeds put the URL in an attribute; RSS puts it in the element.
    const url = text(tag(item, 'link')) || attr(item, /<link[^>]*\bhref="([^"]+)"/i) || '';
    if (!title || !url.startsWith('https://')) continue;
    items.push({
      title,
      url,
      source,
      publishedAt: date(tag(item, 'pubDate')) ?? date(tag(item, 'published')) ?? date(tag(item, 'dc:date')),
      image: image(item),
    });
  }
  return items;
}

/**
 * Interleaves the sources so one prolific newsroom cannot own the whole card.
 *
 * Sorting purely by time looks right and is not: Cointelegraph publishes more
 * often than the other three together, so a plain sort gives a card that is all
 * Cointelegraph most of the day. This takes the newest unused story from each
 * source in turn, which keeps it recent AND keeps four mastheads visible.
 */
export function interleave(bySource: NewsItem[][], limit: number): NewsItem[] {
  const queues = bySource.map((list) =>
    [...list].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')),
  );
  const out: NewsItem[] = [];
  const seen = new Set<string>();
  for (let round = 0; out.length < limit && round < 50; round++) {
    let tookAny = false;
    for (const q of queues) {
      const next = q[round];
      if (!next || seen.has(next.url)) continue;
      seen.add(next.url);
      out.push(next);
      tookAny = true;
      if (out.length === limit) break;
    }
    if (!tookAny) break;
  }
  return out;
}

/**
 * Every feed, in parallel, with a failure on one costing only that publisher.
 * The whole call fails only when nothing answered at all — that is the case the
 * page has an honest empty state for.
 */
export async function fetchNews(limit = 8): Promise<Fetched<NewsItem[]>> {
  const results = await Promise.all(
    NEWS_SOURCES.map(async (s) => {
      const res = await safeText(s.feed, { revalidate: 900 });
      return res.ok ? parseRss(res.data, s.name) : [];
    }),
  );
  const items = interleave(results, limit);
  return items.length > 0
    ? { ok: true, data: items, at: new Date().toISOString() }
    : { ok: false, reason: 'no feed answered' };
}
