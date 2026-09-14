/**
 * Contrast, measured rather than judged.
 *
 * Every text colour on this site has to clear WCAG AA (4.5:1) against the
 * surface it sits on. The palette was checked once with a browser and fixed;
 * this file exists for the colours that arrive as *data* — a company's brand
 * pair on its logo tile — which no amount of care in the stylesheet can vouch
 * for. A tile whose initials are unreadable is a small thing, and it is still
 * the kind of small thing that adds up to a site that is tiring to use.
 */

const channel = (hex: string, at: number) => parseInt(hex.slice(at, at + 2), 16);

/** Accepts #RGB and #RRGGBB. Returns null for anything it cannot read. */
export function parseHex(input: string): [number, number, number] | null {
  const h = input.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h)) return null;
  const full = h.length === 4
    ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
    : h;
  return [channel(full, 1), channel(full, 3), channel(full, 5)];
}

const linear = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** Relative luminance, per WCAG 2.1. */
export function luminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb;
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export const AA_TEXT = 4.5;

const WHITE = '#FFFFFF';
const BLACK = '#0D1421';

const toHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase()}`;

/**
 * A legible pairing for a logo tile.
 *
 * Takes the brand's own colours as the preference and overrides them only when
 * they fail: first by trying the other of black and white, then — for the
 * mid-tone brand colours where neither works, which is most of them — by
 * darkening the tile until white text clears AA. The hue is kept, so the tile
 * still reads as the company's colour rather than as a generic swatch.
 */
export function legibleTile(bg: string, preferredFg: string): { bg: string; fg: string } {
  const rgb = parseHex(bg);
  if (!rgb) return { bg: BLACK, fg: WHITE };

  if (parseHex(preferredFg) && contrastRatio(preferredFg, bg) >= AA_TEXT) {
    return { bg, fg: preferredFg };
  }

  const best = contrastRatio(WHITE, bg) >= contrastRatio(BLACK, bg) ? WHITE : BLACK;
  if (contrastRatio(best, bg) >= AA_TEXT) return { bg, fg: best };

  let [r, g, b] = rgb;
  for (let i = 0; i < 24 && contrastRatio(WHITE, toHex(r, g, b)) < AA_TEXT; i++) {
    r *= 0.92; g *= 0.92; b *= 0.92;
  }
  return { bg: toHex(r, g, b), fg: WHITE };
}
