import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateBroker, validateProp, validateExchange, validateRecord, mergeRecord,
} from './validate.ts';
import { BROKERS } from './data/brokers.ts';
import { PROPS } from './data/props.ts';
import { EXCHANGES } from './data/exchanges.ts';

/**
 * Two halves, and both are load-bearing.
 *
 * The first says every curated record passes. If a rule here rejects something
 * already on the site, the rule is wrong — not the record — and this catches
 * that immediately rather than when an editor hits save.
 *
 * The second says each rule can actually reject something, because a validator
 * that returns no problems for every input is not a validator. That half is
 * written as a deliberately broken record per rule; it is the same discipline
 * as fault-injecting a check before trusting a green run.
 */

test('every curated broker passes its own validator', () => {
  for (const b of BROKERS) {
    assert.deepEqual(validateBroker(b), [], `${b.slug}: ${JSON.stringify(validateBroker(b))}`);
  }
});

test('every curated prop firm passes its own validator', () => {
  for (const f of PROPS) {
    assert.deepEqual(validateProp(f), [], `${f.slug}: ${JSON.stringify(validateProp(f))}`);
  }
});

test('every curated exchange passes its own validator', () => {
  for (const e of EXCHANGES) {
    assert.deepEqual(validateExchange(e), [], `${e.slug}: ${JSON.stringify(validateExchange(e))}`);
  }
});

/* ── each rule rejects the thing it exists for ──────────────────────────── */

const broker = () => structuredClone(BROKERS[0]!);
const prop = () => structuredClone(PROPS[0]!);
const exchange = () => structuredClone(EXCHANGES[0]!);
const fields = (problems: Array<{ field: string }>) => problems.map((p) => p.field);

test('a record with no companies is rejected', () => {
  const b = broker();
  b.entities = [];
  assert.ok(fields(validateBroker(b)).includes('entities'));
});

test('a licence with no number is rejected unless it says it is not a licence', () => {
  const b = broker();
  b.entities[0]!.licence.number = '';
  assert.ok(fields(validateBroker(b)).includes('entities.0.licence.number'));

  // The exception, which Eightcap's St Vincent company relies on.
  b.entities[0]!.licence.status = 'unregulated';
  assert.ok(!fields(validateBroker(b)).includes('entities.0.licence.number'));
});

test('a professional-only company may not serve any country', () => {
  const b = broker();
  const pro = b.entities.find((e) => e.clients === 'professional');
  assert.ok(pro, 'the Exness FCA entity is the case this rule was written for');
  pro.serves = ['GB'];
  assert.ok(fields(validateBroker(b)).includes(`entities.${b.entities.indexOf(pro)}.serves`));
});

test('exactly one company takes everyone else', () => {
  const none = broker();
  for (const e of none.entities) e.serves = e.serves.filter((c) => c !== '*');
  assert.ok(fields(validateBroker(none)).includes('entities'), 'no fallback is rejected');

  const two = broker();
  for (const e of two.entities) if (!e.serves.includes('*')) e.serves = ['*'];
  assert.ok(fields(validateBroker(two)).includes('entities'), 'two fallbacks are rejected');
});

test('the same licence cannot be on two companies', () => {
  const b = broker();
  const [first, second] = b.entities;
  assert.ok(first && second);
  second.licence = { ...first.licence };
  assert.ok(fields(validateBroker(b)).includes('entities.1.licence.number'));
});

test('a country the site cannot name or draw is rejected', () => {
  const b = broker();
  b.headquarters = 'ZZ';
  assert.ok(fields(validateBroker(b)).includes('headquarters'));
  // The message has to say what to do, because the fix is in two other files.
  assert.match(validateBroker(b)[0]!.message, /countries\.ts|Flag\.tsx/);
});

test('a 100% prop split is rejected as the ceiling it always is', () => {
  const f = prop();
  f.payout.splitPct = 100;
  const problems = validateProp(f);
  assert.ok(fields(problems).includes('payout.splitPct'));
  assert.match(problems.find((p) => p.field === 'payout.splitPct')!.message, /newly funded/);
});

test('a daily drawdown larger than the overall one is rejected', () => {
  const f = prop();
  f.rules.dailyDrawdownPct = f.rules.maxDrawdownPct + 1;
  assert.ok(fields(validateProp(f)).includes('rules.dailyDrawdownPct'));
});

test('two prop companies cannot both hold the contract', () => {
  const f = prop();
  f.entities = [
    { legalName: 'One Ltd', country: 'GB', role: 'contracting' },
    { legalName: 'Two Ltd', country: 'CY', role: 'contracting' },
  ];
  assert.ok(fields(validateProp(f)).includes('entities'));
});

test('an exchange cannot say users were made whole for a breach it never had', () => {
  const e = exchange();
  e.security.lastBreachYear = null;
  e.security.madeUsersWhole = true;
  assert.ok(fields(validateExchange(e)).includes('security.madeUsersWhole'));
});

test('a slug that is not a slug is rejected', () => {
  for (const bad of ['Not A Slug', 'trailing-', '-leading', 'double--hyphen', '']) {
    const b = broker();
    b.slug = bad;
    assert.ok(fields(validateBroker(b)).includes('slug'), `"${bad}" should be rejected`);
  }
});

/**
 * The shape rules, which are the ones that make the dispatch worth having. A
 * record can have a perfectly good name, website and country and still be
 * unrenderable, because the ranking reads groups the form never filled in.
 */
test('a record missing a group the ranking reads is rejected', () => {
  const f = prop();
  delete (f as Partial<typeof f>).rules;
  assert.ok(fields(validateProp(f)).includes('rules'));

  const b = broker();
  delete (b as Partial<typeof b>).cost;
  assert.ok(fields(validateBroker(b)).includes('cost'));

  const e = exchange();
  delete (e as Partial<typeof e>).reserves;
  assert.ok(fields(validateExchange(e)).includes('reserves'));

  // A zero is a value, not a gap: an exchange can genuinely charge no taker fee.
  const free = exchange();
  free.takerFeePct = 0;
  assert.ok(!fields(validateExchange(free)).includes('takerFeePct'));
});

test('validateRecord dispatches on kind', () => {
  assert.deepEqual(validateRecord('broker', BROKERS[0]), []);
  assert.deepEqual(validateRecord('prop', PROPS[0]), []);
  assert.deepEqual(validateRecord('exchange', EXCHANGES[0]), []);
  // A broker passed to the prop validator fails, which is what makes the
  // dispatch worth having rather than one permissive function.
  assert.ok(validateRecord('prop', BROKERS[0]).length > 0);
});

/* ── the merge ─────────────────────────────────────────────────────────── */

test('a patch replaces a scalar and leaves everything else alone', () => {
  const base = { name: 'A', founded: 2000, cost: { spread: 1, commission: 2 } };
  const out = mergeRecord(base, { name: 'B' });
  assert.equal(out.name, 'B');
  assert.equal(out.founded, 2000);
  assert.deepEqual(out.cost, { spread: 1, commission: 2 });
});

test('a patch merges one level into a group without dropping its siblings', () => {
  const base = { cost: { spread: 1, commission: 2 } };
  const out = mergeRecord(base, { cost: { spread: 9 } });
  assert.deepEqual(out.cost, { spread: 9, commission: 2 });
});

/**
 * The one merge rule that matters most. An entity list is replaced whole,
 * never merged item by item — because merging a shorter list into a longer one
 * keeps the entities an editor deleted, and the thing they were most likely
 * deleting is a licence that should not be on the page.
 */
test('a list is replaced whole, so a deleted company stays deleted', () => {
  const base = { entities: [{ legalName: 'One' }, { legalName: 'Two' }, { legalName: 'Three' }] };
  const out = mergeRecord(base, { entities: [{ legalName: 'One' }] });
  assert.equal(out.entities.length, 1);
  assert.deepEqual(out.entities, [{ legalName: 'One' }]);
});

test('an undefined in a patch means "unchanged", not "clear it"', () => {
  const base = { name: 'A', founded: 2000 };
  const out = mergeRecord(base, { name: undefined, founded: 2001 });
  assert.equal(out.name, 'A');
  assert.equal(out.founded, 2001);
});

test('a null in a patch does clear the value, because some fields mean null', () => {
  const base = { lastBreachYear: 2019 as number | null };
  const out = mergeRecord(base, { lastBreachYear: null });
  assert.equal(out.lastBreachYear, null);
});

/* ── articles ──────────────────────────────────────────────────────────── */

import { validateArticle } from './validate.ts';
import { ARTICLES } from './data/articles.ts';

const SLUGS = ARTICLES.map((a) => a.slug);
const article = () => structuredClone(ARTICLES[0]!);

test('every published article passes its own validator', () => {
  for (const a of ARTICLES) {
    assert.deepEqual(validateArticle(a, SLUGS), [], `${a.slug}: ${JSON.stringify(validateArticle(a, SLUGS))}`);
  }
});

test('an article that does not answer its question in two sentences is rejected', () => {
  const a = article();
  a.answer = 'One. Two. Three. Four.';
  assert.ok(fields(validateArticle(a, SLUGS)).includes('answer'));
});

test('a headline that is not a question is rejected', () => {
  const a = article();
  a.question = 'How to check a licence';
  assert.ok(fields(validateArticle(a, SLUGS)).includes('question'));
});

/**
 * The link rules, which are the ones a writer is most likely to meet halfway:
 * three links to the same page is three links, and "click here" is an anchor.
 */
test('three links to one page is not three links', () => {
  const a = article();
  a.blocks = [{
    paragraphs: [
      'See [the broker rankings](/brokers) and [the broker rankings](/brokers) and [the broker rankings](/brokers).',
    ],
  }];
  assert.ok(validateArticle(a, SLUGS).some((p) => /fewer than three destinations/.test(p.message)));
});

test('an anchor that says nothing is rejected', () => {
  const a = article();
  a.blocks[0]!.paragraphs.push('For the rankings, [click here](/brokers).');
  assert.ok(validateArticle(a, SLUGS).some((p) => /says nothing/.test(p.message)));
});

test('an article linking to an article that does not exist is rejected', () => {
  const a = article();
  a.blocks[0]!.paragraphs.push('See [our guide to nothing](/learn/no-such-article) for the rest.');
  assert.ok(validateArticle(a, SLUGS).some((p) => /is not an article/.test(p.message)));
});

test('an article that links to itself is rejected', () => {
  const a = article();
  a.blocks[0]!.paragraphs.push(`Read [this very article](/learn/${a.slug}) again.`);
  assert.ok(validateArticle(a, SLUGS).some((p) => /links to itself/.test(p.message)));
});

test('an article with no worked example is rejected', () => {
  const a = article();
  for (const b of a.blocks) delete b.example;
  assert.ok(validateArticle(a, SLUGS).some((p) => /worked example/.test(p.message)));
});

test('a description that a result page would cut off is rejected', () => {
  const a = article();
  a.description = 'Short.';
  assert.ok(fields(validateArticle(a, SLUGS)).includes('description'));
  a.description = 'x'.repeat(200);
  assert.ok(fields(validateArticle(a, SLUGS)).includes('description'));
});

test('an article last checked before it was published is rejected', () => {
  const a = article();
  a.updated = '2020-01-01';
  assert.ok(fields(validateArticle(a, SLUGS)).includes('updated'));
});

test('an unsigned article is rejected', () => {
  const a = article();
  a.author = '  ';
  assert.ok(fields(validateArticle(a, SLUGS)).includes('author'));
});

test('unclosed markup is caught before it renders as its own source', () => {
  const a = article();
  a.blocks[0]!.paragraphs.push('An [unclosed link(/brokers) in the middle of a sentence.');
  assert.ok(validateArticle(a, SLUGS).some((p) => /Unclosed markup/.test(p.message)));
});

test('an article too short to be worth a page of its own is rejected', () => {
  const a = article();
  a.blocks = [{ paragraphs: ['Three [real links](/brokers) to [three pages](/props) here [and here](/exchanges).'] }];
  assert.ok(validateArticle(a, SLUGS).some((p) => /words/.test(p.message)));
});
