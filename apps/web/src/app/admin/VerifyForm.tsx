'use client';

import { useActionState } from 'react';
import { recordVerification, type RecordResult } from './actions';

export function VerifyForm({ kind, slug, field, current, lastValue, suggestedSource }: {
  kind: string; slug: string; field: string; current: string; lastValue: string | null;
  /** Prefilled so the checker edits a URL rather than typing one from memory. */
  suggestedSource: string;
}) {
  const [state, action, pending] = useActionState<RecordResult | null, FormData>(recordVerification, null);

  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="field" value={field} />

      <div className="flex gap-2">
        <label className="flex-1">
          <span className="block text-[11px] text-ink-3 mb-1">Value at the source</span>
          <input
            name="valueSeen"
            defaultValue={lastValue ?? current}
            required
            className="w-full bg-card-2 border border-line rounded-lg px-3 py-2 text-[13px] tnum"
          />
        </label>
      </div>

      <label>
        <span className="block text-[11px] text-ink-3 mb-1">
          Source URL — the page you actually read. The suggestion is a starting
          point, not a check.
        </span>
        <input
          name="sourceUrl"
          type="url"
          required
          defaultValue={suggestedSource}
          placeholder="https://register.fca.org.uk/..."
          className="w-full bg-card-2 border border-line rounded-lg px-3 py-2 text-[13px]"
        />
      </label>

      <label>
        <span className="block text-[11px] text-ink-3 mb-1">Note (optional)</span>
        <input name="note" className="w-full bg-card-2 border border-line rounded-lg px-3 py-2 text-[13px]" />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink text-white font-bold text-[13px] px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {pending ? 'Recording…' : 'Record check'}
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
