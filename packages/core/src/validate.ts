import type { Article } from './data/articles.ts';
import { articleLinks, articleWordCount } from './data/articles.ts';
import type { Broker, BrokerEntity } from './types.ts';
import { servesRetail } from './types.ts';
import type { PropFirm } from './props.ts';
import type { Exchange } from './exchanges.ts';
import { REGULATORS } from './regulators.ts';
import { COUNTRIES } from './countries.ts';

/**
 * The rules a record has to satisfy, in one place, so the admin cannot publish
 * something the build would have rejected.
 *
 * Until now these lived only as assertions in the test suite, which was fine
 * while every record was a TypeScript literal compiled into the build: a bad
 * value could not reach production without going red in CI first. An editor
 * saving a record through a form has no CI. Without this module the admin would
 * be a way to put a licence number on the site that no test ever looked at,
 * which is the exact failure this site was built to catch other people making.
 *
 * So the rules moved here and both callers use them. The tests assert that a
 * curated record passes; the admin refuses a save that does not. When they
 * disagree it is a bug in one place rather than a drift between two.
 *
 * What belongs here: anything that makes a record *wrong* rather than merely
 * thin. A broker with no entities is wrong. A broker whose spread is high is
 * not — that is a fact about the broker, and the score already says it. The
 * indexing gate in `indexing.ts` is the other half of this: it decides whether
 * a correct-but-thin record should be indexed, which is a different question
 * from whether it may exist.
 */
export interface Problem {
  /** Dotted path into the record, so a form can put the message on the field. */
  field: string;
  message: string;
}

const ok: Problem[] = [];
const iso2 = /^[A-Z]{2}$/;
const httpsUrl = (s: unknown) => typeof s === 'string' && /^https:\/\/\S+$/.test(s);
const slugLike = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Shared by every kind: the fields that identify a record at all. */
function validateIdentity(r: { slug?: unknown; name?: unknown; website?: unknown; headquarters?: unknown }): Problem[] {
  const out: Problem[] = [];
  if (typeof r.slug !== 'string' || !slugLike.test(r.slug)) {
    out.push({ field: 'slug', message: 'A slug is lowercase words joined by single hyphens.' });
  }
  if (typeof r.name !== 'string' || r.name.trim().length < 2) {
    out.push({ field: 'name', message: 'A name is required.' });
  }
  if (!httpsUrl(r.website)) {
    out.push({ field: 'website', message: 'The company’s own site, as an https URL.' });
  }
  if (typeof r.headquarters !== 'string' || !iso2.test(r.headquarters)) {
    out.push({ field: 'headquarters', message: 'A two-letter country code, e.g. CY.' });
  } else if (!Object.hasOwn(COUNTRIES, r.headquarters)) {
    out.push({
      field: 'headquarters',
      message: `${r.headquarters} has no name or flag on this site yet. Add it to countries.ts and Flag.tsx first, or the page renders a blank box.`,
    });
  }
  return out;
}

/**
 * The entity map is the most consequential thing on a broker page and the
 * easiest to get wrong, so it carries the most rules. Every one of these
 * corresponds to a mistake the September 2026 research actually found on a
 * record that had shipped.
 */
function validateEntity(e: BrokerEntity, i: number): Problem[] {
  const out: Problem[] = [];
  const at = (f: string) => `entities.${i}.${f}`;

  if (typeof e.legalName !== 'string' || e.legalName.trim().length < 3) {
    out.push({ field: at('legalName'), message: 'The company’s registered name, in full.' });
  }
  if (!iso2.test(e.country ?? '')) {
    out.push({ field: at('country'), message: 'A two-letter country code.' });
  } else if (!Object.hasOwn(COUNTRIES, e.country)) {
    out.push({ field: at('country'), message: `${e.country} has no name or flag on this site yet.` });
  }
  if (!e.licence?.regulator) {
    out.push({ field: at('licence.regulator'), message: 'Name the body on the licence, even if it is not a regulator.' });
  }
  // A licence number is what makes a claim checkable. The one exception is a
  // company that holds no financial licence at all, which the record says with
  // status 'unregulated' — Eightcap's St Vincent company is the live example.
  if (e.licence?.status !== 'unregulated' && !String(e.licence?.number ?? '').trim()) {
    out.push({
      field: at('licence.number'),
      message: 'A licence number, or mark the status unregulated. A licence nobody can look up is not evidence.',
    });
  }
  // Found on Exness: an FCA licence held by a B2B company sat against ['GB']
  // next to "FSCS up to £85,000", promising a protection that reader cannot have.
  if (e.clients === 'professional' && (e.serves?.length ?? 0) > 0) {
    out.push({
      field: at('serves'),
      message: 'A professional-only company serves nobody on this site. Clear the countries or change who it takes.',
    });
  }
  for (const c of e.serves ?? []) {
    if (c === '*') continue;
    if (!iso2.test(c)) out.push({ field: at('serves'), message: `"${c}" is not a country code.` });
    else if (!Object.hasOwn(COUNTRIES, c)) out.push({ field: at('serves'), message: `${c} has no name on this site yet.` });
  }
  return out;
}

const BROKER_GROUPS = ['cost', 'payments', 'platforms', 'transparency', 'reviews', 'why'] as const;
const PROP_GROUPS = ['rules', 'payout', 'feeUsdPer100k', 'platforms', 'markets', 'transparency', 'why'] as const;
const EXCHANGE_GROUPS = ['takerFeePct', 'spotVolumeUsd', 'reserves', 'security', 'transparency', 'why'] as const;

/**
 * Every group a scorer reads has to be there.
 *
 * This is the rule that makes a validator refuse a record of the wrong shape
 * rather than merely a record with a bad value in it. A prop firm with no
 * `rules` is not a thin prop firm, it is a record that will throw the first
 * time the ranking tries to read its drawdown — and a form that saves one has
 * put a page on the site that cannot render. The lists below are exactly what
 * the scoring functions dereference, so a field arrives here when a component
 * starts reading it and not before.
 */
function requireGroups(r: Record<string, unknown>, fields: readonly string[], noun: string): Problem[] {
  const out: Problem[] = [];
  for (const f of fields) {
    const v = r[f];
    const missing = v === undefined || v === null
      || (Array.isArray(v) && v.length === 0)
      || (typeof v === 'string' && !v.trim());
    if (missing) {
      out.push({ field: f, message: `Every ${noun} needs ${f}; the ranking reads it and an empty one has no page.` });
    }
  }
  return out;
}

export function validateBroker(b: Partial<Broker>): Problem[] {
  const out = [...validateIdentity(b)];
  out.push(...requireGroups(b as Record<string, unknown>, BROKER_GROUPS, 'broker'));

  const entities = b.entities ?? [];
  if (entities.length === 0) {
    out.push({ field: 'entities', message: 'At least one company. A broker with no entity is a logo.' });
  }
  entities.forEach((e, i) => out.push(...validateEntity(e, i)));

  // Exactly one fallback, or a reader outside the named countries lands nowhere
  // — and two would make "which entity am I under" unanswerable.
  const fallbacks = entities.filter((e) => e.serves?.includes('*'));
  if (entities.length > 0 && fallbacks.length === 0) {
    out.push({ field: 'entities', message: 'No entity takes everyone else. Mark one with * so the map answers for a reader anywhere.' });
  }
  if (fallbacks.length > 1) {
    out.push({ field: 'entities', message: `${fallbacks.length} entities claim to be the fallback. Only one can be.` });
  }

  // Two entities cannot hold the same licence, and a duplicated number is
  // almost always a copy-paste rather than a fact.
  const seen = new Map<string, number>();
  entities.forEach((e, i) => {
    const key = `${e.licence?.regulator}|${e.licence?.number}`;
    if (!e.licence?.number) return;
    if (seen.has(key)) {
      out.push({ field: `entities.${i}.licence.number`, message: `The same licence is already on entity ${seen.get(key)! + 1}.` });
    } else seen.set(key, i);
  });

  // A regulator we do not know is allowed — Alpari cites MISA, which is not a
  // financial regulator and must not be added to the table — but it is worth
  // saying out loud, because the usual cause is a typo in a real code.
  for (const [i, e] of entities.entries()) {
    const code = e.licence?.regulator;
    if (code && !Object.hasOwn(REGULATORS, code) && e.licence?.status !== 'unregulated') {
      out.push({
        field: `entities.${i}.licence.regulator`,
        message: `${code} is not in the regulator table. If that is deliberate, set the status to unregulated so the page says so.`,
      });
    }
  }

  if (b.cost && (b.cost.eurusdSpread ?? -1) < 0) {
    out.push({ field: 'cost.eurusdSpread', message: 'A spread cannot be negative.' });
  }
  if (b.payments && (b.payments.minDepositUsd ?? 0) < 0) {
    out.push({ field: 'payments.minDepositUsd', message: 'A minimum deposit cannot be negative.' });
  }
  if (b.founded !== undefined && (b.founded < 1970 || b.founded > new Date().getFullYear())) {
    out.push({ field: 'founded', message: 'A founding year between 1970 and now.' });
  }
  return out.length ? out : ok;
}

export function validateProp(f: Partial<PropFirm>): Problem[] {
  const out = [...validateIdentity(f)];
  out.push(...requireGroups(f as Record<string, unknown>, PROP_GROUPS, 'prop firm'));

  for (const [i, e] of (f.entities ?? []).entries()) {
    if (!e.legalName?.trim()) out.push({ field: `entities.${i}.legalName`, message: 'The company’s registered name.' });
    if (!iso2.test(e.country ?? '')) out.push({ field: `entities.${i}.country`, message: 'A two-letter country code.' });
    else if (!Object.hasOwn(COUNTRIES, e.country)) {
      out.push({ field: `entities.${i}.country`, message: `${e.country} has no name or flag on this site yet.` });
    }
  }
  const contracting = (f.entities ?? []).filter((e) => e.role === 'contracting');
  if (contracting.length > 1) {
    out.push({ field: 'entities', message: `${contracting.length} companies claim to hold the contract. Only one can.` });
  }

  const r = f.rules;
  if (r) {
    if (r.profitTargetPct !== undefined && (r.profitTargetPct <= 0 || r.profitTargetPct > 50)) {
      out.push({ field: 'rules.profitTargetPct', message: 'A profit target between 0 and 50 per cent.' });
    }
    if (r.maxDrawdownPct !== undefined && r.dailyDrawdownPct !== undefined
        && r.dailyDrawdownPct > r.maxDrawdownPct) {
      out.push({
        field: 'rules.dailyDrawdownPct',
        message: 'The daily limit is larger than the overall one, which would make it unreachable.',
      });
    }
  }
  // The finding that made this research worth doing: four of eight firms had a
  // split on record that was the top of a range rather than what a newly funded
  // trader is paid. 100 is possible and it is almost never the starting figure.
  if (f.payout?.splitPct !== undefined) {
    const s = f.payout.splitPct;
    if (s <= 0 || s > 100) out.push({ field: 'payout.splitPct', message: 'A split between 1 and 100 per cent.' });
    else if (s === 100) {
      out.push({
        field: 'payout.splitPct',
        message: 'A 100% split is the top of a ladder at every firm ranked here. Record what a newly funded trader is paid, and put the route to 100 in the profile.',
      });
    }
  }
  if (f.feeUsdPer100k !== undefined && f.feeUsdPer100k <= 0) {
    out.push({ field: 'feeUsdPer100k', message: 'A challenge fee, normalised to a $100k account.' });
  }
  return out.length ? out : ok;
}

export function validateExchange(e: Partial<Exchange>): Problem[] {
  const out = [...validateIdentity(e)];
  out.push(...requireGroups(e as Record<string, unknown>, EXCHANGE_GROUPS, 'exchange'));

  if (e.takerFeePct !== undefined && (e.takerFeePct < 0 || e.takerFeePct > 5)) {
    out.push({ field: 'takerFeePct', message: 'A taker fee between 0 and 5 per cent.' });
  }
  if (e.makerFeePct !== undefined && (e.makerFeePct < -1 || e.makerFeePct > 5)) {
    out.push({ field: 'makerFeePct', message: 'A maker fee between -1 and 5 per cent. Negative means a rebate.' });
  }
  if (e.spotVolumeUsd !== undefined && e.spotVolumeUsd < 0) {
    out.push({ field: 'spotVolumeUsd', message: 'Volume cannot be negative.' });
  }
  const year = new Date().getFullYear();
  const b = e.security?.lastBreachYear;
  if (b !== undefined && b !== null && (b < 2009 || b > year)) {
    out.push({ field: 'security.lastBreachYear', message: `A year between 2009 and ${year}, or empty for none on record.` });
  }
  // "Made whole" only means something if something was lost.
  if ((b === null || b === undefined) && e.security?.madeUsersWhole !== null && e.security?.madeUsersWhole !== undefined) {
    out.push({
      field: 'security.madeUsersWhole',
      message: 'There is no breach on record, so whether users were made whole has nothing to describe. Leave it empty.',
    });
  }
  return out.length ? out : ok;
}

/** Whichever validator fits the kind. */
export function validateRecord(kind: 'broker' | 'prop' | 'exchange', record: unknown): Problem[] {
  if (kind === 'broker') return validateBroker(record as Partial<Broker>);
  if (kind === 'prop') return validateProp(record as Partial<PropFirm>);
  return validateExchange(record as Partial<Exchange>);
}

/**
 * Merge an editor's patch over a code record.
 *
 * Shallow per top-level key, with one level of object merge underneath, because
 * that is the shape of these records: `cost` and `payments` are flat groups of
 * scalars, and `entities` is a list that must be replaced whole rather than
 * merged item by item. Merging a shorter entity list into a longer one would
 * silently keep entities the editor deleted, which is the one merge mistake
 * that would put a removed licence back on the page.
 */
export function mergeRecord<T extends object>(base: T, patch: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const current = out[key];
    const mergeable =
      value !== null
      && typeof value === 'object'
      && !Array.isArray(value)
      && current !== null
      && typeof current === 'object'
      && !Array.isArray(current);
    out[key] = mergeable
      ? { ...(current as object), ...(value as object) }
      : value;
  }
  return out as T;
}

export { servesRetail };

/* ── articles ──────────────────────────────────────────────────────────── */

/**
 * docs/SEO.md §5.3 is a list of rules for what an article must be, and
 * `articles.test.ts` has held the published ones to it since there were two of
 * them. An editor writing through a form has no test run, so the same rules are
 * here, with the reasons in the messages: a writer who is told "at least three
 * internal links" and not why will add three links to the same page.
 *
 * These are the rules, not a house style. An article that cannot meet them is
 * one this site has no business publishing — the category is "your money or
 * your life", where the ranking factor that matters most is trust, and a thin
 * page under a money query costs more than no page at all.
 */
const FILLER = /\b(click here|read more|learn more|find out more|see here|this page|this link)\b/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const sentencesIn = (s: string) => s.split(/(?<=[.!?])\s+/).filter(Boolean);

export function validateArticle(a: Partial<Article>, knownSlugs: readonly string[] = []): Problem[] {
  const out: Problem[] = [];

  if (typeof a.slug !== 'string' || !slugLike.test(a.slug)) {
    out.push({ field: 'slug', message: 'A slug is lowercase words joined by single hyphens.' });
  }
  // Google truncates a title around 60 characters and a description around 160.
  // Over is not an error; it is a sentence the reader never sees.
  if (!a.title?.trim()) out.push({ field: 'title', message: 'A title is required.' });
  else if (a.title.length > 72) {
    out.push({ field: 'title', message: `${a.title.length} characters — a result page shows about 60.` });
  }
  if (!a.heading?.trim()) out.push({ field: 'heading', message: 'The h1, which may differ from the title.' });
  if (!a.description?.trim()) out.push({ field: 'description', message: 'A description is required.' });
  else if (a.description.length < 110 || a.description.length > 175) {
    out.push({
      field: 'description',
      message: `${a.description.length} characters. Between 110 and 175 — shorter wastes the space, longer is cut off.`,
    });
  }

  if (!a.question?.trim().endsWith('?')) {
    out.push({ field: 'question', message: 'One question, in the reader’s own words, ending in a question mark.' });
  }
  if (!a.answer?.trim()) {
    out.push({ field: 'answer', message: 'Answer it before anything else on the page.' });
  } else {
    if (sentencesIn(a.answer).length > 2) {
      out.push({ field: 'answer', message: `${sentencesIn(a.answer).length} sentences. The answer comes in the first two.` });
    }
    if (a.answer.length <= 80) out.push({ field: 'answer', message: 'Too short to be an answer.' });
  }

  if (!a.author?.trim()) {
    out.push({ field: 'author', message: 'A named author. An unsigned article in this category is worth nothing.' });
  }
  for (const key of ['published', 'updated'] as const) {
    const v = a[key];
    if (!v || !ISO_DATE.test(v) || !Number.isFinite(Date.parse(`${v}T00:00:00Z`))) {
      out.push({ field: key, message: 'A date, as YYYY-MM-DD.' });
    }
  }
  if (a.published && a.updated && ISO_DATE.test(a.published) && ISO_DATE.test(a.updated)
      && Date.parse(`${a.updated}T00:00:00Z`) < Date.parse(`${a.published}T00:00:00Z`)) {
    out.push({ field: 'updated', message: 'Last checked before it was published.' });
  }

  const blocks = a.blocks ?? [];
  if (blocks.length === 0) {
    out.push({ field: 'blocks', message: 'The article itself is empty.' });
  }

  const full = { ...(a as Article), blocks, answer: a.answer ?? '' };

  const words = articleWordCount(full);
  if (words < 500) {
    out.push({
      field: 'blocks',
      message: `${words} words. Below 500 it is a paragraph competing with the record pages for the same queries.`,
    });
  }

  const links = articleLinks(full);
  if (links.length < 3) {
    out.push({ field: 'blocks', message: `${links.length} internal links. Three, to three different pages.` });
  } else if (new Set(links.map((l) => l.path)).size < 3) {
    out.push({ field: 'blocks', message: 'Three links, but fewer than three destinations.' });
  }
  for (const { label, path } of links) {
    if (!path.startsWith('/') || path.includes('//')) {
      out.push({ field: 'blocks', message: `"${path}" is not an internal path.` });
    }
    if (label.split(/\s+/).filter(Boolean).length < 2 || FILLER.test(label)) {
      out.push({ field: 'blocks', message: `The anchor "${label}" says nothing about where it goes.` });
    }
    if (path.startsWith('/learn/')) {
      const slug = path.slice('/learn/'.length);
      if (slug === a.slug) out.push({ field: 'blocks', message: 'The article links to itself.' });
      else if (knownSlugs.length > 0 && !knownSlugs.includes(slug)) {
        out.push({ field: 'blocks', message: `/learn/${slug} is not an article.` });
      }
    }
  }

  const examples = blocks.flatMap((b) => (b.example ? [b.example] : []));
  if (examples.length === 0) {
    out.push({ field: 'blocks', message: 'No worked example. One, with real numbers in it.' });
  }
  for (const e of examples) {
    if (e.rows.length < 3) out.push({ field: 'blocks', message: `"${e.title}" has ${e.rows.length} rows; three is the minimum.` });
    if (e.rows.some(([k, v]) => !k.trim() || !v.trim())) {
      out.push({ field: 'blocks', message: `"${e.title}" has an empty cell.` });
    }
  }

  const faq = a.faq ?? [];
  if (faq.length < 3) out.push({ field: 'faq', message: `${faq.length} questions. Three is the minimum.` });
  for (const { q, a: answer } of faq) {
    if (!q.trim().endsWith('?')) out.push({ field: 'faq', message: `"${q}" is not a question.` });
    if (answer.trim().length <= 60) out.push({ field: 'faq', message: `The answer to "${q}" is a shrug.` });
    if (a.question && q.toLowerCase() === a.question.toLowerCase()) {
      out.push({ field: 'faq', message: 'The FAQ repeats the headline question.' });
    }
  }

  // The same half-written-markup guard the published articles are held to. An
  // unclosed bracket renders as its own source code on a page about trust.
  const lines = [
    a.title ?? '', a.heading ?? '', a.description ?? '', a.question ?? '', a.answer ?? '',
    ...blocks.flatMap((b) => [
      ...(b.heading ? [b.heading] : []),
      ...b.paragraphs,
      ...(b.list?.items ?? []),
      ...(b.example ? [b.example.title, ...b.example.rows.flat(), b.example.note ?? ''] : []),
    ]),
    ...faq.flatMap((f) => [f.q, f.a]),
  ];
  for (const line of lines) {
    if (/undefined|NaN|\[object/.test(line)) {
      out.push({ field: 'blocks', message: `Something went wrong in "${line.slice(0, 50)}".` });
    }
    if ((line.match(/\[/g) ?? []).length !== (line.match(/\]/g) ?? []).length
        || (line.match(/\*\*/g) ?? []).length % 2 !== 0) {
      out.push({ field: 'blocks', message: `Unclosed markup in "${line.slice(0, 50)}".` });
    }
  }

  return out.length ? out : ok;
}
