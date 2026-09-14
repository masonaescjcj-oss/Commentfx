'use client';

import { useActionState, useState } from 'react';
import {
  REVIEW_TOPICS, TOPIC_LABELS, BODY_MIN, BODY_MAX, RATING_MIN, RATING_MAX,
} from '@commentfx/core';
import { postReview, type ReviewResult } from '@/app/review-actions';

export function ReviewForm({ brokerSlug, brokerName }: { brokerSlug: string; brokerName: string }) {
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
        <code className="block bg-card border border-line rounded-lg p-3 text-[12px] break-all select-all">
          {state.deleteToken}
        </code>
        <p className="text-[11.5px] text-ink-3 mt-2 leading-[1.7]">
          Use it at <a href="/reviews/withdraw" className="text-brass font-semibold">/reviews/withdraw</a>.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="brokerSlug" value={brokerSlug} />
      <input type="hidden" name="rating" value={rating} />

      <fieldset>
        <legend className="text-[11.5px] text-ink-3 mb-[6px]">
          How was dealing with {brokerName}?
        </legend>
        <div className="flex gap-[6px]">
          {Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, i) => RATING_MIN + i).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-pressed={rating === n}
              aria-label={`${n} out of ${RATING_MAX}`}
              className={`w-10 h-10 rounded-[11px] border text-[14px] font-bold tnum ${
                rating === n ? 'bg-ink text-white border-ink' : 'bg-card-2 text-ink-2 border-line'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </fieldset>

      <label>
        <span className="block text-[11.5px] text-ink-3 mb-[6px]">What is this about?</span>
        <select
          name="topic"
          required
          defaultValue=""
          className="w-full bg-card-2 border border-line rounded-[11px] px-3 py-[10px] text-[13px]"
        >
          <option value="" disabled>Choose one</option>
          {REVIEW_TOPICS.map((t) => (
            <option key={t} value={t}>{TOPIC_LABELS[t]}</option>
          ))}
        </select>
      </label>

      <label>
        <span className="block text-[11.5px] text-ink-3 mb-[6px]">
          What happened? Dates, amounts and how long things took are what make this
          worth reading — and what an editor can actually check.
        </span>
        <textarea
          name="body"
          required
          rows={6}
          maxLength={BODY_MAX}
          onChange={(e) => setLength(e.target.value.trim().length)}
          className="w-full bg-card-2 border border-line rounded-[11px] px-3 py-[10px] text-[13px] leading-[1.7]"
        />
        <span className={`block text-[11px] mt-1 tnum ${length >= BODY_MIN ? 'text-ink-3' : 'text-warn'}`}>
          {length} / {BODY_MIN} characters minimum
        </span>
      </label>

      <label>
        <span className="block text-[11.5px] text-ink-3 mb-[6px]">
          Anything an editor could check, privately (optional) — a ticket number, the date
          of a transfer. <b>This is never published.</b>
        </span>
        <input
          name="evidenceNote"
          className="w-full bg-card-2 border border-line rounded-[11px] px-3 py-[10px] text-[13px]"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || rating === 0}
          className="bg-ink text-white font-bold text-[13px] px-4 py-[10px] rounded-[11px] disabled:opacity-40"
        >
          {pending ? 'Publishing…' : 'Publish review'}
        </button>
        {state && !state.ok && (
          <p className="text-[11.5px] text-down leading-[1.6]" role="status">{state.message}</p>
        )}
      </div>

      <p className="text-[11.5px] text-ink-3 leading-[1.75]">
        Your review appears straight away, marked unverified. It changes the score only
        once an editor has checked it — which is why buying reviews here buys nothing.
        No account, no email, and no address is stored.
      </p>
    </form>
  );
}
