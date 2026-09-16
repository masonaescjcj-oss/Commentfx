'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { GROUP_ORDER, type SearchEntry } from '@/lib/searchIndex';
import { Score } from './primitives';

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ');

/**
 * Search over an index that is already in the page. No request, no API, no
 * third party watching what people look up — and with JavaScript off the same
 * markup is a plain directory of everything the site publishes.
 */
export function SiteSearch({ entries }: { entries: SearchEntry[] }) {
  const [q, setQ] = useState('');

  const haystack = useMemo(
    () => entries.map((e) => ({ e, text: normalise(`${e.title} ${e.note} ${e.terms} ${e.path}`) })),
    [entries],
  );

  const terms = normalise(q).split(' ').filter(Boolean);
  const hits = terms.length === 0
    ? entries
    : haystack.filter(({ text }) => terms.every((t) => text.includes(t))).map(({ e }) => e);

  const groups = GROUP_ORDER
    .map((group) => ({ group, rows: hits.filter((e) => e.group === group) }))
    .filter((g) => g.rows.length > 0);

  return (
    <>
      <div className="gutter">
        <label htmlFor="q" className="sr-only">Search the site</label>
        <input
          id="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Broker, prop firm, exchange, regulator…"
          autoComplete="off"
          className="w-full bg-card border border-line rounded-[13px] px-[14px] py-[11px] text-[14px] placeholder:text-ink-3 focus:outline-none focus:border-brass"
        />
        <p className="text-[11.5px] text-ink-3 mt-2" aria-live="polite">
          {terms.length === 0
            ? `${entries.length} pages. Type to narrow, or browse below.`
            : `${hits.length} of ${entries.length} pages match.`}
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-[13px] text-ink-3 gutter py-4 leading-[1.8]">
          Nothing matches “{q}”. We only rank companies we hold licence and cost data
          for — if one is missing, it is missing on purpose rather than by accident.
        </p>
      ) : (
        groups.map(({ group, rows }) => (
          <section key={group} className="gutter">
            <h2 className="text-[12.5px] font-bold text-ink-2 pb-[7px]">
              {group} <span className="text-ink-3 font-normal tnum">({rows.length})</span>
            </h2>
            <ul className="bg-card border border-line rounded-[13px] overflow-hidden">
              {rows.map((e) => (
                <li key={e.path} className="border-b border-line-2 last:border-b-0">
                  <Link href={e.path} className="flex items-center gap-3 p-[11px_12px] group">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold group-hover:text-brass truncate">
                        {e.title}
                      </span>
                      <span className="block text-[11.5px] text-ink-3 mt-[2px] leading-[1.6]">{e.note}</span>
                    </span>
                    {e.score !== null && <Score value={e.score} />}
                    <span aria-hidden className="text-ink-3 shrink-0">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
