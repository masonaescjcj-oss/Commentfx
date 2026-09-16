/**
 * Drives the site's own search, in a real browser.
 *
 *   pnpm --filter @commentfx/web build && pnpm --filter @commentfx/web start &
 *   pnpm --filter @commentfx/web smoke:search
 *
 * /search had never been driven by anything, and it was missing a hundred
 * pages. Searching "bitcoin" on a site that publishes a Bitcoin page returned
 * the /coins list and stopped there — the same root cause as the sitemap gap,
 * because coin ids only existed behind a fetch and the index is built
 * synchronously. Searching "nfp" — what a trader actually types — returned the
 * calendar index rather than the page about the release.
 *
 * So the first block below is coverage: one query per kind of page the site
 * publishes, asserting search can reach that kind at all. That is the check
 * that would have caught both.
 */
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE ?? 'http://127.0.0.1:3000';
const failures = [];

const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch({ executablePath: process.env.SMOKE_CHROMIUM || undefined });
const page = await (await browser.newContext({ viewport: { width: 390, height: 900 } })).newPage();
page.on('pageerror', (e) => check('no uncaught page errors', false, String(e).split('\n')[0]));

await page.goto(`${BASE}/search`, { waitUntil: 'domcontentloaded' });
const box = page.locator('input').first();
check('the search box is on the page', await box.count() > 0);

/** Every result link, minus the site logo's link home. */
async function results(query) {
  await box.fill('');
  await box.type(query, { delay: 8 });
  await page.waitForTimeout(300);
  return page.locator('main a[href^="/"]').evaluateAll((as) =>
    as.map((a) => a.getAttribute('href')).filter((h) => h && h !== '/' && h !== '/search'));
}

// ── Every kind of page the site publishes is findable ────────────────────────
const COVERAGE = [
  ['a broker', 'exness', '/brokers/'],
  ['a prop firm', 'ftmo', '/props/'],
  ['an exchange', 'kraken', '/exchanges/'],
  ['a coin', 'bitcoin', '/coins/'],
  ['a comparison', 'exness vs', '/compare/'],
  ['a shortlist', 'lowest', '/best/'],
  ['a release', 'jobs report', '/calendar/'],
  ['a guide', 'how to check', '/learn/'],
];
for (const [what, query, prefix] of COVERAGE) {
  const hits = await results(query);
  check(`search finds ${what}`, hits.some((h) => h.startsWith(prefix)),
    `"${query}" → ${hits.slice(0, 3).join(', ') || 'nothing'}`);
}

// ── What a trader actually types ─────────────────────────────────────────────
// Nobody searches "Employment Situation". The page that answers each of these
// is the release's own page, not the calendar index.
for (const [abbr, path] of [['nfp', '/calendar/us-jobs-report'], ['fomc', '/calendar/fed-rate-decision'], ['cpi', '/calendar/us-inflation-cpi']]) {
  const hits = await results(abbr);
  check(`"${abbr}" reaches ${path}`, hits.includes(path), hits.slice(0, 3).join(', ') || 'nothing');
}

// A ticker, not just a name.
const byTicker = await results('sol');
check('a ticker finds its coin', byTicker.includes('/coins/solana'), byTicker.slice(0, 3).join(', '));

// ── And it says so when it has nothing ───────────────────────────────────────
const none = await results('zzzzqqq');
check('nonsense matches nothing', none.length === 0, none.join(', '));
check('and the page says so', (await page.locator('main').innerText()).includes('Nothing matches'));

await browser.close();
console.log(failures.length ? `\n${failures.length} failed` : '\nSearch reaches every kind of page the site publishes.');
process.exit(failures.length ? 1 : 0);
