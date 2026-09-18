import Link from 'next/link';
import type { Metadata } from 'next';
import { articleWordCount, PLANNED } from '@commentfx/core';
import { liveArticles } from '@/lib/records';
import { pageMetadata, JsonLd, breadcrumbLd, itemListLd } from '@/lib/seo';
import { Header, PageHero, Footer } from '@/components/chrome';
import { Card, CardHead } from '@/components/primitives';

export const revalidate = 86400;

const TITLE = 'Guides: how to check a broker before you deposit';
const LEAD =
  'The things a ranking cannot tell you: where the registers are, what a spread costs in money, ' +
  'and which company you are actually signing with.';

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: LEAD,
  path: '/learn',
});

export default async function LearnIndex() {
  const articles = await liveArticles();
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/learn' },
  ];

  return (
    <>
      <Header active="/learn" />
      <main id="main" className="pb-6 lg:pb-10">
        <PageHero title="Guides" trail={trail} />
        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
          <Card className="p-4 lg:p-6" as="section">
            {/* Decorative: the lead under it says the same thing in words, and an
                alt repeating that would make a screen reader read the sentence
                twice. An empty alt is the correct way to say so — a missing one
                would make it guess at the filename. */}
            <img
              src="/learn/guides.webp"
              alt=""
              width={1600}
              height={900}
              className="w-full h-auto rounded-[14px] border border-line bg-[#081228] mb-4 max-w-[560px]"
            />
            <p className="text-[14px] leading-[1.8] text-ink-2 max-w-[64ch]">{LEAD}</p>
            <p className="text-[12px] leading-[1.75] text-ink-3 mt-3 max-w-[64ch]">
              Each one answers a single question in its first two sentences, shows the arithmetic
              where there is any, and links to the pages that make this site money — which is
              disclosed rather than hidden, and is why the advice is written to survive being
              checked.
            </p>
          </Card>

          <Card className="px-4 lg:px-6" as="section">
            <ul className="flex flex-col">
              {articles.map((a) => (
                <li key={a.slug} className="border-b border-line-2 last:border-b-0">
                  <Link href={`/learn/${a.slug}`} className="block py-5 group">
                    <h2 className="font-[family-name:var(--font-display)] text-[17px] lg:text-[19px] font-bold tracking-[-0.025em] leading-[1.25] group-hover:text-accent text-balance">
                      {a.heading}
                    </h2>
                    <p className="text-[13px] text-ink-2 leading-[1.7] mt-[6px] max-w-[62ch]">
                      {a.description}
                    </p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-3 mt-[10px]">
                      <time dateTime={a.published}>
                        {new Date(`${a.published}T00:00:00Z`).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
                        })}
                      </time>
                      <span aria-hidden className="text-line">·</span>
                      {/* Counted from the article, not typed in. Nothing on this
                          site claims a number it cannot recompute. */}
                      <span className="tnum">{articleWordCount(a).toLocaleString('en-US')} words</span>
                      <span aria-hidden className="text-line">·</span>
                      <span className="text-accent font-semibold">Read &rsaquo;</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {/* One every week or two, in the order docs/SEO.md §5.2 sets out,
              read from the same file the articles live in. A reader who can see
              what is coming can tell whether it arrived — which only works if
              the list cannot go on promising something already published. */}
          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Being written" />
            <ul className="flex flex-col">
              {PLANNED.map((t) => (
                <li key={t.slug} className="text-[13px] text-ink-3 leading-[1.6] py-[10px] border-b border-line-2 last:border-b-0">
                  {t.title}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 lg:p-6" as="section">
            <CardHead title="Or start from the rankings" href="/brokers" hrefLabel="All brokers" />
            <ul className="flex flex-col">
              {[
                { href: '/best/tier-1-regulated', label: 'Brokers holding a tier-1 licence' },
                { href: '/best/lowest-spread', label: 'Cheapest all-in cost' },
                { href: '/methodology', label: 'How the score is built' },
                { href: '/status', label: 'Withdrawal and outage reports' },
              ].map(({ href, label }) => (
                <li key={href} className="border-b border-line-2 last:border-b-0">
                  <Link href={href} className="flex items-center gap-3 py-[11px] group">
                    <span className="flex-1 text-[13.5px] font-semibold group-hover:text-accent">{label}</span>
                    <span aria-hidden className="text-ink-3">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
      <JsonLd graph={[
        breadcrumbLd(trail),
        itemListLd(TITLE, articles.map((a) => ({ name: a.heading, path: `/learn/${a.slug}` })), 'unordered'),
      ]} />
    </>
  );
}
