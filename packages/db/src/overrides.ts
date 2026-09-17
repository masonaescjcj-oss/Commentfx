import { eq, and, desc } from 'drizzle-orm';
import type { AppDb } from './client.ts';
import { recordOverrides, articleOverrides, auditLog } from './schema.ts';
import type { Kind } from './verification.ts';

/**
 * Reading and writing what an editor has changed about a record.
 *
 * Every write here also writes an audit row, in the same call, because the two
 * coming apart is how a change ends up on the site with nobody's name on it.
 * There is no function in this file that saves without logging.
 */

export interface OverrideRow {
  id: number;
  kind: Kind;
  slug: string;
  patch: Record<string, unknown>;
  isNew: boolean;
  status: 'draft' | 'live';
  note: string | null;
  updatedBy: string;
  updatedAt: Date;
}

const asRow = (r: typeof recordOverrides.$inferSelect): OverrideRow => ({
  id: r.id,
  kind: r.kind,
  slug: r.slug,
  patch: (r.patch ?? {}) as Record<string, unknown>,
  isNew: r.isNew,
  status: r.status,
  note: r.note,
  updatedBy: r.updatedBy,
  updatedAt: r.updatedAt,
});

/** The key a merge looks a record up by. */
export const overrideKey = (kind: Kind, slug: string) => `${kind}:${slug}`;

/**
 * Every live patch, keyed for the merge.
 *
 * One query for the whole site rather than one per record: a ranking page
 * renders forty records and forty round trips to find thirty-nine misses is
 * the kind of thing that makes a feature look like it costs more than it does.
 */
export async function livePatches(db: AppDb): Promise<Map<string, OverrideRow>> {
  const rows = await db.select().from(recordOverrides).where(eq(recordOverrides.status, 'live'));
  return new Map(rows.map((r) => [overrideKey(r.kind, r.slug), asRow(r)]));
}

/** Everything, drafts included — the admin's own list. */
export async function allOverrides(db: AppDb): Promise<OverrideRow[]> {
  const rows = await db.select().from(recordOverrides).orderBy(desc(recordOverrides.updatedAt));
  return rows.map(asRow);
}

export async function getOverride(db: AppDb, kind: Kind, slug: string): Promise<OverrideRow | null> {
  const rows = await db
    .select()
    .from(recordOverrides)
    .where(and(eq(recordOverrides.kind, kind), eq(recordOverrides.slug, slug)))
    .limit(1);
  return rows[0] ? asRow(rows[0]) : null;
}

export interface SaveOverride {
  kind: Kind;
  slug: string;
  patch: Record<string, unknown>;
  /** The record exists nowhere in code and this patch is the whole of it. */
  isNew?: boolean;
  status?: 'draft' | 'live';
  note?: string | null;
  actor: string;
}

/**
 * Write a patch, keeping the one-row-per-record rule.
 *
 * `status` is left alone when the caller does not name one, so saving an edit
 * to a live record keeps it live and saving an edit to a draft keeps it a
 * draft. Publishing is a separate, deliberate call.
 */
export async function saveOverride(db: AppDb, input: SaveOverride): Promise<OverrideRow> {
  const before = await getOverride(db, input.kind, input.slug);
  const status = input.status ?? before?.status ?? 'draft';

  const values = {
    kind: input.kind,
    slug: input.slug,
    patch: input.patch,
    isNew: input.isNew ?? before?.isNew ?? false,
    status,
    note: input.note ?? null,
    updatedBy: input.actor,
    updatedAt: new Date(),
  };

  const [row] = await db
    .insert(recordOverrides)
    .values(values)
    .onConflictDoUpdate({
      target: [recordOverrides.kind, recordOverrides.slug],
      set: {
        patch: values.patch,
        isNew: values.isNew,
        status: values.status,
        note: values.note,
        updatedBy: values.updatedBy,
        updatedAt: values.updatedAt,
      },
    })
    .returning();

  await db.insert(auditLog).values({
    actor: input.actor,
    action: before ? 'update' : 'create',
    kind: input.kind,
    slug: input.slug,
    field: Object.keys(input.patch).sort().join(', ') || null,
    // The whole patch either side, so the log answers "what did this used to
    // say" without needing the code record to hand.
    before: before ? JSON.stringify(before.patch) : null,
    after: JSON.stringify(input.patch),
  });

  return asRow(row!);
}

/** Show it to readers, or stop showing it. Nothing else about the row changes. */
export async function setOverrideStatus(
  db: AppDb,
  kind: Kind,
  slug: string,
  status: 'draft' | 'live',
  actor: string,
): Promise<OverrideRow | null> {
  const before = await getOverride(db, kind, slug);
  if (!before) return null;

  const [row] = await db
    .update(recordOverrides)
    .set({ status, updatedBy: actor, updatedAt: new Date() })
    .where(and(eq(recordOverrides.kind, kind), eq(recordOverrides.slug, slug)))
    .returning();

  await db.insert(auditLog).values({
    actor,
    action: status === 'live' ? 'publish' : 'unpublish',
    kind, slug,
    field: 'status',
    before: before.status,
    after: status,
  });
  return row ? asRow(row) : null;
}

/**
 * Throw the patch away.
 *
 * For a record that exists in code this restores exactly what the build says,
 * which is why discard is safe enough to offer next to save. For a record that
 * only ever existed here it deletes the record, and the caller is expected to
 * have asked first.
 */
export async function deleteOverride(db: AppDb, kind: Kind, slug: string, actor: string): Promise<boolean> {
  const before = await getOverride(db, kind, slug);
  if (!before) return false;

  await db
    .delete(recordOverrides)
    .where(and(eq(recordOverrides.kind, kind), eq(recordOverrides.slug, slug)));

  await db.insert(auditLog).values({
    actor,
    action: 'delete',
    kind, slug,
    field: null,
    before: JSON.stringify(before.patch),
    after: null,
  });
  return true;
}

/** What an editor has been doing, newest first. */
export async function recentEdits(db: AppDb, limit = 50) {
  return db.select().from(auditLog).orderBy(desc(auditLog.at)).limit(limit);
}

/* ── articles ──────────────────────────────────────────────────────────── */

export interface ArticleOverrideRow {
  id: number;
  slug: string;
  patch: Record<string, unknown>;
  isNew: boolean;
  status: 'draft' | 'live';
  note: string | null;
  updatedBy: string;
  updatedAt: Date;
}

const asArticleRow = (r: typeof articleOverrides.$inferSelect): ArticleOverrideRow => ({
  id: r.id,
  slug: r.slug,
  patch: (r.patch ?? {}) as Record<string, unknown>,
  isNew: r.isNew,
  status: r.status,
  note: r.note,
  updatedBy: r.updatedBy,
  updatedAt: r.updatedAt,
});

/** Every live article patch, keyed by slug. */
export async function liveArticlePatches(db: AppDb): Promise<Map<string, ArticleOverrideRow>> {
  const rows = await db.select().from(articleOverrides).where(eq(articleOverrides.status, 'live'));
  return new Map(rows.map((r) => [r.slug, asArticleRow(r)]));
}

export async function allArticleOverrides(db: AppDb): Promise<ArticleOverrideRow[]> {
  const rows = await db.select().from(articleOverrides).orderBy(desc(articleOverrides.updatedAt));
  return rows.map(asArticleRow);
}

export async function getArticleOverride(db: AppDb, slug: string): Promise<ArticleOverrideRow | null> {
  const rows = await db.select().from(articleOverrides).where(eq(articleOverrides.slug, slug)).limit(1);
  return rows[0] ? asArticleRow(rows[0]) : null;
}

export interface SaveArticleOverride {
  slug: string;
  patch: Record<string, unknown>;
  isNew?: boolean;
  status?: 'draft' | 'live';
  note?: string | null;
  actor: string;
}

export async function saveArticleOverride(db: AppDb, input: SaveArticleOverride): Promise<ArticleOverrideRow> {
  const before = await getArticleOverride(db, input.slug);
  const values = {
    slug: input.slug,
    patch: input.patch,
    isNew: input.isNew ?? before?.isNew ?? false,
    status: input.status ?? before?.status ?? ('draft' as const),
    note: input.note ?? null,
    updatedBy: input.actor,
    updatedAt: new Date(),
  };

  const [row] = await db
    .insert(articleOverrides)
    .values(values)
    .onConflictDoUpdate({
      target: articleOverrides.slug,
      set: {
        patch: values.patch,
        isNew: values.isNew,
        status: values.status,
        note: values.note,
        updatedBy: values.updatedBy,
        updatedAt: values.updatedAt,
      },
    })
    .returning();

  await db.insert(auditLog).values({
    actor: input.actor,
    action: before ? 'update article' : 'create article',
    kind: null,
    slug: input.slug,
    field: Object.keys(input.patch).sort().join(', ') || null,
    before: before ? JSON.stringify(before.patch).slice(0, 2000) : null,
    after: JSON.stringify(input.patch).slice(0, 2000),
  });

  return asArticleRow(row!);
}

export async function setArticleStatus(
  db: AppDb,
  slug: string,
  status: 'draft' | 'live',
  actor: string,
): Promise<ArticleOverrideRow | null> {
  const before = await getArticleOverride(db, slug);
  if (!before) return null;

  const [row] = await db
    .update(articleOverrides)
    .set({ status, updatedBy: actor, updatedAt: new Date() })
    .where(eq(articleOverrides.slug, slug))
    .returning();

  await db.insert(auditLog).values({
    actor,
    action: status === 'live' ? 'publish article' : 'unpublish article',
    kind: null,
    slug,
    field: 'status',
    before: before.status,
    after: status,
  });
  return row ? asArticleRow(row) : null;
}

export async function deleteArticleOverride(db: AppDb, slug: string, actor: string): Promise<boolean> {
  const before = await getArticleOverride(db, slug);
  if (!before) return false;

  await db.delete(articleOverrides).where(eq(articleOverrides.slug, slug));
  await db.insert(auditLog).values({
    actor,
    action: 'delete article',
    kind: null,
    slug,
    field: null,
    before: JSON.stringify(before.patch).slice(0, 2000),
    after: null,
  });
  return true;
}
