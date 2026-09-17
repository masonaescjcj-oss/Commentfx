/**
 * Asserts that every file the server reads at runtime is in the build.
 *
 *   pnpm --filter @commentfx/web build && pnpm --filter @commentfx/web check:trace
 *
 * Next works out what a bundle needs by following imports. `applyMigrations`
 * does not import its migrations — it reads the directory with readdirSync on a
 * path it builds itself — so on a host that ships only the traced files, the
 * .sql files were not shipped at all. That is a deployment which installs
 * cleanly, builds cleanly, serves every read-only page, and throws ENOENT the
 * first time anybody writes: the one failure mode this project has already been
 * bitten by once, at a different layer.
 *
 * It was found by hand and would have been found by nobody. So it is a check,
 * and CI runs it after the build. If another runtime read is added later — a
 * template, a word list, anything loaded by path rather than by import — add it
 * to REQUIRED here at the same time.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const web = resolve(import.meta.dirname, '..');
const repo = resolve(web, '..', '..');

/** What has to be there, and where to find the list of it. */
const REQUIRED = [
  {
    what: 'database migrations',
    files: () => readdirSync(join(repo, 'packages', 'db', 'migrations'))
      .filter((f) => f.endsWith('.sql'))
      .map((f) => join('packages', 'db', 'migrations', f)),
  },
];

const failures = [];
const check = (label, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

/** Every trace the build wrote, as a set of absolute paths it promises to ship. */
function traced() {
  const out = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.nft.json')) {
        const { files } = JSON.parse(readFileSync(path, 'utf8'));
        for (const f of files) out.add(resolve(dirname(path), f));
      }
    }
  };
  walk(join(web, '.next'));
  return out;
}

const next = join(web, '.next');
if (!existsSync(next)) {
  console.error('No build to check. Run the build first.');
  process.exit(1);
}

const shipped = traced();
check('the build wrote file traces at all', shipped.size > 0, `${shipped.size} files`);

for (const group of REQUIRED) {
  const wanted = group.files();
  check(`there are ${group.what} to ship`, wanted.length > 0, `${wanted.length} files`);

  const missing = wanted.filter((f) => !shipped.has(join(repo, f)));
  check(`every one of the ${group.what} is in the build`,
    missing.length === 0,
    missing.length ? missing.join(', ') : `${wanted.length} files`);
}

// A path in a trace that does not exist would ship nothing and say it shipped
// something, which is worse than the original problem.
const broken = [...shipped].filter((f) => f.endsWith('.sql') && !existsSync(f));
check('and every traced path resolves', broken.length === 0, broken.slice(0, 3).join(', '));

console.log('');
if (failures.length > 0) {
  console.log(`${failures.length} broken: ${failures.join(', ')}`);
  console.log('\nA file read at runtime by path rather than by import needs an entry in');
  console.log('outputFileTracingIncludes in next.config.ts, or the host will not ship it.');
  process.exit(1);
}
console.log('Everything the server reads at runtime is in the build.');
