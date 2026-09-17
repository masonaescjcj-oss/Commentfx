import { chromium } from 'playwright';
const paths = ['/', '/brokers', '/props', '/exchanges', '/coins', '/memecoins', '/status',
  '/calendar', '/reviews', '/learn', '/methodology', '/search', '/best/lowest-spread',
  '/brokers/exness', '/props/ftmo', '/exchanges/binance', '/coins/bitcoin',
  '/compare/exness-vs-ic-markets', '/learn/check-a-broker-licence', '/nope-404'];
const browser = await chromium.launch({ executablePath: process.env.SMOKE_CHROMIUM });
const issues = [];
for (const width of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  for (const p of paths) {
    const res = await page.goto('http://127.0.0.1:3000' + p, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const doc = document.documentElement;
      const out = { overflow: doc.scrollWidth > doc.clientWidth, tiny: [], clipped: [], brokenImg: [], emptyCard: 0 };
      for (const img of document.images) if (img.complete && img.naturalWidth === 0) out.brokenImg.push(img.src.slice(-40));
      for (const el of document.querySelectorAll('body *')) {
        if (el.children.length) continue;
        const t = (el.textContent || '').trim();
        if (!t) continue;
        const cs = getComputedStyle(el);
        const size = parseFloat(cs.fontSize);
        if (size && size < 10.5) out.tiny.push(`${size}px "${t.slice(0, 25)}"`);
        // text cut off by a fixed height
        if (el.scrollHeight > el.clientHeight + 2 && cs.overflow === 'hidden') out.clipped.push(`"${t.slice(0, 25)}"`);
      }
      return out;
    });
    const bad = [];
    if (r.overflow) bad.push('overflow');
    if (r.brokenImg.length) bad.push(`broken images: ${r.brokenImg.slice(0,2).join(',')}`);
    if (r.tiny.length) bad.push(`text under 10.5px: ${[...new Set(r.tiny)].slice(0,2).join(' ')}`);
    if (r.clipped.length) bad.push(`clipped: ${[...new Set(r.clipped)].slice(0,2).join(' ')}`);
    if (bad.length) issues.push(`${width}px ${p} — ${bad.join(' | ')}`);
  }
  await ctx.close();
}
await browser.close();
console.log(issues.length ? issues.join('\n') : 'nothing found across ' + (paths.length * 2) + ' page loads');
