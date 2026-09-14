import { safeJson, num, type Fetched } from './fetch.ts';

const BASE = 'https://api.geckoterminal.com/api/v2';

export type Network = 'solana' | 'base' | 'bsc' | 'eth';

export interface NewPool {
  poolId: string;
  network: Network;
  name: string;            // e.g. "NMB / SOL"
  tokenAddress: string;
  priceUsd: number | null;
  createdAt: string;
  /** Pool reserves in USD — the practical measure of whether you can exit. */
  liquidityUsd: number | null;
  fdvUsd: number | null;
  change24hPct: number | null;
  volume24hUsd: number | null;
  buys24h: number | null;
  sells24h: number | null;
  buyers24h: number | null;
  dex: string | null;
}

interface RawPool {
  id: string;
  attributes: Record<string, unknown>;
  relationships?: { base_token?: { data?: { id?: unknown } }; dex?: { data?: { id?: unknown } } };
}

/** GeckoTerminal ids look like "solana_<address>" — the prefix must come off. */
function stripNetwork(id: unknown): string | null {
  if (typeof id !== 'string') return null;
  const i = id.indexOf('_');
  return i === -1 ? id : id.slice(i + 1);
}

export async function fetchNewPools(network: Network): Promise<Fetched<NewPool[]>> {
  const res = await safeJson<{ data?: RawPool[] }>(
    `${BASE}/networks/${network}/new_pools?page=1`,
    { revalidate: 300 },
  );
  if (!res.ok) return res;
  const raw = res.data?.data;
  if (!Array.isArray(raw)) return { ok: false, reason: 'unexpected payload' };

  const pools: NewPool[] = [];
  for (const p of raw) {
    const a = p.attributes ?? {};
    const tokenAddress = stripNetwork(p.relationships?.base_token?.data?.id);
    const createdAt = typeof a['pool_created_at'] === 'string' ? a['pool_created_at'] : null;
    if (!tokenAddress || !createdAt) continue;

    const pc = a['price_change_percentage'] as Record<string, unknown> | undefined;
    const vol = a['volume_usd'] as Record<string, unknown> | undefined;
    const tx = (a['transactions'] as Record<string, unknown> | undefined)?.['h24'] as
      | Record<string, unknown> | undefined;

    pools.push({
      poolId: p.id,
      network,
      name: typeof a['name'] === 'string' ? a['name'] : tokenAddress.slice(0, 8),
      tokenAddress,
      priceUsd: num(a['base_token_price_usd']),
      createdAt,
      liquidityUsd: num(a['reserve_in_usd']),
      fdvUsd: num(a['fdv_usd']),
      change24hPct: num(pc?.['h24']),
      volume24hUsd: num(vol?.['h24']),
      buys24h: num(tx?.['buys']),
      sells24h: num(tx?.['sells']),
      buyers24h: num(tx?.['buyers']),
      dex: stripNetwork(p.relationships?.dex?.data?.id),
    });
  }
  return { ok: true, data: pools, at: res.at };
}
