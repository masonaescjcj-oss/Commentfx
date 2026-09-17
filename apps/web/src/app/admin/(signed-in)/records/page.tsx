import Link from 'next/link';
import type { Metadata } from 'next';
import { getDb, allOverrides, type Kind } from '@commentfx/db';
import { codeSlugs } from '@/lib/records';
import { Card, CardHead, Tag } from '@/components/primitives';

export const metadata: Metadata = { title: 'Records', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const SECTIONS: Array<{ kind: Kind; label: string; noun: string }> = [
  { kind: 'broker', label: 'Brokers', noun: 'broker' },
  { kind: 'prop', label: 'Prop firms', noun: 'prop firm' },
  { kind: 'exchange', label: 'Exchanges', noun: 'exchange' },
];

export default async function RecordsPage() {
  const { db } = await getDb();
  const overrides = await allOverrides(db);
  const byTarget = new Map(overrides.map((o) => [`${o.kind}:${o.slug}`, o]));

  return (
    <main className="px-4 py-5 flex flex-col gap-[13px] max-w-[560px] mx-auto">
      <Link href="/admin" className="text-[12px] text-accent">‹ Admin</Link>

      <header className="gutter">
        <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.02em]">
          Records
        </h1>
        <p className="text-[13px] text-ink-2 leading-[1.7] mt-2">
          Every record on the site, and what has been changed about it. An edit is stored
          as a patch on top of what the code says, so discarding it restores the record
          exactly and a later correction in the data files still reaches the page.
        </p>
      </header>

      {SECTIONS.map((s) => {
        const fromCode = codeSlugs(s.kind);
        const extra = overrides.filter((o) => o.kind === s.kind && o.isNew).map((o) => o.slug);
        const slugs = [...fromCode, ...extra.filter((x) => !fromCode.includes(x))];
        return (
          <Card key={s.kind} className="p-4" as="section">
            <CardHead
              title={s.label}
              aside={
                <Link href={`/admin/records/new/${s.kind}`} className="text-[11.5px] text-accent font-semibold">
                  + new {s.noun}
                </Link>
              }
            />
            <ul>
              {slugs.map((slug) => {
                const o = byTarget.get(`${s.kind}:${slug}`);
                return (
                  <li key={slug} className="border-b border-line-2 last:border-b-0">
                    <Link href={`/admin/records/${s.kind}/${slug}`} className="flex items-center gap-2 py-[11px] group">
                      <span className="flex-1 min-w-0 text-[13.5px] font-semibold group-hover:text-accent truncate">
                        {slug}
                      </span>
                      {o?.isNew && <Tag tone="neutral">not in code</Tag>}
                      {o?.status === 'live' && <Tag tone="good">edited · live</Tag>}
                      {o?.status === 'draft' && <Tag tone="warn">draft</Tag>}
                      <span aria-hidden className="text-ink-3">›</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}

      <Card className="p-4" as="section">
        <CardHead title="What an edit can and cannot do" />
        <p className="text-[12px] text-ink-2 leading-[1.75]">
          A saved record is checked by the same rules the build runs over the curated data:
          a licence with no number, two companies claiming the same fallback, a 100% profit
          split, a daily drawdown larger than the overall one — none of them can be saved
          here any more than they could be committed. What the form does not edit is the
          entity map, the research write-ups and the logos; those are still code, because
          each carries rules a flat form cannot express.
        </p>
      </Card>
    </main>
  );
}
