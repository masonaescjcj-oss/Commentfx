/**
 * Compares every licence we publish against the regulators' registers and
 * reports what does not match. Reads nothing and writes nothing — the job that
 * updates the site is `check-registers` in the web app; this one exists so CI
 * can ask the question daily without a database.
 *
 *   node --experimental-strip-types src/registers/report.ts
 *
 * Exit 2 when a licence needs a human. Exit 1 when a register could not be read
 * at all, which is a different problem with a different fix.
 */
import { fetchAllRegisters, licenceFindings, SOURCES, BLOCKED_SOURCES } from './index.ts';

const results = await fetchAllRegisters();

for (const r of results) {
  console.log(r.ok
    ? `${r.regulator}: ${r.entries.length} firms on the register`
    : `${r.regulator}: UNREADABLE — ${r.reason}`);
}
for (const b of BLOCKED_SOURCES) {
  console.log(`${b.code}: no reader — ${b.reason}`);
}

const findings = licenceFindings(results);
const problems = findings.filter((f) => f.kind !== 'confirmed' && f.kind !== 'source-unavailable');
const confirmed = findings.filter((f) => f.kind === 'confirmed');

console.log(`\n${findings.length} licences checked across ${SOURCES.length} readable register${SOURCES.length > 1 ? 's' : ''}: ${confirmed.length} confirmed, ${problems.length} not.`);

if (problems.length > 0) {
  console.log('');
  for (const f of problems) {
    console.log(`- **${f.brokerName}** (\`${f.brokerSlug}\`) — ${f.regulator} ${f.licenceNumber}: ${f.kind}`);
    console.log(`  ${f.detail}`);
  }
  console.log('\nNothing is changed automatically. A register disagreeing with us is a question for an editor.');
}

if (results.some((r) => !r.ok)) process.exit(1);
if (problems.length > 0) process.exit(2);
