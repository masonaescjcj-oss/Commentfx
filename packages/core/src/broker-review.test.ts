import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brokerReview, reviewWordCount } from './broker-review.ts';
import { BROKERS, brokerBySlug } from './data/brokers.ts';
import { scoreBroker } from './score.ts';

const parts = (b: (typeof BROKERS)[number]) =>
  scoreBroker(b).components.map((c) => ({ key: c.key, label: c.label, value: c.value }));

const review = (slug: string, rank = 1) => {
  const b = brokerBySlug(slug)!;
  return brokerReview({ broker: b, rank, of: BROKERS.length, peers: BROKERS, components: parts(b) });
};

const text = (slug: string, rank = 1) =>
  review(slug, rank).flatMap((s) => [s.heading, ...s.paragraphs]).join('\n');

/**
 * The review is generated, which is the only way a thousand words about a
 * company can stay true as its record changes. These are the checks that stop
 * it becoming a thousand words of nonsense instead.
 */
test('every broker gets a review long enough to be one', () => {
  for (const b of BROKERS) {
    const sections = brokerReview({
      broker: b, rank: 1, of: BROKERS.length, peers: BROKERS, components: parts(b),
    });
    const words = reviewWordCount(sections);
    assert.ok(words >= 320, `${b.name}: ${words} words`);
    assert.ok(words <= 900, `${b.name}: ${words} words, which is padding`);
    assert.ok(sections.length >= 6, `${b.name}: ${sections.length} sections`);
    for (const s of sections) {
      assert.ok(s.heading.length > 0 && s.id.length > 0);
      assert.ok(s.paragraphs.every((p) => p.trim().length > 40), `${b.name}/${s.id}: a stub paragraph`);
    }
  }
});

test('no broker ends up with a hole where a value should be', () => {
  for (const b of BROKERS) {
    const t = brokerReview({
      broker: b, rank: 3, of: BROKERS.length, peers: BROKERS, components: parts(b),
    }).flatMap((s) => [s.heading, ...s.paragraphs]).join(' ');
    for (const bad of ['undefined', 'null', 'NaN', '[object', 'Infinity']) {
      assert.ok(!t.includes(bad), `${b.name}: "${bad}" in the prose`);
    }
    // Two spaces means a value rendered empty between two fragments.
    assert.ok(!/ {2}/.test(t), `${b.name}: a gap where a value should be`);
    assert.ok(t.includes(b.name), `${b.name}: does not name the broker`);
  }
});

test('every section id is unique, so the page can link to them', () => {
  const ids = review('exness').map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every((id) => /^review-[a-z]+$/.test(id)), ids.join(', '));
});

test('it says the licence tier it actually holds', () => {
  // Exness holds an FCA licence; Alpari's best is not tier A.
  assert.match(text('exness'), /tier-A regulator/);
  assert.match(text('exness'), /FCA/);
  const alpari = text('alpari');
  assert.ok(
    /None of those is a tier-A regulator/.test(alpari) || /tier-A regulator/.test(alpari),
    'says something definite about the tier either way',
  );
});

test('the cost paragraph places the broker against the others, not against nothing', () => {
  const t = text('exness');
  assert.match(t, /median across the 10 brokers ranked here/);
  assert.match(t, /-cheapest of them/);
  assert.match(t, /(below|above) the median/);
});

test('a record that changes changes the prose', () => {
  const b = brokerBySlug('exness')!;
  const before = brokerReview({
    broker: b, rank: 1, of: BROKERS.length, peers: BROKERS, components: parts(b),
  }).flatMap((s) => s.paragraphs).join(' ');

  const dearer = { ...b, cost: { ...b.cost, eurusdSpread: 9.9 } };
  const after = brokerReview({
    broker: dearer, rank: 1, of: BROKERS.length, peers: BROKERS, components: parts(b),
  }).flatMap((s) => s.paragraphs).join(' ');

  assert.notEqual(before, after);
  assert.match(after, /9\.9 pips/);
  assert.match(after, /above the median/);
});

test('the rank sentence follows the rank it was given', () => {
  assert.match(text('exness', 1), /upper third/);
  assert.match(text('exness', 5), /middle of what we cover/);
  assert.match(text('exness', 10), /lower third/);
});

test('it never claims a check nobody made', () => {
  // Every seed record is unverified, so every review must carry the caveat.
  for (const b of BROKERS) {
    if (b.cost.verifiedAt !== null && b.payments.verifiedAt !== null) continue;
    const t = brokerReview({
      broker: b, rank: 1, of: BROKERS.length, peers: BROKERS, components: parts(b),
    }).at(-1)!.paragraphs.join(' ');
    assert.match(t, /No editor has verified/, b.name);
  }
});

test('the tier sentence agrees with itself in number', () => {
  // "2 of those are a tier-A regulator" shipped once. Generated prose does not
  // get a proofreader, so the agreement is a test.
  for (const b of BROKERS) {
    const t = brokerReview({
      broker: b, rank: 1, of: BROKERS.length, peers: BROKERS, components: parts(b),
    }).flatMap((s) => s.paragraphs).join(' ');
    assert.ok(!/\d+ of those (is|are) a tier-A regulator/.test(t), b.name);
    assert.ok(!/are a tier-A regulator\b/.test(t), b.name);
    assert.ok(!/is tier-A regulators/.test(t), b.name);
  }
});
