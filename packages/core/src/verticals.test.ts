import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROPS, propBySlug } from './data/props.ts';
import { EXCHANGES, exchangeBySlug } from './data/exchanges.ts';
import { scoreProp, scorePropRules, scorePropEvidence, PROP_WEIGHTS } from './props.ts';
import { propProfileFor } from './data/prop-profiles.ts';
import { scoreExchange, scoreSecurity, scoreSolvency, EXCHANGE_WEIGHTS } from './exchanges.ts';

for (const [name, weights] of [['prop', PROP_WEIGHTS], ['exchange', EXCHANGE_WEIGHTS]] as const) {
  test(`${name} weights sum to 1`, () => {
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(sum - 1) < 1e-9, `sum was ${sum}`);
  });
}

test('every prop firm and exchange scores within range', () => {
  for (const p of PROPS) {
    // Scored the way the site scores it: with the researched profile, which is
    // what the evidence component reads.
    const s = scoreProp(p, propProfileFor(p.slug));
    assert.ok(s.total >= 0 && s.total <= 10, `${p.slug} scored ${s.total}`);
    assert.equal(s.skipped.length, 0, `${p.slug} should have complete data`);
  }
  for (const e of EXCHANGES) {
    const s = scoreExchange(e);
    assert.ok(s.total >= 0 && s.total <= 10, `${e.slug} scored ${s.total}`);
  }
});

/**
 * The component that exists because the ranking could not say "nobody has
 * checked this". A firm with no profile is excluded from it rather than scored
 * zero, and a firm whose own pages refuse us scores below one whose do — which
 * is a claim about the evidence, not about the firm.
 */
test('evidence is excluded when nobody has researched a firm, never zeroed', () => {
  const ftmo = propBySlug('ftmo')!;
  const blind = scoreProp(ftmo);
  assert.deepEqual(blind.skipped, ['evidence'], 'no profile means the component is skipped');
  const ev = blind.components.find((c) => c.key === 'evidence')!;
  assert.equal(ev.value, null);
  assert.equal(ev.appliedWeight, 0, 'a skipped component carries no weight');
});

/**
 * Each half of the evidence rule is checked against a pair that differs in that
 * half alone. The first version of this test compared FTMO against FundingPips,
 * which differ in both, and went on passing when the origin term was deleted
 * entirely — it was reading the register term and reporting it as proof of the
 * other. A comparison that can pass for the wrong reason is not a test.
 */
test('reading a firm’s own pages is worth points on its own', () => {
  // Topstep and FundingPips: neither is named by a register, and only one
  // answered us.
  const read = scorePropEvidence(propBySlug('topstep')!, propProfileFor('topstep'));
  const blocked = scorePropEvidence(propBySlug('fundingpips')!, propProfileFor('fundingpips'));
  assert.ok(read !== null && blocked !== null);
  assert.ok(read > blocked, `read at origin ${read}, refused ${blocked}`);
});

test('an independent register is worth points on its own', () => {
  // Alpha Capital and FundingPips: neither answered us, and only one is on a
  // public company register.
  const registered = scorePropEvidence(propBySlug('alpha-capital-group')!, propProfileFor('alpha-capital-group'));
  const bare = scorePropEvidence(propBySlug('fundingpips')!, propProfileFor('fundingpips'));
  assert.ok(registered !== null && bare !== null);
  assert.ok(registered > bare, `on a register ${registered}, on none ${bare}`);
});

test('both together beat either alone', () => {
  const both = scorePropEvidence(propBySlug('ftmo')!, propProfileFor('ftmo'));
  const originOnly = scorePropEvidence(propBySlug('topstep')!, propProfileFor('topstep'));
  const registerOnly = scorePropEvidence(propBySlug('alpha-capital-group')!, propProfileFor('alpha-capital-group'));
  assert.ok(both !== null && originOnly !== null && registerOnly !== null);
  assert.ok(both > originOnly && both > registerOnly, `${both} vs ${originOnly} and ${registerOnly}`);
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
