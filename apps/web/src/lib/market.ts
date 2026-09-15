import { fetchMarkets, fetchMarketsByIds, fetchNewPools, fetchSecurity, type CoinMarket, type Network } from '@commentfx/ingest';
import { coinRef, scoreMemecoin, type CoinRef, type MemeBreakdown, type MemecoinInput } from '@commentfx/core';

export type { CoinMarket, CoinRef };

/** One upstream call serves both the /coins list and every /coins/[slug] page. */
export async function coins(): Promise<{ list: CoinMarket[]; at: string } | { error: string }> {
  const res = await fetchMarkets(100);
  return res.ok ? { list: res.data, at: res.at } : { error: res.reason };
}

/**
 * Three answers, because two are not enough. A page needs to tell "no such
 * coin" apart from "this coin exists and the upstream is quiet", and only the
 * first of those is a 404 — see the comment in coins/[slug]/page.tsx.
 */
export type CoinView =
  | { state: 'live'; coin: CoinMarket; at: string }
  | { state: 'unavailable'; ref: CoinRef; reason: string }
  | { state: 'unknown' };

export async function coin(id: string): Promise<CoinView> {
  const res = await fetchMarkets(100);
  if (res.ok) {
    const c = res.data.find((x) => x.id === id);
    if (c) return { state: 'live', coin: c, at: res.at };

    /**
     * Not in today's top 100. If we have never heard of the slug it is a typo
     * and a 404 is the answer. If it is in the index it is a page we publish —
     * the sitemap lists it and the site's own search offers it — and it slipped
     * down the ranking since the index was last refreshed. Serving a 404 for a
     * URL we advertise is the worst of both, and that is exactly what happened:
     * check:seo caught /coins/usual-usd four hours after the index was written.
     *
     * One more call, for the handful of coins in that gap, using the same
     * endpoint and the same parser.
     */
    const ref = coinRef(id);
    if (!ref) return { state: 'unknown' };

    const one = await fetchMarketsByIds([id]);
    if (one.ok) {
      const found = one.data.find((x) => x.id === id);
      if (found) return { state: 'live', coin: found, at: one.at };
    }

    // Known to us, unknown to the upstream: delisted, renamed, or merged. The
    // page says what it can rather than vanishing, and the index refresh will
    // drop it next time it runs.
    return { state: 'unavailable', ref, reason: one.ok ? 'no longer listed upstream' : one.reason };
  }
  const ref = coinRef(id);
  return ref ? { state: 'unavailable', ref, reason: res.reason } : { state: 'unknown' };
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
