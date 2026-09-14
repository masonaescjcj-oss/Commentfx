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

/** Visible breadcrumbs. The matching JSON-LD is emitted by each page. */
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
              <Link href={t.path} className="hover:text-ink">{t.name}</Link>
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
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-5">
        <Link href="/methodology" className="font-semibold text-ink">How we score</Link>
        <Link href="/status" className="font-semibold text-ink">Broker status</Link>
        <Link href="/best/lowest-spread">Lowest cost</Link>
        <Link href="/best/tier-1-regulated">Tier-1 regulated</Link>
        <Link href="/best/low-minimum-deposit">Low minimum</Link>
        <Link href="/best/fast-withdrawals">Fast withdrawals</Link>
      </div>
      <p className="leading-[1.8] max-w-[60ch] mb-3">
        {SITE.name} earns commission from some brokers when a reader opens an account.
        That is disclosed on every link. It has no effect on the score or the order of
        any list — the weights are published and the inputs are checked against each
        regulator’s own register.
      </p>
      <p className="leading-[1.8] max-w-[60ch] text-ink-3">
        Nothing here is investment advice. Trading leveraged products carries a high
        risk of losing money rapidly.
      </p>
      <p className="mt-5 text-ink-3">© {new Date().getFullYear()} {SITE.name}</p>
    </footer>
  );
}
