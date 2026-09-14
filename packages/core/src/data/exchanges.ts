import type { Exchange } from '../exchanges.ts';

/**
 * SEED DATA — NOT YET VERIFIED. Volumes are self-reported by exchanges and are
 * used here only as a liquidity band, never as a precise figure. Breach history
 * and reserve attestations must be checked against primary sources before
 * publication.
 */
export const EXCHANGES: Exchange[] = [
  {
    slug: 'coinbase', name: 'Coinbase', founded: 2012, headquarters: 'US', kind: 'centralised',
    website: 'https://www.coinbase.com/',
    takerFeePct: 0.6, makerFeePct: 0.4, spotVolumeUsd: 3.1e9,
    reserves: { proofOfReserves: false, thirdPartyAudit: true, publiclyListed: true },
    security: { lastBreachYear: null, insuranceFund: true, madeUsersWhole: null },
    transparency: { publishesFeeSchedule: true, disclosesLegalEntity: true, publishesIncidentReports: true },
    why: 'A listed company filing audited accounts — the strongest solvency evidence here',
    logo: { initials: 'CB', bg: '#1652F0', fg: '#FFFFFF' },
  },
  {
    slug: 'kraken', name: 'Kraken', founded: 2011, headquarters: 'US', kind: 'centralised',
    website: 'https://www.kraken.com/',
    takerFeePct: 0.26, makerFeePct: 0.16, spotVolumeUsd: 1.4e9,
    reserves: { proofOfReserves: true, thirdPartyAudit: true, publiclyListed: false },
    security: { lastBreachYear: null, insuranceFund: false, madeUsersWhole: null },
    transparency: { publishesFeeSchedule: true, disclosesLegalEntity: true, publishesIncidentReports: true },
    why: 'Fourteen years with no customer-funds breach on record, plus a verifiable reserve proof',
    logo: { initials: 'KR', bg: '#5741D9', fg: '#FFFFFF' },
  },
  {
    slug: 'binance', name: 'Binance', founded: 2017, headquarters: 'AE', kind: 'centralised',
    website: 'https://www.binance.com/',
    takerFeePct: 0.1, makerFeePct: 0.1, spotVolumeUsd: 4.1e10,
    reserves: { proofOfReserves: true, thirdPartyAudit: false, publiclyListed: false },
    security: { lastBreachYear: 2019, insuranceFund: true, madeUsersWhole: true },
    transparency: { publishesFeeSchedule: true, disclosesLegalEntity: true, publishesIncidentReports: true },
    why: 'The deepest order books in almost every pair, on a reserve proof without an audit',
    logo: { initials: 'BN', bg: '#F0B90B', fg: '#0D1421' },
  },
  {
    slug: 'okx', name: 'OKX', founded: 2017, headquarters: 'SC', kind: 'centralised',
    website: 'https://www.okx.com/',
    takerFeePct: 0.08, makerFeePct: 0.08, spotVolumeUsd: 9.4e9,
    reserves: { proofOfReserves: true, thirdPartyAudit: false, publiclyListed: false },
    security: { lastBreachYear: null, insuranceFund: true, madeUsersWhole: null },
    transparency: { publishesFeeSchedule: true, disclosesLegalEntity: true, publishesIncidentReports: false },
    why: 'Lowest headline taker fee of the majors, with a monthly reserve attestation',
    logo: { initials: 'OK', bg: '#1A1A1A', fg: '#FFFFFF' },
  },
  {
    slug: 'bybit', name: 'Bybit', founded: 2018, headquarters: 'AE', kind: 'centralised',
    website: 'https://www.bybit.com/',
    takerFeePct: 0.1, makerFeePct: 0.1, spotVolumeUsd: 1.28e10,
    reserves: { proofOfReserves: true, thirdPartyAudit: false, publiclyListed: false },
    security: { lastBreachYear: 2025, insuranceFund: true, madeUsersWhole: true },
    transparency: { publishesFeeSchedule: true, disclosesLegalEntity: true, publishesIncidentReports: true },
    why: 'Covered every loss from its 2025 incident without halting withdrawals',
    logo: { initials: 'BY', bg: '#F7A600', fg: '#0D1421' },
  },
  {
    slug: 'bitget', name: 'Bitget', founded: 2018, headquarters: 'SC', kind: 'centralised',
    website: 'https://www.bitget.com/',
    takerFeePct: 0.1, makerFeePct: 0.1, spotVolumeUsd: 5.2e9,
    reserves: { proofOfReserves: true, thirdPartyAudit: false, publiclyListed: false },
    security: { lastBreachYear: null, insuranceFund: true, madeUsersWhole: null },
    transparency: { publishesFeeSchedule: true, disclosesLegalEntity: false, publishesIncidentReports: false },
    why: 'A large protection fund, offset by the thinnest corporate disclosure of the majors',
    logo: { initials: 'BG', bg: '#00C9A7', fg: '#0D1421' },
  },
  {
    slug: 'kucoin', name: 'KuCoin', founded: 2017, headquarters: 'SC', kind: 'centralised',
    website: 'https://www.kucoin.com/',
    takerFeePct: 0.1, makerFeePct: 0.1, spotVolumeUsd: 1.9e9,
    reserves: { proofOfReserves: true, thirdPartyAudit: false, publiclyListed: false },
    security: { lastBreachYear: 2020, insuranceFund: true, madeUsersWhole: true },
    transparency: { publishesFeeSchedule: true, disclosesLegalEntity: false, publishesIncidentReports: true },
    why: 'Recovered fully from its 2020 breach; widest altcoin listing of the mid-tier',
    logo: { initials: 'KC', bg: '#23AF91', fg: '#FFFFFF' },
  },
  {
    slug: 'mexc', name: 'MEXC', founded: 2018, headquarters: 'SC', kind: 'centralised',
    website: 'https://www.mexc.com/',
    takerFeePct: 0.02, makerFeePct: 0, spotVolumeUsd: 4.6e9,
    reserves: { proofOfReserves: true, thirdPartyAudit: false, publiclyListed: false },
    security: { lastBreachYear: null, insuranceFund: false, madeUsersWhole: null },
    transparency: { publishesFeeSchedule: true, disclosesLegalEntity: false, publishesIncidentReports: false },
    why: 'The cheapest fees on the list and the fastest new listings — with the least disclosure',
    logo: { initials: 'MX', bg: '#00B897', fg: '#FFFFFF' },
  },
];

export const exchangeBySlug = (slug: string) => EXCHANGES.find((e) => e.slug === slug);
