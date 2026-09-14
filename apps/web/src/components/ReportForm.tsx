'use client';

import { useActionState, useState } from 'react';
import { INCIDENT_LABELS, type IncidentKind } from '@commentfx/core';
import { reportStatus, type ReportResult } from '@/app/report-actions';

const KINDS = Object.entries(INCIDENT_LABELS) as Array<[IncidentKind, string]>;

export function ReportForm({ brokerSlug }: { brokerSlug: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ReportResult | null, FormData>(reportStatus, null);

  if (state?.ok) {
    return (
      <p className="text-[12.5px] text-up leading-[1.7]" role="status">
        {state.message}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[13px] font-semibold text-brass hover:text-brass-2"
      >
        Having a problem? Report it →
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="brokerSlug" value={brokerSlug} />
      <fieldset className="flex flex-col gap-[6px]">
        <legend className="text-[11px] text-ink-3 mb-1">What is happening?</legend>
        {KINDS.map(([value, label], i) => (
          <label key={value} className="flex items-center gap-2 text-[12.5px]">
            <input type="radio" name="kind" value={value} defaultChecked={i === 0} required />
            {label}
          </label>
        ))}
      </fieldset>
      <label>
        <span className="block text-[11px] text-ink-3 mb-1">Detail (optional, shown only after review)</span>
        <input
          name="note"
          maxLength={280}
          className="w-full bg-card-2 border border-line rounded-lg px-3 py-2 text-[13px]"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink text-white font-bold text-[13px] px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Report'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[12.5px] text-ink-3">
          Cancel
        </button>
      </div>
      {state && !state.ok && (
        <p className="text-[11.5px] text-down" role="alert">{state.message}</p>
      )}
      <p className="text-[10.5px] text-ink-3 leading-[1.6]">
        No account needed and no address is stored — reports are counted by a salted
        digest that is rotated daily, so one person counts once and cannot be
        followed between days.
      </p>
    </form>
  );
}
