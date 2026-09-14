import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, luminance, parseHex, legibleTile, AA_TEXT } from './contrast.ts';
import { BROKERS } from './data/brokers.ts';
import { PROPS } from './data/props.ts';
import { EXCHANGES } from './data/exchanges.ts';

test('the ratio matches the values WCAG gives for the extremes', () => {
  assert.equal(contrastRatio('#FFFFFF', '#000000').toFixed(2), '21.00');
  assert.equal(contrastRatio('#FFFFFF', '#FFFFFF').toFixed(2), '1.00');
  // A known pair: #767676 is the lightest grey that passes on white.
  assert.ok(contrastRatio('#767676', '#FFFFFF') >= AA_TEXT);
  assert.ok(contrastRatio('#777777', '#FFFFFF') < AA_TEXT);
});

test('shorthand hex is read the same as the long form', () => {
  assert.deepEqual(parseHex('#fff'), parseHex('#FFFFFF'));
  assert.equal(luminance('#0f0').toFixed(4), luminance('#00FF00').toFixed(4));
});

test('unreadable input does not silently become black', () => {
  assert.equal(parseHex('rgb(1,2,3)'), null);
  assert.equal(parseHex('#12345'), null);
  const tile = legibleTile('not a colour', '#FFFFFF');
  assert.ok(contrastRatio(tile.fg, tile.bg) >= AA_TEXT, 'it still returns something readable');
});

test('a brand pairing that already works is left alone', () => {
  const tile = legibleTile('#0D1421', '#FFFFFF');
  assert.equal(tile.bg, '#0D1421');
  assert.equal(tile.fg, '#FFFFFF');
});

test('a brand colour that fails against both black and white gets a darker tile', () => {
  // #1F8A70 is the narrow case: 4.26:1 against white, 4.33:1 against black.
  // Neither text colour can rescue it, so the tile itself has to move.
  const brand = '#1F8A70';
  assert.ok(contrastRatio('#FFFFFF', brand) < AA_TEXT);
  assert.ok(contrastRatio('#0D1421', brand) < AA_TEXT);

  const tile = legibleTile(brand, '#FFFFFF');
  assert.notEqual(tile.bg, brand, 'the tile darkens rather than the text staying unreadable');
  assert.ok(contrastRatio(tile.fg, tile.bg) >= AA_TEXT);
});

test('a dark brand colour keeps its tile and takes white text', () => {
  const tile = legibleTile('#14B87C', '#FFFFFF');
  assert.equal(tile.bg, '#14B87C', 'a green tile that dark text can sit on stays exactly as it is');
  assert.equal(tile.fg, '#0D1421');
  assert.ok(contrastRatio(tile.fg, tile.bg) >= AA_TEXT);
});

test('a pale brand colour takes dark text rather than a darkened tile', () => {
  const tile = legibleTile('#FFD84D', '#FFFFFF');
  assert.equal(tile.bg, '#FFD84D', 'a yellow tile stays yellow');
  assert.ok(contrastRatio(tile.fg, tile.bg) >= AA_TEXT);
});

test('every logo in the seed data ends up readable', () => {
  const all = [
    ...BROKERS.map((b) => ({ name: b.name, logo: b.logo })),
    ...PROPS.map((p) => ({ name: p.name, logo: p.logo })),
    ...EXCHANGES.map((e) => ({ name: e.name, logo: e.logo })),
  ];
  for (const { name, logo } of all) {
    const tile = legibleTile(logo.bg, logo.fg);
    const ratio = contrastRatio(tile.fg, tile.bg);
    assert.ok(ratio >= AA_TEXT, `${name}: ${tile.fg} on ${tile.bg} is only ${ratio.toFixed(2)}:1`);
  }
});
