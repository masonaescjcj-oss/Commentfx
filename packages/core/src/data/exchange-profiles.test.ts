import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EXCHANGE_PROFILES, exchangeProfileFor } from './exchange-profiles.ts';
import { researchCitations, researchWordCount } from './research.ts';
import { EXCHANGES, exchangeBySlug } from './exchanges.ts';
import { actionsFor } from './actions.ts';

/**
 * The same apparatus the other researched layers carry. It matters more here
 * than anywhere else on the site: these profiles say that named companies
 * pleaded guilty to federal offences and were fined billions, which is either
 * tied to a document with a date on it or it is defamation with footnotes.
 */

test('every exchange profile belongs to an exchange we rank', () => {
  for (const p of EXCHANGE_PROFILES) {
    assert.ok(exchangeBySlug(p.slug), `${p.slug} is not an exchange`);
  }
  assert.equal(
    new Set(EXCHANGE_PROFILES.map((p) => p.slug)).size,
    EXCHANGE_PROFILES.length,
    'two profiles for one exchange',
  );
});

test('every citation resolves to a source', () => {
  for (const p of EXCHANGE_PROFILES) {
    const ids = new Set(p.sources.map((s) => s.id));
    for (const cited of researchCitations(p)) {
      assert.ok(ids.has(cited), `${p.slug} cites [${cited}], which is not in its sources`);
    }
  }
});

test('every source is cited, or carries a fact', () => {
  for (const p of EXCHANGE_PROFILES) {
    const used = new Set([...researchCitations(p), ...p.facts.map((f) => f.from)]);
    for (const s of p.sources) {
      assert.ok(used.has(s.id), `${p.slug} lists source ${s.id} and never uses it`);
    }
    assert.equal(new Set(p.sources.map((s) => s.id)).size, p.sources.length, `${p.slug}: duplicate source id`);
  }
});

test('every fact points at a source that exists', () => {
  for (const p of EXCHANGE_PROFILES) {
    const ids = new Set(p.sources.map((s) => s.id));
    for (const f of p.facts) {
      assert.ok(ids.has(f.from), `${p.slug}: "${f.label}" cites ${f.from}`);
      assert.ok(f.value.trim().length > 0, `${p.slug}: "${f.label}" has no value`);
    }
    assert.ok(p.facts.length >= 5, `${p.slug}: ${p.facts.length} checkable facts`);
  }
});

test('every source says who published it, when we read it, and where', () => {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  for (const p of EXCHANGE_PROFILES) {
    assert.match(p.checked, iso, `${p.slug}: checked date`);
    for (const s of p.sources) {
      assert.ok(s.publisher.trim(), `${p.slug}/${s.id}: no publisher`);
      assert.ok(s.title.trim(), `${p.slug}/${s.id}: no title`);
      assert.match(s.url, /^https:\/\//, `${p.slug}/${s.id}: ${s.url}`);
      assert.match(s.read, iso, `${p.slug}/${s.id}: read date`);
      if (s.published !== undefined) assert.match(s.published, iso, `${p.slug}/${s.id}: published date`);
    }
  }
});

/**
 * The rule that keeps the prose from disagreeing with the table above it. The
 * record holds the fees and the volume; a sentence repeating them is a second
 * copy that goes stale first.
 */
test('an exchange profile never restates a number the record already holds', () => {
  for (const p of EXCHANGE_PROFILES) {
    const e = exchangeBySlug(p.slug)!;
    const prose = p.sections.flatMap((s) => s.paragraphs).join(' ');
    for (const [needle, what] of [
      [`${e.takerFeePct}% taker`, 'the taker fee'],
      [`${e.makerFeePct}% maker`, 'the maker fee'],
    ] as Array<[string, string]>) {
      assert.ok(!prose.includes(needle), `${p.slug}: the prose restates ${what} ("${needle}")`);
    }
  }
});

test('an exchange profile is long enough and every section argues something', () => {
  for (const p of EXCHANGE_PROFILES) {
    assert.ok(researchWordCount(p) >= 350, `${p.slug}: ${researchWordCount(p)} words`);
    assert.ok(p.sections.length >= 2, `${p.slug}: ${p.sections.length} sections`);
    for (const s of p.sections) {
      assert.ok(s.heading.trim(), `${p.slug}: a section with no heading`);
      assert.ok(s.paragraphs.length >= 2, `${p.slug}: "${s.heading}" is one paragraph`);
      for (const line of s.paragraphs) {
        assert.ok(!/ {2}/.test(line), `${p.slug}: double space in "${line.slice(0, 50)}"`);
        assert.ok(!/undefined|NaN|\[object/.test(line), `${p.slug}: "${line.slice(0, 50)}"`);
      }
    }
    assert.ok(p.verdict.length > 120, `${p.slug}: the verdict is too short to be one`);
    assert.ok(p.open.length >= 1, `${p.slug}: nothing left open, which is never true`);
  }
});

/**
 * The one that matters most on this layer.
 *
 * An enforcement action on the record is a serious public claim about a named
 * company. Where one exists, the profile has to be there to say where it came
 * from — and it has to cite something an authority published, not only a
 * newspaper's account of one. Every exchange with an action here clears that;
 * the test is so the next one does too.
 */
test('an exchange with an action on record has a profile citing an authority', () => {
  for (const e of EXCHANGES) {
    if (actionsFor(e.slug).length === 0) continue;
    const p = exchangeProfileFor(e.slug);
    assert.ok(p, `${e.slug} has enforcement on record and no profile saying where it came from`);
    const official = p.sources.filter((s) => s.kind === 'regulator' || s.kind === 'register' || s.kind === 'filing');
    assert.ok(official.length >= 1, `${e.slug}: ${p.sources.length} sources and none of them an authority's own`);
  }
});

/**
 * Written down because getting it wrong would be the worst error on the site:
 * a case brought and dropped must not read like a case lost.
 */
test('the exchanges cleared by a regulator are not carrying a penalty for it', () => {
  for (const slug of ['coinbase', 'kraken']) {
    const dismissed = actionsFor(slug).filter((a) => a.stage === 'dismissed');
    assert.ok(dismissed.length >= 1, `${slug}: the dismissal is not on record`);
    for (const a of dismissed) {
      assert.ok(/dismiss/i.test(a.summary), `${slug}: the summary does not say it was dismissed`);
    }
  }
});

/**
 * Every section has to cite something, which the broker layer has always
 * required and this one did not.
 *
 * It was not theoretical. The first draft of the KuCoin profile described the
 * 2020 breach — an amount, a recovery, a claim that users were made whole —
 * with no source behind any of it, and nothing here objected. That paragraph is
 * now sourced and this is what stops the next one.
 */
test('every section cites at least one source', () => {
  for (const p of EXCHANGE_PROFILES) {
    for (const s of p.sections) {
      const cited = /\[([a-z0-9-]+)\]/.test(s.paragraphs.join(' '));
      assert.ok(cited, `${p.slug}: "${s.heading}" cites nothing`);
    }
  }
});
