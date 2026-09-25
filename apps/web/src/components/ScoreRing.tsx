/**
 * A score drawn as the share of a ring it fills.
 *
 * The same number the stars and the figure beside them already say, in a shape
 * that reads at a glance from across a wide screen — which is the only place it
 * is used. It is never the only statement of a score: the figure inside it is
 * the accessible name, and the SVG is hidden from assistive technology so a
 * screen reader hears "8.6" once rather than a description of a circle.
 *
 * `data-score` like every other score on the site, so check-seo's rule that a
 * sponsored placement never carries one covers this shape too.
 */
export function ScoreRing({ value, size = 120, stroke = 9, tone = 'dark', caption }: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: 'dark' | 'light';
  caption?: string;
}) {
  const r = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(10, value)) / 10) * c;
  const dark = tone === 'dark';
  return (
    <span className="relative inline-grid place-items-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          stroke={dark ? 'rgb(127 169 255 / 0.18)' : 'var(--color-card-3)'} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          stroke={dark ? 'var(--hero-accent)' : 'var(--color-accent)'}
          strokeDasharray={`${filled.toFixed(1)} ${c.toFixed(1)}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span className="relative flex flex-col items-center leading-none">
        <span
          data-score=""
          className={`font-[family-name:var(--font-display)] font-bold tracking-[-0.04em] tnum ${dark ? 'text-white' : 'text-ink'}`}
          style={{ fontSize: Math.round(size * 0.3) }}
        >
          {value.toFixed(1)}
        </span>
        {caption ? (
          <span className={`text-[11px] mt-[5px] ${dark ? 'text-[color:var(--hero-ink-3)]' : 'text-ink-3'}`}>{caption}</span>
        ) : null}
      </span>
    </span>
  );
}
