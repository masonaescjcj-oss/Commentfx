import type { Coverage } from '@commentfx/db';
import { Card, CardHead, Tag, Meter } from './primitives';

const LABELS: Record<string, string> = {
  'cost.eurusdSpread': 'EUR/USD spread',
  'cost.commissionPerLot': 'Commission per lot',
  'payments.minDepositUsd': 'Minimum deposit',
  'payments.statedWithdrawalHours': 'Stated withdrawal time',
  'platforms.maxLeverage': 'Maximum leverage',
  'entities.licences': 'Licence numbers and status',
  'rules.drawdownType': 'Drawdown type',
  'rules.maxDrawdownPct': 'Maximum drawdown',
  'rules.consistencyRule': 'Consistency rule',
  'payout.splitPct': 'Profit split',
  feeUsdPer100k: 'Challenge fee',
  takerFeePct: 'Taker fee',
  'reserves.proofOfReserves': 'Proof of reserves',
  'security.lastBreachYear': 'Breach history',
};

/**
 * What a reader is owed: which facts on this page a person actually checked,
 * against what source, and how long ago. An unverified field is named as
 * unverified rather than quietly presented as fact.
 */
export function VerificationPanel({ coverage }: { coverage: Coverage | null }) {
  if (!coverage) {
    return (
      <Card className="p-4 lg:p-6 bg-warn-bg shadow-none border border-[#F3E3C2]" as="section">
        <h2 className="text-[14px] font-bold text-warn mb-[6px]">Nothing on this page is editor-verified yet</h2>
        <p className="text-[12.5px] text-[#8A6420] leading-[1.8]">
          These figures come from the company&rsquo;s own published pages and have not
          been checked against a primary source by an editor. Verify anything you plan
          to act on.
        </p>
      </Card>
    );
  }

  const { verified, stale, unverified, fields, ratio } = coverage;
  const tone = ratio === 1 ? 'up' : ratio >= 0.5 ? 'accent' : 'warn';

  return (
    <Card className="p-4 lg:p-6" as="section">
      <CardHead
        title="What has been checked"
        aside={<span className="text-[11.5px] text-ink-3 tnum">{verified} of {fields.length}</span>}
      />
      <div className="mb-3"><Meter value={ratio * 100} max={100} tone={tone} /></div>

      <ul>
        {fields.map((f) => (
          <li key={f.field} className="flex items-center gap-2 py-[9px] border-b border-line-2 last:border-b-0">
            <span className="text-[12.5px] flex-1 min-w-0">{LABELS[f.field] ?? f.field}</span>
            {f.state === 'unverified' ? (
              <Tag tone="warn">Not checked</Tag>
            ) : (
              <>
                {f.sourceUrl && (
                  <a
                    href={f.sourceUrl}
                    rel="nofollow noopener external"
                    target="_blank"
                    className="text-[11px] text-accent"
                  >
                    source
                  </a>
                )}
                <Tag tone={f.state === 'verified' ? 'good' : 'warn'}>
                  {f.state === 'verified' ? `${f.ageDays}d ago` : `stale · ${f.ageDays}d`}
                </Tag>
              </>
            )}
          </li>
        ))}
      </ul>

      {(unverified > 0 || stale > 0) && (
        <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.75]">
          {unverified > 0 && `${unverified} field${unverified > 1 ? 's have' : ' has'} not been checked. `}
          {stale > 0 && `${stale} verification${stale > 1 ? 's are' : ' is'} older than 90 days and counts as expired.`}
        </p>
      )}
    </Card>
  );
}
