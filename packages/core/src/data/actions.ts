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
