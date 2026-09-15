/**
 * Regenerates packages/core/src/data/coins.ts — the checked-in list of which
 * coins this site has pages for.
 *
 *   node --experimental-strip-types packages/ingest/src/refresh-coins.ts
 *
 * Deliberately not run at build time. The whole point of the file is to be an
 * answer we already have when the network has none, so it has to be committed
 * and reviewed, not fetched.
 */
import { writeFile } from 'node:fs/promises';
import { fetchMarkets } from './coingecko.ts';

const OUT = new URL('../../core/src/data/coins.ts', import.meta.url);

const HEADER = `/**
 * Which coins this site has pages for: id, ticker and name, and nothing else.
 *
 * It answers the one question the network cannot answer while it is down — is
 * /coins/<slug> a real page or a typo? Without it, an unreachable upstream and
 * a made-up slug look identical, and the page has to guess. It guessed 404,
 * which meant a CoinGecko rate-limit took every coin page off the site.
 *
 * No prices, ranks or market caps live here. Those are only ever live, and a
 * number in a checked-in file would go stale the hour after it was committed.
 * A name does not.
 *
 * Regenerate with:
 *   node --experimental-strip-types packages/ingest/src/refresh-coins.ts
 *
 * Going stale costs little and costs it in the right direction: a coin listed
 * after the last refresh 404s during an outage instead of showing an honest
 * "prices unavailable", and one that has since left the top 100 is a name we
 * can still spell. Neither publishes anything untrue.
 */
export interface CoinRef {
  id: string;
  symbol: string;
  name: string;
}
`;

const q = (s: string) => `'${s.replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "\\\\'")}'`;

const res = await fetchMarkets(100);
if (!res.ok) {
  console.error(`CoinGecko did not answer (${res.reason}). Nothing written.`);
  process.exit(1);
}

const rows = res.data
  .map((c) => `  { id: ${q(c.id)}, symbol: ${q(c.symbol)}, name: ${q(c.name)} },`)
  .join('\n');

const body = `${HEADER}
/** Top 100 by market cap as of ${new Date().toISOString().slice(0, 10)}. */
export const COIN_INDEX: readonly CoinRef[] = [
${rows}
];

const BY_ID = new Map(COIN_INDEX.map((c) => [c.id, c]));

/** The coin with this slug, or null if we have never heard of it. */
export const coinRef = (id: string): CoinRef | null => BY_ID.get(id) ?? null;
`;

await writeFile(OUT, body);
console.log(`Wrote ${res.data.length} coins to ${OUT.pathname}`);
