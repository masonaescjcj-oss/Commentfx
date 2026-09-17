'use client';

import { useActionState, useState } from 'react';
import { FIELDS, readPath, showValue, type FieldSpec } from '@commentfx/core';
import { saveRecord, type EditResult } from './record-actions';

/**
 * One control per field, generated from the field schema rather than written
 * out three times. Everything the form needs about a field — its type, its
 * options, whether it may be empty — comes from the same spec the save action
 * parses with, so a control and its parser cannot disagree about what a field
 * is.
 *
 * Every control is **controlled**, holding its value in React state, and that
 * is not a style preference. React resets an uncontrolled form after a form
 * action returns, so the first version of this threw away everything an editor
 * had typed the moment a save was refused — which is precisely the moment they
 * most need it back, and precisely when they are least likely to have it
 * anywhere else. A form that punishes you for getting a field wrong is a form
 * people stop using.
 */

const box = 'w-full bg-card-2 border border-line rounded-lg px-3 py-2 text-[13px]';

type Value = string | string[];

function Control({ spec, value, onChange, invalid }: {
  spec: FieldSpec; value: Value; onChange: (v: Value) => void; invalid: boolean;
}) {
  const name = `f:${spec.path}`;
  const border = invalid ? ' border-down' : '';
  const text = Array.isArray(value) ? '' : value;

  if (spec.type === 'multi') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-[6px] pt-1">
        {(spec.options ?? []).map((o) => (
          <label key={o} className="flex items-center gap-[6px] text-[12.5px]">
            <input
              type="checkbox"
              name={name}
              value={o}
              checked={selected.includes(o)}
              onChange={(e) => onChange(
                e.target.checked ? [...selected, o] : selected.filter((x) => x !== o),
              )}
              className="accent-[var(--accent)]"
            />
            {o}
          </label>
        ))}
      </div>
    );
  }

  if (spec.type === 'boolean') {
    return (
      <select name={name} value={text} onChange={(e) => onChange(e.target.value)} className={box + border}>
        {spec.nullable && <option value="">— not applicable —</option>}
        <option value="yes">yes</option>
        <option value="no">no</option>
      </select>
    );
  }

  if (spec.type === 'select') {
    return (
      <select name={name} value={text} onChange={(e) => onChange(e.target.value)} className={box + border}>
        {spec.nullable && <option value="">—</option>}
        {(spec.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  if (spec.type === 'longtext') {
    return (
      <textarea name={name} rows={3} value={text} onChange={(e) => onChange(e.target.value)} className={box + border} />
    );
  }

  return (
    <input
      name={name}
      type={spec.type === 'number' ? 'number' : 'text'}
      step={spec.step}
      inputMode={spec.type === 'number' ? 'decimal' : undefined}
      maxLength={spec.type === 'country' ? 2 : undefined}
      value={text}
      onChange={(e) => onChange(e.target.value)}
      className={box + border + (spec.type === 'number' || spec.type === 'country' ? ' tnum' : '')}
    />
  );
}

/** What a stored value looks like in a form control. */
function toForm(spec: FieldSpec, raw: unknown): Value {
  if (spec.type === 'multi') return Array.isArray(raw) ? raw.map(String) : [];
  if (spec.type === 'boolean') return raw === true ? 'yes' : raw === false ? 'no' : '';
  return raw === null || raw === undefined ? '' : String(raw);
}

export function RecordForm({ kind, slug, record, base, isNew, status }: {
  kind: 'broker' | 'prop' | 'exchange';
  slug: string;
  /** What the form starts from: the record as it currently stands, overrides included. */
  record: Record<string, unknown>;
  /** What the code says, so a changed field can show what it used to be. */
  base: Record<string, unknown> | null;
  isNew: boolean;
  status: 'draft' | 'live' | null;
}) {
  const [state, action, pending] = useActionState<EditResult | null, FormData>(saveRecord, null);
  const [newSlug, setNewSlug] = useState(slug);
  const [values, setValues] = useState<Record<string, Value>>(() =>
    Object.fromEntries(
      FIELDS[kind].flatMap((g) => g.fields).map((spec) => [spec.path, toForm(spec, readPath(record, spec.path))]),
    ),
  );
  const problems = state?.problems ?? {};

  return (
    <form action={action} className="flex flex-col gap-[13px]">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="slug" value={isNew ? newSlug : slug} />

      {isNew && (
        <label className="block">
          <span className="block text-[11px] text-ink-3 mb-1">
            Slug — this is the page’s URL and it cannot be changed later without breaking every link to it.
          </span>
          <input
            id="record-slug"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            required
            className={box + (problems.slug ? ' border-down' : '')}
          />
          {problems.slug && <span className="block text-[11px] text-down mt-1">{problems.slug}</span>}
        </label>
      )}

      {FIELDS[kind].map((group) => (
        <section key={group.title} className="bg-card border border-line rounded-xl p-4">
          <h2 className="text-[13.5px] font-bold mb-3">{group.title}</h2>
          <div className="flex flex-col gap-[11px]">
            {group.fields.map((spec) => {
              const wasValue = base === null ? undefined : readPath(base, spec.path);
              const overridden = base !== null
                && JSON.stringify(values[spec.path]) !== JSON.stringify(toForm(spec, wasValue));
              const problem = problems[spec.path];
              return (
                <label key={spec.path} className="block">
                  <span className="flex items-baseline gap-2 mb-1">
                    <span className="text-[11.5px] text-ink-2 font-semibold">{spec.label}</span>
                    {overridden && (
                      <span className="text-[10.5px] text-warn">code says {showValue(wasValue)}</span>
                    )}
                  </span>
                  <Control
                    spec={spec}
                    value={values[spec.path] ?? ''}
                    onChange={(v) => setValues((prev) => ({ ...prev, [spec.path]: v }))}
                    invalid={problem !== undefined}
                  />
                  {problem && <span className="block text-[11px] text-down mt-1">{problem}</span>}
                  {spec.help && !problem && (
                    <span className="block text-[11px] text-ink-3 mt-1 leading-[1.65]">{spec.help}</span>
                  )}
                </label>
              );
            })}
          </div>
        </section>
      ))}

      <section className="bg-card border border-line rounded-xl p-4 flex flex-col gap-[11px]">
        <label className="block">
          <span className="block text-[11px] text-ink-3 mb-1">Editor</span>
          <input name="actor" required placeholder="you@commentfx" className={box} />
        </label>
        <label className="block">
          <span className="block text-[11px] text-ink-3 mb-1">
            Why — what changed and what you read to decide it. This is what the next editor sees.
          </span>
          <input name="note" className={box} />
        </label>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            disabled={pending}
            className="bg-ink text-white font-bold text-[13px] px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {pending ? 'Saving…' : isNew ? 'Create as draft' : 'Save'}
          </button>
          <span className="text-[11.5px] text-ink-3">
            {status === 'live'
              ? 'This record is live, so a save changes the site immediately.'
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
