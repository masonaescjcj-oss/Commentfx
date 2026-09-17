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
  /**
   * Where this page's canonical should point when it is not its own URL.
   *
   * A comparison exists at both "a-vs-b" and "b-vs-a" — both are linked, both
   * have to work — and they are the same page. Without this they are two URLs
   * competing for one query, which is the shape of duplicate content a new
   * domain can least afford. One direction is canonical and the other says so.
   */
  canonicalPath?: string;
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
    alternates: { canonical: absoluteUrl(seo.canonicalPath ?? seo.path) },
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

/**
 * A ranking page is an ItemList — this is what earns the list rich result.
 *
 * `order` is a parameter because it is a claim. A ranking really is descending
 * by score; a shelf of guides is in no order at all, and saying otherwise in
 * structured data is telling a machine something untrue about the page for the
 * sake of a slightly fuller node.
 */
export const itemListLd = (
  name: string,
  items: Array<{ name: string; path: string }>,
  order: 'descending' | 'unordered' = 'descending',
): Json => ({
  '@type': 'ItemList',
  name,
  numberOfItems: items.length,
  itemListOrder: order === 'descending'
    ? 'https://schema.org/ItemListOrderDescending'
    : 'https://schema.org/ItemListUnordered',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    url: absoluteUrl(it.path),
  })),
});

/**
 * The floor under a published aggregate rating.
 *
 * Google's review-snippet rules do not name a minimum, and one review averaging
 * 5.0 is still both fragile and trivially gameable. Five is the same floor the
 * score uses before a reviews component may enter it, for the same reason.
 */
export const MIN_RATINGS_TO_PUBLISH = 5;

export const financialServiceLd = (b: {
  name: string; slug: string; founded: number;
  /** The mean of EVERY published review, on the 1-5 scale readers gave. */
  reviewAverage: number | null;
  reviewCount: number;
}): Json => ({
  '@type': 'FinancialService',
  '@id': absoluteUrl(`/brokers/${b.slug}#service`),
  name: b.name,
  url: absoluteUrl(`/brokers/${b.slug}`),
  foundingDate: String(b.founded),
  serviceType: 'Online forex and CFD brokerage',
  // Only emit a rating when it is backed by reviews -- an AggregateRating with
  // no reviews behind it is exactly what gets a site's rich results revoked.
  //
  // And it is the REVIEW average, not our composite score. Those are different
  // numbers measuring different things: the composite is our editorial model out
  // of ten, the rating is what customers gave out of five. Publishing the
  // composite under a ratingCount of reviews would claim five people awarded a
  // number none of them chose.
  //
  // And it is every published review, not the subset an editor has verified.
  // Google's rule is that ratings "must originate directly from users" and that
  // "human editors cannot curate local business ratings" -- publishing the mean
  // of the ones we chose to check is curation, however well meant. The verified
  // average is still what the score uses and still what the page shows; it is
  // simply not what we hand to a rich result.
  ...(b.reviewCount >= MIN_RATINGS_TO_PUBLISH && b.reviewAverage !== null
    ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: b.reviewAverage,
          bestRating: 5,
          worstRating: 1,
          ratingCount: b.reviewCount,
        },
      }
    : {}),
});

/**
 * An article, with the publisher named and the dates real.
 *
 * `author` is the Organization rather than a Person, and that is a decision
 * rather than an omission. docs/SEO.md §5.3 asks every article for a named
 * author; the honest way to satisfy it is to put a real person behind the work,
 * and inventing one to fill the slot would be fabricating a credential on a
 * page about where to put money — the exact thing this site is built to catch
 * other people doing. Schema.org allows an Organization here and Google accepts
 * it. When there are people to name, this becomes a Person and /about says who
 * they are.
 */
export const articleLd = (a: {
  slug: string; title: string; description: string;
  published: string; updated: string; author: string;
}): Json => ({
  '@type': 'Article',
  '@id': absoluteUrl(`/learn/${a.slug}#article`),
  mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(`/learn/${a.slug}`) },
  headline: a.title,
  description: a.description,
  datePublished: a.published,
  dateModified: a.updated,
  inLanguage: 'en',
  author: { '@type': 'Organization', name: a.author, url: SITE.url },
  publisher: { '@id': absoluteUrl('/#organization') },
});

/**
 * Our own editorial rating of somebody else's product, which is what a review
 * node is for. `itemReviewed` points at the FinancialService node this page
 * already emits, the author is us, and the date is the day a person last went
 * through the record — so the rating always has a hand and a date behind it.
 *
 * The pros and cons are the generated ones, unchanged. Schema.org takes them as
 * `positiveNotes` and `negativeNotes`, and whether or not a search engine draws
 * them, they are an accurate machine-readable summary of what the page says. A
 * node that repeated the marketing would not be.
 *
 * This is not `aggregateRating`, which stays reserved for what readers gave and
 * has a floor of five ratings under it. One is the house view, the other is the
 * crowd's, and merging them is how a directory launders an opinion into a
 * statistic.
 */
export const reviewLd = (r: {
  slug: string; name: string; score: number; body: string;
  reviewed: string; pros: string[]; cons: string[];
}): Json => ({
  '@type': 'Review',
  '@id': absoluteUrl(`/brokers/${r.slug}#review`),
  itemReviewed: { '@id': absoluteUrl(`/brokers/${r.slug}#service`) },
  name: `${r.name} review`,
  reviewBody: r.body,
  datePublished: r.reviewed,
  author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
  publisher: { '@id': absoluteUrl('/#organization') },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: r.score,
    bestRating: 10,
    worstRating: 0,
  },
  positiveNotes: {
    '@type': 'ItemList',
    itemListElement: r.pros.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })),
  },
  negativeNotes: {
    '@type': 'ItemList',
    itemListElement: r.cons.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })),
  },
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
