import { SITE, absoluteUrl } from '@/lib/site';
import { liveArticles } from '@/lib/records';

/**
 * The guides as a feed.
 *
 * Small and worth having: a directory in this category is read by people who
 * follow a handful of sources and check them rarely, and a feed is the one way
 * to reach them that nobody owns and nothing ranks. It costs one route.
 *
 * The description is the article's own — the sentence written to appear under a
 * search result is the same sentence a reader wants in a feed list, and writing
 * a second one would produce two that drift.
 */
export const revalidate = 3600;

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const articles = await liveArticles();
  const updated = articles[0]?.updated ?? new Date().toISOString().slice(0, 10);

  const items = articles.map((a) => `
    <item>
      <title>${escape(a.title)}</title>
      <link>${absoluteUrl(`/learn/${a.slug}`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/learn/${a.slug}`)}</guid>
      <description>${escape(a.description)}</description>
      <pubDate>${new Date(`${a.published}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE.name)} — Guides</title>
    <link>${absoluteUrl('/learn')}</link>
    <atom:link href="${absoluteUrl('/learn/feed.xml')}" rel="self" type="application/rss+xml" />
    <description>${escape(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(`${updated}T00:00:00Z`).toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  });
}
