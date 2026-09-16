import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARTICLES, articleBySlug, articleLinks, articleWordCount } from './articles.ts';

/**
 * docs/SEO.md §5.3 is a list of rules for what an article must be. A rule
 * nothing enforces is a preference, and preferences are what the fifteenth
 * article breaks — so each of them is a test here, and the article layer cannot
 * grow past them without going red.
 */

const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).filter(Boolean);

test('every article answers one question, in the first two sentences', () => {
  for (const a of ARTICLES) {
    assert.ok(a.question.trim().endsWith('?'), `${a.slug}: question is not a question`);
    assert.ok(sentences(a.answer).length <= 2, `${a.slug}: the answer runs to ${sentences(a.answer).length} sentences`);
    assert.ok(a.answer.length > 80, `${a.slug}: the answer is too short to be one`);
  }
});

test('every article links to at least three pages that earn, with descriptive anchors', () => {
  for (const a of ARTICLES) {
    const links = articleLinks(a);
    assert.ok(links.length >= 3, `${a.slug}: ${links.length} internal links`);

    for (const { label, path } of links) {
      assert.ok(path.startsWith('/'), `${a.slug}: ${path} is not an internal path`);
      assert.ok(!path.includes('//'), `${a.slug}: ${path} looks malformed`);
      // "click here" is two words and says nothing, which is why a word count
      // alone was not enough — the first version of this test passed an anchor
      // reading "click here" and had to be told about it by hand.
      assert.ok(label.split(/\s+/).length >= 2, `${a.slug}: anchor "${label}" says nothing`);
      assert.ok(
        !/\b(click here|read more|learn more|find out more|see here|this page|this link)\b/i.test(label)
        && !/^(here|this|link)$/i.test(label.trim()),
        `${a.slug}: anchor "${label}" is filler`,
      );
    }

    // Three money pages, not three links to the same one.
    assert.ok(new Set(links.map((l) => l.path)).size >= 3, `${a.slug}: fewer than three distinct destinations`);
  }
});

test('an article that links to another article links to one that exists', () => {
  for (const a of ARTICLES) {
    for (const { path } of articleLinks(a)) {
      if (!path.startsWith('/learn/')) continue;
      const slug = path.slice('/learn/'.length);
      assert.ok(articleBySlug(slug), `${a.slug} links to /learn/${slug}, which is not an article`);
      assert.notEqual(slug, a.slug, `${a.slug} links to itself`);
    }
  }
});

test('every article has an author and two real dates', () => {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  for (const a of ARTICLES) {
    assert.ok(a.author.trim().length > 0, `${a.slug}: no author`);
    assert.match(a.published, iso, `${a.slug}: published`);
    assert.match(a.updated, iso, `${a.slug}: updated`);
    assert.ok(Number.isFinite(Date.parse(`${a.published}T00:00:00Z`)), `${a.slug}: published is not a date`);
    assert.ok(
      Date.parse(`${a.updated}T00:00:00Z`) >= Date.parse(`${a.published}T00:00:00Z`),
      `${a.slug}: last checked before it was published`,
    );
  }
});

test('every article is long enough to be worth a page of its own', () => {
  // Below this it is a paragraph competing with the record pages for the same
  // queries, which is how a site talks itself down rather than up.
  for (const a of ARTICLES) {
    const words = articleWordCount(a);
    assert.ok(words >= 500, `${a.slug}: ${words} words`);
  }
});

test('an article carries a worked example with numbers in it', () => {
  for (const a of ARTICLES) {
    const examples = a.blocks.flatMap((b) => (b.example ? [b.example] : []));
    assert.ok(examples.length >= 1, `${a.slug}: no worked example`);
    for (const e of examples) {
      assert.ok(e.rows.length >= 3, `${a.slug}: "${e.title}" has ${e.rows.length} rows`);
      assert.ok(e.rows.every(([k, v]) => k.trim() && v.trim()), `${a.slug}: "${e.title}" has an empty cell`);
    }
  }
});

test('every article has questions, and none of them repeats the headline one', () => {
  for (const a of ARTICLES) {
    assert.ok(a.faq.length >= 3, `${a.slug}: ${a.faq.length} questions`);
    for (const { q, a: answer } of a.faq) {
      assert.ok(q.trim().endsWith('?'), `${a.slug}: "${q}" is not a question`);
      assert.ok(answer.length > 60, `${a.slug}: the answer to "${q}" is a shrug`);
      assert.notEqual(q.toLowerCase(), a.question.toLowerCase(), `${a.slug}: the FAQ repeats the headline question`);
    }
  }
});

test('slugs, titles and descriptions are unique and fit a result page', () => {
  assert.equal(new Set(ARTICLES.map((a) => a.slug)).size, ARTICLES.length, 'duplicate slug');
  assert.equal(new Set(ARTICLES.map((a) => a.title)).size, ARTICLES.length, 'duplicate title');

  for (const a of ARTICLES) {
    assert.match(a.slug, /^[a-z0-9-]+$/, `${a.slug}: not a slug`);
    // Google truncates a title around 60 characters and a description around
    // 160. Over is not an error, it is a sentence the reader never sees.
    assert.ok(a.title.length <= 72, `${a.slug}: title is ${a.title.length} characters`);
    assert.ok(a.description.length >= 110 && a.description.length <= 175,
      `${a.slug}: description is ${a.description.length} characters`);
  }
});

test('nothing in an article is undefined, empty or half-written markup', () => {
  for (const a of ARTICLES) {
    const all = [
      a.title, a.heading, a.description, a.question, a.answer,
      ...a.blocks.flatMap((b) => [
        ...(b.heading ? [b.heading] : []),
        ...b.paragraphs,
        ...(b.list?.items ?? []),
        ...(b.example ? [b.example.title, ...b.example.rows.flat(), b.example.note ?? ''] : []),
      ]),
      ...a.faq.flatMap((f) => [f.q, f.a]),
    ];
    for (const line of all) {
      assert.ok(!/undefined|NaN|\[object/.test(line), `${a.slug}: "${line.slice(0, 60)}"`);
      assert.ok(!/ {2}/.test(line), `${a.slug}: double space in "${line.slice(0, 60)}"`);
      // An unclosed [ or ( is a link that renders as its own source code.
      assert.equal((line.match(/\[/g) ?? []).length, (line.match(/\]/g) ?? []).length, `${a.slug}: "${line.slice(0, 60)}"`);
      assert.equal((line.match(/\*\*/g) ?? []).length % 2, 0, `${a.slug}: odd bold in "${line.slice(0, 60)}"`);
    }
  }
});
