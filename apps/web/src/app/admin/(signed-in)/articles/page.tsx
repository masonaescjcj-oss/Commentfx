import Link from 'next/link';
import type { Metadata } from 'next';
import { getDb, allArticleOverrides } from '@commentfx/db';
import { ARTICLES, articleWordCount } from '@commentfx/core';
import { Card, CardHead, Tag } from '@/components/primitives';

export const metadata: Metadata = { title: 'Articles', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function ArticlesAdminPage() {
  const { db } = await getDb();
  const overrides = await allArticleOverrides(db);
  const bySlug = new Map(overrides.map((o) => [o.slug, o]));

  const fromCode = ARTICLES.map((a) => ({ slug: a.slug, heading: a.heading, words: articleWordCount(a) }));
  const extra = overrides
    .filter((o) => o.isNew)
    .map((o) => ({
      slug: o.slug,
      heading: String((o.patch as { heading?: string }).heading ?? o.slug),
      words: 0,
    }))
    .filter((x) => !fromCode.some((c) => c.slug === x.slug));

  return (
    <main className="px-4 py-5 flex flex-col gap-[13px] max-w-[560px] mx-auto">
      <Link href="/admin" className="text-[12px] text-accent">‹ Admin</Link>

      <header className="gutter">
        <h1 className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[-0.02em]">
          Articles
        </h1>
        <p className="text-[13px] text-ink-2 leading-[1.7] mt-2">
          Guides under <code className="text-[12px]">/learn</code>. An article saved here is a
          draft until somebody publishes it, and it has to answer one question in its first two
          sentences, carry a worked example with real numbers, link to three different pages and
          run to 500 words before it can be saved at all.
        </p>
        <p className="text-[12.5px] mt-2">
          <Link href="/admin/articles/new" className="text-accent font-semibold">+ write a new article</Link>
        </p>
      </header>

      <Card className="p-4" as="section">
        <CardHead title="Published in code" aside={<span className="text-[11.5px] text-ink-3 tnum">{fromCode.length}</span>} />
        <ul>
          {fromCode.map((a) => {
            const o = bySlug.get(a.slug);
            return (
              <li key={a.slug} className="border-b border-line-2 last:border-b-0">
                <Link href={`/admin/articles/${a.slug}`} className="flex items-center gap-2 py-[11px] group">
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-semibold group-hover:text-accent truncate">{a.heading}</span>
                    <span className="block text-[11px] text-ink-3 tnum">{a.words} words</span>
                  </span>
                  {o?.status === 'live' && <Tag tone="good">edited · live</Tag>}
                  {o?.status === 'draft' && <Tag tone="warn">draft edit</Tag>}
                  <span aria-hidden className="text-ink-3">›</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      {extra.length > 0 && (
        <Card className="p-4" as="section">
          <CardHead title="Written here" aside={<span className="text-[11.5px] text-ink-3 tnum">{extra.length}</span>} />
          <ul>
            {extra.map((a) => {
              const o = bySlug.get(a.slug)!;
              return (
                <li key={a.slug} className="border-b border-line-2 last:border-b-0">
                  <Link href={`/admin/articles/${a.slug}`} className="flex items-center gap-2 py-[11px] group">
                    <span className="flex-1 min-w-0 text-[13.5px] font-semibold group-hover:text-accent truncate">
                      {a.heading}
                    </span>
                    {o.status === 'live' ? <Tag tone="good">live</Tag> : <Tag tone="warn">draft</Tag>}
                    <span aria-hidden className="text-ink-3">›</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </main>
  );
}
