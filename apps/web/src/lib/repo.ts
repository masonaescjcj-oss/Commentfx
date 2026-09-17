import {
  BROKERS, brokerBySlug, scoreBroker, effectiveCostPips,
  mergeRecord, validateRecord,
  type Broker, type ScoreBreakdown, type ReviewSummaryStats,
} from '@commentfx/core';

/* ── Editor overrides ───────────────────────────────────────────── */

/**
 * What an editor has changed, keyed `kind:slug`.
 *
 * Threaded through the same way review counts are, and for the same reason: a
 * function that reaches for a database on its own cannot be called from a
 * sitemap, a static param or a test. The caller decides whether this render
 * knows about overrides, and everything downstream stays a pure function of
 * its arguments.
 */
export type Patches = Map<string, { patch: Record<string, unknown>; isNew: boolean }>;

export const patchKey = (kind: 'broker' | 'prop' | 'exchange', slug: string) => `${kind}:${slug}`;

/**
 * Code records with the live patches merged over them, plus any record that
 * exists only in the database.
 *
 * The validation pass is not belt and braces. A patch is written through a
 * form that validates, but it is stored as JSON and a row can be changed by
 * anything with the database credentials — a migration, a restore, somebody at
 * a psql prompt. A merged record that does not validate is dropped back to
 * what the code says, so the worst a bad row can do is have no effect. The
 * alternative is a page that throws, and a directory whose broker page 500s
 * because somebody fat-fingered a JSON field is worse than one that quietly
 * shows the last known-good figures.
 */
function withPatches<T extends { slug: string }>(
  kind: 'broker' | 'prop' | 'exchange',
  base: readonly T[],
  patches: Patches | undefined,
): T[] {
  if (!patches?.size) return base as T[];

  const out = base.map((record) => {
    const entry = patches.get(patchKey(kind, record.slug));
    if (!entry || entry.isNew) return record;
    const merged = mergeRecord(record, entry.patch);
    return validateRecord(kind, merged).length === 0 ? merged : record;
  });

  for (const [key, entry] of patches) {
    if (!entry.isNew || !key.startsWith(`${kind}:`)) continue;
    const slug = key.slice(kind.length + 1);
    if (out.some((r) => r.slug === slug)) continue;
    const record = { ...(entry.patch as object), slug } as T;
    if (validateRecord(kind, record).length === 0) out.push(record);
  }
  return out;
}

/**
 * Live verified-review counts, keyed by slug.
 *
 * The rule, so the two never drift: anything that shows a number takes this
 * map; anything that only needs the set of slugs (the sitemap,
 * generateStaticParams) does not, because review counts cannot change which
 * brokers exist -- only where they sit.
 */
export type ReviewStats = Map<string, ReviewSummaryStats>;

/** The record as scored: seed data with any live review counts folded in. */
function withReviews(broker: Broker, stats?: ReviewStats): Broker {
  const live = stats?.get(broker.slug);
  if (!live) return broker;
  return {
    ...broker,
    reviews: { verifiedCount: live.verified, verifiedAverage: live.verifiedAverage },
  };
}

export interface RankedBroker {
  rank: number;
  broker: Broker;
  score: ScoreBreakdown;
}

/**
 * The single source of ranking order. Everything on the site — the list, the
 * home page, "best for" pages, the compare page — reads from here, so a broker
 * can never appear at a different rank in two places.
 */
export function rankedBrokers(stats?: ReviewStats, patches?: Patches): RankedBroker[] {
  return withPatches('broker', BROKERS, patches)
    .map((b) => withReviews(b, stats))
    .map((broker) => ({ broker, score: scoreBroker(broker) }))
    .sort((a, b) => b.score.total - a.score.total || a.broker.name.localeCompare(b.broker.name))
    .map((r, i) => ({ rank: i + 1, ...r }));
}

export function getRanked(slug: string, stats?: ReviewStats, patches?: Patches): RankedBroker | undefined {
  return rankedBrokers(stats, patches).find((r) => r.broker.slug === slug);
}

export const getBroker = brokerBySlug;

/* ── "Best for" pages: each is a real, defensible query over the data ──── */

export interface BestCriterion {
  slug: string;
  title: string;
  h1: string;
  lead: string;
  /** Higher is better. Returns null to exclude a broker from this list. */
  rank: (b: Broker) => number | null;
  /** The one figure this list is actually sorted on. */
  metric: (b: Broker) => string;
  metricLabel: string;
}

export const BEST_CRITERIA: BestCriterion[] = [
  {
    slug: 'lowest-spread',
    title: 'Brokers with the lowest published trading cost',
    h1: 'Lowest published trading cost',
    lead:
      'Spread and commission reduced to one number: a $7 round-turn commission on a standard lot is worth about 0.7 pips on EUR/USD, so the two are directly comparable.',
    rank: (b) => -effectiveCostPips(b),
    metric: (b) => `${effectiveCostPips(b).toFixed(2)} pips`,
    metricLabel: 'All-in cost',
  },
  {
    slug: 'tier-1-regulated',
    title: 'Brokers holding a tier-1 licence',
    h1: 'Brokers with a tier-1 licence',
    lead:
      'Only brokers holding at least one licence from a regulator that runs a statutory compensation scheme and a public register: FCA, ASIC, CySEC, BaFin, FINMA, MAS or NFA.',
    rank: (b) => {
      const tier1 = ['FCA', 'ASIC', 'CySEC', 'BaFin', 'FINMA', 'MAS', 'NFA'];
      const n = b.entities.filter((e) => tier1.includes(e.licence.regulator)).length;
      return n > 0 ? n : null;
    },
    metric: (b) => `${b.entities.length} entities`,
    metricLabel: 'Licences',
  },
  {
    slug: 'low-minimum-deposit',
    title: 'Brokers with the lowest minimum deposit',
    h1: 'Lowest minimum deposit',
    lead:
      'What it actually takes to open a live account. Useful when you want to test execution with real money before committing size.',
    rank: (b) => -b.payments.minDepositUsd,
    metric: (b) => (b.payments.minDepositUsd === 0 ? 'No minimum' : `$${b.payments.minDepositUsd}`),
    metricLabel: 'Minimum',
  },
  {
    slug: 'fast-withdrawals',
    title: 'Brokers with the fastest stated withdrawals',
    h1: 'Fastest stated withdrawals',
    lead:
      'Processing time as published by each broker. These are the broker’s own claims — once we have enough verified user reports, this page will rank on measured time instead.',
    rank: (b) => -b.payments.statedWithdrawalHours,
    metric: (b) =>
      b.payments.statedWithdrawalHours < 1
        ? `${Math.round(b.payments.statedWithdrawalHours * 60)} min`
        : `${b.payments.statedWithdrawalHours} hrs`,
    metricLabel: 'Stated time',
  },
  {
    slug: 'crypto-funding',
    title: 'Brokers that accept crypto deposits',
    h1: 'Brokers accepting crypto funding',
    lead:
      'Brokers that let you fund and withdraw in cryptocurrency, ordered by overall score.',
    rank: (b) => (b.payments.methods.includes('crypto') ? 1 : null),
    metric: (b) => b.payments.methods.join(', '),
    metricLabel: 'Methods',
  },
];

export const bestCriterion = (slug: string) => BEST_CRITERIA.find((c) => c.slug === slug);

export function bestList(c: BestCriterion, stats?: ReviewStats, patches?: Patches): RankedBroker[] {
  return rankedBrokers(stats, patches)
    .filter((r) => c.rank(r.broker) !== null)
    .sort((a, b) => (c.rank(b.broker)! - c.rank(a.broker)!) || b.score.total - a.score.total)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

/* ── Compare pairs ─────────────────────────────────────────────────────── */

/** How many alternatives a broker page offers. One number, used by both sides. */
export const ALTERNATIVES = 3;

/** The brokers a page suggests instead: the highest-ranked ones that are not it. */
export function alternativesFor(slug: string, stats?: ReviewStats, patches?: Patches): RankedBroker[] {
  return rankedBrokers(stats, patches).filter((r) => r.broker.slug !== slug).slice(0, ALTERNATIVES);
}

/**
 * Every comparison page the site links to, and no others.
 *
 * Derived from the same function the broker pages use to pick their
 * alternatives, because these were allowed to drift once: the pages linked
 * three alternatives each while only the top six brokers got a built page, so
 * most "X vs Y" links on the site were 404s. Anything linked is built.
 */
export function comparePairs(): Array<[string, string]> {
  return canonicalPairs(rankedBrokers().map((r) => [r.broker.slug, alternativesFor(r.broker.slug).map((a) => a.broker.slug)]));
}

export const pairSlug = (a: string, b: string) => `${a}-vs-${b}`;

/**
 * The one of the two directions that is the real page.
 *
 * "exness-vs-ic-markets" and "ic-markets-vs-exness" are the same comparison,
 * and both are linked from the two record pages, so both have to answer. Only
 * one may be canonical, or the site is bidding against itself for its own
 * query. Alphabetical, because it needs to be stable and nothing else about the
 * choice matters.
 */
export const canonicalPair = (a: string, b: string): [string, string] =>
  a.localeCompare(b) <= 0 ? [a, b] : [b, a];

export const canonicalPairSlug = (a: string, b: string) => pairSlug(...canonicalPair(a, b));

/**
 * Each comparison once, in its canonical direction.
 *
 * This used to key the "seen" set on the slug as written, which is
 * order-dependent, so A-vs-B and B-vs-A both survived it — two prerendered
 * pages and two sitemap entries for one comparison. Every page now links the
 * canonical direction, so the other one need not be built at all: dynamic
 * params are deliberately left on, and a reverse URL from somewhere else still
 * renders and still says which page it is.
 */
function canonicalPairs(from: Array<[string, string[]]>): Array<[string, string]> {
  const seen = new Set<string>();
  const pairs: Array<[string, string]> = [];
  for (const [slug, alternatives] of from) {
    for (const alt of alternatives) {
      const [a, b] = canonicalPair(slug, alt);
      const key = pairSlug(a, b);
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push([a, b]);
    }
  }
  return pairs;
}

export function parsePair(slug: string): [string, string] | null {
  const parts = slug.split('-vs-');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return [parts[0], parts[1]];
}

/* ── Prop firms ────────────────────────────────────────────────────────── */

import { PROPS, propBySlug, scoreProp, propProfileFor, type PropFirm, type PropBreakdown } from '@commentfx/core';

export interface RankedProp { rank: number; firm: PropFirm; score: PropBreakdown }

export function rankedProps(patches?: Patches): RankedProp[] {
  return withPatches('prop', PROPS, patches)
    .map((firm) => ({ firm, score: scoreProp(firm, propProfileFor(firm.slug)) }))
    .sort((a, b) => b.score.total - a.score.total || a.firm.name.localeCompare(b.firm.name))
    .map((r, i) => ({ rank: i + 1, ...r }));
}

export const getRankedProp = (slug: string, patches?: Patches) =>
  rankedProps(patches).find((r) => r.firm.slug === slug);
export const getProp = propBySlug;

/**
 * The comparison pages the prop side builds, derived the same way the broker
 * side derives its own — from the alternatives each page already links, so a
 * link and a built page cannot come apart. The brokers learned that once, when
 * pages linked three alternatives each and only the top six got built.
 */
export function propAlternativesFor(slug: string, patches?: Patches): RankedProp[] {
  return rankedProps(patches).filter((r) => r.firm.slug !== slug).slice(0, ALTERNATIVES);
}

export function propComparePairs(): Array<[string, string]> {
  return canonicalPairs(rankedProps().map((r) => [r.firm.slug, propAlternativesFor(r.firm.slug).map((a) => a.firm.slug)]));
}

/* ── Exchanges ─────────────────────────────────────────────────────────── */

import { EXCHANGES, exchangeBySlug, scoreExchange, exchangeProfileFor, type Exchange, type ExchangeBreakdown } from '@commentfx/core';

export interface RankedExchange { rank: number; exchange: Exchange; score: ExchangeBreakdown }

export function rankedExchanges(patches?: Patches): RankedExchange[] {
  return withPatches('exchange', EXCHANGES, patches)
    .map((exchange) => ({ exchange, score: scoreExchange(exchange, exchangeProfileFor(exchange.slug)) }))
    .sort((a, b) => b.score.total - a.score.total || a.exchange.name.localeCompare(b.exchange.name))
    .map((r, i) => ({ rank: i + 1, ...r }));
}

export const getRankedExchange = (slug: string, patches?: Patches) =>
  rankedExchanges(patches).find((r) => r.exchange.slug === slug);
export const getExchange = exchangeBySlug;
