import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readsAsExpected } from './probe.ts';
import type { CoinMarket } from './coingecko.ts';

const coin = (over: Partial<CoinMarket> = {}): CoinMarket => ({
  id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', image: '', rank: 1,
  price: 76_921, marketCap: 1.5e12, volume24h: 3e10,
  change24hPct: -1.09, change7dPct: -1.9, high24h: 79_530, low24h: 76_682,
  circulating: 2e7, maxSupply: 21e6, ath: 126_080, athChangePct: -38.98,
  athDate: '2026-01-01T00:00:00Z', spark: [1, 2, 3], lastUpdated: null,
  ...over,
});

test('a healthy payload passes and says what it found', () => {
  const r = readsAsExpected([coin()]);
  assert.equal(r.ok, true);
  assert.match(r.detail, /BTC \$76,921/);
});

/**
 * The case this exists for. A renamed field does not fail the request: the call
 * returns 200, the array is the right length, and `num()` turns every value it
 * cannot find into null. The site then renders a dash everywhere, for as long
 * as it takes someone to notice by looking.
 */
test('a renamed price field is caught, and is not treated as a rate limit', () => {
  const r = readsAsExpected([coin({ price: null })]);
  assert.equal(r.ok, false);
  assert.equal(r.critical, true, 'a shape change must fail the job, not warn');
  assert.match(r.detail, /price/);
});

test('several missing fields are all named', () => {
  const r = readsAsExpected([coin({ price: null, marketCap: null })]);
  assert.match(r.detail, /price, marketCap/);
});

test('a list without bitcoin in it is the upstream, not the market', () => {
  const r = readsAsExpected([coin({ id: 'ethereum', symbol: 'ETH', name: 'Ethereum' })]);
  assert.equal(r.critical, true);
  assert.match(r.detail, /without bitcoin/);
});

test('a dropped sparkline is caught, because every chart would be blank', () => {
  const r = readsAsExpected([coin({ spark: [] })]);
  assert.equal(r.critical, true);
  assert.match(r.detail, /sparkline/);
});

test('an empty answer is caught rather than read as zero coins', () => {
  assert.equal(readsAsExpected([]).ok, false);
});
