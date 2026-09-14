/**
 * Token names come from whoever deployed the token. Two tricks show up
 * constantly and both are invisible in a rendered page:
 *
 *   1. Bidirectional control characters (U+202E and friends) reorder how the
 *      text displays, so a name can render as something it is not.
 *   2. Homograph characters -- a Cyrillic capital IE (U+0415) standing in for
 *      a Latin E, a Greek omicron for an o -- let a token impersonate a
 *      well-known one, character for character.
 *
 * Neither is an XSS risk (React escapes markup) but both are impersonation
 * risks, which for a safety radar is exactly the point. Names are cleaned
 * before display, and the fact that cleaning was needed is itself reported:
 * a deployer who reaches for a bidi override is telling you something.
 */

/** Zero-width characters, bidi controls and isolates, and the byte-order mark. */
const INVISIBLE = /[\u200B-\u200F\u061C\u202A-\u202E\u2066-\u2069\uFEFF]/g;
/** C0 and C1 control characters. */
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

const SCRIPTS = [
  { name: 'Latin', re: /[A-Za-z]/ },
  { name: 'Cyrillic', re: /[\u0400-\u04FF]/ },
  { name: 'Greek', re: /[\u0370-\u03FF]/ },
  { name: 'Armenian', re: /[\u0530-\u058F]/ },
] as const;

export interface NameCheck {
  /** Safe to render. The raw name must never reach the DOM. */
  clean: string;
  /** The name carried bidi or zero-width characters. */
  hadInvisible: boolean;
  /** The name mixes alphabets that look alike -- a homograph attempt. */
  mixedScripts: string[] | null;
  /** True when either trick is present. */
  deceptive: boolean;
}

export function checkName(raw: string): NameCheck {
  const hadInvisible = INVISIBLE.test(raw) || CONTROL.test(raw);
  INVISIBLE.lastIndex = 0;
  CONTROL.lastIndex = 0;

  const clean = raw.replace(INVISIBLE, '').replace(CONTROL, '').trim() || '(unnamed)';

  const present = SCRIPTS.filter((s) => s.re.test(clean)).map((s) => s.name);
  const mixedScripts = present.length > 1 ? [...present] : null;

  return { clean, hadInvisible, mixedScripts, deceptive: hadInvisible || mixedScripts !== null };
}
