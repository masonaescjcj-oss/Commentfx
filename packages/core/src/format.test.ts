import { test } from 'node:test';
import assert from 'node:assert/strict';
import { possessive, indefinite } from './format.ts';

/**
 * Both of these exist because a generated sentence shipped wrong. "E8 Markets’s
 * own pages" and "a E8 Markets challenge" were on a live prop page, produced by
 * a template literal doing English it cannot do.
 */
test('a name ending in s takes the bare apostrophe', () => {
  assert.equal(possessive('E8 Markets'), 'E8 Markets’');
  assert.equal(possessive('FTMO'), 'FTMO’s');
  assert.equal(possessive('Topstep'), 'Topstep’s');
  assert.equal(possessive('The5%ers'), 'The5%ers’');
});

test('the article follows how a name is said, not how it is spelt', () => {
  // Initialisms and digit-letter names are read letter by letter.
  assert.equal(indefinite('E8 Markets'), 'an');
  assert.equal(indefinite('FTMO'), 'an', 'ef-tee-em-oh');
  assert.equal(indefinite('The5%ers'), 'a');
  assert.equal(indefinite('Topstep'), 'a');
  assert.equal(indefinite('Alpha Capital Group'), 'an');
  assert.equal(indefinite('Breakout'), 'a');
  assert.equal(indefinite(''), 'a');
});
