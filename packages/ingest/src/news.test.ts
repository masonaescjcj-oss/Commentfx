import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseRss, interleave, NEWS_SOURCES, NEWS_IMAGE_HOSTS, type NewsItem } from './news.ts';

/**
 * These fixtures are trimmed from the four real feeds. They are here because
 * each publisher writes RSS differently — CDATA or not, media:content or
 * enclosure or an <img> buried in the description — and the only way to know
 * the parser survives all four is to hold one of each.
 */
const COINDESK = `<rss><channel><item>
  <title><![CDATA[Fed meeting is shaping up to be a nightmare]]></title>
  <link>https://www.coindesk.com/markets/2026/09/16/fed-meeting</link>
  <media:content url="https://cdn.sanity.io/images/x/a.jpg?fm=jpg&amp;w=1920" type="image/*" medium="image"/>
  <guid isPermaLink="false">f52456fe</guid>
  <pubDate>Wed, 16 Sep 2026 06:42:22 +0000</pubDate>
</item></channel></rss>`;

const DECRYPT = `<rss><channel><item>
  <title>Wall Street Bets on Fed Rate Hike: Here&#39;s What It Means</title>
  <link>https://decrypt.co/378306/wall-street-fed-rate-hike</link>
  <pubDate>Tue, 15 Sep 2026 21:46:03 +0000</pubDate>
  <enclosure url="https://img.decrypt.co/insecure/rs:fill:1024:512/plain/https://cdn.decrypt.co/x/fed.jpg@png" length="1000000" type="image/png" />
</item></channel></rss>`;

const COINTELEGRAPH = `<rss><channel><item>
  <title>AI has been a &#x27;net negative&#x27; for crypto</title>
  <link><![CDATA[https://cointelegraph.com/news/ai-net-negative?utm_source=rss_feed]]></link>
  <pubDate>Wed, 16 Sep 2026 06:38:48 +0000</pubDate>
  <description><![CDATA[<p><img src="https://s3-images.ctmedia.io/media/ai-1.jpg" alt="AI"></p><p>Body text.</p>]]></description>
</item></channel></rss>`;

const THE_BLOCK = `<rss><channel><item>
  <title><![CDATA[Underdog sues Connecticut]]></title>
  <link>https://www.theblock.co/news/regulation/2026-09-16-underdog-415242</link>
  <media:content url="https://www.tbstat.com/wp/uploads/2026/01/pm.jpg" type="image/*" medium="image"/>
  <pubDate>Wed, 16 Sep 2026 07:08:26 +0000</pubDate>
</item></channel></rss>`;

test('a CDATA title and a media:content image are read', () => {
  const [a] = parseRss(COINDESK, 'CoinDesk');
  assert.ok(a);
  assert.equal(a.title, 'Fed meeting is shaping up to be a nightmare');
  assert.equal(a.url, 'https://www.coindesk.com/markets/2026/09/16/fed-meeting');
  assert.equal(a.source, 'CoinDesk');
  assert.equal(a.publishedAt, '2026-09-16T06:42:22.000Z');
  // The &amp; in the query string is an XML entity, not part of the URL.
  assert.equal(a.image, 'https://cdn.sanity.io/images/x/a.jpg?fm=jpg&w=1920');
});

test('a numeric entity in a plain title and an enclosure image are read', () => {
  const [a] = parseRss(DECRYPT, 'Decrypt');
  assert.ok(a);
  assert.equal(a.title, "Wall Street Bets on Fed Rate Hike: Here's What It Means");
  // Decrypt sends both this and a bare cdn.decrypt.co URL depending on the
  // item, so both hosts are allowed and this fixture holds the harder one.
  assert.equal(a.image, 'https://img.decrypt.co/insecure/rs:fill:1024:512/plain/https://cdn.decrypt.co/x/fed.jpg@png');
});

test('an image buried in an escaped description is still found', () => {
  const [a] = parseRss(COINTELEGRAPH, 'Cointelegraph');
  assert.ok(a);
  assert.equal(a.title, "AI has been a 'net negative' for crypto");
  assert.equal(a.image, 'https://s3-images.ctmedia.io/media/ai-1.jpg');
  // The link is CDATA-wrapped and carries the feed's own campaign parameters.
  assert.ok(a.url.startsWith('https://cointelegraph.com/news/ai-net-negative'));
});

test('a malformed feed yields fewer items rather than throwing', () => {
  assert.deepEqual(parseRss('', 'X'), []);
  assert.deepEqual(parseRss('<rss><channel></channel></rss>', 'X'), []);
  assert.deepEqual(parseRss('<item><title>No link</title></item>', 'X'), []);
  // An http:// link is dropped: the page is HTTPS, so it would be blocked.
  assert.deepEqual(parseRss('<item><title>T</title><link>http://x.test/a</link></item>', 'X'), []);
  // A document cut off mid-item keeps the items that did close.
  const partial = THE_BLOCK.replace('</channel></rss>', '<item><title>Truncated mid-');
  assert.equal(parseRss(partial, 'The Block').length, 1);
});

test('an http image is dropped, the item is not', () => {
  const insecure = `<item><title>T</title><link>https://x.test/a</link>
    <enclosure url="http://x.test/pic.jpg" type="image/jpeg"/></item>`;
  const [a] = parseRss(insecure, 'X');
  assert.ok(a);
  assert.equal(a.image, null);
});

const at = (title: string, source: string, iso: string): NewsItem =>
  ({ title, url: `https://x.test/${title}`, source, publishedAt: iso, image: null });

test('one prolific publisher cannot own the card', () => {
  // The case this exists for: Cointelegraph out-publishes the rest combined,
  // so a plain sort by time would return four Cointelegraph stories.
  const loud = Array.from({ length: 10 }, (_, i) =>
    at(`loud-${i}`, 'Cointelegraph', `2026-09-16T1${9 - i}:00:00.000Z`));
  const quiet = [at('quiet-0', 'CoinDesk', '2026-09-16T06:00:00.000Z')];

  const out = interleave([loud, quiet], 4);
  assert.equal(out.length, 4);
  assert.equal(out[0]?.source, 'Cointelegraph');
  assert.equal(out[1]?.source, 'CoinDesk', 'the quieter masthead gets the second slot');
  assert.equal(out.filter((i) => i.source === 'Cointelegraph').length, 3);
});

test('each source stays in its own newest-first order', () => {
  const a = [at('a-old', 'A', '2026-09-01T00:00:00.000Z'), at('a-new', 'A', '2026-09-09T00:00:00.000Z')];
  const out = interleave([a], 2);
  assert.deepEqual(out.map((i) => i.title), ['a-new', 'a-old']);
});

test('the same story from two feeds is listed once', () => {
  const same: NewsItem = at('dup', 'A', '2026-09-09T00:00:00.000Z');
  const out = interleave([[same], [{ ...same, source: 'B' }]], 5);
  assert.equal(out.length, 1);
});

test('asking for more than exists returns what exists', () => {
  const out = interleave([[at('only', 'A', '2026-09-09T00:00:00.000Z')], []], 8);
  assert.equal(out.length, 1);
});

test('every source names a publisher, an https feed and an https site', () => {
  for (const s of NEWS_SOURCES) {
    assert.ok(s.name.length > 0);
    assert.ok(s.feed.startsWith('https://'), s.feed);
    assert.ok(s.site.startsWith('https://'), s.site);
  }
  const names = new Set(NEWS_SOURCES.map((s) => s.name));
  assert.equal(names.size, NEWS_SOURCES.length, 'no publisher is listed twice');
});

test('an image from a host the page cannot display is dropped', () => {
  const stranger = `<item><title>T</title><link>https://x.test/a</link>
    <enclosure url="https://images.example.invalid/pic.jpg" type="image/jpeg"/></item>`;
  const [a] = parseRss(stranger, 'X');
  assert.ok(a, 'the headline survives');
  assert.equal(a.image, null);

  const nonsense = `<item><title>T</title><link>https://x.test/a</link>
    <media:content url="https://" type="image/*"/></item>`;
  assert.equal(parseRss(nonsense, 'X')[0]?.image, null, 'an unparseable URL does not throw');
});

test('every allowed image host is one the optimiser may fetch', () => {
  // Same reasoning as the CSP check below, and a harder failure: a host missing
  // from next.config.ts's remotePatterns does not degrade to a missing picture,
  // it throws while rendering and takes the page with it.
  const config = readFileSync(
    fileURLToPath(new URL('../../../apps/web/next.config.ts', import.meta.url)),
    'utf8',
  );
  const block = /remotePatterns:\s*\[[\s\S]*?\]/.exec(config)?.[0];
  assert.ok(block, 'next.config.ts still declares remotePatterns');
  for (const host of NEWS_IMAGE_HOSTS) {
    assert.ok(block.includes(`'${host}'`), `remotePatterns is missing ${host}`);
  }
});

test("every allowed image host is in the site's own img-src", () => {
  // The two live in different packages and nothing links them at build time, so
  // this is what stops one being edited without the other: add a publisher to
  // NEWS_IMAGE_HOSTS, forget the CSP, and the card ships broken squares.
  const config = readFileSync(
    fileURLToPath(new URL('../../../apps/web/next.config.ts', import.meta.url)),
    'utf8',
  );
  // The directive may be concatenated over several lines; every OTHER directive
  // in that array starts at two spaces and a quote, so that is where it ends.
  const imgSrc = /"img-src[\s\S]*?(?=\n {2}")/.exec(config)?.[0];
  assert.ok(imgSrc, 'next.config.ts still declares an img-src');
  assert.ok(!imgSrc.includes('font-src'), 'the match stopped at the next directive');
  for (const host of NEWS_IMAGE_HOSTS) {
    assert.ok(imgSrc.includes(`https://${host}`), `img-src is missing ${host}`);
  }
});
