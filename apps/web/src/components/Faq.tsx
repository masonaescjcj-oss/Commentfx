/**
 * The questions, as a stack of disclosures.
 *
 * They were a definition list with every answer open, which on a phone is four
 * paragraphs of text a reader has to scroll past to reach anything else — and
 * the whole value of a FAQ is that you read the one question you came with.
 *
 * <details> and <summary>, so it opens and closes with no JavaScript at all:
 * keyboard-operable, announced as a disclosure by a screen reader, and working
 * before hydration, which on this site means always. The same reason the
 * ranking tabs are radio buttons and the mobile menu is a <details>.
 *
 * The answer stays in the markup when it is shut, which is what makes this safe
 * to do on the section a search engine reads: `hidden` in the accessibility
 * sense, present in the document. A tab strip that mounts one panel at a time
 * would not be.
 */
export function Faq({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <div className="flex flex-col">
      {items.map(({ q, a }) => (
        <details key={q} className="faq group border-b border-line-2 last:border-b-0">
          <summary className="flex items-start gap-3 py-[13px] cursor-pointer list-none">
            <h3 className="flex-1 text-[13.5px] font-semibold leading-[1.5] group-hover:text-accent">
              {q}
            </h3>
            {/* One glyph, rotated when open, rather than two that can disagree. */}
            <svg
              width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" aria-hidden focusable="false"
              className="shrink-0 mt-[2px] text-ink-3 transition-transform duration-200 group-open:rotate-180"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p className="text-[12.5px] text-ink-2 leading-[1.85] pb-[14px] pr-7 max-w-[62ch]">{a}</p>
        </details>
      ))}
    </div>
  );
}
