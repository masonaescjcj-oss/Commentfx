/** Regulator tiers drive the single heaviest component of the broker score. */
export type RegulatorTier = 'A' | 'B' | 'C';

export interface Regulator {
  code: string;            // FCA, CySEC, ASIC …
  name: string;
  country: string;         // ISO-3166 alpha-2
  tier: RegulatorTier;
  /** Statutory compensation available to a retail client, if any. */
  compensation: string | null;
  registryUrl: string;     // where a licence number can be checked
}

export interface Licence {
  regulator: string;       // Regulator.code
  number: string;
  status: 'authorised' | 'registered' | 'suspended' | 'withdrawn';
}

/**
 * A broker is usually several legal companies. Which one you are onboarded to
 * decides what protection you actually have — this is the entity map.
 */
export interface BrokerEntity {
  legalName: string;
  country: string;         // country of incorporation, ISO-3166 alpha-2
  licence: Licence;
  /** ISO country codes onboarded to this entity. '*' is the fallback entity. */
  serves: string[];
}

export interface TradingCost {
  /** Typical EUR/USD spread in pips, as published by the broker. */
  eurusdSpread: number;
  /** Round-turn commission per standard lot, in USD. */
  commissionPerLot: number;
  swapFreeAvailable: boolean;
  /** When a human last checked these against the broker's own pages. */
  verifiedAt: string | null;
}

export interface Payments {
  methods: Array<'bank' | 'card' | 'crypto' | 'ewallet'>;
  /** Broker's own stated withdrawal processing time, in hours. */
  statedWithdrawalHours: number;
  minDepositUsd: number;
  verifiedAt: string | null;
}

export interface Platforms {
  list: Array<'mt4' | 'mt5' | 'ctrader' | 'proprietary' | 'web' | 'mobile'>;
  execution: 'market' | 'ecn' | 'stp' | 'dealing-desk';
  copyTrading: boolean;
  maxLeverage: number;     // e.g. 500 means 1:500
}

export interface Transparency {
  publishesEntityMapping: boolean;
  publishesAuditedAccounts: boolean;
  segregatedClientFunds: boolean;
  publicOwnership: boolean;
}

export interface ReviewSummary {
  verifiedCount: number;
  /** Mean of verified reviews, 1–5. */
  verifiedAverage: number | null;
}

export interface Broker {
  slug: string;
  name: string;
  founded: number;
  headquarters: string;    // ISO-3166 alpha-2
  /**
   * The company's own site — where an editor goes to check the published
   * figures on this record. Checked for reachability by `check-sites`, never
   * scraped: these numbers are read by a person.
   */
  website: string;
  entities: BrokerEntity[];
  cost: TradingCost;
  payments: Payments;
  platforms: Platforms;
  transparency: Transparency;
  reviews: ReviewSummary;
  /** One line saying where this broker's rank comes from. */
  why: string;
  logo: { initials: string; bg: string; fg: string };
}

export type ScoreKey =
  | 'regulation' | 'cost' | 'payments' | 'platform' | 'reviews' | 'transparency';

export type ScoreComponent = import('./scoring-kit.ts').Component<ScoreKey>;
export type ScoreBreakdown = import('./scoring-kit.ts').Composite<ScoreKey>;
