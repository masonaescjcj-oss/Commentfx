import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { rankedBrokers, rankedProps, rankedExchanges, BEST_CRITERIA, comparePairs, pairSlug } from '@/lib/repo';
import { brokerBySlug, ARTICLES } from '@commentfx/core';
import {
  RELEASES, brokerIndexable, propIndexable, exchangeIndexable, compareIndexable, pathIndexable,
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
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const brokers = rankedBrokers();
  const props = rankedProps();
  const exchanges = rankedExchanges();

  return [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/brokers'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/props'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/exchanges'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/coins'), lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: absoluteUrl('/memecoins'), lastModified: now, changeFrequency: 'hourly', priority: 0.7 },
    { url: absoluteUrl('/status'), lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: absoluteUrl('/calendar'), lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/methodology'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: absoluteUrl('/reviews'), lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: absoluteUrl('/learn'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },

    // The one place on this site where lastModified is a real date rather than
    // "now". An article changes when someone edits it, and the date is in the
    // file; everything above is generated from data that moves on its own, so
    // there is nothing truer than the build to point at yet. See docs/SEO.md §4.
    ...ARTICLES.map((a) => ({
      url: absoluteUrl(`/learn/${a.slug}`),
      lastModified: new Date(`${a.updated}T00:00:00Z`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    ...brokers.filter((r) => brokerIndexable(r.broker).indexable).map((r) => ({
      url: absoluteUrl(`/brokers/${r.broker.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...props.filter((r) => propIndexable(r.firm).indexable).map((r) => ({
      url: absoluteUrl(`/props/${r.firm.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...exchanges.filter((r) => exchangeIndexable(r.exchange).indexable).map((r) => ({
      url: absoluteUrl(`/exchanges/${r.exchange.slug}`),
      lastModified: now,
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
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),

    ...comparePairs()
      .filter(([a, b]) => {
        const left = brokerBySlug(a);
        const right = brokerBySlug(b);
        return Boolean(left && right && compareIndexable(left, right).indexable);
      })
      .map(([a, b]) => ({
        url: absoluteUrl(`/compare/${pairSlug(a, b)}`),
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
  ];
}
