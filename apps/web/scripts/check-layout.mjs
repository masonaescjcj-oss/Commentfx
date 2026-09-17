/**
 * Two ways a page can be the wrong shape, both reported by a reader before
 * anything here noticed.
 *
 *   pnpm --filter @commentfx/web build && pnpm --filter @commentfx/web check:layout
 *
 * **Wider than the screen.** One flex item that may not shrink makes the whole
 * document wider than the phone holding it, and the reader has to zoom out to
 * read any of it. The cause was a `shrink-0` on a value that turned out to be a
 * sentence rather than a figure; the class of cause is anything that cannot
 * wrap, so this measures the document rather than looking for the class.
 *
 * **A column reserved for nothing.** The record pages put a rail beside the
 * main column, and what goes in the rail is conditional — on a deployment with
 * no database the verification panel renders nothing, so 344px of emptiness sat
 * to the left of every prop and exchange page and the content read as though it
 * had slipped off its own centre.
 *
 * Both are invisible to the CLS budget, because nothing moved: the page was
 * simply the wrong shape from the first paint. And both are invisible to a
 * check that runs against a build made with a database, which is why this one
 * is meant to run against a build made without.
 */
import { chromium } from 'playwright';

const BASE = process.env.CHECK_BASE ?? 'http://127.0.0.1:3000';
const NARROW = [320, 390];
const WIDE = 1440;

const PAGES = ['/', '/brokers', '/props', '/exchanges', '/coins', '/status', '/reviews',
  '/learn', '/learn/check-a-broker-licence', '/brokers/exness', '/props/ftmo',
  '/exchanges/binance', '/exchanges/kraken', '/compare/exness-vs-ic-markets'];

const failures = [];
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch({ executablePath: process.env.CHECK_CHROMIUM || undefined });

/* ── nothing is wider than the screen ──────────────────────────────── */

for (const width of NARROW) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 } });
  const page = await ctx.newPage();
  const over = [];
  for (const path of PAGES) {
    const res = await page.goto(BASE + path, { waitUntil: 'load' });
    if (!res || res.status() >= 400) continue;
    await page.waitForTimeout(350);
    const r = await page.evaluate(() => {
      const doc = document.documentElement;
      if (doc.scrollWidth <= doc.clientWidth) return null;
      // Name the leaf that sticks out, because "something overflows" is not a
      // finding somebody can act on.
      let worst = null;
      for (const el of document.querySelectorAll('body *')) {
        if (el.children.length) continue;
        const b = el.getBoundingClientRect();
        if (b.width > 0 && b.right > doc.clientWidth + 1 && (!worst || b.right > worst.right)) {
          worst = { right: Math.round(b.right), text: (el.textContent || '').trim().slice(0, 40), cls: String(el.className).slice(0, 45) };
        }
      }
      return { scrollW: doc.scrollWidth, clientW: doc.clientWidth, worst };
    });
    if (r) over.push(`${path} ${r.scrollW}>${r.clientW}${r.worst ? ` — "${r.worst.text}" [${r.worst.cls}]` : ''}`);
  }
  check(`nothing is wider than a ${width}px screen`, over.length === 0, over.slice(0, 3).join(' · '));
  await ctx.close();
}

/* ── no column is reserved for nothing ─────────────────────────────── */

const ctx = await browser.newContext({ viewport: { width: WIDE, height: 900 } });
const page = await ctx.newPage();
const reserved = [];
for (const path of PAGES) {
  const res = await page.goto(BASE + path, { waitUntil: 'load' });
  if (!res || res.status() >= 400) continue;
  await page.waitForTimeout(350);
  const r = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('.split > *')) {
      const b = el.getBoundingClientRect();
      if (el.children.length === 0 && b.width > 1) out.push(Math.round(b.width));
    }
    return out;
  });
  if (r.length) reserved.push(`${path} holds ${r.join('px, ')}px of nothing`);
}
check(`no empty column takes width at ${WIDE}px`, reserved.length === 0, reserved.slice(0, 3).join(' · '));
await ctx.close();

await browser.close();

console.log('');
if (failures.length) {
  console.log(`${failures.length} broken: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('Every page fits its screen, and no column is reserved for nothing.');
