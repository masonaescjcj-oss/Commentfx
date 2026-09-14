import 'server-only';
import {
  getDb, reviewsFor, reviewStatsFor, reviewStatsForAll, reviewQueue, recentReviews,
  type PublishedReview, type ReviewSummaryStats, type PendingReview, type ReviewKind,
} from '@commentfx/db';
import { summarise } from '@commentfx/core';
import { DB_ENABLED } from './verify';

export type { PublishedReview, ReviewSummaryStats, PendingReview, ReviewKind };

/** No database means no reviews — never an error, and never a fake zero average. */
const EMPTY: ReviewSummaryStats = summarise([]);

export async function reviewStats(kind: ReviewKind = 'broker'): Promise<Map<string, ReviewSummaryStats>> {
  if (!DB_ENABLED) return new Map();
  try {
    const { db } = await getDb();
    return await reviewStatsForAll(db, kind);
  } catch (err) {
    console.error('[reviews] stats lookup failed:', err);
    return new Map();
  }
}

export async function recordReviews(kind: ReviewKind, slug: string): Promise<{
  list: PublishedReview[];
  stats: ReviewSummaryStats;
}> {
  if (!DB_ENABLED) return { list: [], stats: EMPTY };
  try {
    const { db } = await getDb();
    const [list, stats] = await Promise.all([
      reviewsFor(db, kind, slug),
      reviewStatsFor(db, kind, slug),
    ]);
    return { list, stats };
  } catch (err) {
    console.error('[reviews] lookup failed:', err);
    return { list: [], stats: EMPTY };
  }
}

/** The site-wide feed. Empty rather than an error when there is no database. */
export async function latestReviews(limit = 120): Promise<PublishedReview[]> {
  if (!DB_ENABLED) return [];
  try {
    const { db } = await getDb();
    return await recentReviews(db, limit);
  } catch (err) {
    console.error('[reviews] feed lookup failed:', err);
    return [];
  }
}

export async function pendingReviews(): Promise<PendingReview[]> {
  const { db } = await getDb();
  return reviewQueue(db);
}

export const pathForKind = (kind: ReviewKind, slug: string) =>
  `/${kind === 'broker' ? 'brokers' : kind === 'prop' ? 'props' : 'exchanges'}/${slug}`;

export const KIND_LABEL: Record<ReviewKind, string> = {
  broker: 'Broker', prop: 'Prop firm', exchange: 'Exchange',
};
