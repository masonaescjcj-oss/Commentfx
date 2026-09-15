import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COIN_INDEX, coinRef } from './coins.ts';

/**
 * This file is generated, so what is worth asserting is not its contents but
 * that a regeneration cannot quietly ruin it. An empty or duplicated index does
 * not throw anywhere: it makes every coin page a 404 during an upstream outage,
 * which is the exact bug the index was added to fix and would look like the
 * network's fault.
 */

test('the index is populated', () => {
  assert.ok(COIN_INDEX.length >= 50, `only ${COIN_INDEX.length} coins`);
});

test('every entry is usable', () => {
  for (const c of COIN_INDEX) {
    assert.match(c.id, /^[a-z0-9][a-z0-9-]*$/, `id is not a URL slug: ${c.id}`);
    assert.ok(c.name.trim().length > 0, `${c.id} has no name`);
    assert.ok(c.symbol.trim().length > 0, `${c.id} has no ticker`);
  }
});

test('ids are unique, so no page has two answers', () => {
  assert.equal(new Set(COIN_INDEX.map((c) => c.id)).size, COIN_INDEX.length);
});

test('the majors are in it', () => {
  for (const id of ['bitcoin', 'ethereum', 'solana']) {
    assert.ok(coinRef(id), `${id} is missing`);
  }
});

test('a slug we have never heard of stays unknown', () => {
  // The page turns this into a 404, and that has to keep working: an index
  // that answered for everything would serve a page for every typo.
  assert.equal(coinRef('not-a-real-coin-9f2a'), null);
  assert.equal(coinRef('__proto__'), null);
  assert.equal(coinRef('constructor'), null);
});
