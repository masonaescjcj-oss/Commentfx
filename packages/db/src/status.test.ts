import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { makeTestDb, schema } from './client.ts';
import { seed } from './seed.ts';
import {
  statusFor, submitReport, reporterHash, levelFor, THRESHOLD, WINDOW_HOURS,
} from './status.ts';

async function fresh() {
  const h = await makeTestDb();
  await seed(h.db);
  return h;
}

const report = (db: never, n: number, kind = 'withdrawal-delay' as const, slug = 'exness') =>
  Promise.all(
    Array.from({ length: n }, (_, i) =>
      submitReport(db, { brokerSlug: slug, kind, hash: `reporter-${i}` }),
    ),
  );

test('a broker with no reports reads normal', async () => {
  const { db, close } = await fresh();
  const s = await statusFor(db, 'exness');
  assert.equal(s.level, 'normal');
  assert.equal(s.reporters, 0);
  await close();
});

test('one person cannot move the dial', async () => {
  const { db, close } = await fresh();
  for (let i = 0; i < 20; i++) {
    await submitReport(db, { brokerSlug: 'exness', kind: 'withdrawal-delay', hash: 'same-person' });
  }
  const s = await statusFor(db, 'exness');
  assert.equal(s.reporters, 1, 'repeated submissions from one reporter count once');
  assert.equal(s.level, 'normal');
  await close();
});

test('a repeat submission is a no-op, not an error', async () => {
  const { db, close } = await fresh();
  const first = await submitReport(db, { brokerSlug: 'exness', kind: 'platform-down', hash: 'h1' });
  const second = await submitReport(db, { brokerSlug: 'exness', kind: 'platform-down', hash: 'h1' });
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.match(second.message, /already reported/i);
  await close();
});

test('status escalates only at the published thresholds', async () => {
  const { db, close } = await fresh();
  await report(db as never, THRESHOLD.degraded - 1);
  assert.equal((await statusFor(db, 'exness')).level, 'normal', 'one short of the threshold is still normal');

  await submitReport(db, { brokerSlug: 'exness', kind: 'withdrawal-delay', hash: 'one-more' });
  assert.equal((await statusFor(db, 'exness')).level, 'degraded');
  await close();
});

test('reporting two kinds still counts as one reporter', async () => {
  const { db, close } = await fresh();
  await submitReport(db, { brokerSlug: 'exness', kind: 'withdrawal-delay', hash: 'p1' });
  await submitReport(db, { brokerSlug: 'exness', kind: 'login-failure', hash: 'p1' });
  const s = await statusFor(db, 'exness');
  assert.equal(s.reporters, 1, 'summing per-kind counts would double this person');
  assert.equal(s.byKind.length, 2);
  await close();
});

test('reports outside the window stop counting', async () => {
  const { db, close } = await fresh();
  await report(db as never, THRESHOLD.down);
  assert.equal((await statusFor(db, 'exness')).level, 'down');

  const later = new Date(Date.now() + (WINDOW_HOURS + 1) * 3_600_000);
  const s = await statusFor(db, 'exness', later);
  assert.equal(s.reporters, 0, 'the window must expire, not accumulate forever');
  assert.equal(s.level, 'normal');
  await close();
});

test('a hidden report is excluded from the count', async () => {
  const { db, close } = await fresh();
  await report(db as never, THRESHOLD.degraded);
  assert.equal((await statusFor(db, 'exness')).level, 'degraded');
  await db.update(schema.statusReports).set({ hidden: true })
    .where(eq(schema.statusReports.brokerSlug, 'exness'));
  assert.equal((await statusFor(db, 'exness')).level, 'normal');
  await close();
});

test('reports are scoped to one broker', async () => {
  const { db, close } = await fresh();
  await report(db as never, THRESHOLD.down, 'platform-down', 'exness');
  assert.equal((await statusFor(db, 'alpari')).reporters, 0);
  await close();
});

test('the reporter hash hides the address and rotates daily', () => {
  const ip = '203.0.113.7';
  const ua = 'Mozilla/5.0';
  const today = new Date('2026-09-14T10:00:00Z');
  const tomorrow = new Date('2026-09-15T10:00:00Z');

  const a = reporterHash(ip, ua, today);
  assert.ok(!a.includes(ip), 'the address must not survive into the digest');
  assert.equal(a, reporterHash(ip, ua, today), 'stable within a day, so dedupe works');
  assert.notEqual(a, reporterHash(ip, ua, tomorrow), 'rotates, so reporters cannot be followed');
  assert.notEqual(a, reporterHash('198.51.100.2', ua, today));
});

test('levelFor is a pure function of the count', () => {
  assert.equal(levelFor(0), 'normal');
  assert.equal(levelFor(THRESHOLD.degraded - 1), 'normal');
  assert.equal(levelFor(THRESHOLD.degraded), 'degraded');
  assert.equal(levelFor(THRESHOLD.down), 'down');
});
