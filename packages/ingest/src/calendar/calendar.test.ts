import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBls } from './bls.ts';
import { parseFomc } from './fomc.ts';
import { parseEcb } from './ecb.ts';

/* ---------------------------------------------------------------- BLS ---- */

const blsRow = (date: string, time: string, strong: string, rest = '') =>
  `<tr class="release-list-odd-row">
<td class="date-cell"><p>${date}</p></td>
<td class="time-cell"><p>${time}</p></td>
<td class="desc-cell"><p><strong>${strong}</strong>${rest}</p></td></tr>`;

test('a BLS release becomes an event with an exact instant', () => {
  const [e] = parseBls(blsRow('Friday, October 2, 2026', '08:30 AM', 'Employment Situation', ' for September 2026'), 2026);
  assert.equal(e!.date, '2026-10-02');
  assert.equal(e!.at, '2026-10-02T12:30:00.000Z');
  assert.equal(e!.localTime, '08:30 ET');
  assert.equal(e!.title, 'Employment Situation');
  assert.equal(e!.detail, 'for September 2026');
  assert.equal(e!.impact, 'high');
});

test('an afternoon release is not read as the morning', () => {
  const [e] = parseBls(blsRow('Tuesday, June 2, 2026', '02:00 PM', 'Some Release'), 2026);
  assert.equal(e!.localTime, '14:00 ET');
  assert.equal(e!.at, '2026-06-02T18:00:00.000Z');
});

test('a federal holiday is not published as a release', () => {
  const html =
    blsRow('Thursday, January 1, 2026', '&nbsp;', "New Year's Day") +
    blsRow('Wednesday, January 7, 2026', '10:00 AM', 'Job Openings and Labor Turnover Survey');
  const events = parseBls(html, 2026);
  assert.equal(events.length, 1, 'the federal holiday list is not the market holiday list');
  assert.equal(events[0]!.title, 'Job Openings and Labor Turnover Survey');
});

test('a row the parser cannot read is skipped, never guessed at', () => {
  const events = parseBls('<tr><td class="date-cell"><p>sometime soon</p></td></tr>', 2026);
  assert.equal(events.length, 0);
});

/* --------------------------------------------------------------- FOMC ---- */

const fomcPanel = (year: number, rows: Array<[string, string]>) =>
  `panel panel-default"><div class="panel-heading"><h4><a id="1">${year} FOMC Meetings</a></h4></div>` +
  rows.map(([month, date]) =>
    `<div class="row fomc-meeting">
      <div class="fomc-meeting__month col-md-2"><strong>${month}</strong></div>
      <div class="fomc-meeting__date col-lg-1">${date}</div>
    </div>`).join('');

test('a two-day meeting is published on the day the decision lands', () => {
  const [e] = parseFomc(fomcPanel(2026, [['January', '27-28']]));
  assert.equal(e!.date, '2026-01-28');
  assert.equal(e!.title, 'FOMC rate decision');
  assert.equal(e!.impact, 'high');
  assert.equal(e!.at, null, 'the Fed publishes no time, so we publish none');
});

test('a meeting straddling two months lands in the second month', () => {
  const [e] = parseFomc(fomcPanel(2024, [['Apr/May', '30-1']]));
  assert.equal(e!.date, '2024-05-01');
});

test('the projections asterisk is carried into the detail, not into the date', () => {
  const [e] = parseFomc(fomcPanel(2026, [['March', '17-18*']]));
  assert.equal(e!.date, '2026-03-18');
  assert.match(e!.detail!, /Summary of Economic Projections/);
});

test('a notation vote is not published as a meeting', () => {
  const events = parseFomc(fomcPanel(2025, [['August', '22 (notation vote)'], ['September', '16-17*']]));
  assert.equal(events.length, 1);
  assert.equal(events[0]!.date, '2025-09-17');
});

/* ---------------------------------------------------------------- ECB ---- */

const ecbList = (rows: Array<[string, string]>) =>
  '<main>' + rows.map(([d, text]) => `<dt> ${d} </dt>\n<dd> ${text}<br></dd>`).join('\n') + '</main>';

test('an ECB rate-setting day becomes a high-impact euro event', () => {
  const [e] = parseEcb(ecbList([
    ['29/10/2026', 'Governing Council of the ECB: monetary policy meeting in Frankfurt (Day 2), followed by press conference'],
  ]));
  assert.equal(e!.date, '2026-10-29');
  assert.equal(e!.currency, 'EUR');
  assert.equal(e!.impact, 'high');
  assert.match(e!.detail!, /press conference/);
});

test('a non-monetary meeting is excluded despite containing the phrase', () => {
  const events = parseEcb(ecbList([
    ['30/09/2026', 'Governing Council of the ECB: non-monetary policy meeting (in Frankfurt)'],
    ['26/11/2026', 'General Council meeting of the ECB in Frankfurt'],
  ]));
  assert.equal(events.length, 0, '"non-monetary policy meeting" contains "monetary policy meeting"');
});

test('day one of a two-day Governing Council meeting is not a decision', () => {
  const events = parseEcb(ecbList([
    ['28/10/2026', 'Governing Council of the ECB: monetary policy meeting in Frankfurt (Day 1)'],
    ['29/10/2026', 'Governing Council of the ECB: monetary policy meeting in Frankfurt (Day 2), followed by press conference'],
  ]));
  assert.equal(events.length, 1);
  assert.equal(events[0]!.date, '2026-10-29');
});
