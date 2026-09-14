import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BROKERS, brokerBySlug } from './data/brokers.ts';
import { scoreBroker, scoreRegulation, entityForCountry, protectionFor, WEIGHTS } from './score.ts';

test('weights sum to 1', () => {
  const sum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, `weights sum to ${sum}`);
});

test('every broker scores between 0 and 10', () => {
  for (const b of BROKERS) {
    const s = scoreBroker(b);
    assert.ok(s.total >= 0 && s.total <= 10, `${b.slug} scored ${s.total}`);
  }
});

test('a component with no data is excluded, not scored zero', () => {
  const s = scoreBroker(BROKERS[0]!);
  assert.ok(s.skipped.includes('reviews'), 'reviews should be skipped with 0 verified');
  const reviews = s.components.find((c) => c.key === 'reviews')!;
  assert.equal(reviews.appliedWeight, 0);
  const applied = s.components.reduce((a, c) => a + c.appliedWeight, 0);
  assert.ok(Math.abs(applied - 1) < 1e-9, 'remaining weights must renormalise to 1');
});

test('tier-1 regulation outranks offshore-only', () => {
  assert.ok(scoreRegulation(brokerBySlug('pepperstone')!) > scoreRegulation(brokerBySlug('roboforex')!));
});

test('entity map resolves by country, with a fallback', () => {
  const exness = brokerBySlug('exness')!;
  assert.equal(entityForCountry(exness, 'GB')!.licence.regulator, 'FCA');
  assert.equal(entityForCountry(exness, 'SG')!.licence.regulator, 'FSA-SC');
  assert.match(protectionFor(exness, 'GB'), /FSCS/);
  assert.match(protectionFor(exness, 'SG'), /No investor compensation/);
});

test('a broker with no fallback entity still resolves', () => {
  const pep = brokerBySlug('pepperstone')!;
  assert.ok(entityForCountry(pep, 'BR'));
});
