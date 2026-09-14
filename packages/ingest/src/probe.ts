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
 * Exit 1 if a parsed source is broken. Free JSON APIs are reported but never
 * fail the run: a rate-limited free tier is expected, temporary, and already
 * handled honestly on the page.
 */
import { SOURCES } from './registers/index.ts';
import { CALENDAR_SOURCES } from './calendar/index.ts';
import { fetchMarkets } from './coingecko.ts';
import { fetchNewPools } from './geckoterminal.ts';
import { fetchSecurity } from './goplus.ts';

interface Probe {
  name: string;
  /** A parsed page breaks permanently; a rate-limited API does not. */
  critical: boolean;
  run: () => Promise<{ ok: boolean; detail: string }>;
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
      return r.ok
        ? { ok: true, detail: `${r.data.length} coins` }
        : { ok: false, detail: r.reason };
    },
  },
  {
    name: 'api: GeckoTerminal',
    critical: false,
    run: async () => {
      const r = await fetchNewPools('solana');
      return r.ok
        ? { ok: true, detail: `${r.data.length} new pools` }
        : { ok: false, detail: r.reason };
    },
  },
  {
    name: 'api: GoPlus',
    critical: false,
    run: async () => {
      // A token that has existed for years: an empty answer here means the
      // upstream changed, not that the token is new.
      const r = await fetchSecurity('eth', ['0x6982508145454ce325ddbe47a25d4ec3d2311933']);
      return r.ok && r.data.size > 0
        ? { ok: true, detail: 'contract audit returned' }
        : { ok: false, detail: r.ok ? 'answered with no data' : r.reason };
    },
  },
];

const results = await Promise.all(
  probes.map(async (p) => {
    try {
      return { ...p, ...(await p.run()) };
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

const broken = results.filter((r) => !r.ok && r.critical);
const degraded = results.filter((r) => !r.ok && !r.critical);

console.log('');
if (degraded.length > 0) {
  console.log(`${degraded.length} free API${degraded.length > 1 ? 's are' : ' is'} not answering. The pages that use them say so; no action needed unless it persists.`);
}
if (broken.length > 0) {
  console.log(`${broken.length} parsed source${broken.length > 1 ? 's' : ''} broken:`);
  for (const b of broken) console.log(`  - ${b.name}: ${b.detail}`);
  console.log('\nA parsed source stays broken until someone fixes the parser.');
  process.exit(1);
}
console.log('Every parsed source is readable.');
