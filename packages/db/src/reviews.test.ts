import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestDb } from './client.ts';
import { seed } from './seed.ts';
import {
  submitReview, withdrawReview, reviewsFor, reviewStatsFor, reviewQueue,
  verifyReview, hideReview, countsTowardScore, MIN_FOR_SCORE,
  withdrawalCode, parseWithdrawalCode,
} from './reviews.ts';

const BODY =
  'Withdrew $2,400 to a bank account on the 3rd and it landed on the 6th, which ' +
  'matches what they publish. Support answered in about four hours both times I asked.';

const review = (over: Record<string, unknown> = {}) => ({
  brokerSlug: 'exness', rating: 4, topic: 'withdrawals', body: BODY,
  authorHash: 'author-1', ...over,
});

async function fresh() {
  const h = await makeTestDb();
  await seed(h.db);
  return h;
}

test('a review is published immediately and counts for nothing', async () => {
  const { db, close } = await fresh();
  const res = await submitReview(db, review());
  assert.ok(res.ok, 'accepted');

  const shown = await reviewsFor(db, 'exness');
  assert.equal(shown.length, 1, 'a reader sees it at once');
  assert.equal(shown[0]!.verified, false);

  const stats = await reviewStatsFor(db, 'exness');
  assert.equal(stats.total, 1);
  assert.equal(stats.verified, 0, 'publishing is not counting');
  assert.equal(stats.verifiedAverage, null, 'nothing reaches the score until a person checks it');
  await close();
});

test('buying a hundred reviews buys a hundred unverified paragraphs', async () => {
  const { db, close } = await fresh();
  for (let i = 0; i < 100; i++) {
    await submitReview(db, review({ authorHash: `bought-${i}`, rating: 5 }));
  }
  const stats = await reviewStatsFor(db, 'exness');
  assert.equal(stats.total, 100);
  assert.equal(stats.verified, 0);
  assert.equal(countsTowardScore(stats.verified), false, 'the score has not moved at all');
  await close();
});

test('one author cannot flood one broker on one topic', async () => {
  const { db, close } = await fresh();
  const first = await submitReview(db, review());
  const second = await submitReview(db, review({ rating: 1, body: `${BODY} Second attempt.` }));

  assert.ok(first.ok);
  assert.equal(second.ok, false);
  assert.equal((second as { duplicate?: true }).duplicate, true);
  assert.equal((await reviewsFor(db, 'exness')).length, 1);
  await close();
});

test('the same author may write about a different experience', async () => {
  const { db, close } = await fresh();
  await submitReview(db, review());
  const other = await submitReview(db, review({ topic: 'support' }));
  assert.ok(other.ok, 'a different topic is a different experience, not a flood');
  assert.equal((await reviewsFor(db, 'exness')).length, 2);
  await close();
});

test('a one-line review is refused with a reason, not silently dropped', async () => {
  const { db, close } = await fresh();
  const res = await submitReview(db, review({ body: 'scam!!!' }));
  assert.equal(res.ok, false);
  const problems = (res as { problems?: Array<{ field: string }> }).problems ?? [];
  assert.equal(problems[0]!.field, 'body');
  assert.equal((await reviewsFor(db, 'exness')).length, 0);
  await close();
});

test('a rating outside the scale is refused', async () => {
  const { db, close } = await fresh();
  for (const rating of [0, 6, 4.5, -1]) {
    const res = await submitReview(db, review({ rating, authorHash: `a-${rating}` }));
    assert.equal(res.ok, false, `rating ${rating} must not be accepted`);
  }
  await close();
});

test('verifying takes a name and is what moves the score', async () => {
  const { db, close } = await fresh();
  for (let i = 0; i < MIN_FOR_SCORE; i++) {
    await submitReview(db, review({ authorHash: `real-${i}`, rating: 4 }));
  }
  const queue = await reviewQueue(db);
  assert.equal(queue.length, MIN_FOR_SCORE);

  for (const q of queue) await verifyReview(db, q.id, 'editor@commentfx');

  const stats = await reviewStatsFor(db, 'exness');
  assert.equal(stats.verified, MIN_FOR_SCORE);
  assert.equal(stats.verifiedAverage, 4);
  assert.equal(countsTowardScore(stats.verified), true);
  assert.equal((await reviewQueue(db)).length, 0, 'a verified review leaves the queue');
  await close();
});

test('verifying twice does not re-stamp the first check', async () => {
  const { db, close } = await fresh();
  const res = await submitReview(db, review());
  assert.ok(res.ok);
  const [q] = await reviewQueue(db);
  await verifyReview(db, q!.id, 'first@commentfx');
  const stats = await reviewStatsFor(db, 'exness');
  await verifyReview(db, q!.id, 'second@commentfx');
  assert.deepEqual(await reviewStatsFor(db, 'exness'), stats, 'the record of who checked it stands');
  await close();
});

test('an author can withdraw what they wrote, with the token they were given', async () => {
  const { db, close } = await fresh();
  const res = await submitReview(db, review());
  assert.ok(res.ok);
  const [r] = await reviewsFor(db, 'exness');

  assert.equal(await withdrawReview(db, r!.id, 'not-the-token'), false, 'a guess must not work');
  assert.equal(await withdrawReview(db, r!.id, ''), false, 'an empty token must not work');
  assert.equal((await reviewsFor(db, 'exness')).length, 1);

  assert.equal(await withdrawReview(db, r!.id, res.deleteToken), true);
  assert.equal((await reviewsFor(db, 'exness')).length, 0, 'withdrawn means gone from the page');
  await close();
});

test('a withdrawn review is kept, not deleted, and stops counting', async () => {
  const { db, close } = await fresh();
  const res = await submitReview(db, review());
  assert.ok(res.ok);
  const [r] = await reviewsFor(db, 'exness');
  await verifyReview(db, r!.id, 'editor@commentfx');
  await withdrawReview(db, r!.id, res.deleteToken);

  const stats = await reviewStatsFor(db, 'exness');
  assert.equal(stats.total, 0);
  assert.equal(stats.verified, 0, 'a verified review that is withdrawn stops counting');
  await close();
});

test('an editor removing a review records why', async () => {
  const { db, close } = await fresh();
  await submitReview(db, review());
  const [r] = await reviewsFor(db, 'exness');
  await hideReview(db, r!.id, 'names a support agent personally');
  assert.equal((await reviewsFor(db, 'exness')).length, 0);
  await close();
});

test('the evidence a reviewer offers privately is never in what a reader gets', async () => {
  const { db, close } = await fresh();
  await submitReview(db, review({ evidenceNote: 'ticket #44192, statement attached by email' }));
  const shown = await reviewsFor(db, 'exness');
  assert.equal(JSON.stringify(shown).includes('44192'), false, 'private evidence must not reach the page');
  const queue = await reviewQueue(db);
  assert.match(queue[0]!.evidenceNote!, /44192/, 'but an editor must see it');
  await close();
});

test('reviews of one broker do not appear under another', async () => {
  const { db, close } = await fresh();
  await submitReview(db, review());
  await submitReview(db, review({ brokerSlug: 'ic-markets', rating: 2 }));
  assert.equal((await reviewsFor(db, 'exness')).length, 1);
  assert.equal((await reviewStatsFor(db, 'ic-markets')).total, 1);
  await close();
});

test('the code an author is given names the review and carries its secret', () => {
  const code = withdrawalCode(42, 'abc.def');
  assert.equal(parseWithdrawalCode(code)?.id, 42);
  assert.equal(parseWithdrawalCode(code)?.token, 'abc.def', 'a secret containing a dot survives the split');
});

test('a malformed code is refused rather than read as review 0', () => {
  for (const bad of ['', '.', 'abc', '.token', '0.token', '-1.token', '12.']) {
    assert.equal(parseWithdrawalCode(bad), null, `"${bad}" must not parse`);
  }
});

test('a withdrawal code cannot be reused to withdraw a different review', async () => {
  const { db, close } = await fresh();
  const mine = await submitReview(db, review());
  const theirs = await submitReview(db, review({ authorHash: 'someone-else', topic: 'support' }));
  assert.ok(mine.ok);
  assert.ok(theirs.ok);

  assert.equal(await withdrawReview(db, theirs.id, mine.deleteToken), false,
    'holding one code must not let you delete someone else\'s review');
  assert.equal((await reviewsFor(db, 'exness')).length, 2);
  await close();
});
