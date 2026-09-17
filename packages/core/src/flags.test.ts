import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BROKERS } from './data/brokers.ts';
import { PROPS } from './data/props.ts';
import { EXCHANGES } from './data/exchanges.ts';
import { REGULATORS } from './regulators.ts';
import { ACTIONS } from './data/actions.ts';

/**
 * Every country the data names has a flag drawn for it.
 *
 * A code with no shape renders an empty rectangle, which is worse than the code
 * it replaced: a reader sees a blank box beside "Czechia" and learns nothing,
 * where "CZ" at least said something. FTMO shipped with exactly that, and it
 * shipped because nothing knew the data had a country the drawing did not.
 *
 * It lives here rather than beside the component because this package is the
 * one that runs tests and because the data is here — the same reason the news
 * package checks the web app's CSP. The component is read as text: a .tsx file
 * is not something `node --test` can load, and the only thing worth asserting
 * is which keys the map has.
 */
const src = readFileSync(
  fileURLToPath(new URL('../../../apps/web/src/components/Flag.tsx', import.meta.url)),
  'utf8',
);
const shapes = new Set([...src.matchAll(/^ {2}([A-Z]{2}):\s'/gm)].map((m) => m[1]!));

test('the flag map was found and read', () => {
  assert.ok(shapes.size >= 14, `found ${shapes.size} shapes — the file or the pattern moved`);
});

test('every country the data names has a flag', () => {
  const codes = new Set<string>();
  for (const b of BROKERS) {
    codes.add(b.headquarters);
    for (const e of b.entities) codes.add(e.country);
  }
  for (const p of PROPS) {
    codes.add(p.headquarters);
    // Prop entities name countries no headquarters does — Saint Lucia arrived
    // this way, and the entity map draws a flag for every one of them.
    for (const e of p.entities) codes.add(e.country);
  }
  for (const e of EXCHANGES) codes.add(e.headquarters);
  for (const r of Object.values(REGULATORS)) codes.add(r.country);
  // Actions name countries no broker record does — India came in this way and
  // rendered a grey box next to the Enforcement Directorate for exactly as long
  // as this line was missing.
  for (const a of ACTIONS) codes.add(a.country);

  const missing = [...codes].filter((c) => !shapes.has(c)).sort();
  assert.deepEqual(missing, [], `no flag drawn for: ${missing.join(', ')}`);
});
