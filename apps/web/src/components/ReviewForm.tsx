'use client';

import { useActionState, useState } from 'react';
import {
  TOPICS_FOR, TOPIC_LABELS, BODY_MIN, BODY_MAX, RATING_MIN, RATING_MAX,
  reviewsAffectScore, type ReviewKind,
} from '@commentfx/core';
import { postReview, type ReviewResult } from '@/app/review-actions';

/**
 * The form is always offered, and the action is what knows whether there is
 * anywhere to write.
 *
 * Gating the form on "is a database configured" looks tidier and is wrong: this
 * page is prerendered, the build runs without a database, and that answer would
 * be baked into the HTML for a server that has one. I tried it and hid the form
 * on a working deployment. Whether a write can land is a runtime fact, so only
 * something running at request time — the action — may answer it.
 */
export function ReviewForm({ kind, slug, name }: {
  kind: ReviewKind; slug: string; name: string;
}) {

  const [state, action, pending] = useActionState<ReviewResult | null, FormData>(postReview, null);
  const [rating, setRating] = useState(0);
  const [length, setLength] = useState(0);

  if (state?.ok && state.deleteToken) {
    return (
      <div className="bg-up-bg border border-transparent rounded-[13px] p-4">
        <p className="text-[13.5px] font-bold text-up mb-2">Published</p>
        <p className="text-[12.5px] text-ink-2 leading-[1.8] mb-3">{state.message}</p>
        <p className="text-[12.5px] text-ink-2 leading-[1.8] mb-2">
          <b>Keep this if you might want it taken down.</b> There are no accounts here, so
          this is the only thing that proves the review is yours. We store a digest of it,
          never the code itself — if you lose it, nobody can give it back to you.
        </p>
        {/* The id is a hook, and it is load-bearing rather than decorative: the
            smoke scripts find this element to prove a review really published,
            and they used to do it by taking the first <code> on the page. The
            day a <code> appeared higher up — in the sources card, of all places
            — every writing flow started passing against the wrong element and
            the run went green while nothing published. A stable hook is cheaper
            than that failure. */}
        <code id="withdrawal-code" className="block bg-card border border-line rounded-lg p-3 text-[12px] break-all select-all">
          {state.deleteToken}
        </code>
        <p className="text-[11.5px] text-ink-3 mt-2 leading-[1.7]">
          Use it at <a href="/reviews/withdraw" className="text-accent font-semibold">/reviews/withdraw</a>.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex gap-3">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating || ''} />

      {/* A circle where a face would be, so the box reads as somewhere a person
          writes rather than as a field on a form. Nobody has an account here,
          so it stays a circle. */}
      <span aria-hidden className="w-10 h-10 rounded-full bg-card-3 grid place-items-center shrink-0 text-ink-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8.5" r="3.6" /><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" strokeLinecap="round" />
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <label>
          <span className="sr-only">What happened with {name}?</span>
          <textarea
            name="body"
            required
            rows={3}
            maxLength={BODY_MAX}
            placeholder={`What happened with ${name}?`}
            onChange={(e) => setLength(e.target.value.trim().length)}
            className="w-full bg-transparent border-0 px-0 py-1 text-[16px] leading-[1.6] placeholder:text-ink-3 focus:outline-none resize-y"
          />
        </label>

        {/* Under the box, the way a compose row works: the optional things, then
            the button. The rating is optional now — a review may be words alone,
            and asking for a number before anyone can say a sentence is a survey
            pretending to be a comment box. */}
        <div className="flex items-center gap-2 flex-wrap pt-[10px] mt-[2px] border-t border-line-2">
          <div className="flex gap-[3px]" role="group" aria-label="Rating, optional">
            {Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(rating === n ? 0 : n)}
                aria-pressed={rating === n}
                aria-label={`${n} out of ${RATING_MAX}`}
                className={`w-8 h-8 grid place-items-center rounded-full ${
                  n <= rating ? 'text-accent' : 'text-line hover:text-ink-3'
                }`}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z" />
                </svg>
              </button>
            ))}
          </div>

          <label className="min-w-0">
            <span className="sr-only">What is this about?</span>
            <select
              name="topic"
              required
              defaultValue={TOPICS_FOR[kind][0]}
              className="bg-card-2 border border-line rounded-full pl-3 pr-2 py-[6px] text-[12.5px] text-ink-2 max-w-[46vw] sm:max-w-none"
            >
              {TOPICS_FOR[kind].map((t) => (
                <option key={t} value={t}>{TOPIC_LABELS[t]}</option>
              ))}
            </select>
          </label>

          <div className="flex-1" />

          <span className={`text-[11.5px] tnum ${length === 0 || length >= BODY_MIN ? 'text-ink-3' : 'text-warn'}`}>
            {length > 0 && length < BODY_MIN ? `${length}/${BODY_MIN}` : ''}
          </span>
          <button
            type="submit"
            disabled={pending || length < BODY_MIN}
            className="bg-accent text-white font-bold text-[13.5px] px-5 py-[9px] rounded-full disabled:opacity-40"
          >
            {pending ? 'Posting…' : 'Post'}
          </button>
        </div>

        {state && !state.ok && (
          <p className="text-[12px] text-down leading-[1.6] mt-2" role="status">{state.message}</p>
        )}

        <details className="mt-3">
          <summary className="text-[11.5px] text-ink-3 cursor-pointer list-none hover:text-ink-2">
            Something an editor could check, privately &rsaquo;
          </summary>
          <input
            name="evidenceNote"
            placeholder="A ticket number, the date of a transfer — never published"
            className="w-full bg-card-2 border border-line rounded-[11px] px-3 py-[9px] text-[12.5px] mt-2"
          />
        </details>

        <p className="text-[11.5px] text-ink-3 leading-[1.75] mt-3">
          It appears straight away, marked unverified.{' '}
          {reviewsAffectScore(kind)
            ? 'It changes the score only once an editor has checked it — which is why buying reviews here buys nothing.'
            : 'Reviews are not part of this ranking’s score at all yet: that model was published without a reviews component.'}{' '}
          No account, no email, no address.
        </p>
      </div>
    </form>
  );
}
