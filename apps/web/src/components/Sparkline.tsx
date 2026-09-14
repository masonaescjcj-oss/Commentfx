/** Inline SVG so a list of 100 sparklines costs no extra requests and no JS. */
export function Sparkline({ points, up, w = 58, h = 26 }: {
  points: number[]; up: boolean; w?: number; h?: number;
}) {
  if (points.length < 2) return <span style={{ width: w, height: h }} className="shrink-0" />;
  const lo = Math.min(...points);
  const hi = Math.max(...points);
  const range = hi - lo || 1;
  const d = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - 2.5 - ((v - lo) / range) * (h - 5);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const stroke = up ? 'var(--color-up)' : 'var(--color-down)';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="shrink-0" aria-hidden>
      <path d={d} stroke={stroke} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
