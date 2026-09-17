import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIONS, actionsFor, bearsOnClients, conductScore, ageFactor,
  CONDUCT_COST, STAGE_FACTOR, SEARCHED,
} from './actions.ts';
import { WEIGHTS, LABELS } from '../score.ts';
import { BROKERS, brokerBySlug } from './brokers.ts';
import { EXCHANGES, exchangeBySlug } from './exchanges.ts';
import { PROPS, propBySlug } from './props.ts';
import { profileFor } from './profiles.ts';

/**
 * The register of what authorities have done. Its whole value is that a reader
 * can tell an allegation from a finding, so the rules are about that.
 */

/**
 * One register serves every vertical, so the rule is that a subject is
 * something this site actually ranks — and that no two verticals use the same
 * slug, which is the assumption the single register rests on.
 */
test('every action belongs to a record we rank', () => {
  for (const a of ACTIONS) {
    assert.ok(
      brokerBySlug(a.subject) || exchangeBySlug(a.subject) || propBySlug(a.subject),
      `${a.subject} is not a broker, an exchange or a prop firm`,
    );
  }
});

test('no two verticals claim the same slug, which one register depends on', () => {
  const slugs = [...BROKERS.map((b) => b.slug), ...EXCHANGES.map((e) => e.slug), ...PROPS.map((p) => p.slug)];
  assert.equal(new Set(slugs).size, slugs.length, 'a slug is used by two verticals');
});

test('every action names a body, a date and a document', () => {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  for (const a of ACTIONS) {
    assert.ok(a.authority.trim().length > 4, `${a.subject}: authority`);
    assert.match(a.date, iso, `${a.subject}/${a.authority}: date`);
    assert.ok(Date.parse(`${a.date}T00:00:00Z`) <= Date.now(), `${a.subject}: dated in the future`);
    assert.match(a.sourceUrl, /^https:\/\//, `${a.subject}: ${a.sourceUrl}`);
    assert.ok(a.sourcePublisher.trim(), `${a.subject}: no publisher`);
    assert.ok(a.summary.length > 60 && a.detail.length > 80, `${a.subject}: too thin to be useful`);
    assert.ok(/^[A-Z]{2}$/.test(a.country), `${a.subject}: ${a.country}`);
  }
});

/**
 * The one that matters. Calling a filed complaint a finding would be a libel;
 * burying a finding as "claims" is what review sites do. Neither is allowed to
 * happen by accident, so the words are checked against the stage.
 */
test('an undecided case is never described as decided', () => {
  for (const a of ACTIONS) {
    const text = `${a.summary} ${a.detail}`;
    if (a.stage === 'alleged') {
      assert.match(text, /alleg|says|claims|pleading|filed|complaint|not.*decided/i,
        `${a.subject}/${a.authority}: an allegation that never says so`);
      assert.ok(!/\bfound that\b|\bwas found\b/i.test(text),
        `${a.subject}/${a.authority}: an allegation written as a finding`);
    }
    if (a.stage === 'under-appeal') {
      assert.match(text, /appeal/i, `${a.subject}/${a.authority}: under appeal and never says so`);
    }
  }
});

test('the most serious kinds count as bearing on clients, an ownership row does not', () => {
  const prosecution = ACTIONS.find((a) => a.kind === 'prosecution');
  assert.ok(prosecution && bearsOnClients(prosecution));
  const civil = ACTIONS.find((a) => a.kind === 'civil-claim');
  assert.ok(civil && !bearsOnClients(civil));
});

test('actions come back newest first', () => {
  const dates = actionsFor('octafx').map((a) => a.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
});

/**
 * A broker with something on the record needs a page that explains it. The
 * generated review cannot: it reads the record and the record has no room for
 * a prosecution. So the profile is the only place it can be argued, and this
 * fails the build if one is added without the other.
 */
test('a broker with an action on record has a researched profile', () => {
  for (const a of ACTIONS) {
    if (!bearsOnClients(a)) continue;
    // Brokers only: the other verticals carry their research in their own
    // profile tables, and each of those enforces the same rule for itself.
    if (!brokerBySlug(a.subject)) continue;
    assert.ok(profileFor(a.subject), `${a.subject} has ${a.authority} on record and no profile`);
  }
});

/* ── the conduct component ───────────────────────────────────────────────── */

test('nobody has looked is null, not ten', () => {
  assert.equal(conductScore('a-broker-nobody-has-researched'), null);
  // Every broker named in SEARCHED gets a number, and it is never null.
  for (const slug of Object.keys(SEARCHED)) {
    assert.equal(typeof conductScore(slug), 'number', slug);
  }
});

test('searched and clean scores ten; searched and not clean does not', () => {
  const clean = Object.keys(SEARCHED).filter((s) => actionsFor(s).length === 0);
  assert.ok(clean.length > 0, 'no clean broker to check against');
  for (const s of clean) assert.equal(conductScore(s), 10, s);

  const octa = conductScore('octafx')!;
  assert.ok(octa < 4, `a live prosecution and a regulator restriction scored ${octa}`);
});

test('an allegation costs less than the same thing decided', () => {
  const now = new Date('2026-09-16T00:00:00Z');
  const one = (stage: 'alleged' | 'decided') =>
    CONDUCT_COST.prosecution * STAGE_FACTOR[stage] * ageFactor('2026-01-01', now);
  assert.ok(one('alleged') < one('decided'));
  // And it is not free: a prosecution nobody has decided still moves the number.
  assert.ok(one('alleged') > 0);
});

test('an old matter fades and a very old one stops counting', () => {
  const now = new Date('2026-09-16T00:00:00Z');
  assert.equal(ageFactor('2025-01-01', now), 1);
  assert.equal(ageFactor('2021-01-01', now), 0.5);
  assert.equal(ageFactor('2018-01-01', now), 0.25);
  // The 2013 CySEC fine against XM's predecessor, which is why this exists.
  assert.equal(ageFactor('2013-05-27', now), 0);
});

test('the published weights are the ones the score uses, and they sum to one', () => {
  const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(total - 1) < 1e-9, `weights sum to ${total}`);
  assert.ok(WEIGHTS.conduct > 0, 'conduct carries no weight');
  // Every key in the model has a label, or the methodology page renders a hole.
  for (const key of Object.keys(WEIGHTS)) assert.ok(LABELS[key as keyof typeof LABELS], key);
});
