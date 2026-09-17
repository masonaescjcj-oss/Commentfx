import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatArticleBody, parseArticleBody, formatArticleFaq, parseArticleFaq,
} from './article-text.ts';
import { ARTICLES } from './data/articles.ts';

/**
 * The only honest test of a format like this is the round trip over what the
 * site already publishes. Anything the format cannot carry would be silently
 * lost the first time an editor opened an existing article and pressed save —
 * a list dropped, a worked example flattened into a paragraph, a note gone —
 * and nobody would find out from the form, which would look like it worked.
 */
test('every published article survives being written out and read back', () => {
  for (const a of ARTICLES) {
    const back = parseArticleBody(formatArticleBody(a.blocks));
    assert.deepEqual(back, a.blocks, a.slug);
  }
});

test('every published FAQ survives the same trip', () => {
  for (const a of ARTICLES) {
    assert.deepEqual(parseArticleFaq(formatArticleFaq(a.faq)), a.faq, a.slug);
  }
});

/* ── the format, piece by piece ────────────────────────────────────────── */

test('a heading opens a block and everything after it belongs to that block', () => {
  const blocks = parseArticleBody('## One\n\nFirst.\n\n## Two\n\nSecond.');
  assert.equal(blocks.length, 2);
  assert.deepEqual(blocks[0], { paragraphs: ['First.'], heading: 'One' });
  assert.deepEqual(blocks[1], { paragraphs: ['Second.'], heading: 'Two' });
});

test('text before any heading is still a block, so nothing a writer types is dropped', () => {
  const blocks = parseArticleBody('An opening line with no heading.');
  assert.equal(blocks.length, 1);
  assert.deepEqual(blocks[0], { paragraphs: ['An opening line with no heading.'] });
});

/**
 * A writer wrapping a paragraph at 80 columns must not get four paragraphs.
 * This is the difference between a format people can use and one they fight.
 */
test('a wrapped paragraph is one paragraph', () => {
  const blocks = parseArticleBody('A sentence that runs\nacross three\nlines of text.');
  assert.deepEqual(blocks[0]?.paragraphs, ['A sentence that runs across three lines of text.']);
});

/**
 * The case the round trip found, and the reason the format has a rule at all.
 * Every article closes with a headless block — a last paragraph pointing at the
 * pages that earn — and without a mark of its own it read as more of the block
 * before it and the two merged on the way back in. A format that loses a block
 * would lose it silently, in a form that looked like it had worked.
 */
test('a headless block after a headed one stays a separate block', () => {
  const blocks = parseArticleBody('## One\n\nFirst.\n\n---\n\nA closing line.');
  assert.equal(blocks.length, 2);
  assert.deepEqual(blocks[1], { paragraphs: ['A closing line.'] });
  assert.match(formatArticleBody(blocks), /---\n\nA closing line\./);
});

test('a list is a list, and an ordered one stays ordered', () => {
  assert.deepEqual(parseArticleBody('- one\n- two')[0]?.list, { items: ['one', 'two'] });
  assert.deepEqual(parseArticleBody('1. one\n2. two')[0]?.list, { items: ['one', 'two'], ordered: true });
});

test('a worked example keeps its rows, its order and its note', () => {
  const blocks = parseArticleBody(
    '::: What a spread costs\nSpread :: 0.7 pips\nCommission :: $7\n~ Per standard lot, round turn.\n:::',
  );
  assert.deepEqual(blocks[0]?.example, {
    title: 'What a spread costs',
    rows: [['Spread', '0.7 pips'], ['Commission', '$7']],
    note: 'Per standard lot, round turn.',
  });
});

test('an example with no note does not invent one', () => {
  const blocks = parseArticleBody('::: Title\nA :: 1\n:::');
  assert.deepEqual(blocks[0]?.example, { title: 'Title', rows: [['A', '1']] });
});

/**
 * The renderer draws a block in a fixed order — heading, paragraphs, list,
 * example — so the parser produces that order whatever order it was typed in.
 * A writer cannot compose a block the page cannot draw.
 */
test('a block comes out in the order the page draws it, whatever order it was typed', () => {
  const blocks = parseArticleBody('## H\n\n::: E\nA :: 1\n:::\n\n- item\n\nA paragraph.');
  assert.equal(blocks.length, 1);
  const b = blocks[0]!;
  assert.equal(b.heading, 'H');
  assert.deepEqual(b.paragraphs, ['A paragraph.']);
  assert.deepEqual(b.list, { items: ['item'] });
  assert.equal(b.example?.title, 'E');
  // And writing it back out puts it in that order on the page.
  assert.match(formatArticleBody(blocks), /## H\n\nA paragraph\.\n\n- item\n\n::: E/);
});

test('a link is left exactly as written, because it is the only markup there is', () => {
  const text = 'Check it against [the broker rankings](/brokers) before you decide.';
  assert.deepEqual(parseArticleBody(text)[0]?.paragraphs, [text]);
});

test('blank input is no blocks rather than one empty one', () => {
  assert.deepEqual(parseArticleBody(''), []);
  assert.deepEqual(parseArticleBody('\n\n   \n'), []);
});

test('a FAQ answer may run to several lines', () => {
  const faq = parseArticleFaq('Q: Is it safe?\nA: No.\nIt means something narrower.\n\nQ: Why?\nA: Because.');
  assert.deepEqual(faq, [
    { q: 'Is it safe?', a: 'No. It means something narrower.' },
    { q: 'Why?', a: 'Because.' },
  ]);
});
