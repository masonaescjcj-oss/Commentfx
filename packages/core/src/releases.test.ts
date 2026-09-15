import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RELEASES } from './releases.ts';

/**
 * `aka` is what makes the site's own search answer "nfp" with the page about
 * the release rather than the calendar index. It is easy to add a release and
 * forget it, and the failure is silent: the page exists, it is in the sitemap,
 * and nobody typing the only name they know can find it.
 */

test('every release carries the words a trader would type', () => {
  for (const r of RELEASES) {
    assert.ok(r.aka.length > 0, `${r.slug} has no aka terms`);
    for (const a of r.aka) {
      assert.equal(a, a.toLowerCase(), `${r.slug}: "${a}" is not lowercase, so matching will miss it`);
      assert.ok(a.trim() === a && a.length > 1, `${r.slug}: "${a}" is not a usable term`);
    }
  }
});

test('the abbreviation a release is known by is one of them', () => {
  // Each of these is what the release is actually called in a trading room.
  const expected: Record<string, string> = {
    'us-jobs-report': 'nfp',
    'us-inflation-cpi': 'cpi',
    'us-producer-prices-ppi': 'ppi',
    'us-job-openings-jolts': 'jolts',
    'fed-rate-decision': 'fomc',
    'ecb-rate-decision': 'ecb',
  };
  for (const [slug, abbr] of Object.entries(expected)) {
    const r = RELEASES.find((x) => x.slug === slug);
    assert.ok(r, `${slug} is gone from RELEASES`);
    assert.ok(r.aka.includes(abbr), `${slug} does not answer to "${abbr}"`);
  }
});

test('slugs are unique', () => {
  assert.equal(new Set(RELEASES.map((r) => r.slug)).size, RELEASES.length);
});
