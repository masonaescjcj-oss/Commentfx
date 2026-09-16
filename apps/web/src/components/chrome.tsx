import Link from 'next/link';
import { SITE } from '@/lib/site';
import { Logotype, Mark } from './Mark';

/**
 * One line at every width, with the sections behind a menu on a phone and laid
 * out along it on a desktop.
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
  { href: '/methodology', label: 'How we score' },
  { href: '/status', label: 'Broker status' },
  { href: '/reviews', label: 'Reviews' },
];

export function Header({ active }: { active?: string }) {
  const current = SITE.nav.find((n) => n.href === active);

  return (
    <header className="bg-card border-b border-line sticky top-0 z-20">
      <div className="shell flex items-center gap-3 py-[11px] lg:py-[9px]">
        {/* The mark. A link on a desktop, where it is the only way back to the
            front page; on a phone it is the summary of the menu below, which
            carries Home as its first row. */}
        <Link href="/" className="hidden lg:flex shrink-0 mr-3" aria-label={`${SITE.name} home`}>
          <Logotype size={27} />
        </Link>

        <nav aria-label="Sections" className="hidden lg:flex items-center gap-[2px] min-w-0">
          {SITE.nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active === n.href ? 'page' : undefined}
              className={`px-[10px] py-[7px] rounded-[9px] text-[13.5px] hover:bg-card-2 ${
                active === n.href ? 'font-semibold' : 'text-ink-2'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <details className="menu relative lg:hidden">
          <summary className="flex items-center gap-2 pl-[8px] pr-[10px] py-[5px] rounded-[11px] border border-line cursor-pointer list-none">
            <Mark size={25} className="text-accent shrink-0" />
            <span className="font-[family-name:var(--font-display)] font-bold text-[15.5px] tracking-[-0.035em]">
              {SITE.name}
            </span>
            {current ? (
              <span className="text-[13px] text-ink-3 font-medium">{current.label}</span>
            ) : null}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="text-ink-3" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>

          <nav
            aria-label="Sections"
            className="absolute left-0 top-[calc(100%+7px)] w-[232px] bg-card border border-line rounded-[14px] p-[6px] shadow-[0_10px_30px_-12px_rgb(13_20_33_/_0.22)]"
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
                  <Link href={href} className="block px-3 py-[7px] rounded-[9px] text-[13.5px] text-ink-2 hover:bg-card-2">
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
              className="px-[10px] py-[7px] rounded-[9px] text-[13px] text-ink-3 hover:bg-card-2 hover:text-ink-2"
            >
              {label}
            </Link>
          ))}
        </nav>

        <Link href="/search" aria-label="Search" className="w-9 h-9 grid place-items-center rounded-[11px] border border-line text-ink-2 shrink-0">
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
export function Breadcrumbs({ trail }: { trail: Array<{ name: string; path: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[11.5px] text-ink-3 gutter pb-1">
      <ol className="flex flex-wrap items-center gap-1">
        {trail.map((t, i) => (
          <li key={t.path} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden className="text-line">/</span>}
            {i === trail.length - 1 ? (
              <span className="text-ink-2">{t.name}</span>
            ) : (
              <Link href={t.path} className="hover:text-ink inline-block py-[4px] -my-[4px]">
                {t.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-8 bg-card border-t border-line text-[12.5px] text-ink-2">
      <div className="shell py-7 lg:py-9">
        {/* Same reason as the breadcrumbs: padded to 24px of hit area, pulled
            back so the rows stay where they were. */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 mb-5">
          {[
            { href: '/methodology', label: 'How we score', strong: true },
            { href: '/status', label: 'Broker status', strong: true },
            { href: '/reviews', label: 'Reviews', strong: true },
            { href: '/best/lowest-spread', label: 'Lowest cost' },
            { href: '/best/tier-1-regulated', label: 'Tier-1 regulated' },
            { href: '/best/low-minimum-deposit', label: 'Low minimum' },
            { href: '/best/fast-withdrawals', label: 'Fast withdrawals' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`inline-block py-[4px] ${l.strong ? 'font-semibold text-ink' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <p className="leading-[1.8] max-w-[60ch] mb-3">
          {SITE.name} earns commission from some brokers when a reader opens an account.
          That is disclosed on every link. It has no effect on the score or the order of
          any list — the weights are published, and every licence is checked against its
          regulator’s register or the page says why it could not be.
        </p>
        <p className="leading-[1.8] max-w-[60ch] text-ink-3">
          Nothing here is investment advice. Trading leveraged products carries a high
          risk of losing money rapidly.
        </p>
        <p className="mt-5 text-ink-3">© {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </footer>
  );
}
