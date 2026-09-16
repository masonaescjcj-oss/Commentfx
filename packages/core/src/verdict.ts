import { servesRetail, type Broker } from './types.ts';
import { REGULATORS } from './regulators.ts';
import { effectiveCostPips } from './score.ts';
import { countryName } from './countries.ts';
import { actionsFor, bearsOnClients } from './data/actions.ts';

/**
 * What is good and what is not, in a list, generated from the record.
 *
 * This is the block every review site puts at the top, and the reason is not
 * that writers like bullet points — it is that somebody arriving from a search
 * wants to know within four seconds whether this broker is worth the next four
 * minutes. A page that makes them read eight hundred words to find out is a
 * page they leave.
 *
 * Every line here is derived, never typed. Two consequences worth the trouble:
 * a correction to the record rewrites the pros and cons the same day, and
 * nobody can quietly add a flattering bullet to a broker that did not earn it.
 * The comparisons are against the rest of the directory rather than against an
 * absolute, because "low cost" means nothing and "cheaper than seven of the ten
 * here" is checkable on the page it appears on.
 */
export interface Verdict {
  pros: string[];
  cons: string[];
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
};

export function brokerVerdict(b: Broker, peers: Broker[]): Verdict {
  const pros: string[] = [];
  const cons: string[] = [];

  const others = peers.filter((p) => p.slug !== b.slug);
  const retail = b.entities.filter(servesRetail);
  const tierA = retail.filter((e) => REGULATORS[e.licence.regulator]?.tier === 'A');
  const fallback = retail.find((e) => e.serves.includes('*'));
  const fallbackTier = fallback ? REGULATORS[fallback.licence.regulator]?.tier : undefined;

  /* ── Regulation ──────────────────────────────────────────────────────── */
  if (tierA.length >= 2) {
    pros.push(
      `${tierA.length} tier-1 licences that actually take retail clients — `
      + `${tierA.map((e) => e.licence.regulator).join(', ')}`,
    );
  } else if (tierA.length === 1) {
    pros.push(`Holds a tier-1 licence that takes retail clients (${tierA[0]!.licence.regulator})`);
  } else {
    cons.push('No tier-1 regulator stands behind any company here that would take you on');
  }

  const scheme = tierA.map((e) => REGULATORS[e.licence.regulator]?.compensation).find(Boolean);
  if (scheme) pros.push(`A statutory compensation scheme in at least one jurisdiction — ${scheme}`);

  if (fallback && fallbackTier !== 'A') {
    // One entity taking the whole world is not a "fallback" — there is nothing
    // to fall back from, and saying "if you are outside the named countries"
    // when none are named is how a template gives itself away.
    const onlyOne = retail.length === 1;
    cons.push(
      onlyOne
        ? `Everyone signs with ${fallback.legalName} in ${countryName(fallback.country)}, wherever they live — `
          + 'no compensation scheme'
        : `Outside the countries the licensed entities name you sign with ${fallback.legalName} in `
          + `${countryName(fallback.country)} — no compensation scheme`,
    );
  }

  const b2b = b.entities.filter((e) => !servesRetail(e));
  if (b2b.length > 0) {
    cons.push(
      `${b2b.map((e) => e.licence.regulator).join(' and ')} appears in the marketing and belongs to a company `
      + 'that does not take retail clients',
    );
  }

  const unlicensed = b.entities.filter((e) => e.licence.status === 'unregulated');
  if (unlicensed.length > 0) {
    cons.push(
      `The group includes ${unlicensed.length === 1 ? 'a company' : 'companies'} with no financial licence `
      + `anywhere (${unlicensed.map((e) => countryName(e.country)).join(', ')})`,
    );
  }

  /* ── Cost ────────────────────────────────────────────────────────────── */
  const cost = effectiveCostPips(b);
  const cheaper = others.filter((p) => effectiveCostPips(p) > cost).length;
  if (cheaper >= others.length * 0.6) {
    pros.push(`Cheaper all-in than ${cheaper} of the other ${others.length} brokers here — ${cost.toFixed(2)} pips a round turn`);
  } else if (cheaper <= others.length * 0.3) {
    cons.push(
      cheaper === 0
        ? `The most expensive here, at ${cost.toFixed(2)} pips all in`
        : `Dearer than ${others.length - cheaper} of the other ${others.length} here, at ${cost.toFixed(2)} pips all in`,
    );
  }
  if (b.cost.swapFreeAvailable) pros.push('A swap-free account is available');

  /* ── Money in and out ────────────────────────────────────────────────── */
  const minMedian = median(peers.map((p) => p.payments.minDepositUsd));
  if (b.payments.minDepositUsd <= 50) {
    pros.push(
      b.payments.minDepositUsd === 0
        ? 'No minimum deposit'
        : `You can open an account with $${b.payments.minDepositUsd}`,
    );
  } else if (b.payments.minDepositUsd > minMedian) {
    cons.push(`A $${b.payments.minDepositUsd} minimum, above the $${minMedian} median here`);
  }

  if (b.payments.statedWithdrawalHours <= 6) {
    pros.push('States withdrawals are processed the same day — their claim, not our measurement');
  } else if (b.payments.statedWithdrawalHours > 24) {
    cons.push(`States withdrawals take up to ${Math.round(b.payments.statedWithdrawalHours)} hours to process`);
  }
  if (b.payments.methods.includes('crypto')) pros.push('Funds and withdraws in crypto as well as by bank and card');

  /* ── Platform ────────────────────────────────────────────────────────── */
  const platforms = b.platforms.list.filter((p) => p !== 'web' && p !== 'mobile');
  if (platforms.length >= 3) pros.push(`Three or more platforms, not just the house one — ${platforms.join(', ').toUpperCase()}`);
  if (b.platforms.execution === 'ecn') pros.push('Prices as an ECN rather than against you on a dealing desk');
  if (b.platforms.copyTrading) pros.push('Copy trading is built in rather than bolted on by a third party');
  if (b.platforms.execution === 'dealing-desk') cons.push('Runs a dealing desk, so it is the counterparty to your trade');
  if (b.platforms.maxLeverage >= 1000) {
    cons.push(`Offers leverage up to 1:${b.platforms.maxLeverage}, which no tier-1 regulator allows a retail client`);
  }

  /* ── What authorities have done ──────────────────────────────────────── */
  // Above transparency deliberately: a regulator acting on who may control the
  // company outranks whether the company publishes a PDF.
  const acted = actionsFor(b.slug).filter(bearsOnClients);
  for (const a of acted.slice(0, 2)) {
    const when = a.date.slice(0, 4);
    cons.push(
      a.stage === 'alleged'
        ? `${a.authority} has an open case against the group (${when}) — alleged, not decided`
        : a.stage === 'under-appeal'
          ? `${a.authority} acted against it in ${when}, and the company is appealing`
          : `${a.authority} acted against it in ${when}`,
    );
  }

  /* ── Transparency ────────────────────────────────────────────────────── */
  const t = b.transparency;
  if (t.publishesEntityMapping) pros.push('Publishes which company serves which country, so the map above can be checked');
  else cons.push('Does not publish which company serves which country');
  if (!t.publishesAuditedAccounts) cons.push('Publishes no audited group accounts');
  if (!t.segregatedClientFunds) cons.push('Does not state that client funds are held separately from its own');

  return { pros, cons };
}
