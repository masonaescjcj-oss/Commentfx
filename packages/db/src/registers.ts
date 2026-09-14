import { and, desc, eq, ne } from 'drizzle-orm';
import type { AppDb } from './client.ts';
import { registerChecks, registerRuns } from './schema.ts';

export type FindingKind = 'confirmed' | 'name-mismatch' | 'not-found' | 'source-unavailable';

export interface CheckInput {
  brokerSlug: string;
  regulatorCode: string;
  licenceNumber: string;
  kind: FindingKind;
  registerName: string | null;
  detail: string;
  sourceUrl: string;
}

/**
 * Records one run's findings. A `source-unavailable` finding never overwrites a
 * previous real answer: the last thing the register actually said is more
 * useful than "we could not reach it today", and overwriting would quietly
 * erase a confirmation every time the network hiccupped.
 */
export async function recordChecks(db: AppDb, findings: CheckInput[]) {
  let written = 0;
  let skipped = 0;

  for (const f of findings) {
    if (f.kind === 'source-unavailable') {
      const [existing] = await db
        .select()
        .from(registerChecks)
        .where(and(
          eq(registerChecks.brokerSlug, f.brokerSlug),
          eq(registerChecks.regulatorCode, f.regulatorCode),
          eq(registerChecks.licenceNumber, f.licenceNumber),
        ));
      if (existing) { skipped++; continue; }
    }

    await db
      .insert(registerChecks)
      .values({ ...f, checkedAt: new Date() })
      .onConflictDoUpdate({
        target: [registerChecks.brokerSlug, registerChecks.regulatorCode, registerChecks.licenceNumber],
        set: {
          kind: f.kind, registerName: f.registerName, detail: f.detail,
          sourceUrl: f.sourceUrl, checkedAt: new Date(),
        },
      });
    written++;
  }
  return { written, skipped };
}

export async function recordRun(
  db: AppDb,
  run: { regulatorCode: string; ok: boolean; entryCount?: number | null; reason?: string | null },
) {
  await db.insert(registerRuns).values({
    regulatorCode: run.regulatorCode,
    ok: run.ok,
    entryCount: run.entryCount ?? null,
    reason: run.reason ?? null,
  });
}

export async function checksFor(db: AppDb, brokerSlug: string) {
  return db.select().from(registerChecks).where(eq(registerChecks.brokerSlug, brokerSlug));
}

/**
 * Everything the registers did not confirm, newest first. This is the editor's
 * work list: a licence the regulator has no record of, or holds under a name
 * that is not obviously ours, is a question for a person.
 */
export async function openFindings(db: AppDb) {
  return db
    .select()
    .from(registerChecks)
    .where(ne(registerChecks.kind, 'confirmed'))
    .orderBy(desc(registerChecks.checkedAt));
}

/** Latest run per source, for the admin's source-health view. */
export async function latestRuns(db: AppDb, codes: string[]) {
  const out: Array<{ code: string; ok: boolean | null; entryCount: number | null; reason: string | null; ranAt: Date | null }> = [];
  for (const code of codes) {
    const [row] = await db
      .select()
      .from(registerRuns)
      .where(eq(registerRuns.regulatorCode, code))
      .orderBy(desc(registerRuns.ranAt))
      .limit(1);
    out.push({
      code,
      ok: row?.ok ?? null,
      entryCount: row?.entryCount ?? null,
      reason: row?.reason ?? null,
      ranAt: row?.ranAt ?? null,
    });
  }
  return out;
}
