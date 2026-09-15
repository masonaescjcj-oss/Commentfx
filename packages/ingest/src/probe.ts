/**
 * Checks every upstream the site reads, and says which ones are broken.
 *
 * This exists because of how the parsers are built. Each one fails safe: when
 * a page's markup changes, it reports the source as unavailable rather than
 * publishing nonsense, and the site quietly renders an honest "we could not
 * read this" state. That is right for a reader and useless for us — a scraper
 * that broke in March would still be politely unavailable in June and nobody
 * would know. This turns that silence into a failed job.
 *
 *   node --experimental-strip-types src/probe.ts
 *
 * Exit 1 if a source is broken. The line that matters is not API against
 * scraper, it is transient against structural. A rate-limited free tier is
 * expected, temporary, and already handled honestly on the page, so it warns.
 * An upstream that answers with something we can no longer read is permanent
 * and nobody would otherwise find out, so it fails — which is why an API probe
 * checks the fields the site actually uses rather than only that the call
 * returned. CoinGecko renaming `current_price` would leave every coin page
 * rendering a dash, and a probe that only counted the array would have called
 * that healthy.
 */
import { SOURCES } from './registers/index.ts';
import { CALENDAR_SOURCES } from './calendar/index.ts';
import { fetchMarkets, type CoinMarket } from './coingecko.ts';
import { fetchNewPools } from './geckoterminal.ts';
import { fetchSecurity } from './goplus.ts';
import { pathToFileURL } from 'node:url';
import { COIN_INDEX } from '@commentfx/core';

interface Probe {
  name: string;
  /** Whether a failure is permanent unless someone acts. A result may raise it. */
  critical: boolean;
  run: () => Promise<{ ok: boolean; detail: string; critical?: boolean }>;
}

/**
 * Whether a market payload still carries what the pages read off it.
 *
 * Split out from the probe because the case worth being sure about cannot be
 * produced on demand: CoinGecko renaming a field. The call would succeed, the
 * array would be the right length, and every price on the site would render as
 * a dash — a probe that counted the array would call that healthy. Pure, so a
 * test can hand it the shape that would break us.
 */
export function readsAsExpected(coins: CoinMarket[]): { ok: boolean; detail: string; critical?: boolean } {
  // Bitcoin is in the top ten of any list ordered by market cap, so its absence
  // is the upstream changing rather than the market moving.
  const btc = coins.find((c) => c.id === 'bitcoin');
  if (!btc) return { ok: false, detail: 'answered without bitcoin', critical: true };

  const missing = (['price', 'marketCap', 'change24hPct'] as const).filter((k) => btc[k] === null);
  if (missing.length > 0)
    return { ok: false, detail: `bitcoin has no ${missing.join(', ')} — field names changed?`, critical: true };
  if (btc.spark.length === 0)
    return { ok: false, detail: 'no sparkline series — every coin chart would be blank', critical: true };

  return { ok: true, detail: `${coins.length} coins, BTC $${Math.round(btc.price ?? 0).toLocaleString('en-US')}` };
}

const probes: Probe[] = [
  ...SOURCES.map((s) => ({
    name: `register: ${s.code}`,
    critical: true,
    run: async () => {
      const r = await s.fetch();
      return r.ok
        ? { ok: true, detail: `${r.entries.length} firms` }
        : { ok: false, detail: r.reason };
    },
  })),

  ...CALENDAR_SOURCES.map((s) => ({
    name: `calendar: ${s.source}`,
    critical: true,
    run: async () => {
      const r = await s.fetch();
      return r.ok
        ? { ok: true, detail: `${r.events.length} dates` }
        : { ok: false, detail: r.reason };
    },
  })),

  {
    name: 'api: CoinGecko',
    critical: false,
    run: async () => {
      const r = await fetchMarkets(10);
      return r.ok ? readsAsExpected(r.data) : { ok: false, detail: r.reason };
    },
  },

  {
    // Not an upstream: the list of coins we have pages for, which is committed
    // and therefore goes stale silently. Drift is expected and mostly harmless
    // — a coin listed since the last refresh 404s during an outage instead of
    // degrading politely. A missing top-25 coin is not harmless: that is a page
    // people land on, absent from the sitemap and from the site's own search.
    name: 'index: coins',
    critical: false,
    run: async () => {
      const r = await fetchMarkets(100);
      if (!r.ok) return { ok: false, detail: `could not compare (${r.reason})` };

      const known = new Set(COIN_INDEX.map((c) => c.id));
      const live = r.data.map((c) => c.id);
      const drifted = live.filter((id) => !known.has(id));
      const majors = live.slice(0, 25).filter((id) => !known.has(id));

      if (majors.length > 0)
        return {
          ok: false,
          critical: true,
          detail: `${majors.join(', ')} in the top 25 and not in the index — refresh it`,
        };
      return drifted.length > 0
        ? { ok: true, detail: `${drifted.length} of 100 drifted since the last refresh` }
        : { ok: true, detail: 'matches the live top 100' };
    },
  },
  {
    name: 'api: GeckoTerminal',
    critical: false,
    run: async () => {
      const r = await fetchNewPools('solana');
      if (!r.ok) return { ok: false, detail: r.reason };
      // Solana mints pools continuously. An empty list is the parser, not a
      // quiet day.
      return r.data.length > 0
        ? { ok: true, detail: `${r.data.length} new pools` }
        : { ok: false, detail: 'answered with no pools at all', critical: true };
    },
  },
  {
    name: 'api: GoPlus',
    critical: false,
    run: async () => {
      // A token that has existed for years: an empty answer here means the
      // upstream changed, not that the token is new.
      const r = await fetchSecurity('eth', ['0x6982508145454ce325ddbe47a25d4ec3d2311933']);
      if (!r.ok) return { ok: false, detail: r.reason };
      return r.data.size > 0
        ? { ok: true, detail: 'contract audit returned' }
        : { ok: false, detail: 'answered with no data for a token years old', critical: true };
    },
  },
];

/**
 * Only when run as a script. The shape check above is imported by a test, and a
 * unit suite that quietly makes eight network calls — and can exit(1) out from
 * under the runner — is not a unit suite.
 */
async function main() {
  const results = await Promise.all(
    probes.map(async (p) => {
      try {
        const out = await p.run();
        return { ...p, ...out, critical: out.critical ?? p.critical };
      } catch (err) {
        return { ...p, ok: false, detail: err instanceof Error ? err.message : 'threw' };
      }
    }),
  );

  const width = Math.max(...results.map((r) => r.name.length));
  for (const r of results) {
    const mark = r.ok ? 'ok  ' : r.critical ? 'FAIL' : 'warn';
    console.log(`${mark}  ${r.name.padEnd(width)}  ${r.detail}`);
  }

  /** A probe's own result may raise a warning to a failure. */
  const isCritical = (r: { critical: boolean }) => r.critical;
  const broken = results.filter((r) => !r.ok && isCritical(r));
  const degraded = results.filter((r) => !r.ok && !isCritical(r));

  console.log('');

  /**
   * Everything failing the same way on the same run is one broken thing, not
   * eight: a runner with no network out. Saying four parsers broke today would
   * be the job crying wolf, and an alert nobody trusts is worse than none.
   */
  if (results.every((r) => !r.ok && /network error|timeout/.test(r.detail))) {
    console.log('INCONCLUSIVE: nothing answered at all, including sources that have');
    console.log('nothing to do with each other. That is this machine having no network,');
    console.log('not eight upstreams breaking at once.');
    process.exit(1);
  }

  if (degraded.length > 0) {
    console.log(`Did not answer, and will probably answer later: ${degraded.map((d) => d.name).join(', ')}.`);
    console.log('The pages that use them say so. No action needed unless it persists.');
  }
  if (broken.length > 0) {
    console.log(`${broken.length} source${broken.length > 1 ? 's are' : ' is'} broken in a way that will not fix itself:`);
    for (const b of broken) console.log(`  - ${b.name}: ${b.detail}`);
    console.log('\nThese stay broken until someone acts.');
    process.exit(1);
  }
  console.log(degraded.length > 0
    ? 'Nothing is broken. Everything else reads as expected.'
    : 'Every source is readable and says what we expect.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
