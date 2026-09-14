/**
 * Reviews, and what makes one count.
 *
 * A review site's whole problem is that reviews are the most attacked surface
 * it has: brokers pay for good ones, competitors write bad ones, and both look
 * exactly like a real customer from the server's point of view. So the rule
 * here is the same one the rest of the site runs on — **a statement counts
 * towards a score only once a person checked it.** Anyone can publish a review
 * and it appears immediately, labelled unverified; nothing reaches the 10%
 * reviews component until an editor has seen the evidence behind it.
 *
 * That makes the score slow to move and hard to buy, which is the point.
 */

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** Below this many verified reviews the component is excluded, not scored low. */
export const MIN_FOR_SCORE = 5;

export const REVIEW_TOPICS = [
  'withdrawals', 'execution', 'costs', 'support', 'platform', 'account-opening',
] as const;

export type ReviewTopic = (typeof REVIEW_TOPICS)[number];

export const TOPIC_LABELS: Record<ReviewTopic, string> = {
  withdrawals: 'Getting money out',
  execution: 'Execution and slippage',
  costs: 'Spreads and fees',
  support: 'Support',
  platform: 'Platform and app',
  'account-opening': 'Opening an account',
};

export const BODY_MIN = 80;
export const BODY_MAX = 2000;

export interface ReviewInput {
  rating: number;
  topic: string;
  body: string;
}

export type ReviewProblem =
  | { field: 'rating'; message: string }
  | { field: 'topic'; message: string }
  | { field: 'body'; message: string };

/**
 * Validation, shared by the form and the server action so the browser and the
 * database can never disagree about what is acceptable.
 *
 * The length floor is deliberate. One-line reviews carry almost no information
 * and are what both astroturfing and brigading produce in volume; asking for a
 * paragraph costs an honest customer a minute and costs a bot farm real money.
 */
export function checkReview(input: ReviewInput): ReviewProblem[] {
  const problems: ReviewProblem[] = [];

  if (!Number.isInteger(input.rating) || input.rating < RATING_MIN || input.rating > RATING_MAX) {
    problems.push({ field: 'rating', message: `Give a rating from ${RATING_MIN} to ${RATING_MAX}.` });
  }

  if (!REVIEW_TOPICS.includes(input.topic as ReviewTopic)) {
    problems.push({ field: 'topic', message: 'Choose what this review is about.' });
  }

  const body = input.body.trim();
  if (body.length < BODY_MIN) {
    problems.push({
      field: 'body',
      message: `Say what happened in at least ${BODY_MIN} characters — ${body.length} so far. Specifics are what make a review worth reading.`,
    });
  } else if (body.length > BODY_MAX) {
    problems.push({ field: 'body', message: `Keep it under ${BODY_MAX} characters.` });
  }

  return problems;
}

export interface ReviewSummaryStats {
  /** Everything published, verified or not. */
  total: number;
  verified: number;
  /** Mean of verified reviews only. Null until there are any. */
  verifiedAverage: number | null;
  /** Mean of everything, shown beside the verified one, never in the score. */
  publishedAverage: number | null;
  /** How many of each rating, verified reviews only. */
  distribution: Record<number, number>;
}

/**
 * Whether the reviews component may enter the score.
 *
 * Kept as its own named function because it is the line the whole design
 * depends on, and it should be greppable.
 */
export const countsTowardScore = (verified: number) => verified >= MIN_FOR_SCORE;

export function summarise(
  reviews: Array<{ rating: number; verifiedAt: Date | string | null }>,
): ReviewSummaryStats {
  const verified = reviews.filter((r) => r.verifiedAt !== null);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of verified) distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;

  const mean = (rows: Array<{ rating: number }>) =>
    rows.length === 0 ? null : Math.round((rows.reduce((s, r) => s + r.rating, 0) / rows.length) * 10) / 10;

  return {
    total: reviews.length,
    verified: verified.length,
    verifiedAverage: mean(verified),
    publishedAverage: mean(reviews),
    distribution,
  };
}
