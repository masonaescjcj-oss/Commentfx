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
  | 'under-appeal'
  /**
   * Brought and then dropped, with nothing decided against the firm.
   *
   * The crypto records made this necessary and it is the fairest thing in the
   * file. The SEC sued Coinbase and Kraken and then dismissed both, one with
   * prejudice and neither with a finding or a penalty. A reader searching for
   * "Coinbase SEC lawsuit" should find the outcome here rather than an
   * impression left by headlines from 2023 — and it must cost the score
   * nothing, because nothing was decided. Leaving it out would be the quieter
   * error: a register that records only accusations is a register that treats
   * being cleared as though it never happened.
   */
  | 'dismissed';

export interface EnforcementAction {
  /**
   * The slug of whatever this was done to — a broker, an exchange, in time a
   * prop firm. One register rather than one per vertical, because enforcement
   * is enforcement and three copies of these rules would be three chances to
   * write them down differently. Slugs do not collide across the verticals and
   * a test holds that.
   */
  subject: string;
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
    subject: 'exness',
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
    subject: 'exness',
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

  /* ── Crypto exchanges ──────────────────────────────────────────────────── */
  {
    subject: 'binance',
    authority: 'Financial Crimes Enforcement Network, US Department of the Treasury',
    country: 'US',
    kind: 'fine',
    stage: 'decided',
    date: '2023-11-21',
    summary:
      'FinCEN assessed a $3.4bn civil money penalty on Binance — the largest in its own and the '
      + 'Treasury Department’s history — and imposed a five-year monitorship, as part of a roughly '
      + '$4.3bn resolution across four US agencies in which the company and its founder pleaded '
      + 'guilty.',
    detail:
      'Binance admitted wilfully violating the Bank Secrecy Act: it failed to register as a money '
      + 'services business while claiming to have left the United States years earlier, kept US '
      + 'users and other significant US ties, and failed to report more than 100,000 suspicious '
      + 'transactions. The resolution was coordinated between the Department of Justice, FinCEN, '
      + 'OFAC and the CFTC; Changpeng Zhao pleaded guilty personally and resigned as chief '
      + 'executive. The monitor reviews compliance with the Bank Secrecy Act and US sanctions and '
      + 'the settlement requires the company’s complete exit from the United States. None of this '
      + 'concerns customer funds going missing — it is about who the exchange let trade and what it '
      + 'did not report.',
    sourcePublisher: 'Financial Crimes Enforcement Network',
    sourceUrl: 'https://www.fincen.gov/system/files/enforcement_action/2023-11-21/FinCEN_Consent_Order_2023-04_FINAL508.pdf',
    primary: true,
  },
  {
    subject: 'okx',
    authority: 'US Attorney’s Office for the Southern District of New York',
    country: 'US',
    kind: 'prosecution',
    stage: 'decided',
    date: '2025-02-24',
    summary:
      'Aux Cayes FinTech Co Ltd, which operates OKX, pleaded guilty to running an unlicensed money '
      + 'transmitting business and agreed to pay about $505m: an $84.4m fine and $420.3m in '
      + 'forfeited fees.',
    detail:
      'Prosecutors said that from 2018 until early 2024 the exchange broke its own policy against '
      + 'serving people in the United States and facilitated more than $5bn of suspicious '
      + 'transactions and criminal proceeds. The company must keep an external compliance '
      + 'consultant in place until February 2027, and received a 25% reduction on the fine for '
      + 'cooperating. A guilty plea is a decided matter rather than an allegation, which is why it '
      + 'is filed here as one. The Department of Justice’s own page for this does not answer our '
      + 'servers, so the link goes to the reporting and the sources say so.',
    sourcePublisher: 'CNBC',
    sourceUrl: 'https://www.cnbc.com/2025/02/24/us-says-okx-crypto-exchange-operator-enters-505-million-guilty-plea.html',
    primary: false,
  },
  {
    subject: 'kucoin',
    authority: 'US Attorney’s Office for the Southern District of New York',
    country: 'US',
    kind: 'prosecution',
    stage: 'decided',
    date: '2025-01-27',
    summary:
      'Peken Global Ltd, the operator of KuCoin, pleaded guilty to operating an unlicensed money '
      + 'transmitting business, agreed to more than $297m in fine and forfeiture, and undertook to '
      + 'leave the United States for at least two years.',
    detail:
      'The penalty is a $112.9m criminal fine and $184.5m of forfeiture. The company admitted '
      + 'failing to run the anti-money-laundering and know-your-customer programmes US law requires, '
      + 'and prosecutors said the exchange was used to move billions of dollars of suspicious '
      + 'transactions including proceeds of darknet markets, ransomware and fraud. Two of its '
      + 'founders, Chun Gan and Ke Tang, gave up any role in running it. Sources disagree about '
      + 'where Peken Global is incorporated — the Seychelles in some accounts, the Turks and Caicos '
      + 'in others — and we have not been able to settle it, so this page does not say.',
    sourcePublisher: 'CoinDesk',
    sourceUrl: 'https://www.coindesk.com/policy/2025/01/28/kucoin-hit-with-nearly-usd300-million-fine-after-pleading-guilty-to-u-s-doj-charges',
    primary: false,
  },
  {
    subject: 'kucoin',
    authority: 'Commodity Futures Trading Commission',
    country: 'US',
    kind: 'restriction',
    stage: 'decided',
    date: '2026-03-30',
    summary:
      'A federal court entered a CFTC consent order permanently barring KuCoin’s operator from '
      + 'letting US participants trade on its system unless it first registers as a foreign board '
      + 'of trade, with a $500,000 civil penalty.',
    detail:
      'The CFTC had sued Peken Global and three related companies — Mek Global Ltd, PhoenixFin Pte '
      + 'Ltd and Flashdot Ltd — in March 2024, alleging an unregistered digital asset derivatives '
      + 'exchange, a failure to register as a futures commission merchant, and know-your-customer '
      + 'procedures the agency called a sham. The money here is small; the bar is not, and it is '
      + 'permanent unless the registration happens.',
    sourcePublisher: 'CoinDesk',
    sourceUrl: 'https://www.coindesk.com/policy/2026/03/31/kucoin-permanently-barred-from-u-s-after-cftc-order-following-usd297-million-doj-case',
    primary: false,
  },
  {
    subject: 'kraken',
    authority: 'Securities and Exchange Commission',
    country: 'US',
    kind: 'fine',
    stage: 'decided',
    date: '2023-02-09',
    summary:
      'Payward Ventures Inc and Payward Trading Ltd agreed to pay $30m and to stop offering their '
      + 'crypto staking-as-a-service programme to US customers, settling SEC charges that it was an '
      + 'unregistered offer and sale of securities.',
    detail:
      'The SEC said the programme, run since 2019, advertised returns as high as 21% a year, and '
      + 'that customers handing over tokens "lose control of those tokens and take on risks '
      + 'associated with those platforms, with very little protection". The $30m is disgorgement, '
      + 'prejudgment interest and civil penalties together. It is a registration and disclosure '
      + 'matter about one product, not a finding about customer funds.',
    sourcePublisher: 'Securities and Exchange Commission',
    sourceUrl: 'https://www.sec.gov/newsroom/press-releases/2023-25',
    primary: true,
  },
  {
    subject: 'kraken',
    authority: 'Securities and Exchange Commission',
    country: 'US',
    kind: 'prosecution',
    stage: 'dismissed',
    date: '2025-03-03',
    summary:
      'The SEC dismissed, with prejudice, its November 2023 suit alleging Kraken ran an unregistered '
      + 'exchange — no penalty, no admission, and no change required to the business.',
    detail:
      'The complaint was filed on 11 November 2023 and survived a motion to dismiss in August 2024, '
      + 'so this was a live case rather than a weak one. The Commission said the dismissal rests on '
      + 'its judgment that it will help reform its approach to the crypto industry and "not on any '
      + 'assessment of the merits of the claims alleged". It costs this record nothing, because '
      + 'nothing was decided against the company — but a reader who remembers the headlines is '
      + 'entitled to find the ending here.',
    sourcePublisher: 'Securities and Exchange Commission',
    sourceUrl: 'https://www.sec.gov/enforcement-litigation/litigation-releases/lr-26278',
    primary: true,
  },
  {
    subject: 'coinbase',
    authority: 'Securities and Exchange Commission',
    country: 'US',
    kind: 'prosecution',
    stage: 'dismissed',
    date: '2025-02-27',
    summary:
      'The SEC dismissed its June 2023 action against Coinbase with prejudice and imposed no '
      + 'penalty, ending the registration case it had brought over the exchange’s listings.',
    detail:
      'Commissioner Hester Peirce’s statement records it plainly: "Today the Commission settled its '
      + 'case against Coinbase by dismissing it with prejudice." The reason given is the formation '
      + 'of the Commission’s Crypto Task Force and a move away from making policy by enforcement, '
      + 'rather than any conclusion about Coinbase. Filed here at zero cost for the same reason as '
      + 'the Kraken dismissal: a register that records accusations and not acquittals is not a '
      + 'record, it is a rumour column with dates.',
    sourcePublisher: 'Securities and Exchange Commission',
    sourceUrl: 'https://www.sec.gov/newsroom/speeches-statements/peirce-statement-coinbase-022725',
    primary: true,
  },

  {
    subject: 'bitget',
    authority: 'Financial Services Agency of Japan',
    country: 'JP',
    kind: 'warning',
    stage: 'decided',
    date: '2024-11-28',
    summary:
      'Japan issued a warning to Bitget Limited for conducting crypto-asset exchange business with '
      + 'Japanese residents over the internet without registration, and published its name on the '
      + 'list of unregistered operators.',
    detail:
      'The FSA\u2019s published list of persons conducting virtual currency exchange business without '
      + 'registration names the operator at Singapore, with Gracy Chen as its representative, for having "conducted crypto-asset exchange '
      + 'business with residents of Japan as counterparties through the internet" in breach of '
      + 'article 63-2 of the Payment Services Act. The same list carries an earlier entry against the same company from March 2023. Keep it in proportion: Japan registers no '
      + 'offshore exchange that will not accept its rules, so this is about market access rather '
      + 'than about customer money, and four of the eight exchanges ranked here are on the same '
      + 'list. It is still a regulator naming a company in public and leaving it there.',
    sourcePublisher: 'Financial Services Agency of Japan',
    sourceUrl: 'https://www.fsa.go.jp/policy/virtual_currency/angoushisan_mutouroku.pdf',
    primary: true,
  },
  {
    subject: 'bybit',
    authority: 'Financial Services Agency of Japan',
    country: 'JP',
    kind: 'warning',
    stage: 'decided',
    date: '2024-11-28',
    summary:
      'Japan issued a warning to Bybit Fintech Limited for conducting crypto-asset exchange business with '
      + 'Japanese residents over the internet without registration, and published its name on the '
      + 'list of unregistered operators.',
    detail:
      'The FSA\u2019s published list of persons conducting virtual currency exchange business without '
      + 'registration names the operator at Dubai, with Ben Zhou as its representative, for having "conducted crypto-asset exchange '
      + 'business with residents of Japan as counterparties through the internet" in breach of '
      + 'article 63-2 of the Payment Services Act. Keep it in proportion: Japan registers no '
      + 'offshore exchange that will not accept its rules, so this is about market access rather '
      + 'than about customer money, and four of the eight exchanges ranked here are on the same '
      + 'list. It is still a regulator naming a company in public and leaving it there.',
    sourcePublisher: 'Financial Services Agency of Japan',
    sourceUrl: 'https://www.fsa.go.jp/policy/virtual_currency/angoushisan_mutouroku.pdf',
    primary: true,
  },
  {
    subject: 'mexc',
    authority: 'Financial Services Agency of Japan',
    country: 'JP',
    kind: 'warning',
    stage: 'decided',
    date: '2024-11-28',
    summary:
      'Japan issued a warning to MEXC Global for conducting crypto-asset exchange business with '
      + 'Japanese residents over the internet without registration, and published its name on the '
      + 'list of unregistered operators.',
    detail:
      'The FSA\u2019s published list of persons conducting virtual currency exchange business without '
      + 'registration names the operator at Singapore, with John Chen Ju as its representative, for having "conducted crypto-asset exchange '
      + 'business with residents of Japan as counterparties through the internet" in breach of '
      + 'article 63-2 of the Payment Services Act. The same list carries an earlier entry against the same company from March 2023. Keep it in proportion: Japan registers no '
      + 'offshore exchange that will not accept its rules, so this is about market access rather '
      + 'than about customer money, and four of the eight exchanges ranked here are on the same '
      + 'list. It is still a regulator naming a company in public and leaving it there.',
    sourcePublisher: 'Financial Services Agency of Japan',
    sourceUrl: 'https://www.fsa.go.jp/policy/virtual_currency/angoushisan_mutouroku.pdf',
    primary: true,
  },
  {
    subject: 'kucoin',
    authority: 'Financial Services Agency of Japan',
    country: 'JP',
    kind: 'warning',
    stage: 'decided',
    date: '2024-11-28',
    summary:
      'Japan issued a warning to KuCoin for conducting crypto-asset exchange business with '
      + 'Japanese residents over the internet without registration, and published its name on the '
      + 'list of unregistered operators.',
    detail:
      'The FSA\u2019s published list of persons conducting virtual currency exchange business without '
      + 'registration names the operator at the Seychelles, with Johnny Lyu as its representative, for having "conducted crypto-asset exchange '
      + 'business with residents of Japan as counterparties through the internet" in breach of '
      + 'article 63-2 of the Payment Services Act. Keep it in proportion: Japan registers no '
      + 'offshore exchange that will not accept its rules, so this is about market access rather '
      + 'than about customer money, and four of the eight exchanges ranked here are on the same '
      + 'list. It is still a regulator naming a company in public and leaving it there.',
    sourcePublisher: 'Financial Services Agency of Japan',
    sourceUrl: 'https://www.fsa.go.jp/policy/virtual_currency/angoushisan_mutouroku.pdf',
    primary: true,
  },
  {
    subject: 'mexc',
    authority: 'Virtual Assets Regulatory Authority, Dubai',
    country: 'AE',
    kind: 'fine',
    stage: 'decided',
    date: '2026-06-22',
    summary:
      'Dubai\u2019s virtual asset regulator fined MX Global Ltd, which operates MEXC, and ordered it to '
      + 'cease and desist from all unlicensed virtual asset activity in or from Dubai.',
    detail:
      'VARA found the company "providing Virtual Asset Broker-Dealer and/or Exchange Services to '
      + 'customers in Dubai without obtaining the necessary licence from VARA" between 2022 and '
      + 'April 2026, and separately that it had onboarded users without meeting the '
      + 'know-your-customer obligations UAE law requires. The notice records that the company '
      + 'cooperated fully and said it intends to seek a licence, and it does not state the amount '
      + 'of the fine, so neither does this page.',
    sourcePublisher: 'Virtual Assets Regulatory Authority, Dubai',
    sourceUrl: 'https://www.vara.ae/en/regulations/regulatory-notices/vara-notice-of-fines-mx-global-ltd-mexc/',
    primary: true,
  },

  /* ── Octa ──────────────────────────────────────────────────────────── */
  {
    subject: 'octafx',
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
    subject: 'octafx',
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
    subject: 'ic-markets',
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
    subject: 'ic-markets',
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
    subject: 'pepperstone',
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
  /* ── crypto exchanges ── */
  binance: '2026-09-17',
  coinbase: '2026-09-17',
  kraken: '2026-09-17',
  okx: '2026-09-17',
  bybit: '2026-09-17',
  bitget: '2026-09-17',
  kucoin: '2026-09-17',
  mexc: '2026-09-17',

  /* ── brokers ── */
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
  ACTIONS.filter((a) => a.subject === slug).sort((a, b) => b.date.localeCompare(a.date));

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
  alleged: 0.8, decided: 1, 'under-appeal': 0.85, dismissed: 0,
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
