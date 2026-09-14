import type { NextRequestInit } from '../fetch.ts';
import type { RegisterEntry, RegisterResult, RegisterSource } from './types.ts';

const URL_ = 'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/';

const strip = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/**
 * CySEC publishes the register of Cypriot investment firms as server-rendered
 * cards, one per firm, on a single page. Parsing is done on the labelled
 * fields rather than on position, so a layout change degrades to "found fewer
 * entries" and is caught by the sanity check below rather than producing
 * confidently wrong data.
 */
export function parseCysec(html: string): RegisterEntry[] {
  const entries: RegisterEntry[] = [];

  // The firm name is the card heading, which sits OUTSIDE and above card-body,
  // so each record is taken from one card-title anchor to the next rather than
  // from the body alone. Getting this wrong is not hypothetical: keying on
  // card-body produced 247 correctly-parsed licence numbers with every name
  // missing, which then read as five false name mismatches.
  const parts = html.split(/<a[^>]*class="[^"]*card-title[^"]*"[^>]*>/i).slice(1);

  for (const part of parts) {
    const firmName = strip(part.slice(0, part.indexOf('</a>') === -1 ? 200 : part.indexOf('</a>')));
    const block = part.slice(0, 4000);
    const text = strip(block);

    const licence = /Licence Number\s*:?\s*([0-9]{1,3}\/[0-9]{2})/i.exec(text)?.[1];
    if (!licence || !firmName) continue;

    const trading = /Approved Trade Names?\s*:?\s*(.*?)(?:Licence Number|Company Registration|Telephone|$)/i
      .exec(text)?.[1] ?? '';

    entries.push({
      licenceNumber: licence,
      firmName,
      tradingNames: trading.split(/\s{2,}|,/).map((t) => t.trim()).filter((t) => t.length > 1),
      status: /withdraw|renounc/i.test(text) ? 'withdrawn' : 'active',
    });
  }
  return entries;
}

export const cysec: RegisterSource = {
  code: 'CySEC',
  name: 'Cyprus Securities and Exchange Commission',
  sourceUrl: URL_,
  async fetch(): Promise<RegisterResult> {
    const fetchedAt = new Date().toISOString();
    let html: string;
    try {
      const init: NextRequestInit = {
        headers: { 'user-agent': 'CommentFX/0.1 (+https://commentfx.com)' },
        signal: AbortSignal.timeout(20_000),
        next: { revalidate: 21_600 },
      };
      const res = await fetch(URL_, init);
      if (!res.ok) return { ok: false, regulator: 'CySEC', sourceUrl: URL_, reason: `HTTP ${res.status}`, fetchedAt };
      html = await res.text();
    } catch (err) {
      const reason = err instanceof Error && err.name === 'TimeoutError' ? 'timeout' : 'network error';
      return { ok: false, regulator: 'CySEC', sourceUrl: URL_, reason, fetchedAt };
    }

    const entries = parseCysec(html);

    // Two sanity checks, because a parser can fail in two different ways and
    // only one of them is obvious.
    //
    // Count: a register this size does not legitimately shrink to a handful.
    if (entries.length < 50) {
      return {
        ok: false, regulator: 'CySEC', sourceUrl: URL_, fetchedAt,
        reason: `parsed only ${entries.length} entries — the page layout has probably changed`,
      };
    }
    // Quality: the count can look perfect while a field silently comes back
    // empty, which is worse than parsing nothing because it reads as data.
    const named = entries.filter((e) => e.firmName.length > 2 && !/^Licence /.test(e.firmName));
    if (named.length < entries.length * 0.9) {
      return {
        ok: false, regulator: 'CySEC', sourceUrl: URL_, fetchedAt,
        reason: `only ${named.length} of ${entries.length} entries carry a firm name — the markup has changed`,
      };
    }

    return { ok: true, regulator: 'CySEC', sourceUrl: URL_, entries, fetchedAt };
  },
};
