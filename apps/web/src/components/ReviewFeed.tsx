'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TOPIC_LABELS, type ReviewKind } from '@commentfx/core';
import { Tag } from './primitives';

export interface FeedItem {
  id: number;
  kind: ReviewKind;
  slug: string;
  name: string;
  path: string;
  rating: number;
  topic: keyof typeof TOPIC_LABELS;
  body: string;
  verified: boolean;
  /** ISO — a client component cannot take a Date across the boundary. */
  createdAt: string;
}

const FILTERS = [
  { key: 'all', label: 'Everything' },
  { key: 'verified', label: 'Checked only' },
  { key: 'broker', label: 'Brokers' },
  { key: 'prop', label: 'Prop firms' },
  { key: 'exchange', label: 'Exchanges' },
] as const;

type Filter = (typeof FILTERS)[number]['key'];

const dayOf = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/**
 * Every review is in the HTML whatever is selected; the filter only hides. That
 * keeps the page a complete, crawlable record of what people have said rather
 * than a view that depends on JavaScript having run.
 */
export function ReviewFeed({ items }: { items: FeedItem[] }) {
  const [filter, setFilter] = useState<Filter>('all');

  const shown = items.filter((i) =>
    filter === 'all' ? true : filter === 'verified' ? i.verified : i.kind === filter);

  const count = (f: Filter) =>
    items.filter((i) => (f === 'all' ? true : f === 'verified' ? i.verified : i.kind === f)).length;

  return (
    <>
      <div className="flex flex-wrap gap-[6px] px-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`text-[12px] px-[11px] py-[6px] rounded-[9px] border ${
              filter === f.key
                ? 'bg-ink text-white border-ink font-semibold'
                : 'bg-card-2 text-ink-2 border-line'
            }`}
          >
            {f.label} <span className="tnum opacity-70">{count(f.key)}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-[13px] text-ink-3 px-1 py-4 leading-[1.8]">
          Nothing here yet under that filter.
        </p>
      ) : (
        <ul className="bg-card border border-line rounded-[13px] overflow-hidden">
          {shown.map((r) => (
            <li key={`${r.kind}-${r.id}`} className="p-[13px] border-b border-line-2 last:border-b-0">
              <div className="flex items-center gap-2 mb-[6px]">
                <span className="w-[26px] h-[26px] grid place-items-center rounded-[8px] bg-card-3 text-[12.5px] font-extrabold tnum shrink-0">
                  {r.rating}
                </span>
                <Link href={`${r.path}#reviews`} className="text-[13px] font-semibold hover:text-brass truncate">
                  {r.name}
                </Link>
                <span className="text-[11px] text-ink-3 truncate">{TOPIC_LABELS[r.topic]}</span>
                <div className="flex-1" />
                {r.verified
                  ? <Tag tone="good">checked</Tag>
                  : <Tag tone="neutral">unverified</Tag>}
              </div>
              <p className="text-[12.5px] text-ink-2 leading-[1.8] whitespace-pre-line">{r.body}</p>
              <p className="text-[11px] text-ink-3 mt-[6px]">
                <time dateTime={r.createdAt}>{dayOf(r.createdAt)}</time>
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
