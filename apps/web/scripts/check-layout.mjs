/**
 * Ways a page can be the wrong shape, each reported by a reader — or found
 * by a redesign — before anything here noticed.
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
 * **A box too small for what is in it.** The page fits the window, and one of
 * the cards on it does not fit its own contents: the record pages' section
 * tabs ran past the right edge of their bar at 1024px. Nothing is wider than
 * the screen, so the first check is silent; this one measures each piece of
 * text, each picture and each drawing against the bordered box around it.
 *
 * **A header stuck on the wrong colour.** The bar is blue while it stands on
 * the blue band at the top of a page and white once that band has gone past.
 * It read the band through a reference captured when the script first ran — and
 * a client-side navigation replaces the band, leaving that reference pointing
 * at a detached node whose box is all zeros, which reads as "gone past" for
 * ever. So the bar went white on the first scroll of every page after the first
 * and never came back.
 *
 * The first two are invisible to the CLS budget, because nothing moved: the
 * page was simply the wrong shape from the first paint. The third is invisible
 * to anything that loads one page at a time, because a fresh load is the one
 * case where the captured reference is correct. And the empty column is
 * invisible to a check that runs against a build made with a database, which is
 * why this is meant to run against a build made without.
 */
import { chromium } from 'playwright';

const BASE = process.env.CHECK_BASE ?? 'http://127.0.0.1:3000';
const NARROW = [320, 390];
const WIDE = 1440;

const PAGES = ['/', '/brokers', '/props', '/exchanges', '/coins', '/status', '/reviews',
  '/learn', '/learn/check-a-broker-licence', '/brokers/exness', '/props/ftmo',
  '/exchanges/binance', '/exchanges/kraken', '/compare/exness-vs-ic-markets', '/props/challenge-simulator',
  '/learn/static-and-trailing-drawdown', '/brokers/pepperstone', '/props/propology'];

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

/* ── nothing spills out of the box it is drawn in ──────────────────── */

/**
 * The page can fit the screen and one of its boxes still not fit its contents.
 * The record pages' section tabs did exactly that at 1024px: twelve labels with
 * an icon each ran forty pixels past the right edge of the bar they sit in,
 * while the document itself was no wider than the window, so the check above
 * had nothing to say. This measures every leaf against the nearest bordered
 * box around it, and leaves alone anything inside a box that clips or scrolls
 * on purpose.
 */
for (const width of [1024, WIDE]) {
  const bctx = await browser.newContext({ viewport: { width, height: 900 } });
  const bpage = await bctx.newPage();
  const spills = [];
  for (const path of PAGES) {
    const res = await bpage.goto(BASE + path, { waitUntil: 'load' });
    if (!res || res.status() >= 400) continue;
    await bpage.waitForTimeout(300);
    const r = await bpage.evaluate(() => {
      const bordered = (el) => {
        const cs = getComputedStyle(el);
        return parseFloat(cs.borderRightWidth) > 0 && parseFloat(cs.borderLeftWidth) > 0;
      };
      const clips = (el) => getComputedStyle(el).overflowX !== 'visible';
      // What gets measured: every element with nothing inside it, every <svg>
      // as one piece (its own overflow is hidden by default, so walking up from
      // inside one would always stop at "clipped"), and every run of text —
      // a label beside an icon lives in a text node, not in a leaf element,
      // and that is exactly the case that got through the first version.
      const pieces = [];
      for (const el of document.querySelectorAll('main *, header *')) {
        if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
        if (el.tagName.toLowerCase() === 'svg' || el.children.length === 0) {
          pieces.push({ rect: el.getBoundingClientRect(), from: el.parentElement, label: el.textContent || el.tagName });
        }
        if (el.children.length) {
          for (const n of el.childNodes) {
            if (n.nodeType !== 3 || !n.textContent.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(n);
            pieces.push({ rect: range.getBoundingClientRect(), from: el, label: n.textContent });
          }
        }
      }
      for (const { rect: lb, from, label } of pieces) {
        if (lb.width === 0 || lb.height === 0) continue;
        let box = null;
        let clipped = false;
        for (let el = from; el && el !== document.body; el = el.parentElement) {
          if (clips(el)) { clipped = true; break; }
          if (bordered(el)) { box = el; break; }
        }
        if (clipped || !box) continue;
        const bb = box.getBoundingClientRect();
        if (lb.right > bb.right + 1 || lb.left < bb.left - 1) {
          return `"${label.trim().slice(0, 30)}" ${Math.round(Math.max(lb.right - bb.right, bb.left - lb.left))}px outside [${String(box.className).slice(0, 40)}]`;
        }
      }
      return null;
    });
    if (r) spills.push(`${path} ${r}`);
  }
  check(`nothing spills out of its box at ${width}px`, spills.length === 0, spills.slice(0, 3).join(' · '));
  await bctx.close();
}

/* ── every picture says how big it is ──────────────────────────────── */

/**
 * An `<img>` with no width and height is zero pixels tall until the file lands,
 * and everything below it jumps down the moment it does. That is the shift a
 * reader is most likely to feel, because it happens under the thumb of somebody
 * already scrolling — and check-vitals cannot see it: the diagrams in an
 * article sit below the fold, finish arriving before the scroll gets there, and
 * CLS only counts what moves inside the viewport. Taking the attributes off
 * every figure in an article left that run at 0.0000.
 *
 * So this is checked statically instead, which is also the honest shape of the
 * rule: a picture on this site declares its size. A CSS `aspect-ratio` would
 * hold the space too, but only for the one shape it was written for, and it
 * lies about the next image that is not that shape.
 */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const unsized = [];
  const misdeclared = [];
  let seen = 0;
  for (const path of [...PAGES, '/learn/what-proof-of-reserves-proves', '/learn/static-and-trailing-drawdown', '/props/propology']) {
    const res = await page.goto(BASE + path, { waitUntil: 'load' });
    if (!res || res.status() >= 400) continue;
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter((i) => !i.getAttribute('width') || !i.getAttribute('height'))
        .map((i) => i.getAttribute('src') ?? '(no src)'));
    seen += await page.evaluate(() => document.querySelectorAll('img').length);
    for (const src of bad) unsized.push(`${src} on ${path}`);

    // Declared is not the same as right. An article figure's width and height
    // are typed into the data by hand, and a pair that disagrees with the file
    // reserves the wrong space: the box is laid out at one shape and snaps to
    // another when the picture lands. Lazy images are loaded first so their
    // real size is known.
    await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; }));
    await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
    const wrong = await page.evaluate(() =>
      [...document.querySelectorAll('img[width][height]')]
        .filter((i) => i.naturalWidth > 0)
        // A picture cropped into a box its CSS sets — the news thumbnails are
        // 64×64 squares cut from landscape files — reserves the box's shape on
        // purpose, and the file's shape cannot move it. Only a picture whose box
        // takes its shape from the declared size can be declared wrong.
        .filter((i) => !['cover', 'contain'].includes(getComputedStyle(i).objectFit))
        .filter((i) => {
          const declared = Number(i.getAttribute('width')) / Number(i.getAttribute('height'));
          const actual = i.naturalWidth / i.naturalHeight;
          return Math.abs(declared - actual) / actual > 0.01;
        })
        .map((i) => `${i.getAttribute('src')} says ${i.getAttribute('width')}×${i.getAttribute('height')}, is ${i.naturalWidth}×${i.naturalHeight}`));
    for (const w of wrong) misdeclared.push(`${w} on ${path}`);
  }
  await ctx.close();
  check('every picture declares its own size', unsized.length === 0,
    unsized.length ? unsized.slice(0, 5).join(' · ') : `${seen} checked`);
  check('and the size it declares is the shape it is', misdeclared.length === 0,
    misdeclared.slice(0, 5).join(' · '));
}

/* ── the header is the colour of what it is standing on ────────────── */

/**
 * Driven the way a reader does it: arrive, scroll, follow a link, scroll, come
 * back to the top. Every step of that matters — a fresh load of the second page
 * behaves correctly, which is exactly why this went unnoticed.
 */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const light = () => page.evaluate(() => document.documentElement.hasAttribute('data-chrome-light'));
  const wheel = async (by, times) => {
    for (let i = 0; i < times; i++) { await page.mouse.wheel(0, by); await page.waitForTimeout(50); }
    await page.waitForTimeout(500);
  };

  await page.goto(`${BASE}/brokers`, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  check('the header starts the colour of the band under it', (await light()) === false);

  await wheel(300, 10);
  check('and turns once the band has gone past', (await light()) === true);

  await page.getByRole('link', { name: /Pepperstone/ }).first().click();
  await page.waitForTimeout(1500);
  await wheel(250, 4);
  check('it turns again on the page you navigated to', (await light()) === true);

  await wheel(-300, 12);
  check('and turns back when you return to the top',
    (await light()) === false,
    'a reference to the previous page’s band would say it never came back');

  await ctx.close();
}

await browser.close();

console.log('');
if (failures.length) {
  console.log(`${failures.length} broken: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('Every page fits its screen, no column is reserved for nothing, every picture\nholds its own space, and the header knows what it is standing on.');
