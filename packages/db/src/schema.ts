import {
  pgTable, text, integer, real, boolean, timestamp, jsonb, serial,
  uniqueIndex, index, pgEnum,
} from 'drizzle-orm/pg-core';

/* ────────────────────────── reference data ────────────────────────── */

export const regulatorTier = pgEnum('regulator_tier', ['A', 'B', 'C']);

export const regulators = pgTable('regulators', {
  code: text('code').primaryKey(),                    // FCA, CySEC …
  name: text('name').notNull(),
  country: text('country').notNull(),                 // ISO-3166 alpha-2
  tier: regulatorTier('tier').notNull(),
  compensation: text('compensation'),                 // null = no scheme
  registryUrl: text('registry_url').notNull(),
});

/* ────────────────────────────── brokers ───────────────────────────── */

export const brokers = pgTable('brokers', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  founded: integer('founded').notNull(),
  headquarters: text('headquarters').notNull(),
  why: text('why').notNull(),

  // Trading cost
  eurusdSpread: real('eurusd_spread').notNull(),
  commissionPerLot: real('commission_per_lot').notNull(),
  swapFreeAvailable: boolean('swap_free_available').notNull(),

  // Payments
  paymentMethods: text('payment_methods').array().notNull(),
  statedWithdrawalHours: real('stated_withdrawal_hours').notNull(),
  minDepositUsd: integer('min_deposit_usd').notNull(),

  // Platforms
  platforms: text('platforms').array().notNull(),
  execution: text('execution').notNull(),
  copyTrading: boolean('copy_trading').notNull(),
  maxLeverage: integer('max_leverage').notNull(),

  // Transparency
  publishesEntityMapping: boolean('publishes_entity_mapping').notNull(),
  publishesAuditedAccounts: boolean('publishes_audited_accounts').notNull(),
  segregatedClientFunds: boolean('segregated_client_funds').notNull(),
  publicOwnership: boolean('public_ownership').notNull(),

  logo: jsonb('logo').$type<{ initials: string; bg: string; fg: string }>().notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const licenceStatus = pgEnum('licence_status', ['authorised', 'registered', 'suspended', 'withdrawn']);

/**
 * A broker is several legal companies. Which one a reader is onboarded to is
 * the single most consequential fact on the site, so it gets its own table
 * rather than living inside a JSON blob nobody can query.
 */
export const brokerEntities = pgTable('broker_entities', {
  id: serial('id').primaryKey(),
  brokerSlug: text('broker_slug').notNull().references(() => brokers.slug, { onDelete: 'cascade' }),
  legalName: text('legal_name').notNull(),
  country: text('country').notNull(),
  regulatorCode: text('regulator_code').notNull().references(() => regulators.code),
  licenceNumber: text('licence_number').notNull(),
  status: licenceStatus('status').notNull(),
  /** ISO country codes onboarded here. '*' marks the fallback entity. */
  serves: text('serves').array().notNull(),
  position: integer('position').notNull().default(0),
}, (t) => [
  index('broker_entities_broker_idx').on(t.brokerSlug),
  uniqueIndex('broker_entities_licence_idx').on(t.regulatorCode, t.licenceNumber),
]);

/* ──────────────────────── prop firms & exchanges ──────────────────── */

export const props = pgTable('props', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  founded: integer('founded').notNull(),
  headquarters: text('headquarters').notNull(),
  markets: text('markets').array().notNull(),
  why: text('why').notNull(),

  steps: text('steps').notNull(),                     // '1' | '2' | 'instant'
  profitTargetPct: real('profit_target_pct').notNull(),
  dailyDrawdownPct: real('daily_drawdown_pct').notNull(),
  maxDrawdownPct: real('max_drawdown_pct').notNull(),
  drawdownType: text('drawdown_type').notNull(),
  consistencyRule: boolean('consistency_rule').notNull(),
  timeLimitDays: integer('time_limit_days'),          // null = no deadline
  newsTrading: boolean('news_trading').notNull(),
  weekendHolding: boolean('weekend_holding').notNull(),
  minTradingDays: integer('min_trading_days').notNull(),

  splitPct: integer('split_pct').notNull(),
  payoutFrequencyDays: integer('payout_frequency_days').notNull(),
  firstPayoutDays: integer('first_payout_days').notNull(),
  verifiedProofs: integer('verified_proofs').notNull().default(0),

  feeUsdPer100k: integer('fee_usd_per_100k').notNull(),
  platforms: text('platforms').array().notNull(),

  publishesRuleChanges: boolean('publishes_rule_changes').notNull(),
  disclosesLegalEntity: boolean('discloses_legal_entity').notNull(),
  disclosesExecutionBroker: boolean('discloses_execution_broker').notNull(),

  logo: jsonb('logo').$type<{ initials: string; bg: string; fg: string }>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const exchanges = pgTable('exchanges', {
  slug: text('slug').primaryKey(),
  name: text('name').notNull(),
  founded: integer('founded').notNull(),
  headquarters: text('headquarters').notNull(),
  kind: text('kind').notNull(),
  why: text('why').notNull(),

  takerFeePct: real('taker_fee_pct').notNull(),
  makerFeePct: real('maker_fee_pct').notNull(),
  spotVolumeUsd: real('spot_volume_usd').notNull(),

  proofOfReserves: boolean('proof_of_reserves').notNull(),
  thirdPartyAudit: boolean('third_party_audit').notNull(),
  publiclyListed: boolean('publicly_listed').notNull(),

  lastBreachYear: integer('last_breach_year'),
  insuranceFund: boolean('insurance_fund').notNull(),
  madeUsersWhole: boolean('made_users_whole'),

  publishesFeeSchedule: boolean('publishes_fee_schedule').notNull(),
  disclosesLegalEntity: boolean('discloses_legal_entity').notNull(),
  publishesIncidentReports: boolean('publishes_incident_reports').notNull(),

  logo: jsonb('logo').$type<{ initials: string; bg: string; fg: string }>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ──────────────────────────── verification ────────────────────────── */

export const entityKind = pgEnum('entity_kind', ['broker', 'prop', 'exchange']);

/**
 * Verification is per FIELD, not per record, because that is how it actually
 * happens: someone checks a licence number against the regulator's register on
 * one day and the withdrawal terms against the broker's own page on another.
 * A single `verified_at` on the row would claim more than anyone checked.
 *
 * `sourceUrl` is required — a verification with no source is an opinion.
 */
export const verifications = pgTable('verifications', {
  id: serial('id').primaryKey(),
  kind: entityKind('kind').notNull(),
  slug: text('slug').notNull(),
  /** Dotted path into the record, e.g. "cost.eurusdSpread". */
  field: text('field').notNull(),
  /** The value as seen at the source, stored so drift is detectable later. */
  valueSeen: text('value_seen').notNull(),
  sourceUrl: text('source_url').notNull(),
  note: text('note'),
  verifiedBy: text('verified_by').notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('verifications_target_idx').on(t.kind, t.slug, t.field),
  index('verifications_age_idx').on(t.verifiedAt),
]);

/* ──────────────────────────── users & audit ───────────────────────── */

export const userRole = pgEnum('user_role', ['admin', 'editor', 'moderator', 'viewer']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: userRole('role').notNull().default('viewer'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('users_email_idx').on(t.email)]);

/** Append-only. Nothing in the admin may delete from this table. */
export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  actor: text('actor').notNull(),
  action: text('action').notNull(),         // 'update' | 'verify' | 'create' | 'delete'
  kind: entityKind('kind').notNull(),
  slug: text('slug').notNull(),
  field: text('field'),
  before: text('before'),
  after: text('after'),
  at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('audit_log_target_idx').on(t.kind, t.slug), index('audit_log_at_idx').on(t.at)]);
