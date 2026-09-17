/**
 * Drives the record editor end to end, in a real browser.
 *
 *   SMOKE_ADMIN_TOKEN=... pnpm --filter @commentfx/web smoke:records
 *
 * The editor can change what the site publishes, which makes it the highest-
 * consequence screen here by a wide margin. What this asserts is the contract
 * the whole override design rests on, in the order a reader would care about:
 * a draft changes nothing, publishing changes the page, a value the build would
 * have rejected cannot be saved at all, and discarding puts the record back
 * exactly as the code has it.
 */
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE ?? 'http://127.0.0.1:3000';
const TOKEN = process.env.SMOKE_ADMIN_TOKEN ?? 'demo';
const SLUG = 'exness';
const CODE_SPREAD = '0.7';
const EDITED_SPREAD = '0.42';
const failures = [];

const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

/** Eventually, because revalidation is eventual by construction. */
async function settlesTo(page, path, text, present, tries = 40) {
  for (let i = 0; i < tries; i++) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    if ((await page.getByText(text).count() > 0) === present) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

const browser = await chromium.launch({ executablePath: process.env.SMOKE_CHROMIUM || undefined });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 900 },
  extraHTTPHeaders: { authorization: `Bearer ${TOKEN}` },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => check('no uncaught page errors', false, String(e).split('\n')[0]));

/* ── the gate, again: this screen writes ───────────────────────────── */
const anon = await (await browser.newContext()).newPage();
const refused = await anon.goto(`${BASE}/admin/records`, { waitUntil: 'domcontentloaded' });
check('the record editor refuses a request with no token', refused?.status() === 401, `HTTP ${refused?.status()}`);

/* ── the list ──────────────────────────────────────────────────────── */
const list = await page.goto(`${BASE}/admin/records`, { waitUntil: 'domcontentloaded' });
check('the record list opens', list?.status() === 200, `HTTP ${list?.status()}`);
check('every curated record is listed', await page.getByText(SLUG, { exact: true }).count() > 0);

/* ── saving a draft ────────────────────────────────────────────────── */
await page.goto(`${BASE}/admin/records/broker/${SLUG}`, { waitUntil: 'domcontentloaded' });
const spread = page.locator('input[name="f:cost.eurusdSpread"]');
check('the form is filled from the record as it stands',
  (await spread.inputValue()) === CODE_SPREAD, await spread.inputValue());

await spread.fill(EDITED_SPREAD);
await page.locator('form').filter({ has: spread }).locator('input[name="actor"]').fill('smoke@commentfx');
await page.locator('form').filter({ has: spread }).locator('input[name="note"]').fill('Smoke test.');
await page.getByRole('button', { name: /^Save$/ }).click();
await page.waitForTimeout(2000);

check('a save is confirmed in words', await page.getByText(/Saved/).count() > 0);

await page.goto(`${BASE}/admin/records/broker/${SLUG}`, { waitUntil: 'domcontentloaded' });
check('the stored edit is shown as a diff, not as "edited"',
  await page.getByText('EUR/USD spread (pips)').count() > 0
  && await page.getByText(`${CODE_SPREAD}`).count() > 0
  && await page.getByText(`${EDITED_SPREAD}`).count() > 0);
check('a saved edit starts as a draft', await page.getByText('draft').count() > 0);

/**
 * The rule the whole staging idea rests on. If a draft could reach a reader
 * there would be no point having one.
 */
await page.goto(`${BASE}/brokers/${SLUG}`, { waitUntil: 'domcontentloaded' });
check('a draft changes nothing a reader sees',
  await page.getByText(`${CODE_SPREAD} pips`).count() > 0
  && await page.getByText(`${EDITED_SPREAD} pips`).count() === 0);

/* ── publishing ────────────────────────────────────────────────────── */
await page.goto(`${BASE}/admin/records/broker/${SLUG}`, { waitUntil: 'domcontentloaded' });
const controls = page.locator('form').filter({ has: page.getByRole('button', { name: 'Publish' }) });
await controls.locator('input[name="actor"]').fill('smoke@commentfx');
await controls.getByRole('button', { name: 'Publish' }).click();
await page.waitForTimeout(2500);

check('publishing puts the edited figure on the public page',
  await settlesTo(page, `/brokers/${SLUG}`, `${EDITED_SPREAD} pips`, true));
check('the ranking page reads the same edited record',
  await settlesTo(page, '/brokers', `${EDITED_SPREAD}`, true));

/* ── the gate that matters: a save the build would have rejected ───── */
await page.goto(`${BASE}/admin/records/prop/ftmo`, { waitUntil: 'domcontentloaded' });
const split = page.locator('input[name="f:payout.splitPct"]');
const before = await split.inputValue();
await split.fill('100');
await page.locator('form').filter({ has: split }).locator('input[name="actor"]').fill('smoke@commentfx');
await page.getByRole('button', { name: /^Save$/ }).click();
await page.waitForTimeout(2000);

check('a value the build would reject cannot be saved',
  await page.getByText(/would publish a record the build would have rejected/i).count() > 0);
check('the refusal says which field and why, on the field',
  await page.getByText(/top of a ladder/i).count() > 0);

/**
 * And nothing was written. Asserted against the admin rather than the public
 * page: a refused save would leave a draft, and a draft is invisible to a
 * reader whether or not the refusal worked — which would make the check read
 * green while the gate was off. Ask the screen that can tell the difference.
 */
await page.goto(`${BASE}/admin/records/prop/ftmo`, { waitUntil: 'domcontentloaded' });
check('nothing was stored when the save was refused',
  await page.getByText('Stored edit').count() === 0
  && await page.getByText('field changed').count() === 0
  && await page.getByText('fields changed').count() === 0,
  `split is ${before}`);

/* ── discarding ────────────────────────────────────────────────────── */
await page.goto(`${BASE}/admin/records/broker/${SLUG}`, { waitUntil: 'domcontentloaded' });
page.once('dialog', (d) => d.accept());
const live = page.locator('form').filter({ has: page.getByRole('button', { name: 'Discard changes' }) });
await live.locator('input[name="actor"]').fill('smoke@commentfx');
await live.getByRole('button', { name: 'Discard changes' }).click();
await page.waitForTimeout(2500);

check('discarding restores exactly what the code says',
  await settlesTo(page, `/brokers/${SLUG}`, `${CODE_SPREAD} pips`, true));

/* ── adding a record that exists nowhere in code ───────────────────── */

/**
 * The other half of the panel: a record the code has never heard of. It has to
 * validate like any other, stay invisible until somebody publishes it, and get
 * a page of its own when they do.
 */
const NEW_SLUG = `smoke-exchange-${Date.now().toString(36)}`;
await page.goto(`${BASE}/admin/records/new/exchange`, { waitUntil: 'domcontentloaded' });

await page.locator('#record-slug').fill(NEW_SLUG);

// Fill everything the form asks for, the way an editor would: this record has
// no code behind it, so nothing is inherited and every box has to be answered.
const VALUES = {
  'f:name': 'Smoke Exchange',
  'f:website': 'https://example.com',
  'f:founded': '2019',
  'f:headquarters': 'MT',
  'f:why': 'A record created by the smoke test to prove the create path works.',
  'f:takerFeePct': '0.1',
  'f:makerFeePct': '0.05',
  'f:spotVolumeUsd': '250000000',
};
for (const [name, value] of Object.entries(VALUES)) {
  await page.locator(`[name="${name}"]`).fill(value);
}
await page.locator('input[name="actor"]').fill('smoke@commentfx');
await page.getByRole('button', { name: /Create as draft/ }).click();
await page.waitForTimeout(2500);

check('a record the code has never heard of can be created',
  await page.getByText(/Saved as a draft/).count() > 0,
  (await page.locator('[role="status"]').first().innerText().catch(() => '')).trim());

check('and it is listed as not in code',
  await settlesTo(page, '/admin/records', NEW_SLUG, true));

const fresh = await page.goto(`${BASE}/exchanges/${NEW_SLUG}`, { waitUntil: 'domcontentloaded' });
check('a draft record has no public page yet', fresh?.status() === 404, `HTTP ${fresh?.status()}`);

await page.goto(`${BASE}/admin/records/exchange/${NEW_SLUG}`, { waitUntil: 'domcontentloaded' });
const newControls = page.locator('form').filter({ has: page.getByRole('button', { name: 'Publish' }) });
await newControls.locator('input[name="actor"]').fill('smoke@commentfx');
await newControls.getByRole('button', { name: 'Publish' }).click();
await page.waitForTimeout(2500);

check('publishing it gives it a page', await settlesTo(page, `/exchanges/${NEW_SLUG}`, 'Smoke Exchange', true));
check('and a place in the ranking', await settlesTo(page, '/exchanges', 'Smoke Exchange', true));

await page.goto(`${BASE}/admin/records/exchange/${NEW_SLUG}`, { waitUntil: 'domcontentloaded' });
page.once('dialog', (d) => d.accept());
const del = page.locator('form').filter({ has: page.getByRole('button', { name: 'Delete record' }) });
await del.locator('input[name="actor"]').fill('smoke@commentfx');
await del.getByRole('button', { name: 'Delete record' }).click();
await page.waitForTimeout(2500);

const gone = await page.goto(`${BASE}/exchanges/${NEW_SLUG}`, { waitUntil: 'domcontentloaded' });
check('deleting it takes the page with it', gone?.status() === 404, `HTTP ${gone?.status()}`);

/* ── the trail ─────────────────────────────────────────────────────── */
check('every step is in the audit log under a name',
  await settlesTo(page, '/admin', 'smoke@commentfx', true));

await browser.close();

console.log('');
if (failures.length > 0) {
  console.log(`${failures.length} broken: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('The record editor works end to end.');
