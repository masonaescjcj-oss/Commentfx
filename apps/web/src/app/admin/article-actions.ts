'use server';

import { revalidatePath } from 'next/cache';
import {
  getDb, saveArticleOverride, setArticleStatus, deleteArticleOverride, getArticleOverride,
} from '@commentfx/db';
import {
  ARTICLES, articleBySlug, mergeRecord, validateArticle,
  parseArticleBody, parseArticleFaq, sameDeep, type Article, type Problem,
} from '@commentfx/core';
import { DB_ENABLED, NO_DB_MESSAGE } from '@/lib/db-available';
import { requireCapability } from '@/lib/session';
import type { EditResult } from './record-actions';

/**
 * Writing and publishing articles.
 *
 * The same shape as the record editor and for the same reasons — a patch over
 * what the code says, drafts invisible to readers, validation of the merged
 * result before anything is stored — with one difference that matters: an
 * article is prose, so the form works in text and the parser turns it back into
 * the structure the page renders. The round trip is tested over every published
 * article, because a format that cannot carry something would drop it silently
 * the first time somebody opened an existing article and pressed save.
 */

const byField = (problems: Problem[]): Record<string, string> =>
  Object.fromEntries(problems.map((p) => [p.field, p.message]));

function revalidateArticle(slug: string) {
  revalidatePath(`/learn/${slug}`);
  revalidatePath('/learn');
  revalidatePath('/');
  // The sitemap is generated from the same merged view, so a page that has just
  // appeared or gone has to be asked for, or withdrawn, in the same breath.
  revalidatePath('/sitemap.xml');
  revalidatePath('/admin/articles');
  revalidatePath(`/admin/articles/${slug}`);
}

const SCALARS = ['title', 'heading', 'description', 'question', 'answer', 'author', 'topic', 'published', 'updated'] as const;

export async function saveArticle(_prev: EditResult | null, form: FormData): Promise<EditResult> {
  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  const gate = await requireCapability('articles');
  if (!gate.ok) return gate;
  const actor = gate.user.email;

  const slug = String(form.get('slug') ?? '').trim().toLowerCase();
  const note = String(form.get('note') ?? '').trim() || null;

  if (!slug) return { ok: false, message: 'A slug is required — it is the article’s URL.' };

  const base = articleBySlug(slug);
  const isNew = base === undefined;

  const patch: Record<string, unknown> = {};
  for (const key of SCALARS) {
    const value = String(form.get(key) ?? '').trim();
    if (isNew || value !== String(base?.[key] ?? '')) patch[key] = value;
  }

  const body = String(form.get('body') ?? '');
  const faq = String(form.get('faq') ?? '');
  const blocks = parseArticleBody(body);
  const questions = parseArticleFaq(faq);
  // Prose is compared by what it parses to rather than by the text typed, so
  // re-wrapping a paragraph is not a change and does not make a patch that
  // shadows the code.
  if (isNew || !sameDeep(blocks, base?.blocks)) patch.blocks = blocks;
  if (isNew || !sameDeep(questions, base?.faq)) patch.faq = questions;

  if (isNew) patch.slug = slug;

  const merged = (isNew ? patch : mergeRecord(base as Article, patch)) as Partial<Article>;
  const known = [...new Set([...ARTICLES.map((a) => a.slug), slug])];
  const failed = validateArticle(merged, known);
  if (failed.length > 0) {
    return {
      ok: false,
      message: 'This is not ready to publish yet.',
      problems: byField(failed),
    };
  }

  const db = await dbOf();
  if (!isNew && Object.keys(patch).length === 0 && !(await getArticleOverride(db, slug))) {
    return { ok: true, message: 'Nothing changed, so nothing was stored.' };
  }

  await saveArticleOverride(db, { slug, patch, isNew, note, actor });
  revalidateArticle(slug);
  return {
    ok: true,
    message: isNew
      ? 'Saved as a draft. Nothing is on the site until you publish it.'
      : 'Saved. If this article was already live, the change is live with it.',
  };
}

export async function changeArticle(_prev: EditResult | null, form: FormData): Promise<EditResult> {
  if (!DB_ENABLED) return { ok: false, message: NO_DB_MESSAGE };
  const gate = await requireCapability('articles');
  if (!gate.ok) return gate;
  const actor = gate.user.email;

  const slug = String(form.get('slug') ?? '').trim();
  const action = String(form.get('action') ?? '');

  if (!slug) return { ok: false, message: 'Unknown article.' };

  const db = await dbOf();
  const existing = await getArticleOverride(db, slug);
  if (!existing) return { ok: false, message: 'There is nothing stored for this article.' };

  if (action === 'publish') {
    const base = articleBySlug(slug);
    const merged = (existing.isNew ? existing.patch : mergeRecord(base as Article, existing.patch)) as Partial<Article>;
    const failed = validateArticle(merged, [...new Set([...ARTICLES.map((a) => a.slug), slug])]);
    if (failed.length > 0) {
      return { ok: false, message: 'This draft no longer passes, so it was not published.', problems: byField(failed) };
    }
    await setArticleStatus(db, slug, 'live', actor);
    revalidateArticle(slug);
    return { ok: true, message: 'Published.' };
  }

  if (action === 'unpublish') {
    await setArticleStatus(db, slug, 'draft', actor);
    revalidateArticle(slug);
    return { ok: true, message: 'Taken down.' };
  }

  if (action === 'discard') {
    await deleteArticleOverride(db, slug, actor);
    revalidateArticle(slug);
    return {
      ok: true,
      message: existing.isNew ? 'Deleted.' : 'Discarded. The article is what the code says again.',
    };
  }

  return { ok: false, message: 'Unknown action.' };
}

async function dbOf() {
  const { db } = await getDb();
  return db;
}
