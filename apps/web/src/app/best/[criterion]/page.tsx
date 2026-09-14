import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { pageMetadata, JsonLd, breadcrumbLd, itemListLd } from '@/lib/seo';
import { BEST_CRITERIA, bestCriterion, bestList } from '@/lib/repo';
import { reviewStats } from '@/lib/reviews';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, CardHead } from '@/components/primitives';
import { BrokerRow } from '@/components/BrokerRow';

type Params = { criterion: string };

export function generateStaticParams(): Params[] {
  return BEST_CRITERIA.map((c) => ({ criterion: c.slug }));
}

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { criterion } = await params;
  const c = bestCriterion(criterion);
  if (!c) return {};
  return pageMetadata({ title: c.title, description: c.lead, path: `/best/${c.slug}` });
}

export default async function BestPage({ params }: { params: Promise<Params> }) {
  const { criterion } = await params;
  const c = bestCriterion(criterion);
  if (!c) notFound();

  const list = bestList(c, await reviewStats());
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Brokers', path: '/brokers' },
    { name: c.h1, path: `/best/${c.slug}` },
  ];

  return (
    <>
      <Header active="/brokers" />
      <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
        <Breadcrumbs trail={trail} />
        <header className="px-1">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.22] tracking-[-0.02em] text-balance">
            {c.h1}
          </h1>
          <p className="text-[13.5px] text-ink-2 leading-[1.75] mt-2 max-w-[48ch]">{c.lead}</p>
          <p className="text-[11.5px] text-ink-3 mt-3">
            <b className="text-ink tnum text-[13px]">{list.length}</b> brokers qualify · sorted by {c.metricLabel.toLowerCase()}
          </p>
        </header>

        <Card className="px-4">
          {list.map((r) => (
            <BrokerRow key={r.broker.slug} r={r} extra={{ label: c.metricLabel, value: c.metric(r.broker) }} />
          ))}
        </Card>

        <Card className="p-4">
          <CardHead title="Other ways to rank these brokers" />
          <ul className="flex flex-col">
            {BEST_CRITERIA.filter((x) => x.slug !== c.slug).map((x) => (
              <li key={x.slug} className="border-b border-line-2 last:border-b-0">
                <Link href={`/best/${x.slug}`} className="flex items-center gap-3 py-[11px] group">
                  <span className="flex-1 text-[13.5px] font-semibold group-hover:text-brass">{x.h1}</span>
                  <span aria-hidden className="text-ink-3">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </main>
      <Footer />
      <JsonLd graph={[
        breadcrumbLd(trail),
        itemListLd(c.h1, list.map((r) => ({ name: r.broker.name, path: `/brokers/${r.broker.slug}` }))),
      ]} />
    </>
  );
}
