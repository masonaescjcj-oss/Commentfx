import 'server-only';
import {
  getDb, reviewsFor, reviewStatsFor, reviewStatsForAll, reviewQueue,
  type PublishedReview, type ReviewSummaryStats, type PendingReview,
} from '@commentfx/db';
import { summarise } from '@commentfx/core';
import { DB_ENABLED } from './verify';

export type { PublishedReview, ReviewSummaryStats, PendingReview };

/** No database means no reviews — never an error, and never a fake zero average. */
const EMPTY: ReviewSummaryStats = summarise([]);

export async function reviewStats(): Promise<Map<string, ReviewSummaryStats>> {
  if (!DB_ENABLED) return new Map();
  try {
    const { db } = await getDb();
    return await reviewStatsForAll(db);
  } catch (err) {
    console.error('[reviews] stats lookup failed:', err);
    return new Map();
  }
}

export async function brokerReviews(slug: string): Promise<{
  list: PublishedReview[];
  stats: ReviewSummaryStats;
}> {
  if (!DB_ENABLED) return { list: [], stats: EMPTY };
  try {
    const { db } = await getDb();
    const [list, stats] = await Promise.all([reviewsFor(db, slug), reviewStatsFor(db, slug)]);
    return { list, stats };
  } catch (err) {
    console.error('[reviews] lookup failed:', err);
    return { list: [], stats: EMPTY };
  }
}

export async function pendingReviews(): Promise<PendingReview[]> {
  const { db } = await getDb();
  return reviewQueue(db);
}
