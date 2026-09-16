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
  const pep = brokerBySlug('pepperstone')!;
  assert.equal(entityForCountry(pep, 'GB')!.licence.regulator, 'FCA');
  assert.match(protectionFor(pep, 'GB'), /FSCS/);

  const exness = brokerBySlug('exness')!;
  assert.equal(entityForCountry(exness, 'SG')!.licence.regulator, 'FSA-SC');
  assert.match(protectionFor(exness, 'SG'), /No investor compensation/);
});

/**
 * This used to assert that a British reader of the Exness page gets the FCA
 * entity and the FSCS behind it. It passed, and it was wrong.
 *
 * Exness (UK) Ltd holds FCA 730729 and takes no retail clients: its own
 * accounts for 2024 describe a B2B and liquidity-provision business holding
 * $2.47m of client money. A reader in London signing up today is onboarded to
 * Seychelles like almost everyone else. The record says so now, and this is
 * here so nobody quietly puts ['GB'] back.
 */
test('a licence held for other firms is not offered to a reader as their own', () => {
  const exness = brokerBySlug('exness')!;
  const uk = exness.entities.find((e) => e.licence.regulator === 'FCA')!;
  assert.equal(uk.clients, 'professional');
  assert.equal(entityForCountry(exness, 'GB')!.licence.regulator, 'FSA-SC');
  assert.match(protectionFor(exness, 'GB'), /No investor compensation/);
});

test('a broker with no fallback entity still resolves', () => {
  const pep = brokerBySlug('pepperstone')!;
  assert.ok(entityForCountry(pep, 'BR'));
});
