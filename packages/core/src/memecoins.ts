import { composite, clamp, round1, scale, type Input, type Composite } from './scoring-kit.ts';
import { checkName, type NameCheck } from './name-safety.ts';

/**
 * The shape the radar scores. It is deliberately independent of any upstream:
 * whoever supplies the security facts must normalise into this first.
 */
export interface MemecoinInput {
  name: string;
  tokenAddress: string;
  network: string;
  ageHours: number;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  buys24h: number | null;
  sells24h: number | null;
  buyers24h: number | null;
  change24hPct: number | null;
  security: {
    mintable: boolean | null;
    freezable: boolean | null;
    balanceMutable: boolean | null;
    metadataMutable: boolean | null;
    honeypot: boolean | null;
    buyTaxPct: number | null;
    sellTaxPct: number | null;
    transferControlled: boolean | null;
  };
}

export type MemeKey = 'control' | 'liquidity' | 'tax' | 'activity';

export const MEME_WEIGHTS: Record<MemeKey, number> = {
  control: 0.45, liquidity: 0.25, tax: 0.15, activity: 0.15,
};

export const MEME_LABELS: Record<MemeKey, string> = {
  control: 'Deployer control',
  liquidity: 'Exit liquidity',
  tax: 'Transfer tax',
  activity: 'Trading activity',
};

/**
 * Two findings are disqualifying on their own, because no amount of liquidity
 * or volume compensates for them: a honeypot (you cannot sell) and a mutable
 * balance authority (your holding can be written away). Both cap the total.
 */
export function isDisqualifying(m: MemecoinInput): string | null {
  if (m.security.honeypot === true) return 'Sell path appears blocked';
  if (m.security.balanceMutable === true) return 'An authority can rewrite holder balances';
  if (checkName(m.name).hadInvisible) return 'Name uses hidden characters to disguise how it renders';
  return null;
}

/** The name as it is safe to render, plus whether it was crafted to deceive. */
export function nameCheck(m: MemecoinInput): NameCheck {
  return checkName(m.name);
}

/** What the deployer can still do to you after launch. */
export function scoreControl(m: MemecoinInput): number | null {
  const s = m.security;
  const known = [s.mintable, s.freezable, s.balanceMutable, s.metadataMutable, s.honeypot, s.transferControlled]
    .filter((v) => v !== null);
  // The name check needs no upstream, so it alone can carry this component.
  if (known.length === 0 && !checkName(m.name).deceptive) return null;

  const name = checkName(m.name);
  let score = 10;
  if (name.hadInvisible) score -= 10;       // a rendering trick outranks everything else
  else if (name.mixedScripts) score -= 4;   // homograph impersonation
  if (s.balanceMutable) score -= 10;
  if (s.honeypot) score -= 10;
  if (s.freezable) score -= 4;
  if (s.mintable) score -= 3.5;
  if (s.transferControlled) score -= 2;
  if (s.metadataMutable) score -= 1;
  return clamp(round1(score));
}

export function scoreExitLiquidity(m: MemecoinInput): number | null {
  if (m.liquidityUsd === null) return null;
  // $5k is the floor worth indexing at all; $500k is deep for a new token.
  return scale(Math.log10(Math.max(m.liquidityUsd, 1)), 3.7, 5.7);
}

export function scoreTax(m: MemecoinInput): number | null {
  const { buyTaxPct, sellTaxPct } = m.security;
  if (buyTaxPct === null && sellTaxPct === null) {
    // Solana reports transfer control instead of a tax figure.
    return m.security.transferControlled === null ? null : m.security.transferControlled ? 4 : 10;
  }
  const worst = Math.max(buyTaxPct ?? 0, sellTaxPct ?? 0);
  return scale(worst, 15, 0);
}

/** Real two-sided trading, not one wallet cycling its own token. */
export function scoreActivity(m: MemecoinInput): number | null {
  if (m.buys24h === null && m.sells24h === null && m.buyers24h === null) return null;
  const buys = m.buys24h ?? 0;
  const sells = m.sells24h ?? 0;
  const buyers = m.buyers24h ?? 0;
  const trades = buys + sells;
  const depth = scale(Math.log10(Math.max(trades, 1)), 0, 3) * 0.5;
  const spread = scale(Math.log10(Math.max(buyers, 1)), 0, 2.5) * 0.3;
  // A book that is all buys and no sells has not been tested for exit.
  const twoSided = trades > 0 ? scale(Math.min(sells / Math.max(trades, 1), 0.5), 0, 0.35) * 0.2 : 0;
  return clamp(round1(depth + spread + twoSided));
}

export type MemeBreakdown = Composite<MemeKey> & { disqualified: string | null };

export function scoreMemecoin(m: MemecoinInput): MemeBreakdown {
  const dq = isDisqualifying(m);
  const inputs: Input<MemeKey>[] = [
    { key: 'control', value: scoreControl(m), note: controlNote(m) },
    { key: 'liquidity', value: scoreExitLiquidity(m), note: m.liquidityUsd === null ? 'Not reported' : `$${Math.round(m.liquidityUsd).toLocaleString('en-US')} in the pool` },
    { key: 'tax', value: scoreTax(m), note: taxNote(m) },
    { key: 'activity', value: scoreActivity(m), note: `${(m.buys24h ?? 0) + (m.sells24h ?? 0)} trades · ${m.buyers24h ?? 0} buyers in 24h` },
  ];
  const base = composite(inputs, MEME_WEIGHTS, MEME_LABELS);
  // A disqualifying finding caps the headline number no matter what else is good.
  return { ...base, total: dq ? Math.min(base.total, 1.5) : base.total, disqualified: dq };
}

function controlNote(m: MemecoinInput): string {
  const s = m.security;
  const n = checkName(m.name);
  const bad = [
    n.hadInvisible && 'hidden characters in name',
    n.mixedScripts && `name mixes ${n.mixedScripts.join(' and ')}`,
    s.balanceMutable && 'balances mutable',
    s.honeypot && 'sell blocked',
    s.freezable && 'freezable',
    s.mintable && 'mintable',
    s.transferControlled && 'transfer fee or hook',
    s.metadataMutable && 'metadata mutable',
  ].filter(Boolean) as string[];
  if (bad.length === 0) return 'No deployer powers reported';
  return bad.join(' · ');
}

function taxNote(m: MemecoinInput): string {
  const { buyTaxPct, sellTaxPct } = m.security;
  if (buyTaxPct === null && sellTaxPct === null)
    return m.security.transferControlled ? 'Transfer fee or hook present' : 'No transfer fee';
  return `${(buyTaxPct ?? 0).toFixed(1)}% buy · ${(sellTaxPct ?? 0).toFixed(1)}% sell`;
}

export const ageLabel = (h: number) =>
  h < 1 ? `${Math.round(h * 60)}m` : h < 48 ? `${Math.round(h)}h` : `${Math.round(h / 24)}d`;
