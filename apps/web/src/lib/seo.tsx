import type { Metadata } from 'next';
import { SITE, absoluteUrl } from './site';

interface PageSeo {
  title: string;
  description: string;
  /** Path only, e.g. "/brokers/exness". Becomes the canonical. */
  path: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  /** Filtered or paginated views point their canonical at the clean URL. */
  noindex?: boolean;
}

/**
 * Every page goes through here so canonical, OG and Twitter can never drift
 * apart, and so no page ships without a description.
 */
export function pageMetadata(seo: PageSeo): Metadata {
  const url = absoluteUrl(seo.path);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    robots: seo.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    openGraph: {
      type: seo.type ?? 'website',
      url,
      siteName: SITE.name,
      title: seo.title,
      description: seo.description,
      locale: SITE.locale,
      ...(seo.publishedTime ? { publishedTime: seo.publishedTime } : {}),
      ...(seo.modifiedTime ? { modifiedTime: seo.modifiedTime } : {}),
      ...(seo.authors ? { authors: seo.authors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      site: SITE.twitter,
    },
  };
}

/* ────────────────────────── structured data ────────────────────────── */

type Json = Record<string, unknown>;

export const organizationLd = (): Json => ({
  '@type': 'Organization',
  '@id': absoluteUrl('/#organization'),
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  foundingDate: '2026',
});

export const websiteLd = (): Json => ({
  '@type': 'WebSite',
  '@id': absoluteUrl('/#website'),
  url: SITE.url,
  name: SITE.name,
  description: SITE.description,
  publisher: { '@id': absoluteUrl('/#organization') },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: absoluteUrl('/search?q={search_term_string}') },
    'query-input': 'required name=search_term_string',
  },
});

export const breadcrumbLd = (trail: Array<{ name: string; path: string }>): Json => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    item: absoluteUrl(t.path),
  })),
});

/** A ranking page is an ItemList — this is what earns the list rich result. */
export const itemListLd = (
  name: string,
  items: Array<{ name: string; path: string }>,
): Json => ({
  '@type': 'ItemList',
  name,
  numberOfItems: items.length,
  itemListOrder: 'https://schema.org/ItemListOrderDescending',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    url: absoluteUrl(it.path),
  })),
});

export const financialServiceLd = (b: {
  name: string; slug: string; founded: number; score: number; reviewCount: number;
}): Json => ({
  '@type': 'FinancialService',
  '@id': absoluteUrl(`/brokers/${b.slug}#service`),
  name: b.name,
  url: absoluteUrl(`/brokers/${b.slug}`),
  foundingDate: String(b.founded),
  serviceType: 'Online forex and CFD brokerage',
  // Only emit a rating when it is backed by reviews — an AggregateRating with
  // no reviews behind it is exactly what gets a site's rich results revoked.
  ...(b.reviewCount > 0
    ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: b.score,
          bestRating: 10,
          worstRating: 0,
          ratingCount: b.reviewCount,
        },
      }
    : {}),
});

export const faqLd = (qa: Array<{ q: string; a: string }>): Json => ({
  '@type': 'FAQPage',
  mainEntity: qa.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});

/** One <script> per page holding an @graph of every node — cleaner than many. */
export function JsonLd({ graph }: { graph: Json[] }) {
  const payload = { '@context': 'https://schema.org', '@graph': graph };
  return (
    <script
      type="application/ld+json"
      // Structured data is generated here, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, '\\u003c') }}
    />
  );
}
