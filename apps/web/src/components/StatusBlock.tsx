import type { StatusSummary } from '@commentfx/core';
import { INCIDENT_LABELS, THRESHOLD } from '@commentfx/core';
import { Card, CardHead, Tag, Meter } from './primitives';
import { ReportForm } from './ReportForm';

const COPY = {
  normal: { label: 'No incident reported', tone: 'good' as const },
  degraded: { label: 'Problems reported', tone: 'warn' as const },
  down: { label: 'Widespread problems reported', tone: 'bad' as const },
};

export function StatusChip({ status }: { status: StatusSummary | null }) {
  if (!status) return null;
  const c = COPY[status.level];
  return (
    <span className="inline-flex items-center gap-[6px]">
      <i
        className={`w-[7px] h-[7px] rounded-full shrink-0 ${
          status.level === 'normal' ? 'bg-up' : status.level === 'degraded' ? 'bg-warn' : 'bg-down'
        }`}
      />
      <span
        className={`text-[11.5px] font-semibold ${
          status.level === 'normal' ? 'text-up' : status.level === 'degraded' ? 'text-warn' : 'text-down'
        }`}
      >
        {c.label}
      </span>
    </span>
  );
}

/**
 * Reports are shown as evidence with their weight visible — the count, the
 * window, and the threshold — rather than as a verdict the reader has to take
 * on trust.
 */
export function StatusBlock({ brokerSlug, brokerName, status }: {
  brokerSlug: string; brokerName: string; status: StatusSummary | null;
}) {
  // A missing count does not mean reporting is off, and this page could not
  // tell the difference anyway: it is prerendered, and the build runs without
  // a database, so any answer baked in here would describe the build machine
  // rather than the server. Saying "not available on this deployment" meant
  // that on a fresh deploy nobody could report anything until the page
  // happened to revalidate. Gating the form on "is a database configured" has
  // the same flaw for the same reason, and I tried it: it hid the form on a
  // working deployment. Whether a write can land is a runtime fact, so the
  // action answers it — it runs at request time, where the database is.
  if (!status) {
    return (
      <Card className="p-4 lg:p-6" as="section">
        <CardHead title="Is it just you?" />
        <p className="text-[12.5px] text-ink-2 leading-[1.8]">
          The live count for {brokerName} is not loaded on this copy of the page yet.
          You can still report a problem — it is recorded straight away and shows up
          here shortly.
        </p>
        <div className="mt-3 pt-3 border-t border-line-2">
          <ReportForm brokerSlug={brokerSlug} />
        </div>
      </Card>
    );
  }

  const c = COPY[status.level];
  const toNext = Math.max(0, THRESHOLD.degraded - status.reporters);

  return (
    <Card className="p-4 lg:p-6" as="section">
      <CardHead
        title="Is it just you?"
        aside={<StatusChip status={status} />}
      />

      <div className="flex items-end gap-[10px] mb-2">
        <span className="font-[family-name:var(--font-display)] text-[30px] font-bold tnum leading-none">
          {status.reporters}
        </span>
        <span className="text-[12px] text-ink-3 leading-[1.4] pb-[3px]">
          {status.reporters === 1 ? 'person has' : 'people have'} reported a problem<br />
          with {brokerName} in the last {status.windowHours} hours
        </span>
      </div>

      <Meter value={Math.min(status.reporters, THRESHOLD.down)} max={THRESHOLD.down} tone={c.tone === 'good' ? 'up' : c.tone === 'warn' ? 'warn' : 'brass'} />

      <p className="text-[11px] text-ink-3 mt-2 leading-[1.7]">
        {status.level === 'normal'
          ? `${THRESHOLD.degraded} distinct reporters inside the window changes this to "problems reported". ${toNext} more would do it.`
          : `The threshold is ${THRESHOLD.degraded} distinct reporters for "problems reported" and ${THRESHOLD.down} for "widespread". Repeat reports from one person count once.`}
      </p>

      {status.byKind.length > 0 && (
        <ul className="flex flex-col gap-[7px] mt-3 pt-3 border-t border-line-2">
          {status.byKind.map((k) => (
            <li key={k.kind} className="flex items-center gap-2">
              <span className="text-[12.5px] flex-1">{INCIDENT_LABELS[k.kind]}</span>
              <span className="text-[12px] font-bold tnum text-ink-2">{k.reporters}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 pt-3 border-t border-line-2">
        <ReportForm brokerSlug={brokerSlug} />
      </div>
    </Card>
  );
}
