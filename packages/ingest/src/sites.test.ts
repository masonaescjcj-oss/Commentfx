import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyResponse, identifies } from './sites.ts';

const page = (title: string) =>
  `<!DOCTYPE html><html><head><title>${title}</title></head><body>${'x'.repeat(2500)}</body></html>`;

test('a 410 that still serves its homepage is not gone', () => {
  // octafx.com does exactly this: 410 Gone, then the broker's full homepage.
  // Believing the status line alone said the company had vanished, and acting
  // on that put an unrelated company's address on a broker's record.
  const r = classifyResponse(410, page('Octa: the leading broker for online trading'), false);
  assert.equal(r.state, 'ok');
  assert.match(r.detail, /still serving a page/);
});

test('a 410 with nothing behind it is gone', () => {
  const r = classifyResponse(410, '', false);
  assert.equal(r.state, 'gone');
});

test('a 404 error page with a title but no content is still gone', () => {
  const r = classifyResponse(404, '<html><head><title>Not Found</title></head><body>404</body></html>', false);
  assert.equal(r.state, 'gone', 'a stub error page is not a site');
});

test('bot protection is reported as our problem, not theirs', () => {
  for (const status of [403, 429]) {
    const r = classifyResponse(status, '', false);
    assert.equal(r.state, 'blocked', `HTTP ${status} is about our address`);
  }
});

test('a server error is neither gone nor blocked', () => {
  assert.equal(classifyResponse(503, '', false).state, 'unreachable');
});

test('a link that lands on another hostname is reported as moved', () => {
  const r = classifyResponse(200, page('IC'), true);
  assert.equal(r.state, 'moved');
});

test('a plain 200 where it was asked for is fine', () => {
  assert.equal(classifyResponse(200, page('Pepperstone'), false).state, 'ok');
});

/* ── does the page belong to the company we think it does? ─────────── */

const realPage = (body: string) =>
  `<!DOCTYPE html><html><head><title>x</title></head><body>${body} ${'filler text '.repeat(60)}</body></html>`;

test('a page that never names the company is flagged, not passed', () => {
  const page = realPage('Hands-free tablet mounts for bed, cooking, music, art and travel.');
  assert.equal(identifies(page, ['Pepperstone', 'Pepperstone Group Limited']), 'no');

  const r = classifyResponse(200, page, false, '', ['Pepperstone', 'Pepperstone Group Limited']);
  assert.equal(r.state, 'mismatch', 'a live link to the wrong company is worse than a dead one');
});

test('the legal entity in a footer is proof enough', () => {
  // ic.com leads with "IC" and names the entity only at the bottom.
  const page = realPage('Trade currencies and CFDs. IC and IC Markets Global are the trading names of Raw Trading Ltd.');
  assert.equal(identifies(page, ['IC Markets', 'Raw Trading Ltd']), 'yes');
});

test('a page with too little text is unknown, never an accusation', () => {
  assert.equal(identifies('<html><body>loading…</body></html>', ['Exness']), 'unknown');
  assert.equal(classifyResponse(200, '<html><body>loading…</body></html>', false, '', ['Exness']).state, 'ok');
});

test('this check would NOT have caught the octa.com mistake, and that is the point', () => {
  // The tablet-mount company at octa.com is also called Octa, so the word is
  // on the page and the record's own name vouches for a stranger's site.
  // Matching names is deliberately generous, to avoid crying wolf; the cost is
  // that it cannot separate two businesses that share one. Anything stronger
  // needs a human, and this test exists so nobody reads a green run as proof
  // that every link points where it should.
  const page = realPage('Octa — hands-free tablet mounts for bed, cooking and travel.');
  assert.equal(identifies(page, ['OctaFX', 'Octa Markets Cyprus Ltd']), 'yes');
});
