import Link from 'next/link';
import { SITE } from '@/lib/site';

export function Header({ active }: { active?: string }) {
  return (
    <header className="bg-card border-b border-line sticky top-0 z-20">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-[16px] tracking-[-0.03em]">
          <span className="grid place-items-center w-[26px] h-[26px] rounded-[9px_9px_9px_3px] bg-ink text-white text-[9.5px]">
            FX
          </span>
          {SITE.name}
        </Link>
        <div className="flex-1" />
        <Link href="/search" aria-label="Search" className="w-8 h-8 grid place-items-center text-ink-2">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" />
          </svg>
        </Link>
      </div>
      <nav aria-label="Categories" className="flex gap-[7px] px-4 pb-[11px] overflow-x-auto">
        {SITE.nav.map((n) => {
          const on = active === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={on ? 'page' : undefined}
              className={`text-[12.5px] px-3 py-[5px] rounded-[9px] whitespace-nowrap border shrink-0 ${
                on ? 'bg-ink text-white border-ink font-semibold' : 'bg-card-2 text-ink-2 border-line'
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
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
    <nav aria-label="Breadcrumb" className="text-[11.5px] text-ink-3 px-1 pb-1">
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
    <footer className="mt-8 bg-card border-t border-line px-4 py-7 text-[12.5px] text-ink-2">
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
    </footer>
  );
}
