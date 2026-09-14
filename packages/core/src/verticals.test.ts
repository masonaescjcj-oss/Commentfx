import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROPS, propBySlug } from './data/props.ts';
import { EXCHANGES, exchangeBySlug } from './data/exchanges.ts';
import { scoreProp, scorePropRules, PROP_WEIGHTS } from './props.ts';
import { scoreExchange, scoreSecurity, scoreSolvency, EXCHANGE_WEIGHTS } from './exchanges.ts';

for (const [name, weights] of [['prop', PROP_WEIGHTS], ['exchange', EXCHANGE_WEIGHTS]] as const) {
  test(`${name} weights sum to 1`, () => {
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `sum was ${sum}`);
  });
}

test('every prop firm and exchange scores within range', () => {
  for (const p of PROPS) {
    const s = scoreProp(p);
    assert.ok(s.total >= 0 && s.total <= 10, `${p.slug} scored ${s.total}`);
    assert.equal(s.skipped.length, 0, `${p.slug} should have complete data`);
  }
  for (const e of EXCHANGES) {
    const s = scoreExchange(e);
    assert.ok(s.total >= 0 && s.total <= 10, `${e.slug} scored ${s.total}`);
  }
});

test('static drawdown beats intraday trailing, all else aside', () => {
  assert.ok(scorePropRules(propBySlug('ftmo')!) > scorePropRules(propBySlug('breakout')!));
});

test('a consistency rule costs a firm rule-fairness points', () => {
  // FundedNext and FTMO differ mainly in the consistency rule.
  assert.ok(scorePropRules(propBySlug('ftmo')!) > scorePropRules(propBySlug('fundednext')!));
});

test('a listed, audited exchange outscores one with neither on solvency', () => {
  assert.ok(scoreSolvency(exchangeBySlug('coinbase')!) > scoreSolvency(exchangeBySlug('mexc')!));
});

test('an exchange that made users whole beats a recent breach that did not', () => {
  const covered = exchangeBySlug('bybit')!;
  const hypothetical = { ...covered, security: { ...covered.security, madeUsersWhole: false } };
  assert.ok(scoreSecurity(covered) > scoreSecurity(hypothetical));
});

test('a clean record beats any breach history', () => {
  assert.ok(scoreSecurity(exchangeBySlug('kraken')!) > scoreSecurity(exchangeBySlug('kucoin')!));
});
