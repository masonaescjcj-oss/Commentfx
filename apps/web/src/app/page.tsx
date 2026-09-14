import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { pageMetadata, JsonLd, itemListLd } from '@/lib/seo';
import { rankedBrokers, BEST_CRITERIA } from '@/lib/repo';
import { Header, Footer } from '@/components/chrome';
import { Card, CardHead } from '@/components/primitives';
import { BrokerRow } from '@/components/BrokerRow';

export const metadata: Metadata = pageMetadata({
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  path: '/',
});

export const revalidate = 3600;

export default function HomePage() {
  const top = rankedBrokers().slice(0, 5);

  return (
    <>
      <Header />
      <main id="main" className="px-4 pt-4 pb-6 flex flex-col gap-[13px]">
        <section className="px-1">
          <h1 className="font-[family-name:var(--font-display)] text-[27px] font-bold leading-[1.22] tracking-[-0.02em] text-balance">
            Rankings you can check, for brokers, prop firms and exchanges
          </h1>
          <p className="text-[13.5px] text-ink-2 leading-[1.75] mt-[10px] max-w-[48ch]">
            Every score below is built from published weights and licence data checked
            against the regulator’s own register. We take commission from some brokers.
            It does not move anyone up this list.
          </p>
        </section>

        <Card className="p-4">
          <CardHead title="Top brokers" href="/brokers" hrefLabel="Full ranking" />
          {top.map((r) => <BrokerRow key={r.broker.slug} r={r} />)}
          <p className="text-[11.5px] text-ink-3 leading-[1.6] mt-3 pt-[11px] border-t border-line-2">
            Six components, published weights, renormalised when a component has no data
            yet. <Link href="/methodology" className="text-brass font-semibold">How we score</Link>
          </p>
        </Card>

        <Card className="p-4">
          <CardHead title="Ranked by what you care about" />
          <ul className="flex flex-col">
            {BEST_CRITERIA.map((c) => (
              <li key={c.slug} className="border-b border-line-2 last:border-b-0">
                <Link href={`/best/${c.slug}`} className="flex items-center gap-3 py-[11px] group">
                  <span className="flex-1 text-[13.5px] font-semibold group-hover:text-brass">{c.h1}</span>
                  <span aria-hidden className="text-ink-3">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </main>
      <Footer />
      <JsonLd
        graph={[
          itemListLd(
            'Top forex brokers',
            top.map((r) => ({ name: r.broker.name, path: `/brokers/${r.broker.slug}` })),
          ),
        ]}
      />
    </>
  );
}
