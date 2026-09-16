/** Regulator tiers drive the single heaviest component of the broker score. */
export type RegulatorTier = 'A' | 'B' | 'C';

/**
 * A brand mark. `img` is a square file the site serves itself; the initials and
 * the two colours are what shows when there is no file, and they stay in the
 * data for every record — a logo that has not been added yet, or one that fails
 * to load, leaves a readable tile rather than a hole.
 */
export interface LogoMark {
  initials: string;
  bg: string;
  fg: string;
  img?: string;
}

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
  /**
   * `unregulated` is the one that is not a licence state at all, and it earns
   * its place: a company can be part of a broker group, take clients, and hold
   * no financial licence anywhere. Eightcap's group includes CLMarkets Limited
   * in St Vincent, trading as Eightcap International, and the St Vincent FSA
   * says in its own words that licensing forex business is not part of what it
   * does. A company number from a registrar of companies is not supervision.
   *
   * Scoring ignores it, the entity map says so in words, and it is on the page
   * rather than left off — a group entity a reader could end up with is part of
   * the map whether or not anyone regulates it.
   */
  status: 'authorised' | 'registered' | 'suspended' | 'withdrawn' | 'unregulated';
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
  /**
   * Who this entity actually takes on. Absent means retail, which is the case
   * for almost every entity here.
   *
   * It exists because of Exness. Exness (UK) Ltd holds FCA 730729, the licence
   * the group leads with, and its own filed accounts describe a B2B and
   * liquidity-provision business — it held $2.47m of client money at the end of
   * 2024, against a group reporting trillions a month. Showing that licence to
   * a retail reader beside "FSCS up to £85,000" would be telling them they have
   * a protection they cannot have. A licence is only yours if the company
   * holding it would open an account for you.
   */
  clients?: 'retail' | 'professional';
}

/** Retail unless the record says otherwise — the common case stays untyped. */
export const servesRetail = (e: BrokerEntity) => (e.clients ?? 'retail') === 'retail';

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
  logo: LogoMark;
}

export type ScoreKey =
  | 'regulation' | 'conduct' | 'cost' | 'payments' | 'platform' | 'reviews' | 'transparency';

export type ScoreComponent = import('./scoring-kit.ts').Component<ScoreKey>;
export type ScoreBreakdown = import('./scoring-kit.ts').Composite<ScoreKey>;
