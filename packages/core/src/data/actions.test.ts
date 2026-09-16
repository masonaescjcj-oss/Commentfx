import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS, actionsFor, bearsOnClients } from './actions.ts';
import { brokerBySlug } from './brokers.ts';
import { profileFor } from './profiles.ts';

/**
 * The register of what authorities have done. Its whole value is that a reader
 * can tell an allegation from a finding, so the rules are about that.
 */

test('every action belongs to a broker we rank', () => {
  for (const a of ACTIONS) assert.ok(brokerBySlug(a.brokerSlug), `${a.brokerSlug} is not a broker`);
});

test('every action names a body, a date and a document', () => {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  for (const a of ACTIONS) {
    assert.ok(a.authority.trim().length > 4, `${a.brokerSlug}: authority`);
    assert.match(a.date, iso, `${a.brokerSlug}/${a.authority}: date`);
    assert.ok(Date.parse(`${a.date}T00:00:00Z`) <= Date.now(), `${a.brokerSlug}: dated in the future`);
    assert.match(a.sourceUrl, /^https:\/\//, `${a.brokerSlug}: ${a.sourceUrl}`);
    assert.ok(a.sourcePublisher.trim(), `${a.brokerSlug}: no publisher`);
    assert.ok(a.summary.length > 60 && a.detail.length > 80, `${a.brokerSlug}: too thin to be useful`);
    assert.ok(/^[A-Z]{2}$/.test(a.country), `${a.brokerSlug}: ${a.country}`);
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
        `${a.brokerSlug}/${a.authority}: an allegation that never says so`);
      assert.ok(!/\bfound that\b|\bwas found\b/i.test(text),
        `${a.brokerSlug}/${a.authority}: an allegation written as a finding`);
    }
    if (a.stage === 'under-appeal') {
      assert.match(text, /appeal/i, `${a.brokerSlug}/${a.authority}: under appeal and never says so`);
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
    assert.ok(profileFor(a.brokerSlug), `${a.brokerSlug} has ${a.authority} on record and no profile`);
  }
});
