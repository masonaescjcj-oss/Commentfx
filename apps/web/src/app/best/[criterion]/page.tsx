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
/**
 * Deliberately NOT `dynamicParams = false`.
 *
 * Every known slug is prerendered by generateStaticParams above, and an unknown
 * one is caught by the notFound() below — so refusing dynamic params bought
 * nothing, and it cost something severe: revalidatePath() from a server action
 * purges the prerendered entry, and with no fallback allowed Next could not
 * regenerate it. Writing a review or reporting an outage took that company's
 * page down with a permanent 404 (`Internal: NoFallbackError`). Found by
 * driving the real form in a browser; no unit test can see this, because it is
 * a property of the rendering runtime rather than of our code.
 */

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
      <main id="main" className="shell pt-0 pb-6 sm:pt-3 lg:pb-10 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
        <Breadcrumbs trail={trail} />
        <h1 className="sr-only">{c.h1}</h1>

        <Card className="px-4 lg:px-6">
          {list.map((r) => (
            <BrokerRow headingLevel={2} key={r.broker.slug} r={r} extra={{ label: c.metricLabel, value: c.metric(r.broker) }} />
          ))}
        </Card>

        <Card className="p-4 lg:p-6">
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
