import { composite, clamp, round1, scale, type Input, type Component, type Composite } from './scoring-kit.ts';
import { conductScore, actionsFor } from './data/actions.ts';
import { evidenceScore, evidenceNote, type EvidenceInput } from './data/research.ts';
import type { LogoMark } from './types.ts';

export interface Exchange {
  slug: string;
  name: string;
  founded: number;
  headquarters: string;
  /** The company's own site — where an editor checks the figures on this record. */
  website: string;
  kind: 'centralised' | 'decentralised';
  /** Taker fee at the lowest tier, as a percentage. */
  takerFeePct: number;
  makerFeePct: number;
  /** Reported 24h spot volume in USD. Used only as a liquidity band. */
  spotVolumeUsd: number;
  reserves: {
    /** Publishes a proof-of-reserves attestation readers can verify on-chain. */
    proofOfReserves: boolean;
    /** Audited by a named third party, or listed on a public market. */
    thirdPartyAudit: boolean;
    publiclyListed: boolean;
  };
  security: {
    /** Year of the last customer-funds breach, or null if none on record. */
    lastBreachYear: number | null;
    /** Firm maintains a named, funded insurance pool. */
    insuranceFund: boolean;
    /** Losses from the last incident were made whole. */
    madeUsersWhole: boolean | null;
  };
  transparency: {
    publishesFeeSchedule: boolean;
    disclosesLegalEntity: boolean;
    publishesIncidentReports: boolean;
  };
  why: string;
  logo: LogoMark;
}

export type ExchangeKey =
  | 'solvency' | 'security' | 'conduct' | 'fees' | 'liquidity' | 'transparency' | 'evidence';

/**
 * `conduct` carries more here than on the broker side, and the reason is what
 * the research turned up rather than a view about crypto.
 *
 * Three of these eight have pleaded guilty to a US federal offence or been
 * fined billions: Binance took a $3.4bn civil money penalty and a five-year
 * monitor, OKX's operator pleaded guilty and paid about $505m, KuCoin's
 * pleaded guilty, paid $297m and left the country. A model that ranked those
 * companies on fee tiers and reported volume while saying nothing about any of
 * it would be answering a question nobody asked — the same failure the broker
 * side fixed when it added conduct at 0.10.
 *
 * It reads the same register the brokers do, with the same rule: a firm nobody
 * has searched is excluded rather than given ten.
 */
export const EXCHANGE_WEIGHTS: Record<ExchangeKey, number> = {
  solvency: 0.25, security: 0.20, conduct: 0.15, fees: 0.14, liquidity: 0.10, transparency: 0.08,
  evidence: 0.08,
};

export const EXCHANGE_LABELS: Record<ExchangeKey, string> = {
  solvency: 'Solvency evidence',
  security: 'Security record',
  conduct: 'Regulatory and legal record',
  fees: 'Trading fees',
  liquidity: 'Liquidity',
  transparency: 'Transparency',
  evidence: 'Evidence behind this record',
};

/**
 * What evidence exists that customer funds are actually there.
 *
 * A self-published proof of reserves is real evidence but the weakest kind: it
 * is a snapshot the exchange chooses to publish, unaudited, and it says nothing
 * about liabilities. An audit by a named third party, or the continuous
 * disclosure a public listing forces, is stronger. An exchange with only a
 * self-attested snapshot must therefore never score level with an audited one.
 */
export function scoreSolvency(e: Exchange): number {
  const r = e.reserves;
  return clamp(round1(
    (r.proofOfReserves ? 4 : 0) + (r.thirdPartyAudit ? 4 : 0) + (r.publiclyListed ? 3 : 0),
  ));
}

/**
 * Years since the last breach, softened by whether users were made whole. An
 * exchange that was hacked and covered every loss is not the same as one that
 * was hacked and did not.
 */
export function scoreSecurity(e: Exchange, now = new Date().getFullYear()): number {
  const s = e.security;
  const base = s.lastBreachYear === null ? 9 : scale(now - s.lastBreachYear, 0, 8) * 0.8;
  const recovery = s.lastBreachYear !== null && s.madeUsersWhole ? 1.5 : 0;
  const insurance = s.insuranceFund ? 1 : 0;
  return clamp(round1(base + recovery + insurance));
}

export function scoreFees(e: Exchange): number {
  // 0.60% taker is expensive; 0.02% is as cheap as the market gets.
  return scale(e.takerFeePct, 0.6, 0.02);
}

export function scoreLiquidity(e: Exchange): number {
  // Log scale: the gap between $100M and $1B matters more than $10B and $40B.
  const v = Math.max(e.spotVolumeUsd, 1);
  return scale(Math.log10(v), 7, 10.3);
}

/**
 * What the number is saying, in the reader's terms. "Nobody has looked" and
 * "somebody looked and found nothing" are different sentences and the
 * component renders them differently, because a blank where a warning should
 * be is the failure this note exists to prevent.
 */
function conductNote(e: Exchange): string {
  const acted = actionsFor(e.slug);
  if (conductScore(e.slug) === null) return 'Nobody here has searched for actions against this exchange';
  if (acted.length === 0) return 'Searched, and nothing on record';
  const live = acted.filter((a) => a.stage !== 'dismissed');
  if (live.length === 0) return `${acted.length} brought and dismissed, nothing decided`;
  return `${live.length} on record: ${[...new Set(live.map((a) => a.kind))].join(', ')}`;
}

export function scoreExchangeTransparency(e: Exchange): number {
  const t = e.transparency;
  const checks = [t.publishesFeeSchedule, t.disclosesLegalEntity, t.publishesIncidentReports];
  return clamp(round1((checks.filter(Boolean).length / checks.length) * 10));
}

export type ExchangeBreakdown = Composite<ExchangeKey>;
export type ExchangeComponent = Component<ExchangeKey>;

export function scoreExchange(e: Exchange, profile?: EvidenceInput): ExchangeBreakdown {
  const inputs: Input<ExchangeKey>[] = [
    { key: 'solvency', value: scoreSolvency(e), note: solvencyNote(e) },
    { key: 'security', value: scoreSecurity(e), note: securityNote(e) },
    { key: 'fees', value: scoreFees(e), note: `${e.takerFeePct}% taker · ${e.makerFeePct}% maker` },
    { key: 'liquidity', value: scoreLiquidity(e), note: `${volumeBand(e.spotVolumeUsd)} reported 24h spot volume` },
    { key: 'conduct', value: conductScore(e.slug), note: conductNote(e) },
    { key: 'transparency', value: scoreExchangeTransparency(e), note: transparencyNote(e) },
    { key: 'evidence', value: evidenceScore(profile), note: evidenceNote(profile) },
  ];
  return composite(inputs, EXCHANGE_WEIGHTS, EXCHANGE_LABELS);
}

function solvencyNote(e: Exchange): string {
  const bits = [
    e.reserves.proofOfReserves && 'proof of reserves',
    e.reserves.thirdPartyAudit && 'third-party audit',
    e.reserves.publiclyListed && 'publicly listed',
  ].filter(Boolean);
  return bits.length ? bits.join(' · ') : 'No public solvency evidence';
}

function securityNote(e: Exchange): string {
  if (e.security.lastBreachYear === null) return 'No customer-funds breach on record';
  return `Last breach ${e.security.lastBreachYear} · users ${e.security.madeUsersWhole ? 'made whole' : 'not made whole'}`;
}

function transparencyNote(e: Exchange): string {
  const t = e.transparency;
  const n = [t.publishesFeeSchedule, t.disclosesLegalEntity, t.publishesIncidentReports].filter(Boolean).length;
  return `${n} of 3 disclosures published`;
}

export const volumeBand = (v: number) =>
  v >= 1e10 ? `$${(v / 1e9).toFixed(0)}B` : v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
