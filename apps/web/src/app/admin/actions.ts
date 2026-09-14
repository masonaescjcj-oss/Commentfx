'use server';

import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { getDb, schema, type Kind } from '@commentfx/db';

export interface RecordResult { ok: boolean; message: string }

const publicPath = (kind: Kind, slug: string) =>
  `/${kind === 'broker' ? 'brokers' : kind === 'prop' ? 'props' : 'exchanges'}/${slug}`;

/**
 * Records one field as checked. Three things are non-negotiable and enforced
 * here rather than in the form: a source URL (a verification with no source is
 * an opinion), the value exactly as seen at that source (so later drift is
 * detectable), and an audit row, which the admin has no route to delete.
 */
export async function recordVerification(
  _prev: RecordResult | null,
  form: FormData,
): Promise<RecordResult> {
  const kind = String(form.get('kind') ?? '') as Kind;
  const slug = String(form.get('slug') ?? '').trim();
  const field = String(form.get('field') ?? '').trim();
  const valueSeen = String(form.get('valueSeen') ?? '').trim();
  const sourceUrl = String(form.get('sourceUrl') ?? '').trim();
  const note = String(form.get('note') ?? '').trim() || null;
  const actor = String(form.get('actor') ?? '').trim();

  if (!kind || !slug || !field) return { ok: false, message: 'Missing target.' };
  if (!actor) return { ok: false, message: 'Who is making this check?' };
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
