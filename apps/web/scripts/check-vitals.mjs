/**
 * Layout stability, measured rather than assumed.
 *
 *   pnpm --filter @commentfx/web build && pnpm --filter @commentfx/web start &
 *   pnpm --filter @commentfx/web check:vitals
 *
 * On Chrome's own Slow 4G profile with a 4× CPU throttle, which is a mid-range
 * phone on a bad connection and what a good part of this audience is on.
 *
 * It exists because the layout comment in layout.tsx said "no layout shift" and
 * that was not true. Three pages were over Google's 0.1 threshold — the home
 * page at 0.139 — and the cause took some finding: not the display font, which
 * is what I assumed, but the body one. Its metric-adjusted fallback matches
 * x-height and line box, and cannot match advance widths, so text wrapped
 * differently until Manrope arrived and then every card on the page jumped up.
 * The h1 lost a line, each broker's stat row went from two rows to one, the
 * footer lost 33px. A second into the visit, right as somebody starts reading.
 *
 * `font-display: optional` settles it: the fallback is used for the whole of a
 * slow first visit and never swapped mid-page, and the font is there from the
 * first paint on every visit after. CLS is 0.0000 everywhere now, and this is
 * what keeps it there.
 *
 * LCP is printed and never fails the run. It is genuinely noisy on a shared CI
 * runner, and a gate that cries wolf is worse than no gate.
 */
import { chromium } from 'playwright';

const BASE = process.env.CHECK_BASE ?? 'http://127.0.0.1:3000';
const BUDGET = 0.1;

/** One of every page shape that carries a lot of text or a long list. */
const PAGES = ['/', '/brokers', '/brokers/exness', '/props', '/exchanges', '/coins',
  '/coins/bitcoin', '/memecoins', '/calendar', '/reviews', '/search',
  '/compare/exness-vs-ic-markets', '/best/lowest-spread'];

const failures = [];
// CHECK_PROXY exists for sandboxes whose outbound traffic goes through one.
// Without it the third-party images — coin logos and news thumbnails — never
// load, and a CLS number measured with the pictures missing is the number for a
// page nobody sees. Unset in normal use.
const browser = await chromium.launch({
  executablePath: process.env.CHECK_CHROMIUM || undefined,
  ...(process.env.CHECK_PROXY
    ? { proxy: { server: process.env.CHECK_PROXY, bypass: '127.0.0.1,localhost' }, args: ['--ignore-certificate-errors'] }
    : {}),
});

for (const path of PAGES) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: 150, downloadThroughput: 200_000, uploadThroughput: 93_750,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.addInitScript(() => {
    window.__cls = 0;
    window.__worst = null;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__cls += e.value;
        if (!window.__worst || e.value > window.__worst.value) {
          const n = e.sources?.[0]?.node;
          window.__worst = {
            value: e.value,
            at: Math.round(e.startTime),
            what: n ? `<${n.tagName?.toLowerCase()}> ${(n.textContent ?? '').trim().slice(0, 40)}` : 'unknown',
          };
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
    window.__lcp = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });

  await page.goto(BASE + path, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const { cls, lcp, worst } = await page.evaluate(() => ({
    cls: window.__cls, lcp: Math.round(window.__lcp), worst: window.__worst,
  }));
  await ctx.close();

  const ok = cls <= BUDGET;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${path.padEnd(30)} CLS ${cls.toFixed(4)}   LCP ${lcp}ms`);
  if (!ok) {
    failures.push(path);
    if (worst) console.log(`        worst ${worst.value.toFixed(4)} at ${worst.at}ms — ${worst.what}`);
  }
}

await browser.close();
console.log(failures.length
  ? `\n${failures.length} page${failures.length > 1 ? 's' : ''} over the ${BUDGET} budget`
  : `\nEvery page shape stays under ${BUDGET}.`);
process.exit(failures.length ? 1 : 0);
