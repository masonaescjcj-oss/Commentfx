import { composite, clamp, round1, scale, type Input, type Component, type Composite } from './scoring-kit.ts';

/**
 * How a firm measures drawdown decides more than any other rule whether a
 * competent trader can actually pass. Static is measured from the starting
 * balance; trailing follows equity up, so an unrealised spike permanently
 * raises the floor you must stay above.
 */
export type DrawdownType = 'static' | 'eod-trailing' | 'intraday-trailing';

export interface PropRules {
  steps: 1 | 2 | 'instant';
  profitTargetPct: number;      // phase one
  dailyDrawdownPct: number;
  maxDrawdownPct: number;
  drawdownType: DrawdownType;
  consistencyRule: boolean;     // caps the share of profit any single day may contribute
  timeLimitDays: number | null; // null = no deadline
  newsTrading: boolean;
  weekendHolding: boolean;
  minTradingDays: number;
}

export interface PropPayout {
  splitPct: number;             // trader's share
  frequencyDays: number;        // how often a payout can be requested
  firstPayoutDays: number;      // days from funded to first eligible payout
  /** Payout screenshots verified by us. Zero until the community layer ships. */
  verifiedProofs: number;
}

export interface PropFirm {
  slug: string;
  name: string;
  founded: number;
  headquarters: string;
  markets: Array<'forex' | 'futures' | 'crypto' | 'indices' | 'stocks'>;
  rules: PropRules;
  payout: PropPayout;
  /** Challenge fee normalised to a $100k account, so firms are comparable. */
  feeUsdPer100k: number;
  platforms: string[];
  transparency: {
    publishesRuleChanges: boolean;
    disclosesLegalEntity: boolean;
    disclosesExecutionBroker: boolean;
  };
  why: string;
  logo: { initials: string; bg: string; fg: string };
}

export type PropKey = 'rules' | 'payout' | 'cost' | 'platform' | 'transparency';

export const PROP_WEIGHTS: Record<PropKey, number> = {
  rules: 0.30, payout: 0.25, cost: 0.20, platform: 0.15, transparency: 0.10,
};

export const PROP_LABELS: Record<PropKey, string> = {
  rules: 'Rule fairness',
  payout: 'Payout terms',
  cost: 'Challenge cost',
  platform: 'Platforms & markets',
  transparency: 'Transparency',
};

const DD_SCORE: Record<DrawdownType, number> = {
  'static': 10, 'eod-trailing': 6, 'intraday-trailing': 2.5,
};

/** The rules you must survive, weighted by how much each one actually bites. */
export function scorePropRules(p: PropFirm): number {
  const r = p.rules;
  const dd = DD_SCORE[r.drawdownType] * 0.35;
  const room = scale(r.maxDrawdownPct, 4, 12) * 0.2;            // more headroom is easier
  const target = scale(r.profitTargetPct, 12, 5) * 0.15;         // lower target is easier
  const deadline = (r.timeLimitDays === null ? 10 : scale(r.timeLimitDays, 20, 90)) * 0.15;
  const freedom =
    ((r.consistencyRule ? 0 : 4) + (r.newsTrading ? 3 : 0) + (r.weekendHolding ? 3 : 0)) * 0.15;
  return clamp(round1(dd + room + target + deadline + freedom));
}

export function scorePropPayout(p: PropFirm): number {
  const s = p.payout;
  const split = scale(s.splitPct, 70, 100) * 0.45;
  const freq = scale(s.frequencyDays, 30, 7) * 0.35;
  const first = scale(s.firstPayoutDays, 30, 7) * 0.20;
  return clamp(round1(split + freq + first));
}

export function scorePropCost(p: PropFirm): number {
  // $1,200 per $100k is expensive; $400 is cheap.
  return scale(p.feeUsdPer100k, 1200, 400);
}

export function scorePropPlatform(p: PropFirm): number {
  return clamp(round1(Math.min(6, p.platforms.length * 2) + Math.min(4, p.markets.length * 1.2)));
}

export function scorePropTransparency(p: PropFirm): number {
  const t = p.transparency;
  const checks = [t.publishesRuleChanges, t.disclosesLegalEntity, t.disclosesExecutionBroker];
  return clamp(round1((checks.filter(Boolean).length / checks.length) * 10));
}

export type PropBreakdown = Composite<PropKey>;
export type PropComponent = Component<PropKey>;

export function scoreProp(p: PropFirm): PropBreakdown {
  const ddNote: Record<DrawdownType, string> = {
    'static': 'Static drawdown from starting balance',
    'eod-trailing': 'Trails on end-of-day balance',
    'intraday-trailing': 'Trails intraday on equity — the strictest form',
  };
  const inputs: Input<PropKey>[] = [
    { key: 'rules', value: scorePropRules(p), note: ddNote[p.rules.drawdownType] },
    { key: 'payout', value: scorePropPayout(p), note: `${p.payout.splitPct}% split · every ${p.payout.frequencyDays} days` },
    { key: 'cost', value: scorePropCost(p), note: `$${p.feeUsdPer100k} per $100k account` },
    { key: 'platform', value: scorePropPlatform(p), note: `${p.platforms.join(', ')} · ${p.markets.length} markets` },
    { key: 'transparency', value: scorePropTransparency(p), note: transparencyNote(p) },
  ];
  return composite(inputs, PROP_WEIGHTS, PROP_LABELS);
}

function transparencyNote(p: PropFirm): string {
  const t = p.transparency;
  const n = [t.publishesRuleChanges, t.disclosesLegalEntity, t.disclosesExecutionBroker].filter(Boolean).length;
  return `${n} of 3 disclosures published`;
}

export const describeDrawdown = (t: DrawdownType) =>
  t === 'static' ? 'Static' : t === 'eod-trailing' ? 'Trailing (EOD)' : 'Trailing (intraday)';
