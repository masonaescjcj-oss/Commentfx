import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestDb, schema } from './client.ts';
import {
  saveOverride, getOverride, livePatches, allOverrides, setOverrideStatus, deleteOverride,
  overrideKey, recentEdits,
} from './overrides.ts';

/**
 * The rules this table exists to keep, each one written as the failure it
 * prevents rather than as a property of the schema.
 */

test('a saved patch starts as a draft and readers do not see it', async () => {
  const { db, close } = await makeTestDb();
  await saveOverride(db, { kind: 'broker', slug: 'exness', patch: { why: 'edited' }, actor: 'ed@x' });

  const row = await getOverride(db, 'broker', 'exness');
  assert.equal(row?.status, 'draft');
  assert.equal((await livePatches(db)).size, 0, 'a draft must not reach the merge');
  await close();
});

test('publishing is a separate act from saving', async () => {
  const { db, close } = await makeTestDb();
  await saveOverride(db, { kind: 'prop', slug: 'ftmo', patch: { why: 'edited' }, actor: 'ed@x' });
  await setOverrideStatus(db, 'prop', 'ftmo', 'live', 'ed@x');

  const live = await livePatches(db);
  assert.equal(live.size, 1);
  assert.deepEqual(live.get(overrideKey('prop', 'ftmo'))?.patch, { why: 'edited' });
  await close();
});

/**
 * The one-row rule. Two patches for one record would make the merge pick, and a
 * merge that picks is a page whose content depends on row order.
 */
test('a second save replaces the first rather than stacking', async () => {
  const { db, close } = await makeTestDb();
  await saveOverride(db, { kind: 'exchange', slug: 'kraken', patch: { why: 'one' }, actor: 'a@x' });
  await saveOverride(db, { kind: 'exchange', slug: 'kraken', patch: { why: 'two' }, actor: 'b@x' });

  const rows = await allOverrides(db);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0]?.patch, { why: 'two' });
  assert.equal(rows[0]?.updatedBy, 'b@x');
  await close();
});

/** Saving an edit to something already published keeps it published. */
test('editing a live record does not quietly unpublish it', async () => {
  const { db, close } = await makeTestDb();
  await saveOverride(db, { kind: 'broker', slug: 'octa', patch: { why: 'one' }, actor: 'a@x' });
  await setOverrideStatus(db, 'broker', 'octa', 'live', 'a@x');
  await saveOverride(db, { kind: 'broker', slug: 'octa', patch: { why: 'two' }, actor: 'a@x' });

  assert.equal((await getOverride(db, 'broker', 'octa'))?.status, 'live');
  await close();
});

test('discarding an override leaves the code record exactly as it was', async () => {
  const { db, close } = await makeTestDb();
  await saveOverride(db, { kind: 'broker', slug: 'pepperstone', patch: { why: 'edited' }, actor: 'a@x' });
  await setOverrideStatus(db, 'broker', 'pepperstone', 'live', 'a@x');

  assert.equal(await deleteOverride(db, 'broker', 'pepperstone', 'a@x'), true);
  assert.equal(await getOverride(db, 'broker', 'pepperstone'), null);
  assert.equal((await livePatches(db)).size, 0);
  await close();
});

/**
 * The audit rule, and the reason every write in that module logs in the same
 * call: a change on the site with nobody's name on it is the failure mode this
 * whole layer is meant to make impossible.
 */
test('every write leaves a named trail, including the discard', async () => {
  const { db, close } = await makeTestDb();
  await saveOverride(db, { kind: 'prop', slug: 'the5ers', patch: { why: 'one' }, actor: 'a@x' });
  await saveOverride(db, { kind: 'prop', slug: 'the5ers', patch: { why: 'two' }, actor: 'b@x' });
  await setOverrideStatus(db, 'prop', 'the5ers', 'live', 'b@x');
  await deleteOverride(db, 'prop', 'the5ers', 'c@x');

  const log = await recentEdits(db);
  assert.deepEqual(log.map((r) => r.action), ['delete', 'publish', 'update', 'create']);
  assert.deepEqual([...new Set(log.map((r) => r.actor))].sort(), ['a@x', 'b@x', 'c@x']);
  // The update carries what it replaced, so the log answers "what did this used
  // to say" without the code record to hand.
  const update = log.find((r) => r.action === 'update');
  assert.equal(update?.before, JSON.stringify({ why: 'one' }));
  assert.equal(update?.after, JSON.stringify({ why: 'two' }));
  await close();
});

test('a record that exists only here is marked as such', async () => {
  const { db, close } = await makeTestDb();
  await saveOverride(db, {
    kind: 'exchange', slug: 'brand-new', patch: { name: 'Brand New' }, isNew: true, actor: 'a@x',
  });
  const row = await getOverride(db, 'exchange', 'brand-new');
  assert.equal(row?.isNew, true);

  // And it stays marked when somebody edits it later without saying so again.
  await saveOverride(db, { kind: 'exchange', slug: 'brand-new', patch: { name: 'Renamed' }, actor: 'b@x' });
  assert.equal((await getOverride(db, 'exchange', 'brand-new'))?.isNew, true);
  await close();
});

test('setting the status of a record with no override does nothing', async () => {
  const { db, close } = await makeTestDb();
  assert.equal(await setOverrideStatus(db, 'broker', 'nobody', 'live', 'a@x'), null);
  assert.equal((await db.select().from(schema.auditLog)).length, 0);
  await close();
});
