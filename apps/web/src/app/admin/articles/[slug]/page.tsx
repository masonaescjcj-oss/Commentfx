import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDb, getArticleOverride } from '@commentfx/db';
import {
  articleBySlug, mergeRecord, formatArticleBody, formatArticleFaq, type Article,
} from '@commentfx/core';
import { Card, CardHead, Tag } from '@/components/primitives';
import { ArticleForm } from '../../ArticleForm';
import { ArticleControls } from '../../ArticleControls';

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const base = articleBySlug(slug);
  const { db } = await getDb();
  const override = await getArticleOverride(db, slug);
  if (!base && !override) notFound();

  const isNew = !base;
  const a = (base ? mergeRecord(base, override?.patch ?? {}) : (override!.patch as unknown as Article)) as Article;

  return (
    <main className="px-4 py-5 flex flex-col gap-[13px] max-w-[560px] mx-auto">
      <Link href="/admin/articles" className="text-[12px] text-accent">‹ Articles</Link>

      <header className="gutter">
        <div className="flex items-center gap-2">
          <h1 className="font-[family-name:var(--font-display)] text-[23px] font-bold tracking-[-0.02em] flex-1">
            {a.heading ?? slug}
          </h1>
          {override?.status === 'live' && <Tag tone="good">live</Tag>}
          {override?.status === 'draft' && <Tag tone="warn">draft</Tag>}
          {isNew && <Tag tone="neutral">not in code</Tag>}
        </div>
        <p className="text-[12.5px] text-ink-2 mt-1">
          <Link href={`/learn/${slug}`} className="text-accent">public page</Link>
        </p>
      </header>

      {override && (
        <Card className="p-4" as="section">
          <CardHead
            title="Stored edit"
            aside={
              <span className="text-[11px] text-ink-3">
                {override.updatedBy} · {override.updatedAt.toISOString().slice(0, 10)}
              </span>
            }
          />
          {override.note && <p className="text-[12px] text-ink-2 leading-[1.7] mb-2">{override.note}</p>}
          <p className="text-[12px] text-ink-3 leading-[1.7]">
            {Object.keys(override.patch).filter((k) => k !== 'slug').sort().join(', ') || 'nothing'} changed.
          </p>
          <div className="mt-3 pt-3 border-t border-line-2">
            <ArticleControls slug={slug} status={override.status} isNew={override.isNew} />
          </div>
        </Card>
      )}

      <ArticleForm
        slug={slug}
        isNew={false}
        status={override?.status ?? null}
        article={{
          title: a.title ?? '',
          heading: a.heading ?? '',
          description: a.description ?? '',
          question: a.question ?? '',
          answer: a.answer ?? '',
          author: a.author ?? '',
          published: a.published ?? '',
          updated: a.updated ?? '',
          body: formatArticleBody(a.blocks ?? []),
          faq: formatArticleFaq(a.faq ?? []),
        }}
      />
    </main>
  );
}
