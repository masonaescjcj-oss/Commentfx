import Link from 'next/link';
import type { ReactNode } from 'react';
import type { LogoMark } from '@commentfx/core';
import { Card, CardHead, Logo, Score } from './primitives';

export interface TileItem {
  slug: string;
  name: string;
  logo: LogoMark;
  score: number;
}

/**
 * The top eight, two across.
 *
 * It was a four-across grid of bordered tiles with the name under the mark and
 * a "#3" under that, and at 390px it gave each name 82px to fit in — so half of
 * them wrapped to two lines or got cut, and every one of them sat inside its own
 * box inside the card's box. Two columns gives the name the width it needs on
 * one line, and the row itself is the only thing there: a mark, a name, a score.
 * The order is the ranking's order, so the position does not need printing.
 *
 * It is the same order as the list below it, never a separate "featured" set,
 * because a second order is where a paid placement hides.
 */
export function TopTiles({ items, base }: { items: TileItem[]; base: string }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 lg:gap-x-4 gap-y-[2px]">
      {items.map((it) => (
        <li key={it.slug}>
          <Link
            href={`${base}/${it.slug}`}
            className="row-hit flex items-center gap-[10px] lg:gap-3 py-[9px] lg:py-3 px-2 -mx-2 group"
          >
            <Logo {...it.logo} size={42} />
            <span className="min-w-0">
              <span className="block font-[family-name:var(--font-display)] text-[14px] lg:text-[15px] font-bold leading-[1.25] tracking-[-0.015em] truncate group-hover:text-accent">
                {it.name}
              </span>
              <span className="flex items-center gap-[5px] mt-[3px]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-accent shrink-0" aria-hidden>
                  <path d="m12 2.5 2.9 5.9 6.6.9-4.8 4.6 1.2 6.5L12 17.3 6.1 20.4l1.2-6.5L2.5 9.3l6.6-.9z" />
                </svg>
                <Score value={it.score} />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export interface StrengthRow {
  slug: string;
  name: string;
  logo: LogoMark;
  value: number;
  note: string;
}

/**
 * One criterion's order: mark, name, what the number is made of, the number.
 *
 * Equal scores share a position, and the positions skip afterwards — 1, 1, 1,
 * 4. Numbering them 1 through 6 was the first version and it was a small lie:
 * six brokers hold a tier-A licence and all six score ten for regulation, so a
 * list that calls one of them first is reporting the alphabet as if it were a
 * finding. A tie is a real result and the page should be able to say it.
 */
export function StrengthList({ rows, base }: { rows: StrengthRow[]; base: string }) {
  const positions = rows.map((r, i) => rows.findIndex((x) => x.value === r.value) + 1 || i + 1);

  return (
    <ol className="flex flex-col">
      {rows.map((r, i) => (
        <li key={r.slug} className="border-b border-line-2 last:border-b-0">
          <Link href={`${base}/${r.slug}`} className="row-hit flex items-center gap-[10px] lg:gap-3 py-[10px] lg:py-[13px] px-2 -mx-2 group">
            <span
              className="w-4 shrink-0 text-[11px] text-ink-3 tnum text-center"
              aria-label={positions[i] === positions[i - 1] ? `Equal ${positions[i]}` : undefined}
            >
              {positions[i] === positions[i - 1] ? '=' : positions[i]}
            </span>
            <Logo {...r.logo} size={28} />
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] lg:text-[14px] font-semibold group-hover:text-accent truncate">{r.name}</span>
              <span className="block text-[11px] lg:text-[11.5px] text-ink-3 leading-[1.5] truncate">{r.note}</span>
            </span>
            <Score value={r.value} />
          </Link>
        </li>
      ))}
    </ol>
  );
}

/**
 * Tabs without a client component — see the .tabset block in globals.css for
 * why. `id` has to be unique on the page because it names the radio group.
 */
export function Tabset({ id, label, tabs }: {
  id: string;
  label: string;
  tabs: Array<{ label: string; panel: ReactNode }>;
}) {
  return (
    <fieldset className="tabset border-0 p-0 m-0 min-w-0">
      <legend className="sr-only">{label}</legend>
      {tabs.map((t, i) => (
        <input
          key={t.label}
          type="radio"
          name={id}
          id={`${id}-${i}`}
          defaultChecked={i === 0}
          aria-label={t.label}
        />
      ))}
      <div className="tablist">
        {tabs.map((t, i) => <label key={t.label} htmlFor={`${id}-${i}`}>{t.label}</label>)}
      </div>
      <div className="panels">
        {tabs.map((t) => <div className="panel" key={t.label}>{t.panel}</div>)}
      </div>
    </fieldset>
  );
}

/**
 * A comparison table.
 *
 * Three columns, not four. A fourth fitted on paper and put its own heading off
 * the right edge of a 390px screen — the container scrolled rather than the
 * page, which is the rule, but a column a reader has to discover by swiping is
 * a column most readers never see. The thing that moved is now a sub-line under
 * the name, where it qualifies the row instead of competing with it.
 */
export function CompareTable({ head, rows, note }: {
  head: string[];
  rows: Array<{ slug: string; cells: ReactNode[] }>;
  note: string;
}) {
  return (
    <>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[300px] border-collapse text-[12.5px]">
          <thead>
            <tr className="text-left">
              {head.map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={`py-[7px] text-[11px] font-bold uppercase tracking-[0.06em] text-ink-3 ${i === 0 ? '' : 'text-right'}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-t border-line-2">
                {r.cells.map((c, i) => (
                  <td key={i} className={`py-[9px] ${i === 0 ? 'font-semibold' : 'text-right tnum text-ink-2'}`}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-ink-3 leading-[1.6] mt-3">{note}</p>
    </>
  );
}

/**
 * The sections a reader arriving from a competitor will look for and not find.
 *
 * Every one of these is a number we could generate and cannot stand behind:
 * an execution-speed score needs a funded account at each broker measured on
 * the same wire, a popularity vote needs votes we do not have and could not
 * keep clean, and a scam list is an accusation. Naming them is the honest
 * version of a gap — a reader can then decide whether the missing thing is one
 * they needed.
 */
export function NotPublished({ items }: { items: Array<{ what: string; why: string }> }) {
  return (
    <Card className="p-4 lg:p-6" as="section">
      <CardHead title="What this page does not rank" />
      <dl className="flex flex-col">
        {items.map(({ what, why }) => (
          <div key={what} className="py-[9px] border-b border-line-2 last:border-b-0">
            <dt className="text-[13px] font-semibold mb-[3px]">{what}</dt>
            <dd className="text-[12px] text-ink-2 leading-[1.7]">{why}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
