import Link from 'next/link';
import { REGULATORS, effectiveCostPips } from '@commentfx/core';
import type { RankedBroker } from '@/lib/repo';
import { Flag } from './Flag';
import { Logo, RankBadge, Score, Tag } from './primitives';

export function BrokerRow({ r, showWhy = true, extra }: {
  r: RankedBroker; showWhy?: boolean; extra?: { label: string; value: string };
}) {
  const b = r.broker;
  const licences = b.entities.slice(0, 3);
  return (
    <article className="flex items-start gap-[10px] py-[14px] border-b border-line-2 last:border-b-0">
      <RankBadge rank={r.rank} />
      <Logo {...b.logo} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[15.5px] font-bold tracking-[-0.01em]">
            <Link href={`/brokers/${b.slug}`} className="hover:text-brass">{b.name}</Link>
          </h3>
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
            <Tag tone="brass">{extra.label} <b className="tnum">{extra.value}</b></Tag>
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
