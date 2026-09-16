import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brokerVerdict } from './verdict.ts';
import { BROKERS, brokerBySlug } from './data/brokers.ts';

const verdict = (slug: string) => brokerVerdict(brokerBySlug(slug)!, BROKERS);

test('every broker gets something on both sides', () => {
  for (const b of BROKERS) {
    const v = brokerVerdict(b, BROKERS);
    assert.ok(v.pros.length >= 3, `${b.slug}: ${v.pros.length} pros`);
    // A directory that finds nothing to say against a broker is a directory
    // nobody should believe about any of them.
    assert.ok(v.cons.length >= 1, `${b.slug}: no cons at all`);
    for (const line of [...v.pros, ...v.cons]) {
      assert.ok(!/undefined|NaN|\[object/.test(line), `${b.slug}: "${line}"`);
      assert.ok(line.length > 15 && line.length < 170, `${b.slug}: "${line}"`);
    }
  }
});

test('no line appears on both sides of the same broker', () => {
  for (const b of BROKERS) {
    const { pros, cons } = brokerVerdict(b, BROKERS);
    for (const p of pros) assert.ok(!cons.includes(p), `${b.slug}: "${p}" is both`);
  }
});

test('the offshore fallback is always named as a cost, never left implicit', () => {
  // Every broker in this directory routes the rest of the world somewhere
  // without a compensation scheme. If that ever stops being said out loud,
  // the pros and cons have stopped being useful.
  for (const b of BROKERS) {
    const { cons } = brokerVerdict(b, BROKERS);
    const fallback = b.entities.find((e) => e.serves.includes('*'));
    if (!fallback) continue;
    assert.ok(
      cons.some((c) => c.includes(fallback.legalName)),
      `${b.slug}: ${fallback.legalName} is the catch-all and is not in the cons`,
    );
  }
});

test('a licence held for other firms is a con, not a pro', () => {
  const { pros, cons } = verdict('exness');
  assert.ok(cons.some((c) => /FCA/.test(c) && /does not take retail/.test(c)));
  assert.ok(!pros.some((p) => /FCA/.test(p)), 'the FCA licence was counted in Exness’s favour');
});

test('a group company with no licence anywhere is said out loud', () => {
  const { cons } = verdict('eightcap');
  assert.ok(cons.some((c) => /no financial licence/.test(c)), cons.join(' | '));
});

test('cost is compared against the rest of the directory, not an absolute', () => {
  const cheap = verdict('ic-markets');
  assert.ok(cheap.pros.some((p) => /Cheaper all-in than \d+ of the other/.test(p)), cheap.pros.join(' | '));
});
