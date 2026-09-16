import {
  TOPIC_LABELS, MIN_FOR_SCORE, reviewsAffectScore, avatarFor,
  type ReviewKind, type ReviewSummaryStats,
} from '@commentfx/core';
import type { PublishedReview } from '@/lib/reviews';
import { Tag } from './primitives';
import { Avatar } from './Avatar';

const RATING_BAR = 'h-[6px] rounded-full bg-accent';

/**
 * Two numbers, never merged into one.
 *
 * The verified average is what the score uses; the published average is
 * everything anyone wrote. Showing only the first hides what people are saying;
 * showing only the second hands the score to whoever writes most. Showing both,
 * labelled, is the only version that survives someone trying to game it.
 */
export function ReviewSummary({ stats, kind }: { stats: ReviewSummaryStats; kind: ReviewKind }) {
  const scored = reviewsAffectScore(kind);

  if (stats.total === 0) {
    return (
      <p className="text-[12.5px] text-ink-2 leading-[1.8]">
        Nobody has written about this one yet.{' '}
        {scored
          ? `The reviews component of the score is excluded until ${MIN_FOR_SCORE} reviews have been checked by an editor — excluded, not scored zero, because no reviews is not the same as bad reviews.`
          : 'Reviews here are read, not counted: this ranking’s model was published without a reviews component.'}
      </p>
    );
  }

  const max = Math.max(1, ...Object.values(stats.distribution));

  return (
    <>
      <div className="flex items-baseline gap-3 mb-3">
        <div>
          <span className="font-[family-name:var(--font-display)] text-[27px] font-bold tnum">
            {stats.verifiedAverage?.toFixed(1) ?? '—'}
          </span>
          <span className="text-[12px] text-ink-3"> verified</span>
        </div>
        <div className="flex-1" />
        <div className="text-right">
          <span className="text-[15px] font-bold tnum text-ink-2">
            {stats.publishedAverage?.toFixed(1) ?? '—'}
          </span>
          <span className="text-[11.5px] text-ink-3"> all {stats.total}</span>
        </div>
      </div>

      {stats.verified > 0 && (
        <ul className="flex flex-col gap-[5px] mb-3">
          {[5, 4, 3, 2, 1].map((n) => (
            <li key={n} className="flex items-center gap-2">
              <span className="text-[11px] text-ink-3 tnum w-[10px]">{n}</span>
              <span className="flex-1 bg-card-3 rounded-full h-[6px] overflow-hidden">
                <span
                  className={RATING_BAR}
                  style={{ display: 'block', width: `${((stats.distribution[n] ?? 0) / max) * 100}%` }}
                />
              </span>
              <span className="text-[11px] text-ink-3 tnum w-[18px] text-right">
                {stats.distribution[n] ?? 0}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11.5px] text-ink-3 leading-[1.75]">
        {!scored
          ? `${stats.verified} of ${stats.total} checked by an editor. None of them moves this ranking — its model has no reviews component.`
          : stats.verified === 0
            ? `None of the ${stats.total} reviews here has been checked yet, so none of them touches the score.`
            : `${stats.verified} of ${stats.total} checked by an editor. Only those count, and only above ${MIN_FOR_SCORE}.`}
      </p>
    </>
  );
}

/**
 * The comments, as a timeline.
 *
 * They were rows of a table: a rating tile, a topic label, a badge, then the
 * words. That reads as a database listing, and a database listing is not
 * something anyone wants to add to — which showed, because almost nobody did.
 * A comment should look like a comment, so it does: a face, a handle, when it
 * was written, and then the sentence, at a size meant to be read rather than
 * scanned.
 *
 * What did not change is what the badges say. A review that no editor has
 * checked still says so, and it still counts towards nothing. Making the shape
 * friendlier is not the same as making the claims looser.
 */
export function ReviewList({ reviews }: { reviews: PublishedReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <ul className="flex flex-col">
      {reviews.map((r) => (
        <li key={r.id} className="flex gap-3 py-4 border-b border-line-2 last:border-b-0">
          <Avatar id={r.id} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[6px] flex-wrap">
              <span className="text-[13.5px] font-bold">{avatarFor(r.id).initials}·{r.id}</span>
              <span className="text-[12.5px] text-ink-3">anonymous</span>
              <span aria-hidden className="text-ink-3">·</span>
              {/* The date, not "20m ago". This page is cached for five minutes,
                  so a relative label is computed once and then served to
                  everyone who arrives inside that window — measured: a review
                  posted two seconds ago still read "2s" on three loads a minute
                  apart. A timeline that freezes its clock is worse than one
                  that never had one. */}
              <time dateTime={r.createdAt.toISOString()} className="text-[12.5px] text-ink-3">
                {r.createdAt.toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
                })}
              </time>
              <div className="flex-1" />
              {r.rating !== null && (
                <span className="flex items-center gap-[3px] text-[12.5px] font-bold tnum text-ink-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="text-accent">
                    <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z" />
                  </svg>
                  {r.rating}
                </span>
              )}
            </div>

            <p className="text-[14px] leading-[1.65] whitespace-pre-line mt-[5px]">{r.body}</p>

            <div className="flex items-center gap-[6px] flex-wrap mt-[10px]">
              <Tag tone="neutral">{TOPIC_LABELS[r.topic]}</Tag>
              {r.verified
                ? <Tag tone="good">checked by an editor</Tag>
                : <Tag tone="neutral">counts towards nothing until checked</Tag>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
