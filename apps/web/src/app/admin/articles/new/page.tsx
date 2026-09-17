import Link from 'next/link';
import type { Metadata } from 'next';
import { ArticleForm } from '../../ArticleForm';

export const metadata: Metadata = { title: 'New article', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const today = () => new Date().toISOString().slice(0, 10);

export default function NewArticlePage() {
  return (
    <main className="px-4 py-5 flex flex-col gap-[13px] max-w-[560px] mx-auto">
      <Link href="/admin/articles" className="text-[12px] text-accent">‹ Articles</Link>

      <header className="gutter">
        <h1 className="font-[family-name:var(--font-display)] text-[23px] font-bold tracking-[-0.02em]">
          New article
        </h1>
        <p className="text-[13px] text-ink-2 leading-[1.7] mt-2">
          Start from the question. If you cannot write one somebody would actually type, the
          article does not have a reason to exist yet — and this is a category where a thin
          page costs more than no page.
        </p>
      </header>

      <ArticleForm
        slug=""
        isNew
        status={null}
        article={{
          title: '', heading: '', description: '', question: '', answer: '',
          author: 'CommentFX', published: today(), updated: today(),
          body: '', faq: '',
        }}
      />
    </main>
  );
}
