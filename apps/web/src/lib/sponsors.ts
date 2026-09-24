import type { LogoMark } from '@commentfx/core';

/**
 * Sponsored placements.
 *
 * An advertisement on this site is allowed exactly what an advertisement is:
 * space, a logo, a page of the sponsor's own published terms, and the sponsor's
 * own case for itself — all marked "Sponsored" where a reader cannot miss it.
 * It is not allowed the things that make the rankings worth reading. A sponsor
 * has no rank, no score and no verdict; it is kept out of every ranked list,
 * every top-eight tile and every structured-data list; and every link from it
 * to the sponsor carries rel="sponsored", which is what Google asks of a paid
 * link and what stops the placement being read as an editorial vote.
 *
 * The facts in a placement are still facts. They are read from the sponsor's
 * own published terms, on the day in `checked`, and say only what those terms
 * say — an advert that misstated a fee would be a false statement on this site
 * whatever label sat above it. Where the sponsor's own pages disagree with each
 * other, the listing follows the document that governs an account.
 */
export interface Sponsor {
  slug: string;
  name: string;
  url: string;
  logo: LogoMark;
  /** The sponsor's case, in its own terms. */
  pitch: string;
  /** The short version, for a tile. */
  from: { price: string; account: string };
  /** What the firm is and what it costs, for the page and its meta description. */
  description: string;
  about: string;
  /** Where it appears. */
  placement: { list: 'props'; slot: 'under-top-eight' };
  /** The day the facts were read from the sponsor's own pages. */
  checked: string;
  /** Where each fact was read. */
  sources: Array<{ label: string; url: string }>;
  /** The questions a search for the sponsor's name is asking, answered from its own terms. */
  faq: Array<{ q: string; a: string }>;
  listing: {
    plans: Array<{ account: string; fee: string; listFee: string; leverage: string; split: string }>;
    plansNote: string;
    rules: Array<[string, string]>;
    payouts: Array<[string, string]>;
    trading: Array<[string, string]>;
  };
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
    from: { price: '$18', account: '$2K' },
    description:
      'Propology: one-stage crypto prop challenges on live Binance data. $2K from $18, $100K for $329, up '
      + 'to 90% profit split, payouts every 14 days, fee refunded with the first payout.',
    about:
      'Propology runs single-stage evaluations on crypto perpetual futures — BTC, ETH, SOL, BNB and XRP on '
      + 'every plan — priced from live Binance market data, on its own trading terminal with API access. '
      + 'Challenges run from $18 for a $2,000 account to $549 for $200,000, with $329 for $100,000. Every size '
      + 'has the same 8% profit target, 3% daily and 10% total loss limits, and pays out every 14 days at 80% '
      + 'to 90% depending on the account. The evaluation fee is refunded with the first payout, and a trader '
      + 'who misses the target without breaching a limit gets a free retry.',
    placement: { list: 'props', slot: 'under-top-eight' },
    checked: '2026-09-24',
    sources: [
      { label: 'Trading rules, v3.2 (13 September 2026)', url: 'https://propology.trade/rules/' },
      { label: 'Pricing', url: 'https://propology.trade/pricing/' },
    ],
    faq: [
      {
        q: 'How much does a Propology challenge cost?',
        a: 'From $18 for a $2,000 account to $549 for $200,000, paid once; $329 for $100,000. The fee is '
          + 'refunded with the first payout. Prices as shown on its pricing page on 24 September 2026, '
          + 'confirmed at checkout.',
      },
      {
        q: 'What is the Propology profit target?',
        a: '8% on every account size, in a single stage with no verification phase. It counts only once '
          + 'realised, with no position open, and at least five trading days are needed to pass.',
      },
      {
        q: 'How does the Propology drawdown work?',
        a: 'Two limits, both measured on equity including open positions. A daily limit of 3% below '
          + 'equity at 00:00 UTC, and a total limit of 10% of the starting balance as a fixed amount, whose '
          + 'floor follows the end-of-day balance upward and never moves back down.',
      },
      {
        q: 'How and when does Propology pay out?',
        a: 'The first payout can be requested after 14 days on a funded account, then every 14 days, paid in '
          + 'USDT on Ethereum, Arbitrum or Tron within 72 hours of approval. The split is 80% up to $50,000, '
          + '85% on $100,000 and 90% on $200,000.',
      },
      {
        q: 'What can you trade on Propology?',
        a: 'USDⓈ-M perpetual futures priced from live Binance market data — BTC, ETH, SOL, BNB and XRP on '
          + 'every plan — on its own terminal or through its API, around the clock including weekends.',
      },
      {
        q: 'Does Propology have a time limit?',
        a: 'Yes: the evaluation has to be passed within 30 days of the first trade. A trader who runs out of '
          + 'time without breaching a limit gets a free retry.',
      },
    ],
    listing: {
      plans: [
        { account: '$2K', fee: '$18', listFee: '$26', leverage: '250x', split: '80%' },
        { account: '$10K', fee: '$79', listFee: '$119', leverage: '250x', split: '80%' },
        { account: '$25K', fee: '$149', listFee: '$249', leverage: '128x', split: '80%' },
        { account: '$50K', fee: '$209', listFee: '$389', leverage: '64x', split: '80%' },
        { account: '$100K', fee: '$329', listFee: '$679', leverage: '40x', split: '85%' },
        { account: '$200K', fee: '$549', listFee: '$1,299', leverage: '20x', split: '90%' },
      ],
      plansNote:
        'One-time fees as Propology’s pricing page showed them on 24 September 2026, against the list price '
        + 'it strikes through; its page says figures are confirmed at checkout. Targets and loss limits are '
        + 'the same on every size.',
      rules: [
        ['Stages', 'One — no verification phase'],
        ['Profit target', '8%, realised with no position open'],
        ['Daily loss limit', '3% below equity at 00:00 UTC'],
        ['Total loss limit', '10% of starting balance, a fixed amount'],
        ['How the total limit moves', 'Its floor trails the end-of-day balance, never down'],
        ['Minimum trading days', '5'],
        ['Time limit', '30 days from the first trade'],
        ['Consistency rule', 'Checked at payout, not at the pass'],
      ],
      payouts: [
        ['First payout', 'After 14 days funded'],
        ['Then', 'Every 14 days'],
        ['Profit split', '80% to $50K, 85% on $100K, 90% on $200K'],
        ['Paid in', 'USDT on Ethereum, Arbitrum or Tron, within 72 hours of approval'],
        ['Evaluation fee', 'Refunded with the first payout'],
        ['Scaling', '+50% of the account after two profitable payout periods, to $1M'],
      ],
      trading: [
        ['Instruments', 'USDⓈ-M perpetual futures — BTC, ETH, SOL, BNB and XRP on every plan'],
        ['Prices', 'Live Binance market data'],
        ['Platform', 'Propology’s own terminal, plus an API with your own keys'],
        ['Hours', 'Continuous, weekends included'],
        ['News and weekends', 'Trading through both is allowed'],
        ['Shortest allowed hold', '120 seconds'],
        ['Missed the target without a breach', 'A free retry'],
      ],
    },
  },
];

export const sponsorBySlug = (slug: string) => SPONSORS.find((s) => s.slug === slug);

export const sponsorsIn = (list: Sponsor['placement']['list']) => SPONSORS.filter((s) => s.placement.list === list);
