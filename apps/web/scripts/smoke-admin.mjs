/**
 * Drives the editor's side through the real admin, in a real browser.
 *
 *   SMOKE_ADMIN_TOKEN=... pnpm --filter @commentfx/web smoke:admin
 *
 * The whole product rests on one claim: a number counts only once a person
 * checked it. That claim is only as good as the screen the person uses, and
 * until this existed nothing had ever driven it — the verify and hide actions
 * were exercised at the database layer and nowhere else.
 */
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE ?? 'http://127.0.0.1:3000';
const TOKEN = process.env.SMOKE_ADMIN_TOKEN ?? 'demo';
const SLUG = 'exness';
const failures = [];

const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

async function settlesTo(page, path, text, present, tries = 20) {
  for (let i = 0; i < tries; i++) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    if ((await page.getByText(text).count() > 0) === present) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

const browser = await chromium.launch({ executablePath: process.env.SMOKE_CHROMIUM || undefined });

/* ── the gate ──────────────────────────────────────────────────────── */
const anon = await (await browser.newContext()).newPage();
const noToken = await anon.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
check('the admin refuses a request with no token', noToken?.status() === 401, `HTTP ${noToken?.status()}`);

const wrong = await (await browser.newContext({
  extraHTTPHeaders: { authorization: 'Bearer not-the-token' },
})).newPage();
const wrongRes = await wrong.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
check('the admin refuses a wrong token', wrongRes?.status() === 401, `HTTP ${wrongRes?.status()}`);

/* ── an editor with the token ──────────────────────────────────────── */
const ctx = await browser.newContext({
  viewport: { width: 390, height: 900 },
  extraHTTPHeaders: { authorization: `Bearer ${TOKEN}` },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => check('no uncaught page errors', false, String(e).split('\n')[0]));

const ok = await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
check('the admin opens with the right token', ok?.status() === 200, `HTTP ${ok?.status()}`);

/* ── something to check: a review written the public way ───────────── */
const MARK = `ADMIN-${Date.now()}`;
const BODY = `${MARK} Funded and withdrew inside the published window, with the dates and the amount, so there is something here an editor can actually check against.`;
const TOPICS = ['withdrawals', 'execution', 'costs', 'support', 'platform', 'account-opening'];

let published = false;
for (const topic of TOPICS) {
  await page.goto(`${BASE}/brokers/${SLUG}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: '5 out of 5' }).click();
  await page.locator('select[name="topic"]').selectOption(topic);
  await page.locator('textarea[name="body"]').fill(BODY);
  await page.getByRole('button', { name: /Publish review/ }).click();
  try { await page.waitForSelector('code', { timeout: 12_000 }); published = true; break; }
  catch {
    const m = (await page.locator('[role="status"]').first().innerText().catch(() => '')).trim();
    if (!/already written/i.test(m)) { check('a review can be published to check', false, m); break; }
  }
}

if (published) {
  check('an unchecked review reaches the queue',
    await settlesTo(page, '/admin', MARK, true));

  // Verify it, as an editor would.
  await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const row = page.locator('li', { hasText: MARK }).last();
  await row.locator('input[name="actor"]').fill('smoke@commentfx');
  await row.getByRole('button', { name: /Checked/ }).click();
  await page.waitForTimeout(2500);

  check('verifying takes it out of the queue', await settlesTo(page, '/admin', MARK, false));

  /**
   * Poll for the label, not for the review.
   *
   * This used to wait for the review's body to appear on the broker page and
   * then read the label off whatever that request returned. The body was
   * already there — it has been on the page since it was published — so the
   * wait returned on the first request and the label was read from a render
   * that predated the verification. It passed for as long as revalidation
   * happened to win the race and went red in CI the day it did not. A wait has
   * to be for the thing that is supposed to change.
   */
  check('the public page now calls it checked',
    await settlesTo(page, `/brokers/${SLUG}`, 'checked by an editor', true));

  const published = page.locator('li', { hasText: MARK }).last();
  check('the review is labelled as checked by an editor, not unverified',
    await published.getByText('checked by an editor').count() > 0
      && await published.getByText('unverified').count() === 0);

  check('the check lands in the audit log',
    await settlesTo(page, '/admin', 'verified review', true));
}

/* ── recording a field verification ────────────────────────────────── */
await page.goto(`${BASE}/admin/broker/${SLUG}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(700);

const countNow = async () => {
  const text = (await page.locator('text=/\\d+ of \\d+ fields verified/').first().innerText()).trim();
  return Number(/(\d+) of \d+ fields verified/.exec(text)?.[1]);
};

/** The card for a field nobody has checked yet — re-checking one already done
 *  is an update, and would leave the count where it was. */
const unchecked = page.locator('section').filter({ hasText: 'not checked' }).first();
check('the record page offers an unchecked field to verify', await unchecked.count() > 0);

if (await unchecked.count() > 0) {
  const before = await countNow();
  const prefilled = await unchecked.locator('input[name="sourceUrl"]').inputValue();
  check('the source box is prefilled with where to look', prefilled.startsWith('http'), prefilled);

  await unchecked.locator('input[name="actor"]').fill('smoke@commentfx');
  await unchecked.getByRole('button', { name: /Record check/ }).click();
  await page.waitForTimeout(2500);

  check('the verification count goes up by one',
    await settlesTo(page, `/admin/broker/${SLUG}`, `${before + 1} of 6 fields verified`, true),
    `was ${before}`);

  // The public panel has two shapes: a warning card when nothing is checked and
  // the field list once something is. Asserting on the heading alone would pass
  // in both, so assert on the count.
  check('the public page shows the new count, not the nothing-checked card',
    await settlesTo(page, `/brokers/${SLUG}`, `${before + 1} of 6`, true));
  check('the nothing-checked warning is gone',
    !(await page.getByText('Nothing on this page is editor-verified yet').count()));

  // A verification expires after 90 days, so renewing one has to work — and it
  // must update rather than add.
  await page.goto(`${BASE}/admin/broker/${SLUG}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const after = await countNow();
  const done = page.locator('section').filter({ hasText: 'verified' }).first();
  await done.locator('input[name="actor"]').fill('smoke-again@commentfx');
  await done.getByRole('button', { name: /Record check/ }).click();
  await page.waitForTimeout(2500);
  await page.goto(`${BASE}/admin/broker/${SLUG}`, { waitUntil: 'domcontentloaded' });
  check('re-checking a field renews it rather than adding another', (await countNow()) === after,
    `${after} before, ${await countNow()} after`);
}

await browser.close();

console.log('');
if (failures.length > 0) {
  console.log(`${failures.length} broken: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('The editor path works end to end.');
