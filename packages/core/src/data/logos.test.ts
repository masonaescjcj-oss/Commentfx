import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BROKERS } from './brokers.ts';
import { PROPS } from './props.ts';
import { EXCHANGES } from './exchanges.ts';

/**
 * A logo path is a string in a data file and nothing checks a string. A typo
 * here — a slug that does not match the filename, a record renamed without its
 * file — ships a broken image on the front page, and it ships silently, because
 * the tile fallback only appears when there is no path at all, not when the
 * path is wrong.
 *
 * The site serves these from apps/web/public, so that is where this looks.
 */
const PUBLIC = fileURLToPath(new URL('../../../../apps/web/public', import.meta.url));

const all = [
  ...BROKERS.map((b) => ({ kind: 'broker', name: b.name, logo: b.logo })),
  ...PROPS.map((p) => ({ kind: 'prop firm', name: p.name, logo: p.logo })),
  ...EXCHANGES.map((e) => ({ kind: 'exchange', name: e.name, logo: e.logo })),
];

test('every logo path points at a file the site actually serves', () => {
  for (const { kind, name, logo } of all) {
    if (!logo.img) continue;
    assert.ok(logo.img.startsWith('/'), `${name}: ${logo.img} is not an absolute path`);
    const file = PUBLIC + logo.img;
    let size = 0;
    try {
      size = statSync(file).size;
    } catch {
      assert.fail(`${kind} ${name}: no file at ${logo.img}`);
    }
    assert.ok(size > 200, `${kind} ${name}: ${logo.img} is ${size} bytes, which is not an image`);
  }
});

test('a record without an image still has a readable tile to fall back to', () => {
  for (const { kind, name, logo } of all) {
    assert.ok(logo.initials.length > 0 && logo.initials.length <= 2, `${kind} ${name}: initials`);
    assert.match(logo.bg, /^#[0-9A-Fa-f]{6}$/, `${kind} ${name}: bg`);
    assert.match(logo.fg, /^#[0-9A-Fa-f]{6}$/, `${kind} ${name}: fg`);
  }
});

test('no two records share a logo file', () => {
  const seen = new Map<string, string>();
  for (const { name, logo } of all) {
    if (!logo.img) continue;
    const already = seen.get(logo.img);
    assert.equal(already, undefined, `${name} and ${already} both use ${logo.img}`);
    seen.set(logo.img, name);
  }
});
