import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  impactFor, zonedTimeToUtc, weekStart, addDays, utcDay, groupByDay, eventId,
  type CalendarEvent,
} from './calendar.ts';

test('summer and winter release times land on different UTC hours', () => {
  // 08:30 in Washington is 12:30 UTC in October and 13:30 UTC in December.
  // A single fixed offset would put one of them an hour wrong, which is the
  // whole reason this goes through Intl.
  const summer = zonedTimeToUtc(2026, 10, 2, 8, 30, 'America/New_York');
  const winter = zonedTimeToUtc(2026, 12, 10, 8, 30, 'America/New_York');
  assert.equal(summer.toISOString(), '2026-10-02T12:30:00.000Z');
  assert.equal(winter.toISOString(), '2026-12-10T13:30:00.000Z');
});

test('a time on the day the clocks change is still the stated wall clock', () => {
  // US clocks go back on 1 November 2026. 08:30 that morning is already EST.
  const at = zonedTimeToUtc(2026, 11, 1, 8, 30, 'America/New_York');
  const shown = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(at);
  assert.equal(shown, '08:30');
});

test('midnight and noon survive the 12-hour round trip', () => {
  const noon = zonedTimeToUtc(2026, 6, 15, 12, 0, 'America/New_York');
  assert.equal(noon.toISOString(), '2026-06-15T16:00:00.000Z');
});

test('the releases that move the dollar are graded high', () => {
  assert.equal(impactFor('Employment Situation'), 'high');
  assert.equal(impactFor('Consumer Price Index'), 'high');
  assert.equal(impactFor('FOMC rate decision'), 'high');
  assert.equal(impactFor('ECB rate decision'), 'high');
});

test('regional and sectoral releases are graded low, not medium by default', () => {
  assert.equal(impactFor('State Employment and Unemployment (Monthly)'), 'low');
  assert.equal(impactFor('County Employment and Wages'), 'low');
  assert.equal(impactFor('Employee Benefits in the United States'), 'low');
  assert.equal(impactFor('Producer Price Index'), 'medium');
});

test('a week starts on Monday whatever day you ask on', () => {
  const monday = '2026-09-14';
  for (let i = 0; i < 7; i++) {
    const day = new Date(`2026-09-${14 + i}T09:00:00Z`);
    assert.equal(utcDay(weekStart(day)), monday, `from ${utcDay(day)}`);
  }
  assert.equal(utcDay(weekStart(new Date('2026-09-21T00:00:00Z'))), '2026-09-21');
});

const ev = (date: string, title: string, at: string | null = null): CalendarEvent => ({
  id: eventId('test', date, title), date, at, localTime: null, title, detail: null,
  currency: 'USD', source: 'BLS', sourceUrl: 'https://example.invalid', impact: impactFor(title),
});

test('a day with nothing on it is still a day', () => {
  const days = groupByDay([ev('2026-09-16', 'Consumer Price Index')], new Date('2026-09-14T00:00:00Z'), 7);
  assert.equal(days.length, 7);
  assert.equal(days[0]!.events.length, 0, 'an empty Monday must not vanish from the week');
  assert.equal(days[2]!.events[0]!.title, 'Consumer Price Index');
});

test('events within a day are ordered by time, timed ones first', () => {
  const day = groupByDay([
    ev('2026-09-16', 'FOMC rate decision'),
    ev('2026-09-16', 'Consumer Price Index', '2026-09-16T12:30:00.000Z'),
    ev('2026-09-16', 'Producer Price Index', '2026-09-16T14:00:00.000Z'),
  ], new Date('2026-09-16T00:00:00Z'), 1)[0]!;
  assert.deepEqual(day.events.map((e) => e.title), [
    'Consumer Price Index', 'Producer Price Index', 'FOMC rate decision',
  ]);
});

test('the same release on the same day keeps one id across refreshes', () => {
  assert.equal(
    eventId('bls', '2026-10-02', 'Employment Situation'),
    eventId('bls', '2026-10-02', 'Employment Situation'),
  );
  assert.notEqual(
    eventId('bls', '2026-10-02', 'Employment Situation'),
    eventId('bls', '2026-11-06', 'Employment Situation'),
  );
});

test('addDays crosses a month boundary', () => {
  assert.equal(utcDay(addDays(new Date('2026-09-28T00:00:00Z'), 5)), '2026-10-03');
});
