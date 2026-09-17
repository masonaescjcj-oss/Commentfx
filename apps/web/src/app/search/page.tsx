import type { Metadata } from 'next';
import { pageMetadata, JsonLd, breadcrumbLd } from '@/lib/seo';
import { searchIndex } from '@/lib/searchIndex';
import { livePatchMap, liveArticles } from '@/lib/records';
import { reviewStats } from '@/lib/reviews';
import { Header, PageHero, Footer, Breadcrumbs } from '@/components/chrome';
import { SiteSearch } from '@/components/SiteSearch';

const TITLE = 'Search — every broker, prop firm and exchange we rank';
const DESC =
  'Search the whole directory: brokers, prop firms, crypto exchanges, head-to-head ' +
  'comparisons and shortlists. The index is in the page, so nothing you type leaves your browser.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/search', noindex: true });

export default async function SearchPage() {
  const [stats, patches, articles] = await Promise.all([reviewStats(), livePatchMap(), liveArticles()]);
  const entries = searchIndex(stats, patches, articles);
  const trail = [{ name: 'Home', path: '/' }, { name: 'Search', path: '/search' }];

  return (
    <>
      <Header />
      <main id="main" className="pb-6 lg:pb-10">
        <PageHero title="Search" trail={trail} />
        <div className="shell pt-3 sm:pt-[13px] lg:pt-4 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">
          <SiteSearch entries={entries} />
        </div>
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
