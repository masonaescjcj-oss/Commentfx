import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Kind } from '@commentfx/db';
import { Card, CardHead } from '@/components/primitives';
import { RecordForm } from '../../../../RecordForm';

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const KINDS = new Set<Kind>(['broker', 'prop', 'exchange']);
const NOUN: Record<Kind, string> = { broker: 'broker', prop: 'prop firm', exchange: 'exchange' };

export default async function NewRecordPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind: rawKind } = await params;
  if (!KINDS.has(rawKind as Kind)) notFound();
  const kind = rawKind as Kind;

  return (
    <main className="px-4 py-5 flex flex-col gap-[13px] max-w-[560px] mx-auto">
      <Link href="/admin/records" className="text-[12px] text-accent">‹ Records</Link>

      <header className="gutter">
        <h1 className="font-[family-name:var(--font-display)] text-[23px] font-bold tracking-[-0.02em]">
          New {NOUN[kind]}
        </h1>
        <p className="text-[13px] text-ink-2 leading-[1.7] mt-2">
          A record added here is a draft until you publish it, and it starts with no
          companies, no research and an initials logo — which is what the page will say
          about it, and why the indexing rules will keep it out of the sitemap until it
          has more than figures.
        </p>
      </header>

      <RecordForm kind={kind} slug="" record={{}} base={null} isNew status={null} />

      <Card className="p-4" as="section">
        <CardHead title="Before you add one" />
        <p className="text-[12px] text-ink-2 leading-[1.75]">
          Everything on this form is a figure somebody has to have read somewhere. The
          verification queue is where you record where — a record with figures nobody has
          checked ranks on this site beside records that were, and that is the one thing
          this directory exists not to do.
        </p>
      </Card>
    </main>
  );
}
