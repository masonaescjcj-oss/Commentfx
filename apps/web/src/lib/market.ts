import { fetchMarkets, fetchNewPools, fetchSecurity, type CoinMarket, type Network } from '@commentfx/ingest';
import { scoreMemecoin, type MemeBreakdown, type MemecoinInput } from '@commentfx/core';

export type { CoinMarket };

/** One upstream call serves both the /coins list and every /coins/[slug] page. */
export async function coins(): Promise<{ list: CoinMarket[]; at: string } | { error: string }> {
  const res = await fetchMarkets(100);
  return res.ok ? { list: res.data, at: res.at } : { error: res.reason };
}

export async function coin(id: string): Promise<CoinMarket | null> {
  const res = await fetchMarkets(100);
  return res.ok ? (res.data.find((c) => c.id === id) ?? null) : null;
}

export interface RadarToken {
  input: MemecoinInput;
  score: MemeBreakdown;
  dex: string | null;
  priceUsd: number | null;
  fdvUsd: number | null;
}

/** The floor below which a token is not worth indexing at all. */
export const MIN_LIQUIDITY_USD = 5_000;

/**
 * New pools, filtered to those with enough liquidity to matter, then checked
 * against GoPlus. A token the security upstream has not indexed is DROPPED, not
 * listed as unknown: a safety radar that shows tokens it could not check is
 * worse than one that shows fewer.
 */
export async function memecoinRadar(
  network: Network = 'solana',
): Promise<{ tokens: RadarToken[]; at: string; screened: number; dropped: number } | { error: string }> {
  const pools = await fetchNewPools(network);
  if (!pools.ok) return { error: pools.reason };

  const candidates = pools.data
    .filter((p) => (p.liquidityUsd ?? 0) >= MIN_LIQUIDITY_USD)
    .sort((a, b) => (b.liquidityUsd ?? 0) - (a.liquidityUsd ?? 0))
    .slice(0, 12);

  if (candidates.length === 0)
    return { tokens: [], at: pools.at, screened: pools.data.length, dropped: 0 };

  const sec = await fetchSecurity(network, candidates.map((p) => p.tokenAddress));
  if (!sec.ok) return { error: `security data ${sec.reason}` };

  const tokens: RadarToken[] = [];
  for (const p of candidates) {
    const s = sec.data.get(p.tokenAddress.toLowerCase());
    if (!s) continue;
    const input: MemecoinInput = {
      name: p.name,
      tokenAddress: p.tokenAddress,
      network,
      ageHours: (Date.now() - new Date(p.createdAt).getTime()) / 3_600_000,
      liquidityUsd: p.liquidityUsd,
      volume24hUsd: p.volume24hUsd,
      buys24h: p.buys24h,
      sells24h: p.sells24h,
      buyers24h: p.buyers24h,
      change24hPct: p.change24hPct,
      security: {
        mintable: s.mintable, freezable: s.freezable, balanceMutable: s.balanceMutable,
        metadataMutable: s.metadataMutable, honeypot: s.honeypot,
        buyTaxPct: s.buyTaxPct, sellTaxPct: s.sellTaxPct, transferControlled: s.transferControlled,
      },
    };
    tokens.push({ input, score: scoreMemecoin(input), dex: p.dex, priceUsd: p.priceUsd, fdvUsd: p.fdvUsd });
  }

  tokens.sort((a, b) => b.score.total - a.score.total);
  return {
    tokens,
    at: pools.at,
    screened: pools.data.length,
    dropped: candidates.length - tokens.length,
  };
}

export const fmtUsd = (n: number | null): string => {
  if (n === null) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n).toLocaleString('en-US')}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n > 0) return `$${n.toPrecision(3)}`;
  return '$0';
};

export const fmtPct = (n: number | null): string => (n === null ? '—' : `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`);
