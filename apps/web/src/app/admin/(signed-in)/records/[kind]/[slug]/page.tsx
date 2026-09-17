import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDb, getOverride, type Kind } from '@commentfx/db';
import { mergeRecord, fieldsFor, readPath, showValue, sameValue } from '@commentfx/core';
import { baseRecord } from '@/lib/records';
import { Card, CardHead, Tag } from '@/components/primitives';
import { RecordForm } from '../../../../RecordForm';
import { OverrideControls } from '../../../../OverrideControls';

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const KINDS = new Set<Kind>(['broker', 'prop', 'exchange']);

const publicPath = (kind: Kind, slug: string) =>
  `/${kind === 'broker' ? 'brokers' : kind === 'prop' ? 'props' : 'exchanges'}/${slug}`;

export default async function EditRecordPage({ params }: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind: rawKind, slug } = await params;
  if (!KINDS.has(rawKind as Kind)) notFound();
  const kind = rawKind as Kind;

  const base = baseRecord(kind, slug);
  const { db } = await getDb();
  const override = await getOverride(db, kind, slug);

  // A record has to exist somewhere — in the code, or as a row here. Neither
  // means the URL is wrong rather than that the editor should invent one; new
  // records are created from their own route, which knows it is creating.
  if (!base && !override) notFound();

  const isNew = !base;
  const current = base ? mergeRecord(base as object, override?.patch ?? {}) : (override!.patch as object);

  // What the stored patch actually changes, field by field. A diff is the only
  // honest way to review an edit: "record edited" tells a second pair of eyes
  // nothing about whether the edit was right.
  const changed = base
    ? fieldsFor(kind)
        .map((spec) => ({
          spec,
          was: readPath(base, spec.path),
          now: readPath(current, spec.path),
        }))
        .filter((d) => !sameValue(d.was, d.now))
    : [];

  return (
    <main className="px-4 py-5 flex flex-col gap-[13px] max-w-[560px] mx-auto">
      <Link href="/admin/records" className="text-[12px] text-accent">‹ Records</Link>

      <header className="gutter">
        <div className="flex items-center gap-2">
          <h1 className="font-[family-name:var(--font-display)] text-[23px] font-bold tracking-[-0.02em] flex-1">
            {slug}
          </h1>
          {override?.status === 'live' && <Tag tone="good">live</Tag>}
          {override?.status === 'draft' && <Tag tone="warn">draft</Tag>}
          {isNew && <Tag tone="neutral">not in code</Tag>}
        </div>
        <p className="text-[12.5px] text-ink-2 mt-1">
          {kind} ·{' '}
          <Link href={publicPath(kind, slug)} className="text-accent">public page</Link> ·{' '}
          <Link href={`/admin/${kind}/${slug}`} className="text-accent">verification</Link>
        </p>
      </header>

      {override && (
        <Card className="p-4" as="section">
          <CardHead
            title={changed.length > 0 ? `${changed.length} field${changed.length > 1 ? 's' : ''} changed` : 'Stored edit'}
            aside={
              <span className="text-[11px] text-ink-3">
                {override.updatedBy} · {override.updatedAt.toISOString().slice(0, 10)}
              </span>
            }
          />
          {override.note && <p className="text-[12px] text-ink-2 leading-[1.7] mb-2">{override.note}</p>}
          {changed.length === 0 ? (
            <p className="text-[12px] text-ink-3 leading-[1.7]">
              {isNew
                ? 'This record exists only here. Everything on it was entered by hand.'
                : 'Nothing on this record currently differs from what the code says.'}
            </p>
          ) : (
            <ul className="text-[12px]">
              {changed.map((d) => (
                <li key={d.spec.path} className="py-[7px] border-b border-line-2 last:border-b-0">
                  <span className="text-ink-2">{d.spec.label}</span>
                  <span className="block mt-[2px] tnum">
                    <span className="text-ink-3 line-through">{showValue(d.was)}</span>
                    <span aria-hidden className="text-ink-3"> → </span>
                    <b>{showValue(d.now)}</b>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 pt-3 border-t border-line-2">
            <OverrideControls kind={kind} slug={slug} status={override.status} isNew={override.isNew} />
          </div>
        </Card>
      )}

      <RecordForm
        kind={kind}
        slug={slug}
        record={current as Record<string, unknown>}
        base={(base ?? null) as Record<string, unknown> | null}
        isNew={false}
        status={override?.status ?? null}
      />
    </main>
  );
}
