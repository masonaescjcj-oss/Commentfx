/**
 * The CommentFX mark: a speech bubble drawn as an open ring with its tail
 * dropping from the lower left.
 *
 * Inline SVG rather than a file, for three reasons that all matter here. It is
 * crisp at 24px in the header and at 40px in the hero without shipping two
 * assets. It costs no request, which on a site whose LCP element is the header
 * is not a rounding error. And it takes `currentColor` for the tail, so the one
 * mark works on white and on the dark hero panel without a second copy that
 * somebody has to remember to keep in step.
 *
 * The two shapes are a stroked ring and a filled stem, and they are allowed to
 * overlap: both are `currentColor`, so where they meet there is nothing to see,
 * and the alternative — one path with a hole punched by `fill-rule` — cannot
 * overlap at all without cancelling itself out.
 */
export function Mark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      {/* The bubble: a stroked circle with a gap cut by the dash pattern, then
          the whole element rotated to put that gap at the lower left. Rotating
          is why this is readable as source. A dash offset moves the gap by arc
          length, which nobody can picture; a rotation moves it by degrees,
          which anyone can. 87% of the circumference is drawn, so the gap is 47°
          wide, and -190° lands its centre at about eight o'clock. */}
      <circle
        cx="20"
        cy="18"
        r="12.4"
        stroke="currentColor"
        strokeWidth="7.2"
        strokeDasharray={`${(2 * Math.PI * 12.4 * 0.87).toFixed(2)} ${(2 * Math.PI * 12.4).toFixed(2)}`}
        transform="rotate(-190 20 18)"
      />
      {/* The tail. Its top edge lies inside the ring's stroke band at every
          point, so the two fuse with no seam at any size, and its inner corner
          stays 9.18 units from the centre against an 8.8 inner radius — which
          is the whole constraint: a pixel further in and it would close the
          bubble's hollow. */}
      <path d="M8.3 25.4 H15.5 V36.2 H8.3 Z" fill="currentColor" />
    </svg>
  );
}

/**
 * The mark and the name together, which is the logo.
 *
 * `tone` is the whole of the difference between the two places it appears. On
 * white the ring is the brand blue and the name is ink; on the dark panel both
 * are white, because a 5.88:1 blue chosen against white is not a colour to put
 * on navy.
 */
export function Logotype({ tone = 'light', size = 28, className = '' }: {
  tone?: 'light' | 'dark';
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-[7px] ${className}`}>
      <Mark size={size} className={tone === 'dark' ? 'text-white' : 'text-accent'} />
      <span
        className={`font-[family-name:var(--font-display)] font-bold tracking-[-0.035em] ${
          tone === 'dark' ? 'text-white' : 'text-ink'
        }`}
        style={{ fontSize: size * 0.62 }}
      >
        CommentFX
      </span>
    </span>
  );
}
