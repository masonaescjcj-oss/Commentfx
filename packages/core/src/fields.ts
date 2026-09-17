/**
 * What an editor may change, field by field.
 *
 * The admin form is generated from this rather than hand-written three times,
 * which is the only way the form and the data stay the same shape: a field
 * added to a record type and not to a form is a field nobody can ever edit, and
 * a field in a form that no record has is a save that silently does nothing.
 * `fields.test.ts` walks every spec against the curated records and fails on
 * either one.
 *
 * It is deliberately not every field. `logo`, `entities` and the research
 * profiles are edited elsewhere or not at all — a logo is a file, an entity map
 * is a list of objects with its own rules, and a profile is prose with
 * citations that has to survive the citation checks. What is here is the flat,
 * checkable part of a record: the figures a reader compares and a verification
 * confirms.
 */
export type FieldType = 'text' | 'longtext' | 'number' | 'boolean' | 'select' | 'multi' | 'country';

export interface FieldSpec {
  /** Dotted path into the record, and the key a patch is built under. */
  path: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  help?: string;
  step?: number;
  /** Null is a real value for this field, not a blank to be rejected. */
  nullable?: boolean;
  /**
   * The option values are numbers where they look like numbers.
   *
   * A form only ever hands back strings, and `steps: '2'` where the record says
   * `steps: 2` is a record that type-checks nowhere and compares equal to
   * nothing. One field needs this today; saying so explicitly beats guessing
   * from the shape of the string.
   */
  coerceNumeric?: boolean;
}

export interface FieldGroup {
  title: string;
  fields: FieldSpec[];
}

const IDENTITY: FieldSpec[] = [
  { path: 'name', label: 'Name', type: 'text' },
  { path: 'website', label: 'Official site', type: 'text', help: 'https, and the company’s own domain — this is where a checker goes.' },
  { path: 'founded', label: 'Founded', type: 'number', step: 1 },
  { path: 'headquarters', label: 'Headquarters', type: 'country' },
];

const WHY: FieldSpec = {
  path: 'why', label: 'One line on where this rank comes from', type: 'longtext',
  help: 'What a reader sees under the score. Say what the ranking is actually rewarding or punishing.',
};

export const FIELDS: Record<'broker' | 'prop' | 'exchange', FieldGroup[]> = {
  broker: [
    { title: 'Identity', fields: [...IDENTITY, WHY] },
    {
      title: 'Trading cost',
      fields: [
        { path: 'cost.eurusdSpread', label: 'EUR/USD spread (pips)', type: 'number', step: 0.01 },
        { path: 'cost.commissionPerLot', label: 'Commission per lot (USD, round turn)', type: 'number', step: 0.01 },
        { path: 'cost.swapFreeAvailable', label: 'Swap-free account available', type: 'boolean' },
      ],
    },
    {
      title: 'Payments',
      fields: [
        { path: 'payments.minDepositUsd', label: 'Minimum deposit (USD)', type: 'number', step: 1 },
        { path: 'payments.statedWithdrawalHours', label: 'Stated withdrawal time (hours)', type: 'number', step: 0.5,
          help: 'The broker’s own claim, not a measurement. The status page is where measured time lives.' },
        { path: 'payments.methods', label: 'Funding methods', type: 'multi', options: ['bank', 'card', 'crypto', 'ewallet'] },
      ],
    },
    {
      title: 'Platforms',
      fields: [
        { path: 'platforms.list', label: 'Platforms', type: 'multi', options: ['mt4', 'mt5', 'ctrader', 'proprietary', 'web', 'mobile'] },
        { path: 'platforms.execution', label: 'Execution model', type: 'select', options: ['market', 'ecn', 'stp', 'dealing-desk'] },
        { path: 'platforms.maxLeverage', label: 'Maximum leverage (1:N)', type: 'number', step: 1 },
        { path: 'platforms.copyTrading', label: 'Copy trading', type: 'boolean' },
      ],
    },
    {
      title: 'Transparency',
      fields: [
        { path: 'transparency.publishesEntityMapping', label: 'Publishes which entity serves which country', type: 'boolean' },
        { path: 'transparency.publishesAuditedAccounts', label: 'Publishes audited accounts', type: 'boolean' },
        { path: 'transparency.segregatedClientFunds', label: 'States client funds are segregated', type: 'boolean' },
        { path: 'transparency.publicOwnership', label: 'Ownership is public', type: 'boolean' },
      ],
    },
  ],

  prop: [
    { title: 'Identity', fields: [...IDENTITY, WHY] },
    {
      title: 'The rules you have to survive',
      fields: [
        { path: 'rules.steps', label: 'Evaluation steps', type: 'select', options: ['1', '2', 'instant'], coerceNumeric: true },
        { path: 'rules.profitTargetPct', label: 'Phase one profit target (%)', type: 'number', step: 0.5 },
        { path: 'rules.dailyDrawdownPct', label: 'Daily drawdown limit (%)', type: 'number', step: 0.5 },
        { path: 'rules.maxDrawdownPct', label: 'Maximum drawdown (%)', type: 'number', step: 0.5 },
        { path: 'rules.drawdownType', label: 'How drawdown is measured', type: 'select',
          options: ['static', 'eod-trailing', 'intraday-trailing'],
          help: 'The single figure that decides most of the rules score. Static is measured from the starting balance; trailing follows equity up.' },
        { path: 'rules.consistencyRule', label: 'Has a consistency rule', type: 'boolean' },
        { path: 'rules.timeLimitDays', label: 'Time limit (days)', type: 'number', step: 1, nullable: true,
          help: 'Leave empty for no deadline.' },
        { path: 'rules.minTradingDays', label: 'Minimum trading days', type: 'number', step: 1 },
        { path: 'rules.newsTrading', label: 'News trading allowed', type: 'boolean' },
        { path: 'rules.weekendHolding', label: 'Weekend holding allowed', type: 'boolean' },
      ],
    },
    {
      title: 'Payout',
      fields: [
        { path: 'payout.splitPct', label: 'Profit split (%)', type: 'number', step: 1,
          help: 'What a newly funded trader is paid, not the top of the ladder. Put the route to a higher share in the profile.' },
        { path: 'payout.frequencyDays', label: 'Payout cycle (days)', type: 'number', step: 1 },
        { path: 'payout.firstPayoutDays', label: 'Days to first eligible payout', type: 'number', step: 1 },
      ],
    },
    {
      title: 'Cost and platforms',
      fields: [
        { path: 'feeUsdPer100k', label: 'Challenge fee per $100k (USD)', type: 'number', step: 1 },
        { path: 'platforms', label: 'Platforms', type: 'multi',
          options: ['MT4', 'MT5', 'cTrader', 'DXtrade', 'Match-Trader', 'TradeLocker', 'Tradovate',
                    'NinjaTrader', 'Quantower', 'TradingView', 'Proprietary'],
          help: 'Written as the firm writes it. The list is closed on purpose: "MT5" and "Metatrader 5" on two records make one platform look like two.' },
        { path: 'markets', label: 'Markets', type: 'multi', options: ['forex', 'futures', 'crypto', 'indices', 'stocks'] },
      ],
    },
    {
      title: 'Transparency',
      fields: [
        { path: 'transparency.publishesRuleChanges', label: 'Publishes rule changes', type: 'boolean' },
        { path: 'transparency.disclosesLegalEntity', label: 'Names the contracting company', type: 'boolean' },
        { path: 'transparency.disclosesExecutionBroker', label: 'Names the execution broker', type: 'boolean' },
      ],
    },
  ],

  exchange: [
    { title: 'Identity', fields: [...IDENTITY, WHY, { path: 'kind', label: 'Kind', type: 'select', options: ['centralised', 'decentralised'] }] },
    {
      title: 'Fees and liquidity',
      fields: [
        { path: 'takerFeePct', label: 'Taker fee at the lowest tier (%)', type: 'number', step: 0.001 },
        { path: 'makerFeePct', label: 'Maker fee at the lowest tier (%)', type: 'number', step: 0.001,
          help: 'Negative means a rebate.' },
        { path: 'spotVolumeUsd', label: 'Reported 24h spot volume (USD)', type: 'number', step: 1000000,
          help: 'Reported, not measured. It is used only as a liquidity band.' },
      ],
    },
    {
      title: 'Evidence the funds are there',
      fields: [
        { path: 'reserves.proofOfReserves', label: 'Publishes a proof of reserves', type: 'boolean' },
        { path: 'reserves.thirdPartyAudit', label: 'Audited by a named third party', type: 'boolean' },
        { path: 'reserves.publiclyListed', label: 'Publicly listed', type: 'boolean' },
      ],
    },
    {
      title: 'Security record',
      fields: [
        { path: 'security.lastBreachYear', label: 'Year of the last customer-funds breach', type: 'number', step: 1, nullable: true,
          help: 'Leave empty for none on record.' },
        { path: 'security.madeUsersWhole', label: 'Losses were made whole', type: 'boolean', nullable: true,
          help: 'Only meaningful when there is a breach on record.' },
        { path: 'security.insuranceFund', label: 'Maintains a named insurance fund', type: 'boolean' },
      ],
    },
    {
      title: 'Transparency',
      fields: [
        { path: 'transparency.publishesFeeSchedule', label: 'Publishes a full fee schedule', type: 'boolean' },
        { path: 'transparency.disclosesLegalEntity', label: 'Names the contracting company', type: 'boolean' },
        { path: 'transparency.publishesIncidentReports', label: 'Publishes incident reports', type: 'boolean' },
      ],
    },
  ],
};

export const fieldsFor = (kind: 'broker' | 'prop' | 'exchange'): FieldSpec[] =>
  FIELDS[kind].flatMap((g) => g.fields);

/** Read a dotted path out of a record. */
export function readPath(record: unknown, path: string): unknown {
  let cur: unknown = record;
  for (const key of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

/**
 * Write a dotted path into a patch object, creating the one level of nesting
 * these records actually use. It builds the patch shape `mergeRecord` expects —
 * `{ cost: { eurusdSpread: 0.9 } }` — so a change to one figure never carries
 * the rest of its group along with it.
 */
export function writePath(patch: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  const last = parts.pop()!;
  let cur = patch;
  for (const key of parts) {
    const next = cur[key];
    if (next === undefined || next === null || typeof next !== 'object') cur[key] = {};
    cur = cur[key] as Record<string, unknown>;
  }
  cur[last] = value;
}

/**
 * Deep equality that does not care what order the keys were written in.
 *
 * Comparing two structures with `JSON.stringify` is the obvious thing and it is
 * wrong: `{heading, paragraphs}` and `{paragraphs, heading}` are the same block
 * and different strings. The article editor did exactly that and reported every
 * unchanged article as edited — it stored a patch that said "this article now
 * says what it already said", which would then shadow the next correction made
 * in the data file. Nothing looked broken; the site just quietly stopped
 * tracking its own source.
 */
export function sameDeep(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => sameDeep(v, b[i]));
  }
  if (typeof a !== 'object') return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every((k) =>
    Object.hasOwn(b as object, k)
    && sameDeep((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
}

/** Two values, as a human would compare them: `[3]` and `3` are not different. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  return a === b;
}

/** How a value reads in a diff or a field. */
export function showValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  return String(v);
}

/* ── turning a form back into a value ──────────────────────────────────── */

/**
 * What a form control hands back: one string, or several for a multi.
 */
export type RawField = string | string[];

/**
 * One parsed field, or the reason it could not be.
 *
 * This lives here rather than in the server action because it is the half of
 * saving that is worth testing: "an empty box means null on a nullable field
 * and an error on every other one" is a rule, and a rule in a server action is
 * a rule nothing ever runs twice.
 */
export interface ParsedField {
  value?: unknown;
  problem?: string;
}

export function parseField(spec: FieldSpec, raw: RawField): ParsedField {
  if (spec.type === 'multi') {
    const values = (Array.isArray(raw) ? raw : raw ? [raw] : []).map(String);
    const unknown = values.filter((v) => !(spec.options ?? []).includes(v));
    if (unknown.length) return { problem: `${unknown.join(', ')} is not one of the options.` };
    return { value: values };
  }

  const text = (Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '')).trim();
  const blank = text === '';

  if (blank) {
    if (spec.nullable) return { value: null };
    return { problem: 'This one cannot be empty.' };
  }

  if (spec.type === 'number') {
    const n = Number(text);
    if (!Number.isFinite(n)) return { problem: `"${text}" is not a number.` };
    return { value: n };
  }

  if (spec.type === 'boolean') {
    if (text === 'yes') return { value: true };
    if (text === 'no') return { value: false };
    return { problem: 'Answer yes or no.' };
  }

  if (spec.type === 'select') {
    if (!(spec.options ?? []).includes(text)) return { problem: `"${text}" is not one of the options.` };
    return { value: spec.coerceNumeric && /^-?\d+$/.test(text) ? Number(text) : text };
  }

  if (spec.type === 'country') return { value: text.toUpperCase() };

  return { value: text };
}
