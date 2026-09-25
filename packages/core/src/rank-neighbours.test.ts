import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nearestInRank } from './rank-neighbours.ts';

const ranked = (ranks: number[]) => ranks.map((rank) => ({ rank, item: `#${rank}` }));

test('from the middle, the neighbours are the ones either side, in rank order', () => {
  const others = ranked([1, 2, 3, 4, 5, 6, 8, 9, 10]); // #7 is the page
  assert.deepEqual(nearestInRank(others, 7).map((x) => x.rank), [6, 8, 5].sort((a, b) => a - b));
});

test('from the top, the neighbours are the next three down', () => {
  assert.deepEqual(nearestInRank(ranked([2, 3, 4, 5]), 1).map((x) => x.rank), [2, 3, 4]);
});

test('from the bottom, the neighbours are the three above', () => {
  assert.deepEqual(nearestInRank(ranked([1, 2, 3, 4, 5, 6, 7]), 8).map((x) => x.rank), [5, 6, 7]);
});

test('an equal distance is broken towards the better rank, and a tie on rank keeps the list order', () => {
  // #4 is the page; #3 and #5 are equally near, then #2 and #6.
  assert.deepEqual(nearestInRank(ranked([1, 2, 3, 5, 6]), 4, 3).map((x) => x.rank), [2, 3, 5]);
  const tied = [{ rank: 2, item: 'a' }, { rank: 2, item: 'b' }, { rank: 5, item: 'c' }];
  assert.deepEqual(nearestInRank(tied, 3, 2).map((x) => x.item), ['a', 'b']);
});

test('fewer companies than asked for returns what there is', () => {
  assert.equal(nearestInRank(ranked([2]), 1).length, 1);
  assert.equal(nearestInRank([], 1).length, 0);
});
