import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { pageMetadata, JsonLd, itemListLd } from '@/lib/seo';
import { rankedBrokers, rankedProps, rankedExchanges, BEST_CRITERIA } from '@/lib/repo';
import { Header, Footer } from '@/components/chrome';
import { Card, CardHead } from '@/components/primitives';
import { BrokerRow } from '@/components/BrokerRow';
import { RankRow } from '@/components/ranking';
import { describeDrawdown, volumeBand, utcDay, releaseForTitle } from '@commentfx/core';
import { calendarData, upcomingHigh } from '@/lib/calendar';
import { reviewStats } from '@/lib/reviews';
import { coins } from '@/lib/market';
import { news } from '@/lib/news';
import { CoinRow, MoverChip, movers } from '@/components/CoinRow';
import { NewsList } from '@/components/NewsList';
import { Hero } from '@/components/Hero';
import { registerCoverage } from '@/lib/register-coverage';

export const metadata: Metadata = pageMetadata({
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  path: '/',
});

export const revalidate = 900;

export default async function HomePage() {
  const stats = await reviewStats();
  const top = rankedBrokers(stats).slice(0, 5);
  const topProps = rankedProps().slice(0, 3);
  const topExchanges = rankedExchanges().slice(0, 3);

  // Three live upstreams, asked at once rather than one after another: they do
  // not depend on each other, and in series their latencies add up on every
  // revalidation. None of them throws — a source that did not answer means
  // fewer rows or a dropped card, never a broken front page, which is the whole
  // reason this site can be built on free tiers at all.
  const [calendar, market, headlines] = await Promise.all([
    calendarData(),
    coins(),
    news(6),
  ]);

  const ahead = upcomingHigh(calendar.events, utcDay(new Date()), 4);
  const topCoins = 'error' in market ? [] : market.list.slice(0, 5);
  const { gainers, losers } = 'error' in market ? { gainers: [], losers: [] } : movers(market.list);

  // Counted from the data rather than written into the hero, for the reason
  // register-coverage.ts exists: a number typed into a headline is a claim that
  // goes stale the day a record is added, and the footer already made exactly
  // that mistake once.
  const coverage = registerCoverage();

  return (
    <>
      <Header />
      {/* The shell is on the inner wrapper rather than on <main>, so the hero
          can be the width of the window while everything under it keeps the
          measure. */}
      <main id="main">
        <Hero licences={{ checked: coverage.licencesChecked, total: coverage.licencesTotal }} />

        <div className="shell pt-0 pb-6 sm:pt-5 lg:pt-7 lg:pb-10 flex flex-col gap-0 sm:gap-[13px] lg:gap-4">

        {/* Two columns above 1024px: the rankings, which are what this site is
            for, and beside them the market data that changes during the day.
            The wrappers are here at every width, so a phone still reads them in
            this order down one column. */}
        <div className="split">
          <div>

          <Card className="p-4 lg:p-6">
            <CardHead title="Top brokers" href="/brokers" hrefLabel="Full ranking" />
            {top.map((r) => <BrokerRow key={r.broker.slug} r={r} />)}
            <p className="mt-3 pt-[11px] border-t border-line-2">
              <Link href="/methodology" className="text-[11.5px] text-accent font-semibold">How we score</Link>
            </p>
          </Card>

          <Card className="p-4 lg:p-6">
            <CardHead title="Top prop firms" href="/props" hrefLabel="Full ranking" />
            {topProps.map((r) => (
              <RankRow key={r.firm.slug} rank={r.rank} href={`/props/${r.firm.slug}`}
                logo={r.firm.logo} name={r.firm.name} score={r.score.total} why={r.firm.why}
                facts={[
                  { label: 'Drawdown', value: describeDrawdown(r.firm.rules.drawdownType),
                    tone: r.firm.rules.drawdownType === 'static' ? 'good' : r.firm.rules.drawdownType === 'intraday-trailing' ? 'bad' : 'warn' },
                  { label: 'Fee', value: `$${r.firm.feeUsdPer100k}` },
                  { label: 'Split', value: `${r.firm.payout.splitPct}%` },
                ]} />
            ))}
          </Card>

          <Card className="p-4 lg:p-6">
            <CardHead title="Top exchanges" href="/exchanges" hrefLabel="Full ranking" />
            {topExchanges.map((r) => (
              <RankRow key={r.exchange.slug} rank={r.rank} href={`/exchanges/${r.exchange.slug}`}
                logo={r.exchange.logo} name={r.exchange.name} score={r.score.total} why={r.exchange.why}
                facts={[
                  { label: 'Taker', value: `${r.exchange.takerFeePct}%` },
                  { label: 'Volume', value: volumeBand(r.exchange.spotVolumeUsd) },
                  { label: 'Breach', value: r.exchange.security.lastBreachYear === null ? 'None' : String(r.exchange.security.lastBreachYear),
                    tone: r.exchange.security.lastBreachYear === null ? 'good' : r.exchange.security.madeUsersWhole ? 'warn' : 'bad' },
                ]} />
            ))}
          </Card>

          <Card className="p-4 lg:p-6">
            <CardHead title="Ranked by what you care about" />
            <ul className="flex flex-col">
              {BEST_CRITERIA.map((c) => (
                <li key={c.slug} className="border-b border-line-2 last:border-b-0">
                  <Link href={`/best/${c.slug}`} className="flex items-center gap-3 py-[11px] group">
                    <span className="flex-1 text-[13.5px] font-semibold group-hover:text-accent">{c.h1}</span>
                    <span aria-hidden className="text-ink-3">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          </div>

          <div>
          {topCoins.length > 0 && (
            <Card className="px-4 lg:px-6 pt-4" as="section">
              <CardHead title="Coin prices" href="/coins" hrefLabel="Top 100" />
              {topCoins.map((c) => <CoinRow key={c.id} c={c} />)}
            </Card>
          )}

          {/* Both directions, never only the winners. A board of gainers alone is
              an advertisement; the same board with the day's falls next to it is
              a market. Below $10m of daily volume nothing qualifies, because one
              trade can move a thin coin 300% and that is noise wearing a signal's
              clothes. */}
          {(gainers.length > 0 || losers.length > 0) && (
            <Card className="p-4 lg:p-6" as="section">
              <CardHead title="Biggest moves today" href="/coins" hrefLabel="All coins" />
              <div className="grid grid-cols-2 gap-x-3 gap-y-[6px]">
                <div className="flex flex-col gap-[6px]">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-ink-3">Up</p>
                  {gainers.map((c) => <MoverChip key={c.id} c={c} />)}
                </div>
                <div className="flex flex-col gap-[6px]">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-ink-3">Down</p>
                  {losers.map((c) => <MoverChip key={c.id} c={c} />)}
                </div>
              </div>
            </Card>
          )}

          {/* The headlines are the publishers' own, linking straight out to them.
              Four newsrooms have to go quiet at once for this card to disappear,
              which is why there is no apologetic empty state under it. */}
          {'error' in headlines ? null : headlines.items.length > 0 && (
            <Card className="px-4 lg:px-6 pt-4" as="section">
              <CardHead title="Crypto news" />
              <NewsList items={headlines.items} />
            </Card>
          )}

          {ahead.length > 0 && (
            <Card className="p-4 lg:p-6">
              <CardHead title="Next, worth planning around" href="/calendar" hrefLabel="Calendar" />
              <ul className="flex flex-col">
                {ahead.map((e) => {
                  const release = releaseForTitle(e.title);
                  return (
                    <li key={e.id} className="flex items-baseline gap-2 py-[9px] border-b border-line-2 last:border-b-0">
                      {release ? (
                        <Link href={`/calendar/${release.slug}`} className="text-[13px] font-semibold hover:text-accent min-w-0 truncate">
                          {e.title}
                        </Link>
                      ) : (
                        <span className="text-[13px] font-semibold min-w-0 truncate">{e.title}</span>
                      )}
                      <span className="text-[10.5px] font-bold text-ink-3">{e.currency}</span>
                      <div className="flex-1" />
                      <time dateTime={e.at ?? e.date} className="text-[12px] tnum text-ink-2 shrink-0">
                        {new Date(`${e.date}T00:00:00Z`).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', timeZone: 'UTC',
                        })}
                        {e.localTime ? ` · ${e.localTime}` : ''}
                      </time>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
          </div>
        </div>
        </div>
      </main>
      <Footer />
      <JsonLd
        graph={[
          itemListLd('Top forex brokers', top.map((r) => ({ name: r.broker.name, path: `/brokers/${r.broker.slug}` }))),
          itemListLd('Top prop firms', topProps.map((r) => ({ name: r.firm.name, path: `/props/${r.firm.slug}` }))),
          itemListLd('Top crypto exchanges', topExchanges.map((r) => ({ name: r.exchange.name, path: `/exchanges/${r.exchange.slug}` }))),
        ]}
      />
    </>
  );
}
