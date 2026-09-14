'use client';

import { useActionState } from 'react';
import { removeReview, type ReviewResult } from '@/app/review-actions';

export function WithdrawForm() {
  const [state, action, pending] = useActionState<ReviewResult | null, FormData>(removeReview, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <label>
        <span className="block text-[11.5px] text-ink-3 mb-[6px]">
          The code you were shown when you published
        </span>
        <input
          name="code"
          required
          autoComplete="off"
          spellCheck={false}
          placeholder="123.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full bg-card-2 border border-line rounded-[11px] px-3 py-[10px] text-[13px] font-mono"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink text-white font-bold text-[13px] px-4 py-[10px] rounded-[11px] disabled:opacity-40"
        >
          {pending ? 'Withdrawing…' : 'Withdraw my review'}
        </button>
        {state && (
          <p className={`text-[11.5px] leading-[1.6] ${state.ok ? 'text-up' : 'text-down'}`} role="status">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
