import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gte, sql } from 'drizzle-orm';
import {
  INCIDENT_LABELS, WINDOW_HOURS, THRESHOLD, levelFor,
  type IncidentKind, type StatusLevel, type StatusSummary,
} from '@commentfx/core';
import type { AppDb } from './client.ts';
import { statusReports } from './schema.ts';

// Re-exported so a server caller has one import; the definitions live in core
// because client components need them and must not reach a database driver.
export { INCIDENT_LABELS, WINDOW_HOURS, THRESHOLD, levelFor };
export type { IncidentKind, StatusLevel, StatusSummary };

/**
 * The salt rotates daily so a reporter hash cannot be followed across days.
 * A process-lifetime secret is mixed in as well, so a hash cannot be
 * brute-forced back to an address from the table alone.
 */
const SECRET = process.env.REPORT_HASH_SECRET ?? randomBytes(32).toString('hex');

export function reporterHash(ip: string, userAgent: string, now = new Date()): string {
  const day = now.toISOString().slice(0, 10);
  return createHash('sha256').update(`${day}:${SECRET}:${ip}:${userAgent}`).digest('hex').slice(0, 32);
}

export async function statusFor(db: AppDb, brokerSlug: string, now = new Date()): Promise<StatusSummary> {
  const since = new Date(now.getTime() - WINDOW_HOURS * 3_600_000);

  const rows = await db
    .select({
      kind: statusReports.kind,
      reporters: sql<number>`count(distinct ${statusReports.reporterHash})::int`,
    })
    .from(statusReports)
    .where(and(
      eq(statusReports.brokerSlug, brokerSlug),
      eq(statusReports.hidden, false),
      gte(statusReports.createdAt, since),
    ))
    .groupBy(statusReports.kind);

  // Distinct reporters overall, not the sum per kind: one person reporting two
  // kinds is one person, and summing would let them count twice.
  const [total] = await db
    .select({ reporters: sql<number>`count(distinct ${statusReports.reporterHash})::int` })
    .from(statusReports)
    .where(and(
      eq(statusReports.brokerSlug, brokerSlug),
      eq(statusReports.hidden, false),
      gte(statusReports.createdAt, since),
    ));

  const byKind = rows
    .map((r) => ({ kind: r.kind as IncidentKind, reporters: Number(r.reporters) }))
    .sort((a, b) => b.reporters - a.reporters);

  const reporters = Number(total?.reporters ?? 0);
  return {
    brokerSlug,
    level: levelFor(reporters),
    reporters,
    windowHours: WINDOW_HOURS,
    byKind,
    leading: byKind[0]?.kind ?? null,
  };
}

export async function statusForAll(db: AppDb, slugs: string[], now = new Date()) {
  return Promise.all(slugs.map((s) => statusFor(db, s, now)));
}

export interface SubmitResult { ok: boolean; message: string }

/**
 * Records one report. The unique index does the deduplication, so a repeated
 * submission is a no-op rather than an error the caller has to interpret — and
 * because the salt rotates daily, the same person may report again tomorrow.
 */
export async function submitReport(
  db: AppDb,
  input: { brokerSlug: string; kind: IncidentKind; hash: string; note?: string | null },
): Promise<SubmitResult> {
  const note = input.note?.trim().slice(0, 280) || null;

  const inserted = await db
    .insert(statusReports)
    .values({ brokerSlug: input.brokerSlug, kind: input.kind, reporterHash: input.hash, note })
    .onConflictDoNothing({
      target: [statusReports.brokerSlug, statusReports.kind, statusReports.reporterHash],
    })
    .returning({ id: statusReports.id });

  if (inserted.length === 0) {
    return { ok: true, message: 'You have already reported this today. Thanks — it is counted once.' };
  }
  return { ok: true, message: 'Reported. It counts once the threshold is met.' };
}
