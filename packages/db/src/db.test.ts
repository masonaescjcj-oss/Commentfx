import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eq, and } from 'drizzle-orm';
import { makeTestDb, schema } from './client.ts';
import { seed } from './seed.ts';
import { coverageFor, verificationQueue, classify, STALE_AFTER_DAYS, REQUIRED_FIELDS } from './verification.ts';

test('migrations apply and the seed loads every curated record', async () => {
  const { db, close } = await makeTestDb();
  const counts = await seed(db);
  assert.ok(counts.regulators >= 14, `regulators: ${counts.regulators}`);
  assert.equal(counts.brokers, 10);
  assert.equal(counts.props, 8);
  assert.equal(counts.exchanges, 8);
  assert.ok(counts.entities >= 20, `entities: ${counts.entities}`);
  await close();
});

test('seeding is idempotent', async () => {
  const { db, close } = await makeTestDb();
  await seed(db);
  await seed(db);
  const brokers = await db.select().from(schema.brokers);
  const entities = await db.select().from(schema.brokerEntities);
  assert.equal(brokers.length, 10);
  assert.equal(entities.filter((e) => e.brokerSlug === 'exness').length, 4);
  await close();
});

test('seeding writes no verifications — a script is not a check', async () => {
  const { db, close } = await makeTestDb();
  await seed(db);
  const rows = await db.select().from(schema.verifications);
  assert.equal(rows.length, 0);
  const cov = await coverageFor(db, 'broker', 'exness');
  assert.equal(cov.verified, 0);
  assert.equal(cov.ratio, 0);
  await close();
});

test('a verification is per field, with its source, and ages out', async () => {
  const { db, close } = await makeTestDb();
  await seed(db);
  const fresh = new Date();
  const old = new Date(Date.now() - (STALE_AFTER_DAYS + 10) * 86_400_000);

  await db.insert(schema.verifications).values([
    { kind: 'broker', slug: 'exness', field: 'cost.eurusdSpread', valueSeen: '0.7',
      sourceUrl: 'https://example.invalid/terms', verifiedBy: 'editor@commentfx', verifiedAt: fresh },
    { kind: 'broker', slug: 'exness', field: 'payments.minDepositUsd', valueSeen: '10',
      sourceUrl: 'https://example.invalid/accounts', verifiedBy: 'editor@commentfx', verifiedAt: old },
  ]);

  const cov = await coverageFor(db, 'broker', 'exness');
  const spread = cov.fields.find((f) => f.field === 'cost.eurusdSpread')!;
  const minDep = cov.fields.find((f) => f.field === 'payments.minDepositUsd')!;
  assert.equal(spread.state, 'verified');
  assert.equal(minDep.state, 'stale');
  assert.match(spread.sourceUrl ?? '', /^https:/);
  assert.equal(cov.verified, 1);
  assert.equal(cov.stale, 1);
  assert.equal(cov.unverified, REQUIRED_FIELDS.broker.length - 2);
  await close();
});

test('the queue puts the least-verified record first', async () => {
  const { db, close } = await makeTestDb();
  await seed(db);
  for (const field of REQUIRED_FIELDS.broker.slice(0, 4)) {
    await db.insert(schema.verifications).values({
      kind: 'broker', slug: 'ic-markets', field, valueSeen: 'x',
      sourceUrl: 'https://example.invalid', verifiedBy: 'editor@commentfx',
    });
  }
  const queue = await verificationQueue(db, 'broker', ['ic-markets', 'exness']);
  assert.equal(queue[0]!.slug, 'exness', 'the wholly unverified record must come first');
  assert.ok(queue[0]!.ratio < queue[1]!.ratio);
  await close();
});

test('a unique index stops the same field being verified twice', async () => {
  const { db, close } = await makeTestDb();
  await seed(db);
  const row = { kind: 'broker' as const, slug: 'exness', field: 'cost.eurusdSpread',
    valueSeen: '0.7', sourceUrl: 'https://example.invalid', verifiedBy: 'a@b.c' };
  await db.insert(schema.verifications).values(row);
  await assert.rejects(() => db.insert(schema.verifications).values(row));
  await close();
});

test('classify is a pure function of age', () => {
  assert.equal(classify(null), 'unverified');
  assert.equal(classify(new Date()), 'verified');
  assert.equal(classify(new Date(Date.now() - (STALE_AFTER_DAYS + 1) * 86_400_000)), 'stale');
});

test('a second start does not replay migrations that already ran', async () => {
  // The case this protects: one migration drops a column an earlier one adds a
  // constraint to. Replaying the directory would fail on the second start, and
  // a file-backed database would start once and never again.
  const { PGlite } = await import('@electric-sql/pglite');
  const { applyMigrations } = await import('./client.ts');
  const client = new PGlite();

  await applyMigrations(client);
  const first = await client.query<{ n: number }>('SELECT count(*)::int AS n FROM _migrations');

  await applyMigrations(client);
  const second = await client.query<{ n: number }>('SELECT count(*)::int AS n FROM _migrations');

  assert.ok((first.rows[0]?.n ?? 0) > 0, 'the ledger records what it applied');
  assert.equal(second.rows[0]?.n, first.rows[0]?.n, 'a second pass applies nothing');
  await client.close();
});

test('the reviews table survives the migration that dropped broker_slug', async () => {
  const { PGlite } = await import('@electric-sql/pglite');
  const { applyMigrations } = await import('./client.ts');
  const client = new PGlite();
  await applyMigrations(client);

  const cols = await client.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'reviews'`,
  );
  const names = cols.rows.map((c) => c.column_name);
  assert.ok(names.includes('kind') && names.includes('slug'));
  assert.equal(names.includes('broker_slug'), false, 'the old column is gone, not shadowed');
  await client.close();
});
