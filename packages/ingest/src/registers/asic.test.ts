import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toEntries } from './asic.ts';

/**
 * The parsing half, kept pure so the cases that matter can be handed to it.
 * The fetching half is exercised by the daily probe against the live dataset —
 * a unit test that makes seven network calls is not a unit test.
 */

test('a row becomes an entry', () => {
  const [e] = toEntries([{ AFS_LIC_NUM: '414530', AFS_LIC_NAME: 'PEPPERSTONE GROUP LIMITED' }]);
  assert.deepEqual(e, {
    licenceNumber: '414530',
    firmName: 'PEPPERSTONE GROUP LIMITED',
    tradingNames: [],
    status: 'active',
  });
});

test('a numeric licence number survives JSON giving it as a number', () => {
  const [e] = toEntries([{ AFS_LIC_NUM: 335692, AFS_LIC_NAME: 'INTERNATIONAL CAPITAL MARKETS PTY. LTD.' }]);
  assert.equal(e?.licenceNumber, '335692');
});

/**
 * The failure that matters. If the dataset renames its columns, every row
 * arrives with both fields undefined. Keeping those would publish a register
 * full of blanks, and every licence on this site would read as not-found —
 * an accusation, from a schema change.
 */
test('rows with no usable fields are dropped rather than kept as blanks', () => {
  const rows = [
    { AFS_LIC_NUM: undefined, AFS_LIC_NAME: undefined },
    { licence_number: '414530', licence_name: 'PEPPERSTONE GROUP LIMITED' } as never,
    { AFS_LIC_NUM: '', AFS_LIC_NAME: '' },
  ];
  assert.equal(toEntries(rows).length, 0);
});

test('a licence number that is not a number is not a licence number', () => {
  const rows = [
    { AFS_LIC_NUM: 'n/a', AFS_LIC_NAME: 'SOMETHING PTY LTD' },
    { AFS_LIC_NUM: '12', AFS_LIC_NAME: 'TOO SHORT PTY LTD' },
  ];
  assert.equal(toEntries(rows).length, 0);
});

test('surrounding whitespace is not part of the answer', () => {
  const [e] = toEntries([{ AFS_LIC_NUM: ' 391441 ', AFS_LIC_NAME: '  EIGHTCAP PTY LTD  ' }]);
  assert.equal(e?.licenceNumber, '391441');
  assert.equal(e?.firmName, 'EIGHTCAP PTY LTD');
});
