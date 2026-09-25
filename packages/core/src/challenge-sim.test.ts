import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runTrades, simulate, simulateRun, START, type ChallengeRules, type TradeSpec, type Trader } from './challenge-sim.ts';

const base: ChallengeRules = { targetPct: 8, dailyPct: 4, maxPct: 8, drawdown: 'static', minDays: 0, timeLimitDays: null };
const feed = (trades: TradeSpec[]) => { let i = 0; return () => trades[i++] ?? null; };

/**
 * The drawdown guide's worked example, trade for trade: a day that peaks at
 * +5 and closes at +1, then two days of -3.5, on an 8% allowance. The guide
 * says static survives, end-of-day trailing survives, intraday trailing ends
 * $500 into day three. The simulator has to agree with the page that
 * explains it, or one of them is wrong.
 */
const article: TradeSpec[] = [{ pnl: 1, peak: 5 }, { pnl: -3.5, peak: 0 }, { pnl: -3.5, peak: 0 }];

test('the guide’s worked example: static survives with 2 to spare', () => {
  const run = runTrades({ ...base, drawdown: 'static' }, 1, feed(article), true);
  assert.equal(run.outcome, 'unfinished');
  assert.equal(run.path.at(-1)!.floor, 92);
  assert.equal(run.path.at(-1)!.equity, 94);
});

test('the guide’s worked example: end-of-day trailing survives with 1 to spare', () => {
  const run = runTrades({ ...base, drawdown: 'eod-trailing' }, 1, feed(article), true);
  assert.equal(run.outcome, 'unfinished');
  assert.equal(run.path.at(-1)!.floor, 93);
});

test('the guide’s worked example: intraday trailing is ended on day three', () => {
  const run = runTrades({ ...base, drawdown: 'intraday-trailing' }, 1, feed(article), true);
  assert.equal(run.outcome, 'max-loss');
  assert.equal(run.days, 3);
  assert.equal(run.path.at(-1)!.floor, 97);
});

test('a static floor never moves, whatever the account does', () => {
  const run = runTrades(base, 2, feed([{ pnl: 3, peak: 3 }, { pnl: 2, peak: 2 }, { pnl: -1, peak: 4 }]), true);
  assert.ok(run.path.every((p) => p.floor === START - base.maxPct));
});

test('an end-of-day floor moves at the close and not before', () => {
  const rules = { ...base, drawdown: 'eod-trailing' as const };
  // Up 3 then down 2 inside one day: the close is +1, so the floor rises by 1, not 3.
  const run = runTrades(rules, 2, feed([{ pnl: 3, peak: 3 }, { pnl: -2, peak: 0 }]), true);
  assert.equal(run.path.at(-1)!.floor, START + 1 - base.maxPct);
});

test('the higher of two floors is the one a falling account crosses first', () => {
  // Daily 2, max 8, static: a 3-point loss on day one breaks the daily limit first.
  const run = runTrades({ ...base, dailyPct: 2 }, 1, feed([{ pnl: -3, peak: 0 }]));
  assert.equal(run.outcome, 'daily-loss');
  // Max 2, daily 4: the same loss breaks the maximum first.
  const run2 = runTrades({ ...base, maxPct: 2 }, 1, feed([{ pnl: -3, peak: 0 }]));
  assert.equal(run2.outcome, 'max-loss');
});

test('reaching the target early still waits for the minimum trading days', () => {
  const run = runTrades({ ...base, minDays: 5 }, 1, feed([{ pnl: 9, peak: 9 }]));
  assert.equal(run.outcome, 'passed');
  assert.equal(run.days, 5);
});

test('a time limit ends an attempt that has not passed', () => {
  const trades = Array.from({ length: 20 }, () => ({ pnl: 0.1, peak: 0.1 }));
  const run = runTrades({ ...base, timeLimitDays: 10 }, 1, feed(trades));
  assert.equal(run.outcome, 'out-of-time');
});

const trader: Trader = { riskPct: 1, winRate: 0.45, rewardRisk: 2, tradesPerDay: 2 };

test('the same seed gives the same attempt — the server and the browser must agree', () => {
  assert.deepEqual(simulateRun(base, trader, 42, true), simulateRun(base, trader, 42, true));
  assert.deepEqual(simulate(base, trader, 300, 7), simulate(base, trader, 300, 7));
});

test('every attempt is counted exactly once', () => {
  const s = simulate(base, trader, 500);
  assert.equal(Object.values(s.counts).reduce((a, b) => a + b, 0), 500);
});

/**
 * The claim the whole feature exists to show: for the same trader facing the
 * same trades, a static floor passes at least as often as an end-of-day one,
 * and end-of-day at least as often as intraday. If the model ever says
 * otherwise, the model is wrong, not the guide.
 */
test('static passes at least as often as end-of-day trailing, and that as often as intraday', () => {
  const pass = (drawdown: ChallengeRules['drawdown']) => simulate({ ...base, drawdown }, trader, 2000, 1).counts.passed;
  const s = pass('static');
  const e = pass('eod-trailing');
  const i = pass('intraday-trailing');
  // Strict: at 1% risk and two trades a day the three separate by several
  // points over 2,000 attempts (94.6, 90.3, 85.3 when written). A tie here
  // means one design has collapsed into another — which is what happened when
  // an intraday floor was made to follow closes, and a >= test let it through.
  assert.ok(s > e, `static ${s} did not beat end-of-day ${e}`);
  assert.ok(e > i, `end-of-day ${e} did not beat intraday ${i}`);
});
