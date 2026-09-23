import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { rankedBrokers, rankedProps, rankedExchanges, BEST_CRITERIA, comparePairs, propComparePairs, canonicalPairSlug, patchKey } from '@/lib/repo';
import { brokerBySlug, propBySlug } from '@commentfx/core';
import { livePatchMap, liveArticles } from '@/lib/records';
import {
  RELEASES, brokerIndexable, propIndexable, exchangeIndexable, compareIndexable, propCompareIndexable, pathIndexable,
  recordRevised, latestDay,
} from '@commentfx/core';

/**
 * Generated from the data, never hand-maintained, and gated by the same policy
 * the pages themselves carry.
 *
 * A sitemap is a list of pages we are asking to have indexed, so a URL that
 * carries noindex has no business being in it — Google reports that pair as an
 * error, and rightly: it is us asking and refusing in the same breath. Both
 * sides read indexing.ts, so they cannot come to disagree.
 *
 * The hundred coin pages are what left. They are still served and still linked;
 * they are not asking to compete with the source of the prices they show. See
 * docs/SEO.md §3.
 */
/**
 * Regenerated rather than frozen at build.
 *
 * It reads the same merged view the pages do, and an article or a record added
 * through the admin is on the site the moment it is published. A sitemap
 * prerendered once and never again would list what the site had at deploy time
 * and keep saying so — the one file whose whole job is to be current.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  // The same merged view the pages render, so a record or an article added
  // through the admin is asked to be indexed and one taken down stops being.
  // A sitemap generated from the code while the site serves something else is
  // a sitemap that is wrong about the site.
  const [patches, articles] = await Promise.all([livePatchMap(), liveArticles()]);
  const brokers = rankedBrokers(undefined, patches);
  const props = rankedProps(patches);
  const exchanges = rankedExchanges(patches);

  /**
   * lastmod, from the day a page last actually changed.
   *
   * Every entry used to say `now`, and this map regenerates hourly — so every
   * page on the site claimed to have changed within the hour, every hour.
   * Google uses lastmod only while it is consistently accurate, and a sitemap
   * where everything is always new is one it stops believing (docs/SEO.md
   * §4.3). A record's page changes when its research or its correction does;
   * a comparison or a hub when any record in it does; the front page when
   * anything under it does.
   *
   * Three kinds of page get something else. The price and calendar pages are
   * rebuilt from live feeds, so `now` is the truth there. Pages driven by
   * reader reports, and the methodology, about and privacy pages, have no date
   * anything here records — they get no lastmod, which Google treats as
   * "decide for yourself". Absent is never wrong; a guessed date is.
   */
  const at = (d: string | null) => (d ? { lastModified: new Date(`${d}T00:00:00Z`) } : {});
  // A record edited through the admin changed on the day the edit went live,
  // whatever its research date says.
  const edited = (kind: 'broker' | 'prop' | 'exchange', slug: string) => patches.get(patchKey(kind, slug))?.at;
  const brokerDay = (slug: string) => latestDay([recordRevised('broker', slug), edited('broker', slug)]);
  const propDay = (slug: string) => latestDay([recordRevised('prop', slug), edited('prop', slug)]);
  const exchangeDay = (slug: string) => latestDay([recordRevised('exchange', slug), edited('exchange', slug)]);

  const brokersDay = latestDay(brokers.map((r) => brokerDay(r.broker.slug)));
  const propsDay = latestDay(props.map((r) => propDay(r.firm.slug)));
  const exchangesDay = latestDay(exchanges.map((r) => exchangeDay(r.exchange.slug)));
  const articlesDay = latestDay(articles.map((a) => a.updated));
  const siteDay = latestDay([brokersDay, propsDay, exchangesDay, articlesDay]);

  return [
    { url: absoluteUrl('/'), ...at(siteDay), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/brokers'), ...at(brokersDay), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/props'), ...at(propsDay), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/exchanges'), ...at(exchangesDay), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/coins'), lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: absoluteUrl('/memecoins'), lastModified: now, changeFrequency: 'hourly', priority: 0.7 },
    { url: absoluteUrl('/status'), changeFrequency: 'hourly', priority: 0.8 },
    { url: absoluteUrl('/calendar'), lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/methodology'), changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/about'), changeFrequency: 'monthly', priority: 0.7 },
    { url: absoluteUrl('/privacy'), changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/reviews'), changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/learn'), ...at(articlesDay), changeFrequency: 'weekly', priority: 0.7 },

    // An article changes when someone edits it, and the date is in the file.
    ...articles.map((a) => ({
      url: absoluteUrl(`/learn/${a.slug}`),
      lastModified: new Date(`${a.updated}T00:00:00Z`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    ...brokers.filter((r) => brokerIndexable(r.broker).indexable).map((r) => ({
      url: absoluteUrl(`/brokers/${r.broker.slug}`),
      ...at(brokerDay(r.broker.slug)),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...props.filter((r) => propIndexable(r.firm).indexable).map((r) => ({
      url: absoluteUrl(`/props/${r.firm.slug}`),
      ...at(propDay(r.firm.slug)),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...exchanges.filter((r) => exchangeIndexable(r.exchange).indexable).map((r) => ({
      url: absoluteUrl(`/exchanges/${r.exchange.slug}`),
      ...at(exchangeDay(r.exchange.slug)),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...RELEASES.map((r) => ({
      url: absoluteUrl(`/calendar/${r.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),

    ...BEST_CRITERIA.map((c) => ({
      url: absoluteUrl(`/best/${c.slug}`),
      ...at(brokersDay),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),

    ...uniquePairs(
      comparePairs()
        .filter(([a, b]) => {
          const left = brokerBySlug(a);
          const right = brokerBySlug(b);
          return Boolean(left && right && compareIndexable(left, right).indexable);
        })
        .map(([a, b]) => ({
          url: absoluteUrl(`/compare/${canonicalPairSlug(a, b)}`),
          day: latestDay([brokerDay(a), brokerDay(b)]),
        })),
    ).map(({ url, day }) => ({ url, ...at(day), changeFrequency: 'weekly' as const, priority: 0.6 })),

    ...uniquePairs(
      propComparePairs()
        .filter(([a, b]) => {
          const left = propBySlug(a);
          const right = propBySlug(b);
          return Boolean(left && right && propCompareIndexable(left, right).indexable);
        })
        .map(([a, b]) => ({
          url: absoluteUrl(`/props/compare/${canonicalPairSlug(a, b)}`),
          day: latestDay([propDay(a), propDay(b)]),
        })),
    ).map(({ url, day }) => ({ url, ...at(day), changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}

/**
 * Both directions of a comparison are linked and both answer, but they are one
 * page and the canonical says so — so the map lists each once. Without this
 * every pair appeared twice under the same URL, which is the sort of thing a
 * sitemap is supposed to be the fix for rather than the source.
 */
function uniquePairs<T extends { url: string }>(pairs: T[]): T[] {
  const seen = new Set<string>();
  return pairs.filter((p) => (seen.has(p.url) ? false : (seen.add(p.url), true)));
}
