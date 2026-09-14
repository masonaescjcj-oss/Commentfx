import { safeJson, num, flag, type Fetched } from './fetch.ts';
import type { Network } from './geckoterminal.ts';

const BASE = 'https://api.gopluslabs.io/api/v1';

/** EVM chain ids GoPlus indexes, keyed by the network names we use. */
const EVM_CHAIN_ID: Partial<Record<Network, string>> = { eth: '1', bsc: '56', base: '8453' };

/**
 * GoPlus returns two genuinely different schemas — Solana reports capabilities
 * as `{authority, status}` objects, EVM reports flat "0"/"1" strings — so the
 * two are normalised here into one shape. Anything the upstream does not report
 * stays null rather than defaulting to safe, because "not reported" and "not
 * present" are different facts and the score must be able to tell them apart.
 */
export interface TokenSecurity {
  address: string;
  network: Network;
  /** New supply can be printed. */
  mintable: boolean | null;
  /** Holder balances can be frozen (Solana) — funds become unsellable. */
  freezable: boolean | null;
  /** An authority can rewrite balances outright. Disqualifying on its own. */
  balanceMutable: boolean | null;
  /** Name, symbol and image can be swapped after launch. */
  metadataMutable: boolean | null;
  /** The sell path is blocked (EVM). Disqualifying on its own. */
  honeypot: boolean | null;
  buyTaxPct: number | null;
  sellTaxPct: number | null;
  holderCount: number | null;
  openSource: boolean | null;
  /** A transfer fee or hook can tax or block transfers post-launch (Solana). */
  transferControlled: boolean | null;
}

const solStatus = (v: unknown): boolean | null => {
  if (v && typeof v === 'object' && 'status' in v) return flag((v as { status: unknown }).status);
  return null;
};

function normaliseSolana(address: string, r: Record<string, unknown>): TokenSecurity {
  const fee = r['transfer_fee'];
  const hook = r['transfer_hook'];
  const hasFee = fee && typeof fee === 'object' && Object.keys(fee).length > 0;
  const hasHook = Array.isArray(hook) && hook.length > 0;
  return {
    address, network: 'solana',
    mintable: solStatus(r['mintable']),
    freezable: solStatus(r['freezable']),
    balanceMutable: solStatus(r['balance_mutable_authority']),
    metadataMutable: solStatus(r['metadata_mutable']),
    honeypot: null,                      // not reported for Solana
    buyTaxPct: null, sellTaxPct: null,   // Solana taxes surface as transfer fees
    holderCount: null,
    openSource: null,
    transferControlled: hasFee || hasHook ? true : false,
  };
}

function normaliseEvm(address: string, network: Network, r: Record<string, unknown>): TokenSecurity {
  const pct = (v: unknown) => { const n = num(v); return n === null ? null : n * 100; };
  return {
    address, network,
    mintable: flag(r['is_mintable']),
    freezable: null,
    balanceMutable: null,
    metadataMutable: null,
    honeypot: flag(r['is_honeypot']) ?? flag(r['cannot_sell_all']),
    buyTaxPct: pct(r['buy_tax']),
    sellTaxPct: pct(r['sell_tax']),
    holderCount: num(r['holder_count']),
    openSource: flag(r['is_open_source']),
    transferControlled: null,
  };
}

/** Runs `work` over `items` with at most `limit` requests in flight. */
async function mapLimit<T, R>(items: T[], limit: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        out[i] = await work(items[i]!);
      }
    }),
  );
  return out;
}

/**
 * Observed upstream behaviour, not documented: the Solana endpoint accepts a
 * comma-separated list but answers for only ONE of them. Queried individually,
 * the same addresses all return data. So Solana is fetched one address at a
 * time under a concurrency cap; EVM chains do honour batching.
 *
 * Tokens the upstream has not indexed come back absent. The caller drops those
 * rather than showing them as unknown — a safety radar that lists tokens it
 * could not check is worse than one that lists fewer.
 */
export async function fetchSecurity(
  network: Network,
  addresses: string[],
): Promise<Fetched<Map<string, TokenSecurity>>> {
  const at = new Date().toISOString();
  if (addresses.length === 0) return { ok: true, data: new Map(), at };

  const out = new Map<string, TokenSecurity>();

  if (network === 'solana') {
    const results = await mapLimit(addresses.slice(0, 20), 4, (addr) =>
      safeJson<{ code?: number; result?: Record<string, Record<string, unknown>> }>(
        `${BASE}/solana/token_security?contract_addresses=${addr}`,
        { revalidate: 900 },
      ),
    );
    let anyOk = false;
    for (const res of results) {
      if (!res.ok || res.data.code !== 1 || !res.data.result) continue;
      anyOk = true;
      for (const [addr, raw] of Object.entries(res.data.result)) {
        out.set(addr.toLowerCase(), normaliseSolana(addr, raw));
      }
    }
    if (!anyOk) return { ok: false, reason: 'upstream unavailable' };
    return { ok: true, data: out, at };
  }

  const list = addresses.slice(0, 30).join(',').toLowerCase();
  const res = await safeJson<{ code?: number; result?: Record<string, Record<string, unknown>> }>(
    `${BASE}/token_security/${EVM_CHAIN_ID[network] ?? '1'}?contract_addresses=${list}`,
    { revalidate: 900 },
  );
  if (!res.ok) return res;
  if (res.data.code !== 1 || !res.data.result) return { ok: false, reason: 'upstream declined' };
  for (const [addr, raw] of Object.entries(res.data.result)) {
    out.set(addr.toLowerCase(), normaliseEvm(addr, network, raw));
  }
  return { ok: true, data: out, at };
}
