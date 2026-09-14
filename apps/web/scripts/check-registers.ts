/**
 * Reads every regulator register we have an adapter for and records what it
 * says about each licence we publish. Run once a day.
 *
 *   pnpm --filter @commentfx/web check-registers
 *
 * It never edits a broker record. A register disagreeing with us is a finding
 * for an editor to act on, not a fact to overwrite ours with — a scraper is
 * wrong often enough that automatic correction would eventually publish a
 * falsehood about a real company.
 */
import { BROKERS } from '@commentfx/core';
import { SOURCES, compareLicence, type RegisterResult } from '@commentfx/ingest';
import { getDb, recordChecks, recordRun, type CheckInput } from '@commentfx/db';

const MARK: Record<string, string> = {
  confirmed: 'ok  ', 'name-mismatch': 'diff', 'not-found': 'gone', 'source-unavailable': '??  ',
};

async function main() {
  if (!process.env.DATABASE_URL && !process.env.PGLITE_DIR) {
    console.error('No database configured (set DATABASE_URL or PGLITE_DIR).');
    process.exitCode = 1;
    return;
  }

  const { db } = await getDb();
  let problems = 0;

  for (const source of SOURCES) {
    const result: RegisterResult = await source.fetch();
    await recordRun(db, {
      regulatorCode: source.code,
      ok: result.ok,
      entryCount: result.ok ? result.entries.length : null,
      reason: result.ok ? null : result.reason,
    });

    console.log(result.ok
      ? `${source.code}: ${result.entries.length} firms on the register`
      : `${source.code}: unavailable — ${result.reason}`);

    const findings: CheckInput[] = [];
    for (const broker of BROKERS) {
      for (const entity of broker.entities) {
        if (entity.licence.regulator !== source.code) continue;
        const f = compareLicence(result, entity.licence.number, entity.legalName);
        findings.push({
          brokerSlug: broker.slug,
          regulatorCode: source.code,
          licenceNumber: entity.licence.number,
          kind: f.kind,
          registerName: f.registerName,
          detail: f.detail,
          sourceUrl: source.sourceUrl,
        });
        if (f.kind !== 'confirmed') {
          problems++;
          console.log(`  ${MARK[f.kind]} ${broker.slug} ${entity.licence.number} — ${f.detail}`);
        }
      }
    }

    const { written, skipped } = await recordChecks(db, findings);
    console.log(`  ${findings.length} licences checked, ${written} recorded` +
      (skipped > 0 ? `, ${skipped} left as they were (source unreachable)` : ''));
  }

  // A non-zero exit is how a scheduler notices; the findings still got written.
  if (problems > 0) {
    console.log(`\n${problems} licence${problems > 1 ? 's need' : ' needs'} an editor to look at it.`);
    process.exitCode = 2;
  }
}

await main();
