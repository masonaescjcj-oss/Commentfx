import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { rankedBrokers, rankedProps, rankedExchanges, BEST_CRITERIA, comparePairs, pairSlug } from '@/lib/repo';

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
    { url: absoluteUrl('/methodology'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

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

    ...BEST_CRITERIA.map((c) => ({
      url: absoluteUrl(`/best/${c.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
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
