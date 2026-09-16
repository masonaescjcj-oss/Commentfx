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
 * A published review reaches its pages on the very next request. The retries
 * below are slack for a slow machine, not a race being papered over — when
 * this looked flaky it was not revalidation at all, it was two database
 * handles (see the note on getDb).
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

// One author may write once per company per topic per day, and this script is
// its own author, so a re-run finds its earlier topics taken. Working through
// them until one is free keeps the run deterministic whatever the database
// already holds -- and exercises the duplicate refusal on the way.
const TOPICS = ['withdrawals', 'execution', 'costs', 'support', 'platform', 'account-opening'];
const MARK = `SMOKE-${Date.now()}`;
const BODY = `${MARK} Funded by card and withdrew two weeks later. The money arrived inside the window the broker publishes and nothing extra was asked for.`;

await page.goto(`${BASE}/brokers/${SLUG}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
check('the review form is on the broker page', await page.locator('textarea[name="body"]').count() > 0);

let code = null;
let lastMessage = '(never submitted)';
for (const topic of TOPICS) {
  await page.goto(`${BASE}/brokers/${SLUG}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: '4 out of 5' }).click();
  await page.locator('select[name="topic"]').selectOption(topic);
  await page.locator('textarea[name="body"]').fill(BODY);
  await page.getByRole('button', { name: /^Post/ }).click();

  try {
    await page.waitForSelector('code', { timeout: 12_000 });
    code = (await page.locator('code').first().innerText()).trim();
    break;
  } catch {
    lastMessage = (await page.locator('[role="status"]').first().innerText().catch(() => '(none)')).trim();
    if (!/already written/i.test(lastMessage)) break;   // a real failure, not a taken topic
  }
}
if (!code) check('publishing a review succeeds', false, lastMessage);

/**
 * Words alone, with no rating touched.
 *
 * The rating column stopped being NOT NULL for this, and a nullable column is
 * exactly the kind of change that typechecks everywhere and then throws at the
 * insert. Nothing but a real post through the real form proves it lands.
 */
{
  const bareMark = `SMOKE-NORATING-${Date.now()}`;
  const bare = `${bareMark} Support answered in a day and the platform has been stable since I opened the account. Nothing to complain about and nothing remarkable either.`;
  // Walks the topics for the same reason the loop above does: one author may
  // write about one topic once a day, and a re-run on the same database has
  // already used some of them.
  let landed = false;
  let why = '(never submitted)';
  for (const topic of TOPICS) {
    await page.goto(`${BASE}/brokers/${SLUG}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    await page.locator('select[name="topic"]').selectOption(topic);
    await page.locator('textarea[name="body"]').fill(bare);
    await page.getByRole('button', { name: /^Post/ }).click();
    try {
      await page.waitForSelector('code', { timeout: 12_000 });
      landed = true;
      break;
    } catch {
      why = (await page.locator('[role="status"]').first().innerText().catch(() => '(none)')).trim();
      if (!/already written/i.test(why)) break;
    }
  }
  if (!landed) check('a review with no rating publishes', false, why);
  if (landed) {
    check('a review with no rating publishes', true);
    await page.goto(`${BASE}/brokers/${SLUG}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const shown = await page.locator('body').innerText();
    check('it reaches the page with no star beside it', shown.includes(bare.slice(0, 40)));
  }
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
