import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyResponse } from './sites.ts';

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
