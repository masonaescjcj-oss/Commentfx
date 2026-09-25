import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ARTICLES, articleLinks, simulate, type Article, type ArticleBlock, type DrawdownType, type LogoMark } from '@commentfx/core';
import { liveArticle, liveArticles } from '@/lib/records';
import { rankedBrokers, rankedProps, rankedExchanges } from '@/lib/repo';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd, articleLd } from '@/lib/seo';
import { Header, Breadcrumbs, Footer } from '@/components/chrome';
import { Card, CardHead, Logo, Score } from '@/components/primitives';
import { SimulatorPromo, readMinutes } from '@/components/HomeSections';
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
    <section id={id} className="border-t border-line-2 first:border-t-0 pt-7 first:pt-0 mt-7 first:mt-0 lg:pt-9 lg:mt-9">
      {block.heading ? (
        <h2 className="font-[family-name:var(--font-display)] text-[22px] lg:text-[26px] font-bold tracking-[-0.03em] leading-[1.2] mb-3 lg:mb-4 text-balance">
          {block.heading}
        </h2>
      ) : null}

      {block.paragraphs.map((p) => (
        <p key={p} className="text-[16px] lg:text-[16.5px] leading-[1.75] lg:leading-[1.8] text-[#2E3A4E] mb-4 last:mb-0 max-w-[68ch]">
          <Inline text={p} />
        </p>
      ))}

      {block.list ? (
        block.list.ordered ? (
          <ol className="list-decimal pl-5 marker:text-ink-3 marker:text-[14px] marker:font-bold flex flex-col gap-3 mt-4 max-w-[68ch]">
            {block.list.items.map((it) => (
              <li key={it} className="text-[15.5px] lg:text-[16px] leading-[1.75] text-[#2E3A4E] pl-1"><Inline text={it} /></li>
            ))}
          </ol>
        ) : (
          <ul className="flex flex-col mt-5 max-w-[68ch] rounded-[16px] border border-line overflow-hidden">
            {block.list.items.map((it) => (
              <li key={it} className="text-[15px] lg:text-[15.5px] leading-[1.7] text-[#2E3A4E] pl-10 pr-4 py-[14px] relative border-t border-line-2 first:border-t-0">
                <span aria-hidden className="absolute left-4 top-[23px] w-[8px] h-[8px] rounded-full bg-accent" />
                <Inline text={it} />
              </li>
            ))}
          </ul>
        )
      ) : null}

      {block.figure ? (
        /* The diagrams are drawn on the same navy as the hero band, so the frame
           is the picture's own edge rather than a card around it. width/height
           are the file's real pixels: without them the article jumps down the
           screen the moment the image lands, which is the one layout shift a
           reader notices and the one CLS never catches on a fast connection. */
        <figure className="mt-6 -mx-5 sm:mx-0">
          <img
            src={block.figure.src}
            alt={block.figure.alt}
            width={block.figure.w}
            height={block.figure.h}
            loading="lazy"
            decoding="async"
            className="w-full h-auto sm:rounded-[16px] sm:border border-line bg-[#081228] max-w-[68ch] lg:shadow-[0_24px_48px_-28px_rgb(8_18_40_/_0.55)]"
          />
          {block.figure.caption ? (
            <figcaption className="text-[12.5px] text-ink-3 leading-[1.7] mt-[10px] max-w-[68ch] px-5 sm:px-0">
              <Inline text={block.figure.caption} />
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      {block.example ? (
        <figure className="bg-card-2 border border-line rounded-[16px] p-4 lg:p-5 mt-6 max-w-[68ch]">
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

const TOPIC_LABEL = { brokers: 'Brokers', props: 'Prop firms', exchanges: 'Exchanges' } as const;

/**
 * The companies this guide links to, as the ranking has them — so the sidebar
 * can say where each one stands without the reader leaving the guide. Only
 * records the text actually links to; a guide that names none shows none.
 */
function mentioned(a: Article): Array<{ href: string; name: string; logo: LogoMark; score: number; note: string }> {
  const lists = {
    brokers: rankedBrokers().map((r) => ({ slug: r.broker.slug, name: r.broker.name, logo: r.broker.logo, score: r.score.total, rank: r.rank })),
    props: rankedProps().map((r) => ({ slug: r.firm.slug, name: r.firm.name, logo: r.firm.logo, score: r.score.total, rank: r.rank })),
    exchanges: rankedExchanges().map((r) => ({ slug: r.exchange.slug, name: r.exchange.name, logo: r.exchange.logo, score: r.score.total, rank: r.rank })),
  };
  const noun = { brokers: 'brokers', props: 'prop firms', exchanges: 'exchanges' } as const;
  const seen = new Set<string>();
  const out: Array<{ href: string; name: string; logo: LogoMark; score: number; note: string }> = [];
  for (const { path } of articleLinks(a)) {
    const m = /^\/(brokers|props|exchanges)\/([a-z0-9-]+)$/.exec(path);
    if (!m || seen.has(path)) continue;
    const kind = m[1] as keyof typeof lists;
    const hit = lists[kind].find((x) => x.slug === m[2]);
    if (!hit) continue;
    seen.add(path);
    out.push({ href: path, name: hit.name, logo: hit.logo, score: hit.score, note: `#${hit.rank} of ${lists[kind].length} ${noun[kind]}` });
  }
  return out.slice(0, 5);
}

/** The simulator's default trader against the leading prop firm's rules — the same call the front page makes. */
function propPassRates() {
  const lead = rankedProps()[0]!.firm;
  const designs: Array<{ key: DrawdownType; label: string }> = [
    { key: 'static', label: 'Static' },
    { key: 'eod-trailing', label: 'End-of-day' },
    { key: 'intraday-trailing', label: 'Intraday' },
  ];
  const results = designs.map((d) => {
    const s = simulate({
      targetPct: lead.rules.profitTargetPct, dailyPct: lead.rules.dailyDrawdownPct, maxPct: lead.rules.maxDrawdownPct,
      drawdown: d.key, minDays: lead.rules.minTradingDays, timeLimitDays: lead.rules.timeLimitDays,
    }, { riskPct: 1, winRate: 0.4, rewardRisk: 1.5, tradesPerDay: 2 }, 1000, 1);
    return { label: d.label, pct: Math.round((s.counts.passed / s.runs) * 100), own: d.key === lead.rules.drawdownType };
  });
  return { lead, results };
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
  const names = mentioned(a);
  const sim = a.topic === 'props' ? propPassRates() : null;
  const toc = headings.length > 2 ? (
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
  ) : null;

  return (
    <>
      <Header active="/learn" />
      <main id="main" className="pb-6 lg:pb-10">
        {/* The answer first, before the article that explains it — on the band
            itself now, beside the headline, rather than in the first card
            under it. Someone who arrived from a search typed a question, and
            this is the first thing on the page that is not chrome. */}
        <section className="hero">
          <div className="shell pt-4 pb-8 sm:pt-5 sm:pb-9 lg:pt-6 lg:pb-12">
            <Breadcrumbs trail={trail} tone="dark" />
            <div className="lg:flex lg:items-end lg:gap-12 mt-4">
              <div className="lg:flex-1 lg:min-w-0">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[10.5px] lg:text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--hero-accent)] border border-[rgb(127_169_255_/_0.35)] rounded-[7px] px-[9px] py-[3px]">
                    {TOPIC_LABEL[a.topic]}
                  </span>
                  <span className="text-[12px] text-[color:var(--hero-ink-3)] tnum">{readMinutes(a)} min read</span>
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-[29px] sm:text-[36px] lg:text-[46px] font-bold leading-[1.08] tracking-[-0.038em] text-white mt-3 max-w-[20ch] text-balance">
                  {a.heading}
                </h1>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-[12px] lg:text-[12.5px] text-[color:var(--hero-ink-3)]">
                  <span className="text-[color:var(--hero-ink-2)] font-semibold">By {a.author}</span>
                  <span aria-hidden>·</span>
                  <span>Published <time dateTime={a.published}>{asDate(a.published)}</time></span>
                  <span aria-hidden>·</span>
                  <span>Last checked <time dateTime={a.updated}>{asDate(a.updated)}</time></span>
                </p>
              </div>
              <section
                aria-labelledby="short-answer"
                className="mt-6 lg:mt-0 lg:w-[380px] lg:shrink-0 rounded-[18px] lg:rounded-[20px] border border-[color:var(--hero-line)] bg-[linear-gradient(180deg,rgb(255_255_255_/_0.08),rgb(255_255_255_/_0.03))] shadow-[0_30px_60px_-30px_rgb(0_0_0_/_0.7)] p-4 lg:px-[22px] lg:py-5"
              >
                <p className="text-[10.5px] lg:text-[11px] font-bold uppercase tracking-[0.12em] text-[color:var(--hero-accent)]">The short answer</p>
                <h2 id="short-answer" className="text-[14px] font-bold leading-[1.45] text-white mt-2">{a.question}</h2>
                <p className="text-[13.5px] lg:text-[14px] leading-[1.65] text-[color:var(--hero-ink-2)] mt-[6px]">
                  <Inline text={a.answer} />
                </p>
              </section>
            </div>
          </div>
        </section>

        <div className="shell pt-0 sm:pt-[13px] lg:pt-8">
          <div className="guide-grid">
            {toc ? (
              <details className="guide-toc-phone bg-card border-b border-line sm:border sm:rounded-[16px] group/toc">
                <summary className="flex items-center gap-3 px-4 h-[52px] cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="text-ink-2" aria-hidden>
                    <path d="M4 6h16M4 12h10M4 18h13" />
                  </svg>
                  <span className="flex-1 text-[13.5px] font-semibold">On this page <span className="text-ink-3 font-normal">· {headings.length} sections</span></span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" className="text-ink-2 transition-transform group-open/toc:rotate-180" aria-hidden>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <nav aria-label="On this page" className="px-4 pb-2">{toc}</nav>
              </details>
            ) : null}

            <Card className="guide-body p-5 sm:p-6 lg:px-12 lg:py-11" as="article">
              {a.blocks.map((b, i) => <Block key={b.heading ?? `b${i}`} block={b} />)}
            </Card>

            {/* Beside the article on a wide screen, spanning every row the main
                column has, so the contents can stay in view to the end. */}
            <aside className="guide-rail" aria-label="Beside this guide" style={{ gridRow: `1 / span ${sim ? 4 : 3}` }}>
              <div className="guide-rail-inner flex flex-col gap-4">
                {toc ? (
                  <nav aria-label="On this page" className="bg-card border border-line rounded-[20px] px-5 pt-4 pb-2">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3 mb-1">On this page</h2>
                    {toc}
                  </nav>
                ) : null}
                {names.length > 0 ? (
                  <section className="bg-card border border-line rounded-[20px] px-5 pt-4 pb-2">
                    <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3 mb-1">Named in this guide</h2>
                    <ul>
                      {names.map((n) => (
                        <li key={n.href} className="border-t border-line-2 first:border-t-0">
                          <Link href={n.href} className="flex items-center gap-3 py-[10px] group">
                            <Logo {...n.logo} size={30} />
                            <span className="flex-1 min-w-0">
                              <span className="block text-[13px] font-semibold truncate group-hover:text-accent">{n.name}</span>
                              <span className="block text-[11.5px] text-ink-3">{n.note}</span>
                            </span>
                            <Score value={n.score} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            </aside>

            {sim ? (
              <div className="guide-after">
                <SimulatorPromo
                  firm={sim.lead.name}
                  href={`/props/challenge-simulator?firm=${sim.lead.slug}`}
                  results={sim.results}
                  featured={sim.results.find((r) => r.own)?.pct ?? sim.results[0]!.pct}
                />
              </div>
            ) : null}

            <Card className="guide-after p-4 lg:p-6" as="section">
              <CardHead title="Common questions" />
              <Faq items={a.faq} />
            </Card>

            <Card className="guide-after p-4 lg:p-6" as="section">
              <CardHead title="Read next" href="/learn" hrefLabel="All guides" />
              <ul className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-x-8">
                {others.map((o) => (
                  <li key={o.slug} className="border-b border-line-2 last:border-b-0 lg:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                    <Link href={`/learn/${o.slug}`} className="flex items-start gap-3 py-3 group">
                      <span className="flex-1 min-w-0">
                        <span className="block text-[10.5px] font-bold uppercase tracking-[0.1em] text-accent mb-[3px]">{TOPIC_LABEL[o.topic]}</span>
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
        </div>
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail), articleLd(a), faqLd(a.faq)]} />
    </>
  );
}
