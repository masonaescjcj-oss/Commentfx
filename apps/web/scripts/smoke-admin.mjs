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
import { signInAdmin, ADMIN } from './lib/admin-session.mjs';

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

/**
 * Eventually, and says what it saw instead if it never does.
 *
 * A public page reflecting an editor's check is eventual by construction, not
 * immediate: revalidatePath() invalidates the cache of the instance that ran
 * the action and nothing else. On one machine that is usually the next request;
 * on a deployment with two instances the other one serves its prerender until
 * its own window expires. So a tight wait here is asserting something the
 * architecture does not offer, and this asserts the thing it does — with the
 * page's own words on failure, because "it did not appear" is not a finding.
 */
async function eventually(page, path, text, tries = 60) {
  if (await settlesTo(page, path, text, true, tries)) return true;
  const seen = await page.locator('main').innerText().catch(() => '');
  const tags = seen.match(/checked by an editor|unverified/g) ?? [];
  console.log(`      after ${tries * 0.5}s ${path} showed: ${tags.join(', ') || 'no review label at all'}`);
  return false;
}

const browser = await chromium.launch({ executablePath: process.env.SMOKE_CHROMIUM || undefined });

/* ── the gate ──────────────────────────────────────────────────────── */

/**
 * A browser with no credentials is sent to sign in; a script with none gets the
 * status code it can read. Both matter: redirecting something holding a bearer
 * token would turn a clear 401 into a 200 on a login page, which is the kind of
 * thing a monitoring check quietly reports as healthy forever.
 */
const anon = await (await browser.newContext()).newPage();
await anon.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
check('a browser with no credentials lands on the sign-in page',
  new URL(anon.url()).pathname.startsWith('/admin/login') || new URL(anon.url()).pathname === '/admin/setup',
  anon.url());
check('and the admin itself is not rendered behind it',
  await anon.getByText('Verification queue').count() === 0);

const scripted = await fetch(`${BASE}/admin`, { headers: { accept: 'application/json' } });
check('a request that is not a browser is refused outright', scripted.status === 401, `HTTP ${scripted.status}`);

const wrong = await fetch(`${BASE}/admin`, {
  headers: { authorization: 'Bearer not-the-token', accept: 'application/json' },
});
check('a wrong token is refused', wrong.status === 401, `HTTP ${wrong.status}`);

/**
 * The shared token reaches the screens and writes nothing.
 *
 * It has no name to put in an audit row and no role to check, so it is a way
 * in and not a way to change anything — which is the claim the whole accounts
 * change rests on, and the one worth driving before anything else here.
 */
const tokenOnly = await (await browser.newContext({
  extraHTTPHeaders: { authorization: `Bearer ${TOKEN}` },
})).newPage();
const reached = await tokenOnly.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
check('the shared token reaches the admin', reached?.status() === 200, `HTTP ${reached?.status()}`);
check('and the page says it is nobody',
  await tokenOnly.getByText(/no name and no role/i).count() > 0);

/* ── an editor with an account ─────────────────────────────────────── */
const { page } = await signInAdmin(browser, BASE, TOKEN);
page.on('pageerror', (e) => check('no uncaught page errors', false, String(e).split('\n')[0]));

const ok = await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
check('the admin opens for a signed-in account', ok?.status() === 200, `HTTP ${ok?.status()}`);
check('and says who is signed in', await page.getByText(ADMIN.name).count() > 0);

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
  await page.getByRole('button', { name: /^Post/ }).click();
  try { await page.waitForSelector('#withdrawal-code', { timeout: 12_000 }); published = true; break; }
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
  check('the public page comes to call it checked',
    await eventually(page, `/brokers/${SLUG}`, 'checked by an editor'));

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

  await unchecked.getByRole('button', { name: /Record check/ }).click();
  await page.waitForTimeout(2500);

  check('the verification count goes up by one',
    await settlesTo(page, `/admin/broker/${SLUG}`, `${before + 1} of 6 fields verified`, true),
    `was ${before}`);

  check('the public page shows the new count',
    await settlesTo(page, `/brokers/${SLUG}`, `${before + 1} of 6`, true));

  /**
   * Four wrong versions of this before the right one, and each was wrong in a
   * way worth keeping.
   *
   * The first looked for "fields verified", a string the panel never prints, so
   * it passed everywhere. The second pointed at another broker — but a broker
   * always has a coverage record, so the panel renders there with every field
   * marked not checked, which is correct and not what this was testing. The
   * third asserted the panel was absent on a prop firm, on the theory that prop
   * firms have no coverage record. They do: `coverage()` returns one for any
   * record whenever a database is configured, and null only when there is none.
   *
   * The fourth looked for the banner on that prop page and passed — because a
   * file-backed PGlite aborts under the build's parallel workers, so the
   * prerender fell back to no coverage and rendered neither the banner nor the
   * panel. A page that renders nothing cannot tell you what it would have said.
   *
   * So it is asserted here instead, on this broker page, in the one state this
   * script has just put it in: a record with one field verified out of six. The
   * panel is provably on it — the count above was read off it — and the claim
   * is that nothing on it disclaims the page as a whole. A page-level "nothing
   * here is verified" over a page where something is, is the exact thing that
   * was removed.
   */
  const panel = await page.getByText('What has been checked').count();
  check('the panel is on a page with a coverage record', panel > 0);
  check('and says which fields, not that the page is unverified',
    await page.getByText('Not checked').count() > 0
    && await page.getByText('editor-verified').count() === 0);

  // A verification expires after 90 days, so renewing one has to work — and it
  // must update rather than add.
  await page.goto(`${BASE}/admin/broker/${SLUG}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const after = await countNow();
  const done = page.locator('section').filter({ hasText: 'verified' }).first();
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
