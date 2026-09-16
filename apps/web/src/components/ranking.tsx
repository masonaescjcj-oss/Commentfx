import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Component, LogoMark } from '@commentfx/core';
import { Card, CardHead, Meter, Logo, RankBadge, Score, Tag } from './primitives';

/**
 * The page's name, in the markup and not on the screen.
 *
 * This started as a heading with a lead paragraph and a count under it. The
 * paragraph went, then the count, and now the heading itself: on a ranking page
 * the list is the page, and a line of type restating what the list plainly is
 * costs a reader the top of their screen to tell them what they can already
 * see. Each card names itself, and the breadcrumb above says where you are.
 *
 * It is hidden, not deleted, and the difference matters. A screen reader still
 * announces it, the document still has an outline, and check:seo still finds
 * exactly one h1 — which it would fail without. sr-only is the standard way to
 * do that: the same markup goes to everyone, it is simply not painted. Deleting
 * the element would cost the page its name in both the accessibility tree and
 * the search result, which is a real loss for a line nobody reads anyway.
 */
export function RankingIntro({ title }: { title: string }) {
  return <h1 className="sr-only">{title}</h1>;
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
  logo: LogoMark;
  name: string;
  score: number;
  why: string;
  facts: Array<{ label: string; value: string; tone?: 'neutral' | 'good' | 'bad' | 'warn' | 'accent' }>;
}) {
  const H = `h${headingLevel}` as 'h2' | 'h3';
  return (
    <article className="flex items-start gap-[10px] lg:gap-3 py-[14px] lg:py-[18px] border-b border-line-2 last:border-b-0">
      <RankBadge rank={rank} />
      <Logo {...logo} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <H className="font-[family-name:var(--font-display)] text-[15.5px] lg:text-[17px] font-bold tracking-[-0.018em]">
            <Link href={href} className="hover:text-accent">{name}</Link>
          </H>
          <div className="flex-1" />
          <Score value={score} size="lg" />
        </div>
        <p className="text-[11.5px] lg:text-[12.5px] text-ink-3 leading-[1.5] my-[6px] lg:my-[8px]">{why}</p>
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
    <Card className="p-4 lg:p-6" as="section">
      <CardHead title="Score breakdown" href="/methodology" hrefLabel="Method" />
      <ul className="flex flex-col gap-[13px] lg:gap-4">
        {components.map((c) => (
          <li key={c.key}>
            <div className="flex items-baseline gap-2 mb-[7px]">
              <span className="text-[12.5px] lg:text-[13.5px]">{c.label}</span>
              <span className="text-[11px] text-ink-3 tnum">{Math.round(c.weight * 100)}%</span>
              <div className="flex-1" />
              {c.value === null ? (
                <span className="text-[13px] font-bold tnum text-ink-3">—</span>
              ) : (
                <Score value={c.value} />
              )}
            </div>
            {c.value !== null && (
              <Meter value={c.value} tone={c.value >= 8 ? 'up' : c.value >= 6 ? 'accent' : 'warn'} />
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

