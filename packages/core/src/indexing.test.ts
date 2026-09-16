import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  brokerIndexable, propIndexable, exchangeIndexable, compareIndexable,
  coinIndexable, pathIndexable, releasedBy,
} from './indexing.ts';
import { BROKERS, brokerBySlug } from './data/brokers.ts';
import { PROPS } from './data/props.ts';
import { EXCHANGES } from './data/exchanges.ts';

/**
 * The gate decides what competes in a search index, so it is worth more than
 * the sum of its branches: these check the shape of the resulting index, which
 * is the thing docs/SEO.md actually argues about.
 */
test('every record we hold today clears its own floor', () => {
  for (const b of BROKERS) {
    const d = brokerIndexable(b);
    assert.ok(d.indexable, `${b.name}: ${d.indexable ? '' : d.reason}`);
  }
  for (const p of PROPS) assert.ok(propIndexable(p).indexable, p.name);
  for (const e of EXCHANGES) assert.ok(exchangeIndexable(e).indexable, e.name);
});

test('a record missing the thing that makes it a record is held back', () => {
  const b = brokerBySlug('exness')!;
  assert.equal(brokerIndexable({ ...b, entities: [] }).indexable, false);

  const noNumber = {
    ...b,
    entities: b.entities.map((e) => ({ ...e, licence: { ...e.licence, number: '' } })),
  };
  const d = brokerIndexable(noNumber);
  assert.equal(d.indexable, false);
  assert.match(d.indexable ? '' : d.reason, /licence number/);
});

test('a comparison needs both sides, and says which one failed', () => {
  const a = brokerBySlug('exness')!;
  const b = brokerBySlug('ic-markets')!;
  assert.ok(compareIndexable(a, b).indexable);

  const broken = { ...b, entities: [] };
  const d = compareIndexable(a, broken);
  assert.equal(d.indexable, false);
  assert.match(d.indexable ? '' : d.reason, new RegExp(b.name));
});

test('coin pages are out, and the reason says why rather than just "thin"', () => {
  const d = coinIndexable();
  assert.equal(d.indexable, false);
  assert.match(d.indexable ? '' : d.reason, /source of the price/);
});

test('tools are out, and only tools', () => {
  for (const p of ['/search', '/reviews/withdraw', '/admin', '/admin/broker/exness']) {
    assert.equal(pathIndexable(p).indexable, false, p);
  }
  for (const p of ['/', '/brokers', '/brokers/exness', '/reviews', '/best/lowest-spread']) {
    assert.ok(pathIndexable(p).indexable, p);
  }
});

test('a release date holds a page back and then lets it go', () => {
  const now = new Date('2026-09-16T00:00:00Z');
  assert.equal(releasedBy('2026-10-01T00:00:00Z', now).indexable, false);
  assert.ok(releasedBy('2026-09-01T00:00:00Z', now).indexable);
  assert.ok(releasedBy(null, now).indexable, 'no date means publish now');
  assert.ok(releasedBy(undefined, now).indexable);
});

/**
 * The shape of the index, asserted.
 *
 * docs/SEO.md claims roughly 78 indexable pages against 179 URLs, and that the
 * ratio is the point. If somebody adds a hundred pages of something, this is
 * where it shows up — as a failing number rather than as a slow decline in
 * crawl rate three months later.
 */
test('the index stays mostly records, comparisons and hubs', () => {
  const records = BROKERS.filter((b) => brokerIndexable(b).indexable).length
    + PROPS.filter((p) => propIndexable(p).indexable).length
    + EXCHANGES.filter((e) => exchangeIndexable(e).indexable).length;
  assert.equal(records, 26, 'every record we hold is indexable today');

  // Coin pages are the 100 that stay out. If that ever flips, this fails.
  assert.equal(coinIndexable().indexable, false);
});
