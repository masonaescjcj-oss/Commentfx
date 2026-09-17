'use client';

import { useActionState } from 'react';
import { changeArticle } from './article-actions';
import type { EditResult } from './record-actions';

export function ArticleControls({ slug, status, isNew }: {
  slug: string; status: 'draft' | 'live'; isNew: boolean;
}) {
  const [state, action, pending] = useActionState<EditResult | null, FormData>(changeArticle, null);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="slug" value={slug} />
      <div className="flex items-center gap-2 flex-wrap">
        {status === 'draft' ? (
          <button name="action" value="publish" type="submit" disabled={pending}
            className="bg-ink text-white font-bold text-[13px] px-4 py-2 rounded-lg disabled:opacity-50">
            Publish
          </button>
        ) : (
          <button name="action" value="unpublish" type="submit" disabled={pending}
            className="border border-line font-bold text-[13px] px-4 py-2 rounded-lg disabled:opacity-50">
            Take down
          </button>
        )}
        <button name="action" value="discard" type="submit" disabled={pending}
          onClick={(e) => {
            const msg = isNew
              ? 'Delete this article? It exists nowhere else, so this cannot be undone.'
              : 'Discard these changes and go back to what the code says?';
            if (!confirm(msg)) e.preventDefault();
          }}
          className="border border-line text-down font-bold text-[13px] px-4 py-2 rounded-lg disabled:opacity-50">
          {isNew ? 'Delete article' : 'Discard changes'}
        </button>
      </div>

      {state && (
        <p className={`text-[12px] leading-[1.7] ${state.ok ? 'text-up' : 'text-down'}`} role="status">
          {state.message}
          {state.problems && (
            <span className="block mt-1">
              {Object.entries(state.problems).map(([f, m]) => (
                <span key={f} className="block">{m}</span>
              ))}
            </span>
          )}
        </p>
      )}
    </form>
  );
}
