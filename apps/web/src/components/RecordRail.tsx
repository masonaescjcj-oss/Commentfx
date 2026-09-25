import Link from 'next/link';
import type { LogoMark } from '@commentfx/core';
export { nearestInRank } from '@commentfx/core';
import { Logo, Score } from './primitives';
import { ScoreRing } from './ScoreRing';

/**
 * What a wide screen keeps in view down the side of a record page.
 *
 * On a phone the two actions are pinned to the bottom of the screen
 * (StickyActions), because a record page is long and the thing a reader came to
 * do is otherwise always off-screen. From 1024px that bar is gone and this does
 * the same job in the rail: who this is, what they scored, the visit button,
 * and the companies closest to them in the same ranking.
 *
 * Nothing on it is new. The score and the reason are the ones in the header,
 * and the neighbours are the ones the Compare section lists — here they link to
 * the neighbours' own records, so a reader weighing two companies can move
 * between them without going back to the list. It is display:none below
 * 1024px, where every piece of it is already on the page in the phone's order.
 */
export function DecisionCard({ logo, name, rankLine, score, why, visit, writeHref, neighbours, neighboursTitle }: {
  logo: LogoMark;
  name: string;
  rankLine: string;
  score: number;
  why: string;
  visit?: { href: string; label: string } | null;
  writeHref: string;
  neighbours: Array<{ href: string; name: string; logo: LogoMark; score: number; note?: string }>;
  neighboursTitle: string;
}) {
  return (
    <div className="rail-sticky hidden lg:flex flex-col gap-4">
      <section aria-label={`${name} at a glance`} className="bg-card border border-line rounded-[20px] p-5 shadow-[0_1px_2px_rgb(13_20_33_/_0.04),0_18px_36px_-22px_rgb(13_20_33_/_0.28)]">
        <div className="flex items-center gap-4">
          <ScoreRing value={score} size={84} stroke={7} tone="light" />
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              <Logo {...logo} size={22} />
              <span className="font-[family-name:var(--font-display)] text-[15px] font-bold tracking-[-0.018em] truncate">{name}</span>
            </p>
            <p className="text-[12.5px] font-semibold text-ink mt-[6px]">{rankLine}</p>
          </div>
        </div>
        <p className="text-[12.5px] leading-[1.65] text-ink-2 mt-4 pt-4 border-t border-line-2">{why}</p>
        {visit ? (
          <a
            href={visit.href}
            rel="nofollow noopener sponsored external"
            target="_blank"
            className="mt-4 flex items-center justify-center gap-[6px] h-11 rounded-[12px] bg-accent hover:bg-accent-2 text-white text-[13.5px] font-bold transition-colors"
          >
            {visit.label} <span aria-hidden>↗</span>
          </a>
        ) : null}
        <a href={writeHref} className="mt-2 flex items-center justify-center h-10 rounded-[12px] border border-line text-[13px] font-semibold hover:bg-card-2">
          Write a review
        </a>
      </section>

      {neighbours.length > 0 ? (
        <section className="bg-card border border-line rounded-[20px] px-5 pt-4 pb-2">
          <h2 className="font-[family-name:var(--font-display)] text-[15px] font-bold tracking-[-0.018em] mb-1">
            {neighboursTitle}
          </h2>
          <ul>
            {neighbours.map((n) => (
              <li key={n.href} className="border-t border-line-2 first:border-t-0">
                <Link href={n.href} className="flex items-center gap-3 py-[10px] group">
                  <Logo {...n.logo} size={30} />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold truncate group-hover:text-accent">{n.name}</span>
                    {n.note ? <span className="block text-[11.5px] text-ink-3 truncate">{n.note}</span> : null}
                  </span>
                  <Score value={n.score} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
