import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo, Meter, Stars } from './primitives';
import { Flag } from './Flag';
import { ScoreRing } from './ScoreRing';
import type { LogoMark } from '@commentfx/core';

/**
 * The top of a record page: who this is, what they scored, and the two things
 * a reader came to do about it — all on the blue band, above the white.
 *
 * It used to be the first white card on the page, which meant a reader arriving
 * at a broker page met a hairline rectangle and had to read to find out whose
 * page it was. The band was already there carrying nothing but a trail. Putting
 * the identity on it costs no height that was not already spent and gives the
 * page a front door.
 *
 * Nothing here is new information. The rank, the score, its four parts, the
 * four facts and the two buttons are all things the page said further down; the
 * change is that they are said once, at the top, in the order a reader asks
 * them: who, how good, on what, and then what can I do.
 *
 * From 1024px the same pieces are rearranged rather than redrawn: the score as
 * a ring and the two buttons move up beside the name, where a wide screen has
 * room going spare, and the regulators move under it. The markup is in the
 * phone's order and the placement is a grid in globals.css (.record-hero), so a
 * phone gets exactly the page it had — the ring is the one piece it never
 * shows, because on a phone the stars and the figure already say it.
 */
export interface HeroFact { label: string; value: string; flag?: string }
export interface HeroPart { label: string; value: number | null; weight: number }

export function RecordHero({
  logo, name, badge, rank, of, score, facts, parts, reviews, visit, children,
}: {
  logo: LogoMark;
  name: string;
  badge?: { text: string; tone: 'strong' | 'plain' } | null;
  rank: number;
  of: number;
  score: number;
  facts: HeroFact[];
  parts: HeroPart[];
  reviews?: { count: number; href: string } | null;
  visit?: { href: string; label: string } | null;
  children?: ReactNode;
}) {
  return (
    <div className="record-hero mt-4">
      <div className="rh-id flex gap-[14px] items-start">
        {/* The mark on its own white tile, which is the only white above the
            fold and is therefore where the eye lands. The badge sits on its
            corner rather than beside the name, because it is a fact about the
            company and not part of what they are called. */}
        <span className="relative shrink-0">
          <span className="block p-[5px] bg-white rounded-[15px]">
            <Logo {...logo} size={62} />
          </span>
          {/* On the corner of the tile, and short. It sat under the tile and
              centred until "Static drawdown" ran straight through the stars on
              a 390px screen: a badge wider than the thing it is a badge on will
              always find something to collide with. The long form of each of
              these is on the page below — the licence list, the rules card, the
              breach line — so this is a label, not the fact itself. */}
          {badge ? (
            <span className={`absolute -top-[6px] -left-[5px] whitespace-nowrap rounded-full px-[7px] py-[2px] text-[9px] font-extrabold uppercase tracking-[0.05em] ${
              badge.tone === 'strong'
                ? 'bg-[color:var(--hero-accent)] text-[#08132B]'
                : 'bg-[rgb(255_255_255_/_0.16)] text-white'
            }`}>
              {badge.text}
            </span>
          ) : null}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-[color:var(--hero-accent)] tnum">
            Rank #{rank} of {of}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] sm:text-[30px] lg:text-[42px] font-bold leading-[1.1] lg:leading-[1.02] tracking-[-0.032em] lg:tracking-[-0.038em] text-white mt-[3px] lg:mt-[6px]">
            {name}
          </h1>
          <div className="flex items-center gap-[9px] mt-[7px] lg:mt-[10px]">
            <Stars value={score} />
            <span className="font-[family-name:var(--font-display)] text-[19px] font-bold tracking-[-0.03em] tnum text-white">
              {score.toFixed(1)}
            </span>
            <Link href="/methodology" className="text-[11.5px] text-[color:var(--hero-ink-3)] hover:text-white">
              out of 10 — how we score
            </Link>
          </div>
          {reviews ? (
            <a href={reviews.href} className="inline-block text-[12px] text-[color:var(--hero-accent)] mt-[6px] hover:underline tnum">
              {reviews.count} {reviews.count === 1 ? 'review' : 'reviews'} ›
            </a>
          ) : null}
        </div>
      </div>

      <div className="rh-ring">
        <ScoreRing value={score} size={128} stroke={9} caption="out of 10" />
      </div>

      <dl className="rh-facts grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-[10px] mt-5 lg:mt-7 pt-4 lg:pt-5 border-t border-[color:var(--hero-line)]">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="text-[11px] lg:text-[12px] text-[color:var(--hero-ink-3)]">{f.label}</dt>
            <dd className="flex items-center gap-[6px] text-[14.5px] lg:text-[16px] font-bold tnum text-white mt-[1px] lg:mt-[3px]">
              {f.flag ? <Flag code={f.flag} w={17} title={f.value} /> : null}
              <span className="min-w-0 truncate">{f.value}</span>
            </dd>
          </div>
        ))}
      </dl>

      {/* The score, opened up. Four panels rather than a list, because these are
          four independent readings and a list implies an order they do not
          have. A component with no data shows a dash and no bar: an empty bar
          and a zero look the same from a distance and mean opposite things. */}
      <ul className="rh-parts grid grid-cols-2 lg:grid-cols-4 gap-[9px] lg:gap-3 mt-4">
        {parts.map((p) => (
          <li key={p.label} className="rounded-[13px] lg:rounded-[14px] bg-[rgb(255_255_255_/_0.06)] border border-[color:var(--hero-line)] px-[13px] py-[11px] lg:px-4 lg:py-[14px]">
            {p.value === null ? (
              <div className="h-[3px] rounded-full bg-[rgb(255_255_255_/_0.12)]" />
            ) : (
              <Meter value={p.value} tone="on-dark" />
            )}
            <div className="flex items-end justify-between gap-2 mt-[9px]">
              <span className="text-[11.5px] leading-[1.3] text-[color:var(--hero-ink-2)]">{p.label}</span>
              <span className="text-[15px] font-bold tnum text-white leading-none">
                {p.value === null ? '—' : p.value.toFixed(1)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* On a wide screen the visit button goes on top: column-reverse, so the
          source order — and therefore the order a keyboard or a screen reader
          meets them in on a phone — is unchanged. */}
      <div className="rh-act flex gap-[9px] mt-4 max-w-[520px] lg:mt-0 lg:flex-col-reverse lg:gap-[10px]">
        <a
          href="#write"
          className="hero-ghost flex-1 lg:flex-none inline-flex items-center justify-center h-11 rounded-[12px] text-[13.5px] font-semibold"
        >
          Write a review
        </a>
        {visit ? (
          <a
            href={visit.href}
            rel="nofollow noopener sponsored external"
            target="_blank"
            className="hero-cta flex-1 lg:flex-none inline-flex items-center justify-center gap-[6px] h-11 lg:h-12 rounded-[12px] bg-white text-ink text-[13.5px] lg:text-[14px] font-bold"
          >
            {visit.label} <span aria-hidden>↗</span>
          </a>
        ) : null}
      </div>

      <div className="rh-extra">{children}</div>
    </div>
  );
}

/**
 * The same header, for a sponsor.
 *
 * It looks like a record's header on purpose — the white tile, the name, the
 * four figures, the panels, the white button — because a sponsor's page should
 * read as part of this site. It differs where a record's header makes a claim
 * this site has not made about a sponsor: "Sponsored" stands where the rank
 * does, there are no stars and no score, and the four panels carry the
 * sponsor's terms as plain figures, without the bars that mean a score. The
 * visit button's link is rel="sponsored", like every link to a sponsor.
 */
export function SponsorHero({ logo, name, pitch, facts, terms, visit, children }: {
  logo: LogoMark;
  name: string;
  pitch: string;
  facts: HeroFact[];
  terms: Array<{ label: string; value: string }>;
  visit: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="flex gap-[14px] items-start">
        <span className="relative shrink-0">
          <span className="block p-[5px] bg-white rounded-[15px]">
            <Logo {...logo} size={62} />
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p data-sponsored-label="" className="text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-[color:var(--hero-accent)]">
            Sponsored
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[26px] sm:text-[30px] lg:text-[34px] font-bold leading-[1.1] tracking-[-0.032em] text-white mt-[3px]">
            {name}
          </h1>
          <p className="text-[13px] leading-[1.6] text-[color:var(--hero-ink-2)] mt-[7px] max-w-[60ch]">{pitch}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-[10px] mt-5 pt-4 border-t border-[color:var(--hero-line)]">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="text-[11px] text-[color:var(--hero-ink-3)]">{f.label}</dt>
            <dd className="text-[14.5px] font-bold tnum text-white mt-[1px] truncate">{f.value}</dd>
          </div>
        ))}
      </dl>

      <ul className="grid grid-cols-2 lg:grid-cols-4 gap-[9px] mt-4">
        {terms.map((t) => (
          <li key={t.label} className="rounded-[13px] bg-[rgb(255_255_255_/_0.06)] border border-[color:var(--hero-line)] px-[13px] py-[11px]">
            <div className="flex items-end justify-between gap-2">
              <span className="text-[11.5px] leading-[1.3] text-[color:var(--hero-ink-2)]">{t.label}</span>
              <span className="text-[15px] font-bold tnum text-white leading-none">{t.value}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-[9px] mt-4 max-w-[520px]">
        <a
          href={visit.href}
          rel="sponsored noopener noreferrer"
          target="_blank"
          className="hero-cta flex-1 inline-flex items-center justify-center gap-[6px] h-11 rounded-[12px] bg-white text-ink text-[13.5px] font-bold"
        >
          {visit.label} <span aria-hidden>↗</span>
        </a>
      </div>

      {children}
    </div>
  );
}

/**
 * The page's own sections, as a grid of doors.
 *
 * A record page is long — licences, costs, entity map, outages, reviews, the
 * comparisons — and on a phone that is a great deal of scrolling to find out
 * whether the one thing you came for is even on it. This says what is on it in
 * one screen and takes you there.
 *
 * A section with nothing in it is drawn dimmed and is not a link, rather than
 * being left out: a grid that changes shape from company to company is a grid a
 * reader has to read every time.
 *
 * From 1024px the same links are one line of tabs that stays under the header
 * while the page scrolls (.jump-bar in globals.css). A grid of big doors is the
 * right shape for a thumb and the wrong one for a pointer, where it was two
 * rows of icons taking a screen's worth of height to say eight words. Both
 * lists are in the markup and CSS shows one, so neither width loses a link.
 */
export function QuickJump({ items }: {
  items: Array<{ href: string; label: string; icon: ReactNode; ready?: boolean }>;
}) {
  return (
    <nav aria-label="On this page" className="jump-bar bg-card border-b border-line sm:border sm:rounded-[16px] px-2 py-3 lg:px-2 lg:py-0">
      <ul className="grid grid-cols-4 gap-y-1 lg:hidden">
        {items.map(({ href, label, icon, ready = true }) => {
          const inner = (
            <>
              <span aria-hidden className={ready ? 'text-accent' : 'text-line'}>{icon}</span>
              <span className={`text-[10.5px] leading-[1.25] text-center ${ready ? 'text-ink-2' : 'text-ink-3'}`}>
                {label}
              </span>
            </>
          );
          return (
            <li key={label}>
              {ready ? (
                <a href={href} className="flex flex-col items-center gap-[6px] px-1 py-[10px] rounded-[10px] hover:bg-card-2">
                  {inner}
                </a>
              ) : (
                /* No opacity. Measured: ink-3 on white is 5.27:1 and the same
                   colour at 60% is 2.42:1, because fading text composites it
                   towards the background and takes the contrast with it. The
                   entity map already had this written down and this grid was
                   doing it anyway. The icon in `text-line` carries the
                   de-emphasis on its own. */
                <span className="flex flex-col items-center gap-[6px] px-1 py-[10px]">{inner}</span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Words only. With the icons, a broker's twelve sections ran past the
          right edge of the bar at 1024px — measured, not guessed — and on a
          line of tabs the label is the thing a pointer is aimed at anyway. */}
      <ul className="hidden lg:flex items-center gap-[2px] h-[56px]">
        {items.map(({ href, label, ready = true }) => (
          <li key={label}>
            {ready ? (
              <a href={href} className="jump-tab inline-flex items-center h-10 px-3 rounded-[10px] text-[13px] font-semibold text-ink-2 whitespace-nowrap">
                {label}
              </a>
            ) : (
              <span className="inline-flex items-center h-10 px-3 text-[13px] text-ink-3 whitespace-nowrap">
                {label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * The two actions, pinned to the bottom of a phone.
 *
 * On a page this long the thing a reader wants to do is off-screen for most of
 * the time they are on it. Fixed, so it costs no layout and cannot shift
 * anything; hidden from 1024px, where the page is two columns and nothing is
 * ever that far away.
 *
 * The page carries matching bottom padding below 1024px, because a bar that
 * covers the last card is a bar that hides the thing it is advertising.
 *
 * A <nav>, not a <div>. It is fixed, so it is outside <main>, and anything
 * outside every landmark is content a screen reader user reaches only by
 * walking the whole document — which axe failed it for, on all three record
 * pages, at phone width and nowhere else.
 */
export function StickyActions({ compareHref, writeHref }: { compareHref: string; writeHref: string }) {
  return (
    <nav
      aria-label="Page actions"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-line px-3 py-[10px] flex gap-[9px] items-center"
    >
      <a href={compareHref} className="flex items-center justify-center gap-[6px] h-11 px-4 rounded-[12px] border border-line text-[13px] font-semibold shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M8 4 4 8l4 4M4 8h16M16 20l4-4-4-4M20 16H4" />
        </svg>
        Compare
      </a>
      <a href={writeHref} className="flex-1 inline-flex items-center justify-center h-11 rounded-[12px] bg-accent text-white text-[13.5px] font-bold">
        Write a review
      </a>
    </nav>
  );
}
