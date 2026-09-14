import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestDb } from './client.ts';
import { seed } from './seed.ts';
import { recordChecks, recordRun, checksFor, latestRuns, type CheckInput } from './registers.ts';

const finding = (over: Partial<CheckInput> = {}): CheckInput => ({
  brokerSlug: 'exness',
  regulatorCode: 'CySEC',
  licenceNumber: '178/12',
  kind: 'confirmed',
  registerName: 'Exness (CY) Ltd',
  detail: 'Confirmed on the register.',
  sourceUrl: 'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/',
  ...over,
});

async function fresh() {
  const h = await makeTestDb();
  await seed(h.db);
  return h;
}

test('a check is stored and read back for the broker it belongs to', async () => {
  const { db, close } = await fresh();
  await recordChecks(db, [finding()]);

  const rows = await checksFor(db, 'exness');
  assert.equal(rows.length, 1);
  assert.equal(rows[0]!.kind, 'confirmed');
  assert.equal(rows[0]!.registerName, 'Exness (CY) Ltd');
  assert.equal((await checksFor(db, 'ic-markets')).length, 0);
  await close();
});

test('re-running replaces the answer rather than piling up rows', async () => {
  const { db, close } = await fresh();
  await recordChecks(db, [finding()]);
  await recordChecks(db, [finding({ kind: 'not-found', registerName: null, detail: 'Gone from the register.' })]);

  const rows = await checksFor(db, 'exness');
  assert.equal(rows.length, 1, 'one row per (broker, regulator, licence)');
  assert.equal(rows[0]!.kind, 'not-found', 'the newest answer wins');
  assert.equal(rows[0]!.registerName, null);
  await close();
});

test('an unreachable register never erases what the register last said', async () => {
  const { db, close } = await fresh();
  await recordChecks(db, [finding()]);

  const res = await recordChecks(db, [finding({
    kind: 'source-unavailable', registerName: null, detail: 'Could not read the register (timeout).',
  })]);

  const rows = await checksFor(db, 'exness');
  assert.equal(rows[0]!.kind, 'confirmed', 'a network failure is not evidence about a licence');
  assert.equal(res.skipped, 1);
  assert.equal(res.written, 0);
  await close();
});

test('an unreachable register is recorded when we have never had an answer', async () => {
  const { db, close } = await fresh();
  const res = await recordChecks(db, [finding({
    kind: 'source-unavailable', registerName: null, detail: 'Could not read the register (HTTP 403).',
  })]);

  const rows = await checksFor(db, 'exness');
  assert.equal(res.written, 1);
  assert.equal(rows[0]!.kind, 'source-unavailable', 'silence about a source must be visible, not absent');
  await close();
});

test('two licences from the same regulator are held apart', async () => {
  const { db, close } = await fresh();
  await recordChecks(db, [
    finding(),
    finding({ brokerSlug: 'ic-markets', licenceNumber: '362/18', registerName: 'IC Markets (EU) Ltd' }),
  ]);
  assert.equal((await checksFor(db, 'exness')).length, 1);
  assert.equal((await checksFor(db, 'ic-markets')).length, 1);
  await close();
});

test('the run log keeps the latest attempt per source, failures included', async () => {
  const { db, close } = await fresh();
  await recordRun(db, { regulatorCode: 'CySEC', ok: true, entryCount: 247 });
  await new Promise((r) => setTimeout(r, 5));
  await recordRun(db, { regulatorCode: 'CySEC', ok: false, reason: 'HTTP 503' });

  const [cysec, fca] = await latestRuns(db, ['CySEC', 'FCA']);
  assert.equal(cysec!.ok, false, 'a source that broke today must not look healthy');
  assert.equal(cysec!.reason, 'HTTP 503');
  assert.equal(fca!.ok, null, 'a source that has never run reads as unknown, not failed');
  assert.equal(fca!.ranAt, null);
  await close();
});
