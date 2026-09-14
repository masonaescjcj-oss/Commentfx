import type { Metadata } from 'next';
import { pageMetadata, JsonLd, breadcrumbLd, itemListLd } from '@/lib/seo';
import { searchIndex } from '@/lib/searchIndex';
import { reviewStats } from '@/lib/reviews';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { SiteSearch } from '@/components/SiteSearch';

const TITLE = 'Search — every broker, prop firm and exchange we rank';
const DESC =
  'Search the whole directory: brokers, prop firms, crypto exchanges, head-to-head ' +
  'comparisons and shortlists. The index is in the page, so nothing you type leaves your browser.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/search' });

export default async function SearchPage() {
  const entries = searchIndex(await reviewStats());
  const trail = [{ name: 'Home', path: '/' }, { name: 'Search', path: '/search' }];

  return (
    <>
      <Header />
      <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
        <Breadcrumbs trail={trail} />
        <header className="px-1">
          <h1 className="font-[family-name:var(--font-display)] text-[26px] font-bold leading-[1.22] tracking-[-0.02em]">
            Search
          </h1>
          <p className="text-[13.5px] text-ink-2 leading-[1.75] mt-2 max-w-[48ch]">
            Everything we publish, on one page. What you type stays in your browser —
            there is no search request, and nothing is logged.
          </p>
        </header>

        <SiteSearch entries={entries} />
      </main>
      <Footer />

      <JsonLd
        graph={[
          breadcrumbLd(trail),
          itemListLd(TITLE, entries.map((e) => ({ name: e.title, path: e.path }))),
        ]}
      />
    </>
  );
}
