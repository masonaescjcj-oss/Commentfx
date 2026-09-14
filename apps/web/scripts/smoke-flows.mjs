/**
 * Drives the writing flows through the real forms, in a real browser.
 *
 *   pnpm --filter @commentfx/web build && pnpm --filter @commentfx/web start &
 *   pnpm --filter @commentfx/web smoke
 *
 * This exists because of a bug no unit test could have caught. Every record
 * page had `dynamicParams = false`, and every write action calls
 * revalidatePath(). Purging a prerendered entry that Next is not allowed to
 * regenerate does not refresh it — it 404s it, permanently. Writing one review
 * took that broker's page off the site with `Internal: NoFallbackError`, and
 * the whole suite stayed green, because it is a property of the rendering
 * runtime rather than of our code. The only way to see it is to click the
 * button and then load the page.
 */
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE ?? 'http://127.0.0.1:3000';
const SLUG = 'eightcap';
const failures = [];

const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

/**
 * Revalidation is not instant and is not meant to be: a purge marks the entry
 * stale, the next request serves the stale copy and triggers the rebuild, and
 * the one after that is fresh. A reader who reloads sees it. A check that
 * looks once does not, which is a race in the check rather than a bug.
 */
async function settlesTo(page, path, text, present, tries = 20) {
  for (let i = 0; i < tries; i++) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    if ((await page.getByText(text).count() > 0) === present) return true;
    await page.waitForTimeout(500);
  }
  return false;
}
const appearsWithin = (page, path, text) => settlesTo(page, path, text, true);

const browser = await chromium.launch({ executablePath: process.env.SMOKE_CHROMIUM || undefined });
const page = await (await browser.newContext({ viewport: { width: 390, height: 900 } })).newPage();
page.on('pageerror', (e) => check('no uncaught page errors', false, String(e).split('\n')[0]));

// A unique topic per run, because one author may write once per company per
// topic per day and this script is its own author.
const TOPIC = ['withdrawals', 'execution', 'costs', 'support', 'platform', 'account-opening'][
  Math.floor(Math.random() * 6)
];
const MARK = `SMOKE-${Date.now()}`;
const BODY = `${MARK} Funded by card and withdrew two weeks later. The money arrived inside the window the broker publishes and nothing extra was asked for.`;

await page.goto(`${BASE}/brokers/${SLUG}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
check('the review form is on the broker page', await page.locator('textarea[name="body"]').count() > 0);

await page.getByRole('button', { name: '4 out of 5' }).click();
await page.locator('select[name="topic"]').selectOption(TOPIC);
await page.locator('textarea[name="body"]').fill(BODY);
await page.getByRole('button', { name: /Publish review/ }).click();

let code = null;
try {
  await page.waitForSelector('code', { timeout: 15_000 });
  code = (await page.locator('code').first().innerText()).trim();
} catch {
  const msg = await page.locator('[role="status"]').first().innerText().catch(() => '(none)');
  check('publishing a review succeeds', false, msg.trim());
}

if (code) {
  check('publishing a review returns a withdrawal code', /^\d+\./.test(code));
  check('the broker page still loads after revalidation',
    (await page.goto(`${BASE}/brokers/${SLUG}`, { waitUntil: 'domcontentloaded' }))?.status() === 200);
  check('the review reaches the broker page', await appearsWithin(page, `/brokers/${SLUG}`, MARK));
  check('the review reaches the site feed', await appearsWithin(page, '/reviews', MARK));

  await page.goto(`${BASE}/reviews/withdraw`, { waitUntil: 'domcontentloaded' });
  await page.locator('input[name="code"]').fill('999999.not-the-token');
  await page.getByRole('button', { name: /Withdraw/ }).click();
  await page.waitForTimeout(2000);
  const refused = (await page.locator('[role="status"]').first().innerText()).trim();
  check('a wrong withdrawal code is refused', /does not match/i.test(refused), refused);

  await page.locator('input[name="code"]').fill(code);
  await page.getByRole('button', { name: /Withdraw/ }).click();
  await page.waitForTimeout(2000);
  const done = (await page.locator('[role="status"]').first().innerText()).trim();
  check('the real withdrawal code works', /withdrawn/i.test(done), done);

  check('a withdrawn review leaves the feed', await settlesTo(page, '/reviews', MARK, false));
  check('a withdrawn review leaves the broker page',
    await settlesTo(page, `/brokers/${SLUG}`, MARK, false));
}

// Incident reporting, the other thing a reader can write.
await page.goto(`${BASE}/brokers/${SLUG}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);
// The report form is behind a toggle and uses radios, not a select.
const opener = page.getByRole('button', { name: /Having a problem/i }).first();
if (await opener.count() > 0) {
  await opener.click();
  await page.waitForTimeout(400);
  await page.locator('input[name="kind"][value="platform-down"]').check();
  await page.getByRole('button', { name: /^Send|Report$/i }).first().click();
  await page.waitForTimeout(2000);
  check('the broker page survives an incident report',
    (await page.goto(`${BASE}/brokers/${SLUG}`, { waitUntil: 'domcontentloaded' }))?.status() === 200);
  check('the status page still loads',
    (await page.goto(`${BASE}/status`, { waitUntil: 'domcontentloaded' }))?.status() === 200);
} else {
  check('the incident report form opens on the broker page', false);
}

await browser.close();

console.log('');
if (failures.length > 0) {
  console.log(`${failures.length} flow${failures.length > 1 ? 's' : ''} broken: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('Every writing flow works end to end.');
