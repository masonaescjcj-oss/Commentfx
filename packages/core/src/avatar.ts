/**
 * A colour for a comment from someone with no account.
 *
 * The hue comes from the review's own id, so a column of comments is a column
 * of different colours rather than one grey repeated. Saturation and lightness
 * are fixed, and that is the whole safety of it: a random hue can be any
 * colour, but a random *contrast* cannot, and white has to be readable on every
 * one of the 360 it can pick.
 *
 * 46% and 30% were measured, not guessed. The first version used 42% lightness
 * because it looked right, and axe failed it at 2.90:1 — yellow at that
 * lightness is nearly white. At 30% the worst point on the whole wheel is
 * 5.20:1, still at yellow, and avatar.test.ts walks all 360 to keep it there.
 */
export const AVATAR_SATURATION = 46;
export const AVATAR_LIGHTNESS = 30;

const hex2 = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0');

/** HSL to hex, so the colour can be measured by the same code that checks it. */
export function hslHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const lum = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lum, 1 - lum);
  const f = (n: number) => lum - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${hex2(f(0))}${hex2(f(8))}${hex2(f(4))}`;
}

/** Skips I and O, which are a 1 and a 0 in most faces at this size. */
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export function avatarFor(id: number): { initials: string; colour: string } {
  const a = LETTERS[(id * 7) % LETTERS.length]!;
  const b = LETTERS[(id * 13 + 5) % LETTERS.length]!;
  return {
    initials: a + b,
    colour: hslHex((id * 47) % 360, AVATAR_SATURATION, AVATAR_LIGHTNESS),
  };
}
