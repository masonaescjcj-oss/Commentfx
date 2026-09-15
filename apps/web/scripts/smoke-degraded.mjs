/**
 * Walks the site with every upstream it reads unreachable — the market APIs
 * and the three official calendars — which is the whole of what it fetches.
 *
 *   sudo tee -a /etc/hosts <<'EOF'
 *   127.0.0.1 api.coingecko.com
 *   127.0.0.1 api.geckoterminal.com
 *   127.0.0.1 api.gopluslabs.io
 *   127.0.0.1 www.bls.gov
 *   127.0.0.1 www.federalreserve.gov
 *   127.0.0.1 www.ecb.europa.eu
 *   EOF
 *   pnpm --filter @commentfx/web build && pnpm --filter @commentfx/web start &
 *   pnpm --filter @commentfx/web smoke:degraded
 *
 * The upstreams are broken before the build, not after, and that is the whole
 * design of this script. Next caches a successful fetch for the revalidate
 * window and prerenders the top coins at build time, so a site built with a
 * working network keeps serving real prices through the first minutes of an
 * outage — which is correct behaviour, and means a test run against it proves
 * nothing. Broken first, every page renders live against nothing, which is what
 * a deploy during an outage does and the strictest version of the question.
 *
 * The question being: the product claims a free API going quiet costs the
 * reader the numbers and nothing else. It was false. /coins/[slug] called
 * notFound() whenever CoinGecko did not answer, so a rate-limit — routine on a
 * free tier — took every coin page off the site, Bitcoin's included, and a
 * prerendered page that revalidated mid-outage had the 404 cached in its place.
 *
 * No product code knows this script exists. The upstreams are broken at the
 * host level, the way a real outage breaks them, and the first thing asserted
 * is that they really are broken: a degradation test that runs against a
 * working network passes every time and means nothing.
 */
const BASE = process.env.SMOKE_BASE ?? 'http://127.0.0.1:3000';
const UPSTREAMS = [
  'https://api.coingecko.com/api/v3/ping',
  'https://api.geckoterminal.com/api/v2/networks',
  'https://www.bls.gov/schedule/news_release/2026_sched.htm',
  'https://www.ecb.europa.eu/press/calendars/mgcgc/html/index.en.html',
];
const failures = [];

const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const text = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#x27;|&#39;/g, "'")
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

async function get(path) {
  const res = await fetch(BASE + path, { redirect: 'manual' });
  const html = await res.text();
  return { status: res.status, html, body: text(html) };
}

// ── The precondition, asserted rather than assumed ───────────────────────────
for (const url of UPSTREAMS) {
  let reachable = true;
  try { await fetch(url, { signal: AbortSignal.timeout(5000) }); } catch { reachable = false; }
  check(`upstream is unreachable: ${new URL(url).host}`, !reachable,
    reachable ? 'still answering — nothing below is a degradation test' : '');
}
if (failures.length) {
  console.error('\nPreconditions failed. Nothing below would mean anything, so it did not run.');
  process.exit(1);
}

// ── A coin page is a page, not a price ───────────────────────────────────────
const coin = await get('/coins/bitcoin');
check('a known coin is still a page', coin.status === 200, `HTTP ${coin.status}`);
check('it names the coin', coin.body.includes('Bitcoin'));
check('it says the data is missing', /is unavailable right now/.test(coin.body));
check('it keeps the part that does not need the feed', coin.body.includes('Where to trade BTC'));
check('it publishes no price', !/\$[\d.]/.test(coin.body), 'a number reached the page with no source behind it');
check('it claims no freshness', !coin.body.includes('Data from CoinGecko'));
check('it sends the reader to the source', coin.body.includes('Check Bitcoin on CoinGecko directly'));
check('it offers no FAQ answer it cannot fill', !coin.html.includes('"@type":"FAQPage"'));

const junk = await get('/coins/not-a-real-coin-9f2a');
check('an invented slug is still a 404', junk.status === 404, `HTTP ${junk.status}`);

// ── The lists ────────────────────────────────────────────────────────────────
const list = await get('/coins');
check('/coins serves', list.status === 200, `HTTP ${list.status}`);
check('/coins says the data is missing', /Market data is unavailable right now/.test(list.body));
const links = new Set(list.html.match(/href="\/coins\/[a-z0-9-]+"/g) ?? []);
check('/coins still links to the coins it covers', links.size >= 50, `${links.size} links`);
check('/coins quotes no price', !/\$[\d.]/.test(list.body));

const meme = await get('/memecoins');
check('/memecoins serves', meme.status === 200, `HTTP ${meme.status}`);
check('/memecoins says the radar is unavailable', /The radar is unavailable right now/.test(meme.body));
check('/memecoins scores no token it could not check', !/\/memecoins\/0x/.test(meme.html));

// ── The calendar, which had this right before the coin pages did ─────────────
// Its release pages key off checked-in data and report the source separately,
// which is the shape /coins/[slug] has only just been given. Asserted here so
// it stays that way.
const cal = await get('/calendar');
check('/calendar serves', cal.status === 200, `HTTP ${cal.status}`);
check('/calendar says the schedules could not be read', /calendars could not be read|economic calendar is unavailable right now/.test(cal.body));

const release = await get('/calendar/us-jobs-report');
check('a release page is still a page', release.status === 200, `HTTP ${release.status}`);
check('it says which calendar could not be read', /calendar could not be read/.test(release.body));
check('it sends the reader to the publisher', release.body.includes('check the publisher directly'));
check('it shows no date it could not confirm', release.body.includes('No dates are shown rather than dates we could not confirm'));
check('it keeps what it can explain without the feed', release.body.includes('Why it matters'));

// ── The rest of the site does not care ───────────────────────────────────────
for (const path of ['/', '/brokers', '/props', '/exchanges', '/reviews', '/status', '/methodology']) {
  const res = await get(path);
  check(`${path} is unaffected`, res.status === 200, `HTTP ${res.status}`);
}

console.log(failures.length ? `\n${failures.length} failed` : '\nall clear');
process.exit(failures.length ? 1 : 0);
