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
