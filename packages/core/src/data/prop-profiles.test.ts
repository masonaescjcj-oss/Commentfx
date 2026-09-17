import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PROP_PROFILES, propProfileFor, propProfileCitations, propProfileWordCount,
} from './prop-profiles.ts';
import { PROPS, propBySlug } from './props.ts';

/**
 * The same apparatus the broker profiles carry, for a category with weaker
 * evidence available. That is the reason to keep it rather than to relax it: a
 * prop firm has no register behind it, so the only thing standing between this
 * prose and a press release is whether every sentence is tied to a document
 * with a date on it.
 */

test('every prop profile belongs to a firm we actually rank', () => {
  for (const p of PROP_PROFILES) {
    assert.ok(propBySlug(p.slug), `${p.slug} is not a prop firm`);
  }
  assert.equal(new Set(PROP_PROFILES.map((p) => p.slug)).size, PROP_PROFILES.length, 'two profiles for one firm');
});

test('every citation resolves to a source', () => {
  for (const p of PROP_PROFILES) {
    const ids = new Set(p.sources.map((s) => s.id));
    for (const cited of propProfileCitations(p)) {
      assert.ok(ids.has(cited), `${p.slug} cites [${cited}], which is not in its sources`);
    }
  }
});

test('every source is cited, or carries a fact', () => {
  for (const p of PROP_PROFILES) {
    const used = new Set([...propProfileCitations(p), ...p.facts.map((f) => f.from)]);
    for (const s of p.sources) {
      assert.ok(used.has(s.id), `${p.slug} lists source ${s.id} and never uses it`);
    }
    assert.equal(new Set(p.sources.map((s) => s.id)).size, p.sources.length, `${p.slug}: duplicate source id`);
  }
});

test('every fact points at a source that exists', () => {
  for (const p of PROP_PROFILES) {
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
  for (const p of PROP_PROFILES) {
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
 * The rule that keeps the two halves of a prop page from disagreeing. The
 * record holds the target, the drawdown, the split and the fee; the prose may
 * argue about them and may not restate them, because the restatement is the
 * copy nobody remembers to update.
 */
test('a prop profile never restates a number the record already holds', () => {
  for (const p of PROP_PROFILES) {
    const f = propBySlug(p.slug)!;
    const prose = p.sections.flatMap((s) => s.paragraphs).join(' ');
    const banned: Array<[string, string]> = [
      [`${f.payout.splitPct}% split`, 'the profit split'],
      [`$${f.feeUsdPer100k}`, 'the challenge fee'],
      [`${f.rules.maxDrawdownPct}% maximum drawdown`, 'the maximum drawdown'],
    ];
    for (const [needle, what] of banned) {
      assert.ok(!prose.includes(needle), `${p.slug}: the prose restates ${what} ("${needle}")`);
    }
  }
});

test('a prop profile is long enough and every section argues something', () => {
  for (const p of PROP_PROFILES) {
    assert.ok(propProfileWordCount(p) >= 350, `${p.slug}: ${propProfileWordCount(p)} words`);
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
 * An entity map is only worth having if the names in it are the firm's own, so
 * every company a record names has to be one a profile cites — otherwise the
 * map is a claim with nothing behind it.
 */
test('a firm with entities on record has a profile that cites where they came from', () => {
  for (const f of PROPS) {
    if (f.entities.length === 0) continue;
    const p = propProfileFor(f.slug);
    assert.ok(p, `${f.slug} names ${f.entities.length} companies and has no profile saying where they came from`);
    assert.ok(p.sources.length >= 1, `${f.slug}: a profile with no sources`);
  }
});

test('an entity map names a company once per role, with a country we can draw', () => {
  for (const f of PROPS) {
    const seen = new Set<string>();
    for (const e of f.entities) {
      const key = `${e.legalName}|${e.country}|${e.role}`;
      assert.ok(!seen.has(key), `${f.slug}: ${e.legalName} listed twice in the same role`);
      seen.add(key);
      assert.ok(e.legalName.trim(), `${f.slug}: an entity with no name`);
      assert.match(e.country, /^[A-Z]{2}$/, `${f.slug}: ${e.legalName} has country "${e.country}"`);
    }
    // At most one company can be the one whose terms you accept.
    const contracting = f.entities.filter((e) => e.role === 'contracting');
    assert.ok(contracting.length <= 1, `${f.slug}: ${contracting.length} companies claim to hold the contract`);
  }
});

/**
 * Written down because it is the finding that made this research worth doing:
 * every correction went the same way, and a record edit could quietly undo it.
 */
test('the split on record is what a newly funded trader gets, not the ceiling', () => {
  const ftmo = propBySlug('ftmo')!;
  assert.equal(ftmo.payout.splitPct, 80, 'FTMO pays 80 at funding; 90 is four months away');
  const five = propBySlug('the5ers')!;
  assert.equal(five.payout.splitPct, 80, 'The5%ers starts at 80; 100 is the top of a ladder');
  const alpha = propBySlug('alpha-capital-group')!;
  assert.equal(alpha.payout.splitPct, 80, 'Alpha Capital pays 80');
  assert.equal(alpha.rules.minTradingDays, 3, 'Alpha Capital requires three trading days per phase');
  assert.equal(alpha.rules.consistencyRule, true, 'Alpha Capital applies a 40% best-day rule');
});
