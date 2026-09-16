'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isTopicFor, BODY_MAX, type ReviewKind, type ReviewTopic } from '@commentfx/core';
import {
  getDb, reporterHash, submitReview, withdrawReview, withdrawalCode, parseWithdrawalCode,
} from '@commentfx/db';
import { DB_ENABLED, NO_DB_MESSAGE } from '@/lib/db-available';

export interface ReviewResult {
  ok: boolean;
  message: string;
  /** Shown once, never stored in a form, never recoverable. */
  deleteToken?: string;
}

const KINDS = new Set<string>(['broker', 'prop', 'exchange']);

/** Same derivation as the incident reports: see the note there on the fallback. */
async function addressOf(): Promise<string> {
  const h = await headers();
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  return h.get('x-real-ip') ?? forwarded ?? 'unknown';
}

const segmentFor = (kind: string) =>
  kind === 'broker' ? 'brokers' : kind === 'prop' ? 'props' : 'exchanges';

const pathFor = (kind: string, slug: string) => `/${segmentFor(kind)}/${slug}`;

/**
 * Purges the page a write affects.
 *
 * Both calls are needed and neither is redundant. The literal path clears that
 * one entry; the route pattern is what actually reaches a page prerendered
 * from generateStaticParams, whose cache entry Next keys by the dynamic
 * segment. With only the literal path a reader could publish a review, be told
 * it was live, and reload to a page that still did not have it.
 */
function purge(kind: string, slug: string) {
  revalidatePath(pathFor(kind, slug));
  revalidatePath(`/${segmentFor(kind)}/[slug]`, 'page');
  revalidatePath('/reviews');
}

export async function postReview(_prev: ReviewResult | null, form: FormData): Promise<ReviewResult> {
  const kind = String(form.get('kind') ?? '').trim();
  const slug = String(form.get('slug') ?? '').trim();
  const topic = String(form.get('topic') ?? '').trim();
  // Empty means the person wrote words and left it at that, which is allowed.
  const raw = String(form.get('rating') ?? '').trim();
  const rating = raw === '' || raw === '0' ? null : Number(raw);
  const body = String(form.get('body') ?? '');
  const evidenceNote = String(form.get('evidenceNote') ?? '').trim() || null;

  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  if (!slug || !KINDS.has(kind)) return { ok: false, message: 'Missing company.' };
  if (!isTopicFor(kind as ReviewKind, topic)) {
    return { ok: false, message: 'Choose what this review is about.' };
  }
  if (evidenceNote && evidenceNote.length > BODY_MAX) {
    return { ok: false, message: 'Keep the note to an editor shorter.' };
  }

  const h = await headers();
  const authorHash = reporterHash(await addressOf(), h.get('user-agent') ?? '');

  try {
    const { db } = await getDb();
    const res = await submitReview(db, {
      kind: kind as ReviewKind, slug, rating, topic: topic as ReviewTopic,
      body, authorHash, evidenceNote,
    });

    if (!res.ok) {
      if ('duplicate' in res) {
        return {
          ok: false,
          message: 'You have already written about this broker on this topic today. Come back tomorrow if you have something new.',
        };
      }
      return { ok: false, message: res.problems.map((p) => p.message).join(' ') };
    }

    purge(kind, slug);
    return {
      ok: true,
      deleteToken: withdrawalCode(res.id, res.deleteToken),
      message: 'Published. It is live now, marked unverified — it reaches the score only after an editor checks it.',
    };
  } catch (err) {
    console.error('[review] submit failed:', err);
    return { ok: false, message: 'Could not publish that right now. Try again shortly.' };
  }
}

export async function removeReview(_prev: ReviewResult | null, form: FormData): Promise<ReviewResult> {
  const code = String(form.get('code') ?? '').trim();
  const parsed = parseWithdrawalCode(code);

  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  if (!parsed) return { ok: false, message: 'Paste the whole code you were given, including the number before the dot.' };

  try {
    const { db } = await getDb();
    const done = await withdrawReview(db, parsed.id, parsed.token);
    if (done === null) {
      // Deliberately the same answer either way: telling someone that a review
      // exists but their token is wrong tells them something about a review
      // that is not theirs.
      return { ok: false, message: 'That link does not match a review we can withdraw.' };
    }
    // withdrawReview says which record it belonged to, so exactly the pages
    // that showed it are cleared — rather than three layouts on the chance.
    purge(done.kind, done.slug);
    return { ok: true, message: 'Withdrawn. It is off the page and counts towards nothing.' };
  } catch (err) {
    console.error('[review] withdraw failed:', err);
    return { ok: false, message: 'Could not withdraw that right now. Try again shortly.' };
  }
}
