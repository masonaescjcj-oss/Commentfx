import Link from 'next/link';
import type { ReactNode } from 'react';
import { SITE } from '@/lib/site';
import { Logotype, Mark } from './Mark';

/**
 * One line at every width, in the blue of the hero, with the sections behind a
 * menu on a phone and laid out along it on a desktop.
 *
 * It is the same dark surface on every page, not only the one with the hero
 * under it. A bar that changes colour with the page beneath it is two headers
 * a reader has to recognise as one thing, and the seam between them is exactly
 * where the eye lands on arrival.
 *
 * It was two rows — a brand row and a strip of category chips under it — which
 * cost 40px of every screen before a reader saw anything, and the chips
 * overflowed sideways on a phone so half the sections were off the edge anyway.
 * A menu solved that. On a desktop a menu solves a problem that is not there:
 * six labels fit along the line with room to spare, and making someone open
 * something to find out what a site contains is a cost paid for nothing.
 *
 * So both are in the markup and CSS picks one. Not two headers — one header
 * whose middle is a disclosure below 1024px and a nav above it. The links are
 * written once, from SITE.nav, so the two can never come to disagree about what
 * this site has on it.
 *
 * <details> rather than a button and a script, for the same reason the ranking
 * tabs are radios: it is a native disclosure, so it is keyboard-operable and
 * announced correctly without a line of JavaScript, and it works before
 * hydration — which on this site means always, because nothing here hydrates.
 * The one thing it will not do is close when you click elsewhere on the page.
 * Clicking a link closes it by navigating, and clicking the pill closes it.
 */
const MORE = [
  { href: '/learn', label: 'Guides' },
  { href: '/methodology', label: 'How we score' },
  { href: '/status', label: 'Broker status' },
  { href: '/reviews', label: 'Reviews' },
];

export function Header({ active }: { active?: string }) {
  // The pill names the page you are on, and the pages you can be on are not
  // only the six in SITE.nav — /learn lives in MORE, and a header that goes
  // blank on a section it links to is a header that has stopped being a map.
  const current = [...SITE.nav, ...MORE].find((n) => n.href === active);

  return (
    <header className="site-header sticky top-0 z-20">
      <div className="shell flex items-center gap-3">
        {/* The mark. A link on a desktop, where it is the only way back to the
            front page; on a phone it is the summary of the menu below, which
            carries Home as its first row. */}
        <Link href="/" className="hdr-brand hidden lg:flex shrink-0 mr-3" aria-label={`${SITE.name} home`}>
          <Logotype size={27} />
        </Link>

        <nav aria-label="Sections" className="hidden lg:flex items-center gap-[2px] min-w-0">
          {SITE.nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active === n.href ? 'page' : undefined}
              // nowrap, because "Prop Firms" was breaking across two lines at
              // exactly 1024px — 59px of link inside a 56px bar, overflowing
              // the header it sits in. Measured at the breakpoint; the row
              // still fits on one line with every label whole.
              className={`hdr-link whitespace-nowrap px-[10px] py-[7px] rounded-[9px] text-[13.5px] ${
                active === n.href ? 'hdr-current' : ''
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <details className="menu relative lg:hidden">
          <summary className="hdr-pill flex items-center gap-2 pl-[8px] pr-[10px] py-[5px] rounded-[11px] cursor-pointer list-none">
            <span className="hdr-brand flex items-center gap-2 min-w-0">
              <Mark size={25} className="shrink-0" />
              <span className="font-[family-name:var(--font-display)] font-bold text-[15.5px] tracking-[-0.035em]">
                {SITE.name}
              </span>
            </span>
            {current ? (
              <span className="text-[13px] text-[color:var(--hdr-ink-2)] font-medium">{current.label}</span>
            ) : null}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="text-[color:var(--hdr-ink-2)]" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>

          {/* The panel stays on white. It is a sheet over the page rather than
              part of the bar, and a dark sheet of six links over a white page
              is a second dark surface fighting the first. */}
          <nav
            aria-label="Sections"
            className="absolute left-0 top-[calc(100%+7px)] w-[232px] bg-card border border-line rounded-[14px] p-[6px] shadow-[0_18px_40px_-16px_rgb(7_15_34_/_0.45)]"
          >
            <ul>
              <li>
                <Link href="/" className="block px-3 py-[7px] rounded-[9px] text-[13.5px] hover:bg-card-2">
                  Home
                </Link>
              </li>
              {SITE.nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active === n.href ? 'page' : undefined}
                    className={`block px-3 py-[7px] rounded-[9px] text-[13.5px] hover:bg-card-2 ${
                      active === n.href ? 'bg-card-2 font-semibold' : ''
                    }`}
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              <li aria-hidden className="my-[5px] mx-3 border-t border-line-2" />
              {MORE.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active === href ? 'page' : undefined}
                    className={`block px-3 py-[7px] rounded-[9px] text-[13.5px] text-ink-2 hover:bg-card-2 ${
                      active === href ? 'bg-card-2 font-semibold' : ''
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>

        <div className="flex-1" />

        {/* The three below the fold on a phone, where the footer is the only
            place they appear. There is room for them up here on a desktop. */}
        <nav aria-label="More" className="hidden lg:flex items-center gap-[2px] shrink-0">
          {MORE.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={active === href ? 'page' : undefined}
              className={`hdr-link whitespace-nowrap px-[10px] py-[7px] rounded-[9px] text-[13px] ${
                active === href ? 'hdr-current' : ''
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/search"
          aria-label="Search"
          className="hdr-pill w-9 h-9 grid place-items-center rounded-[11px] text-[color:var(--hdr-ink-2)] shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" />
          </svg>
        </Link>
      </div>
    </header>
  );
}

/**
 * Visible breadcrumbs. The matching JSON-LD is emitted by each page.
 *
 * The links carry vertical padding pulled back by an equal negative margin:
 * the hit area clears the 24px minimum without the row growing or anything
 * moving. 11.5px text is 19px tall on its own, which is a small thing to ask a
 * thumb to find.
 */
export function Breadcrumbs({ trail, tone = 'light' }: {
  trail: Array<{ name: string; path: string }>;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  // The last step is the page you are already on, so it is text rather than a
  // link. A trail of one step is therefore a navigation with nothing to
  // navigate to, and a landmark announcing itself for no reason.
  if (trail.length < 2) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-[11.5px] ${dark ? 'text-[color:var(--hero-ink-3)]' : 'text-ink-3 gutter pb-1'}`}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {trail.map((t, i) => (
          <li key={t.path} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden className={dark ? 'text-[rgb(255_255_255_/_0.28)]' : 'text-line'}>/</span>}
            {i === trail.length - 1 ? (
              <span className={dark ? 'text-[color:var(--hero-ink-2)]' : 'text-ink-2'}>{t.name}</span>
            ) : (
              <Link
                href={t.path}
                className={`inline-block py-[4px] -my-[4px] ${dark ? 'hover:text-white' : 'hover:text-ink'}`}
              >
                {t.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * The blue band every page opens on.
 *
 * It is the small version of the front page's hero, and it is the same object:
 * the same painting, shifted by the same header height, so header and band read
 * as one surface rather than as a bar sitting on a panel. On a section page it
 * carries that page's name; on a record page it carries the trail alone, because
 * the card immediately below already says whose page it is in bigger type next
 * to their logo, and saying it twice is not emphasis, it is noise.
 *
 * The h1 it renders is the same h1 that used to be in the markup and off the
 * screen. Hiding it was right when the alternative was a line of ink floating
 * above a list that already said what it was; on a band of its own it is the
 * thing that makes the band a place rather than a stripe.
 */
export function PageHero({ title, trail = [], children }: {
  title?: string;
  trail?: Array<{ name: string; path: string }>;
  children?: ReactNode;
}) {
  return (
    <section className={`hero ${title ? '' : 'hero-thin'}`}>
      <div className={`shell ${title ? 'pt-4 pb-6 sm:pt-5 sm:pb-8 lg:pt-6 lg:pb-9' : 'py-3 sm:py-[14px]'}`}>
        <Breadcrumbs trail={trail} tone="dark" />
        {title ? (
          <h1 className="font-[family-name:var(--font-display)] text-[23px] sm:text-[27px] lg:text-[31px] font-bold leading-[1.12] tracking-[-0.032em] text-white mt-[7px] max-w-[22ch] text-balance">
            {title}
          </h1>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/**
 * The footer, as a directory rather than as a page of small print.
 *
 * It carried two paragraphs — a commission disclosure and a risk warning — and
 * they were the last thing on every page on the site. A wall of prose at the
 * bottom is where nobody reads and everybody scrolls past, which is a poor
 * place for something that matters and a worse place for everything else.
 *
 * So: four columns of where to go next, and one line of small print beside the
 * year. The disclosure did not disappear — it is on every outbound link, which
 * is the only place it is ever read, and the methodology page says it in full.
 */
const FOOTER: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: 'Rankings',
    links: [
      { href: '/brokers', label: 'Forex brokers' },
      { href: '/props', label: 'Prop firms' },
      { href: '/exchanges', label: 'Crypto exchanges' },
      { href: '/coins', label: 'Coin prices' },
    ],
  },
  {
    title: 'Best for',
    links: [
      { href: '/best/lowest-spread', label: 'Lowest cost' },
      { href: '/best/tier-1-regulated', label: 'Tier-1 regulated' },
      { href: '/best/low-minimum-deposit', label: 'Low minimum' },
      { href: '/best/fast-withdrawals', label: 'Fast withdrawals' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/props/challenge-simulator', label: 'Challenge simulator' },
      { href: '/calendar', label: 'Economic calendar' },
      { href: '/memecoins', label: 'Memecoin radar' },
      { href: '/status', label: 'Broker status' },
      { href: '/search', label: 'Search' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'Who runs this' },
      { href: '/methodology', label: 'How we score' },
      { href: '/learn', label: 'Guides' },
      { href: '/reviews', label: 'Reviews' },
      { href: '/reviews/withdraw', label: 'Withdraw a review' },
      { href: '/privacy', label: 'Privacy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-10 bg-card border-t border-line">
      <div className="shell py-9 lg:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-[auto_repeat(4,1fr)] gap-x-6 gap-y-8 lg:gap-x-10">
          <div className="col-span-2 lg:col-span-1 lg:pr-8">
            <Link href="/" className="inline-flex text-accent" aria-label={`${SITE.name} home`}>
              <Logotype size={26} />
            </Link>
            <p className="text-[12px] text-ink-3 leading-[1.7] mt-3 max-w-[26ch]">
              Independent rankings on published weights.
            </p>
          </div>

          {FOOTER.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3 mb-[10px]">
                {col.title}
              </h2>
              <ul className="flex flex-col gap-[2px]">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-block text-[13px] text-ink-2 py-[5px] hover:text-accent">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-9 pt-5 border-t border-line-2 text-[11.5px] text-ink-3">
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          <span aria-hidden className="text-line">·</span>
          <Link href="/about" className="hover:text-accent">No affiliate links · ads are labelled and never ranked</Link>
          <span aria-hidden className="text-line">·</span>
          <span>Not investment advice</span>
        </div>
      </div>
    </footer>
  );
}
