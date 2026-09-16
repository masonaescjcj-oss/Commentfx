import Link from 'next/link';
import type { ReactNode } from 'react';
import { legibleTile } from '@commentfx/core';

/**
 * A section of the page.
 *
 * On a phone it is not a box. It was — a rounded, bordered card inset from both
 * edges — and on a 390px screen that spent 32px of a 390px width on margin plus
 * two more on the border, to draw a shape around something that already had a
 * heading and blank space above it. The rows inside had less room than the
 * screen actually offered, for an outline nobody needed. So at that width the
 * card is edge to edge with a hairline under it, and the padding a caller
 * passes still keeps the text off the glass.
 *
 * From 1024px up it is a box again, and there the border earns its keep: the
 * page is two columns by then, and a card in a rail beside another column needs
 * an edge to say where it ends.
 */
export function Card({ children, className = '', as: As = 'div', id }: {
  children: ReactNode; className?: string; as?: 'div' | 'section' | 'article';
  /** Set only where the card is a link target, so #reviews lands on it. */
  id?: string;
}) {
  return (
    <As
      id={id}
      className={`bg-card border-b border-line lg:border lg:rounded-[16px] ${className}`}
    >
      {children}
    </As>
  );
}

export function CardHead({ title, href, hrefLabel, aside }: {
  title: string; href?: string; hrefLabel?: string; aside?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3">
      <h2 className="text-[15px] font-bold tracking-[-0.01em]">{title}</h2>
      {aside}
      {href && (
        <Link href={href} className="text-brass text-[12px] font-semibold hover:text-brass-2">
          {hrefLabel ?? 'All'} <span aria-hidden>›</span>
        </Link>
      )}
    </div>
  );
}

/** Rank is the identity of this product, so it gets its own component. */
export function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={`w-6 shrink-0 text-center tnum text-[13px] font-extrabold ${
        rank <= 3 ? 'text-brass' : 'text-ink-3'
      }`}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}

export function Score({ value, size = 'md' }: { value: number; size?: 'md' | 'lg' | 'xl' }) {
  const cls = size === 'xl' ? 'text-[30px]' : size === 'lg' ? 'text-[17px]' : 'text-[16px]';
  return <span className={`font-extrabold tracking-[-0.02em] tnum ${cls}`}>{value.toFixed(1)}</span>;
}

export function Tag({ children, tone = 'neutral' }: {
  children: ReactNode;
  tone?: 'neutral' | 'good' | 'bad' | 'warn' | 'brass';
}) {
  const tones = {
    neutral: 'bg-card-2 border-line text-ink-2',
    good: 'bg-up-bg border-transparent text-up',
    bad: 'bg-down-bg border-transparent text-down',
    warn: 'bg-warn-bg border-transparent text-warn',
    brass: 'bg-brass-bg border-transparent text-brass',
  } as const;
  return (
    <span className={`inline-block text-[10.5px] leading-[1.55] px-[7px] py-[2px] rounded-md border ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Logo({ initials, bg, fg, img, size = 40 }: {
  initials: string; bg: string; fg: string; img?: string; size?: number;
}) {
  // Width and height are set on the element, not just in CSS, so the box exists
  // before the file arrives and nothing below it moves. The site's CLS budget is
  // the reason every one of these is the same square.
  //
  // The hairline is not decoration: several of these marks are a dark shape on a
  // white field, and on a white page that is a logo with no edge, floating. It
  // is the same hairline that edges every card, for the same reason.
  if (img) {
    return (
      <img
        src={img}
        alt=""
        aria-hidden
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="shrink-0 rounded-xl object-cover bg-card-2 border border-line"
        style={{ width: size, height: size }}
      />
    );
  }

  // No file for this record yet. The brand's own pairing is the preference, not
  // the last word: these colours arrive as data and several of them put white
  // text on a mid-tone fill that nobody can read. legibleTile keeps the hue and
  // fixes the rest.
  const tile = legibleTile(bg, fg);
  return (
    <span
      aria-hidden
      className="grid place-items-center shrink-0 font-extrabold rounded-xl"
      style={{ width: size, height: size, background: tile.bg, color: tile.fg, fontSize: size * 0.32 }}
    >
      {initials}
    </span>
  );
}

/** A bar that reads as a proportion, used for score components. */
export function Meter({ value, max = 10, tone = 'ink' }: {
  value: number; max?: number; tone?: 'ink' | 'up' | 'brass' | 'warn';
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bg = { ink: 'bg-ink', up: 'bg-up', brass: 'bg-brass', warn: 'bg-warn' }[tone];
  return (
    <div className="h-[5px] rounded-full bg-card-3 overflow-hidden">
      <div className={`h-full rounded-full ${bg}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
