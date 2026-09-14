'use client';

import { useActionState, useState } from 'react';
import { moderateReview } from './actions';
import type { RecordResult } from './actions';

export function ModerateReview({ id, kind, slug }: { id: number; kind: string; slug: string }) {
  const [state, action, pending] = useActionState<RecordResult | null, FormData>(moderateReview, null);
  const [mode, setMode] = useState<'verify' | 'hide'>('verify');

  return (
    <form action={action} className="flex flex-wrap items-center gap-2 mt-[10px]">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="action" value={mode} />

      <input
        name="actor"
        required
        placeholder="you@commentfx"
        className="w-[138px] bg-card-2 border border-line rounded-lg px-[10px] py-[6px] text-[12px]"
      />

      {mode === 'hide' && (
        <input
          name="reason"
          required
          placeholder="why it comes down"
          className="flex-1 min-w-[150px] bg-card-2 border border-line rounded-lg px-[10px] py-[6px] text-[12px]"
        />
      )}

      <button
        type="submit"
        onClick={() => setMode('verify')}
        disabled={pending}
        className="bg-ink text-white font-bold text-[12px] px-3 py-[6px] rounded-lg disabled:opacity-50"
      >
        Checked — count it
      </button>
      <button
        type={mode === 'hide' ? 'submit' : 'button'}
        onClick={() => setMode('hide')}
        disabled={pending}
        className="border border-line text-ink-2 font-semibold text-[12px] px-3 py-[6px] rounded-lg disabled:opacity-50"
      >
        {mode === 'hide' ? 'Confirm take-down' : 'Take down'}
      </button>

      {state && (
        <span className={`text-[11.5px] ${state.ok ? 'text-up' : 'text-down'}`} role="status">
          {state.message}
        </span>
      )}
    </form>
  );
}
