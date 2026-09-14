import Link from 'next/link';
import type { Metadata } from 'next';
import { pageMetadata, JsonLd, breadcrumbLd, itemListLd } from '@/lib/seo';
import { coins, fmtUsd, fmtPct } from '@/lib/market';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card } from '@/components/primitives';
import { RankingIntro } from '@/components/ranking';
import { Sparkline } from '@/components/Sparkline';
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
      <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
        <Breadcrumbs trail={trail} />
        {'error' in data ? (
          <>
            <RankingIntro title={TITLE} lead={DESC} count={0} unit="coins" />
            <Unavailable what="Market data" reason={data.error} />
          </>
        ) : (
          <>
            <RankingIntro title={TITLE} lead={DESC} count={data.list.length} unit="coins" sortedBy="market cap" />
            <Card className="px-4">
              {data.list.map((c) => {
                const up = (c.change24hPct ?? 0) >= 0;
                return (
                  <article key={c.id} className="flex items-center gap-[10px] py-[11px] border-b border-line-2 last:border-b-0">
                    <span className="w-6 shrink-0 text-center tnum text-[12px] text-ink-3">{c.rank ?? '—'}</span>
                    {/* Upstream logo, sized to prevent layout shift. */}
                    <img src={c.image} alt="" width={28} height={28} loading="lazy" decoding="async" className="rounded-full shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-[13.5px] font-semibold leading-tight">
                        <Link href={`/coins/${c.id}`} className="hover:text-brass">{c.name}</Link>
                      </h3>
                      <p className="text-[11px] text-ink-3 tnum">{c.symbol}</p>
                    </div>
                    <div className="flex-1" />
                    <Sparkline points={c.spark} up={(c.change7dPct ?? c.change24hPct ?? 0) >= 0} />
                    <div className="text-right min-w-[86px]">
                      <p className="text-[13.5px] font-bold tnum leading-tight">{fmtUsd(c.price)}</p>
                      <p className={`text-[11.5px] font-bold tnum ${up ? 'text-up' : 'text-down'}`}>{fmtPct(c.change24hPct)}</p>
                    </div>
                  </article>
                );
              })}
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
