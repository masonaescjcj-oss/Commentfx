'use client';

import { useActionState, useState } from 'react';
import { saveArticle } from './article-actions';
import type { EditResult } from './record-actions';

const box = 'w-full bg-card-2 border border-line rounded-lg px-3 py-2 text-[13px]';

function Field({ name, label, help, value, onChange, rows, problem, maxLength }: {
  name: string; label: string; help?: string; value: string;
  onChange: (v: string) => void;
  rows?: number; problem?: string; maxLength?: number;
}) {
  const border = problem ? ' border-down' : '';
  return (
    <label className="block">
      <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">{label}</span>
      {rows ? (
        <textarea name={name} rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
          className={`${box}${border} font-mono text-[12px] leading-[1.7]`} />
      ) : (
        <input name={name} value={value} onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength} className={box + border} />
      )}
      {problem && <span className="block text-[11px] text-down mt-1">{problem}</span>}
      {help && !problem && <span className="block text-[11px] text-ink-3 mt-1 leading-[1.65]">{help}</span>}
    </label>
  );
}

/**
 * The article editor.
 *
 * Prose in text boxes rather than nested fieldsets, because nobody composes an
 * article through a form that makes them click "add paragraph". The body format
 * is the smallest one that carries everything the published articles use, and
 * it round-trips them exactly — an article opened here and saved unchanged
 * comes back byte-identical, which is the only reason it is safe to open an
 * existing one at all.
 *
 * Every box is controlled, holding its text in React state. React resets an
 * uncontrolled form once a form action returns, and the first version of this
 * therefore threw away a whole article the moment a save was refused for one
 * wrong field — an hour's writing gone because a description was 109 characters
 * instead of 110.
 */
export function ArticleForm({ slug, article, isNew, status }: {
  slug: string;
  article: {
    title: string; heading: string; description: string; question: string; answer: string;
    author: string; published: string; updated: string; body: string; faq: string;
  };
  isNew: boolean;
  status: 'draft' | 'live' | null;
}) {
  const [state, action, pending] = useActionState<EditResult | null, FormData>(saveArticle, null);
  const [newSlug, setNewSlug] = useState(slug);
  const [draft, setDraft] = useState(article);
  const set = (k: keyof typeof article) => (v: string) => setDraft((prev) => ({ ...prev, [k]: v }));
  const p = state?.problems ?? {};

  return (
    <form action={action} className="flex flex-col gap-[13px]">
      <input type="hidden" name="slug" value={isNew ? newSlug : slug} />

      {isNew && (
        <section className="bg-card border border-line rounded-xl p-4">
          <label className="block">
            <span className="block text-[11.5px] text-ink-2 font-semibold mb-1">
              Slug — the article’s URL, under /learn/
            </span>
            <input
              id="article-slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              required
              className={box + (p.slug ? ' border-down' : '')}
            />
            {p.slug && <span className="block text-[11px] text-down mt-1">{p.slug}</span>}
          </label>
        </section>
      )}

      <section className="bg-card border border-line rounded-xl p-4 flex flex-col gap-[11px]">
        <h2 className="text-[13.5px] font-bold">What this answers</h2>
        <Field name="question" label="The question, in the reader’s own words" value={draft.question} onChange={set('question')}
          problem={p.question} help="One question, ending in a question mark. It becomes the page’s reason to exist." />
        <Field name="answer" label="The answer, in two sentences" value={draft.answer} onChange={set('answer')} rows={3}
          problem={p.answer} help="Answered before anything else on the page. Someone who reads only this should have what they came for." />
      </section>

      <section className="bg-card border border-line rounded-xl p-4 flex flex-col gap-[11px]">
        <h2 className="text-[13.5px] font-bold">How it appears in a result</h2>
        <Field name="title" label="Title" value={draft.title} onChange={set('title')} problem={p.title} maxLength={72}
          help="What a search result shows — about 60 characters of it." />
        <Field name="heading" label="Heading on the page" value={draft.heading} onChange={set('heading')} problem={p.heading}
          help="The h1. It can differ from the title, which is tuned for the result page." />
        <Field name="description" label="Description" value={draft.description} onChange={set('description')} rows={2} problem={p.description}
          help="Between 110 and 175 characters. Shorter wastes the space; longer is cut off." />
      </section>

      <section className="bg-card border border-line rounded-xl p-4 flex flex-col gap-[11px]">
        <h2 className="text-[13.5px] font-bold">The article</h2>
        <Field name="body" label="Body" value={draft.body} onChange={set('body')} rows={26} problem={p.blocks} />
        <div className="text-[11px] text-ink-3 leading-[1.8] bg-card-2 border border-line rounded-lg p-3">
          <b className="text-ink-2">The format, in full:</b>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-[11px]">{`## A heading          starts a section
---                   starts one with no heading
- an item             a list
1. an item            a numbered list
::: A worked example
What you pay :: 0.7 pips
~ A note under the table
:::
[a link](/brokers)    the only markup there is`}</pre>
          <p className="mt-2">
            Three links to three different pages, a worked example with real numbers, and
            500 words. Those are not house style — they are what stops a page in this
            category costing more than it earns, and the form will not save without them.
          </p>
        </div>
      </section>

      <section className="bg-card border border-line rounded-xl p-4 flex flex-col gap-[11px]">
        <h2 className="text-[13.5px] font-bold">Questions at the end</h2>
        <Field name="faq" label="FAQ" value={draft.faq} onChange={set('faq')} rows={10} problem={p.faq}
          help="Q: on one line, A: on the next. At least three, and none of them the headline question again." />
      </section>

      <section className="bg-card border border-line rounded-xl p-4 flex flex-col gap-[11px]">
        <h2 className="text-[13.5px] font-bold">Who and when</h2>
        <Field name="author" label="Author" value={draft.author} onChange={set('author')} problem={p.author}
          help="A name. An unsigned article about somebody’s money is worth nothing." />
        <div className="flex gap-2">
          <div className="flex-1"><Field name="published" label="Published" value={draft.published} onChange={set('published')} problem={p.published} /></div>
          <div className="flex-1"><Field name="updated" label="Last checked" value={draft.updated} onChange={set('updated')} problem={p.updated} /></div>
        </div>
      </section>

      <section className="bg-card border border-line rounded-xl p-4 flex flex-col gap-[11px]">
        <label className="block">
          <span className="block text-[11px] text-ink-3 mb-1">Editor</span>
          <input name="actor" required placeholder="you@commentfx" className={box} />
        </label>
        <label className="block">
          <span className="block text-[11px] text-ink-3 mb-1">Why — what changed, and what you read to decide it</span>
          <input name="note" className={box} />
        </label>

        <div className="flex items-center gap-3 flex-wrap">
          <button type="submit" disabled={pending}
            className="bg-ink text-white font-bold text-[13px] px-4 py-2 rounded-lg disabled:opacity-50">
            {pending ? 'Saving…' : isNew ? 'Create as draft' : 'Save'}
          </button>
          <span className="text-[11.5px] text-ink-3">
            {status === 'live'
              ? 'This article is live, so a save changes the site immediately.'
              : 'Saving stores a draft. Publishing is a separate button.'}
          </span>
        </div>

        {state && (
          <p className={`text-[12px] leading-[1.7] ${state.ok ? 'text-up' : 'text-down'}`} role="status">
            {state.message}
          </p>
        )}
      </section>
    </form>
  );
}
