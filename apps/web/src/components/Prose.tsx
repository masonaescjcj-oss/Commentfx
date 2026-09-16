import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Three marks, and no markdown library.
 *
 * The articles are data, which means their prose has to carry links somehow,
 * and `[label](/path)` is the shortest notation a person editing the file will
 * get right. Pulling in a markdown renderer to read three patterns would hand
 * an article the ability to emit arbitrary HTML — on a site where the whole
 * point is that nothing on the page is unaccountable, that is a bad trade for
 * saving twenty lines.
 *
 * So: a link, bold, italic. Anything else is left as the characters typed,
 * which is the failure mode you want — a stray asterisk looks wrong and gets
 * fixed, where a half-parsed tag would silently swallow the sentence around it.
 *
 * `**` is tried before `*` because the alternation is ordered, so a bold run
 * never gets read as two italics.
 */
const INLINE = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

export function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let at = 0;

  for (const m of text.matchAll(INLINE)) {
    const i = m.index;
    if (i > at) out.push(text.slice(at, i));
    at = i + m[0].length;

    if (m[1] !== undefined && m[2] !== undefined) {
      out.push(
        <Link key={i} href={m[2]} className="text-accent font-semibold hover:underline underline-offset-2">
          {m[1]}
        </Link>,
      );
    } else if (m[3] !== undefined) {
      out.push(<b key={i} className="font-semibold text-ink">{m[3]}</b>);
    } else if (m[4] !== undefined) {
      out.push(<em key={i}>{m[4]}</em>);
    }
  }

  if (at < text.length) out.push(text.slice(at));
  return <>{out}</>;
}
