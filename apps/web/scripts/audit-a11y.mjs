/**
 * Runs axe against the built site on a phone-sized viewport.
 *
 *   pnpm --filter @commentfx/web build
 *   pnpm --filter @commentfx/web start &
 *   pnpm --filter @commentfx/web audit:a11y
 *
 * Exit 1 on any violation. This is not a formality: the first run found 20
 * distinct failing colour pairs, including body text at 2.2:1, because a
 * palette that looks restrained on a designer's monitor is unreadable on a
 * phone outdoors. Every token in globals.css now carries the ratio it clears
 * and the surface it clears it against, and this is what keeps them honest.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const BASE = process.env.AUDIT_BASE ?? 'http://127.0.0.1:3000';

/** One of every page shape, not every page: the templates are what differ. */
const DEFAULT_PAGES = [
  '/', '/brokers', '/brokers/exness', '/props', '/props/ftmo',
  '/exchanges', '/exchanges/kraken', '/coins', '/coins/bitcoin', '/memecoins',
  '/calendar', '/calendar/us-jobs-report', '/reviews', '/reviews/withdraw',
  '/search', '/status', '/methodology', '/best/lowest-spread',
  '/compare/exness-vs-ic-markets',
  // The page a reader gets for a coin or company we do not have. It answers 404
  // on purpose, so its expected status is stated rather than letting the guard
  // below read it as a page that failed to load.
  { path: '/a-url-this-site-does-not-have', status: 404 },
];

/**
 * A subset, for auditing a build whose shapes differ — the degraded run walks
 * the three market pages with their upstreams unreachable, and those carry copy
 * no other run renders.
 */
const PAGES = process.env.AUDIT_PAGES ? process.env.AUDIT_PAGES.split(',') : DEFAULT_PAGES;

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'];

// CI installs the browser Playwright expects. A sandbox that already ships one
// can point at it instead of downloading a second copy.
const executablePath = process.env.AUDIT_CHROMIUM || undefined;
const browser = await chromium.launch({ executablePath });
// A phone, because the design is mobile-first and that is where the contrast
// and the tap targets actually have to survive.
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const found = new Map();
let audited = 0;

for (const entry of PAGES) {
  const path = typeof entry === 'string' ? entry : entry.path;
  const expect = typeof entry === 'string' ? 200 : entry.status;
  let res;
  try {
    res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForTimeout(500);
  } catch (err) {
    console.log(`?? ${path} did not load: ${String(err).split('\n')[0]}`);
    continue;
  }
  if (!res || res.status() !== expect) {
    console.log(`?? ${path} answered ${res?.status()}, expected ${expect}`);
    continue;
  }
  audited++;

  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(
    async (tags) => await window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
    TAGS,
  );

  for (const v of result.violations) {
    const entry = found.get(v.id) ?? { impact: v.impact, help: v.help, pages: new Set(), samples: [] };
    entry.pages.add(path);
    for (const n of v.nodes) {
      if (entry.samples.length < 3) entry.samples.push(n.html.slice(0, 150));
    }
    found.set(v.id, entry);
  }
}

await browser.close();

const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const list = [...found.entries()].sort((a, b) => (order[a[1].impact] ?? 9) - (order[b[1].impact] ?? 9));

console.log(`\n${audited} of ${PAGES.length} pages audited against ${TAGS.join(', ')}`);

if (list.length === 0) {
  console.log('No violations.');
  if (audited < PAGES.length) {
    console.log('\nSome pages did not load, so this is not a clean bill of health.');
    process.exit(1);
  }
} else {
  console.log(`${list.length} distinct violations:\n`);
  for (const [id, v] of list) {
    console.log(`[${v.impact}] ${id} — ${v.help}`);
    console.log(`  on: ${[...v.pages].join(', ')}`);
    for (const s of v.samples) console.log(`  · ${s}`);
    console.log('');
  }
  process.exit(1);
}
