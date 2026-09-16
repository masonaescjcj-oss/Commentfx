import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { and, desc, eq } from 'drizzle-orm';
import { getDb, schema, coverageFor, type Kind } from '@commentfx/db';
import { getBroker, getProp, getExchange } from '@/lib/repo';
import { whereToCheck } from '@/lib/whereToCheck';
import { Card, CardHead, Tag, Meter } from '@/components/primitives';
import { VerifyForm } from '../../VerifyForm';

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const KINDS = new Set<Kind>(['broker', 'prop', 'exchange']);

const LABEL: Record<string, string> = {
  'cost.eurusdSpread': 'EUR/USD spread (pips)',
  'cost.commissionPerLot': 'Commission per lot (USD, round turn)',
  'payments.minDepositUsd': 'Minimum deposit (USD)',
  'payments.statedWithdrawalHours': 'Stated withdrawal time (hours)',
  'platforms.maxLeverage': 'Maximum leverage',
  'entities.licences': 'Licence numbers and status',
  'rules.drawdownType': 'Drawdown type',
  'rules.maxDrawdownPct': 'Maximum drawdown (%)',
  'rules.consistencyRule': 'Consistency rule',
  'payout.splitPct': 'Profit split (%)',
  feeUsdPer100k: 'Challenge fee per $100k',
  takerFeePct: 'Taker fee (%)',
  'reserves.proofOfReserves': 'Proof of reserves',
  'security.lastBreachYear': 'Last breach year',
};

/** The value the site currently publishes, so a checker can see drift at a glance. */
function currentValue(kind: Kind, slug: string, field: string): string {
  const b = kind === 'broker' ? getBroker(slug) : null;
  const p = kind === 'prop' ? getProp(slug) : null;
  const e = kind === 'exchange' ? getExchange(slug) : null;
  const map: Record<string, () => unknown> = {
    'cost.eurusdSpread': () => b?.cost.eurusdSpread,
    'cost.commissionPerLot': () => b?.cost.commissionPerLot,
    'payments.minDepositUsd': () => b?.payments.minDepositUsd,
    'payments.statedWithdrawalHours': () => b?.payments.statedWithdrawalHours,
    'platforms.maxLeverage': () => b?.platforms.maxLeverage,
    'entities.licences': () => b?.entities.map((x) => `${x.licence.regulator} ${x.licence.number}`).join(', '),
    'rules.drawdownType': () => p?.rules.drawdownType,
    'rules.maxDrawdownPct': () => p?.rules.maxDrawdownPct,
    'rules.consistencyRule': () => p?.rules.consistencyRule,
    'payout.splitPct': () => p?.payout.splitPct,
    feeUsdPer100k: () => p?.feeUsdPer100k,
    takerFeePct: () => e?.takerFeePct,
    'reserves.proofOfReserves': () => e?.reserves.proofOfReserves,
    'security.lastBreachYear': () => e?.security.lastBreachYear,
  };
  const v = map[field]?.();
  return v === undefined || v === null ? '' : String(v);
}

export default async function AdminRecordPage({ params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind: rawKind, slug } = await params;
  if (!KINDS.has(rawKind as Kind)) notFound();
  const kind = rawKind as Kind;

  const { db } = await getDb();
  const cov = await coverageFor(db, kind, slug);
  const history = await db
    .select()
    .from(schema.auditLog)
    .where(and(eq(schema.auditLog.kind, kind), eq(schema.auditLog.slug, slug)))
    .orderBy(desc(schema.auditLog.at))
    .limit(20);

  return (
    <main className="px-4 py-5 flex flex-col gap-[13px] max-w-[560px] mx-auto">
      <Link href="/admin" className="text-[12px] text-accent">‹ Queue</Link>

      <header className="gutter">
        <h1 className="font-[family-name:var(--font-display)] text-[23px] font-bold tracking-[-0.02em]">{slug}</h1>
        <p className="text-[12.5px] text-ink-2 mt-1">
          {kind} · {cov.verified} of {cov.fields.length} fields verified
        </p>
        <div className="mt-2"><Meter value={cov.ratio * 100} max={100} tone={cov.ratio >= 0.5 ? 'accent' : 'warn'} /></div>
      </header>

      {cov.fields.map((f) => {
        const sources = whereToCheck(kind, slug, f.field);
        return (
        <Card key={f.field} className="p-4" as="section">
          <div className="flex items-center gap-2">
            <h2 className="text-[13.5px] font-bold flex-1">{LABEL[f.field] ?? f.field}</h2>
            {f.state === 'verified' && <Tag tone="good">verified {f.ageDays}d ago</Tag>}
            {f.state === 'stale' && <Tag tone="warn">expired · {f.ageDays}d</Tag>}
            {f.state === 'unverified' && <Tag tone="warn">not checked</Tag>}
          </div>

          <p className="text-[11.5px] text-ink-3 mt-2">
            Site currently publishes: <b className="text-ink tnum">{currentValue(kind, slug, f.field) || '—'}</b>
          </p>
          {f.sourceUrl && (
            <p className="text-[11.5px] text-ink-3 mt-1 truncate">
              Last source:{' '}
              <a href={f.sourceUrl} target="_blank" rel="nofollow noopener" className="text-accent">{f.sourceUrl}</a>
              {f.verifiedBy ? ` · ${f.verifiedBy}` : ''}
            </p>
          )}

          {sources.length > 0 && (
            <p className="text-[11.5px] text-ink-3 mt-2">
              Check it at:{' '}
              {sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && ' · '}
                  <a href={s.url} target="_blank" rel="nofollow noopener" className="text-accent">{s.label}</a>
                </span>
              ))}
            </p>
          )}

          <VerifyForm
            kind={kind}
            slug={slug}
            field={f.field}
            current={currentValue(kind, slug, f.field)}
            lastValue={null}
            suggestedSource={sources[0]?.url ?? ''}
          />
        </Card>
        );
      })}

      <Card className="p-4 lg:p-6" as="section">
        <CardHead title="History" aside={<span className="text-[11px] text-ink-3">append-only</span>} />
        {history.length === 0 ? (
          <p className="text-[12.5px] text-ink-3">No checks recorded for this record yet.</p>
        ) : (
          <ul>
            {history.map((a) => (
              <li key={a.id} className="py-[8px] border-b border-line-2 last:border-b-0 text-[11.5px]">
                <span className="text-ink-3 tnum">{a.at.toISOString().slice(0, 16).replace('T', ' ')}</span>{' '}
                <b>{a.actor}</b> {a.action} <span className="text-ink-3">{a.field}</span>
                {a.before && a.before !== a.after && (
                  <span className="text-warn"> · {a.before} → {a.after}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
