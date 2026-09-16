import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreMemecoin, scoreControl, isDisqualifying, securityFindings, MEME_WEIGHTS, type MemecoinInput } from './memecoins.ts';
import { checkName } from './name-safety.ts';

const base: MemecoinInput = {
  name: 'TEST / SOL', tokenAddress: 'abc', network: 'solana', ageHours: 6,
  liquidityUsd: 50_000, volume24hUsd: 20_000, buys24h: 120, sells24h: 80, buyers24h: 60,
  change24hPct: 12,
  security: { mintable: false, freezable: false, balanceMutable: false, metadataMutable: false,
    honeypot: null, buyTaxPct: null, sellTaxPct: null, transferControlled: false },
};
const withSec = (over: Partial<MemecoinInput['security']>): MemecoinInput =>
  ({ ...base, security: { ...base.security, ...over } });

test('weights sum to 1', () => {
  assert.ok(Math.abs(Object.values(MEME_WEIGHTS).reduce((a, b) => a + b, 0) - 1) < 1e-9);
});

test('a clean token scores well', () => {
  assert.ok(scoreMemecoin(base).total >= 7, `scored ${scoreMemecoin(base).total}`);
});

test('a honeypot is capped regardless of everything else', () => {
  const hp = { ...withSec({ honeypot: true }), liquidityUsd: 5_000_000, buys24h: 9999, sells24h: 9999, buyers24h: 5000 };
  const s = scoreMemecoin(hp);
  assert.ok(s.total <= 1.5, `scored ${s.total}`);
  assert.match(s.disqualified ?? '', /sell path/i);
});

test('a mutable balance authority is disqualifying on its own', () => {
  assert.match(isDisqualifying(withSec({ balanceMutable: true })) ?? '', /rewrite holder balances/i);
});

test('mintable and freezable each cost control points', () => {
  const clean = scoreControl(base)!;
  assert.ok(scoreControl(withSec({ mintable: true }))! < clean);
  assert.ok(scoreControl(withSec({ freezable: true }))! < clean);
});

test('unreported security is null, never assumed safe', () => {
  const unknown = withSec({ mintable: null, freezable: null, balanceMutable: null, metadataMutable: null, transferControlled: null });
  assert.equal(scoreControl(unknown), null);
  assert.ok(scoreMemecoin(unknown).skipped.includes('control'));
});

test('thin liquidity scores below deep liquidity', () => {
  const thin = { ...base, liquidityUsd: 6_000 };
  const deep = { ...base, liquidityUsd: 400_000 };
  assert.ok(scoreMemecoin(thin).total < scoreMemecoin(deep).total);
});

test('a book with no sells scores below a two-sided one', () => {
  const oneSided = { ...base, buys24h: 200, sells24h: 0 };
  assert.ok(scoreMemecoin(oneSided).total < scoreMemecoin(base).total);
});

const RLO = String.fromCharCode(0x202E);
const ZWSP = String.fromCharCode(0x200B);
const CYRILLIC_E = String.fromCharCode(0x0415);

test('a name using a bidi override is disqualifying', () => {
  const s = scoreMemecoin({ ...base, name: RLO + 'SSLESU / USDC' });
  assert.match(s.disqualified ?? '', /hidden characters/i);
  assert.ok(s.total <= 1.5, `scored ${s.total}`);
});

test('a homograph name costs control points without disqualifying', () => {
  const homo = { ...base, name: 'US' + CYRILLIC_E + 'LESS / SOL' };
  assert.equal(scoreMemecoin(homo).disqualified, null);
  assert.ok(scoreControl(homo)! < scoreControl(base)!);
});

test('a deceptive name is caught even when no security data was reported', () => {
  const spoofedUnknown: MemecoinInput = {
    ...base, name: RLO + 'XYZ',
    security: { mintable: null, freezable: null, balanceMutable: null, metadataMutable: null,
      honeypot: null, buyTaxPct: null, sellTaxPct: null, transferControlled: null },
  };
  assert.notEqual(scoreControl(spoofedUnknown), null);
  assert.ok(isDisqualifying(spoofedUnknown));
});

test('cleaning strips every invisible character before render', () => {
  const out = checkName(RLO + 'abc' + ZWSP + 'def');
  assert.equal(out.clean, 'abcdef');
  assert.equal(out.hadInvisible, true);
});

/**
 * The chips on the radar are the whole of what a reader has to go on, and for
 * a while every one of them said the opposite of what it meant: a revoked mint
 * authority rendered as a green "✓ Mintable". These fix the direction.
 */
test('a power the deployer no longer holds reads as revoked, not as the power', () => {
  const clear = securityFindings({
    mintable: false, freezable: false, balanceMutable: false, metadataMutable: false,
    honeypot: false, buyTaxPct: 0, sellTaxPct: 0, transferControlled: false,
  });
  assert.deepEqual(clear, [
    { text: 'Balances fixed', bad: false },
    { text: 'Freeze revoked', bad: false },
    { text: 'Mint revoked', bad: false },
    { text: 'Transfers unrestricted', bad: false },
    { text: 'Metadata frozen', bad: false },
  ]);
  // The point of the change: no finding a reader could take for its opposite.
  for (const f of clear) assert.ok(!/^Can |^Mintable|^Freezable/.test(f.text), f.text);
});

test('a power the deployer still holds says what they can do with it', () => {
  const held = securityFindings({
    mintable: true, freezable: true, balanceMutable: true, metadataMutable: true,
    honeypot: true, buyTaxPct: 5, sellTaxPct: 5, transferControlled: true,
  });
  assert.deepEqual(held.map((f) => f.text), [
    'Can rewrite balances', 'Can freeze holders', 'Can mint more supply',
    'Transfer fee or hook', 'Can be renamed',
  ]);
  assert.ok(held.every((f) => f.bad));
  // The honeypot is not among them: it is not a power still held, and
  // isDisqualifying already says it in its own words above the chips.
  assert.ok(!held.some((f) => /sell|honeypot/i.test(f.text)));
});

test('a flag the upstream did not report is left out, not shown as clear', () => {
  const partial = securityFindings({
    mintable: false, freezable: null, balanceMutable: null, metadataMutable: null,
    honeypot: null, buyTaxPct: null, sellTaxPct: null, transferControlled: null,
  });
  assert.deepEqual(partial, [{ text: 'Mint revoked', bad: false }]);
  assert.deepEqual(securityFindings({
    mintable: null, freezable: null, balanceMutable: null, metadataMutable: null,
    honeypot: null, buyTaxPct: null, sellTaxPct: null, transferControlled: null,
  }), []);
});

test('every flag scoreControl docks a point for has a finding a reader can see', () => {
  // Before this, metadata mutability cost a token a point and appeared nowhere
  // on the page, so the score moved for a reason nobody could read.
  const all = securityFindings({
    mintable: true, freezable: true, balanceMutable: true, metadataMutable: true,
    honeypot: true, buyTaxPct: null, sellTaxPct: null, transferControlled: true,
  });
  assert.equal(all.length, 5, 'one per scored flag except the honeypot');
});
