import { servesRetail, type Broker } from './types.ts';
import { REGULATORS } from './regulators.ts';
import { countryName } from './countries.ts';
import { effectiveCostPips } from './score.ts';

/**
 * The long review, written from the record rather than about it.
 *
 * Every directory this one competes with has a thousand words under each
 * broker, and a reader arriving from a search engine expects them. The honest
 * way to have them is not to write them: a paragraph typed by hand is a claim
 * that stops being true the first time a field changes, and nobody goes back
 * to the prose when they correct a number. So this is generated. Every sentence
 * below is a reading of a field on the record, and a field that changes changes
 * the sentence the same day.
 *
 * That is also why it says less than a hand-written page would. There is no
 * paragraph here about how the support team feels, because the record does not
 * know; where the data is missing the text says the data is missing, in the
 * section built for exactly that. A review that admits what it has not checked
 * is worth more to a reader than one that does not, and it is the only kind
 * this site is allowed to publish.
 */
export interface ReviewSection {
  id: string;
  heading: string;
  paragraphs: string[];
}

const and = (xs: string[]): string =>
  xs.length <= 1 ? (xs[0] ?? '')
  : xs.length === 2 ? `${xs[0]} and ${xs[1]}`
  : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;

const ordinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
};

const median = (xs: number[]): number => {
  const a = [...xs].sort((p, q) => p - q);
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m]! : (a[m - 1]! + a[m]!) / 2;
};

const PLATFORM: Record<string, string> = {
  mt4: 'MetaTrader 4', mt5: 'MetaTrader 5', ctrader: 'cTrader',
  proprietary: 'its own platform', web: 'a web terminal', mobile: 'a mobile app',
};
const EXECUTION: Record<string, string> = {
  market: 'market execution',
  ecn: 'ECN execution, which routes orders to a pool of liquidity providers rather than filling them in-house',
  stp: 'straight-through processing, which passes orders to a liquidity provider rather than filling them in-house',
  'dealing-desk': 'a dealing desk, which means the broker is the counterparty to your trade',
};
const METHOD: Record<string, string> = {
  bank: 'bank transfer', card: 'debit and credit card', crypto: 'crypto', ewallet: 'e-wallets',
};

export function brokerReview({ broker: b, rank, of, peers, components }: {
  broker: Broker;
  rank: number;
  of: number;
  /** The cohort this one is ranked against, for the comparisons below. */
  peers: Broker[];
  /** The scored components, so the verdict names the real best and worst. */
  components: Array<{ key: string; label: string; value: number | null }>;
}): ReviewSection[] {
  const year = new Date().getUTCFullYear();
  const age = year - b.founded;
  const tiers = b.entities.map((e) => REGULATORS[e.licence.regulator]?.tier);
  /**
   * Only the companies that would take you on.
   *
   * This counted every entity, which read "2 of those are tier-A regulators —
   * a statutory compensation scheme behind each: FCA's FSCS up to £85,000" on
   * a broker whose FCA arm deals with other firms and holds $2.5m of client
   * money. The sentence was generated, so it was consistent, and it was still
   * telling a reader they had a protection they cannot claim.
   */
  const tierA = b.entities
    .filter(servesRetail)
    .filter((e) => REGULATORS[e.licence.regulator]?.tier === 'A');
  const regs = [...new Set(b.entities.map((e) => e.licence.regulator))];
  const allIn = effectiveCostPips(b);
  const costs = peers.map((p) => effectiveCostPips(p));
  const costRank = costs.filter((c) => c < allIn).length + 1;
  const costMedian = median(costs);
  const deposits = peers.map((p) => p.payments.minDepositUsd);
  const scored = components.filter((c): c is typeof c & { value: number } => c.value !== null);
  const best = [...scored].sort((x, y) => y.value - x.value)[0];
  const worst = [...scored].sort((x, y) => x.value - y.value)[0];
  const fallback = b.entities.find((e) => e.serves.includes('*'));
  // Entities that actually name countries. A sibling-brand company with an
  // empty `serves` is neither the fallback nor a country entity, and counting
  // it here produced "a reader outside  is" with a hole in the middle.
  const named = b.entities
    .filter(servesRetail)
    .filter((e) => e.serves.length > 0 && !e.serves.includes('*'));

  const sections: ReviewSection[] = [];

  /* ── Who they are ──────────────────────────────────────────────────────── */
  sections.push({
    id: 'review-overview',
    heading: `What ${b.name} is`,
    paragraphs: [
      `${b.name} has been trading since ${b.founded}, which is ${age} year${age === 1 ? '' : 's'}, ` +
      `and runs from ${countryName(b.headquarters)}. It holds ${b.entities.length} ` +
      `licensed ${b.entities.length === 1 ? 'entity' : 'entities'} across ` +
      `${and(regs)}${b.entities.length === 1 ? '' : ' — which is not the same thing as being one company'}.`,

      `On this site it ranks ${ordinal(rank)} of ${of} brokers. ` +
      (rank <= Math.ceil(of / 3)
        ? 'That puts it in the upper third of what we cover, on published weights rather than on an opinion.'
        : rank > Math.ceil((of * 2) / 3)
          ? 'That puts it in the lower third of what we cover, on published weights rather than on an opinion.'
          : 'That puts it in the middle of what we cover, on published weights rather than on an opinion.') +
      ' The weights are on the methodology page and nothing paid for the position.',
    ],
  });

  /* ── Regulation ────────────────────────────────────────────────────────── */
  // "onboards clients in ." was what an empty `serves` produced — a sentence
  // with a hole in it, which is how a reader learns the prose is a template.
  // A company that onboards nobody has its own clause.
  const entityLines = b.entities.map((e) => {
    const where = !servesRetail(e)
      ? 'takes no retail clients at all'
      : e.serves.includes('*')
        ? 'takes everyone else'
        : e.serves.length === 0
          ? 'names no country it onboards'
          : `onboards clients in ${and(e.serves.map(countryName))}`;
    return `${e.legalName}, incorporated in ${countryName(e.country)}, holds ${e.licence.regulator} ` +
      `licence ${e.licence.number} (${e.licence.status}) and ${where}.`;
  });

  const b2b = b.entities.filter((e) => !servesRetail(e));

  const compensation = tierA
    .map((e) => REGULATORS[e.licence.regulator])
    .filter((r): r is NonNullable<typeof r> => Boolean(r?.compensation))
    .map((r) => `${r.code}’s ${r.compensation}`);

  sections.push({
    id: 'review-regulation',
    heading: `Who regulates ${b.name}`,
    paragraphs: [
      entityLines.join(' '),

      tierA.length > 0
        ? (tierA.length === 1
            ? `One of those is a tier-A regulator — a public register you can search and a statutory ` +
              `compensation scheme behind it`
            : `${tierA.length} of those are tier-A regulators — a public register you can search and a ` +
              `statutory compensation scheme behind each`) +
          (compensation.length > 0 ? `: ${and(compensation)}.` : '.')
        : `None of the companies that would take you on is under a tier-A regulator. That does not make ` +
          `${b.name} a scam, and it does mean there is no statutory compensation scheme standing behind ` +
          `your balance if the company fails.`,

      ...(b2b.length > 0 ? [
        `${and(b2b.map((e) => e.legalName))} ${b2b.length === 1 ? 'is' : 'are'} on that list and ` +
        `${b2b.length === 1 ? 'is' : 'are'} not ${b2b.length === 1 ? 'a company' : 'companies'} you can ` +
        `open an account with: ${b2b.length === 1 ? 'it deals' : 'they deal'} with other firms. ` +
        `A licence counts here only if the company holding it would take you as a client, so ` +
        `${b2b.length === 1 ? 'it adds' : 'they add'} nothing to the regulation score — and nothing to ` +
        `your protection either.`,
      ] : []),

      fallback && named.length > 0
        ? `The entity that matters most to a reader outside ` +
          `${and([...new Set(named.flatMap((e) => e.serves))].slice(0, 4).map(countryName))} ` +
          `is ${fallback.legalName}: it is the fallback, regulated by ${fallback.licence.regulator}` +
          `${REGULATORS[fallback.licence.regulator]?.tier === 'A' ? '' : ', which is not a tier-A regulator'}. ` +
          `Where you live decides which company you sign with, and that decides what protection you have — ` +
          `the entity map on this page says which is which.`
        : fallback
          // Everything this company has is the fallback: one entity, taking the
          // whole world. Saying "outside these countries" would be saying
          // "outside nowhere", which is how a template gives itself away.
          ? `There is no country-by-country entity here. Everyone signs with ${fallback.legalName}, ` +
            `regulated by ${fallback.licence.regulator}` +
            `${REGULATORS[fallback.licence.regulator]?.tier === 'A' ? '' : ', which is not a tier-A regulator'}, ` +
            `wherever they live — so the protection a reader in London gets is the protection a reader ` +
            `anywhere else gets.`
          : `Every entity here names the countries it onboards, and there is no catch-all: if your country ` +
            `is not on one of those lists, ${b.name} does not have an entity for you.`,
    ],
  });

  /* ── Cost ──────────────────────────────────────────────────────────────── */
  sections.push({
    id: 'review-cost',
    heading: `What trading ${b.name} costs`,
    paragraphs: [
      `${b.name} publishes a typical EUR/USD spread of ${b.cost.eurusdSpread.toFixed(1)} pips` +
      (b.cost.commissionPerLot === 0
        ? ' and charges no commission, so the spread is the whole of the cost.'
        : ` and charges $${b.cost.commissionPerLot} per standard lot round turn, which is about ` +
          `${(b.cost.commissionPerLot / 10).toFixed(2)} pips on a standard lot.`) +
      ` All in, a round turn costs about ${allIn.toFixed(2)} pips.`,

      `The median across the ${of} brokers ranked here is ${costMedian.toFixed(2)} pips, so this is the ` +
      `${ordinal(costRank)}-cheapest of them` +
      (allIn <= costMedian ? ' and below the median.' : ' and above the median.') +
      ` A published spread is a typical spread: it widens on news and around the session close, and no ` +
      `broker publishes that number.`,

      b.cost.swapFreeAvailable
        ? `A swap-free account is available, which matters if overnight interest is not something you can take.`
        : `There is no swap-free account, so positions held overnight are charged swap.`,
    ],
  });

  /* ── Funding ───────────────────────────────────────────────────────────── */
  const deposit = b.payments.minDepositUsd;
  const cheaperThan = deposits.filter((d) => d > deposit).length;
  sections.push({
    id: 'review-funding',
    heading: 'Deposits and withdrawals',
    paragraphs: [
      `You can fund an account by ${and(b.payments.methods.map((m) => METHOD[m] ?? m))}. ` +
      (deposit === 0
        ? 'There is no stated minimum deposit.'
        : `The stated minimum is $${deposit}, which is lower than ${cheaperThan} of the other ` +
          `${of - 1} brokers here.`),

      `${b.name} states that withdrawals are processed in ` +
      (b.payments.statedWithdrawalHours < 1
        ? `${Math.round(b.payments.statedWithdrawalHours * 60)} minutes`
        : b.payments.statedWithdrawalHours < 48
          ? `about ${Math.round(b.payments.statedWithdrawalHours)} hours`
          : `about ${Math.round(b.payments.statedWithdrawalHours / 24)} days`) +
      `. That is the broker's own figure and this site has not measured it. Processing time is also not ` +
      `arrival time: the payment rail adds its own, and a card refund is slower than the broker's end of it.`,
    ],
  });

  /* ── Platforms ─────────────────────────────────────────────────────────── */
  sections.push({
    id: 'review-platforms',
    heading: 'Platforms and execution',
    paragraphs: [
      `${b.name} offers ${and(b.platforms.list.map((p) => PLATFORM[p] ?? p))}` +
      (b.platforms.copyTrading ? ', and has copy trading built in.' : '. There is no copy trading.'),

      `Orders are filled on ${EXECUTION[b.platforms.execution] ?? b.platforms.execution}. ` +
      `Leverage goes to 1:${b.platforms.maxLeverage.toLocaleString('en-US')}` +
      (b.platforms.maxLeverage > 500
        ? `, which is higher than any tier-A regulator permits a retail client — it is available through the ` +
          `offshore entity, not through the licensed European or Australian one.`
        : `, which is inside what a tier-A regulator permits a retail client.`),
    ],
  });

  /* ── Transparency ──────────────────────────────────────────────────────── */
  const t = b.transparency;
  const publishes = [
    t.publishesEntityMapping && 'which entity serves which country',
    t.publishesAuditedAccounts && 'audited accounts',
    t.segregatedClientFunds && 'that client money is held separately from its own',
    t.publicOwnership && 'who owns it',
  ].filter((x): x is string => Boolean(x));
  const withholds = [
    !t.publishesEntityMapping && 'which entity serves which country',
    !t.publishesAuditedAccounts && 'audited accounts',
    !t.segregatedClientFunds && 'any statement that client money is segregated',
    !t.publicOwnership && 'who owns it',
  ].filter((x): x is string => Boolean(x));

  sections.push({
    id: 'review-transparency',
    heading: `What ${b.name} says about itself`,
    paragraphs: [
      publishes.length > 0
        ? `${b.name} publishes ${and(publishes)}.`
        : `${b.name} publishes none of the four things this site checks for: its entity mapping, audited ` +
          `accounts, a segregation statement, or its ownership.`,
      withholds.length > 0
        ? `It does not publish ${and(withholds)}. That is not evidence of anything on its own — plenty of ` +
          `sound companies are private — and it is the difference between a claim you can check and one you ` +
          `have to take on trust.`
        : `All four are published, which is rare: most of the companies on this site publish two.`,
    ],
  });

  /* ── Verdict ───────────────────────────────────────────────────────────── */
  if (best && worst && best.key !== worst.key) {
    sections.push({
      id: 'review-verdict',
      heading: `Where ${b.name} is strong, and where it is not`,
      paragraphs: [
        `Its best component is ${best.label.toLowerCase()}, at ${best.value.toFixed(1)} out of 10. ` +
        `Its weakest is ${worst.label.toLowerCase()}, at ${worst.value.toFixed(1)}. ` +
        `Those two are what the score is mostly made of, ` +
        `and a reader for whom ${worst.label.toLowerCase()} is the deciding factor should read that row of the ` +
        `breakdown rather than the total.`,

        tiers.includes('A') && allIn <= costMedian
          ? `The short version: a tier-A licence and a below-median cost, which is the combination most readers ` +
            `are looking for.`
          : tiers.includes('A')
            ? `The short version: a tier-A licence, at a cost above the median for this list.`
            : allIn <= costMedian
              ? `The short version: cheap, on an offshore licence. That trade is the whole decision here.`
              : `The short version: neither the cheapest nor the best licensed on this list.`,
      ],
    });
  }

  /* ── The caveat ────────────────────────────────────────────────────────── */
  const unverified = [
    b.cost.verifiedAt === null && 'the costs',
    b.payments.verifiedAt === null && 'the funding terms',
  ].filter((x): x is string => Boolean(x));

  sections.push({
    id: 'review-unchecked',
    heading: 'What this review has not checked',
    paragraphs: [
      unverified.length > 0
        ? `No editor has verified ${and(unverified)} on this record against ${b.name}'s own pages. ` +
          `Everything above is read from what the company publishes, and this site says so rather than ` +
          `implying otherwise.`
        : `The costs and funding terms on this record have been checked by an editor against ${b.name}'s ` +
          `own published pages, and the date of that check is on each row.`,
      `This page is generated from the record above it, so it cannot drift from it: correct a field and the ` +
      `paragraph changes with it. What it will never contain is an opinion about a support team, a platform's ` +
      `feel, or how a withdrawal went — those need people, and when this site has enough verified reviews to ` +
      `say something about them it will say it in the reviews section, with the count attached.`,
    ],
  });

  return sections;
}

/** Words in the generated review — used by the page and by the tests. */
export const reviewWordCount = (sections: ReviewSection[]): number =>
  sections.reduce((n, s) => n + s.paragraphs.join(' ').split(/\s+/).filter(Boolean).length, 0);
