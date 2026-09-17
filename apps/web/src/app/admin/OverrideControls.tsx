'use client';

import { useActionState } from 'react';
import { changeOverride, type EditResult } from './record-actions';

/**
 * Publishing, taking down and discarding — separate from saving on purpose.
 *
 * A save that published would mean there is no way to write a change down and
 * think about it, and no way for a second person to look before a reader does.
 * Discard asks for confirmation because it is the one button here that destroys
 * work rather than hiding it.
 */
export function OverrideControls({ kind, slug, status, isNew }: {
  kind: string; slug: string; status: 'draft' | 'live'; isNew: boolean;
}) {
  const [state, action, pending] = useActionState<EditResult | null, FormData>(changeOverride, null);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="slug" value={slug} />

      <div className="flex items-center gap-2 flex-wrap">
        {status === 'draft' ? (
          <button
            name="action" value="publish" type="submit" disabled={pending}
            className="bg-ink text-white font-bold text-[13px] px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Publish
          </button>
        ) : (
          <button
            name="action" value="unpublish" type="submit" disabled={pending}
            className="border border-line font-bold text-[13px] px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Take down
          </button>
        )}
        <button
          name="action" value="discard" type="submit" disabled={pending}
          onClick={(e) => {
            const msg = isNew
              ? 'Delete this record? It exists nowhere else, so this cannot be undone.'
              : 'Discard these changes and go back to what the code says?';
            if (!confirm(msg)) e.preventDefault();
          }}
          className="border border-line text-down font-bold text-[13px] px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {isNew ? 'Delete record' : 'Discard changes'}
        </button>
      </div>

      {state && (
        <p className={`text-[12px] leading-[1.7] ${state.ok ? 'text-up' : 'text-down'}`} role="status">
          {state.message}
          {state.problems && (
            <span className="block mt-1">
              {Object.entries(state.problems).map(([f, m]) => (
                <span key={f} className="block">{f}: {m}</span>
              ))}
            </span>
          )}
        </p>
      )}
    </form>
  );
}
