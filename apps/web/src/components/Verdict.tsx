import type { Verdict as V } from '@commentfx/core';
import { Card, CardHead } from './primitives';

/**
 * What is good and what is not, above everything that explains it.
 *
 * A reader arriving from a search result has one question and about four
 * seconds of patience for it. Everything else on this page — the entity map,
 * the licence readings, the thousand words of research — answers that question
 * properly, and none of it answers it fast. This does, and then the rest is
 * there for anyone who wants to know why.
 *
 * The lines are generated from the record, so this cannot drift from the tables
 * below it, and nobody can add a flattering bullet to a broker that did not
 * earn one. `verdict.ts` is where they come from.
 *
 * Two columns on a desktop and one on a phone, good first, with the tick and
 * the cross carrying colour that is not the only signal — each list has its own
 * heading, because a green dot is not a label.
 */
function Mark({ good }: { good: boolean }) {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden focusable="false"
      className={`shrink-0 mt-[4px] ${good ? 'text-up' : 'text-down'}`}
    >
      {good ? <path d="m5 12.5 4.5 4.5L19 7" /> : <path d="M6 6l12 12M18 6 6 18" />}
    </svg>
  );
}

function Column({ title, items, good }: { title: string; items: string[]; good: boolean }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3 mb-[10px]">{title}</h3>
      <ul className="flex flex-col gap-[9px]">
        {items.map((t) => (
          <li key={t} className="flex gap-[9px] text-[13px] leading-[1.6] text-ink-2">
            <Mark good={good} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function VerdictCard({ verdict, name, summary }: {
  verdict: V;
  name: string;
  /** The researched verdict, when a person has written one. */
  summary?: string;
}) {
  return (
    <Card className="p-4 lg:p-6" as="section" id="verdict">
      <CardHead title={`${name} in short`} />

      {summary ? (
        <p className="text-[14.5px] leading-[1.8] text-ink-2 max-w-[68ch] border-l-[3px] border-accent pl-4 mb-5">
          {summary}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <Column title="What is good" items={verdict.pros} good />
        <Column title="What it costs you" items={verdict.cons} good={false} />
      </div>

      <p className="text-[11.5px] text-ink-3 leading-[1.75] mt-5 pt-4 border-t border-line-2 max-w-[66ch]">
        Both lists are generated from the record on this page and from how it compares with the other
        nine brokers here. Nothing on either side was written to be flattering, and a correction to the
        data rewrites them the same day.
      </p>
    </Card>
  );
}
