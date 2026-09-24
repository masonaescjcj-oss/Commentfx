import type { LogoMark } from '@commentfx/core';

/**
 * Sponsored placements.
 *
 * An advertisement on this site is allowed exactly what an advertisement is:
 * space, a logo and the sponsor's own case for itself, marked "Sponsored" where
 * a reader cannot miss it. It is not allowed the things that make the rankings
 * worth reading. A sponsor has no rank and no score, it is kept out of every
 * ranked list, top-eight tile and structured-data list, and its link carries
 * rel="sponsored", which is what Google asks of a paid link and what stops the
 * placement being read as an editorial vote.
 *
 * The facts in a placement are still facts. They are read from the sponsor's
 * own published terms, on the day in `checked`, and they say only what those
 * terms say — an advert that misstated a fee would be a false statement on this
 * site whatever label sat above it.
 */
export interface Sponsor {
  slug: string;
  name: string;
  url: string;
  logo: LogoMark;
  /** The sponsor's case, in its own terms. */
  pitch: string;
  facts: Array<{ label: string; value: string }>;
  /** The ranked list it appears in, and the record it sits after. */
  placement: { list: 'props'; after: string };
  /** The day the facts were read from the sponsor's own pages. */
  checked: string;
  /** Where each fact was read. */
  sources: string[];
}

export const SPONSORS: Sponsor[] = [
  {
    slug: 'propology',
    name: 'Propology',
    url: 'https://propology.trade/',
    logo: { initials: 'PR', bg: '#2B3AE8', fg: '#F2F0E6', img: '/logos/propology.png' },
    pitch:
      'Crypto perpetual futures priced from live Binance market data. One evaluation stage, a published '
      + 'rulebook, and your fee back with your first payout.',
    facts: [
      { label: '$100K challenge', value: '$329' },
      { label: 'Profit split', value: 'up to 90%' },
      { label: 'Payouts', value: 'every 14 days' },
      { label: 'Stages', value: 'one' },
    ],
    placement: { list: 'props', after: 'fundingpips' },
    checked: '2026-09-24',
    sources: ['https://propology.trade/rules/', 'https://propology.trade/pricing/'],
  },
];

export const sponsorsAfter = (list: Sponsor['placement']['list'], slug: string) =>
  SPONSORS.filter((s) => s.placement.list === list && s.placement.after === slug);
