import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Component } from '@commentfx/core';
import { Card, CardHead, Meter, Logo, RankBadge, Score, Tag } from './primitives';

/** Page intro shared by every ranking list, so the h1/lead/count never drift. */
export function RankingIntro({ title, lead, count, unit, sortedBy }: {
  title: string; lead: string; count: number; unit: string; sortedBy?: string;
}) {
  return (
    <header className="px-1">
      <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.22] tracking-[-0.02em] text-balance">
        {title}
      </h1>
      <p className="text-[13.5px] text-ink-2 leading-[1.75] mt-2 max-w-[48ch]">{lead}</p>
      <p className="text-[11.5px] text-ink-3 mt-3">
        <b className="text-ink tnum text-[13px]">{count}</b> {unit}
        {sortedBy ? ` · sorted by ${sortedBy}` : ' · updated daily'}
      </p>
    </header>
  );
}

/** One row of any ranking: rank, logo, name, score, a why line, then facts. */
export function RankRow({ rank, href, logo, name, score, why, facts }: {
  rank: number;
  href: string;
  logo: { initials: string; bg: string; fg: string };
  name: string;
  score: number;
  why: string;
  facts: Array<{ label: string; value: string; tone?: 'neutral' | 'good' | 'bad' | 'warn' | 'brass' }>;
}) {
  return (
    <article className="flex items-start gap-[10px] py-[14px] border-b border-line-2 last:border-b-0">
      <RankBadge rank={rank} />
      <Logo {...logo} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[15.5px] font-bold tracking-[-0.01em]">
            <Link href={href} className="hover:text-brass">{name}</Link>
          </h3>
          <div className="flex-1" />
          <Score value={score} size="lg" />
        </div>
        <p className="text-[11.5px] text-ink-3 leading-[1.45] my-[6px]">{why}</p>
        <div className="flex gap-[5px] flex-wrap">
          {facts.map((f) => (
            <Tag key={f.label} tone={f.tone}>
              {f.label} <b className="tnum">{f.value}</b>
            </Tag>
          ))}
        </div>
      </div>
    </article>
  );
}

/** The score breakdown block, identical across brokers, props and exchanges. */
export function ScoreBreakdownCard<K extends string>({ components, skipped }: {
  components: Component<K>[]; skipped: K[];
}) {
  return (
    <Card className="p-4" as="section">
      <CardHead title="Score breakdown" href="/methodology" hrefLabel="Method" />
      <ul className="flex flex-col gap-[11px]">
        {components.map((c) => (
          <li key={c.key}>
            <div className="flex items-baseline gap-2 mb-[6px]">
              <span className="text-[12.5px]">{c.label}</span>
              <span className="text-[11px] text-ink-3 tnum">{Math.round(c.weight * 100)}%</span>
              <div className="flex-1" />
              <span className={`text-[13px] font-extrabold tnum ${c.value === null ? 'text-ink-3' : ''}`}>
                {c.value === null ? '—' : c.value.toFixed(1)}
              </span>
            </div>
            {c.value !== null && (
              <Meter value={c.value} tone={c.value >= 8 ? 'up' : c.value >= 6 ? 'brass' : 'warn'} />
            )}
            <p className="text-[11px] text-ink-3 mt-[5px]">{c.note}</p>
          </li>
        ))}
      </ul>
      {skipped.length > 0 && (
        <p className="mt-3 text-[11.5px] text-ink-3 leading-[1.7]">
          {skipped.length} component{skipped.length > 1 ? 's' : ''} had no data and{' '}
          {skipped.length > 1 ? 'were' : 'was'} excluded — the remaining weights were
          renormalised rather than scoring it zero.
        </p>
      )}
    </Card>
  );
}

export function FactList({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between items-center gap-3 py-[9px] border-b border-line-2 last:border-b-0">
          <dt className="text-[12.5px] text-ink-3">{k}</dt>
          <dd className="text-[13px] font-semibold tnum text-right">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SeedNotice({ what }: { what: string }) {
  return (
    <p className="p-3 rounded-xl bg-warn-bg text-[11.5px] text-warn leading-[1.7]">
      {what} These figures come from public sources and have not been re-checked by
      an editor yet. Verify anything you plan to act on.
    </p>
  );
}
