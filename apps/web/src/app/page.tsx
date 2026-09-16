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

export const metadata: Metadata = pageMetadata({
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  path: '/',
});

export const revalidate = 3600;

export default async function HomePage() {
  const stats = await reviewStats();
  const top = rankedBrokers(stats).slice(0, 5);
  const topProps = rankedProps().slice(0, 3);
  const topExchanges = rankedExchanges().slice(0, 3);

  // The calendar is what brings someone back between broker decisions, so it
  // belongs here. It never throws: a source that did not answer simply means
  // fewer rows, and an empty list drops the card rather than showing an
  // apologetic empty state on the front page.
  const { events } = await calendarData();
  const ahead = upcomingHigh(events, utcDay(new Date()), 4);

  return (
    <>
      <Header />
      <main id="main" className="px-4 pt-4 pb-6 flex flex-col gap-[13px]">
        <h1 className="sr-only">Brokers, prop firms and exchanges, ranked</h1>

        <Card className="p-4">
          <CardHead title="Top brokers" href="/brokers" hrefLabel="Full ranking" />
          {top.map((r) => <BrokerRow key={r.broker.slug} r={r} />)}
          <p className="mt-3 pt-[11px] border-t border-line-2">
            <Link href="/methodology" className="text-[11.5px] text-brass font-semibold">How we score</Link>
          </p>
        </Card>

        <Card className="p-4">
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

        <Card className="p-4">
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

        {ahead.length > 0 && (
          <Card className="p-4">
            <CardHead title="Next, worth planning around" href="/calendar" hrefLabel="Calendar" />
            <ul className="flex flex-col">
              {ahead.map((e) => {
                const release = releaseForTitle(e.title);
                return (
                  <li key={e.id} className="flex items-baseline gap-2 py-[9px] border-b border-line-2 last:border-b-0">
                    {release ? (
                      <Link href={`/calendar/${release.slug}`} className="text-[13px] font-semibold hover:text-brass min-w-0 truncate">
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
          itemListLd('Top forex brokers', top.map((r) => ({ name: r.broker.name, path: `/brokers/${r.broker.slug}` }))),
          itemListLd('Top prop firms', topProps.map((r) => ({ name: r.firm.name, path: `/props/${r.firm.slug}` }))),
          itemListLd('Top crypto exchanges', topExchanges.map((r) => ({ name: r.exchange.name, path: `/exchanges/${r.exchange.slug}` }))),
        ]}
      />
    </>
  );
}
