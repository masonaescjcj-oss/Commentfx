import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordRevised, latestDay } from './revised.ts';
import { BROKERS } from './data/brokers.ts';
import { PROPS } from './data/props.ts';
import { EXCHANGES } from './data/exchanges.ts';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const today = new Date().toISOString().slice(0, 10);

/**
 * The sitemap's lastmod for a record comes from here, so every record the site
 * publishes has to have one that is a real day, and none of them can be in the
 * future — a lastmod from tomorrow is the same lie as a lastmod from now.
 */
test('every published record has a real revision day, and none is in the future', () => {
  const all = [
    ...BROKERS.map((b) => ['broker', b.slug] as const),
    ...PROPS.map((p) => ['prop', p.slug] as const),
    ...EXCHANGES.map((e) => ['exchange', e.slug] as const),
  ];
  for (const [kind, slug] of all) {
    const d = recordRevised(kind, slug);
    assert.ok(d, `${kind} ${slug} has no revision day, so the sitemap would say nothing about it`);
    assert.match(d!, ISO, `${kind} ${slug}: "${d}" is not a day`);
    assert.ok(d! <= today, `${kind} ${slug} claims to have changed on ${d}, after today`);
  }
});

test('a correction after the research moves the day; the research date alone does not', () => {
  // Coinbase was corrected on 18 September, a day after it was researched.
  assert.equal(recordRevised('exchange', 'coinbase'), '2026-09-18');
  // Kraken was researched on the 17th and not touched since.
  assert.equal(recordRevised('exchange', 'kraken'), '2026-09-17');
});

test('a record nobody researched has no day, rather than a guessed one', () => {
  assert.equal(recordRevised('broker', 'no-such-broker'), null);
});

test('latestDay picks the latest and ignores the missing', () => {
  assert.equal(latestDay(['2026-09-16', null, '2026-09-18', undefined, '2026-09-17']), '2026-09-18');
  assert.equal(latestDay([null, undefined]), null);
});
