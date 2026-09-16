import Link from 'next/link';
import { SITE } from '@/lib/site';
import { Logotype } from './Mark';

/**
 * The front page's opening.
 *
 * The site is one flat white everywhere else and this is the deliberate
 * exception: a dark panel at the top, edge to edge, with the rankings on white
 * beneath it. One surface that is not the others is what a reader reads as the
 * front door — and it costs nothing, because it is a gradient and some text
 * rather than a photograph. No image means nothing to download, nothing to lay
 * out late, and nothing to go stale.
 *
 * It also brings the h1 back onto the screen. Every section page keeps its
 * heading in the markup and off the page, which is right there — the list says
 * what the page is — but the front page had no visible statement of what this
 * site does at all, and that is the one page where a reader arrives not knowing.
 *
 * The blue here is a lighter one than the body uses. #2456E8 is taken from the
 * mark and chosen to clear 4.5:1 on white, which makes it unreadable on navy;
 * this is the same hue lifted until it clears on the dark. Two values for one
 * brand colour is the honest answer whenever a brand has both surfaces. Every
 * pair was measured, not judged by eye — the lowest is 6.99:1.
 */
export function Hero({ stats, licences }: {
  stats: Array<{ value: string; label: string }>;
  licences: { checked: number; total: number };
}) {
  return (
    <section className="hero">
      <div className="shell relative py-12 sm:py-16 lg:py-20">
        <Logotype tone="dark" size={30} />

        <p className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.13em] text-[color:var(--hero-accent)] mt-9">
          <span aria-hidden className="inline-block w-[18px] h-px bg-[color:var(--hero-accent)]" />
          Independent rankings
        </p>

        <h1 className="font-[family-name:var(--font-display)] text-[34px] sm:text-[46px] lg:text-[60px] font-bold leading-[1.04] tracking-[-0.035em] text-white mt-4 max-w-[17ch] text-balance">
          Rankings you can{' '}
          <span className="text-[color:var(--hero-accent)]">check</span>.
        </h1>

        <p className="text-[14px] sm:text-[15.5px] lg:text-[17px] leading-[1.6] text-[color:var(--hero-ink-2)] mt-5 max-w-[54ch]">
          Forex brokers, prop firms and crypto exchanges, scored on published weights
          with {licences.checked} of {licences.total} licences read straight from the
          regulator&rsquo;s own register. We take commission. It moves nobody up a list.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-8">
          <Link
            href="/brokers"
            className="hero-cta inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[13px] bg-white text-ink text-[14.5px] font-bold tracking-[-0.01em] w-full sm:w-auto"
          >
            See the broker ranking
            <span aria-hidden>→</span>
          </Link>
          {/* A link that looks like one, not an input that is not one. The
              search index is 178 entries and shipping it to every reader of the
              front page to save one navigation is the wrong trade. */}
          <Link
            href="/search"
            className="hero-ghost inline-flex items-center justify-center sm:justify-start gap-[10px] h-12 pl-4 pr-5 rounded-[13px] text-[14px] text-[color:var(--hero-ink-2)] w-full sm:w-auto"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.5-3.5" />
            </svg>
            Search everything we publish
          </Link>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 mt-11 lg:mt-14 pt-8 border-t border-[color:var(--hero-line)]">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="m-0">
                <span className="block font-[family-name:var(--font-display)] text-[26px] lg:text-[32px] font-bold tracking-[-0.035em] tnum text-white">
                  {s.value}
                </span>
                <span className="block text-[11.5px] lg:text-[12px] text-[color:var(--hero-ink-3)] mt-[3px]">
                  {s.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        {/* A list, not a <nav>. The header already publishes these six links as
            a landmark called Sections, and a second landmark with the same name
            is a navigation a screen reader user has to tell apart from the
            first one for no gain. The desktop accessibility audit failed on
            exactly that, which is the second time it has caught something the
            phone-width run could not see: below 1024px the header's nav is
            display:none and the two never coexist. */}
        <ul className="flex flex-wrap gap-2 mt-8">
          {SITE.nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="hero-chip inline-block text-[12.5px] px-[13px] py-[7px] rounded-full">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
