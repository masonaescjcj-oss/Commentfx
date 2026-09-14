import 'server-only';
import { getDb, checksFor, latestRuns, openFindings } from '@commentfx/db';
import { SOURCES, BLOCKED_SOURCES } from '@commentfx/ingest';
import { DB_ENABLED } from './verify';

export type CheckKind = 'confirmed' | 'name-mismatch' | 'not-found' | 'source-unavailable';

export interface RegisterCheck {
  kind: CheckKind;
  registerName: string | null;
  detail: string;
  sourceUrl: string;
  /** ISO string — the page is a server component, so nothing crosses as a Date. */
  checkedAt: string;
}

/** Keyed by regulator and licence number, because a broker holds several. */
export type CheckMap = Record<string, RegisterCheck>;

export const checkKey = (regulatorCode: string, licenceNumber: string) =>
  `${regulatorCode}|${licenceNumber}`;

/** Regulator codes we can actually read a register for today. */
export const READABLE = new Set(SOURCES.map((s) => s.code));

/** Why a regulator has no automated check, when we know. */
export const BLOCKED_REASON: Record<string, string> = Object.fromEntries(
  BLOCKED_SOURCES.map((s) => [s.code, s.reason]),
);

export async function registerChecksFor(brokerSlug: string): Promise<CheckMap> {
  if (!DB_ENABLED) return {};
  try {
    const { db } = await getDb();
    const rows = await checksFor(db, brokerSlug);
    return Object.fromEntries(rows.map((r) => [
      checkKey(r.regulatorCode, r.licenceNumber),
      {
        kind: r.kind as CheckKind,
        registerName: r.registerName,
        detail: r.detail,
        sourceUrl: r.sourceUrl,
        checkedAt: r.checkedAt.toISOString(),
      },
    ]));
  } catch (err) {
    console.error('[registers] check lookup failed:', err);
    return {};
  }
}

export interface SourceHealth {
  code: string;
  name: string;
  sourceUrl: string;
  state: 'live' | 'blocked';
  /** Why a blocked source cannot be read. */
  reason: string | null;
  lastOk: boolean | null;
  lastEntryCount: number | null;
  lastReason: string | null;
  lastRanAt: string | null;
}

/**
 * Every source we know of, live and blocked alike. A register we cannot read is
 * listed with its reason rather than omitted, so coverage never looks complete
 * when it is not.
 */
export async function sourceHealth(): Promise<SourceHealth[]> {
  const declared = [
    ...SOURCES.map((s) => ({ code: s.code, name: s.name, sourceUrl: s.sourceUrl, state: 'live' as const, reason: null })),
    ...BLOCKED_SOURCES.map((s) => ({ ...s, state: 'blocked' as const })),
  ];

  let runs: Awaited<ReturnType<typeof latestRuns>> = [];
  if (DB_ENABLED) {
    try {
      const { db } = await getDb();
      runs = await latestRuns(db, declared.map((d) => d.code));
    } catch (err) {
      console.error('[registers] run lookup failed:', err);
    }
  }

  return declared.map((d) => {
    const run = runs.find((r) => r.code === d.code);
    return {
      ...d,
      lastOk: run?.ok ?? null,
      lastEntryCount: run?.entryCount ?? null,
      lastReason: run?.reason ?? null,
      lastRanAt: run?.ranAt ? run.ranAt.toISOString() : null,
    };
  });
}

export interface OpenFinding {
  brokerSlug: string;
  regulatorCode: string;
  licenceNumber: string;
  kind: CheckKind;
  detail: string;
  checkedAt: string;
}

/** The editor's work list: everything a register did not confirm. */
export async function unconfirmed(): Promise<OpenFinding[]> {
  if (!DB_ENABLED) return [];
  try {
    const { db } = await getDb();
    const rows = await openFindings(db);
    return rows.map((r) => ({
      brokerSlug: r.brokerSlug,
      regulatorCode: r.regulatorCode,
      licenceNumber: r.licenceNumber,
      kind: r.kind as CheckKind,
      detail: r.detail,
      checkedAt: r.checkedAt.toISOString(),
    }));
  } catch (err) {
    console.error('[registers] finding lookup failed:', err);
    return [];
  }
}
