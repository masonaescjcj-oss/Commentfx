import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Article, LogoMark } from '@commentfx/core';
import { articleWordCount } from '@commentfx/core';
import { Logo, Score } from './primitives';
import { GuideCover } from './GuideCover';

/**
 * The sections of the front page that are not a list of rows.
 *
 * Each is a door into something the site already has — a ranking, the
 * simulator, a guide — drawn larger than a link because on the front page a
 * reader is still deciding where to go. None of them carries a figure the page
 * it links to does not.
 */

const arrow = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/**
 * The three rankings as three doors, sitting on the lower edge of the hero.
 *
 * From 1024px only. On a phone the hero's "number one in each list" already
 * does this job one scroll above, and three more cards before the first row
 * would push the rankings a screen further down for nothing.
 */
export function CategoryCards({ items }: {
  items: Array<{
    href: string; title: string; note: string; icon: ReactNode;
    logos: LogoMark[]; leader: { name: string; score: number };
  }>;
}) {
  return (
    <div className="hidden lg:grid grid-cols-3 gap-4 -mt-[72px] relative">
      {items.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          className="group bg-card border border-line rounded-[20px] p-5 flex flex-col gap-4 shadow-[0_1px_2px_rgb(13_20_33_/_0.04),0_26px_50px_-26px_rgb(8_18_40_/_0.38)] transition-shadow hover:shadow-[0_1px_2px_rgb(13_20_33_/_0.04),0_30px_56px_-24px_rgb(8_18_40_/_0.48)]"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden className="w-10 h-10 rounded-[12px] bg-accent-bg text-accent grid place-items-center [&>svg]:w-5 [&>svg]:h-5">{c.icon}</span>
            <span className="flex-1 min-w-0">
              <span className="block font-[family-name:var(--font-display)] text-[17px] font-bold tracking-[-0.018em] group-hover:text-accent">{c.title}</span>
              <span className="block text-[12px] text-ink-3">{c.note}</span>
            </span>
            <span aria-hidden className="w-8 h-8 rounded-full border border-line grid place-items-center text-ink-2 group-hover:border-accent group-hover:text-accent">{arrow}</span>
          </span>
          <span className="flex items-center gap-3 pt-[14px] border-t border-line-2">
            <span className="flex -space-x-2">
              {c.logos.map((l, i) => (
                <span key={i} className="rounded-[10px] ring-2 ring-white"><Logo {...l} size={30} /></span>
              ))}
            </span>
            <span className="flex-1 text-[13px] text-ink-2">Led by <b className="text-ink">{c.leader.name}</b></span>
            <span className="flex items-center gap-[5px]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-accent" aria-hidden>
                <path d="m12 2.5 2.9 5.9 6.6.9-4.8 4.6 1.2 6.5L12 17.3 6.1 20.4l1.2-6.5L2.5 9.3l6.6-.9z" />
              </svg>
              <Score value={c.leader.score} />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

/**
 * The simulator, on the front page, with the leading firm's own numbers.
 *
 * Computed on the server from the same engine and the same seed the simulator
 * page uses, so the three percentages here are the ones a reader sees when they
 * follow the link. The trader is the page's default — no edge at all — which is
 * the case that makes the point: the drawdown rule alone moves the pass rate.
 */
export function SimulatorPromo({ firm, href, results, featured }: {
  firm: string;
  href: string;
  /** Pass rate, whole percent, for each design, the firm's own first. */
  results: Array<{ label: string; pct: number; own: boolean }>;
  featured: number;
}) {
  return (
    <section
      aria-labelledby="sim-promo-title"
      className="relative overflow-hidden sm:rounded-[20px] bg-[#081228] bg-[radial-gradient(40ch_30ch_at_100%_0%,rgb(56_110_255_/_0.40),transparent_62%),linear-gradient(180deg,#0B1733,#081228)] text-white p-5 lg:p-[26px] flex flex-col lg:flex-row gap-5 lg:gap-7 lg:items-center"
    >
      <div className="flex-1 min-w-0 flex flex-col gap-[10px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[color:var(--hero-accent,#7FA9FF)]">Challenge simulator</p>
        <h2 id="sim-promo-title" className="font-[family-name:var(--font-display)] text-[22px] lg:text-[26px] font-bold leading-[1.15] tracking-[-0.03em]">
          Would you pass {firm}?
        </h2>
        <p className="text-[13.5px] leading-[1.6] text-[#C3CCDC] max-w-[42ch]">
          A trader with no edge — 40% wins at 1.5R, 1% risk — played forward a thousand times against the rules.
        </p>
        <Link
          href={href}
          className="hidden lg:inline-flex self-start items-center gap-2 h-[42px] px-4 mt-[6px] rounded-[11px] bg-white text-ink text-[13.5px] font-bold"
        >
          Try it with your numbers {arrow}
        </Link>
      </div>
      <div className="lg:w-[272px] lg:shrink-0 rounded-[16px] border border-[rgb(255_255_255_/_0.14)] bg-[rgb(255_255_255_/_0.05)] p-4 lg:p-[18px] flex flex-col gap-3">
        <p className="flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-display)] text-[40px] lg:text-[44px] leading-[0.9] font-bold tracking-[-0.04em] tnum">{featured}%</span>
          <span className="text-[12px] text-[#C3CCDC]">pass phase one</span>
        </p>
        <ul className="flex flex-col gap-2 text-[12px] text-[#C3CCDC]">
          {results.map((r) => (
            <li key={r.label} className="flex items-center gap-2">
              <span className="w-[92px] shrink-0">{r.label}</span>
              <span className="flex-1 h-[6px] rounded-full bg-[rgb(255_255_255_/_0.10)]" aria-hidden>
                <span className={`block h-full rounded-full ${r.own ? 'bg-[#7FA9FF]' : 'bg-[#4F73C9]'}`} style={{ width: `${r.pct}%` }} />
              </span>
              <b className="w-[34px] text-right text-white tnum">{r.pct}%</b>
            </li>
          ))}
        </ul>
        <p className="text-[11.5px] text-[#93A0B6]">Same trades, three drawdown rules</p>
      </div>
      <Link
        href={href}
        className="lg:hidden inline-flex items-center justify-center gap-2 h-[46px] rounded-[12px] bg-white text-ink text-[14px] font-bold"
      >
        Try it with your numbers {arrow}
      </Link>
    </section>
  );
}

const TOPIC_LABEL = { brokers: 'Brokers', props: 'Prop firms', exchanges: 'Exchanges' } as const;

export const readMinutes = (a: Article) => Math.max(1, Math.round(articleWordCount(a) / 220));

export const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/**
 * The newest guides, as cards with their covers. Three across on a wide screen;
 * on a phone a row that scrolls sideways, which is the one place here where
 * that is right — the cards are links, so moving through them with a keyboard
 * scrolls the row with it.
 */
export function GuideCards({ articles }: { articles: Article[] }) {
  return (
    <section aria-labelledby="guides-title" className="pt-5 pb-2 sm:pt-0 lg:pt-6">
      <div className="flex items-baseline gap-3 mb-3 lg:mb-4 px-4 sm:px-0">
        <h2 id="guides-title" className="flex-1 font-[family-name:var(--font-display)] text-[18px] lg:text-[24px] font-bold tracking-[-0.025em]">
          What a ranking cannot tell you
        </h2>
        <Link href="/learn" className="text-accent text-[12.5px] lg:text-[13px] font-semibold hover:text-accent-2 whitespace-nowrap">
          All guides ›
        </Link>
      </div>
      <ul className="flex lg:grid lg:grid-cols-3 gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory px-4 sm:px-0 pb-2 lg:pb-0">
        {articles.map((a) => (
          <li key={a.slug} className="snap-start shrink-0 w-[276px] lg:w-auto">
            <Link
              href={`/learn/${a.slug}`}
              className="group h-full bg-card border border-line rounded-[18px] lg:rounded-[20px] overflow-hidden flex flex-col shadow-[0_1px_2px_rgb(13_20_33_/_0.04),0_6px_18px_-10px_rgb(13_20_33_/_0.10)]"
            >
              <GuideCover article={a} className="h-[150px] lg:h-[184px]" />
              <span className="flex flex-col gap-2 px-4 pt-[14px] pb-4 lg:px-5 lg:pt-[18px] lg:pb-5">
                <span className="text-[10.5px] lg:text-[11px] font-bold uppercase tracking-[0.1em] text-accent">{TOPIC_LABEL[a.topic]}</span>
                <span className="font-[family-name:var(--font-display)] text-[16px] lg:text-[18px] font-bold leading-[1.28] tracking-[-0.02em] group-hover:text-accent text-balance">
                  {a.heading}
                </span>
                <span className="hidden lg:block text-[13px] leading-[1.6] text-ink-2 line-clamp-2">{a.description}</span>
                <span className="text-[11.5px] lg:text-[12px] text-ink-3 mt-auto">
                  <time dateTime={a.published}>{shortDate(a.published)}</time> · {readMinutes(a)} min read
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What makes a score here checkable, said once, at the foot of the front page. From 1024px. */
export function Pillars() {
  const items = [
    {
      title: 'Published weights',
      text: 'Every score is built from the same parts, weighted the same for every company — and the weights are printed on each page.',
      icon: <path d="M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4" />,
      href: '/methodology',
    },
    {
      title: 'Read at the register',
      text: 'Licences are read from the regulator’s own register, not taken from the broker’s claim, with the date they were read.',
      icon: <><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>,
      href: '/learn/check-a-broker-licence',
    },
    {
      title: 'Ads are never ranked',
      text: 'A sponsored placement is labelled, sits outside the list and carries no score. Nobody pays for a place.',
      icon: <><rect x="4" y="5" width="16" height="14" rx="2.5" /><path d="M8 10h8M8 14h5" /></>,
      href: '/about',
    },
  ];
  return (
    <section aria-label="Why the scores can be checked" className="hidden lg:grid grid-cols-3 gap-8 rounded-[24px] border border-line bg-[linear-gradient(180deg,#F8F9FB,#FFFFFF)] px-8 py-[30px] mt-2">
      {items.map((it) => (
        <Link key={it.title} href={it.href} className="group flex flex-col gap-[10px]">
          <span aria-hidden className="w-[42px] h-[42px] rounded-[12px] bg-card border border-line grid place-items-center text-accent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{it.icon}</svg>
          </span>
          <span className="font-[family-name:var(--font-display)] text-[17px] font-bold tracking-[-0.018em] group-hover:text-accent">{it.title}</span>
          <span className="text-[13px] leading-[1.65] text-ink-2">{it.text}</span>
        </Link>
      ))}
    </section>
  );
}
