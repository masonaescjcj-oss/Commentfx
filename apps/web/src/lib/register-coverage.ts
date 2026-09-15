import { BROKERS, regulator } from '@commentfx/core';
import { SOURCES, BLOCKED_SOURCES } from '@commentfx/ingest';

export interface RegisterCoverage {
  code: string;
  name: string;
  /** How many licences on this site the regulator issued. */
  licences: number;
  registryUrl: string | null;
  /** Null when we read it; the reason we cannot, when we do not. */
  blocked: string | null;
}

/**
 * Which of the regulators behind our licences can actually be read, counted
 * from the same lists the readers are registered in.
 *
 * Kept out of lib/registers.ts deliberately: that one is 'server-only' and
 * reaches the database, and this is wanted by a static page that has neither.
 *
 * Generated rather than written down. A sentence that says "two of nine" goes
 * stale the day a reader is added, and a stale claim about how much we check is
 * worse than no claim — which is not hypothetical. The footer on every page
 * said the inputs were checked against each regulator's own register while ten
 * of nineteen licences had no reader at all.
 */
export function registerCoverage(): {
  rows: RegisterCoverage[];
  licencesChecked: number;
  licencesTotal: number;
} {
  const counts = new Map<string, number>();
  for (const b of BROKERS) {
    for (const e of b.entities) {
      counts.set(e.licence.regulator, (counts.get(e.licence.regulator) ?? 0) + 1);
    }
  }

  const readable = new Set(SOURCES.map((s) => s.code));
  const blockedFor = new Map(BLOCKED_SOURCES.map((s) => [s.code, s.reason]));

  const rows: RegisterCoverage[] = [...counts.entries()]
    .map(([code, licences]) => ({
      code,
      name: regulator(code)?.name ?? code,
      licences,
      registryUrl: regulator(code)?.registryUrl ?? null,
      blocked: readable.has(code)
        ? null
        : blockedFor.get(code) ?? 'no reader written for this register yet',
    }))
    .sort((a, b) => Number(Boolean(a.blocked)) - Number(Boolean(b.blocked)) || b.licences - a.licences);

  return {
    rows,
    licencesTotal: [...counts.values()].reduce((s, n) => s + n, 0),
    licencesChecked: rows.filter((r) => !r.blocked).reduce((s, r) => s + r.licences, 0),
  };
}
