/**
 * What regulators, prosecutors and courts have done about these companies.
 *
 * This did not exist, and its absence was the largest hole in the site. The
 * score model reads a broker's licences, its published costs, its payment
 * terms, its platforms and its disclosures. None of those move when a regulator
 * strips the controlling shareholder of his voting rights, or when a financial
 * crime agency attaches €300m of his assets and a court takes cognisance of a
 * prosecution. A directory that ranks a broker fifth of ten on spread and
 * withdrawal speed while that is happening is not wrong about the spread; it is
 * answering a question nobody asked.
 *
 * So the actions are recorded here, shown at the top of the broker's page
 * before anything good about it, and fed into the cons. What they do NOT do
 * yet is move the number, and that is deliberate rather than lazy: the weights
 * on /methodology are published, and quietly adding a penalty nobody can see is
 * the exact behaviour this site exists to catch other people at. The gap is
 * stated on the page instead, which is the honest interim.
 *
 * Two rules keep this from becoming a rumour column:
 *
 * 1. **An action is something a named body did on a named date**, with a
 *    document behind it. Not a forum thread, not a complaint, not a review-site
 *    "red flag". If no authority acted, there is no entry.
 * 2. **`stage` is never decoration.** An allegation is labelled an allegation
 *    however serious it sounds, and it stays that way until something decides
 *    it. A fine under appeal says so. Getting this wrong in either direction —
 *    calling a charge a finding, or burying a finding as "claims" — is the
 *    failure mode that matters.
 */
export type ActionKind =
  /** A monetary penalty. */
  | 'fine'
  /** A restriction, suspension or condition on a person or a firm. */
  | 'restriction'
  /** A criminal or civil case brought by an authority. */
  | 'prosecution'
  /** A private claim: a class action, a group claim. */
  | 'civil-claim'
  /** A public warning or advisory naming the firm. */
  | 'warning';

export type ActionStage =
  /** Alleged, filed, charged — not decided by anyone. */
  | 'alleged'
  /** An authority decided it. */
  | 'decided'
  /** Decided, and being appealed. */
  | 'under-appeal';

export interface EnforcementAction {
  brokerSlug: string;
  /** The body that acted, in full. */
  authority: string;
  /** ISO-3166 alpha-2 of that body. */
  country: string;
  kind: ActionKind;
  stage: ActionStage;
  /** The date of the act itself, not of the reporting. */
  date: string;
  /** One line, factual, no adjectives. */
  summary: string;
  /** What it is about, in the reader's terms. */
  detail: string;
  sourcePublisher: string;
  sourceUrl: string;
  /** True when the link goes to the authority's own document. */
  primary: boolean;
}

export const ACTIONS: EnforcementAction[] = [
  /* ── Exness ──────────────────────────────────────────── */
  {
    brokerSlug: 'exness',
    authority: 'Kanto Local Finance Bureau, Financial Services Agency of Japan',
    country: 'JP',
    kind: 'warning',
    stage: 'decided',
    date: '2023-04-21',
    summary:
      'Japan sent a warning letter to Nymstar Limited — the former name of Exness (SC) Ltd, the Seychelles '
      + 'company most clients outside the EU and South Africa are onboarded to — for soliciting '
      + 'over-the-counter derivative business in Japan without registration.',
    detail:
      'The entry on the FSA’s published list of warned overseas operators gives the address as F20, 1st '
      + 'floor, Eden Plaza, Eden Island, Seychelles, and records in the remarks column that "the name of the '
      + 'service this operator provides is ‘Exness’". The global LEI register confirms the identification: '
      + 'NYMSTAR LIMITED is the previous legal name of EXNESS (SC) LTD at that same address. Keep it in '
      + 'proportion — Japan caps retail forex leverage at 25:1 and registers no offshore firm that will not '
      + 'live inside that cap, so this is about market access rather than about client money, and nothing in '
      + 'it concerns payouts or conduct toward existing clients.',
    sourcePublisher: 'Financial Services Agency of Japan',
    sourceUrl: 'https://www.fsa.go.jp/ordinary/chuui/mutouroku/03.pdf',
    primary: true,
  },
  {
    brokerSlug: 'exness',
    authority: 'Securities and Exchange Commission of the Philippines',
    country: 'PH',
    kind: 'warning',
    stage: 'decided',
    date: '2026-01-08',
    summary:
      'The Philippine SEC named Exness Global Limited and its trading app in an advisory about platforms '
      + 'letting Filipinos trade unregistered investment products without a Philippine licence.',
    detail:
      'The same shape as the Japanese warning: a licensing advisory about serving a market the group is not '
      + 'registered in, issued alongside one naming HF Markets, and not a finding about client money. The date '
      + 'here is the date it was reported, because the SEC’s own site refuses our requests and nobody here has '
      + 'read the advisory itself.',
    sourcePublisher: 'BusinessWorld',
    sourceUrl: 'https://www.bworldonline.com/corporate/2026/01/08/722998/sec-warns-public-vs-unregistered-platforms/',
    primary: false,
  },

  /* ── Octa ──────────────────────────────────────────────────────────── */
  {
    brokerSlug: 'octafx',
    authority: 'Directorate of Enforcement',
    country: 'IN',
    kind: 'prosecution',
    stage: 'alleged',
    date: '2025-10-17',
    summary:
      'India’s financial crime agency attached ₹2,385 crore of cryptocurrency, said the group’s controlling '
      + 'owner had been arrested in Spain, and confirmed a prosecution against OctaFX and 54 others is before '
      + 'the PMLA Special Court.',
    detail:
      'The ED says OctaFX "systematically duped Indian investors of approximately Rs. 1,875 Crore between July '
      + '2022 and April 2023", operated "without RBI permission", and "manipulated trading operations, using '
      + 'falsified candlestick charts and deliberate slippage, ensuring consistent investor losses". Assets of '
      + 'over ₹2,681 crore are attached, including 19 properties and a yacht. None of this has been decided by '
      + 'a court: the Special Court has taken cognisance of the complaint, which is the start of a case and not '
      + 'the end of one.',
    sourcePublisher: 'Directorate of Enforcement, Government of India',
    sourceUrl: 'https://www.enforcementdirectorate.gov.in/media/press-release-documents/a490dca5-edac-400a-b916-0d73fe571ee6_Press%20Release-%20PAO%20OctaFX%20-17.10.2025%204.pdf',
    primary: true,
  },
  {
    brokerSlug: 'octafx',
    authority: 'Cyprus Securities and Exchange Commission',
    country: 'CY',
    kind: 'restriction',
    stage: 'decided',
    date: '2025-08-25',
    summary:
      'CySEC suspended the voting rights attached to the 95% shareholding in Octa Markets Cyprus Ltd held by '
      + 'Pavel Prozorov, and barred him from management duties on its board.',
    detail:
      'The decision was taken under article 11(3) of Law 87(I)/2017, on the ground that his influence as '
      + 'ultimate beneficial owner was prejudicial to the sound and prudent management of the firm. The Cyprus '
      + 'licence itself, 372/18, remains active — this is the regulator acting on who controls the company '
      + 'rather than on whether it may trade.',
    sourcePublisher: 'Cyprus Mail',
    sourceUrl: 'https://cyprus-mail.com/2025/09/04/cysec-orders-liquidation-of-fund-restricts-shareholder-voting-rights',
    primary: false,
  },

  /* ── IC Markets ────────────────────────────────────────────────────── */
  {
    brokerSlug: 'ic-markets',
    authority: 'Cyprus Securities and Exchange Commission',
    country: 'CY',
    kind: 'fine',
    stage: 'under-appeal',
    date: '2024-07-01',
    summary: 'A €200,000 administrative fine on IC Markets (EU) Ltd for taking part in the circumvention of the EU’s retail margin rules.',
    detail:
      'CySEC found non-compliance with article 42 of Regulation (EU) 600/2014 "as it participated in activities '
      + 'that resulted in the circumvention of the requirements of paragraph 4(1)(a) of DI87-09 and specifically '
      + 'the requirements regarding the payment of initial margin protection". The firm rejects the finding and '
      + 'has said it will appeal.',
    sourcePublisher: 'Cyprus Securities and Exchange Commission',
    sourceUrl: 'https://www.cysec.gov.cy/CMSPages/GetFile.aspx?guid=4a427854-2170-4c8b-ab6c-32bbdac0089e',
    primary: true,
  },
  {
    brokerSlug: 'ic-markets',
    authority: 'Federal Court of Australia',
    country: 'AU',
    kind: 'civil-claim',
    stage: 'alleged',
    date: '2024-02-08',
    summary: 'A class action over the sale of CFDs to retail investors, pleading unconscionable, misleading and deceptive conduct.',
    detail:
      'Brought by Piper Alderman and funded by a litigation funder, on behalf of clients who say their '
      + 'objectives and financial situation were not adequately assessed and the risks not adequately disclosed. '
      + 'IC Markets calls the claims entirely meritless and says it will defend them. Nothing is decided.',
    sourcePublisher: 'Finance Magnates',
    sourceUrl: 'https://www.financemagnates.com/forex/brokers/cfds-at-trial-ic-markets-faces-class-action-lawsuit-in-australia/',
    primary: false,
  },

  /* ── Pepperstone ───────────────────────────────────────────────────── */
  {
    brokerSlug: 'pepperstone',
    authority: 'Supreme Court of New South Wales',
    country: 'AU',
    kind: 'civil-claim',
    stage: 'under-appeal',
    date: '2025-09-01',
    summary: 'The owners of Pepperstone were ordered to pay A$96.9m plus interest to the private equity firm that sold them the business.',
    detail:
      'An ownership dispute rather than a client one: Justice Rees found a drafting error in the 2018 share '
      + 'sale agreement had been exploited. An appeal was lodged in December 2025. No client money is involved '
      + 'and no regulator has acted.',
    sourcePublisher: 'FX News Group',
    sourceUrl: 'https://fxnewsgroup.com/forex-news/retail-forex/pepperstone-owners-ordered-to-pay-a96m-to-cpe-capital/',
    primary: false,
  },
];

/**
 * When a person last went looking for actions against each broker, and found
 * whatever is above — including nothing.
 *
 * This is what lets a clean record score as a clean record. "No entries" and
 * "nobody has looked" are the same shape in the list above and completely
 * different facts, and a directory that scores them alike is rewarding the
 * brokers it has not got round to. A broker not named here has its conduct
 * component excluded rather than set to ten, which is the same rule the reviews
 * component already follows: no data is not a good score.
 */
export const SEARCHED: Record<string, string> = {
  exness: '2026-09-16',
  'ic-markets': '2026-09-16',
  pepperstone: '2026-09-16',
  eightcap: '2026-09-16',
  octafx: '2026-09-16',
  xm: '2026-09-16',
  fxtm: '2026-09-16',
  roboforex: '2026-09-16',
  alpari: '2026-09-16',
  litefinance: '2026-09-16',
};

export const actionsFor = (slug: string): EnforcementAction[] =>
  ACTIONS.filter((a) => a.brokerSlug === slug).sort((a, b) => b.date.localeCompare(a.date));

/**
 * The ones that would change a reader's mind, which is not the same as the
 * serious ones. A regulator restricting who may control a broker, or an
 * authority prosecuting it, bears on whether to put money there. An ownership
 * dispute between shareholders does not, however large the number.
 */
export const ACTION_WEIGHT: Record<ActionKind, number> = {
  prosecution: 3, restriction: 3, fine: 2, warning: 2, 'civil-claim': 1,
};

export const bearsOnClients = (a: EnforcementAction) => ACTION_WEIGHT[a.kind] >= 2;

/* ── the conduct component ───────────────────────────────────────────────── */

/**
 * How far each kind of action pulls a broker down, out of ten.
 *
 * A prosecution costs most because an authority has decided the conduct is
 * worth a court's time. A restriction costs nearly as much because a regulator
 * has already acted rather than asked. A fine is a closed matter with a price
 * on it. A warning is a regulator telling the public something. A private claim
 * costs least: anyone may sue anyone, and the bar for filing is a filing fee.
 */
export const CONDUCT_COST: Record<ActionKind, number> = {
  prosecution: 5, restriction: 4, fine: 3, warning: 2, 'civil-claim': 1,
};

/**
 * An allegation costs less than a finding and it is not free — a regulator or a
 * prosecutor bringing a case is itself information, and pretending otherwise
 * would let a broker under active prosecution score as though nothing were
 * happening. An action under appeal is nearly a finding, because it is one
 * until the appeal says otherwise.
 */
export const STAGE_FACTOR: Record<ActionStage, number> = {
  alleged: 0.8, decided: 1, 'under-appeal': 0.85,
};

/**
 * Conduct is about what a company is like now, so old matters fade. A firm
 * fined in 2013 and clean since has demonstrably changed; carrying that at full
 * weight forever would make the component a memorial rather than a measure.
 * Ten years is the cut-off, which is roughly how long a regulator keeps a
 * disciplinary record in view.
 */
export function ageFactor(actionDate: string, now = new Date()): number {
  const years = (now.getTime() - Date.parse(`${actionDate}T00:00:00Z`)) / (365.25 * 86_400_000);
  if (years <= 3) return 1;
  if (years <= 7) return 0.5;
  if (years <= 10) return 0.25;
  return 0;
}

/**
 * Ten when a person has looked and found nothing; null when nobody has looked.
 * Never a number that means "we have not checked".
 */
export function conductScore(slug: string, now = new Date()): number | null {
  if (!Object.hasOwn(SEARCHED, slug)) return null;
  const cost = actionsFor(slug).reduce(
    (sum, a) => sum + CONDUCT_COST[a.kind] * STAGE_FACTOR[a.stage] * ageFactor(a.date, now),
    0,
  );
  return Math.round(Math.max(0, 10 - cost) * 10) / 10;
}
