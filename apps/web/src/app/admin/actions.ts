'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { getDb, schema, verifyReview, hideReview, type Kind } from '@commentfx/db';
import { DB_ENABLED, NO_DB_MESSAGE } from '@/lib/db-available';
import { requireCapability } from '@/lib/session';

export interface RecordResult { ok: boolean; message: string }

const publicPath = (kind: Kind, slug: string) =>
  `/${kind === 'broker' ? 'brokers' : kind === 'prop' ? 'props' : 'exchanges'}/${slug}`;

/**
 * Records one field as checked. Four things are non-negotiable and enforced
 * here rather than in the form: an account with the right to do it, a source
 * URL (a verification with no source is an opinion), the value exactly as seen
 * at that source (so later drift is detectable), and an audit row, which the
 * admin has no route to delete.
 *
 * The actor is the signed-in account, not a box somebody filled in. That is the
 * difference accounts make to this file: "verified by" used to be whatever was
 * typed, which is a claim, and is now who was signed in, which is a fact.
 */
export async function recordVerification(
  _prev: RecordResult | null,
  form: FormData,
): Promise<RecordResult> {
  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  const gate = await requireCapability('verify');
  if (!gate.ok) return gate;
  const actor = gate.user.email;

  const kind = String(form.get('kind') ?? '') as Kind;
  const slug = String(form.get('slug') ?? '').trim();
  const field = String(form.get('field') ?? '').trim();
  const valueSeen = String(form.get('valueSeen') ?? '').trim();
  const sourceUrl = String(form.get('sourceUrl') ?? '').trim();
  const note = String(form.get('note') ?? '').trim() || null;

  if (!kind || !slug || !field) return { ok: false, message: 'Missing target.' };
  if (!valueSeen) return { ok: false, message: 'Record the value exactly as the source shows it.' };

  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    return { ok: false, message: 'A source URL is required — a check with no source is an opinion.' };
  }
  if (url.protocol !== 'https:') return { ok: false, message: 'The source must be an https URL.' };

  const { db } = await getDb();

  const [existing] = await db
    .select()
    .from(schema.verifications)
    .where(and(
      eq(schema.verifications.kind, kind),
      eq(schema.verifications.slug, slug),
      eq(schema.verifications.field, field),
    ));

  await db
    .insert(schema.verifications)
    .values({ kind, slug, field, valueSeen, sourceUrl: url.toString(), note, verifiedBy: actor })
    .onConflictDoUpdate({
      target: [schema.verifications.kind, schema.verifications.slug, schema.verifications.field],
      set: { valueSeen, sourceUrl: url.toString(), note, verifiedBy: actor, verifiedAt: new Date() },
    });

  await db.insert(schema.auditLog).values({
    actor,
    action: existing ? 'reverify' : 'verify',
    kind, slug, field,
    before: existing?.valueSeen ?? null,
    after: valueSeen,
  });

  revalidatePath(`/admin/${kind}/${slug}`);
  revalidatePath('/admin');
  revalidatePath(publicPath(kind, slug));

  if (existing && existing.valueSeen !== valueSeen) {
    return {
      ok: true,
      message: `Recorded — but the value moved since the last check (${existing.valueSeen} → ${valueSeen}). The record itself probably needs updating too.`,
    };
  }
  return { ok: true, message: 'Recorded.' };
}

/**
 * Checking a review, or taking one down.
 *
 * Verifying is the only path by which a review reaches a score, so it takes a
 * name: someone is accountable for having looked at the evidence. Hiding takes
 * a reason for the same purpose — a moderation decision nobody has to justify
 * is one nobody can be argued out of.
 */
export async function moderateReview(_prev: RecordResult | null, form: FormData): Promise<RecordResult> {
  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  const gate = await requireCapability('reviews');
  if (!gate.ok) return gate;
  const actor = gate.user.email;

  const id = Number(form.get('id'));
  const kind = String(form.get('kind') ?? 'broker').trim() as Kind;
  const slug = String(form.get('slug') ?? '').trim();
  const action = String(form.get('action') ?? '');
  const reason = String(form.get('reason') ?? '').trim();

  if (!Number.isInteger(id)) return { ok: false, message: 'Missing review.' };

  try {
    const { db } = await getDb();

    if (action === 'verify') {
      await verifyReview(db, id, actor);
      await db.insert(schema.auditLog).values({
        kind, slug, field: `review:${id}`,
        action: 'verified review', actor, after: 'verified',
      });
    } else if (action === 'hide') {
      if (!reason) return { ok: false, message: 'A review is only taken down with a reason.' };
      await hideReview(db, id, reason);
      await db.insert(schema.auditLog).values({
        kind, slug, field: `review:${id}`,
        action: 'hid review', actor, after: reason,
      });
    } else {
      return { ok: false, message: 'Unknown action.' };
    }

    revalidatePath('/admin');
    revalidatePath(publicPath(kind, slug));
    revalidatePath('/reviews');
    return { ok: true, message: action === 'verify' ? 'Checked. It counts now.' : 'Taken down.' };
  } catch (err) {
    console.error('[admin] review moderation failed:', err);
    return { ok: false, message: 'Could not record that. Try again.' };
  }
}
