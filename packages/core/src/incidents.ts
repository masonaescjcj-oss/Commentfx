/**
 * Incident vocabulary and thresholds. These live in core, not in the database
 * package, because client components need them and must never pull a Postgres
 * driver into a browser bundle. The database package re-exports them so a
 * server caller still has one import.
 */

export const INCIDENT_KINDS = [
  'withdrawal-delay', 'platform-down', 'slippage', 'login-failure', 'deposit-failure', 'other',
] as const;

export type IncidentKind = (typeof INCIDENT_KINDS)[number];

export const INCIDENT_LABELS: Record<IncidentKind, string> = {
  'withdrawal-delay': 'Withdrawal taking longer than stated',
  'platform-down': 'Platform or terminal unreachable',
  'slippage': 'Unusual slippage or requotes',
  'login-failure': 'Cannot log in',
  'deposit-failure': 'Deposit not credited',
  'other': 'Something else',
};

/** The rolling window a report counts inside. */
export const WINDOW_HOURS = 24;

/**
 * Distinct reporters needed before the displayed status changes. Published on
 * the page, because a threshold nobody can see is indistinguishable from an
 * opinion.
 */
export const THRESHOLD = { degraded: 5, down: 15 } as const;

export type StatusLevel = 'normal' | 'degraded' | 'down';

export function levelFor(reporters: number): StatusLevel {
  if (reporters >= THRESHOLD.down) return 'down';
  if (reporters >= THRESHOLD.degraded) return 'degraded';
  return 'normal';
}

export interface StatusSummary {
  brokerSlug: string;
  level: StatusLevel;
  /** Distinct reporters in the window, across all kinds. */
  reporters: number;
  windowHours: number;
  byKind: Array<{ kind: IncidentKind; reporters: number }>;
  /** The most-reported kind, when there is one. */
  leading: IncidentKind | null;
}
