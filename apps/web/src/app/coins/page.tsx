import Link from 'next/link';
import type { Metadata } from 'next';
import { pageMetadata, JsonLd, breadcrumbLd, itemListLd } from '@/lib/seo';
import { coins } from '@/lib/market';
import { COIN_INDEX } from '@commentfx/core';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card } from '@/components/primitives';
import { RankingIntro } from '@/components/ranking';
import { CoinRow } from '@/components/CoinRow';
import { Unavailable, Freshness } from '@/components/Unavailable';

const TITLE = 'Cryptocurrency prices by market cap';
const DESC =
  'Live prices, market capitalisation and seven-day trend for the top 100 ' +
  'cryptocurrencies, with the exchanges and brokers you can trade each one on.';

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESC, path: '/coins' });
export const revalidate = 300;

export default async function CoinsPage() {
  const data = await coins();
  const trail = [{ name: 'Home', path: '/' }, { name: 'Coins', path: '/coins' }];

  return (
    <>
      <Header active="/coins" />
      <main id="main" className="shell pt-0 pb-6 lg:pt-3 lg:pb-10 flex flex-col gap-0 lg:gap-4">
        <Breadcrumbs trail={trail} />
        {'error' in data ? (
          <>
            <RankingIntro title={TITLE} />
            <Unavailable
              what="Market data"
              reason={data.error}
              elsewhere={{ href: 'https://www.coingecko.com/', label: 'Check CoinGecko directly' }}
            />
            {/* The prices are gone; the coverage is not. Without this the page
                loses every link to a coin during an outage, which would make
                the honest coin pages behind them unreachable by anyone who was
                browsing rather than arriving from a search result. Names only —
                there is no number here to be stale about. */}
            <Card className="px-4">
              {COIN_INDEX.map((c) => (
                <article key={c.id} className="flex items-center gap-[10px] py-[11px] border-b border-line-2 last:border-b-0">
                  <div className="min-w-0">
                    <h2 className="text-[13.5px] font-semibold leading-tight">
                      <Link href={`/coins/${c.id}`} className="hover:text-brass">{c.name}</Link>
                    </h2>
                    <p className="text-[11px] text-ink-3 tnum">{c.symbol}</p>
                  </div>
                </article>
              ))}
            </Card>
          </>
        ) : (
          <>
            <RankingIntro title={TITLE} />
            <Card className="px-4">
              {data.list.map((c) => <CoinRow key={c.id} c={c} rank />)}
            </Card>
            <Freshness at={data.at} source="CoinGecko" />
          </>
        )}
      </main>
      <Footer />
      <JsonLd graph={[
        breadcrumbLd(trail),
        ...('error' in data ? [] : [itemListLd(TITLE, data.list.slice(0, 25).map((c) => ({ name: c.name, path: `/coins/${c.id}` })))]),
      ]} />
    </>
  );
}
