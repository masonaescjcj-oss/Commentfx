import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES, countryName } from './countries.ts';
import { BROKERS } from './data/brokers.ts';
import { PROPS } from './data/props.ts';
import { EXCHANGES } from './data/exchanges.ts';
import { REGULATORS } from './regulators.ts';
import { ACTIONS } from './data/actions.ts';

/**
 * The point of this file is that a page says "Seychelles" and not "SC". A code
 * with no name silently goes back to being a code, which is exactly the failure
 * it exists to prevent, so the codes in the data are checked against it here.
 */
test('every country the data names has a name', () => {
  const codes = new Set<string>();
  for (const b of BROKERS) {
    codes.add(b.headquarters);
    for (const e of b.entities) {
      codes.add(e.country);
      for (const c of e.serves) if (c !== '*') codes.add(c);
    }
  }
  for (const p of PROPS) {
    codes.add(p.headquarters);
    for (const e of p.entities) codes.add(e.country);
  }
  for (const e of EXCHANGES) codes.add(e.headquarters);
  for (const r of Object.values(REGULATORS)) codes.add(r.country);
  for (const a of ACTIONS) codes.add(a.country);

  const missing = [...codes].filter((c) => !Object.hasOwn(COUNTRIES, c));
  assert.deepEqual(missing, [], `no name for: ${missing.join(', ')}`);
});

test('an unknown code falls back to itself rather than to a guess', () => {
  assert.equal(countryName('SC'), 'Seychelles');
  assert.equal(countryName('XX'), 'XX');
  // Not a bare lookup: a prototype key must not come back as a name.
  assert.equal(countryName('constructor'), 'constructor');
});

test('no two codes share a name', () => {
  const names = Object.values(COUNTRIES);
  assert.equal(new Set(names).size, names.length);
});
