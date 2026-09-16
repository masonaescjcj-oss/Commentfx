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
 * From 640px up it is a box again. The trade that makes edge-to-edge right on a
 * phone — 34px of a 390px screen is a tenth of everything — stops being a trade
 * at all once there is width going spare, and a section touching both edges of
 * a 900px window just looks unfinished.
 */
export function Card({ children, className = '', as: As = 'div', id }: {
  children: ReactNode; className?: string; as?: 'div' | 'section' | 'article';
  /** Set only where the card is a link target, so #reviews lands on it. */
  id?: string;
}) {
  return (
    <As
      id={id}
      className={`bg-card border-b border-line sm:border sm:rounded-[16px] lg:rounded-[20px] ${className}`}
    >
      {children}
    </As>
  );
}

/**
 * The heading of a section, and the one link out of it.
 *
 * It is set in the display face rather than the body one. The two are close
 * enough in colour that nobody would name the difference, and that is the
 * point: a page where every heading is the body font at one weight up reads as
 * a form, not as something anyone designed.
 */
export function CardHead({ title, href, hrefLabel, aside }: {
  title: string; href?: string; hrefLabel?: string; aside?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3 lg:mb-4">
      <h2 className="font-[family-name:var(--font-display)] text-[16px] lg:text-[17px] font-bold tracking-[-0.018em]">
        {title}
      </h2>
      {aside}
      {href && (
        <Link
          href={href}
          className="text-accent text-[12px] font-semibold hover:text-accent-2 shrink-0 whitespace-nowrap"
        >
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
        rank <= 3 ? 'text-accent' : 'text-ink-3'
      }`}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}

/**
 * The score, which is the whole product.
 *
 * It was one step up from the body text in the same face and weight as a row
 * label, so the number this entire site exists to publish arrived on the page
 * looking like a quantity in a table. It is set in the display face now, a size
 * that separates it from everything beside it, and tracked in hard, which is
 * what stops a large tabular figure reading as loose.
 *
 * It stays a plain figure in one colour. Tinting the leaders would say the
 * score means something different at the top of a list than the bottom, and it
 * does not — a 9.1 is a 9.1 whoever is above it. Rank is the thing that carries
 * position, and RankBadge is already where that is said.
 */
export function Score({ value, size = 'md' }: { value: number; size?: 'md' | 'lg' | 'xl' }) {
  const cls =
    size === 'xl' ? 'text-[38px] lg:text-[46px] leading-[0.95]'
    : size === 'lg' ? 'text-[20px] lg:text-[22px]'
    : 'text-[17px] lg:text-[19px]';
  return (
    <span className={`font-[family-name:var(--font-display)] font-bold tracking-[-0.035em] tnum ${cls}`}>
      {value.toFixed(1)}
    </span>
  );
}

export function Tag({ children, tone = 'neutral' }: {
  children: ReactNode;
  tone?: 'neutral' | 'good' | 'bad' | 'warn' | 'accent';
}) {
  const tones = {
    neutral: 'bg-card-2 border-line text-ink-2',
    good: 'bg-up-bg border-transparent text-up',
    bad: 'bg-down-bg border-transparent text-down',
    warn: 'bg-warn-bg border-transparent text-warn',
    accent: 'bg-accent-bg border-transparent text-accent',
  } as const;
  return (
    <span
      className={`inline-block text-[10.5px] lg:text-[11.5px] leading-[1.6] px-[8px] lg:px-[10px] py-[3px] lg:py-[4px] rounded-lg border ${tones[tone]}`}
    >
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
  value: number; max?: number; tone?: 'ink' | 'up' | 'accent' | 'warn';
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bg = { ink: 'bg-ink', up: 'bg-up', accent: 'bg-accent', warn: 'bg-warn' }[tone];
  // 3px, not 5. A meter is a proportion, and the wider the column the less of
  // it needs to be ink to say so — at the width a desktop column gives it, five
  // pixels of solid colour stops reading as a measurement and starts reading as
  // a banner.
  return (
    <div className="h-[3px] rounded-full bg-card-3 overflow-hidden">
      <div className={`h-full rounded-full ${bg}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
