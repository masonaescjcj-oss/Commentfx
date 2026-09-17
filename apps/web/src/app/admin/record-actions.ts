'use server';

import { revalidatePath } from 'next/cache';
import {
  getDb, saveOverride, setOverrideStatus, deleteOverride, getOverride, type Kind,
} from '@commentfx/db';
import {
  fieldsFor, parseField, readPath, writePath, sameValue,
  mergeRecord, validateRecord, type Problem,
} from '@commentfx/core';
import { DB_ENABLED, NO_DB_MESSAGE } from '@/lib/db-available';
import { requireCapability } from '@/lib/session';
import { baseRecord } from '@/lib/records';

export interface EditResult {
  ok: boolean;
  message: string;
  /** Keyed by field path, so the form can put each message on its own control. */
  problems?: Record<string, string>;
}

const KINDS = new Set<Kind>(['broker', 'prop', 'exchange']);

const publicPath = (kind: Kind, slug: string) =>
  `/${kind === 'broker' ? 'brokers' : kind === 'prop' ? 'props' : 'exchanges'}/${slug}`;

/** Everything a change to one record can move. */
function revalidateFor(kind: Kind, slug: string) {
  revalidatePath(publicPath(kind, slug));
  revalidatePath(`/${kind === 'broker' ? 'brokers' : kind === 'prop' ? 'props' : 'exchanges'}`);
  revalidatePath('/');
  // The sitemap reads the same merged view, so a record that has just appeared
  // or gone is asked for, or withdrawn, in the same breath.
  revalidatePath('/sitemap.xml');
  revalidatePath(`/admin/records/${kind}/${slug}`);
  revalidatePath('/admin/records');
}

const byField = (problems: Problem[]): Record<string, string> =>
  Object.fromEntries(problems.map((p) => [p.field, p.message]));

/**
 * Save an edit.
 *
 * The order matters and is the whole design: parse every control, build the
 * patch out of what actually changed, merge it over the code record, and
 * validate the *merged* result with the same function the test suite runs over
 * the curated records. A value that could not survive CI cannot be saved here.
 *
 * What is stored is the patch rather than the merged record, so the code record
 * stays the source of everything nobody edited — a later correction in the data
 * files reaches the page instead of being shadowed by a year-old copy of it.
 */
export async function saveRecord(_prev: EditResult | null, form: FormData): Promise<EditResult> {
  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  // Who, before what. The name on an audit row is the account that was signed
  // in, never a box somebody filled in — that was the whole problem with the
  // shared token this replaced.
  const gate = await requireCapability('records');
  if (!gate.ok) return gate;
  const actor = gate.user.email;

  const kind = String(form.get('kind') ?? '') as Kind;
  const slug = String(form.get('slug') ?? '').trim().toLowerCase();
  const note = String(form.get('note') ?? '').trim() || null;

  if (!KINDS.has(kind)) return { ok: false, message: 'Unknown kind.' };
  if (!slug) return { ok: false, message: 'A slug is required — it is the page’s URL.' };

  const base = baseRecord(kind, slug);
  const isNew = base === undefined;

  const patch: Record<string, unknown> = {};
  const problems: Record<string, string> = {};

  for (const spec of fieldsFor(kind)) {
    const key = `f:${spec.path}`;
    const raw = spec.type === 'multi'
      ? form.getAll(key).map((v) => String(v))
      : String(form.get(key) ?? '');
    const parsed = parseField(spec, raw);
    if (parsed.problem !== undefined) {
      problems[spec.path] = parsed.problem;
      continue;
    }
    // Only what moved. A patch that repeats the code record is a copy that
    // stops later corrections in the data files from ever reaching the page.
    if (!isNew && sameValue(parsed.value, readPath(base, spec.path))) continue;
    writePath(patch, spec.path, parsed.value);
  }

  if (Object.keys(problems).length > 0) {
    return { ok: false, message: 'Some fields need fixing before this can be saved.', problems };
  }

  if (isNew) {
    writePath(patch, 'slug', slug);
    // A record that exists nowhere else needs the parts no form edits, or its
    // page cannot render. These are the defaults a new record starts from, not
    // facts about it — the editor replaces them from the research.
    fillNewRecordDefaults(kind, patch);
  }

  const merged = isNew ? patch : mergeRecord(base as object, patch);
  const failed = validateRecord(kind, merged);
  if (failed.length > 0) {
    return {
      ok: false,
      message: 'This would publish a record the build would have rejected.',
      problems: byField(failed),
    };
  }

  if (!isNew && Object.keys(patch).length === 0) {
    const existing = await getOverride(await dbOf(), kind, slug);
    if (!existing) return { ok: true, message: 'Nothing changed, so nothing was stored.' };
  }

  await saveOverride(await dbOf(), { kind, slug, patch, isNew, note, actor });
  revalidateFor(kind, slug);
  return {
    ok: true,
    message: isNew
      ? 'Saved as a draft. Nothing is on the site until you publish it.'
      : 'Saved. If this record was already live, the change is live with it.',
  };
}

/**
 * The parts of a record no form edits, for a record that has no code behind it.
 *
 * A logo is a file and a colour, the entity map is a list with its own rules,
 * and neither belongs in a flat form. A new record starts with an initial-mark
 * logo and an empty map, which is exactly what the page renders for a record
 * nobody has researched yet — and what the indexing gate reads as "not ready
 * to be indexed".
 */
function fillNewRecordDefaults(kind: Kind, patch: Record<string, unknown>) {
  const name = String(patch.name ?? '');
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!).join('').toUpperCase();
  patch.logo ??= { initials: initials || '??', bg: '#1b1f27', fg: '#e8ecf3' };
  if (kind === 'broker') {
    patch.entities ??= [];
    patch.reviews ??= { verifiedCount: 0, verifiedAverage: null };
    writePath(patch, 'cost.verifiedAt', null);
    writePath(patch, 'payments.verifiedAt', null);
  }
  if (kind === 'prop') patch.entities ??= [];
}

/** Publish, unpublish, or throw the patch away. */
export async function changeOverride(_prev: EditResult | null, form: FormData): Promise<EditResult> {
  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  const gate = await requireCapability('records');
  if (!gate.ok) return gate;
  const actor = gate.user.email;

  const kind = String(form.get('kind') ?? '') as Kind;
  const slug = String(form.get('slug') ?? '').trim();
  const action = String(form.get('action') ?? '');

  if (!KINDS.has(kind) || !slug) return { ok: false, message: 'Unknown record.' };

  const db = await dbOf();
  const existing = await getOverride(db, kind, slug);
  if (!existing) return { ok: false, message: 'There is nothing stored for this record.' };

  if (action === 'publish') {
    // The same gate as saving, re-run at the moment of publication: the code
    // record may have moved under a draft that was written weeks ago.
    const base = baseRecord(kind, slug);
    const merged = existing.isNew ? existing.patch : mergeRecord(base as object, existing.patch);
    const failed = validateRecord(kind, merged);
    if (failed.length > 0) {
      return {
        ok: false,
        message: 'The record this draft would produce no longer validates, so it was not published.',
        problems: byField(failed),
      };
    }
    await setOverrideStatus(db, kind, slug, 'live', actor);
    revalidateFor(kind, slug);
    return { ok: true, message: 'Live.' };
  }

  if (action === 'unpublish') {
    await setOverrideStatus(db, kind, slug, 'draft', actor);
    revalidateFor(kind, slug);
    return { ok: true, message: 'Taken down. The site shows what the code says again.' };
  }

  if (action === 'discard') {
    await deleteOverride(db, kind, slug, actor);
    revalidateFor(kind, slug);
    return {
      ok: true,
      message: existing.isNew
        ? 'Deleted. That record existed only here.'
        : 'Discarded. The record is exactly what the code says again.',
    };
  }

  return { ok: false, message: 'Unknown action.' };
}

async function dbOf() {
  const { db } = await getDb();
  return db;
}
