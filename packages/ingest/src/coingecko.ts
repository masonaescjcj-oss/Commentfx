import { safeJson, num, type Fetched } from './fetch.ts';

const BASE = 'https://api.coingecko.com/api/v3';

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  rank: number | null;
  price: number | null;
  marketCap: number | null;
  volume24h: number | null;
  change24hPct: number | null;
  change7dPct: number | null;
  high24h: number | null;
  low24h: number | null;
  circulating: number | null;
  maxSupply: number | null;
  ath: number | null;
  athChangePct: number | null;
  athDate: string | null;
  /** 7-day hourly price series, thinned for a sparkline. */
  spark: number[];
  lastUpdated: string | null;
}

interface RawMarket {
  id: string; symbol: string; name: string; image: string;
  market_cap_rank: unknown; current_price: unknown; market_cap: unknown; total_volume: unknown;
  price_change_percentage_24h: unknown; price_change_percentage_7d_in_currency?: unknown;
  high_24h: unknown; low_24h: unknown; circulating_supply: unknown; max_supply: unknown;
  ath: unknown; ath_change_percentage: unknown; ath_date: unknown; last_updated: unknown;
  sparkline_in_7d?: { price?: unknown };
}

/** Thins a 168-point hourly series down to `points` evenly spaced samples. */
function thin(series: number[], points = 24): number[] {
  if (series.length <= points) return series;
  const step = (series.length - 1) / (points - 1);
  return Array.from({ length: points }, (_, i) => series[Math.round(i * step)] ?? 0);
}

/**
 * One call returns up to 250 coins with everything the list AND the detail
 * pages need, so the whole /coins section costs a single upstream request.
 */
export async function fetchMarkets(perPage = 100): Promise<Fetched<CoinMarket[]>> {
  const url =
    `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}` +
    `&page=1&sparkline=true&price_change_percentage=24h,7d`;

  const res = await safeJson<RawMarket[]>(url, { revalidate: 300 });
  if (!res.ok) return res;
  if (!Array.isArray(res.data)) return { ok: false, reason: 'unexpected payload' };

  const coins: CoinMarket[] = res.data.map((r) => {
    const raw = Array.isArray(r.sparkline_in_7d?.price)
      ? (r.sparkline_in_7d.price as unknown[]).map(num).filter((n): n is number => n !== null)
      : [];
    return {
      id: r.id, symbol: (r.symbol ?? '').toUpperCase(), name: r.name, image: r.image,
      rank: num(r.market_cap_rank), price: num(r.current_price), marketCap: num(r.market_cap),
      volume24h: num(r.total_volume),
      change24hPct: num(r.price_change_percentage_24h),
      change7dPct: num(r.price_change_percentage_7d_in_currency),
      high24h: num(r.high_24h), low24h: num(r.low_24h),
      circulating: num(r.circulating_supply), maxSupply: num(r.max_supply),
      ath: num(r.ath), athChangePct: num(r.ath_change_percentage),
      athDate: typeof r.ath_date === 'string' ? r.ath_date : null,
      spark: thin(raw),
      lastUpdated: typeof r.last_updated === 'string' ? r.last_updated : null,
    };
  });

  return { ok: true, data: coins, at: res.at };
}
