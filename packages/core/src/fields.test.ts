import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIELDS, fieldsFor, readPath, writePath, sameValue, showValue } from './fields.ts';
import { mergeRecord, validateRecord } from './validate.ts';
import { BROKERS } from './data/brokers.ts';
import { ARTICLES } from './data/articles.ts';
import { parseArticleBody, formatArticleBody } from './article-text.ts';
import { PROPS } from './data/props.ts';
import { EXCHANGES } from './data/exchanges.ts';

const SETS = {
  broker: BROKERS as readonly unknown[],
  prop: PROPS as readonly unknown[],
  exchange: EXCHANGES as readonly unknown[],
} as const;

/**
 * The rule this file exists for: a field in the form has to be a field on the
 * record. A path that resolves to undefined on every curated record is a form
 * control whose save does nothing, and nobody would notice for months — the
 * form accepts the value, the patch stores it under a key the merge puts
 * somewhere harmless, and the page keeps showing the old figure.
 */
test('every editable field exists on the records it claims to edit', () => {
  for (const [kind, records] of Object.entries(SETS)) {
    for (const spec of fieldsFor(kind as keyof typeof SETS)) {
      const found = records.some((r) => readPath(r, spec.path) !== undefined);
      assert.ok(found, `${kind}.${spec.path} is on no ${kind} record`);
    }
  }
});

test('a select only offers values the records actually use', () => {
  for (const [kind, records] of Object.entries(SETS)) {
    for (const spec of fieldsFor(kind as keyof typeof SETS)) {
      if (spec.type !== 'select' && spec.type !== 'multi') continue;
      assert.ok(spec.options?.length, `${kind}.${spec.path} is a ${spec.type} with no options`);
      for (const r of records) {
        const v = readPath(r, spec.path);
        const values = Array.isArray(v) ? v : v === undefined ? [] : [v];
        for (const one of values) {
          assert.ok(
            spec.options!.includes(String(one)),
            `${kind}.${spec.path}: "${String(one)}" is on a record but not offered by the form`,
          );
        }
      }
    }
  }
});

test('no field is listed twice, which would make one of the two controls a lie', () => {
  for (const kind of Object.keys(SETS) as Array<keyof typeof SETS>) {
    const paths = fieldsFor(kind).map((f) => f.path);
    assert.equal(new Set(paths).size, paths.length, `${kind} lists a path twice`);
  }
});

test('every group has a title and at least one field', () => {
  for (const groups of Object.values(FIELDS)) {
    for (const g of groups) {
      assert.ok(g.title.trim(), 'a group with no title');
      assert.ok(g.fields.length > 0, `${g.title} has no fields`);
    }
  }
});

/* ── paths ─────────────────────────────────────────────────────────────── */

test('writePath builds the patch shape the merge expects', () => {
  const patch: Record<string, unknown> = {};
  writePath(patch, 'cost.eurusdSpread', 0.9);
  writePath(patch, 'cost.commissionPerLot', 6);
  writePath(patch, 'name', 'X');
  assert.deepEqual(patch, { cost: { eurusdSpread: 0.9, commissionPerLot: 6 }, name: 'X' });
});

/**
 * The two halves together: a patch built from a path has to change that one
 * figure on a real record and nothing else. This is the whole contract of the
 * override feature in one assertion.
 */
test('a patch from a path changes one figure and leaves the group intact', () => {
  const base = BROKERS[0]!;
  const patch: Record<string, unknown> = {};
  writePath(patch, 'cost.eurusdSpread', 0.42);
  const merged = mergeRecord(base, patch);

  assert.equal(merged.cost.eurusdSpread, 0.42);
  assert.equal(merged.cost.commissionPerLot, base.cost.commissionPerLot);
  assert.equal(merged.cost.swapFreeAvailable, base.cost.swapFreeAvailable);
  assert.equal(merged.name, base.name);
  assert.deepEqual(validateRecord('broker', merged), []);
});

test('readPath returns undefined rather than throwing on a path that is not there', () => {
  assert.equal(readPath(BROKERS[0], 'cost.nothing.deeper'), undefined);
  assert.equal(readPath(null, 'a'), undefined);
});

test('sameValue compares lists by contents, so an unchanged list is not a change', () => {
  assert.ok(sameValue(['a', 'b'], ['a', 'b']));
  assert.ok(!sameValue(['a', 'b'], ['b', 'a']));
  assert.ok(!sameValue(['a'], ['a', 'b']));
  assert.ok(sameValue(3, 3));
  assert.ok(!sameValue(3, '3'));
});

test('showValue never renders an empty string where a reader expects a value', () => {
  assert.equal(showValue(null), '—');
  assert.equal(showValue(undefined), '—');
  assert.equal(showValue([]), '—');
  assert.equal(showValue(true), 'yes');
  assert.equal(showValue(false), 'no');
  assert.equal(showValue(0), '0');
  assert.equal(showValue(['a', 'b']), 'a, b');
});

/* ── parsing what a form hands back ────────────────────────────────────── */

import { parseField, type FieldSpec } from './fields.ts';

const spec = (over: Partial<FieldSpec>): FieldSpec =>
  ({ path: 'x', label: 'X', type: 'text', ...over });

test('an empty box is null on a nullable field and an error on any other', () => {
  assert.deepEqual(parseField(spec({ type: 'number', nullable: true }), ''), { value: null });
  assert.ok(parseField(spec({ type: 'number' }), '').problem);
  assert.deepEqual(parseField(spec({ type: 'boolean', nullable: true }), ''), { value: null });
});

test('a number that is not a number is refused rather than saved as NaN', () => {
  assert.ok(parseField(spec({ type: 'number' }), 'about five').problem);
  assert.deepEqual(parseField(spec({ type: 'number' }), '0'), { value: 0 });
  assert.deepEqual(parseField(spec({ type: 'number' }), '-0.15'), { value: -0.15 });
});

test('a select refuses a value it never offered', () => {
  const s = spec({ type: 'select', options: ['a', 'b'] });
  assert.deepEqual(parseField(s, 'a'), { value: 'a' });
  assert.ok(parseField(s, 'c').problem);
});

/**
 * The one field that is a number behind a string. `steps: '2'` would type-check
 * nowhere and compare equal to nothing, so the record would look changed on
 * every save and the score would read a string as a step count.
 */
test('a numeric option comes back as a number', () => {
  const s = spec({ type: 'select', options: ['1', '2', 'instant'], coerceNumeric: true });
  assert.deepEqual(parseField(s, '2'), { value: 2 });
  assert.deepEqual(parseField(s, 'instant'), { value: 'instant' });
});

test('a multi refuses an option it never offered, and an empty multi is an empty list', () => {
  const s = spec({ type: 'multi', options: ['bank', 'card'] });
  assert.deepEqual(parseField(s, ['card', 'bank']), { value: ['card', 'bank'] });
  assert.deepEqual(parseField(s, []), { value: [] });
  assert.ok(parseField(s, ['card', 'gold']).problem);
});

test('a country code is stored the way every record stores it', () => {
  assert.deepEqual(parseField(spec({ type: 'country' }), 'cy'), { value: 'CY' });
});

test('yes and no are the only answers a boolean takes', () => {
  assert.deepEqual(parseField(spec({ type: 'boolean' }), 'yes'), { value: true });
  assert.deepEqual(parseField(spec({ type: 'boolean' }), 'no'), { value: false });
  assert.ok(parseField(spec({ type: 'boolean' }), 'true').problem);
});

/* ── comparing structures ──────────────────────────────────────────────── */

import { sameDeep } from './fields.ts';

/**
 * The bug this exists because of: the article editor compared parsed prose
 * against the code with JSON.stringify, and `{heading, paragraphs}` versus
 * `{paragraphs, heading}` is the same block and a different string. Every
 * unchanged article came back "edited" and stored a patch saying it now says
 * what it already said — which would then shadow the next correction made in
 * the data file. Nothing looked broken.
 */
test('two structures that differ only in key order are the same structure', () => {
  assert.ok(sameDeep({ heading: 'H', paragraphs: ['a'] }, { paragraphs: ['a'], heading: 'H' }));
  assert.ok(sameDeep([{ a: 1, b: 2 }], [{ b: 2, a: 1 }]));
});

test('and two that actually differ are not', () => {
  assert.ok(!sameDeep({ a: 1 }, { a: 2 }));
  assert.ok(!sameDeep({ a: 1 }, { a: 1, b: 2 }));
  assert.ok(!sameDeep({ a: 1, b: 2 }, { a: 1 }));
  assert.ok(!sameDeep([1, 2], [2, 1]));
  assert.ok(!sameDeep([1], [1, 2]));
  assert.ok(!sameDeep(null, {}));
  assert.ok(!sameDeep(1, '1'));
});

test('every published article compares equal to itself through the text format', () => {
  for (const a of ARTICLES) {
    assert.ok(sameDeep(parseArticleBody(formatArticleBody(a.blocks)), a.blocks), a.slug);
  }
});
