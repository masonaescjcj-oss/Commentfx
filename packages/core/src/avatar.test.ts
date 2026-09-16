import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avatarFor, hslHex, AVATAR_SATURATION, AVATAR_LIGHTNESS } from './avatar.ts';
import { contrastRatio, AA_TEXT } from './contrast.ts';

/**
 * The avatar picks its own colour, so nobody reviews it. This does.
 *
 * The first version used 42% lightness because it looked right on the blues it
 * happened to draw first; axe found 2.90:1 on a yellow one. A generated colour
 * needs a generated check, over the whole range it can generate.
 */
test('white is readable on every hue the avatar can pick', () => {
  let worst = { ratio: Infinity, hue: -1, hex: '' };
  for (let h = 0; h < 360; h++) {
    const hex = hslHex(h, AVATAR_SATURATION, AVATAR_LIGHTNESS);
    const ratio = contrastRatio('#FFFFFF', hex);
    if (ratio < worst.ratio) worst = { ratio, hue: h, hex };
  }
  assert.ok(
    worst.ratio >= AA_TEXT,
    `worst is ${worst.ratio.toFixed(2)}:1 at hue ${worst.hue} (${worst.hex})`,
  );
});

test('the same review always gets the same face', () => {
  for (const id of [1, 7, 42, 1000, 99999]) {
    assert.deepEqual(avatarFor(id), avatarFor(id));
  }
});

test('the initials avoid the letters that read as digits', () => {
  for (let id = 1; id <= 500; id++) {
    const { initials } = avatarFor(id);
    assert.match(initials, /^[A-HJ-NP-Z]{2}$/, `id ${id} → ${initials}`);
  }
});

test('hslHex agrees with a colour anyone can check by hand', () => {
  assert.equal(hslHex(0, 100, 50), '#ff0000');
  assert.equal(hslHex(120, 100, 50), '#00ff00');
  assert.equal(hslHex(240, 100, 50), '#0000ff');
  assert.equal(hslHex(0, 0, 100), '#ffffff');
});
