import { servesRetail, type Broker, type ScoreBreakdown, type ScoreKey } from './types.ts';
import { REGULATORS, TIER_SCORE } from './regulators.ts';
import { composite, clamp, round1, type Input } from './scoring-kit.ts';
import { actionsFor, conductScore } from './data/actions.ts';

/**
 * Nominal weights. Live spread monitoring is deliberately NOT part of this
 * model: we score the trading cost a broker publishes, with the date a human
 * last checked it, rather than implying a live feed we do not run.
 */
/**
 * Revised 16 September 2026, when `conduct` was added.
 *
 * The model read who supervises a broker and never what any of them had caught
 * it doing. That was a hole rather than a nicety: a regulator suspending the
 * voting rights of a broker's controlling owner, and a financial crime agency
 * attaching his assets and prosecuting the company, moved this ranking by
 * exactly nothing. Octa sat fifth of ten on spread and withdrawal speed while
 * both were true.
 *
 * The 0.10 conduct takes comes off regulation, platform and reviews. The story
 * the weights tell is unchanged in shape: what protects you is 0.37 of the
 * score, what it costs you is 0.36, what you trade on is 0.13, what other
 * people say is 0.09 and what the company discloses is 0.05.
 *
 * Every weight here is on /methodology, which is the only thing that makes the
 * number worth anything. It moved on the record and in public, not quietly.
 */
export const WEIGHTS: Record<ScoreKey, number> = {
  regulation: 0.27,
  conduct: 0.10,
  cost: 0.18,
  payments: 0.18,
  platform: 0.13,
  reviews: 0.09,
  transparency: 0.05,
};

export const LABELS: Record<ScoreKey, string> = {
  regulation: 'Regulation & licensing',
  conduct: 'Regulatory & legal record',
  cost: 'Published trading cost',
  payments: 'Payments & withdrawals',
  platform: 'Platforms & execution',
  reviews: 'Verified reviews',
  transparency: 'Corporate transparency',
};

/**
 * Best licence tier, plus a small bonus for holding several serious ones —
 * counting only the entities that would take a retail client on.
 *
 * A group licence held by a company that onboards nobody reading this site is
 * a fact about the group and not a protection for the reader, and a ranking for
 * retail traders that scores it as one is measuring the wrong thing. It changes
 * no rank today; it is here so that the day a broker leads with a licence its
 * retail arm does not hold, the number says so.
 */
export function scoreRegulation(b: Broker): number {
  const tiers = b.entities
    .filter(servesRetail)
    .filter((e) => e.licence.status === 'authorised' || e.licence.status === 'registered')
    .map((e) => REGULATORS[e.licence.regulator]?.tier)
    .filter((t): t is 'A' | 'B' | 'C' => Boolean(t));
  if (tiers.length === 0) return 0;

  const base = Math.max(...tiers.map((t) => TIER_SCORE[t]));
  const serious = tiers.filter((t) => t === 'A' || t === 'B').length;
  const breadth = Math.min(1.5, Math.max(0, serious - 1) * 0.5);
  return clamp(base + breadth);
}

/**
 * Spread and commission reduced to one number. A $7 round-turn commission on a
 * standard lot is worth about 0.7 pips on EUR/USD, so the two are comparable.
 */
export function effectiveCostPips(b: Broker): number {
  return b.cost.eurusdSpread + b.cost.commissionPerLot / 10;
}

export function scoreCost(b: Broker): number {
  const eff = effectiveCostPips(b);
  // 0.2 pips all-in → 10;  2.0 pips → ~2.
  return clamp(round1(10 - (eff - 0.2) * 4.5), 1, 10);
}

export function scorePayments(b: Broker): number {
  const p = b.payments;
  const breadth = new Set(p.methods).size;                    // 0–4
  const methodScore = Math.min(5, breadth * 1.25);
  const h = p.statedWithdrawalHours;
  const speedScore = h <= 1 ? 5 : h <= 6 ? 4.2 : h <= 24 ? 3.2 : h <= 48 ? 2 : 1;
  const entry = p.minDepositUsd <= 50 ? 0 : p.minDepositUsd <= 200 ? -0.3 : -0.8;
  return clamp(round1(methodScore + speedScore + entry));
}

export function scorePlatform(b: Broker): number {
  const p = b.platforms;
  const core = new Set(p.list).size * 1.1;                    // up to ~6.6
  const exec = p.execution === 'ecn' ? 2.5 : p.execution === 'stp' ? 2 : p.execution === 'market' ? 1.5 : 0.5;
  const copy = p.copyTrading ? 0.8 : 0;
  return clamp(round1(core + exec + copy));
}

/**
 * Says which of the three things the number means: nobody has looked, somebody
 * looked and found nothing, or here is what they found.
 */
function conductNote(b: Broker): string {
  const value = conductScore(b.slug);
  if (value === null) return 'Nobody has searched the registers and the courts for this one yet — excluded';
  const acted = actionsFor(b.slug);
  if (acted.length === 0) return 'Searched, and nothing on record from any regulator or court';
  return acted
    .map((a) => `${a.authority} (${a.date.slice(0, 4)}, ${a.stage.replace('-', ' ')})`)
    .join('; ');
}

export function scoreTransparency(b: Broker): number {
  const t = b.transparency;
  const checks = [
    t.publishesEntityMapping,
    t.publishesAuditedAccounts,
    t.segregatedClientFunds,
    t.publicOwnership,
  ];
  return clamp(round1((checks.filter(Boolean).length / checks.length) * 10));
}

/** Only counted once there are enough verified reviews to mean anything. */
export function scoreReviews(b: Broker): number | null {
  const { verifiedCount, verifiedAverage } = b.reviews;
  if (verifiedCount < 5 || verifiedAverage == null) return null;
  return clamp(round1(verifiedAverage * 2));
}

/**
 * A component with no data is excluded and its weight redistributed across the
 * rest — never scored as zero. A new broker with no reviews yet is not the same
 * thing as a broker with terrible reviews, and the reader is told which is which.
 */
export function scoreBroker(b: Broker): ScoreBreakdown {
  const inputs: Input<ScoreKey>[] = [
    { key: 'regulation', value: scoreRegulation(b), note: licenceNote(b) },
    { key: 'conduct', value: conductScore(b.slug), note: conductNote(b) },
    { key: 'cost', value: scoreCost(b), note: `${effectiveCostPips(b).toFixed(2)} pips all-in on EUR/USD` },
    { key: 'payments', value: scorePayments(b), note: paymentNote(b) },
    { key: 'platform', value: scorePlatform(b), note: `${b.platforms.list.length} platforms · ${b.platforms.execution.toUpperCase()}` },
    { key: 'reviews', value: scoreReviews(b), note: b.reviews.verifiedCount < 5 ? 'Fewer than 5 verified reviews — excluded' : `${b.reviews.verifiedCount} verified reviews` },
    { key: 'transparency', value: scoreTransparency(b), note: transparencyNote(b) },
  ];
  return composite(inputs, WEIGHTS, LABELS);
}

function licenceNote(b: Broker): string {
  const names = b.entities.map((e) => e.licence.regulator);
  return names.length ? `${names.join(' · ')}` : 'No licence on record';
}

function paymentNote(b: Broker): string {
  const h = b.payments.statedWithdrawalHours;
  const t = h < 1 ? 'under an hour' : h <= 24 ? `~${h}h` : `~${Math.round(h / 24)}d`;
  return `${b.payments.methods.length} methods · stated ${t}`;
}

function transparencyNote(b: Broker): string {
  const t = b.transparency;
  const n = [t.publishesEntityMapping, t.publishesAuditedAccounts, t.segregatedClientFunds, t.publicOwnership].filter(Boolean).length;
  return `${n} of 4 disclosures published`;
}

/**
 * Which legal company a resident of `country` is actually onboarded to.
 * Falls back to the entity that serves '*'.
 */
export function entityForCountry(b: Broker, country: string) {
  return (
    b.entities.find((e) => e.serves.includes(country)) ??
    b.entities.find((e) => e.serves.includes('*')) ??
    b.entities[b.entities.length - 1]
  );
}

export function protectionFor(b: Broker, country: string): string {
  const e = entityForCountry(b, country);
  if (!e) return 'Unknown';
  return REGULATORS[e.licence.regulator]?.compensation ?? 'No investor compensation scheme';
}
