/**
 * Shared scoring mechanics. Brokers, prop firms and exchanges each define their
 * own components; this file owns the one rule they all share — a component with
 * no data is excluded and the remaining weights are renormalised, never scored
 * as zero. Keeping that in one place is what stops the three verticals drifting
 * into three different definitions of "no data yet".
 */

export interface Component<K extends string> {
  key: K;
  label: string;
  /** 0–10, or null when there is not enough data to score it honestly. */
  value: number | null;
  weight: number;
  appliedWeight: number;
  note: string;
}

export interface Composite<K extends string> {
  total: number;
  components: Component<K>[];
  skipped: K[];
}

export interface Input<K extends string> {
  key: K;
  value: number | null;
  note: string;
}

export const clamp = (n: number, lo = 0, hi = 10) => Math.min(hi, Math.max(lo, n));
export const round1 = (n: number) => Math.round(n * 10) / 10;

/** Maps a value onto 0–10 between two anchor points, clamped at both ends. */
export function scale(value: number, worst: number, best: number): number {
  if (worst === best) return 10;
  return clamp(round1(((value - worst) / (best - worst)) * 10));
}

export function composite<K extends string>(
  inputs: Input<K>[],
  weights: Record<K, number>,
  labels: Record<K, string>,
): Composite<K> {
  const liveWeight = inputs
    .filter((i) => i.value !== null)
    .reduce((s, i) => s + weights[i.key], 0);

  const components: Component<K>[] = inputs.map((i) => ({
    key: i.key,
    label: labels[i.key],
    value: i.value,
    weight: weights[i.key],
    appliedWeight: i.value === null || liveWeight === 0 ? 0 : weights[i.key] / liveWeight,
    note: i.note,
  }));

  return {
    total: round1(components.reduce((s, c) => s + (c.value ?? 0) * c.appliedWeight, 0)),
    components,
    skipped: inputs.filter((i) => i.value === null).map((i) => i.key),
  };
}
