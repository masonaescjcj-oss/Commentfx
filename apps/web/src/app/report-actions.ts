'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { INCIDENT_LABELS, type IncidentKind } from '@commentfx/core';
import { getDb, reporterHash, submitReport } from '@commentfx/db';
import { DB_ENABLED, NO_DB_MESSAGE } from '@/lib/db-available';

export interface ReportResult { ok: boolean; message: string }

const KINDS = new Set(Object.keys(INCIDENT_LABELS));

/**
 * Derives the reporter's network address from the proxy headers, in the order a
 * request actually arrives: the platform's own header first, then the standard
 * one. Anything absent falls back to a constant, which is correct — it means
 * every such request counts as ONE reporter rather than as many as it likes.
 */
async function addressOf(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  return h.get('x-real-ip') ?? forwarded ?? 'unknown';
}

export async function reportStatus(_prev: ReportResult | null, form: FormData): Promise<ReportResult> {
  const brokerSlug = String(form.get('brokerSlug') ?? '').trim();
  const kind = String(form.get('kind') ?? '').trim();
  const note = String(form.get('note') ?? '').trim() || null;

  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  if (!brokerSlug) return { ok: false, message: 'Missing broker.' };
  if (!KINDS.has(kind)) return { ok: false, message: 'Pick what went wrong.' };
  if (note && note.length > 280) return { ok: false, message: 'Keep the note under 280 characters.' };

  const h = await headers();
  const hash = reporterHash(await addressOf(), h.get('user-agent') ?? '');

  try {
    const { db } = await getDb();
    const res = await submitReport(db, { brokerSlug, kind: kind as IncidentKind, hash, note });
    revalidatePath(`/brokers/${brokerSlug}`);
    revalidatePath('/status');
    return res;
  } catch (err) {
    console.error('[report] submit failed:', err);
    return { ok: false, message: 'Could not record that right now. Try again shortly.' };
  }
}
