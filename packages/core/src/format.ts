export const usd = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B`
  : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M`
  : n >= 1000 ? `$${n.toLocaleString('en-US')}`
  : `$${n}`;

export const pips = (n: number) => n.toFixed(n < 1 ? 1 : 1);
export const leverage = (n: number) => `1:${n.toLocaleString('en-US')}`;

export const hours = (h: number) =>
  h < 1 ? `${Math.round(h * 60)} min` : h <= 48 ? `${h} hrs` : `${Math.round(h / 24)} days`;

export const isoDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

/* ── English that generated sentences keep getting wrong ─────────────────── */

/**
 * The possessive of a name, which a template literal cannot do.
 *
 * `${name}’s` produced "E8 Markets’s own pages" on a live page. A name already
 * ending in s takes the bare apostrophe, and a directory whose prose is
 * generated will hit this on every third company it adds.
 */
export const possessive = (name: string) =>
  name.endsWith('s') || name.endsWith('S') ? `${name}’` : `${name}’s`;

/**
 * "a" or "an", by how the name is said rather than how it is spelt.
 *
 * "a E8 Markets challenge" was on the page, because E8 begins with a consonant
 * letter and an vowel sound. The letters below are the ones whose English names
 * start with a vowel — F, H, L, M, N, R, S and X read as "ef", "aitch", "el"
 * and so on — which is what decides the article when a name starts with an
 * initialism or a digit-letter pair.
 */
const VOWEL_SOUND = /^[aeiou]/i;
const VOWEL_LETTER_NAME = /^[8aefhilmnorsx]/i;

export function indefinite(name: string): 'a' | 'an' {
  const first = name.trim().charAt(0);
  if (!first) return 'a';
  // A name that opens with an initialism or a digit is read letter by letter.
  const initialism = /^[A-Z0-9]{2}/.test(name.trim());
  if (initialism) return VOWEL_LETTER_NAME.test(first) ? 'an' : 'a';
  return VOWEL_SOUND.test(first) ? 'an' : 'a';
}
