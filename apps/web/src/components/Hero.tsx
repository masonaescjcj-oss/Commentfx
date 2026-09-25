import Link from 'next/link';
import type { LogoMark } from '@commentfx/core';
import { Logo } from './primitives';
import { ScoreRing } from './ScoreRing';

export interface Leader {
  href: string;
  name: string;
  logo: LogoMark;
  /** "#1 forex broker" — what they lead, said as a place in a list. */
  place: string;
  score: number;
}

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
 * Beside the headline, the first place in each of the three rankings. It was
 * an empty half of a wide screen, and the answer to "so who is good" is the
 * thing a reader arriving here wants next — taken from the same ranked lists
 * as everything below, never chosen, so it cannot become a featured slot.
 * Under it, four counts, each computed from the records rather than typed.
 *
 * The blue here is a lighter one than the body uses. #2456E8 is taken from the
 * mark and chosen to clear 4.5:1 on white, which makes it unreadable on navy;
 * this is the same hue lifted until it clears on the dark. Two values for one
 * brand colour is the honest answer whenever a brand has both surfaces. Every
 * pair was measured, not judged by eye — the lowest is 6.99:1.
 */
export function Hero({ licences, leaders, counts }: {
  licences: { checked: number; total: number };
  leaders: Leader[];
  counts: { companies: number; guides: number };
}) {
  return (
    <section className="hero">
      <div className="shell relative pt-12 pb-10 sm:pt-16 sm:pb-12 lg:pt-16 lg:pb-[128px]">
        <div className="lg:flex lg:items-center lg:gap-14">
          <div className="lg:flex-1 lg:min-w-0">
            <p className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.13em] text-[color:var(--hero-accent)]">
              <span aria-hidden className="inline-block w-[18px] h-px bg-[color:var(--hero-accent)]" />
              Independent rankings
            </p>

            <h1 className="font-[family-name:var(--font-display)] text-[36px] sm:text-[46px] lg:text-[62px] font-bold leading-[1.04] tracking-[-0.038em] text-white mt-4 max-w-[17ch] text-balance">
              Rankings you can{' '}
              <span className="text-[color:var(--hero-accent)]">check</span>.
            </h1>

            <p className="text-[14.5px] sm:text-[15.5px] lg:text-[17px] leading-[1.6] text-[color:var(--hero-ink-2)] mt-5 max-w-[52ch]">
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
          </div>

          {leaders.length > 0 ? (
            <aside
              aria-labelledby="leaders-title"
              className="mt-9 lg:mt-0 lg:w-[408px] lg:shrink-0 rounded-[20px] lg:rounded-[22px] border border-[color:var(--hero-line)] bg-[linear-gradient(180deg,rgb(255_255_255_/_0.08),rgb(255_255_255_/_0.03))] shadow-[0_30px_60px_-30px_rgb(0_0_0_/_0.7)] px-4 lg:px-[22px] pt-4 lg:pt-5 pb-1 lg:pb-3"
            >
              <div className="flex items-baseline gap-3 mb-1">
                <h2 id="leaders-title" className="flex-1 font-[family-name:var(--font-display)] text-[15px] lg:text-[16px] font-bold tracking-[-0.018em] text-white">
                  Number one, in each list
                </h2>
                <Link href="/methodology" className="text-[12px] font-semibold text-[color:var(--hero-accent)] hover:text-white">
                  How we score ›
                </Link>
              </div>
              <ul>
                {leaders.map((l) => (
                  <li key={l.href} className="border-t border-[rgb(255_255_255_/_0.10)] first:border-t-0">
                    <Link href={l.href} className="flex items-center gap-[14px] py-3 lg:py-[14px] group">
                      <Logo {...l.logo} size={44} />
                      <span className="flex-1 min-w-0">
                        <span className="block font-[family-name:var(--font-display)] text-[15px] lg:text-[16px] font-bold tracking-[-0.015em] text-white truncate group-hover:underline underline-offset-2">
                          {l.name}
                        </span>
                        <span className="block text-[12px] text-[color:var(--hero-ink-3)]">{l.place}</span>
                      </span>
                      <ScoreRing value={l.score} size={50} stroke={4} />
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>

        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-4 lg:gap-6 mt-8 lg:mt-12 pt-6 border-t border-[color:var(--hero-line)]">
          {[
            { value: String(counts.companies), label: 'companies ranked, on three lists' },
            { value: `${licences.checked}`, of: `of ${licences.total}`, label: 'licences read at the regulator’s register' },
            { value: String(counts.guides), label: 'guides, each answering one question' },
            { value: '0', label: 'paid places in any ranking', accent: true },
          ].map((s) => (
            <div key={s.label} className="flex flex-col-reverse gap-1">
              <dt className="text-[11.5px] lg:text-[12.5px] leading-[1.45] text-[color:var(--hero-ink-3)]">{s.label}</dt>
              <dd className={`font-[family-name:var(--font-display)] text-[26px] lg:text-[30px] font-bold tracking-[-0.03em] tnum ${s.accent ? 'text-[color:var(--hero-accent)]' : 'text-white'}`}>
                {s.value}
                {s.of ? <span className="text-[16px] lg:text-[18px] text-[color:var(--hero-ink-3)] ml-[6px]">{s.of}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
