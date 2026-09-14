import type { Broker } from '../types.ts';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SEED DATA — NOT YET VERIFIED. DO NOT PUBLISH AS FACT.
 *
 *  Every numeric field below is a development placeholder taken from figures
 *  brokers advertise publicly. None of it has been checked against a primary
 *  source, which is why `verifiedAt` is null everywhere.
 *
 *  Before launch each record must be checked against (a) the regulator's own
 *  register for licence numbers and status, and (b) the broker's own published
 *  pages for cost and payment terms — then `verifiedAt` stamped with that date.
 *  The site renders an "unverified" state for any field whose verifiedAt is null.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const BROKERS: Broker[] = [
  {
    slug: 'exness', name: 'Exness', founded: 2008, headquarters: 'CY',
    entities: [
      { legalName: 'Exness (UK) Ltd', country: 'GB', licence: { regulator: 'FCA', number: '730729', status: 'authorised' }, serves: ['GB'] },
      { legalName: 'Exness (CY) Ltd', country: 'CY', licence: { regulator: 'CySEC', number: '178/12', status: 'authorised' }, serves: ['CY', 'DE', 'FR', 'IT', 'ES', 'NL', 'PL'] },
      { legalName: 'Exness SA (Pty) Ltd', country: 'ZA', licence: { regulator: 'FSCA', number: '51024', status: 'authorised' }, serves: ['ZA'] },
      { legalName: 'Exness (SC) Ltd', country: 'SC', licence: { regulator: 'FSA-SC', number: 'SD025', status: 'registered' }, serves: ['*'] },
    ],
    cost: { eurusdSpread: 0.7, commissionPerLot: 0, swapFreeAvailable: true, verifiedAt: null },
    payments: { methods: ['bank', 'card', 'crypto', 'ewallet'], statedWithdrawalHours: 0.5, minDepositUsd: 10, verifiedAt: null },
    platforms: { list: ['mt4', 'mt5', 'web', 'mobile'], execution: 'market', copyTrading: true, maxLeverage: 2000 },
    transparency: { publishesEntityMapping: true, publishesAuditedAccounts: false, segregatedClientFunds: true, publicOwnership: false },
    reviews: { verifiedCount: 0, verifiedAverage: null },
    why: 'Lowest entry of any tier-1 regulated broker and the fastest stated payout',
    logo: { initials: 'E', bg: '#FFD84D', fg: '#0D1421' },
  },
  {
    slug: 'ic-markets', name: 'IC Markets', founded: 2007, headquarters: 'AU',
    entities: [
      { legalName: 'International Capital Markets Pty Ltd', country: 'AU', licence: { regulator: 'ASIC', number: '335692', status: 'authorised' }, serves: ['AU', 'NZ'] },
      { legalName: 'IC Markets (EU) Ltd', country: 'CY', licence: { regulator: 'CySEC', number: '362/18', status: 'authorised' }, serves: ['CY', 'DE', 'FR', 'IT', 'ES', 'NL'] },
      { legalName: 'Raw Trading Ltd', country: 'SC', licence: { regulator: 'FSA-SC', number: 'SD018', status: 'registered' }, serves: ['*'] },
    ],
    cost: { eurusdSpread: 0.1, commissionPerLot: 7, swapFreeAvailable: true, verifiedAt: null },
    payments: { methods: ['bank', 'card', 'crypto', 'ewallet'], statedWithdrawalHours: 24, minDepositUsd: 200, verifiedAt: null },
    platforms: { list: ['mt4', 'mt5', 'ctrader', 'web', 'mobile'], execution: 'ecn', copyTrading: true, maxLeverage: 500 },
    transparency: { publishesEntityMapping: true, publishesAuditedAccounts: false, segregatedClientFunds: true, publicOwnership: false },
    reviews: { verifiedCount: 0, verifiedAverage: null },
    why: 'Tightest raw spread in the directory, if you can fund the $200 minimum',
    logo: { initials: 'IC', bg: '#14304F', fg: '#FFFFFF' },
  },
  {
    slug: 'pepperstone', name: 'Pepperstone', founded: 2010, headquarters: 'AU',
    entities: [
      { legalName: 'Pepperstone Group Limited', country: 'AU', licence: { regulator: 'ASIC', number: '414530', status: 'authorised' }, serves: ['AU', 'NZ'] },
      { legalName: 'Pepperstone Limited', country: 'GB', licence: { regulator: 'FCA', number: '684312', status: 'authorised' }, serves: ['GB'] },
      { legalName: 'Pepperstone EU Limited', country: 'CY', licence: { regulator: 'CySEC', number: '388/20', status: 'authorised' }, serves: ['*'] },
      { legalName: 'Pepperstone Financial Services (DIFC) Ltd', country: 'AE', licence: { regulator: 'DFSA', number: 'F004356', status: 'authorised' }, serves: ['AE'] },
    ],
    cost: { eurusdSpread: 0.15, commissionPerLot: 7, swapFreeAvailable: true, verifiedAt: null },
    payments: { methods: ['bank', 'card', 'ewallet'], statedWithdrawalHours: 24, minDepositUsd: 0, verifiedAt: null },
    platforms: { list: ['mt4', 'mt5', 'ctrader', 'proprietary', 'web', 'mobile'], execution: 'ecn', copyTrading: true, maxLeverage: 500 },
    transparency: { publishesEntityMapping: true, publishesAuditedAccounts: true, segregatedClientFunds: true, publicOwnership: false },
    reviews: { verifiedCount: 0, verifiedAverage: null },
    why: 'Four tier-1 and tier-2 licences with no offshore fallback entity',
    logo: { initials: 'PP', bg: '#3E6FD9', fg: '#FFFFFF' },
  },
  {
    slug: 'xm', name: 'XM', founded: 2009, headquarters: 'CY',
    entities: [
      { legalName: 'Trading Point of Financial Instruments Ltd', country: 'CY', licence: { regulator: 'CySEC', number: '120/10', status: 'authorised' }, serves: ['CY', 'DE', 'FR', 'IT', 'ES', 'NL', 'PL'] },
      { legalName: 'Trading Point of Financial Instruments Pty Ltd', country: 'AU', licence: { regulator: 'ASIC', number: '443670', status: 'authorised' }, serves: ['AU'] },
      { legalName: 'XM Global Limited', country: 'BZ', licence: { regulator: 'IFSC-BZ', number: '000261/397', status: 'registered' }, serves: ['*'] },
    ],
    cost: { eurusdSpread: 0.6, commissionPerLot: 0, swapFreeAvailable: true, verifiedAt: null },
    payments: { methods: ['bank', 'card', 'ewallet'], statedWithdrawalHours: 24, minDepositUsd: 5, verifiedAt: null },
    platforms: { list: ['mt4', 'mt5', 'web', 'mobile'], execution: 'market', copyTrading: true, maxLeverage: 1000 },
    transparency: { publishesEntityMapping: true, publishesAuditedAccounts: false, segregatedClientFunds: true, publicOwnership: false },
    reviews: { verifiedCount: 0, verifiedAverage: null },
    why: 'Widest education programme in the directory; cost is mid-table',
    logo: { initials: 'XM', bg: '#1F8A70', fg: '#FFFFFF' },
  },
  {
    slug: 'eightcap', name: 'Eightcap', founded: 2009, headquarters: 'AU',
    entities: [
      { legalName: 'Eightcap Pty Ltd', country: 'AU', licence: { regulator: 'ASIC', number: '391441', status: 'authorised' }, serves: ['AU'] },
      { legalName: 'Eightcap (UK) Ltd', country: 'GB', licence: { regulator: 'FCA', number: '921296', status: 'authorised' }, serves: ['GB'] },
      { legalName: 'Eightcap Global Ltd', country: 'SC', licence: { regulator: 'FSA-SC', number: 'SD107', status: 'registered' }, serves: ['*'] },
    ],
    cost: { eurusdSpread: 0.2, commissionPerLot: 7, swapFreeAvailable: true, verifiedAt: null },
    payments: { methods: ['bank', 'card', 'crypto', 'ewallet'], statedWithdrawalHours: 24, minDepositUsd: 100, verifiedAt: null },
    platforms: { list: ['mt4', 'mt5', 'ctrader', 'web', 'mobile'], execution: 'ecn', copyTrading: true, maxLeverage: 500 },
    transparency: { publishesEntityMapping: true, publishesAuditedAccounts: false, segregatedClientFunds: true, publicOwnership: false },
    reviews: { verifiedCount: 0, verifiedAverage: null },
    why: 'Raw pricing close to IC Markets at half the minimum deposit',
    logo: { initials: '8C', bg: '#0F5FA6', fg: '#FFFFFF' },
  },
  {
    slug: 'fxtm', name: 'FXTM', founded: 2011, headquarters: 'CY',
    entities: [
      { legalName: 'ForexTime Ltd', country: 'CY', licence: { regulator: 'CySEC', number: '185/12', status: 'authorised' }, serves: ['CY', 'DE', 'FR', 'IT', 'ES'] },
      { legalName: 'FT Global Services Ltd', country: 'ZA', licence: { regulator: 'FSCA', number: '46614', status: 'authorised' }, serves: ['ZA'] },
      { legalName: 'Exinity Limited', country: 'MU', licence: { regulator: 'FSC-MU', number: 'C113012295', status: 'registered' }, serves: ['*'] },
    ],
    cost: { eurusdSpread: 0.9, commissionPerLot: 0, swapFreeAvailable: true, verifiedAt: null },
    payments: { methods: ['bank', 'card', 'ewallet'], statedWithdrawalHours: 24, minDepositUsd: 10, verifiedAt: null },
    platforms: { list: ['mt4', 'mt5', 'web', 'mobile'], execution: 'market', copyTrading: true, maxLeverage: 1000 },
    transparency: { publishesEntityMapping: true, publishesAuditedAccounts: false, segregatedClientFunds: true, publicOwnership: false },
    reviews: { verifiedCount: 0, verifiedAverage: null },
    why: 'Multilingual support across 20 languages; offshore fallback for most clients',
    logo: { initials: 'FX', bg: '#1F6B5A', fg: '#FFFFFF' },
  },
  {
    slug: 'octafx', name: 'OctaFX', founded: 2011, headquarters: 'CY',
    entities: [
      { legalName: 'Octa Markets Cyprus Ltd', country: 'CY', licence: { regulator: 'CySEC', number: '372/18', status: 'authorised' }, serves: ['CY', 'DE', 'FR', 'IT', 'ES'] },
      { legalName: 'Octa Markets Incorporated', country: 'VC', licence: { regulator: 'FSA-SVG', number: '19776 IBC 2011', status: 'registered' }, serves: ['*'] },
    ],
    cost: { eurusdSpread: 0.9, commissionPerLot: 0, swapFreeAvailable: true, verifiedAt: null },
    payments: { methods: ['bank', 'card', 'crypto', 'ewallet'], statedWithdrawalHours: 6, minDepositUsd: 25, verifiedAt: null },
    platforms: { list: ['mt4', 'mt5', 'proprietary', 'web', 'mobile'], execution: 'market', copyTrading: true, maxLeverage: 1000 },
    transparency: { publishesEntityMapping: false, publishesAuditedAccounts: false, segregatedClientFunds: true, publicOwnership: false },
    reviews: { verifiedCount: 0, verifiedAverage: null },
    why: 'No commission on any account type, but most clients land offshore',
    logo: { initials: 'OC', bg: '#C4762C', fg: '#FFFFFF' },
  },
  {
    slug: 'roboforex', name: 'RoboForex', founded: 2009, headquarters: 'BZ',
    entities: [
      { legalName: 'RoboForex Ltd', country: 'BZ', licence: { regulator: 'IFSC-BZ', number: '000138/7', status: 'registered' }, serves: ['*'] },
    ],
    cost: { eurusdSpread: 1.1, commissionPerLot: 0, swapFreeAvailable: true, verifiedAt: null },
    payments: { methods: ['bank', 'card', 'crypto', 'ewallet'], statedWithdrawalHours: 1, minDepositUsd: 10, verifiedAt: null },
    platforms: { list: ['mt4', 'mt5', 'ctrader', 'proprietary', 'web', 'mobile'], execution: 'ecn', copyTrading: true, maxLeverage: 2000 },
    transparency: { publishesEntityMapping: false, publishesAuditedAccounts: false, segregatedClientFunds: true, publicOwnership: false },
    reviews: { verifiedCount: 0, verifiedAverage: null },
    why: 'Six platforms and 1:2000 leverage — on an offshore licence only',
    logo: { initials: 'RB', bg: '#7C5CD6', fg: '#FFFFFF' },
  },
  {
    slug: 'alpari', name: 'Alpari', founded: 1998, headquarters: 'MU',
    entities: [
      { legalName: 'Alpari International Limited', country: 'MU', licence: { regulator: 'FSC-MU', number: 'C113012295', status: 'registered' }, serves: ['*'] },
    ],
    cost: { eurusdSpread: 1.2, commissionPerLot: 0, swapFreeAvailable: true, verifiedAt: null },
    payments: { methods: ['bank', 'card', 'crypto', 'ewallet'], statedWithdrawalHours: 48, minDepositUsd: 20, verifiedAt: null },
    platforms: { list: ['mt4', 'mt5', 'web', 'mobile'], execution: 'market', copyTrading: true, maxLeverage: 1000 },
    transparency: { publishesEntityMapping: false, publishesAuditedAccounts: false, segregatedClientFunds: true, publicOwnership: false },
    reviews: { verifiedCount: 0, verifiedAverage: null },
    why: 'One of the longest-running retail brands; single offshore entity today',
    logo: { initials: 'AL', bg: '#D4404F', fg: '#FFFFFF' },
  },
  {
    slug: 'litefinance', name: 'LiteFinance', founded: 2005, headquarters: 'VC',
    entities: [
      { legalName: 'LiteFinance Global LLC', country: 'VC', licence: { regulator: 'FSA-SVG', number: '931 LLC 2021', status: 'registered' }, serves: ['*'] },
    ],
    cost: { eurusdSpread: 1.3, commissionPerLot: 0, swapFreeAvailable: false, verifiedAt: null },
    payments: { methods: ['card', 'crypto', 'ewallet'], statedWithdrawalHours: 24, minDepositUsd: 50, verifiedAt: null },
    platforms: { list: ['mt4', 'mt5', 'web', 'mobile'], execution: 'market', copyTrading: true, maxLeverage: 1000 },
    transparency: { publishesEntityMapping: false, publishesAuditedAccounts: false, segregatedClientFunds: false, publicOwnership: false },
    reviews: { verifiedCount: 0, verifiedAverage: null },
    why: 'Built-in copy trading; no compensation scheme behind client money',
    logo: { initials: 'LF', bg: '#2FA97C', fg: '#FFFFFF' },
  },
];

export const brokerBySlug = (slug: string) => BROKERS.find((b) => b.slug === slug);
