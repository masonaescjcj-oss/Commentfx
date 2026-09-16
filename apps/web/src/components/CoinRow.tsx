import Link from 'next/link';
import { fmtUsd, fmtPct, type CoinMarket } from '@/lib/market';
import { Sparkline } from './Sparkline';

/**
 * One coin: mark, name over ticker, seven-day shape, price over 24h change.
 *
 * It lives here rather than inside /coins because the front page shows the same
 * thing, and two copies of a price row is how the two end up disagreeing about
 * what counts as up. `rank` is optional: the front page shows the top handful
 * in order, where a number in front of each would be noise.
 *
 * The sparkline follows the seven-day change and the percentage follows the
 * twenty-four hour one, so a coin down on the day inside a week that is up
 * shows a green line and a red number. That is not an inconsistency — it is the
 * only honest way to draw two different windows next to each other, and it is
 * why the line has no number attached to it.
 */
export function CoinRow({ c, rank, headingLevel = 2 }: {
  c: CoinMarket;
  rank?: boolean;
  headingLevel?: 2 | 3;
}) {
  const up = (c.change24hPct ?? 0) >= 0;
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="flex items-center gap-[10px] py-[11px] border-b border-line-2 last:border-b-0">
      {rank ? (
        <span className="w-6 shrink-0 text-center tnum text-[12px] text-ink-3">{c.rank ?? '—'}</span>
      ) : null}
      {/* Upstream logo, sized to prevent layout shift. */}
      <img src={c.image} alt="" width={28} height={28} loading="lazy" decoding="async" className="rounded-full shrink-0" />
      <div className="min-w-0">
        <H className="text-[13.5px] font-semibold leading-tight">
          <Link href={`/coins/${c.id}`} className="hover:text-brass">{c.name}</Link>
        </H>
        <p className="text-[11px] text-ink-3 tnum">{c.symbol}</p>
      </div>
      <div className="flex-1" />
      <Sparkline points={c.spark} up={(c.change7dPct ?? c.change24hPct ?? 0) >= 0} />
      <div className="text-right min-w-[86px]">
        <p className="text-[13.5px] font-bold tnum leading-tight">{fmtUsd(c.price)}</p>
        <p className={`text-[11.5px] font-bold tnum ${up ? 'text-up' : 'text-down'}`}>{fmtPct(c.change24hPct)}</p>
      </div>
    </article>
  );
}

/**
 * The day's biggest moves, both directions, from the same response the list
 * above is built from — so it costs nothing extra upstream.
 *
 * Coins below a volume floor are excluded. A token with four thousand dollars
 * of daily volume can print +300% on one trade, and a "top gainers" board that
 * lets those in is a board of noise that looks like a signal.
 */
export const MIN_MOVER_VOLUME_USD = 10_000_000;

export function movers(list: CoinMarket[], n = 3): { gainers: CoinMarket[]; losers: CoinMarket[] } {
  const liquid = list.filter(
    (c) => c.change24hPct !== null && (c.volume24h ?? 0) >= MIN_MOVER_VOLUME_USD,
  );
  const byChange = [...liquid].sort((a, b) => (b.change24hPct ?? 0) - (a.change24hPct ?? 0));
  return {
    gainers: byChange.slice(0, n).filter((c) => (c.change24hPct ?? 0) > 0),
    losers: byChange.slice(-n).reverse().filter((c) => (c.change24hPct ?? 0) < 0),
  };
}

/** A mover as a chip: mark, ticker, the move. Compact enough to sit two abreast. */
export function MoverChip({ c }: { c: CoinMarket }) {
  const up = (c.change24hPct ?? 0) >= 0;
  return (
    <Link
      href={`/coins/${c.id}`}
      className="flex items-center gap-2 py-[9px] px-[10px] rounded-[11px] border border-line hover:border-brass min-w-0"
    >
      <img src={c.image} alt="" width={22} height={22} loading="lazy" decoding="async" className="rounded-full shrink-0" />
      <span className="text-[12.5px] font-bold tnum truncate min-w-0">{c.symbol}</span>
      <span className="flex-1" />
      <span className={`text-[12px] font-bold tnum shrink-0 ${up ? 'text-up' : 'text-down'}`}>
        {fmtPct(c.change24hPct)}
      </span>
    </Link>
  );
}
