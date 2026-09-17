/**
 * Drives the article editor end to end, in a real browser.
 *
 *   SMOKE_ADMIN_TOKEN=... pnpm --filter @commentfx/web smoke:articles
 *
 * Two things are being asserted and the second is the one that matters.
 *
 * The first is the obvious path: write an article, see it refused while it is
 * thin, see it saved once it is not, publish it, find it on the site and in the
 * sitemap, take it down again.
 *
 * The second is that opening an article that already exists and pressing save
 * changes nothing. The body is converted out of a structure and back into one,
 * and a format that could not carry some part of an article would drop it
 * silently — a list, a worked example, the closing paragraph — in a form that
 * looked like it had worked. The round trip is unit-tested over every published
 * article; this is the same claim through the actual screen.
 */
import { chromium } from 'playwright';
import { signInAdmin } from './lib/admin-session.mjs';

const BASE = process.env.SMOKE_BASE ?? 'http://127.0.0.1:3000';
const TOKEN = process.env.SMOKE_ADMIN_TOKEN ?? 'demo';
const EXISTING = 'check-a-broker-licence';
const SLUG = `smoke-guide-${Date.now().toString(36)}`;
const failures = [];

const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

async function settlesTo(page, path, text, present, tries = 40) {
  for (let i = 0; i < tries; i++) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    if ((await page.getByText(text).count() > 0) === present) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

const browser = await chromium.launch({ executablePath: process.env.SMOKE_CHROMIUM || undefined });
const { page } = await signInAdmin(browser, BASE, TOKEN);
page.on('pageerror', (e) => check('no uncaught page errors', false, String(e).split('\n')[0]));

/* ── opening an existing article must not damage it ────────────────── */

await page.goto(`${BASE}/admin/articles/${EXISTING}`, { waitUntil: 'domcontentloaded' });
const body = await page.locator('textarea[name="body"]').inputValue();
check('an existing article opens as text', body.includes('## '), `${body.length} characters`);
check('and its worked example survived the conversion', body.includes(':::'));
check('and its list survived it', /\n- |\n1\. /.test(body));

await page.getByRole('button', { name: /^Save$/ }).click();
await page.waitForTimeout(2000);
check('saving it unchanged stores nothing, because nothing changed',
  await page.getByText(/Nothing changed/).count() > 0,
  (await page.locator('[role="status"]').first().innerText().catch(() => '')).trim());

/* ── a thin article is refused ─────────────────────────────────────── */

await page.goto(`${BASE}/admin/articles/new`, { waitUntil: 'domcontentloaded' });
await page.locator('#article-slug').fill(SLUG);
await page.locator('input[name="title"]').fill('A smoke-test guide to nothing in particular');
await page.locator('input[name="heading"]').fill('A smoke-test guide');
await page.locator('textarea[name="description"]').fill(
  'A guide written by the smoke test to prove that the article editor refuses a thin page, accepts a complete one, '
  + 'and puts it on the site only when somebody publishes it.',
);
await page.locator('input[name="question"]').fill('Does the article editor actually work?');
await page.locator('textarea[name="answer"]').fill(
  'Yes, and it refuses an article that does not meet the rules before it refuses anything else about it.',
);
await page.locator('textarea[name="body"]').fill('## A heading\n\nOne short paragraph and nothing else.');
await page.getByRole('button', { name: /Create as draft/ }).click();
await page.waitForTimeout(2000);

check('a thin article is refused', await page.getByText(/not ready to publish/i).count() > 0);
check('and is told what is missing, in words',
  await page.getByText(/words/i).count() > 0 && await page.getByText(/worked example/i).count() > 0);

/**
 * And it still has what was typed.
 *
 * React resets an uncontrolled form once a form action returns, so the first
 * version of this editor threw the whole article away the moment a save was
 * refused for one wrong field — an hour's writing gone because a description
 * was 109 characters instead of 110. A form that punishes you for getting a
 * field wrong is a form people stop using, and the failure is invisible in
 * every test that navigates away after a refusal instead of looking.
 */
check('and a refused save does not throw away what was typed',
  (await page.locator('input[name=\"title\"]').inputValue()).startsWith('A smoke-test guide')
  && (await page.locator('textarea[name=\"body\"]').inputValue()).includes('One short paragraph'),
  await page.locator('input[name="title"]').inputValue());

/* ── a complete one is accepted ────────────────────────────────────── */

const para = (n) =>
  `Paragraph ${n} of a guide the smoke test wrote, long enough to be worth reading and long enough `
  + 'to carry the article past the five hundred word floor that stops a thin page competing with the '
  + 'record pages for the same query. It says nothing a reader could not work out, which is the point: '
  + 'the test is about the editor, not about the advice. Every sentence here exists to make the article '
  + 'the length a real one would be, and the rules the form enforces are the ones a real one has to meet.';

const BODY = [
  '## What this is',
  '',
  para(1),
  '',
  `Start from [the broker rankings](/brokers), then read [the prop firm rankings](/props) and `
  + '[the exchange rankings](/exchanges) before you decide anything.',
  '',
  '## What to check',
  '',
  para(2),
  '',
  '- The licence number, on the regulator’s own register',
  '- The company name on that register',
  '- Whether that company would open an account for you',
  '',
  '::: What a check costs you',
  'Time :: about five minutes',
  'Money :: nothing',
  'What it rules out :: a number that belongs to another company',
  '~ Every tier-1 regulator publishes a free register.',
  ':::',
  '',
  '## What it does not tell you',
  '',
  para(3),
  '',
  para(4),
  '',
  '---',
  '',
  para(5),
].join('\n');

const FAQ = [
  'Q: Does a licence mean my money is safe?',
  'A: No. It means a regulator can act, and it says nothing about execution, spreads or whether you will make money.',
  '',
  'Q: How often should I check?',
  'A: Once before you deposit, and again whenever the broker changes the entity you are with or you read something worrying.',
  '',
  'Q: What if the number is not on the register?',
  'A: Then it is not a licence, whatever the website says, and there is nothing further to weigh up about that broker.',
].join('\n');

await page.locator('textarea[name="body"]').fill(BODY);
await page.locator('textarea[name="faq"]').fill(FAQ);
await page.getByRole('button', { name: /Create as draft/ }).click();
await page.waitForTimeout(2500);

check('a complete article is accepted',
  await page.getByText(/Saved as a draft/).count() > 0,
  // On failure, say which rule it fell foul of rather than "it did not work".
  // The form puts each message under its own field, so that is where to read.
  (await page.locator('.text-down').allInnerTexts().catch(() => [])).join(' · ').slice(0, 300));

const drafted = await page.goto(`${BASE}/learn/${SLUG}`, { waitUntil: 'domcontentloaded' });
check('a draft article has no public page', drafted?.status() === 404, `HTTP ${drafted?.status()}`);

await page.goto(`${BASE}/admin/articles/${SLUG}`, { waitUntil: 'domcontentloaded' });
const controls = page.locator('form').filter({ has: page.getByRole('button', { name: 'Publish' }) });
await controls.getByRole('button', { name: 'Publish' }).click();
await page.waitForTimeout(2500);

check('publishing gives it a page', await settlesTo(page, `/learn/${SLUG}`, 'A smoke-test guide', true));
check('and its worked example renders', await page.getByText('What a check costs you').count() > 0);
check('and it is on the guides index', await settlesTo(page, '/learn', 'A smoke-test guide', true));

/**
 * And it is asked to be indexed. The sitemap is generated from the same merged
 * view the pages are, so an article that is live and missing from it is a page
 * nobody will find — polled, because like every other page here it is cached
 * and revalidated rather than rebuilt on the spot.
 */
let inMap = false;
for (let i = 0; i < 20 && !inMap; i++) {
  inMap = (await (await fetch(`${BASE}/sitemap.xml`)).text()).includes(`/learn/${SLUG}`);
  if (!inMap) await page.waitForTimeout(500);
}
check('and it is in the sitemap', inMap);

/* ── and away again ────────────────────────────────────────────────── */

await page.goto(`${BASE}/admin/articles/${SLUG}`, { waitUntil: 'domcontentloaded' });
page.once('dialog', (d) => d.accept());
const del = page.locator('form').filter({ has: page.getByRole('button', { name: 'Delete article' }) });
await del.getByRole('button', { name: 'Delete article' }).click();
await page.waitForTimeout(2500);

const gone = await page.goto(`${BASE}/learn/${SLUG}`, { waitUntil: 'domcontentloaded' });
check('deleting it takes the page with it', gone?.status() === 404, `HTTP ${gone?.status()}`);

await browser.close();

console.log('');
if (failures.length > 0) {
  console.log(`${failures.length} broken: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('The article editor works end to end.');
