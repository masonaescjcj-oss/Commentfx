import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCysec } from './cysec.ts';
import { compareLicence, normaliseName, type RegisterEntry, type RegisterResult } from './types.ts';

// Mirrors the real markup: the firm name is a card-title anchor sitting ABOVE
// the card body, not inside it.
const card = (name: string, licence: string, trade = '', extra = '') => `
<div class="card">
  <a href="/en-GB/entities/investment-firms/cypriot/1/" class="card-title">${name}</a>
  <div class="card-body">
    <div><strong>Licence Number</strong>: ${licence}</div>
    <div><strong>Licence Date:</strong> 04/09/2023</div>
    ${trade ? `<div><strong>Approved Trade Names:</strong> ${trade}</div>` : ''}
    ${extra}
  </div>
</div>`;

test('parses licence number and firm name out of a card', () => {
  const entries = parseCysec(card('Exness (Cy) Ltd', '178/12', 'EXENICO'));
  assert.equal(entries.length, 1);
  assert.equal(entries[0]!.licenceNumber, '178/12');
  assert.match(entries[0]!.firmName, /Exness/);
});

test('a withdrawn firm is marked, not dropped', () => {
  const entries = parseCysec(card('Gone Ltd', '001/05', '', '<div>Licence withdrawn</div>'));
  assert.equal(entries[0]!.status, 'withdrawn');
});

test('cards without a licence number are skipped, not guessed at', () => {
  const noise = '<a class="card-title">Board of Directors</a><div class="card-body">people</div>';
  const entries = parseCysec(noise + card('Real Ltd', '002/06'));
  assert.equal(entries.length, 1);
  assert.equal(entries[0]!.firmName, 'Real Ltd');
});

const okResult = (entries: RegisterEntry[]): RegisterResult =>
  ({ ok: true, regulator: 'CySEC', sourceUrl: 'https://example.invalid', entries, fetchedAt: new Date().toISOString() });

test('a licence present under a matching name is confirmed', () => {
  const r = okResult(parseCysec(card('Exness (Cy) Ltd', '178/12')));
  const f = compareLicence(r, '178/12', 'Exness (CY) Ltd');
  assert.equal(f.kind, 'confirmed');
});

test('a licence present under a different name is a mismatch, not a pass', () => {
  const r = okResult(parseCysec(card('Completely Other Ltd', '178/12')));
  const f = compareLicence(r, '178/12', 'Exness (CY) Ltd');
  assert.equal(f.kind, 'name-mismatch');
  assert.match(f.detail, /Completely Other/);
});

test('a trading name counts as a match', () => {
  const r = okResult(parseCysec(card('Holdco Ltd', '120/10', 'Trading Point of Financial Instruments')));
  const f = compareLicence(r, '120/10', 'Trading Point of Financial Instruments Ltd');
  assert.equal(f.kind, 'confirmed');
});

test('a licence absent from the register is reported as not found', () => {
  const r = okResult(parseCysec(card('Someone Else Ltd', '999/99')));
  const f = compareLicence(r, '185/12', 'ForexTime Ltd');
  assert.equal(f.kind, 'not-found');
});

test('an unreadable register never becomes an accusation', () => {
  const failed: RegisterResult = {
    ok: false, regulator: 'CySEC', sourceUrl: 'https://example.invalid',
    reason: 'timeout', fetchedAt: new Date().toISOString(),
  };
  const f = compareLicence(failed, '178/12', 'Exness (CY) Ltd');
  assert.equal(f.kind, 'source-unavailable');
  assert.notEqual(f.kind as string, 'not-found');
  assert.match(f.detail, /says nothing about the licence/i);
});

test('name normalisation ignores case, punctuation and company suffixes', () => {
  assert.equal(normaliseName('Exness (CY) Ltd.'), normaliseName('EXNESS CY LIMITED'));
  assert.notEqual(normaliseName('Exness'), normaliseName('Pepperstone'));
});

test('a card whose name is missing is not silently kept', () => {
  // The failure that actually happened: licence numbers parsed perfectly while
  // every name came back empty, which read downstream as a name mismatch.
  const headless = '<div class="card-body"><strong>Licence Number</strong>: 010/05</div>';
  assert.equal(parseCysec(headless).length, 0);
});
