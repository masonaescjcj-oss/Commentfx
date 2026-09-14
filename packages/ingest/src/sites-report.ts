/**
 * Reports any company site we link to that has gone. Run daily.
 *
 *   node --experimental-strip-types src/sites-report.ts
 *
 * Exit 2 when a link is dead. A site that only refuses this host is listed but
 * never fails the run — that is our address being blocked, not their site
 * being down, and a report that cries wolf gets ignored.
 */
import { checkSites, type SiteState } from './sites.ts';

const MARK: Record<SiteState, string> = {
  ok: 'ok  ', moved: 'MOVE', gone: 'GONE', blocked: 'wall', unreachable: 'huh ',
};

const checks = await checkSites();
const width = Math.max(...checks.map((c) => c.slug.length));

for (const c of checks) {
  console.log(`${MARK[c.state]}  ${c.slug.padEnd(width)}  ${c.website.padEnd(34)} ${c.detail}`);
}

const gone = checks.filter((c) => c.state === 'gone');
const moved = checks.filter((c) => c.state === 'moved');
const blocked = checks.filter((c) => c.state === 'blocked' || c.state === 'unreachable');

console.log('');
console.log(`${checks.length} company sites checked: ${checks.filter((c) => c.state === 'ok').length} as stored, ${moved.length} redirecting elsewhere, ${blocked.length} refusing this host, ${gone.length} gone.`);

if (moved.length > 0) {
  console.log('');
  for (const c of moved) {
    console.log(`- **${c.name}** (\`${c.slug}\`) — ${c.website} ${c.detail}. Either the company renamed, or it routes this region to a different legal entity; both mean the record needs a look.`);
  }
}

if (gone.length > 0) {
  console.log('');
  for (const c of gone) {
    console.log(`- **${c.name}** (\`${c.slug}\`) — ${c.website}: ${c.detail}`);
  }
  console.log('\nA dead company site means a rebrand or an exit. Either way the record needs a person.');
  process.exit(2);
}
