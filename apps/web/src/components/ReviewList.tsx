import { TOPIC_LABELS, MIN_FOR_SCORE, type ReviewSummaryStats } from '@commentfx/core';
import type { PublishedReview } from '@/lib/reviews';
import { Tag } from './primitives';

const RATING_BAR = 'h-[6px] rounded-full bg-brass';

const dayOf = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/**
 * Two numbers, never merged into one.
 *
 * The verified average is what the score uses; the published average is
 * everything anyone wrote. Showing only the first hides what people are saying;
 * showing only the second hands the score to whoever writes most. Showing both,
 * labelled, is the only version that survives someone trying to game it.
 */
export function ReviewSummary({ stats }: { stats: ReviewSummaryStats }) {
  if (stats.total === 0) {
    return (
      <p className="text-[12.5px] text-ink-2 leading-[1.8]">
        Nobody has written about this broker yet. The reviews component of the score is
        excluded until {MIN_FOR_SCORE} reviews have been checked by an editor — excluded,
        not scored zero, because no reviews is not the same as bad reviews.
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
        {stats.verified === 0
          ? `None of the ${stats.total} reviews here has been checked yet, so none of them touches the score.`
          : `${stats.verified} of ${stats.total} checked by an editor. Only those count, and only above ${MIN_FOR_SCORE}.`}
      </p>
    </>
  );
}

export function ReviewList({ reviews }: { reviews: PublishedReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <ul className="flex flex-col">
      {reviews.map((r) => (
        <li key={r.id} className="py-[13px] border-b border-line-2 last:border-b-0">
          <div className="flex items-center gap-2 mb-[6px]">
            <span className="w-[26px] h-[26px] grid place-items-center rounded-[8px] bg-card-3 text-[12.5px] font-extrabold tnum">
              {r.rating}
            </span>
            <span className="text-[12px] font-semibold">{TOPIC_LABELS[r.topic]}</span>
            <div className="flex-1" />
            {r.verified
              ? <Tag tone="good">checked by an editor</Tag>
              : <Tag tone="neutral">unverified</Tag>}
          </div>
          <p className="text-[12.5px] text-ink-2 leading-[1.8] whitespace-pre-line">{r.body}</p>
          <p className="text-[11px] text-ink-3 mt-[6px]">
            <time dateTime={r.createdAt.toISOString()}>{dayOf(r.createdAt)}</time>
            {!r.verified && ' · counts towards nothing until checked'}
          </p>
        </li>
      ))}
    </ul>
  );
}
