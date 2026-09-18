import type { Article, ArticleBlock } from './data/articles.ts';

/**
 * An article's body as a writer types it, and back again.
 *
 * `ArticleBlock[]` is the right shape to render and to test — a paragraph in a
 * .tsx file cannot be counted or linted, which is why the articles were
 * structured in the first place. It is the wrong shape to *write* in a form:
 * nobody composes prose through nested fieldsets, and a form that made them
 * would be a form nobody uses.
 *
 * So the editor works in text and this converts, both ways. The format is the
 * smallest one that holds everything the existing articles use, and no more:
 *
 *     ## A heading                 starts a block
 *     ---                          starts one with no heading, which the
 *                                  closing block of an article usually is
 *     Ordinary lines are a
 *     paragraph, with [a link](/brokers) as the only markup.
 *
 *     - an item                    an unordered list
 *     1. an item                   an ordered one
 *
 *     ![what it shows](/a.webp 1600x900)   a diagram
 *     ~ An optional caption under it.
 *
 *     ::: A worked example         an example, set apart
 *     What you pay :: 0.7 pips
 *     ~ A note under the table.
 *     :::
 *
 * `article-text.test.ts` round-trips every published article through both
 * directions and asserts the result is identical to what the code holds. That
 * is the only honest test of a format like this: anything it cannot carry
 * would be silently lost the first time an editor opened an existing article
 * and pressed save.
 */

const EXAMPLE_OPEN = ':::';
const RULE = '---';
/**
 * `![alt](/path.webp 1600x900)`. The dimensions ride along with the path
 * because they are not optional — see `ArticleFigure` — and a separate line for
 * them is a line a writer would forget.
 */
const FIGURE = /^!\[([^\]]*)\]\(\s*(\S+?)\s+(\d+)x(\d+)\s*\)\s*$/;

export function formatArticleBody(blocks: ArticleBlock[]): string {
  const out: string[] = [];

  for (const [i, block] of blocks.entries()) {
    const chunks: string[] = [];
    if (block.heading) chunks.push(`## ${block.heading}`);
    // A block with no heading needs a mark of its own, or its paragraphs read
    // as more of the block before it and the two merge on the way back in.
    // The closing block of an article is usually exactly this shape.
    else if (i > 0) chunks.push(RULE);
    for (const p of block.paragraphs) chunks.push(p);

    if (block.list) {
      chunks.push(
        block.list.items
          .map((item, i) => (block.list!.ordered ? `${i + 1}. ${item}` : `- ${item}`))
          .join('\n'),
      );
    }

    if (block.figure) {
      const f = block.figure;
      const lines = [`![${f.alt}](${f.src} ${f.w}x${f.h})`];
      if (f.caption) lines.push(`~ ${f.caption}`);
      chunks.push(lines.join('\n'));
    }

    if (block.example) {
      const lines = [`${EXAMPLE_OPEN} ${block.example.title}`];
      for (const [label, value] of block.example.rows) lines.push(`${label} :: ${value}`);
      if (block.example.note) lines.push(`~ ${block.example.note}`);
      lines.push(EXAMPLE_OPEN);
      chunks.push(lines.join('\n'));
    }

    out.push(chunks.join('\n\n'));
  }

  return out.join('\n\n');
}

/**
 * Text back into blocks.
 *
 * A `## heading` opens a new block. Everything up to the next one belongs to
 * it, and the fixed order the renderer uses — paragraphs, then the list, then
 * the example — is the order they come out in, so a writer cannot produce a
 * block shape the page cannot draw.
 */
export function parseArticleBody(text: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  let current: ArticleBlock | null = null;

  const open = (heading?: string) => {
    // Keys in the order the data files write them, so a parsed block and a
    // hand-written one serialise the same way for anything that looks at the
    // text rather than the structure.
    current = { ...(heading ? { heading } : {}), paragraphs: [] };
    blocks.push(current);
    return current;
  };

  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (!line.trim()) { i += 1; continue; }

    if (line.startsWith('## ')) {
      open(line.slice(3).trim());
      i += 1;
      continue;
    }

    if (line.trim() === RULE) {
      open();
      i += 1;
      continue;
    }

    if (!current) open();
    const block = current as unknown as ArticleBlock;

    if (line.startsWith(EXAMPLE_OPEN)) {
      const title = line.slice(EXAMPLE_OPEN.length).trim();
      const rows: Array<[string, string]> = [];
      let note: string | undefined;
      i += 1;
      while (i < lines.length && lines[i]!.trim() !== EXAMPLE_OPEN) {
        const row = lines[i]!;
        if (row.startsWith('~ ')) note = row.slice(2).trim();
        else if (row.includes(' :: ')) {
          const at = row.indexOf(' :: ');
          rows.push([row.slice(0, at).trim(), row.slice(at + 4).trim()]);
        }
        i += 1;
      }
      i += 1; // the closing :::
      block.example = { title, rows, ...(note ? { note } : {}) };
      continue;
    }

    const fig = FIGURE.exec(line);
    if (fig) {
      const [, alt = '', src = '', w = '0', h = '0'] = fig;
      // A `~ ` line belongs to the figure above it. Inside an example it is the
      // table's note; there is no ambiguity because that one is read by the
      // example's own loop before it ever reaches here.
      const next = lines[i + 1];
      const caption = next?.startsWith('~ ') ? next.slice(2).trim() : undefined;
      block.figure = { src, alt, w: Number(w), h: Number(h), ...(caption ? { caption } : {}) };
      i += caption ? 2 : 1;
      continue;
    }

    if (/^([-*]\s|\d+\.\s)/.test(line)) {
      const ordered = /^\d+\.\s/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^([-*]\s|\d+\.\s)/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^([-*]\s|\d+\.\s)/, '').trim());
        i += 1;
      }
      block.list = { items, ...(ordered ? { ordered: true } : {}) };
      continue;
    }

    // Everything else is a paragraph, running to the next blank line so a
    // writer can wrap it however they like without producing three paragraphs.
    const para: string[] = [];
    while (i < lines.length && lines[i]!.trim() && !lines[i]!.startsWith('## ')
           && lines[i]!.trim() !== RULE
           && !lines[i]!.startsWith(EXAMPLE_OPEN) && !FIGURE.test(lines[i]!)
           && !/^([-*]\s|\d+\.\s)/.test(lines[i]!)) {
      para.push(lines[i]!.trim());
      i += 1;
    }
    block.paragraphs.push(para.join(' '));
  }

  return blocks;
}

/* ── the FAQ, in the same spirit ───────────────────────────────────────── */

/**
 * One question and its answer per pair of lines, because a form with three
 * fixed question boxes is a form that cannot hold four questions.
 *
 *     Q: Does a licence mean my money is safe?
 *     A: No. It means ...
 */
export function formatArticleFaq(faq: Article['faq']): string {
  return faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n\n');
}

export function parseArticleFaq(text: string): Article['faq'] {
  const out: Article['faq'] = [];
  let q: string | null = null;
  const answer: string[] = [];

  const flush = () => {
    if (q !== null) out.push({ q, a: answer.join(' ').trim() });
    q = null;
    answer.length = 0;
  };

  for (const raw of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    if (/^Q:\s*/i.test(line)) { flush(); q = line.replace(/^Q:\s*/i, ''); continue; }
    if (/^A:\s*/i.test(line)) { answer.push(line.replace(/^A:\s*/i, '')); continue; }
    if (line && q !== null) answer.push(line);
  }
  flush();
  return out;
}
