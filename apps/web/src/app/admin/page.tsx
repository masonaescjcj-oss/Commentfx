import Link from 'next/link';
import type { Metadata } from 'next';
import { desc } from 'drizzle-orm';
import { getDb, schema, STALE_AFTER_DAYS, type Kind } from '@commentfx/db';
import { queue } from '@/lib/verify';
import { sourceHealth, unconfirmed } from '@/lib/registers';
import { pendingReviews } from '@/lib/reviews';
import { rankedBrokers, rankedProps, rankedExchanges } from '@/lib/repo';
import { Card, CardHead, Meter, Tag } from '@/components/primitives';
import { TOPIC_LABELS } from '@commentfx/core';
import { ModerateReview } from './ModerateReview';

export const metadata: Metadata = { title: 'Verification queue', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const SECTIONS: Array<{ kind: Kind; label: string; slugs: () => string[] }> = [
  { kind: 'broker', label: 'Brokers', slugs: () => rankedBrokers().map((r) => r.broker.slug) },
  { kind: 'prop', label: 'Prop firms', slugs: () => rankedProps().map((r) => r.firm.slug) },
  { kind: 'exchange', label: 'Exchanges', slugs: () => rankedExchanges().map((r) => r.exchange.slug) },
];

export default async function AdminPage() {
  const sections = await Promise.all(
    SECTIONS.map(async (s) => ({ ...s, rows: await queue(s.kind, s.slugs()) })),
  );
  const { db } = await getDb();
  const recent = await db.select().from(schema.auditLog).orderBy(desc(schema.auditLog.at)).limit(12);
  const [sources, findings, reviewQueue] = await Promise.all([sourceHealth(), unconfirmed(), pendingReviews()]);

  const outstanding = sections.reduce((n, s) => n + s.rows.length, 0);

  return (
    <main className="px-4 py-5 flex flex-col gap-[13px] max-w-[560px] mx-auto">
      <header className="px-1">
        <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.02em]">
          Verification queue
        </h1>
        <p className="text-[13px] text-ink-2 leading-[1.7] mt-2">
          {outstanding === 0
            ? 'Every record is fully verified.'
            : `${outstanding} record${outstanding > 1 ? 's' : ''} need a first check or a re-check. A verification expires after ${STALE_AFTER_DAYS} days.`}
        </p>
      </header>

      {sections.map((s) => (
        <Card key={s.kind} className="p-4" as="section">
          <CardHead
            title={s.label}
            aside={<span className="text-[11.5px] text-ink-3 tnum">{s.rows.length} outstanding</span>}
          />
          {s.rows.length === 0 ? (
            <p className="text-[12.5px] text-up">All verified.</p>
          ) : (
            <ul>
              {s.rows.map((c) => (
                <li key={c.slug} className="border-b border-line-2 last:border-b-0">
                  <Link href={`/admin/${c.kind}/${c.slug}`} className="flex items-center gap-3 py-[11px] group">
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13.5px] font-semibold group-hover:text-brass">{c.slug}</span>
                      <span className="block mt-[5px]">
                        <Meter value={c.ratio * 100} max={100} tone={c.ratio >= 0.5 ? 'brass' : 'warn'} />
                      </span>
                    </span>
                    <span className="text-[11px] text-ink-3 tnum shrink-0">
                      {c.verified}/{c.fields.length}
                    </span>
                    {c.stale > 0 && <Tag tone="warn">{c.stale} stale</Tag>}
                    <span aria-hidden className="text-ink-3">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}

      <Card className="p-4" as="section">
        <CardHead
          title="Reviews waiting to be checked"
          aside={<span className="text-[11.5px] text-ink-3 tnum">{reviewQueue.length} in the queue</span>}
        />
        {reviewQueue.length === 0 ? (
          <p className="text-[12.5px] text-ink-3">
            Nothing waiting. Every published review has been looked at.
          </p>
        ) : (
          <ul>
            {reviewQueue.map((q) => (
              <li key={q.id} className="py-[11px] border-b border-line-2 last:border-b-0">
                <div className="flex items-baseline gap-2">
                  <span className="w-[24px] h-[22px] grid place-items-center rounded-[6px] bg-card-3 text-[12px] font-extrabold tnum shrink-0">
                    {q.rating}
                  </span>
                  <Link href={`/brokers/${q.brokerSlug}#reviews`} className="text-[13px] font-semibold hover:text-brass">
                    {q.brokerSlug}
                  </Link>
                  <span className="text-[11.5px] text-ink-3">{TOPIC_LABELS[q.topic]}</span>
                  <div className="flex-1" />
                  <time className="text-[11px] text-ink-3 tnum" dateTime={q.createdAt.toISOString()}>
                    {q.createdAt.toISOString().slice(0, 10)}
                  </time>
                </div>
                <p className="text-[12px] text-ink-2 leading-[1.75] mt-[6px]">{q.body}</p>
                {q.evidenceNote && (
                  <p className="text-[11.5px] text-ink-2 mt-[6px] bg-card-2 border border-line rounded-lg p-2 leading-[1.7]">
                    <b>Offered privately:</b> {q.evidenceNote}
                  </p>
                )}
                <ModerateReview id={q.id} brokerSlug={q.brokerSlug} />
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.75]">
          A review is live on the site already, marked unverified. Checking it is what lets
          it reach the score — so check the evidence, not the sentiment.
        </p>
      </Card>

      <Card className="p-4" as="section">
        <CardHead
          title="Register findings"
          aside={<span className="text-[11.5px] text-ink-3 tnum">{findings.length} unconfirmed</span>}
        />
        {findings.length === 0 ? (
          <p className="text-[12.5px] text-ink-3">
            Nothing outstanding. Every licence the readable registers cover was confirmed on the last run.
          </p>
        ) : (
          <ul>
            {findings.map((f) => (
              <li key={`${f.brokerSlug}-${f.regulatorCode}-${f.licenceNumber}`} className="py-[10px] border-b border-line-2 last:border-b-0">
                <div className="flex items-baseline gap-2">
                  <Link href={`/admin/broker/${f.brokerSlug}`} className="text-[13px] font-semibold hover:text-brass">
                    {f.brokerSlug}
                  </Link>
                  <span className="text-[11.5px] text-ink-3 tnum">{f.regulatorCode} {f.licenceNumber}</span>
                  <div className="flex-1" />
                  <Tag tone={f.kind === 'not-found' ? 'bad' : f.kind === 'name-mismatch' ? 'warn' : 'neutral'}>
                    {f.kind}
                  </Tag>
                </div>
                <p className="text-[11.5px] text-ink-3 mt-[3px] leading-[1.7]">{f.detail}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.75]">
          A finding is a machine reading a public register, never a correction. Nothing here
          changes a published record until an editor checks it.
        </p>
      </Card>

      <Card className="p-4" as="section">
        <CardHead
          title="Register sources"
          aside={<span className="text-[11.5px] text-ink-3 tnum">{sources.filter((s) => s.state === 'live').length} of {sources.length} readable</span>}
        />
        <ul>
          {sources.map((s) => (
            <li key={s.code} className="py-[10px] border-b border-line-2 last:border-b-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[13px] font-semibold">{s.code}</span>
                <div className="flex-1" />
                {s.state === 'blocked' ? (
                  <Tag tone="neutral">no reader</Tag>
                ) : s.lastOk === null ? (
                  <Tag tone="warn">never run</Tag>
                ) : s.lastOk ? (
                  <Tag tone="good">{s.lastEntryCount} entries</Tag>
                ) : (
                  <Tag tone="bad">failed</Tag>
                )}
              </div>
              <p className="text-[11.5px] text-ink-3 mt-[3px] leading-[1.7]">
                {s.state === 'blocked'
                  ? s.reason
                  : s.lastRanAt
                    ? `Last run ${s.lastRanAt.slice(0, 16).replace('T', ' ')}${s.lastReason ? ` — ${s.lastReason}` : ''}`
                    : 'No run recorded yet.'}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-[11.5px] text-ink-3 mt-3 leading-[1.75]">
          A source with no reader is listed rather than hidden, so register coverage never
          looks wider than it is. Run the readers with{' '}
          <code className="text-[11px]">pnpm --filter @commentfx/web check-registers</code>.
        </p>
      </Card>

      <Card className="p-4" as="section">
        <CardHead title="Recent activity" aside={<span className="text-[11px] text-ink-3">append-only</span>} />
        {recent.length === 0 ? (
          <p className="text-[12.5px] text-ink-3">Nothing recorded yet.</p>
        ) : (
          <ul>
            {recent.map((a) => (
              <li key={a.id} className="py-[9px] border-b border-line-2 last:border-b-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[12.5px] font-semibold">{a.slug}</span>
                  <span className="text-[11.5px] text-ink-3">{a.field}</span>
                  <div className="flex-1" />
                  <time className="text-[11px] text-ink-3 tnum" dateTime={a.at.toISOString()}>
                    {a.at.toISOString().slice(0, 16).replace('T', ' ')}
                  </time>
                </div>
                <p className="text-[11.5px] text-ink-3 mt-[2px]">
                  {a.actor} · {a.action}
                  {a.before && a.before !== a.after ? ` · ${a.before} → ${a.after}` : a.after ? ` · ${a.after}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
