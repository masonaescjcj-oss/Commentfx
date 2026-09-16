import type { Metadata } from 'next';
import { pageMetadata, JsonLd, breadcrumbLd } from '@/lib/seo';
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
      <main id="main" className="shell pt-0 pb-6 lg:pt-3 lg:pb-10 flex flex-col gap-0 lg:gap-4">
        <Breadcrumbs trail={trail} />
        <h1 className="sr-only">Search</h1>

        <SiteSearch entries={entries} />
      </main>
      <Footer />

      {/*
        Breadcrumbs only. This page used to also emit an ItemList of the whole
        directory — 178 entries, twenty kilobytes on every load — and it earned
        nothing. ItemList is for a carousel of one content type; a mixed list of
        brokers, coins, comparisons and utility pages is not one, so no search
        engine has a rich result to give it. And discovery was never the
        argument: every entry is already a real <a href> in the HTML below,
        which is what a crawler actually follows. A structured-data blob is not
        a substitute for a link, and a page that ships one for free is just
        heavier.
      */}
      <JsonLd graph={[breadcrumbLd(trail)]} />
    </>
  );
}
