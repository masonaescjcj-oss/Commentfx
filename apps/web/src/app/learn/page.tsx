import Link from 'next/link';
import type { Metadata } from 'next';
import { articleWordCount, PLANNED } from '@commentfx/core';
import { liveArticles } from '@/lib/records';
import { pageMetadata, JsonLd, breadcrumbLd, itemListLd } from '@/lib/seo';
import { Header, Breadcrumbs, Footer } from '@/components/chrome';
import { Card, CardHead } from '@/components/primitives';
import { GuideCover } from '@/components/GuideCover';
import { readMinutes, shortDate } from '@/components/HomeSections';

const TOPIC_LABEL = { brokers: 'Brokers', props: 'Prop firms', exchanges: 'Exchanges' } as const;

/**
 * Three guides in the order a first-time reader needs them, by slug, so the
 * path only shows the steps that exist — a guide renamed or withdrawn drops out
 * of it rather than leaving a dead link.
 */
const START_HERE = [
  { slug: 'check-a-broker-licence', label: 'Check the licence is real' },
  { slug: 'which-entity-are-you-signing-with', label: 'Find the company you sign with' },
  { slug: 'what-a-spread-really-costs', label: 'Turn the spread into money' },
];

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

  // Newest first, so the one at the top is the one a returning reader has not
  // seen. The list was in the order the file happens to hold them.
  const sorted = [...articles].sort((a, b) => b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug));
  const [featured, ...rest] = sorted;
  const path = START_HERE.filter((s) => articles.some((a) => a.slug === s.slug));

  return (
    <>
      <Header active="/learn" />
      <main id="main" className="pb-6 lg:pb-10">
        <section className="hero">
          <div className="shell pt-4 pb-8 sm:pt-5 sm:pb-9 lg:pt-6 lg:pb-12 lg:flex lg:items-center lg:gap-12">
            <div className="lg:flex-1 lg:min-w-0">
              <Breadcrumbs trail={trail} tone="dark" />
              <h1 className="font-[family-name:var(--font-display)] text-[30px] sm:text-[38px] lg:text-[48px] font-bold leading-[1.05] tracking-[-0.04em] text-white mt-3 lg:mt-4 max-w-[16ch] text-balance">
                Guides
              </h1>
              <p className="text-[14.5px] lg:text-[16px] leading-[1.6] text-[color:var(--hero-ink-2)] mt-3 lg:mt-4 max-w-[54ch]">{LEAD}</p>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-[12px] lg:text-[12.5px] text-[color:var(--hero-ink-3)] tnum">
                <span>{articles.length} guides</span>
                <span aria-hidden>·</span>
                <span>{(['brokers', 'props', 'exchanges'] as const).map((t) => `${articles.filter((a) => a.topic === t).length} on ${TOPIC_LABEL[t].toLowerCase()}`).join(' · ')}</span>
              </p>
            </div>
            {/* Decorative: the lead beside it says the same thing in words. */}
            <img
              src="/learn/guides.webp"
              alt=""
              width={1600}
              height={900}
              className="hidden lg:block w-[400px] h-auto shrink-0 rounded-[20px] border border-[color:var(--hero-line)] bg-[#081228] shadow-[0_30px_60px_-30px_rgb(0_0_0_/_0.7)]"
            />
          </div>
        </section>

        <div className="shell pt-0 sm:pt-[13px] lg:pt-7 flex flex-col gap-0 sm:gap-[13px] lg:gap-7">
          {featured ? (
            <Link
              href={`/learn/${featured.slug}`}
              className="group bg-card border-b border-line sm:border sm:rounded-[20px] lg:rounded-[24px] overflow-hidden grid lg:grid-cols-[520px_minmax(0,1fr)] sm:shadow-[0_1px_2px_rgb(13_20_33_/_0.04),0_22px_44px_-26px_rgb(13_20_33_/_0.30)]"
            >
              <GuideCover article={featured} className="h-[200px] sm:h-[260px] lg:h-full lg:min-h-[330px]" />
              <span className="flex flex-col gap-3 p-5 lg:px-[34px] lg:py-8">
                <span className="flex items-center gap-2">
                  <span className="text-[10.5px] font-extrabold tracking-[0.1em] text-white bg-accent rounded-[6px] px-2 py-[3px]">NEWEST</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent">{TOPIC_LABEL[featured.topic]}</span>
                </span>
                <span className="font-[family-name:var(--font-display)] text-[22px] lg:text-[28px] font-bold leading-[1.15] tracking-[-0.03em] group-hover:text-accent text-balance">
                  {featured.heading}
                </span>
                <span className="rounded-[14px] bg-card-2 px-4 py-[14px] flex flex-col gap-[5px]">
                  <span className="text-[13px] font-bold leading-[1.45]">{featured.question}</span>
                  <span className="text-[13px] leading-[1.6] text-ink-2 line-clamp-3">{featured.answer.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')}</span>
                </span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-auto text-[12px] text-ink-3">
                  <time dateTime={featured.published}>{shortDate(featured.published)}</time>
                  <span aria-hidden>·</span>
                  <span className="tnum">{readMinutes(featured)} min read</span>
                  <span className="flex-1" />
                  <span className="text-accent text-[13.5px] font-bold">Read the guide ›</span>
                </span>
              </span>
            </Link>
          ) : null}

          <section aria-labelledby="every-guide">
            <div className="hidden sm:flex items-baseline gap-3 mb-4">
              <h2 id="every-guide" className="flex-1 font-[family-name:var(--font-display)] text-[20px] lg:text-[22px] font-bold tracking-[-0.025em]">Every guide</h2>
              <span className="text-[12.5px] text-ink-3">Newest first · each checked against its sources</span>
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 sm:gap-[13px] lg:gap-4">
              {rest.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/learn/${a.slug}`}
                    className="group h-full bg-card border-b border-line sm:border sm:rounded-[20px] overflow-hidden flex flex-col sm:shadow-[0_1px_2px_rgb(13_20_33_/_0.04),0_6px_18px_-10px_rgb(13_20_33_/_0.10)]"
                  >
                    <GuideCover article={a} className="h-[150px] lg:h-[156px]" />
                    <span className="flex flex-col gap-2 p-4 lg:px-5 lg:pt-[18px] lg:pb-5 flex-1">
                      <span className="text-[10.5px] lg:text-[11px] font-bold uppercase tracking-[0.1em] text-accent">{TOPIC_LABEL[a.topic]}</span>
                      <span className="font-[family-name:var(--font-display)] text-[17px] lg:text-[18px] font-bold leading-[1.25] tracking-[-0.02em] group-hover:text-accent text-balance">
                        {a.heading}
                      </span>
                      <span className="text-[13px] leading-[1.55] text-ink-2">Answers: {a.question.charAt(0).toLowerCase() + a.question.slice(1)}</span>
                      <span className="flex flex-wrap items-center gap-x-3 text-[11.5px] lg:text-[12px] text-ink-3 mt-auto pt-1">
                        <time dateTime={a.published}>{shortDate(a.published)}</time>
                        <span aria-hidden>·</span>
                        {/* Counted from the article, not typed in. Nothing on this
                            site claims a number it cannot recompute. */}
                        <span className="tnum">{articleWordCount(a).toLocaleString('en-US')} words</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              {path.length > 0 ? (
                <li>
                  <div className="h-full bg-card-2 sm:bg-[#F8F9FB] border-b border-line sm:border sm:border-dashed sm:border-[#C9D3E6] sm:rounded-[20px] p-5 lg:p-6 flex flex-col gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-3">Start here</span>
                    <span className="font-[family-name:var(--font-display)] text-[17px] lg:text-[18px] font-bold leading-[1.25] tracking-[-0.02em]">
                      New to choosing a broker? Read these {path.length === 3 ? 'three' : path.length}, in this order.
                    </span>
                    <ol className="flex flex-col gap-[10px] mt-1">
                      {path.map((step, i) => (
                        <li key={step.slug}>
                          <Link href={`/learn/${step.slug}`} className="flex items-center gap-[10px] text-[13.5px] font-semibold hover:text-accent">
                            <span aria-hidden className="w-6 h-6 shrink-0 rounded-full bg-accent text-white text-[12px] font-extrabold grid place-items-center">{i + 1}</span>
                            {step.label}
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </div>
                </li>
              ) : null}
            </ul>
          </section>

          <div className="flex flex-col gap-0 sm:gap-[13px] lg:grid lg:grid-cols-2 lg:gap-4">
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
