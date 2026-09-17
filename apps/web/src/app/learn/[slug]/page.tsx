import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ARTICLES, type ArticleBlock } from '@commentfx/core';
import { liveArticle, liveArticles } from '@/lib/records';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd, articleLd } from '@/lib/seo';
import { Header, PageHero, Footer } from '@/components/chrome';
import { Card, CardHead } from '@/components/primitives';
import { Faq } from '@/components/Faq';
import { Inline } from '@/components/Prose';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

/**
 * A day, because an article changes when someone edits it and not on a clock.
 * The dates the page shows come from the file, so a stale render says the same
 * thing the fresh one would.
 */
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await liveArticle(slug);
  if (!a) return {};
  return pageMetadata({
    title: a.title,
    description: a.description,
    path: `/learn/${a.slug}`,
    type: 'article',
    publishedTime: a.published,
    modifiedTime: a.updated,
    authors: [a.author],
  });
}

const anchor = (heading: string) =>
  heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

const asDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });

function Block({ block }: { block: ArticleBlock }) {
  const id = block.heading ? anchor(block.heading) : undefined;
  return (
    <section id={id} className="border-t border-line-2 first:border-t-0 pt-6 first:pt-0 mt-6 first:mt-0">
      {block.heading ? (
        <h2 className="font-[family-name:var(--font-display)] text-[18px] lg:text-[20px] font-bold tracking-[-0.025em] leading-[1.25] mb-3 text-balance">
          {block.heading}
        </h2>
      ) : null}

      {block.paragraphs.map((p) => (
        <p key={p} className="text-[14.5px] leading-[1.8] text-ink-2 mb-3 last:mb-0 max-w-[68ch]">
          <Inline text={p} />
        </p>
      ))}

      {block.list ? (
        block.list.ordered ? (
          <ol className="list-decimal pl-5 marker:text-ink-3 marker:text-[13px] flex flex-col gap-[10px] mt-3 max-w-[68ch]">
            {block.list.items.map((it) => (
              <li key={it} className="text-[14.5px] leading-[1.8] text-ink-2 pl-1"><Inline text={it} /></li>
            ))}
          </ol>
        ) : (
          <ul className="flex flex-col gap-[10px] mt-3 max-w-[68ch]">
            {block.list.items.map((it) => (
              <li key={it} className="text-[14.5px] leading-[1.8] text-ink-2 pl-5 relative">
                <span aria-hidden className="absolute left-0 top-[11px] w-[6px] h-[6px] rounded-full bg-accent" />
                <Inline text={it} />
              </li>
            ))}
          </ul>
        )
      ) : null}

      {block.example ? (
        <figure className="bg-card-2 border border-line rounded-[14px] p-4 mt-5">
          <figcaption className="text-[12px] font-bold uppercase tracking-[0.07em] text-ink-3 mb-3">
            {block.example.title}
          </figcaption>
          {/* A real table: the left column is what you do or what you have, the
              right is what it comes to. Two stacked divs would read the same to
              a person and say nothing to anything else. */}
          <table className="w-full border-collapse">
            <tbody>
              {block.example.rows.map(([k, v]) => (
                <tr key={k} className="border-b border-line-2 last:border-b-0 align-top">
                  <th scope="row" className="text-left font-medium text-[13px] text-ink-2 leading-[1.6] py-[9px] pr-4">
                    <Inline text={k} />
                  </th>
                  <td className="text-[13px] font-semibold tnum leading-[1.6] py-[9px] text-right">
                    <Inline text={v} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {block.example.note ? (
            <p className="text-[12px] text-ink-3 leading-[1.75] mt-3 pt-3 border-t border-line-2">
              <Inline text={block.example.note} />
            </p>
          ) : null}
        </figure>
      ) : null}
    </section>
  );
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const all = await liveArticles();
  const a = all.find((x) => x.slug === slug);
  if (!a) notFound();

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/learn' },
    { name: a.heading, path: `/learn/${a.slug}` },
  ];
  const headings = a.blocks.map((b) => b.heading).filter((h): h is string => Boolean(h));
  const others = all.filter((x) => x.slug !== a.slug);

  return (
    <>
      <Header active="/learn" />
      <main id="main" className="pb-6 lg:pb-10">
        <PageHero title={a.heading} trail={trail} />
        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">

          {/* The answer first, before the article that explains it. Someone who
              arrived from a search typed a question, and making them read four
              paragraphs to find out whether this page has their answer is the
              behaviour that makes people hate content pages. */}
          <Card className="p-4 lg:p-6" as="section">
            <h2 className="text-[13.5px] font-bold leading-[1.5] mb-2">{a.question}</h2>
            <p className="text-[15px] leading-[1.8] text-ink-2 max-w-[68ch]">
              <Inline text={a.answer} />
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 pt-3 border-t border-line-2 text-[11.5px] text-ink-3">
              <span>By {a.author}</span>
              <span aria-hidden className="text-line">·</span>
              <span>Published <time dateTime={a.published}>{asDate(a.published)}</time></span>
              <span aria-hidden className="text-line">·</span>
              <span>Last checked <time dateTime={a.updated}>{asDate(a.updated)}</time></span>
            </div>
          </Card>

          {headings.length > 2 ? (
            <Card className="p-4 lg:p-6" as="section" id="contents">
              <nav aria-label="On this page">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3 mb-[10px]">
                  On this page
                </h2>
                <ol className="flex flex-col">
                  {headings.map((h, i) => (
                    <li key={h} className="border-b border-line-2 last:border-b-0">
                      <a href={`#${anchor(h)}`} className="flex items-baseline gap-3 py-[9px] group">
                        <span className="text-[11.5px] tnum text-ink-3 w-[14px] shrink-0">{i + 1}</span>
                        <span className="text-[13.5px] leading-[1.5] group-hover:text-accent">{h}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </Card>
          ) : null}

          <Card className="p-4 lg:p-6" as="article">
            {a.blocks.map((b, i) => <Block key={b.heading ?? `b${i}`} block={b} />)}
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Common questions" />
            <Faq items={a.faq} />
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Read next" href="/learn" hrefLabel="All guides" />
            <ul className="flex flex-col">
              {others.map((o) => (
                <li key={o.slug} className="border-b border-line-2 last:border-b-0">
                  <Link href={`/learn/${o.slug}`} className="flex items-start gap-3 py-3 group">
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13.5px] font-semibold leading-[1.45] group-hover:text-accent">
                        {o.heading}
                      </span>
                      <span className="block text-[12px] text-ink-3 leading-[1.6] mt-[3px]">{o.question}</span>
                    </span>
                    <span aria-hidden className="text-ink-3 mt-[2px]">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail), articleLd(a), faqLd(a.faq)]} />
    </>
  );
}
