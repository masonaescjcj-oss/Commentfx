/**
 * Drives sign-in, invitations and roles in a real browser.
 *
 *   SMOKE_ADMIN_TOKEN=... pnpm --filter @commentfx/web smoke:accounts
 *
 * The claim being tested is the one the whole change was for: every change on
 * this site has a name on it, and the name is who was signed in rather than
 * whatever somebody typed into a box. That means three things have to be true
 * and each is a way this could be quietly wrong — a role has to actually stop
 * somebody, turning an account off has to end the session it already had, and
 * an invitation link has to work once and then not.
 */
import { chromium } from 'playwright';
import { signInAdmin, ADMIN } from './lib/admin-session.mjs';

const BASE = process.env.SMOKE_BASE ?? 'http://127.0.0.1:3000';
const TOKEN = process.env.SMOKE_ADMIN_TOKEN ?? 'demo';
const MARK = Date.now().toString(36);
const WRITER = { email: `writer-${MARK}@commentfx.com`, name: 'A Writer', password: 'another-long-password' };
const failures = [];

const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch({ executablePath: process.env.SMOKE_CHROMIUM || undefined });
const { page } = await signInAdmin(browser, BASE, TOKEN);

/* ── signing in ────────────────────────────────────────────────────── */

await page.goto(`${BASE}/admin/people`, { waitUntil: 'domcontentloaded' });
check('a signed-in admin sees the people screen', await page.getByText(ADMIN.email).count() > 0);

/**
 * A wrong password and an address with no account have to answer the same
 * thing, or the difference between them is a way to find out who works here.
 */
const guess = await (await browser.newContext()).newPage();
await guess.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
await guess.locator('input[name="email"]').fill(ADMIN.email);
await guess.locator('input[name="password"]').fill('not-the-password');
await guess.getByRole('button', { name: /^Sign in$/ }).click();
await guess.waitForTimeout(1500);
const wrongPassword = (await guess.locator('[role="status"]').first().innerText().catch(() => '')).trim();

await guess.goto(`${BASE}/admin/login`, { waitUntil: 'domcontentloaded' });
await guess.locator('input[name="email"]').fill(`nobody-${MARK}@commentfx.com`);
await guess.locator('input[name="password"]').fill('not-the-password');
await guess.getByRole('button', { name: /^Sign in$/ }).click();
await guess.waitForTimeout(1500);
const noAccount = (await guess.locator('[role="status"]').first().innerText().catch(() => '')).trim();

check('a wrong password is refused', wrongPassword.length > 0, wrongPassword);
check('and an unknown address is refused in exactly the same words',
  wrongPassword === noAccount, `"${wrongPassword}" vs "${noAccount}"`);
check('and neither got in', new URL(guess.url()).pathname.startsWith('/admin/login'), guess.url());

/* ── an invitation ─────────────────────────────────────────────────── */

await page.goto(`${BASE}/admin/people`, { waitUntil: 'domcontentloaded' });
const invite = page.locator('form').filter({ has: page.getByRole('button', { name: /invitation link/ }) });
await invite.locator('input[name="name"]').fill(WRITER.name);
await invite.locator('input[name="email"]').fill(WRITER.email);
await invite.locator('select[name="role"]').selectOption('moderator');
await invite.getByRole('button', { name: /invitation link/ }).click();
await page.waitForTimeout(2000);

const link = (await page.locator('code').first().innerText().catch(() => '')).trim();
check('an invitation produces a link', link.startsWith('/admin/invite/'), link);

// It is shown once and stored only as a hash, so it must not be on the page
// again after a reload.
await page.reload({ waitUntil: 'domcontentloaded' });
check('and the link is not shown a second time',
  await page.getByText(link || 'no-link-at-all').count() === 0);
check('but the invitation is listed as waiting',
  await page.getByText(WRITER.email).count() > 0);

/* ── accepting it ──────────────────────────────────────────────────── */

const invited = await (await browser.newContext()).newPage();
await invited.goto(BASE + link, { waitUntil: 'domcontentloaded' });
check('the invitation names who invited them and as what',
  await invited.getByText(ADMIN.email).count() > 0 && await invited.getByText('moderator').count() > 0);

await invited.locator('input[name="password"]').fill(WRITER.password);
await invited.locator('input[name="again"]').fill(WRITER.password);
await invited.getByRole('button', { name: /Set up my account/ }).click();
await invited.waitForTimeout(2500);
check('accepting it signs them in', new URL(invited.url()).pathname === '/admin', invited.url());

/**
 * The role, doing what a role is for. A moderator judges what readers said; it
 * does not change what the site says. Asserted through the actual editor rather
 * than by reading the capability table back to itself.
 */
await invited.goto(`${BASE}/admin/records/broker/exness`, { waitUntil: 'domcontentloaded' });
await invited.locator('input[name="f:cost.eurusdSpread"]').fill('0.33');
await invited.getByRole('button', { name: /^Save$/ }).click();
await invited.waitForTimeout(2000);
check('a moderator cannot edit a record',
  await invited.getByText(/is a moderator, which cannot do this/i).count() > 0,
  (await invited.locator('[role="status"]').first().innerText().catch(() => '')).trim());

check('and the record was not changed',
  (await (await fetch(`${BASE}/brokers/exness`)).text()).includes('0.7 pips'));

/** A used invitation is spent. */
const reuse = await (await browser.newContext()).newPage();
await reuse.goto(BASE + link, { waitUntil: 'domcontentloaded' });
check('the invitation link works once', await reuse.getByText(/expired|already been used/i).count() > 0);

/* ── roles change, and turning an account off is immediate ─────────── */

await page.goto(`${BASE}/admin/people`, { waitUntil: 'domcontentloaded' });
const row = page.locator('li').filter({ hasText: WRITER.email });
await row.locator('select[name="role"]').selectOption('editor');
await row.getByRole('button', { name: 'Set role' }).click();
await page.waitForTimeout(2000);

await invited.goto(`${BASE}/admin/records/broker/exness`, { waitUntil: 'domcontentloaded' });
await invited.locator('input[name="f:cost.eurusdSpread"]').fill('0.33');
await invited.getByRole('button', { name: /^Save$/ }).click();
await invited.waitForTimeout(2000);
check('the same person as an editor can', await invited.getByText(/^Saved/).count() > 0,
  (await invited.locator('[role="status"]').first().innerText().catch(() => '')).trim());

/**
 * The half that is easy to leave out. Setting the flag without dropping the
 * sessions is the difference between revoking access and asking for it back —
 * so this is asserted in the browser that was already signed in.
 */
await page.goto(`${BASE}/admin/people`, { waitUntil: 'domcontentloaded' });
const again = page.locator('li').filter({ hasText: WRITER.email });
await again.getByRole('button', { name: 'Turn off' }).click();
await page.waitForTimeout(2000);

await invited.goto(`${BASE}/admin/records`, { waitUntil: 'domcontentloaded' });
check('turning an account off ends the session it already had',
  new URL(invited.url()).pathname.startsWith('/admin/login'), invited.url());

/* ── tidy up after the editor's own edit ───────────────────────────── */

await page.goto(`${BASE}/admin/records/broker/exness`, { waitUntil: 'domcontentloaded' });
page.once('dialog', (d) => d.accept());
const discard = page.getByRole('button', { name: 'Discard changes' });
if (await discard.count() > 0) {
  await discard.click();
  await page.waitForTimeout(2000);
}
check('and an admin can undo what they left behind',
  await page.getByRole('button', { name: 'Discard changes' }).count() === 0);

/* ── signing out ───────────────────────────────────────────────────── */

await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
await page.getByRole('button', { name: 'Sign out' }).click();
await page.waitForTimeout(2000);
await page.goto(`${BASE}/admin/records`, { waitUntil: 'domcontentloaded' });
check('signing out ends the session', new URL(page.url()).pathname.startsWith('/admin/login'), page.url());

await browser.close();

console.log('');
if (failures.length > 0) {
  console.log(`${failures.length} broken: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('Accounts, invitations and roles work end to end.');
