import 'server-only';
import { getDb, livePatches, liveArticlePatches, type Kind } from '@commentfx/db';
import {
  BROKERS, PROPS, EXCHANGES, ARTICLES,
  brokerBySlug, propBySlug, exchangeBySlug,
  mergeRecord, validateArticle,
  type Broker, type PropFirm, type Exchange, type Article,
} from '@commentfx/core';
import { DB_ENABLED } from './db-available.ts';
import { patchKey, type Patches } from './repo.ts';

/**
 * The live editor overrides, in the shape the ranking functions take.
 *
 * Same contract as `reviewStats`: no database, or a database that will not
 * answer, means an empty map and a site that renders exactly what the code
 * says. An admin panel being down is not a reason for the directory to be
 * down, and this is the line that guarantees it.
 */
export async function livePatchMap(): Promise<Patches> {
  if (!DB_ENABLED) return new Map();
  try {
    const { db } = await getDb();
    const rows = await livePatches(db);
    return new Map(
      [...rows.values()].map((r) => [
        patchKey(r.kind, r.slug),
        { patch: r.patch, isNew: r.isNew, at: r.updatedAt.toISOString().slice(0, 10) },
      ]),
    );
  } catch (err) {
    console.error('[records] override lookup failed:', err);
    return new Map();
  }
}

/**
 * The record as the code says it, before any override.
 *
 * The editor needs both halves at once: this to show what a value used to be
 * and to work out what actually changed, and the merged record to show what a
 * reader currently sees. Undefined means the record exists nowhere in code,
 * which is how the admin knows it is creating rather than patching.
 */
export function baseRecord(kind: Kind, slug: string): Broker | PropFirm | Exchange | undefined {
  if (kind === 'broker') return brokerBySlug(slug);
  if (kind === 'prop') return propBySlug(slug);
  return exchangeBySlug(slug);
}

/** Every slug the code knows about, in ranking order. */
export function codeSlugs(kind: Kind): string[] {
  if (kind === 'broker') return BROKERS.map((b) => b.slug);
  if (kind === 'prop') return PROPS.map((p) => p.slug);
  return EXCHANGES.map((e) => e.slug);
}

/* ── articles ──────────────────────────────────────────────────────────── */

/**
 * The articles as a reader sees them: what the code says, with any live editor
 * patch merged over the top and any article that exists only in the database
 * added. Same contract as the records — a database that will not answer means
 * the code's own list, never a page that fails to render.
 *
 * Ordered newest first, which is the order the index page has always shown and
 * the only one that survives an article being added between two others.
 */
export async function liveArticles(): Promise<Article[]> {
  if (!DB_ENABLED) return ARTICLES;
  let patches: Map<string, { patch: Record<string, unknown>; isNew: boolean }>;
  try {
    const { db } = await getDb();
    const rows = await liveArticlePatches(db);
    patches = new Map([...rows.values()].map((r) => [r.slug, { patch: r.patch, isNew: r.isNew }]));
  } catch (err) {
    console.error('[records] article lookup failed:', err);
    return ARTICLES;
  }
  if (patches.size === 0) return ARTICLES;

  const known = new Set(ARTICLES.map((a) => a.slug));
  const slugs = [...known, ...[...patches.keys()].filter((s) => !known.has(s))];

  const out = ARTICLES.map((a) => {
    const entry = patches.get(a.slug);
    if (!entry || entry.isNew) return a;
    const merged = mergeRecord(a, entry.patch);
    return validateArticle(merged, slugs).length === 0 ? merged : a;
  });

  for (const [slug, entry] of patches) {
    if (!entry.isNew || known.has(slug)) continue;
    const article = { ...(entry.patch as object), slug } as Article;
    if (validateArticle(article, slugs).length === 0) out.push(article);
  }

  return out.sort((a, b) => b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug));
}

/** One article as a reader sees it, or undefined if there is no such page. */
export async function liveArticle(slug: string): Promise<Article | undefined> {
  return (await liveArticles()).find((a) => a.slug === slug);
}
