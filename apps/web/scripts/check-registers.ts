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
 *
 * The comparison itself lives in the ingest package, shared with the CI report,
 * so the two can never disagree about what a register said.
 */
import { fetchAllRegisters, licenceFindings } from '@commentfx/ingest';
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

  const { db, close } = await getDb();
  const results = await fetchAllRegisters();

  for (const r of results) {
    await recordRun(db, {
      regulatorCode: r.regulator,
      ok: r.ok,
      entryCount: r.ok ? r.entries.length : null,
      reason: r.ok ? null : r.reason,
    });
    console.log(r.ok
      ? `${r.regulator}: ${r.entries.length} firms on the register`
      : `${r.regulator}: unavailable — ${r.reason}`);
  }

  const findings = licenceFindings(results);
  const rows: CheckInput[] = findings.map((f) => ({
    brokerSlug: f.brokerSlug,
    regulatorCode: f.regulator,
    licenceNumber: f.licenceNumber,
    kind: f.kind,
    registerName: f.registerName,
    detail: f.detail,
    sourceUrl: f.sourceUrl,
  }));

  for (const f of findings) {
    if (f.kind === 'confirmed') continue;
    console.log(`  ${MARK[f.kind]} ${f.brokerSlug} ${f.licenceNumber} — ${f.detail}`);
  }

  const { written, skipped } = await recordChecks(db, rows);
  console.log(`${findings.length} licences checked, ${written} recorded` +
    (skipped > 0 ? `, ${skipped} left as they were (source unreachable)` : ''));

  await close();

  // A non-zero exit is how a scheduler notices; the findings are written either way.
  const problems = findings.filter((f) => f.kind !== 'confirmed' && f.kind !== 'source-unavailable');
  if (problems.length > 0) {
    console.log(`\n${problems.length} licence${problems.length > 1 ? 's need' : ' needs'} an editor to look at it.`);
    process.exitCode = 2;
  }
}

await main();
