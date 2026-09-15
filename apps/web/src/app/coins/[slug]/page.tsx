import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { pageMetadata, JsonLd, breadcrumbLd, faqLd } from '@/lib/seo';
import { coins, coin, fmtUsd, fmtPct } from '@/lib/market';
import { rankedExchanges, rankedBrokers } from '@/lib/repo';
import { reviewStats } from '@/lib/reviews';
import { Header, Footer, Breadcrumbs } from '@/components/chrome';
import { Card, CardHead, Logo, Score } from '@/components/primitives';
import { FactList } from '@/components/ranking';
import { Sparkline } from '@/components/Sparkline';
import { Unavailable, Freshness } from '@/components/Unavailable';

type Params = { slug: string };

/**
 * Built from the same single upstream call the list uses. If CoinGecko is
 * unreachable at build time this returns empty and no coin pages are emitted —
 * a smaller build, not a failed one, and every page still renders on demand.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const data = await coins();
  return 'error' in data ? [] : data.list.slice(0, 50).map((c) => ({ slug: c.id }));
}

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const view = await coin(slug);
  if (view.state === 'unknown') return {};

  if (view.state === 'unavailable') {
    const { name, symbol } = view.ref;
    return pageMetadata({
      title: `${name} (${symbol}) price, market cap and where to trade it`,
      description:
        `Where to buy and trade ${name} (${symbol}): ranked exchanges and brokers that ` +
        `list it. Live price and market cap are briefly unavailable from our data source.`,
      path: `/coins/${view.ref.id}`,
    });
  }

  const c = view.coin;
  return pageMetadata({
    title: `${c.name} (${c.symbol}) price, market cap and where to trade it`,
    description:
      `${c.name} trades at ${fmtUsd(c.price)}, ${fmtPct(c.change24hPct)} in 24 hours, ` +
      `with a market cap of ${fmtUsd(c.marketCap)}. Ranked exchanges and brokers that list ${c.symbol}.`,
    path: `/coins/${c.id}`,
  });
}

/**
 * The half of this page that has nothing to do with the price feed: which
 * venues we rank, and why. It renders identically whether or not CoinGecko
 * answered, which is the point — an outage should cost the reader the numbers,
 * not the page.
 */
async function WhereToTrade({ symbol }: { symbol: string }) {
  const exchanges = rankedExchanges().slice(0, 4);
  const brokers = rankedBrokers(await reviewStats()).slice(0, 2);
  return (
    <Card className="p-4" as="section">
      <CardHead title={`Where to trade ${symbol}`} href="/exchanges" hrefLabel="All exchanges" />
      <p className="text-[11.5px] text-ink-3 leading-[1.7] mb-2">
        Ordered by our exchange score, which weights evidence that customer funds
        exist above headline fees.
      </p>
      <ul>
        {exchanges.map((e) => (
          <li key={e.exchange.slug} className="border-b border-line-2 last:border-b-0">
            <Link href={`/exchanges/${e.exchange.slug}`} className="flex items-center gap-3 py-[11px] group">
              <Logo {...e.exchange.logo} size={32} />
              <span className="flex-1 min-w-0">
                <span className="block text-[13.5px] font-semibold group-hover:text-brass">{e.exchange.name}</span>
                <span className="block text-[11px] text-ink-3">{e.exchange.takerFeePct}% taker fee</span>
              </span>
              <Score value={e.score.total} />
              <span aria-hidden className="text-ink-3">›</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-3 pt-3 border-t border-line-2">
        <p className="text-[11.5px] text-ink-3 mb-2">Or as a CFD, without custody:</p>
        <ul>
          {brokers.map((b) => (
            <li key={b.broker.slug} className="border-b border-line-2 last:border-b-0">
              <Link href={`/brokers/${b.broker.slug}`} className="flex items-center gap-3 py-[10px] group">
                <Logo {...b.broker.logo} size={28} />
                <span className="flex-1 text-[13px] font-semibold group-hover:text-brass">{b.broker.name}</span>
                <Score value={b.score.total} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export default async function CoinPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const view = await coin(slug);

  /**
   * A 404 says "there is no such page", and that has to stay true of the page
   * and not of this minute's network. This used to call notFound() whenever
   * CoinGecko did not answer, which on a free tier means whenever it feels
   * rate-limited: every coin page on the site went to 404, Bitcoin's included,
   * and once a prerendered page revalidated during the outage the 404 was
   * cached in its place. Same shape as the dynamicParams bug before it — a
   * transient condition deleting a permanent page.
   *
   * So the two cases are now told apart, which is the only reason the
   * checked-in coin index exists. A slug we have never heard of is still a
   * 404. A coin we know, whose numbers we cannot fetch right now, gets its
   * page with the numbers missing and a sentence saying why.
   *
   * It is served as 200, not 503, which would be the honest status for it.
   * Next's App Router gives a page no way to set one, and inventing a 404 to
   * stand in for a 503 is what caused this in the first place. The body says
   * plainly that the data is missing, so nothing on it is untrue.
   */
  if (view.state === 'unknown') notFound();

  const ref = view.state === 'live'
    ? { id: view.coin.id, name: view.coin.name, symbol: view.coin.symbol }
    : view.ref;

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Coins', path: '/coins' },
    { name: ref.name, path: `/coins/${ref.id}` },
  ];

  if (view.state === 'unavailable') {
    return (
      <>
        <Header active="/coins" />
        <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
          <Breadcrumbs trail={trail} />
          <Card className="p-4" as="article">
            <h1 className="font-[family-name:var(--font-display)] text-[22px] font-bold tracking-[-0.025em] leading-tight">
              {ref.name}
            </h1>
            <p className="text-[12px] text-ink-3 tnum">{ref.symbol}</p>
          </Card>
          <Unavailable
            what={`Live data for ${ref.name}`}
            reason={view.reason}
            elsewhere={{
              href: `https://www.coingecko.com/en/coins/${ref.id}`,
              label: `Check ${ref.name} on CoinGecko directly`,
            }}
          />
          <WhereToTrade symbol={ref.symbol} />
        </main>
        <Footer />
        {/* Breadcrumbs only. The FAQ answers quote prices, and a structured
            answer with no number in it is worse than no structured answer. */}
        <JsonLd graph={[breadcrumbLd(trail)]} />
      </>
    );
  }

  const c = view.coin;
  const up = (c.change24hPct ?? 0) >= 0;
  const exchanges = rankedExchanges().slice(0, 4);

  const faq = [
    {
      q: `What is the price of ${c.name} today?`,
      a: `${c.name} (${c.symbol}) is trading at ${fmtUsd(c.price)}, ${fmtPct(c.change24hPct)} over the last 24 hours. Prices come from CoinGecko and refresh every five minutes.`,
    },
    {
      q: `Where can I buy ${c.symbol}?`,
      a: `On any of the exchanges we rank — ${exchanges.map((e) => e.exchange.name).join(', ')} — or as a CFD through a ranked broker. Our exchange ranking weights solvency evidence and security record above fees, because the cheapest venue is not the one you want holding your balance.`,
    },
    {
      q: `What is ${c.name}'s market cap?`,
      a: `${fmtUsd(c.marketCap)}, which places it ${c.rank ? `#${c.rank}` : 'unranked'} by market capitalisation. Circulating supply is ${c.circulating ? c.circulating.toLocaleString('en-US', { maximumFractionDigits: 0 }) : 'unreported'} ${c.symbol}.`,
    },
  ];

  return (
    <>
      <Header active="/coins" />
      <main id="main" className="px-4 pt-3 pb-6 flex flex-col gap-[13px]">
        <Breadcrumbs trail={trail} />

        <Card className="p-4" as="article">
          <div className="flex items-center gap-3">
            <img src={c.image} alt="" width={40} height={40} className="rounded-full shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="font-[family-name:var(--font-display)] text-[22px] font-bold tracking-[-0.025em] leading-tight">
                {c.name}
              </h1>
              <p className="text-[12px] text-ink-3 tnum">{c.symbol}{c.rank ? ` · rank #${c.rank}` : ''}</p>
            </div>
          </div>
          <div className="flex items-end gap-3 mt-4">
            <span className="font-[family-name:var(--font-display)] text-[32px] font-bold tnum leading-none">
              {fmtUsd(c.price)}
            </span>
            <span className={`text-[13px] font-bold tnum px-[9px] py-[3px] rounded-lg text-white ${up ? 'bg-up' : 'bg-down'}`}>
              {up ? '▲' : '▼'} {fmtPct(c.change24hPct)}
            </span>
          </div>
          <div className="mt-4 -mx-1">
            <Sparkline points={c.spark} up={(c.change7dPct ?? c.change24hPct ?? 0) >= 0} w={330} h={78} />
          </div>
          <p className="text-[11px] text-ink-3 mt-1">Seven-day trend</p>
        </Card>

        <Card className="p-4" as="section">
          <CardHead title="Statistics" />
          <FactList rows={[
            ['Market cap', fmtUsd(c.marketCap)],
            ['24h volume', fmtUsd(c.volume24h)],
            ['24h range', `${fmtUsd(c.low24h)} – ${fmtUsd(c.high24h)}`],
            ['7-day change', fmtPct(c.change7dPct)],
            ['Circulating supply', c.circulating ? `${c.circulating.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${c.symbol}` : '—'],
            ['Max supply', c.maxSupply ? c.maxSupply.toLocaleString('en-US', { maximumFractionDigits: 0 }) : 'Uncapped'],
            ['All-time high', `${fmtUsd(c.ath)}${c.athChangePct !== null ? ` (${fmtPct(c.athChangePct)})` : ''}`],
          ]} />
        </Card>

        <WhereToTrade symbol={c.symbol} />

        <Card className="p-4" as="section">
          <CardHead title={`${c.name} — common questions`} />
          <dl>
            {faq.map(({ q, a }) => (
              <div key={q} className="py-3 border-b border-line-2 last:border-b-0">
                <dt className="text-[13.5px] font-semibold mb-[5px]">{q}</dt>
                <dd className="text-[12.5px] text-ink-2 leading-[1.8]">{a}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Freshness at={view.at} source="CoinGecko" />
      </main>
      <Footer />
      <JsonLd graph={[breadcrumbLd(trail), faqLd(faq)]} />
    </>
  );
}
