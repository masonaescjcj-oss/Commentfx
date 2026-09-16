import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarise, checkReview, RATING_MIN, RATING_MAX, BODY_MIN } from './reviews.ts';

const body = 'x'.repeat(BODY_MIN + 10);

/**
 * A review may now be words alone. These are the two places that could quietly
 * turn "no rating" into a rating: the validator, which used to refuse it, and
 * the summary, which would otherwise average it in as a zero.
 */
test('a review with no rating is allowed', () => {
  assert.deepEqual(
    checkReview({ kind: 'broker', rating: null, topic: 'withdrawals', body }),
    [],
  );
});

test('a rating that is given still has to be one of the five', () => {
  for (const bad of [0, 6, 2.5, -1]) {
    const problems = checkReview({ kind: 'broker', rating: bad, topic: 'withdrawals', body });
    assert.ok(problems.some((p) => p.field === 'rating'), `accepted ${bad}`);
  }
  for (let n = RATING_MIN; n <= RATING_MAX; n++) {
    assert.deepEqual(checkReview({ kind: 'broker', rating: n, topic: 'withdrawals', body }), []);
  }
});

test('an unrated review counts as a review and not as a zero', () => {
  const stats = summarise([
    { rating: 5, verifiedAt: new Date() },
    { rating: null, verifiedAt: new Date() },
    { rating: null, verifiedAt: null },
  ]);
  assert.equal(stats.total, 3, 'all three are reviews');
  assert.equal(stats.verified, 2, 'two were checked');
  // 5, not 2.5 and not 1.67: the averages see only the ones carrying a number.
  assert.equal(stats.verifiedAverage, 5);
  assert.equal(stats.publishedAverage, 5);
  assert.equal(stats.distribution[5], 1);
  assert.equal(Object.values(stats.distribution).reduce((a, b) => a + b, 0), 1);
});

test('nothing but unrated reviews leaves the average null, never zero', () => {
  const stats = summarise([
    { rating: null, verifiedAt: new Date() },
    { rating: null, verifiedAt: null },
  ]);
  assert.equal(stats.total, 2);
  assert.equal(stats.verifiedAverage, null);
  assert.equal(stats.publishedAverage, null);
});
