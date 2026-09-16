import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROFILES, profileFor, profileCitations, profileWordCount } from './profiles.ts';
import { BROKERS, brokerBySlug } from './brokers.ts';

/**
 * A profile is the one place on this site where a person writes a sentence
 * about a company, which makes it the one place a sentence can go quietly out
 * of date or be published without anything behind it. These are the rules that
 * make that expensive rather than easy.
 */

test('every profile belongs to a broker we actually rank', () => {
  for (const p of PROFILES) {
    assert.ok(brokerBySlug(p.slug), `${p.slug} is not a broker`);
  }
  assert.equal(new Set(PROFILES.map((p) => p.slug)).size, PROFILES.length, 'two profiles for one broker');
});

test('every citation resolves to a source', () => {
  for (const p of PROFILES) {
    const ids = new Set(p.sources.map((s) => s.id));
    for (const cited of profileCitations(p)) {
      assert.ok(ids.has(cited), `${p.slug} cites [${cited}], which is not in its sources`);
    }
  }
});

test('every source is cited, or carries a fact', () => {
  for (const p of PROFILES) {
    const used = new Set([...profileCitations(p), ...p.facts.map((f) => f.from)]);
    for (const s of p.sources) {
      assert.ok(used.has(s.id), `${p.slug} lists source ${s.id} and never uses it`);
    }
    assert.equal(new Set(p.sources.map((s) => s.id)).size, p.sources.length, `${p.slug}: duplicate source id`);
  }
});

test('every fact points at a source that exists', () => {
  for (const p of PROFILES) {
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
  for (const p of PROFILES) {
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
 * The rule that keeps the two halves of a broker page from disagreeing.
 *
 * The record holds the spread, the commission, the minimum and the withdrawal
 * time, and the page renders them. A profile that also wrote them into a
 * sentence would be a second copy of a number that moves — and the sentence
 * would be the copy nobody remembers to update. So the prose may argue about
 * those figures, and may not restate them.
 */
test('a profile never restates a number the record already holds', () => {
  for (const p of PROFILES) {
    const b = brokerBySlug(p.slug)!;
    const prose = p.sections.flatMap((s) => s.paragraphs).join(' ');
    const banned: Array<[string, string]> = [
      [`${b.cost.eurusdSpread} pip`, 'the EUR/USD spread'],
      [`${b.payments.statedWithdrawalHours} hour`, 'the stated withdrawal time'],
      [`$${b.payments.minDepositUsd} minimum`, 'the minimum deposit'],
    ];
    for (const [needle, what] of banned) {
      assert.ok(!prose.includes(needle), `${p.slug}: the prose restates ${what} ("${needle}")`);
    }
  }
});

test('a profile is long enough and every section argues something', () => {
  for (const p of PROFILES) {
    assert.ok(profileWordCount(p) >= 600, `${p.slug}: ${profileWordCount(p)} words`);
    assert.ok(p.sections.length >= 3, `${p.slug}: ${p.sections.length} sections`);
    for (const s of p.sections) {
      assert.ok(s.heading.trim(), `${p.slug}: a section with no heading`);
      assert.ok(s.paragraphs.length >= 2, `${p.slug}: "${s.heading}" is one paragraph`);
      for (const line of s.paragraphs) {
        assert.ok(!/ {2}/.test(line), `${p.slug}: double space in "${line.slice(0, 50)}"`);
        assert.ok(!/undefined|NaN|\[object/.test(line), `${p.slug}: "${line.slice(0, 50)}"`);
      }
    }
    assert.ok(p.verdict.length > 120, `${p.slug}: the verdict is too short to be one`);
    // What the research did not settle is part of the research.
    assert.ok(p.open.length >= 1, `${p.slug}: nothing left open, which is never true`);
  }
});

/**
 * Written down here because it is the finding that made the `clients` field
 * exist, and a record edit can silently undo it.
 */
test('a licence held by an entity that takes no retail client serves nobody', () => {
  for (const b of BROKERS) {
    for (const e of b.entities) {
      if (e.clients === 'professional') {
        assert.deepEqual(e.serves, [], `${b.slug}: ${e.legalName} is professional-only and still serves ${e.serves.join(', ')}`);
      }
    }
  }
  const uk = brokerBySlug('exness')!.entities.find((e) => e.licence.number === '730729');
  assert.equal(uk?.clients, 'professional', 'the Exness FCA entity is marked professional-only');
  assert.ok(profileFor('exness'), 'and the page says why');
});

/**
 * The rule that makes citing our own side safe.
 *
 * A directory whose whole claim is independence may still cite a publisher it
 * is connected to — refusing to read something because you own it is a pose,
 * not a standard. What it may not do is let that citation look like outside
 * corroboration. So the connection is a field on the source, the field is
 * rendered next to the entry, and this fails the build if it is set to
 * something that discloses nothing.
 */
test('a source we are connected to discloses the connection, and says enough to be one', () => {
  for (const p of PROFILES) {
    for (const s of p.sources) {
      if (s.affiliated === undefined) continue;
      assert.ok(s.affiliated.trim().length > 40, `${p.slug}/${s.id}: "${s.affiliated}" is not a disclosure`);
      assert.ok(/\bus\b|\bour\b|\bwe\b|this site/i.test(s.affiliated), `${p.slug}/${s.id}: names no connection to us`);
    }
  }
});

/**
 * A connected source is an input, never the verdict. Anything it tells us that
 * matters has to be confirmed at a register, a filing or a regulator before it
 * is published, so a profile that leans on one and cites no primary evidence
 * beside it is a profile repeating its own side.
 */
test('a profile citing a connected source also cites primary evidence', () => {
  const primary = new Set(['register', 'filing', 'regulator']);
  for (const p of PROFILES) {
    if (!p.sources.some((s) => s.affiliated !== undefined)) continue;
    const cited = new Set([...profileCitations(p), ...p.facts.map((f) => f.from)]);
    const backing = p.sources.filter((s) => s.affiliated === undefined && primary.has(s.kind) && cited.has(s.id));
    assert.ok(backing.length >= 2, `${p.slug}: leans on a connected source with ${backing.length} primary sources behind it`);
  }
});
