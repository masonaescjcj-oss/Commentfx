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

export const licenceStatus = pgEnum('licence_status', ['authorised', 'registered', 'suspended', 'withdrawn', 'unregulated']);

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

/* ─────────────────────── broker status reports ────────────────────── */

export const incidentKind = pgEnum('incident_kind', [
  'withdrawal-delay', 'platform-down', 'slippage', 'login-failure', 'deposit-failure', 'other',
]);

/**
 * A "is it just me?" signal for brokers. Two rules shape this table:
 *
 *   1. No raw IP is ever stored. `reporterHash` is a salted digest of the
 *      reporter's network address and user agent, and the salt rotates daily,
 *      so yesterday's reports cannot be correlated with today's. It exists to
 *      count DISTINCT reporters and to rate-limit, and it can do nothing else.
 *   2. A report is evidence, not a verdict. The displayed status changes only
 *      above a published threshold of distinct reporters inside a window, and
 *      the reader is shown the count and the window either way.
 */
export const statusReports = pgTable('status_reports', {
  id: serial('id').primaryKey(),
  brokerSlug: text('broker_slug').notNull().references(() => brokers.slug, { onDelete: 'cascade' }),
  kind: incidentKind('kind').notNull(),
  /** Salted, daily-rotated digest. Never an address, never reversible to one. */
  reporterHash: text('reporter_hash').notNull(),
  /** Optional, short, and shown to no one until a moderator clears it. */
  note: text('note'),
  moderated: boolean('moderated').notNull().default(false),
  hidden: boolean('hidden').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('status_reports_broker_idx').on(t.brokerSlug, t.createdAt),
  // One reporter, one broker, one kind, one report per rotation of the salt.
  uniqueIndex('status_reports_dedupe_idx').on(t.brokerSlug, t.kind, t.reporterHash),
]);

/* ────────────────────── automated register checks ─────────────────── */

export const findingKind = pgEnum('finding_kind', [
  'confirmed', 'name-mismatch', 'not-found', 'source-unavailable',
]);

/**
 * A machine check against a regulator's public register. Deliberately a
 * separate table from `verifications`, because the two are different claims:
 * a verification is a person who read a page once and recorded what they saw;
 * this is a scraper that re-runs daily and overwrites. The site labels them
 * differently for the same reason.
 */
export const registerChecks = pgTable('register_checks', {
  id: serial('id').primaryKey(),
  brokerSlug: text('broker_slug').notNull().references(() => brokers.slug, { onDelete: 'cascade' }),
  regulatorCode: text('regulator_code').notNull(),
  licenceNumber: text('licence_number').notNull(),
  kind: findingKind('kind').notNull(),
  /** The name the register carries, when the licence was found there. */
  registerName: text('register_name'),
  detail: text('detail').notNull(),
  sourceUrl: text('source_url').notNull(),
  checkedAt: timestamp('checked_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('register_checks_target_idx').on(t.brokerSlug, t.regulatorCode, t.licenceNumber),
]);

/** One row per source per run, so a silently broken scraper is visible. */
export const registerRuns = pgTable('register_runs', {
  id: serial('id').primaryKey(),
  regulatorCode: text('regulator_code').notNull(),
  ok: boolean('ok').notNull(),
  entryCount: integer('entry_count'),
  reason: text('reason'),
  ranAt: timestamp('ran_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('register_runs_code_idx').on(t.regulatorCode, t.ranAt)]);

/* ──────────────────────────── reviews ──────────────────────────────── */

export const reviewTopic = pgEnum('review_topic', [
  'withdrawals', 'execution', 'costs', 'support', 'platform', 'account-opening',
  'payout', 'rules', 'evaluation', 'security', 'listings',
]);

/**
 * A customer's account of dealing with a broker.
 *
 * Reviews are the most attacked surface a ranking site has: the broker wants
 * good ones, its competitors want bad ones, and from the server's side both
 * look exactly like a real customer. Four things follow, and all four are
 * enforced here rather than left to the UI:
 *
 *   1. **Publishing and counting are different acts.** A review appears as soon
 *      as it is written, labelled unverified. It reaches the score only when
 *      `verifiedAt` is set, which happens when a person looked at the evidence.
 *      Buying a hundred reviews buys a hundred unverified paragraphs.
 *   2. **No identity is stored.** `authorHash` is the same salted, daily-rotated
 *      digest the incident reports use. It cannot be reversed to an address and
 *      cannot follow anyone across days.
 *   3. **The author can withdraw what they wrote.** Without accounts the only
 *      honest way is a secret handed over once at submission, stored here as a
 *      digest. Losing it means losing the ability to delete -- which is said
 *      plainly on the form, before anyone types anything.
 *   4. **`evidenceNote` is never published.** It is what the reviewer offers an
 *      editor privately -- a ticket number, a date, a screenshot's contents --
 *      and publishing it would expose exactly the people acting in good faith.
 */
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  /**
   * Which directory the slug belongs to. Polymorphic like `verifications`,
   * and for the same reason: prop firms and exchanges live in their own
   * tables, and one review table beats three identical ones. The cost is no
   * foreign key, so a slug is only as valid as the code that wrote it.
   */
  kind: entityKind('kind').notNull(),
  slug: text('slug').notNull(),
  // Nullable since 0006: a review may be words alone.
  rating: integer('rating'),
  topic: reviewTopic('topic').notNull(),
  body: text('body').notNull(),
  /** Salted, daily-rotated digest of the author. Never an address. */
  authorHash: text('author_hash').notNull(),
  /** sha256 of the one-time secret shown to the author. Never the secret. */
  deleteTokenHash: text('delete_token_hash').notNull(),
  /** Private to editors. What the reviewer offers as proof, if anything. */
  evidenceNote: text('evidence_note'),
  /** Set only by a person, and only this makes a review count. */
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedBy: text('verified_by'),
  /** Withdrawn by its author, or removed by an editor. Kept, never deleted. */
  hidden: boolean('hidden').notNull().default(false),
  hiddenReason: text('hidden_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('reviews_target_idx').on(t.kind, t.slug, t.createdAt),
  // One author, one company, one topic, per rotation of the salt. Someone with
  // a genuine second experience can write it tomorrow; a flood cannot.
  uniqueIndex('reviews_dedupe_idx').on(t.kind, t.slug, t.topic, t.authorHash),
]);
