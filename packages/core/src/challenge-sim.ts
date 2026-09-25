import type { DrawdownType } from './props.ts';

/**
 * A prop firm challenge, simulated.
 *
 * The question a trader brings to a prop firm page is not "what is the
 * drawdown" but "would I pass" — and the honest answer depends on how they
 * trade as much as on the rules. So this plays the rules forward against a
 * trader described in four numbers, a few thousand times, and counts how the
 * attempts end.
 *
 * Everything is in percent of the starting balance, which starts at 100, so
 * the account size only scales the dollars a page prints. The model, in full:
 *
 *   - Each trade risks a fixed share of the starting balance, the way most
 *     firms size risk. It wins `rewardRisk` times that, or loses it.
 *   - A winning trade goes straight to its target. A losing trade first moves
 *     in the trader's favour by a random amount up to half its target, then
 *     reverses to its stop. That excursion changes nothing except an intraday
 *     trailing floor — which is exactly the trap that design sets, and leaving
 *     it out would make intraday trailing look like end-of-day trailing.
 *   - The daily limit is measured from the day's opening balance, as a share
 *     of the starting balance. Some firms measure it from equity or from the
 *     initial balance instead; the difference is small next to the drawdown.
 *   - Static: the floor never moves. End-of-day trailing: it follows the
 *     highest closing balance. Intraday trailing: it follows the highest
 *     equity, unrealised excursions included. No floor here ever stops rising;
 *     some firms stop theirs at the starting balance, and that is in their
 *     terms or it does not exist.
 *   - Reaching the target stops the trader taking risk. The attempt passes once
 *     the minimum trading days are met.
 *
 * What it does not model is printed on the page beside the results: costs and
 * slippage, streaks beyond chance, news gaps, second phases and consistency
 * rules. A simulation is a way to see what the rules do to a given way of
 * trading, not a forecast of anybody's result.
 */

export interface ChallengeRules {
  /** Profit target, % of the starting balance. */
  targetPct: number;
  /** Daily loss limit, % of the starting balance, from the day's opening balance. */
  dailyPct: number;
  /** Maximum loss, % of the starting balance. */
  maxPct: number;
  drawdown: DrawdownType;
  minDays: number;
  /** Trading days allowed, or null for no limit. */
  timeLimitDays: number | null;
}

export interface Trader {
  /** Risk per trade, % of the starting balance. */
  riskPct: number;
  /** Share of trades that win, 0 to 1. */
  winRate: number;
  /** A winner makes this many times what a loser loses. */
  rewardRisk: number;
  tradesPerDay: number;
}

/** A trade as the rules see it: where it closed, and how high it got before. */
export interface TradeSpec {
  pnl: number;
  /** The best unrealised result along the way, never below the close for a winner. */
  peak: number;
}

export type Outcome = 'passed' | 'max-loss' | 'daily-loss' | 'out-of-time' | 'unfinished';

export interface PathPoint {
  /** Days elapsed, fractional, for drawing. */
  t: number;
  equity: number;
  floor: number;
  dailyFloor: number;
}

export interface Run {
  outcome: Outcome;
  /** The day the attempt ended on. */
  days: number;
  path: PathPoint[];
}

export const START = 100;
/** A year of trading days. An attempt still open after that is reported as unfinished. */
export const MAX_DAYS = 250;

/** Small, fast, seedable — the same seed gives the same attempt on the server and in a browser. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Play the rules against a fixed list of trades. `nextTrade` returns the next
 * one, or null when there are no more — which is how a test hands in a worked
 * example and how the simulation hands in random ones.
 */
export function runTrades(
  rules: ChallengeRules,
  tradesPerDay: number,
  nextTrade: () => TradeSpec | null,
  record = false,
): Run {
  const path: PathPoint[] = [];
  let balance = START;
  let hiClose = START;
  let hiEquity = START;
  const floorNow = () =>
    rules.drawdown === 'static' ? START - rules.maxPct
    : rules.drawdown === 'eod-trailing' ? hiClose - rules.maxPct
    : hiEquity - rules.maxPct;

  const lastDay = rules.timeLimitDays ?? MAX_DAYS;
  let dailyFloor = START - rules.dailyPct;
  if (record) path.push({ t: 0, equity: balance, floor: floorNow(), dailyFloor });

  for (let day = 1; day <= lastDay; day += 1) {
    dailyFloor = balance - rules.dailyPct;

    for (let k = 0; k < tradesPerDay; k += 1) {
      const trade = nextTrade();
      if (!trade) {
        return { outcome: 'unfinished', days: day, path };
      }
      const t0 = day - 1 + k / tradesPerDay;
      const t1 = day - 1 + (k + 1) / tradesPerDay;

      // The high point first: it can lift an intraday floor before the trade
      // turns, and it cannot breach anything on the way up.
      const peakEquity = balance + Math.max(trade.peak, trade.pnl, 0);
      if (peakEquity > hiEquity) hiEquity = peakEquity;
      if (record && peakEquity > balance && peakEquity > balance + trade.pnl) {
        path.push({ t: (t0 + t1) / 2, equity: peakEquity, floor: floorNow(), dailyFloor });
      }

      balance += trade.pnl;
      if (balance > hiEquity) hiEquity = balance;
      const floor = floorNow();
      if (record) path.push({ t: t1, equity: balance, floor, dailyFloor });

      // Falling through two floors, the higher one is the one crossed first.
      if (balance < floor || balance < dailyFloor) {
        return { outcome: floor >= dailyFloor ? 'max-loss' : 'daily-loss', days: day, path };
      }

      if (balance >= START + rules.targetPct) {
        const days = Math.max(day, rules.minDays);
        if (days > lastDay) return { outcome: 'out-of-time', days: lastDay, path };
        return { outcome: 'passed', days, path };
      }
    }

    // The day closes: an end-of-day floor moves now and only now.
    if (balance > hiClose) hiClose = balance;
    if (record && rules.drawdown === 'eod-trailing') {
      path.push({ t: day, equity: balance, floor: floorNow(), dailyFloor: balance - rules.dailyPct });
    }
  }

  return { outcome: rules.timeLimitDays !== null ? 'out-of-time' : 'unfinished', days: lastDay, path };
}

/** One attempt by a trader, drawn from a seed. */
export function simulateRun(rules: ChallengeRules, trader: Trader, seed: number, record = false): Run {
  const r = rng(seed);
  const risk = trader.riskPct;
  const win = risk * trader.rewardRisk;
  return runTrades(rules, trader.tradesPerDay, () => {
    if (r() < trader.winRate) return { pnl: win, peak: win };
    return { pnl: -risk, peak: r() * win * 0.5 };
  }, record);
}

export interface Summary {
  runs: number;
  counts: Record<Outcome, number>;
  /** Median days to pass, among attempts that passed. */
  medianDaysToPass: number | null;
}

/**
 * Many attempts. Attempt `i` always uses seed `seed + i`, so two rule sets run
 * with the same seed face the same trades in the same order — comparing the
 * three drawdown designs this way changes the rule and nothing else.
 */
export function simulate(rules: ChallengeRules, trader: Trader, runs = 2000, seed = 1): Summary {
  const counts: Record<Outcome, number> = { passed: 0, 'max-loss': 0, 'daily-loss': 0, 'out-of-time': 0, unfinished: 0 };
  const passDays: number[] = [];
  for (let i = 0; i < runs; i += 1) {
    const run = simulateRun(rules, trader, seed + i);
    counts[run.outcome] += 1;
    if (run.outcome === 'passed') passDays.push(run.days);
  }
  passDays.sort((a, b) => a - b);
  return {
    runs,
    counts,
    medianDaysToPass: passDays.length ? passDays[Math.floor(passDays.length / 2)]! : null,
  };
}
