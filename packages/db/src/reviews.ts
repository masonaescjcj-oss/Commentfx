import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { and, desc, eq, isNull, isNotNull, sql } from 'drizzle-orm';
import {
  checkReview, summarise, countsTowardScore, reviewsAffectScore, MIN_FOR_SCORE,
  type ReviewInput, type ReviewKind, type ReviewProblem, type ReviewSummaryStats,
  type ReviewTopic,
} from '@commentfx/core';
import type { AppDb } from './client.ts';
import { reviews } from './schema.ts';

export { checkReview, summarise, countsTowardScore, reviewsAffectScore, MIN_FOR_SCORE };
export type { ReviewInput, ReviewKind, ReviewProblem, ReviewSummaryStats, ReviewTopic };

export interface PublishedReview {
  id: number;
  kind: ReviewKind;
  slug: string;
  rating: number;
  topic: ReviewTopic;
  body: string;
  verified: boolean;
  createdAt: Date;
}

/**
 * The secret the author keeps. Generated here, shown once, never stored — only
 * its digest is. A deletion link that the site itself could reconstruct would
 * not be a promise, it would be a claim.
 */
export const newDeleteToken = () => randomBytes(24).toString('base64url');

/**
 * What the author is actually given: the review's id and its secret, in one
 * string. They have no way to know the id otherwise, and a secret they cannot
 * use is not a way out.
 */
export const withdrawalCode = (id: number, token: string) => `${id}.${token}`;

export function parseWithdrawalCode(code: string): { id: number; token: string } | null {
  const at = code.indexOf('.');
  if (at < 1) return null;
  const id = Number(code.slice(0, at));
  const token = code.slice(at + 1);
  if (!Number.isInteger(id) || id < 1 || token.length === 0) return null;
  return { id, token };
}

const tokenDigest = (token: string) => createHash('sha256').update(token).digest('hex');

export type ReviewSubmitResult =
  | { ok: true; id: number; deleteToken: string }
  | { ok: false; problems: ReviewProblem[] }
  | { ok: false; duplicate: true };

export async function submitReview(
  db: AppDb,
  input: ReviewInput & { slug: string; authorHash: string; evidenceNote?: string | null },
): Promise<ReviewSubmitResult> {
  const problems = checkReview(input);
  if (problems.length > 0) return { ok: false, problems };

  const deleteToken = newDeleteToken();
  const inserted = await db
    .insert(reviews)
    .values({
      kind: input.kind,
      slug: input.slug,
      rating: input.rating,
      topic: input.topic as ReviewTopic,
      body: input.body.trim(),
      authorHash: input.authorHash,
      deleteTokenHash: tokenDigest(deleteToken),
      evidenceNote: input.evidenceNote?.trim() || null,
    })
    // The unique index is the rate limit. A second review of the same broker on
    // the same topic from the same author today is not an error to shout about.
    .onConflictDoNothing()
    .returning({ id: reviews.id });

  const id = inserted[0]?.id;
  if (id === undefined) return { ok: false, duplicate: true };
  return { ok: true, id, deleteToken };
}

/**
 * Withdraws a review on production of the token its author was given.
 *
 * The comparison is constant-time. The token is short-lived in nobody's memory
 * but the author's, and an attacker who could measure how quickly a wrong guess
 * was rejected could walk one character at a time towards a right one.
 */
export async function withdrawReview(db: AppDb, id: number, token: string): Promise<boolean> {
  const [row] = await db.select().from(reviews).where(eq(reviews.id, id));
  if (!row) return false;

  const given = Buffer.from(tokenDigest(token));
  const held = Buffer.from(row.deleteTokenHash);
  if (given.length !== held.length || !timingSafeEqual(given, held)) return false;

  await db
    .update(reviews)
    .set({ hidden: true, hiddenReason: 'withdrawn by its author' })
    .where(eq(reviews.id, id));
  return true;
}

const published = (r: typeof reviews.$inferSelect): PublishedReview => ({
  id: r.id,
  kind: r.kind as ReviewKind,
  slug: r.slug,
  rating: r.rating,
  topic: r.topic as ReviewTopic,
  body: r.body,
  verified: r.verifiedAt !== null,
  createdAt: r.createdAt,
});

/** What a reader sees: everything published and not withdrawn, newest first. */
export async function reviewsFor(db: AppDb, kind: ReviewKind, slug: string): Promise<PublishedReview[]> {
  const rows = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.kind, kind), eq(reviews.slug, slug), eq(reviews.hidden, false)))
    .orderBy(desc(reviews.verifiedAt), desc(reviews.createdAt));
  return rows.map(published);
}

/** Everything published anywhere, newest first — the /reviews page. */
export async function recentReviews(db: AppDb, limit = 120): Promise<PublishedReview[]> {
  const rows = await db
    .select()
    .from(reviews)
    .where(eq(reviews.hidden, false))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
  return rows.map(published);
}

export async function reviewStatsFor(
  db: AppDb, kind: ReviewKind, slug: string,
): Promise<ReviewSummaryStats> {
  const rows = await db
    .select({ rating: reviews.rating, verifiedAt: reviews.verifiedAt })
    .from(reviews)
    .where(and(eq(reviews.kind, kind), eq(reviews.slug, slug), eq(reviews.hidden, false)));
  return summarise(rows);
}

/** Stats for a whole vertical at once, so a ranking page is one query not thirty. */
export async function reviewStatsForAll(
  db: AppDb, kind: ReviewKind,
): Promise<Map<string, ReviewSummaryStats>> {
  const rows = await db
    .select({ slug: reviews.slug, rating: reviews.rating, verifiedAt: reviews.verifiedAt })
    .from(reviews)
    .where(and(eq(reviews.kind, kind), eq(reviews.hidden, false)));

  const bySlug = new Map<string, Array<{ rating: number; verifiedAt: Date | null }>>();
  for (const r of rows) {
    const list = bySlug.get(r.slug) ?? [];
    list.push({ rating: r.rating, verifiedAt: r.verifiedAt });
    bySlug.set(r.slug, list);
  }
  return new Map([...bySlug].map(([slug, list]) => [slug, summarise(list)]));
}

/* ── the editor's side ─────────────────────────────────────────────── */

export interface PendingReview extends PublishedReview {
  evidenceNote: string | null;
}

/** Unverified, not hidden, oldest first — a queue, not a feed. */
export async function reviewQueue(db: AppDb, limit = 50): Promise<PendingReview[]> {
  const rows = await db
    .select()
    .from(reviews)
    .where(and(isNull(reviews.verifiedAt), eq(reviews.hidden, false)))
    .orderBy(reviews.createdAt)
    .limit(limit);

  return rows.map((r) => ({ ...published(r), evidenceNote: r.evidenceNote }));
}

/**
 * Marks a review as checked by a person. This is the only path by which a
 * review reaches a score, and it takes a name because someone is accountable
 * for it.
 */
export async function verifyReview(db: AppDb, id: number, verifiedBy: string) {
  await db
    .update(reviews)
    .set({ verifiedAt: new Date(), verifiedBy })
    .where(and(eq(reviews.id, id), isNull(reviews.verifiedAt)));
}

/** Removes a review from the site. Kept in the table with its reason. */
export async function hideReview(db: AppDb, id: number, reason: string) {
  await db.update(reviews).set({ hidden: true, hiddenReason: reason }).where(eq(reviews.id, id));
}

export async function verifiedCount(db: AppDb): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(reviews)
    .where(and(isNotNull(reviews.verifiedAt), eq(reviews.hidden, false)));
  return row?.n ?? 0;
}
