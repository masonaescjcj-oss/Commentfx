import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Component } from '@commentfx/core';
import { Card, CardHead, Meter, Logo, RankBadge, Score, Tag } from './primitives';

/** Page intro shared by every ranking list, so the h1/lead/count never drift. */
/**
 * The heading, and nothing under it.
 *
 * It carried a lead paragraph and a count line, and both went on request: the
 * page is the ranking, and a sentence restating what the list plainly is costs
 * a reader the top of their screen to tell them what they can already see. The
 * lead survives where it earns its keep — as the meta description, which is
 * what a search result shows.
 *
 * The h1 stays. It is one line, it is what a screen reader and a search engine
 * use to say what the page is, and check:seo fails a page without exactly one.
 */
export function RankingIntro({ title }: { title: string }) {
  return (
    <header className="px-1">
      <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.22] tracking-[-0.02em] text-balance">
        {title}
      </h1>
    </header>
  );
}

/** One row of any ranking: rank, logo, name, score, a why line, then facts. */
/**
 * The heading level for each row's company name.
 *
 * It depends on where the row is: on a ranking page the list IS the page, so
 * each company sits directly under the h1; inside a "Compare" or "Other firms"
 * card it sits under that card's own h2. The component cannot know which, so
 * the caller says, and the default is the nested case.
 */
export function RankRow({ rank, href, logo, name, score, why, facts, headingLevel = 3 }: {
  headingLevel?: 2 | 3;
  rank: number;
  href: string;
  logo: { initials: string; bg: string; fg: string };
  name: string;
  score: number;
  why: string;
  facts: Array<{ label: string; value: string; tone?: 'neutral' | 'good' | 'bad' | 'warn' | 'brass' }>;
}) {
  const H = `h${headingLevel}` as 'h2' | 'h3';
  return (
    <article className="flex items-start gap-[10px] py-[14px] border-b border-line-2 last:border-b-0">
      <RankBadge rank={rank} />
      <Logo {...logo} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <H className="text-[15.5px] font-bold tracking-[-0.01em]">
            <Link href={href} className="hover:text-brass">{name}</Link>
          </H>
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

