import Link from 'next/link';
import { REGULATORS, effectiveCostPips } from '@commentfx/core';
import type { RankedBroker } from '@/lib/repo';
import { Flag } from './Flag';
import { Logo, RankBadge, Score, Tag } from './primitives';

/**
 * The heading level for each row's company name.
 *
 * It depends on where the row is: on a ranking page the list IS the page, so
 * each company sits directly under the h1; inside a "Compare" or "Other firms"
 * card it sits under that card's own h2. The component cannot know which, so
 * the caller says, and the default is the nested case.
 */
export function BrokerRow({ r, showWhy = true, extra, headingLevel = 3 }: {
  r: RankedBroker; showWhy?: boolean; extra?: { label: string; value: string };
  headingLevel?: 2 | 3;
}) {
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const b = r.broker;
  const licences = b.entities.slice(0, 3);
  return (
    <article className="flex items-start gap-[10px] py-[14px] border-b border-line-2 last:border-b-0">
      <RankBadge rank={r.rank} />
      <Logo {...b.logo} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <H className="text-[15.5px] font-bold tracking-[-0.01em]">
            <Link href={`/brokers/${b.slug}`} className="hover:text-accent">{b.name}</Link>
          </H>
          <div className="flex-1" />
          <Score value={r.score.total} size="lg" />
        </div>

        <ul className="flex items-center gap-[9px] my-[6px] flex-wrap">
          {licences.map((e) => (
            <li key={e.licence.regulator} className="inline-flex items-center gap-1">
              <Flag code={e.country} title={REGULATORS[e.licence.regulator]?.name} />
              <span className="text-[11.5px] text-ink-3 tnum">{e.licence.regulator}</span>
            </li>
          ))}
        </ul>

        {showWhy && <p className="text-[11.5px] text-ink-3 leading-[1.45] mb-2">{b.why}</p>}

        <div className="flex gap-[5px] flex-wrap">
          {extra ? (
            <Tag tone="accent">{extra.label} <b className="tnum">{extra.value}</b></Tag>
          ) : (
            <Tag>Cost <b className="text-ink tnum">{effectiveCostPips(b).toFixed(2)}</b></Tag>
          )}
          <Tag>Min <b className="text-ink tnum">${b.payments.minDepositUsd}</b></Tag>
          <Tag>Leverage <b className="text-ink tnum">1:{b.platforms.maxLeverage}</b></Tag>
        </div>
      </div>
    </article>
  );
}
