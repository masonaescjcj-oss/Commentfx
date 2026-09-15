import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { rankedBrokers, rankedProps, rankedExchanges, BEST_CRITERIA, comparePairs, pairSlug } from '@/lib/repo';
import { COIN_INDEX, RELEASES } from '@commentfx/core';

/**
 * Generated from the data, never hand-maintained. Priority reflects how much
 * of the product a page actually represents, not wishful thinking.
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
    { url: absoluteUrl('/search'), lastModified: now, changeFrequency: 'weekly', priority: 0.5 },

    ...brokers.map((r) => ({
      url: absoluteUrl(`/brokers/${r.broker.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...props.map((r) => ({
      url: absoluteUrl(`/props/${r.firm.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...exchanges.map((r) => ({
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

    /**
     * Every coin page, from the checked-in index rather than the live top 100,
     * for two reasons. This function is synchronous, so it could never have
     * awaited a fetch — which is why the site's largest block of pages, and its
     * most searched-for ones, were missing from here entirely. And a sitemap
     * that shrinks to nothing because an upstream was rate-limited the minute it
     * regenerated would be the same bug as the 404s, told to a crawler.
     */
    ...COIN_INDEX.map((c) => ({
      url: absoluteUrl(`/coins/${c.id}`),
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    })),

    ...comparePairs().map(([a, b]) => ({
      url: absoluteUrl(`/compare/${pairSlug(a, b)}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}
