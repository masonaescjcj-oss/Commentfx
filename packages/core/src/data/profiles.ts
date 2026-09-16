/**
 * The hand-researched layer, one per broker.
 *
 * Everything else about a broker on this site is generated from its record, and
 * that is the right default: a paragraph cannot be recomputed when a number
 * changes, so a site whose prose is written by hand is a site whose prose is
 * quietly wrong within a year. What generation cannot do is read a set of filed
 * accounts, or notice that a licence belongs to a company that would not open an
 * account for you. That is what this is for.
 *
 * Two rules make it safe to have both:
 *
 * 1. **Nothing here restates a number the record already holds.** Spreads,
 *    minimums and withdrawal times live in the record, are rendered from it, and
 *    are not repeated in a sentence that would then have to be kept in step.
 *    What is here is the kind of fact that has a date attached and does not
 *    move: what a filing said, on a day, with a link to it.
 * 2. **Every claim carries a source id, and every source carries the date we
 *    read it.** `profiles.test.ts` fails the build if a cited id has no source,
 *    if a source has no date, or if a section cites nothing at all. Cheap to
 *    write, impossible to let rot silently.
 *
 * The voice is the site's: short sentences, the number first, no adjectives
 * doing work a figure could do. Where a source is weak it is called weak; where
 * we could not check something we say we could not check it, rather than
 * repeating what everyone else has written down.
 */

export type SourceKind =
  /** A regulator's own register, read by us. */
  | 'register'
  /** A statutory filing: accounts, an annual return, a company record. */
  | 'filing'
  /** A regulator's own notice or advisory. */
  | 'regulator'
  /** Trade press or a review desk that does its own testing. */
  | 'press'
  /** The broker's own published page. */
  | 'broker';

export interface Source {
  /** Cited in prose as [id]. */
  id: string;
  publisher: string;
  title: string;
  url: string;
  /** The date on the source itself, where it has one. */
  published?: string;
  /** The day we read it. Every source has one. */
  read: string;
  kind: SourceKind;
}

/** A number we can point at, with the document it came from. */
export interface ProfileFact {
  label: string;
  value: string;
  /** Source.id */
  from: string;
}

export interface ProfileSection {
  heading: string;
  paragraphs: string[];
}

export interface BrokerProfile {
  slug: string;
  /** The day a person did this research. */
  checked: string;
  /** What a reader should take away, in one or two sentences. */
  verdict: string;
  sections: ProfileSection[];
  facts: ProfileFact[];
  /** Questions this research opened and did not close. */
  open: string[];
  sources: Source[];
}

const EXNESS: BrokerProfile = {
  slug: 'exness',
  checked: '2026-09-16',
  verdict:
    'The FCA licence Exness leads with belongs to a company that does not take retail clients, and its own '
    + 'accounts prove it: $2.47m of client money at the end of 2024, in a group reporting trillions a month. '
    + 'Everything good about Exness — the entry price, the payout speed, the cost on a Standard account — is '
    + 'true of the Seychelles company almost everyone outside the EU and South Africa is actually signing with.',

  sections: [
    {
      heading: 'The licence in the marketing is not the licence you get',
      paragraphs: [
        'Exness holds four licences and puts the British one first. Exness (UK) Ltd is genuinely authorised by '
        + 'the FCA under firm reference 730729, and the FCA is as serious as regulators get — it is one of the '
        + 'few that stands behind a compensation scheme. The question nobody asks is what that company does.',

        'It files its accounts at Companies House like any other British company, and they answer it. The '
        + 'strategic report for the year to 31 December 2024 describes a firm working through "compliance '
        + 'requirements arising from the growth of its B2B and liquidity provision business", and notes that it '
        + '"has increased its onboarding of B2B clients during 2024" [ch-accounts]. B2B. Not traders — other '
        + 'firms.',

        'And then there is note 21, which settles it without any interpretation at all. "As at the year end the '
        + 'company held client monies in segregated client accounts equivalent to $2,473,493 (2023: $50,275)" '
        + '[ch-accounts]. Two and a half million dollars. In the same period the group was reporting monthly '
        + 'trading volume of $3.86 trillion across 836,873 active traders [fm-volume]. Whatever those traders '
        + 'are, they are not clients of the company with the FCA licence.',

        'So the entity map on this page shows that licence greyed out, with no country against it. It is not a '
        + 'demotion and it is not an accusation — the company is real, profitable and well capitalised. It is '
        + 'simply not yours, and a page that listed it next to "FSCS up to £85,000" for a British reader would '
        + 'be describing a protection that reader cannot have. Ours did, until this research. That is the whole '
        + 'reason the entity map exists.',
      ],
    },

    {
      heading: 'Where you do end up',
      paragraphs: [
        'Three companies take retail clients. Exness (Cy) Ltd holds CySEC 178/12 and covers the EU — we read '
        + 'that entry off the CySEC register ourselves the day this was written, and it is active [cysec]. '
        + 'Exness ZA (Pty) Ltd holds FSCA licence 51024 and covers South Africa; the group added an '
        + 'over-the-counter derivative provider licence there in August 2024, which is the permission South '
        + 'Africa requires specifically for CFDs [odp].',

        'Everyone else — which is most of the world, and every reader outside those two blocks — is onboarded '
        + 'to Exness (SC) Ltd in Seychelles, licence SD025, a company that until 2021 was called Nymstar '
        + 'Limited. Seychelles registers firms rather than supervising them closely and runs no compensation '
        + 'scheme. That is the trade Exness offers, and it is a real one: the leverage and the entry price that '
        + 'make the broker attractive are things a tier-1 regulator would not let a retail client near.',

        'It is worth saying plainly that Exness is not unusual in this. Almost every broker in this ranking has '
        + 'the same shape. What is unusual is the size of the gap between the company on the homepage and the '
        + 'company on the client agreement.',
      ],
    },

    {
      heading: 'What the filings say about the group',
      paragraphs: [
        'Exness does not publish audited group accounts, so the British subsidiary is the only part of the '
        + 'business anyone outside it can read. It is worth reading anyway.',

        'Revenue there grew from $5.25m to $7.66m in 2024, profit before tax from $4.53m to $7.77m, and net '
        + 'assets stood at $97.7m at the year end [ch-accounts]. The shareholders put in another $25m of share '
        + 'capital in January 2024 [ch-accounts], and a further allotment in December 2025 took called-up '
        + 'capital to about $140m [ch-filings]. That is a lot of money to leave sitting in a B2B arm, and it is '
        + 'the most concrete evidence available that the group intends to do something larger with its European '
        + 'footprint than it does today.',

        'One line in the notes is worth more than the rest for anyone weighing counterparty risk: "During the '
        + 'year under review, there was no single ultimate controlling party" [ch-accounts]. Exness is private, '
        + 'founded in 2008, and has never had to name a controlling shareholder to anyone. There is no annual '
        + 'report, no exchange filing and no rating. The four licences are the only outside check on it that '
        + 'exists, which is why which one covers you is not a detail.',
      ],
    },

    {
      heading: 'What we could not check, and why we are telling you',
      paragraphs: [
        'Exness blocks our servers. Every request we make to exness.com, to the regional sites and to the help '
        + 'centre comes back 403 — not a page we misread, a door closed to datacentre traffic. So the cost, '
        + 'minimum deposit and withdrawal figures on this page are the ones the broker publishes, as a person '
        + 'read them, and the "checked" date beside them is the honest measure of how old that reading is.',

        'It matters because the published numbers are contested. A review desk that tests accounts rather than '
        + 'reading brochures puts the minimum on the professional account types at $1,000 and on Standard at '
        + '$100 [fbrokers], where the figure Exness advertises in most markets is far lower. Both can be true '
        + 'at once — the minimum is set per entity and per region, and the one you see depends on which company '
        + 'you are being onboarded to, which is the same point as the rest of this page. Until someone here has '
        + 'opened an account and looked, we publish the broker’s figure and say where it came from.',

        'The same caution applies to the leverage headline. "Unlimited" is the group’s best-known claim and it '
        + 'is conditional — on the account type, the platform, how much equity is in the account, and what the '
        + 'calendar is doing. We have not been able to read those conditions from the source, so this page '
        + 'carries the 1:2000 cap that applies broadly and does not repeat thresholds we cannot stand behind.',
      ],
    },

    {
      heading: 'The one regulatory finding, in proportion',
      paragraphs: [
        'The Philippine SEC issued an advisory in January 2026 naming Exness Global among platforms offering '
        + 'CFDs without Philippine registration [sec-ph]. It is worth knowing and it is worth keeping in '
        + 'proportion: it is a licensing advisory about serving a market the group is not licensed in, of the '
        + 'kind that regulator issues in batches, and not a finding about client money or conduct.',

        'We looked for more and did not find it. No CySEC settlement or administrative penalty against Exness '
        + '(Cy) Ltd came up in the searches we ran, and the FCA entity has filed clean audited accounts every '
        + 'year since 2019 [ch-filings]. "We found nothing" is not the same as "there is nothing", and it is '
        + 'the strongest thing we are willing to say.',
      ],
    },
  ],

  facts: [
    { label: 'UK entity, client money held at 31 Dec 2024', value: '$2,473,493', from: 'ch-accounts' },
    { label: 'UK entity, the year before', value: '$50,275', from: 'ch-accounts' },
    { label: 'UK entity, trading revenue 2024', value: '$7,663,905', from: 'ch-accounts' },
    { label: 'UK entity, profit before tax 2024', value: '$7,772,055', from: 'ch-accounts' },
    { label: 'UK entity, net assets at 31 Dec 2024', value: '$97,677,881', from: 'ch-accounts' },
    { label: 'UK entity, FCA classification', value: 'IFPRU 750K firm, CRD IV full scope', from: 'ch-accounts' },
    { label: 'Ultimate controlling party', value: 'None — no single controlling party', from: 'ch-accounts' },
    { label: 'Group monthly volume, March 2024', value: '$3.86 trillion', from: 'fm-volume' },
    { label: 'Group active traders, March 2024', value: '836,873', from: 'fm-volume' },
    { label: 'Company number, Exness (UK) Ltd', value: '08861481, incorporated 27 January 2014', from: 'ch-filings' },
  ],

  open: [
    'One review desk reports that copy trading is being wound down and is no longer taking new users. Our '
    + 'record still counts it, and it is worth 0.8 of the platform score. One source is not enough to change a '
    + 'record, and it is enough to go and look.',
    'The minimum deposit is published at one figure and tested at another. Both may be right for different '
    + 'entities; nobody here has opened an account to find out which applies where.',
    'Exness refuses our infrastructure outright, so no cost or payment figure on this page has been read by a '
    + 'machine of ours. Every one of them needs a person, and the date says when one last did.',
  ],

  sources: [
    {
      id: 'ch-accounts',
      publisher: 'Companies House',
      title: 'Exness (UK) Ltd — full accounts for the year ended 31 December 2024',
      url: 'https://find-and-update.company-information.service.gov.uk/company/08861481/filing-history',
      published: '2025-07-24',
      read: '2026-09-16',
      kind: 'filing',
    },
    {
      id: 'ch-filings',
      publisher: 'Companies House',
      title: 'Exness (UK) Ltd — company record and filing history, company number 08861481',
      url: 'https://find-and-update.company-information.service.gov.uk/company/08861481',
      read: '2026-09-16',
      kind: 'filing',
    },
    {
      id: 'cysec',
      publisher: 'Cyprus Securities and Exchange Commission',
      title: 'Register of Cyprus Investment Firms — Exness (Cy) Ltd, licence 178/12',
      url: 'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/',
      read: '2026-09-16',
      kind: 'register',
    },
    {
      id: 'fm-volume',
      publisher: 'Finance Magnates',
      title: 'Trading volume on Exness recovers in March: active traders hit record',
      url: 'https://www.financemagnates.com/forex/exness-march-trading-volume-recovers-active-traders-hit-record/',
      published: '2024-04-05',
      read: '2026-09-16',
      kind: 'press',
    },
    {
      id: 'fbrokers',
      publisher: 'ForexBrokers.com',
      title: 'Exness review',
      url: 'https://www.forexbrokers.com/reviews/exness',
      published: '2026-05-27',
      read: '2026-09-16',
      kind: 'press',
    },
    {
      id: 'odp',
      publisher: 'TradeInformer',
      title: 'Exness acquires ODP licence in South Africa',
      url: 'https://tradeinformer.com/broker-news/exness-acquires-odp-license-in-south-africa',
      published: '2024-08-06',
      read: '2026-09-16',
      kind: 'press',
    },
    {
      id: 'sec-ph',
      publisher: 'BusinessWorld',
      title: 'SEC warns public vs unregistered platforms',
      url: 'https://www.bworldonline.com/corporate/2026/01/08/722998/sec-warns-public-vs-unregistered-platforms/',
      published: '2026-01-08',
      read: '2026-09-16',
      kind: 'regulator',
    },
  ],
};

const IC_MARKETS: BrokerProfile = {
  slug: 'ic-markets',
  checked: '2026-09-16',
  verdict:
    'A regulator has already written down what this site keeps arguing. In July 2024 CySEC fined IC Markets’ '
    + 'European arm €200,000 for taking part in arrangements that got around the EU’s margin rules for retail '
    + 'clients — the offshore entity was not an accident of geography, it was the point. The broker rejects the '
    + 'finding and is appealing. Separately it is defending a class action in Australia. Neither changes that '
    + 'the raw pricing is the tightest in this directory.',

  sections: [
    {
      heading: 'The fine, in the regulator’s own words',
      paragraphs: [
        'On 1 July 2024 the board of the Cyprus Securities and Exchange Commission decided to impose an '
        + 'administrative fine of €200,000 on IC Markets (EU) Ltd. The announcement went out on 19 July and it is '
        + 'published in English, which is unusual enough to be worth quoting rather than summarising: the firm '
        + 'was fined for non-compliance with article 42 of Regulation (EU) 600/2014 "as it participated in '
        + 'activities that resulted in the circumvention of the requirements of paragraph 4(1)(a) of DI87-09 and '
        + 'specifically the requirements regarding the payment of initial margin protection" [cysec-fine].',

        'DI87-09 is the Cypriot implementation of the EU’s CFD intervention — the rule that caps retail leverage '
        + 'at 1:30 on major currency pairs and sets the margin a retail client must post. "Circumvention of the '
        + 'requirements regarding initial margin protection" means clients ended up with leverage the EU does not '
        + 'allow a retail client to have. Trade press covering the decision reported the figure as up to 1:1000, '
        + 'reached through a third-country company in the same group, and reported that CySEC treated it as '
        + 'repeat conduct after intervening over the same thing in 2021 [ia-fine].',

        'That is the offshore entity described from the other side. Everywhere else on this site the argument is '
        + 'that the company you sign with decides your protection, and readers are left to work out that a group '
        + 'might prefer you signed with the loose one. Here a regulator has found that the tight entity took part '
        + 'in moving people to the loose one, and fined it for doing so.',

        'IC Markets does not accept it. The firm said it would appeal, said CySEC had disregarded "irrefutable '
        + 'audited evidence" in favour of allegations from a terminated employee, and called the decision part of '
        + '"a pattern of selective and disproportionate application of regulatory authority" [ff-appeal]. An '
        + 'appeal is a real thing and this page will say so when it resolves. It has been open since July 2024.',
      ],
    },

    {
      heading: 'And a class action, on a different question',
      paragraphs: [
        'In Australia, International Capital Markets Pty Ltd is defending a class action brought by the law firm '
        + 'Piper Alderman over the sale of CFDs to retail investors. The pleaded case is "unconscionable conduct '
        + 'and misleading and deceptive conduct": that clients lost money in circumstances where their objectives '
        + 'and financial situation were not adequately assessed and the risks were not adequately disclosed '
        + '[fm-class]. It is the second such action against the firm, it is funded by a litigation funder, and '
        + 'the same funder is behind a comparable case against another Australian CFD issuer.',

        'The company’s answer is that the claims are "entirely meritless" and will be "vigorously defended", and '
        + 'that its CFD products "have consistently complied with all regulations" [fm-class]. Nothing has been '
        + 'decided. A filed claim is an allegation and this page treats it as one — it is here because a reader '
        + 'deciding where to put money is entitled to know that the question is before a court, not because we '
        + 'have a view on how it ends.',

        'What both matters have in common is worth naming. Neither is about a missing withdrawal or a frozen '
        + 'account, which is what most complaints against brokers are about. Both are about whether a retail '
        + 'client was sold more risk than the rules intended them to carry. That is a different kind of finding '
        + 'and, for a broker whose whole appeal is cheap access to leverage, a more central one.',
      ],
    },

    {
      heading: 'What the registers say, read today',
      paragraphs: [
        'Both of the supervised entities check out. Our own reading of ASIC’s published register finds '
        + 'INTERNATIONAL CAPITAL MARKETS PTY. LTD. holding AFS licence 335692, active [asic]. CySEC’s register '
        + 'lists IC Markets (EU) Ltd under licence 362/18, authorised on 25 June 2018, registered in Limassol '
        + 'under company number 356877, with permission to passport into 29 member states [cysec-reg].',

        'The third company is Raw Trading Ltd in Seychelles, licence SD018, and it is the one most readers here '
        + 'will be onboarded to. The group has routed everything outside Australia and the EU through it since '
        + 'mid-2019 [grok-note]. Seychelles registers firms rather than supervising them closely and runs no '
        + 'compensation scheme, so a client there has the platform and the pricing and none of the recourse.',

        'IC Markets was founded in Sydney in 2007 and remains private, with no published group accounts and no '
        + 'outside shareholder to answer to. As with every private broker in this directory, the licences are the '
        + 'only external check that exists — which is exactly why a fine against one of them is worth more than '
        + 'a hundred reviews.',
      ],
    },

    {
      heading: 'The pricing, and the numbers we will not print',
      paragraphs: [
        'The raw pricing is genuinely the tightest here, and that is a fact about the record on this page rather '
        + 'than an opinion: the all-in figure is computed from the published spread and commission the same way '
        + 'for all ten brokers, and IC Markets comes out first. It is also why the minimum deposit is what it is. '
        + 'This is not a broker built for someone funding an account with pocket money.',

        'What we are not going to print is the execution benchmarks. Review sites publish IC Markets figures to '
        + 'the millisecond — average fill times, the share of orders filled at the requested price, the balance '
        + 'of positive to negative slippage — and not one of them publishes how it was measured, over what '
        + 'period, on which account type, or on how many orders. Some of those numbers are almost certainly the '
        + 'broker’s own marketing figures with a new frame around them.',

        'A number you cannot check is not evidence, and repeating it would make this page look more authoritative '
        + 'while making it less true. If someone here runs a measured execution test one day, the method will be '
        + 'published with the result.',
      ],
    },
  ],

  facts: [
    { label: 'CySEC fine, IC Markets (EU) Ltd', value: '€200,000', from: 'cysec-fine' },
    { label: 'Board decision date', value: '1 July 2024, announced 19 July 2024', from: 'cysec-fine' },
    { label: 'Rule breached', value: 'Art. 42, Regulation (EU) 600/2014, via DI87-09', from: 'cysec-fine' },
    { label: 'LEI, IC Markets (EU) Ltd', value: '549300O8CKXT0AKIWS77', from: 'cysec-fine' },
    { label: 'CySEC authorisation date', value: '25 June 2018', from: 'cysec-reg' },
    { label: 'Cyprus company number', value: '356877, Limassol', from: 'cysec-reg' },
    { label: 'ASIC register, AFS licence 335692', value: 'Active, read 16 September 2026', from: 'asic' },
    { label: 'Class action, pleaded conduct', value: 'Unconscionable, misleading and deceptive conduct', from: 'fm-class' },
    { label: 'Class action, period pleaded', value: 'September 2017 to March 2021', from: 'fm-class' },
    { label: 'The broker’s position on both', value: 'Appealing the fine; defending the claim', from: 'ff-appeal' },
  ],

  open: [
    'The CySEC appeal has been outstanding since July 2024 and we have found no ruling. Until there is one the '
    + 'fine stands and is contested, which is exactly what this page says.',
    'The record on this page caps leverage at 1:500. The conduct CySEC described reached 1:1000 through the '
    + 'offshore company. Those may be different account types or different years; nobody here has established '
    + 'which, and the figure has not been changed on one press report.',
    'No group accounts are published anywhere, so unlike Exness there is no filing to read. Everything financial '
    + 'about this business is either the broker’s own claim or a court document.',
  ],

  sources: [
    {
      id: 'cysec-fine',
      publisher: 'Cyprus Securities and Exchange Commission',
      title: 'CySEC board decision: administrative fine of €200,000 on IC Markets (EU) Ltd',
      url: 'https://www.cysec.gov.cy/CMSPages/GetFile.aspx?guid=4a427854-2170-4c8b-ab6c-32bbdac0089e',
      published: '2024-07-19',
      read: '2026-09-16',
      kind: 'regulator',
    },
    {
      id: 'cysec-reg',
      publisher: 'Cyprus Securities and Exchange Commission',
      title: 'Register of Cyprus Investment Firms — IC Markets (EU) Ltd, licence 362/18',
      url: 'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/80418/',
      read: '2026-09-16',
      kind: 'register',
    },
    {
      id: 'asic',
      publisher: 'Australian Securities and Investments Commission',
      title: 'Professional registers — AFS licensees, licence 335692',
      url: 'https://asic.gov.au/online-services/search-asics-registers/',
      read: '2026-09-16',
      kind: 'register',
    },
    {
      id: 'ia-fine',
      publisher: 'International Adviser',
      title: 'CySEC fines IC Markets €200,000 for leverage violations through a third country entity',
      url: 'https://international-adviser.com/cysec-fines-ic-markets-e200000-for-leverage-violations-through-a-third-country-entity/',
      published: '2024-07-23',
      read: '2026-09-16',
      kind: 'press',
    },
    {
      id: 'ff-appeal',
      publisher: 'FinanceFeeds',
      title: 'IC Markets to appeal CySEC’s €200,000 fine over leverage lapses',
      url: 'https://financefeeds.com/ic-markets-to-appeal-cysecs-e200000-fine-over-leverage-lapses/',
      published: '2024-07-19',
      read: '2026-09-16',
      kind: 'press',
    },
    {
      id: 'fm-class',
      publisher: 'Finance Magnates',
      title: 'CFDs on trial: IC Markets faces class-action lawsuit in Australia',
      url: 'https://www.financemagnates.com/forex/brokers/cfds-at-trial-ic-markets-faces-class-action-lawsuit-in-australia/',
      published: '2024-02-08',
      read: '2026-09-16',
      kind: 'press',
    },
    {
      id: 'grok-note',
      publisher: 'FinTelegram',
      title: 'IC Markets group structure and the Seychelles entity',
      url: 'https://fintelegram.com/tag/andrew-budzinski/',
      read: '2026-09-16',
      kind: 'press',
    },
  ],
};

const PEPPERSTONE: BrokerProfile = {
  slug: 'pepperstone',
  checked: '2026-09-16',
  verdict:
    'The useful comparison is with Exness. Both lead with an FCA licence; both have a British company filing '
    + 'accounts anyone can read. Pepperstone’s says its business is onboarding retail clients and that it held '
    + '£26.2m of client money at 30 June 2025. Exness’s says B2B, and $2.5m. Same regulator, same kind of '
    + 'licence, and the filings tell you which one is actually doing the thing it advertises.',

  sections: [
    {
      heading: 'The British company does what it says it does',
      paragraphs: [
        'Pepperstone Limited files full accounts at Companies House every year, and the 2025 set opens by '
        + 'stating what the company is for: "to onboard retail and professional clients for the purpose of '
        + 'providing a platform for these clients to buy and sell leveraged Contract for Difference and '
        + 'spread-betting products" [ch-accounts]. Retail is the first word. It has been profitable every year '
        + 'since it started operating in 2017.',

        'The numbers are ordinary in the good sense. Revenue from commissions, swaps and spreads of £15.04m in '
        + 'the year to 30 June 2025, up from £13.02m. Profit before tax of £24.07m against £13.27m. Client cash '
        + 'held in segregated accounts of £26.17m, close to flat on the £26.97m a year earlier [ch-accounts]. '
        + 'A dividend of £8.5m was declared and paid.',

        'One structural detail is worth pulling out, because it is the kind of thing no review site mentions and '
        + 'it changes what the FCA licence means. The accounts say plainly: "The Company’s licence does not allow '
        + 'it to take on any market risk and therefore all market risk is borne by the Company’s affiliate '
        + 'company Pepperstone Group Limited" [ch-accounts]. The British firm faces the client and holds the '
        + 'money; the Australian firm carries the position. That is a normal matched-principal arrangement, and '
        + 'it means the counterparty to your trade is in Melbourne even when your client agreement is in London.',
      ],
    },

    {
      heading: 'The entity we had wrong, and what it was costing readers',
      paragraphs: [
        'Until this research, this site listed Pepperstone EU Limited — the CySEC firm — as the catch-all. That '
        + 'told every reader outside Australia, Britain and Dubai that they would be a client of a European '
        + 'investment firm with the Investor Compensation Fund behind it. They would not be.',

        'Pepperstone’s own regulation page names one company as the operator of the global site: Pepperstone '
        + 'Markets Limited, company number 177174 B, licensed by the Securities Commission of The Bahamas as '
        + 'SIA-F217, registered at Old Fort Bay in Nassau [pep-reg]. That is the entity most readers here get, '
        + 'and the map says so now. Two more that we had simply left out are on it too: Pepperstone GmbH, a '
        + 'BaFin-supervised securities institution in Düsseldorf [bafin], and the Cyprus firm, now against the '
        + 'countries it actually covers.',

        'The Bahamas is not Seychelles. The Securities Commission licenses under a securities act, inspects and '
        + 'enforces, and publishes a register — which is why it sits at tier B here rather than with the pure '
        + 'registration regimes. What it does not run is a compensation scheme, and what it does not impose is a '
        + 'leverage cap. That is the trade, and it is the same trade every broker in this directory offers to '
        + 'the part of the world its tier-A licences do not reach.',
      ],
    },

    {
      heading: 'Who owns it, and the fight about that',
      paragraphs: [
        'Pepperstone was founded in Melbourne in 2010 by Owen Kerr and Joe Davenport. Champ Private Equity, now '
        + 'CPE Capital, bought 60% in 2016; in 2018 that stake went to FX Group Holdings, a vehicle of Fiona '
        + 'Lock with the chief executive and a former director alongside her, funded by a A$150m loan from CPE '
        + 'repayable at A$211.6m [cpe].',

        'That deal ended up in the Supreme Court of New South Wales. In September 2025 Justice Kelly Rees '
        + 'ordered FX Group Holdings to pay CPE A$96.9m plus interest, finding that a drafting error in the '
        + 'share sale agreement had been exploited and that the reading advanced against CPE was "absurd". An '
        + 'appeal was lodged in December and is pending [cpe].',

        'None of this is about client money or conduct, and it is not a reason to avoid the broker. It is here '
        + 'because a private company’s ownership is normally invisible, and for once there is a judgment saying '
        + 'who owns what and what they owe. The British subsidiary names its immediate parent as FX MidCo Pty Ltd '
        + 'and points to group accounts at FX HoldCo Pty Ltd in Melbourne [ch-accounts] — more of a paper trail '
        + 'than most brokers here leave.',
      ],
    },

    {
      heading: 'What checked out, and the one thing to actually watch',
      paragraphs: [
        'Every licence on this page was read rather than taken on trust. ASIC’s register returns Pepperstone '
        + 'Group Limited under AFS licence 414530, active; CySEC’s returns Pepperstone EU Limited under 388/20 '
        + '[registers]. The FCA firm reference, 684312, has been authorised since 5 August 2015, and the UK '
        + 'accounts corroborate it from the other direction [ch-accounts].',

        'The thing worth watching has nothing to do with Pepperstone’s conduct. BaFin has published consumer '
        + 'warnings about websites impersonating the brand — pepperstone.vip in May 2024 and pepperstone.life in '
        + 'November 2024 — and the FCA has warned about a Pepperstone clone of its own [bafin-clone]. Clone '
        + 'firms target the brokers people trust, so a warning list entry like this is closer to a compliment '
        + 'than an accusation. It is still money someone lost. Check the domain against the licence before you '
        + 'deposit, and the guide on this site on reading a register will tell you how.',

        'As with every broker here, Pepperstone’s own pricing and payment figures on this page are the ones it '
        + 'publishes, read by a person, with the date beside them. Its spreads are quoted to two decimal places '
        + 'by a dozen review sites and not one of them says how it measured. We do not carry those numbers.',
      ],
    },
  ],

  facts: [
    { label: 'UK entity, client money at 30 June 2025', value: '£26,172,993', from: 'ch-accounts' },
    { label: 'UK entity, the year before', value: '£26,971,370', from: 'ch-accounts' },
    { label: 'UK entity, trading revenue 2025', value: '£15,040,968', from: 'ch-accounts' },
    { label: 'UK entity, profit before tax 2025', value: '£24,070,877', from: 'ch-accounts' },
    { label: 'UK entity, principal activity', value: 'Onboarding retail and professional clients', from: 'ch-accounts' },
    { label: 'Who carries the market risk', value: 'Pepperstone Group Limited, Australia', from: 'ch-accounts' },
    { label: 'Immediate parent', value: 'FX MidCo Pty Ltd; group accounts at FX HoldCo Pty Ltd', from: 'ch-accounts' },
    { label: 'Global site operator', value: 'Pepperstone Markets Limited, Bahamas, SIA-F217', from: 'pep-reg' },
    { label: 'FCA authorisation, effective', value: '5 August 2015, firm reference 684312', from: 'fca' },
    { label: 'NSW Supreme Court order, September 2025', value: 'A$96.9m plus interest, under appeal', from: 'cpe' },
  ],

  open: [
    'Which EU country goes to which entity is our reading, not a disclosure. Germany is assigned to Pepperstone '
    + 'GmbH because that is what a BaFin-licensed German firm is for, and the rest of the EU to the Cyprus firm. '
    + 'The broker does not publish the split country by country.',
    'A Kenyan entity licensed by the CMA appears in Pepperstone’s own footers and is not on this map yet, '
    + 'because nobody here has read the Kenyan register.',
    'The A$96.9m appeal has been pending since December 2025. It is an ownership dispute rather than a client '
    + 'one, and it is still the largest open financial question about the group.',
  ],

  sources: [
    {
      id: 'ch-accounts',
      publisher: 'Companies House',
      title: 'Pepperstone Limited — full accounts for the year ended 30 June 2025, company 08965105',
      url: 'https://find-and-update.company-information.service.gov.uk/company/08965105/filing-history',
      published: '2026-04-10',
      read: '2026-09-16',
      kind: 'filing',
    },
    {
      id: 'pep-reg',
      publisher: 'Pepperstone',
      title: 'Is Pepperstone licensed and regulated',
      url: 'https://pepperstone.com/en/help-and-support/opening-an-account/is-pepperstone-licensed-and-regulated/',
      read: '2026-09-16',
      kind: 'broker',
    },
    {
      id: 'registers',
      publisher: 'ASIC and CySEC',
      title: 'AFS licensee register (414530) and the register of Cyprus Investment Firms (388/20)',
      url: 'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/',
      read: '2026-09-16',
      kind: 'register',
    },
    {
      id: 'bafin',
      publisher: 'Bundesanstalt für Finanzdienstleistungsaufsicht',
      title: 'Company database — Pepperstone GmbH, Düsseldorf, licence 151148',
      url: 'https://portal.mvp.bafin.de/database/InstInfo/institutDetails.do?cmd=loadInstitutAction&institutId=151148',
      read: '2026-09-16',
      kind: 'register',
    },
    {
      id: 'bafin-clone',
      publisher: 'Bundesanstalt für Finanzdienstleistungsaufsicht',
      title: 'Identitätsdiebstahl: BaFin warns about the website pepperstone.life',
      url: 'https://www.bafin.de/SharedDocs/Veroeffentlichungen/DE/Verbrauchermitteilung/unerlaubte/2024/meldung_2024_11_25_pepperstone_life.html',
      published: '2024-11-25',
      read: '2026-09-16',
      kind: 'regulator',
    },
    {
      id: 'fca',
      publisher: 'Financial Conduct Authority',
      title: 'Financial Services Register — Pepperstone Limited, firm reference 684312',
      url: 'https://register.fca.org.uk/',
      read: '2026-09-16',
      kind: 'register',
    },
    {
      id: 'cpe',
      publisher: 'FX News Group',
      title: 'Pepperstone owners ordered to pay A$96m to CPE Capital',
      url: 'https://fxnewsgroup.com/forex-news/retail-forex/pepperstone-owners-ordered-to-pay-a96m-to-cpe-capital/',
      published: '2026-03-03',
      read: '2026-09-16',
      kind: 'press',
    },
  ],
};

const EIGHTCAP: BrokerProfile = {
  slug: 'eightcap',
  checked: '2026-09-16',
  verdict:
    'Eightcap publishes its whole group structure on its own site, which is more than most brokers do — and '
    + 'reading it is uncomfortable. Seven companies, three of them properly supervised, one of them holding no '
    + 'financial licence anywhere. The British arm is real and audited and began taking clients in February '
    + '2024, with net assets of £2.3m. This is a small, young, well-priced broker with a long offshore tail.',

  sections: [
    {
      heading: 'Seven companies, and we had three of them',
      paragraphs: [
        'This page listed three entities until this research and two of them were wrong. The British company is '
        + 'Eightcap Group Ltd, not "Eightcap (UK) Ltd". "Eightcap Global Ltd" was filed here as a Seychelles '
        + 'company; Eightcap Global Limited is the Bahamas one, and the Seychelles company is a different entity '
        + 'with a different number. A live CySEC licence was missing altogether.',

        'None of that was hidden. Eightcap’s own legal-documents page lists the group, and it is a longer list '
        + 'than the marketing suggests: Eightcap Pty Ltd under ASIC, Eightcap Group Ltd under the FCA, Eightcap '
        + 'EU Ltd under CySEC, Eightcap Global Limited under the Securities Commission of The Bahamas, Eightcap '
        + 'International Ltd in Seychelles, Eightcap International Trading in Mauritius, and CLMarkets Limited in '
        + 'St Vincent [ec-legal]. We had simply never read it. The map on this page now matches theirs.',

        'Publishing that list is genuinely to the broker’s credit. Plenty of groups keep the offshore companies '
        + 'off the site entirely and let the client agreement do the disclosing after you have deposited.',
      ],
    },

    {
      heading: 'The company with no licence at all',
      paragraphs: [
        'One entry on that list is not like the others. CLMarkets Limited, registered in St Vincent and the '
        + 'Grenadines as 24750 IBC 2018 and trading as Eightcap International, has a company number and no '
        + 'financial licence [ec-legal].',

        'That is not an oversight by anyone. St Vincent’s Financial Services Authority says in its own published '
        + 'notices that licensing forex business is not part of what it does, and warns that firms claim '
        + 'registration there as though it were regulation [svg-fsa]. A certificate of incorporation from a '
        + 'registrar of companies is the same document a corner shop gets. It is not supervision, there is no '
        + 'conduct rulebook behind it, and there is nobody to complain to.',

        'So the entity map marks it with a dash instead of a tier and says "no financial licence anywhere" in '
        + 'words. It scores nothing. That is a change to how this site works, not just to this page: any group '
        + 'here that turns out to include an unlicensed company will now show it the same way.',

        'What we do not know is who ends up as a client of it, and Eightcap does not say. Every other entity on '
        + 'the list has a jurisdiction you can reason about. This one is on the page because a reader is entitled '
        + 'to know it exists.',
      ],
    },

    {
      heading: 'The British arm is small, new, and does what it says',
      paragraphs: [
        'Eightcap Group Ltd was authorised by the FCA in December 2020 and, by its own account, only started '
        + 'onboarding clients in late February 2024 [ch-accounts]. Its first profitable year followed: a profit '
        + 'after tax of £638,355 in the period to 30 June 2025 against a loss of £107,957 the year before, and net '
        + 'assets up from £1.71m to £2.35m.',

        'The stated business is "the execution of FX and CFD trading offered to retail and professional clients '
        + 'via an on-line trading platform", and the firm "operates as a Matched Principal broker and does not '
        + 'hold market risk as all trades executed by clients are automatically hedged on a back-to-back basis '
        + 'with our liquidity provider" [ch-accounts]. That is the same shape as Pepperstone’s British company '
        + 'and the opposite of Exness’s, which is a B2B arm.',

        'One line in the same accounts is worth flagging rather than smoothing over. The directors’ section 172 '
        + 'statement describes a client base that "ranges from large institutional clients to professional '
        + 'clients" [ch-accounts] — which is not what the principal activity says two pages earlier. It may be a '
        + 'drafting leftover from before onboarding started. It may not. We are not going to guess, and it is in '
        + 'the open questions below.',

        'For scale: £2.3m of net assets is a small firm. Pepperstone’s British company held £26m of client money '
        + 'alone. Small is not unsafe — it is audited, capitalised above requirement, and honestly reported — '
        + 'but a reader choosing between them should know they are not the same size of thing.',
      ],
    },

    {
      heading: 'What checked out, and what is still just the broker’s word',
      paragraphs: [
        'The two registers we can read ourselves both confirm. ASIC returns Eightcap Pty Ltd under AFS licence '
        + '391441, active. CySEC returns Eightcap EU Ltd under 246/14, active — the licence that was missing from '
        + 'this page entirely [registers]. The FCA reference, 921296, is corroborated by the company’s own filed '
        + 'accounts describing itself as FCA-regulated [ch-accounts].',

        'The Bahamas, Seychelles, Mauritius and St Vincent entries come from Eightcap’s published list and have '
        + 'not been read against those registers by anyone here, because we have no reader for them. The '
        + 'verification panel on this page says which is which, and it is not decoration: a licence number we '
        + 'copied from a broker’s website is a claim, and a licence number we found on a regulator’s register is '
        + 'a fact.',

        'The pricing is the broker’s published figure, as with everyone here. It is genuinely competitive — the '
        + 'all-in cost puts it near the top of this directory at a quarter of IC Markets’ minimum deposit, which '
        + 'is the reason it ranks where it does.',
      ],
    },
  ],

  facts: [
    { label: 'Entities on the broker’s own legal page', value: 'Seven, across six jurisdictions', from: 'ec-legal' },
    { label: 'Entities with no financial licence', value: 'One — CLMarkets Limited, St Vincent', from: 'ec-legal' },
    { label: 'UK entity, FCA authorisation', value: 'Granted December 2020', from: 'ch-accounts' },
    { label: 'UK entity, client onboarding began', value: 'Late February 2024', from: 'ch-accounts' },
    { label: 'UK entity, profit after tax to 30 June 2025', value: '£638,355 (2024: loss of £107,957)', from: 'ch-accounts' },
    { label: 'UK entity, net assets', value: '£2,346,228 (2024: £1,707,873)', from: 'ch-accounts' },
    { label: 'UK entity, execution model', value: 'Matched principal, hedged back to back', from: 'ch-accounts' },
    { label: 'ASIC register, AFS licence 391441', value: 'Active, read 16 September 2026', from: 'registers' },
    { label: 'CySEC register, licence 246/14', value: 'Eightcap EU Ltd, active', from: 'registers' },
    { label: 'St Vincent FSA on forex', value: 'Licensing forex business is not part of its remit', from: 'svg-fsa' },
  ],

  open: [
    'The UK accounts describe the client base two different ways on two different pages — "retail and '
    + 'professional" in the principal activity, "large institutional to professional" in the section 172 '
    + 'statement. Which is current matters, and only the company can say.',
    'Who is onboarded to CLMarkets Limited, the unlicensed St Vincent company, is not disclosed anywhere we '
    + 'could find. It is on the group’s own legal page and that is all we know about it.',
    'Four of the seven licences — Bahamas, Seychelles, Mauritius and St Vincent — come from the broker’s list '
    + 'and not from a register we have read. We have no reader for any of those four.',
  ],

  sources: [
    {
      id: 'ec-legal',
      publisher: 'Eightcap',
      title: 'Legal documents and disclosures',
      url: 'https://www.eightcap.com/en/legal-documents/',
      read: '2026-09-16',
      kind: 'broker',
    },
    {
      id: 'ch-accounts',
      publisher: 'Companies House',
      title: 'Eightcap Group Ltd — full accounts for the period ended 30 June 2025, company 12448314',
      url: 'https://find-and-update.company-information.service.gov.uk/company/12448314/filing-history',
      published: '2025-10-16',
      read: '2026-09-16',
      kind: 'filing',
    },
    {
      id: 'registers',
      publisher: 'ASIC and CySEC',
      title: 'AFS licensee register (391441) and the register of Cyprus Investment Firms (246/14)',
      url: 'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/',
      read: '2026-09-16',
      kind: 'register',
    },
    {
      id: 'svg-fsa',
      publisher: 'Financial Services Authority, St Vincent and the Grenadines',
      title: 'Alerts and advisories — the regulation of forex business',
      url: 'https://svgfsa.com/',
      read: '2026-09-16',
      kind: 'regulator',
    },
  ],
};

const OCTA: BrokerProfile = {
  slug: 'octafx',
  checked: '2026-09-16',
  verdict:
    'India’s financial crime agency has attached ₹2,681 crore of assets, arrested the group’s controlling owner '
    + 'in Spain, and filed a prosecution against OctaFX and 54 others. Cyprus’s regulator has stripped that same '
    + 'man of the voting rights on his 95% of the licensed European company. The Cyprus licence is still live and '
    + 'the pricing is still commission-free, and neither of those is the thing to read this page for.',

  sections: [
    {
      heading: 'What the Enforcement Directorate says',
      paragraphs: [
        'On 17 October 2025 India’s Directorate of Enforcement published a press release. It is short, it is '
        + 'specific, and it is worth reading in the agency’s own words rather than anyone’s summary of them.',

        'The ED says OctaFX "systematically duped Indian investors of approximately Rs. 1,875 Crore between July '
        + '2022 and April 2023, generating profits of around Rs. 800 Crore", that across 2019 to 2024 total '
        + 'profits from India are "estimated to exceed Rs. 5,000 Crore", and that the platform operated "without '
        + 'RBI permission". On how: "OctaFX manipulated trading operations, using falsified candlestick charts '
        + 'and deliberate slippage, ensuring consistent investor losses." And on the early payouts: "The initial '
        + 'investors received small profits to build trust, as is generally seen in a typical Ponzi scheme" '
        + '[ed-oct].',

        'The structure the ED describes is the reason this site exists. It says the group "operated through a '
        + 'distributed global network designed to evade regulatory scrutiny and layer illicit funds across '
        + 'jurisdictions": marketing run from the British Virgin Islands, servers and back office in Spain, '
        + 'payment gateways in Estonia, technical support in Georgia, Dubai overseeing Indian operations through '
        + 'Russian promoters, Singapore used to export bogus services — and "entity in Cyprus served as the '
        + 'holding company for the Indian entity" [ed-oct]. The regulated company was part of the map, not '
        + 'separate from it.',

        'The agency has attached over ₹2,681 crore of assets including 19 properties and a yacht, plus ₹2,385 '
        + 'crore of cryptocurrency, and says Pavel Prozorov was arrested in Spain by Spanish police [ed-oct].',

        'Now the part that matters as much: **none of this has been decided**. A prosecution complaint has been '
        + 'filed and the PMLA Special Court has taken cognisance of it, which is the beginning of a case. An '
        + 'attachment is provisional. An arrest is not a conviction. This page labels every line of it as '
        + 'alleged, and will say so until something decides otherwise.',
      ],
    },

    {
      heading: 'And what Cyprus did about it',
      paragraphs: [
        'A regulator has already acted, and that part is decided rather than alleged. At its meeting of 25 '
        + 'August 2025 CySEC suspended the voting rights attached to the shares in Octa Markets Cyprus Ltd held '
        + 'by Pavel Prozorov — 95% of the company — and prohibited him from exercising management duties on its '
        + 'board, under article 11(3) of Law 87(I)/2017, having found his influence as ultimate beneficial owner '
        + 'prejudicial to the sound and prudent management of the firm [cy-mail].',

        'Read that precisely, because it is narrower and stranger than a headline suggests. CySEC did not '
        + 'suspend the licence. Octa Markets Cyprus Ltd is on the register today, authorised since 10 December '
        + '2018 under 372/18, trading as Octa, with 14 approved domains and passporting rights into 28 member '
        + 'states — we read that entry ourselves [cy-reg]. What the regulator did was remove the owner’s ability '
        + 'to control it. The firm keeps trading; the man behind it may not direct it.',

        'For a European client that is the best available outcome and still an uncomfortable one. For everyone '
        + 'else it is close to irrelevant, because everyone else is not a client of the Cyprus company.',
      ],
    },

    {
      heading: 'Where everyone else signs, and why it now reads differently',
      paragraphs: [
        'Octa Markets Incorporated in St Vincent and the Grenadines takes every client the licensed European '
        + 'entity does not. This page used to describe it as registered under the St Vincent FSA, which gave it '
        + 'the look of a light-touch licence. It is not a licence of any kind.',

        'St Vincent’s Financial Services Authority and its Financial Intelligence Unit say so jointly, in an '
        + 'advisory they publish themselves: "there is no regulation in place for Foreign Exchange (Forex) '
        + 'Trading and Cryptocurrency offerings in St. Vincent and the Grenadines. Furthermore, no Forex Trading '
        + 'or Cryptocurrency licenses are issued in St. Vincent and the Grenadines" [svg]. The number in the '
        + 'entity map, 19776 IBC 2011, is a company registration. There is no conduct rulebook behind it and '
        + 'nobody to complain to.',

        'That correction has been applied to every St Vincent company in this directory, not just this one. It '
        + 'costs LiteFinance three quarters of a point, because a jurisdiction that issues no licence cannot be '
        + 'scored as a weak regulator; it has to be scored as none.',
      ],
    },

    {
      heading: 'The brand moved, and the old address is gone',
      paragraphs: [
        'OctaFX renamed itself Octa in September 2023. That is ordinary enough. What is not ordinary is that '
        + 'octafx.com — the address this site carried, and the one on a decade of reviews, bonus pages and IPL '
        + 'sponsorship — now answers HTTP 410 Gone. Not a redirect to the new brand. Gone, deliberately, which '
        + 'is what 410 means.',

        'The European business runs on domains CySEC has approved, among them octamarkets.eu and octa.trading, '
        + 'and those answer 451 to a request from outside the EU, which is a legal geo-block working as '
        + 'intended [cy-reg]. The global business is at octabroker.com. A reader following an old link, or an '
        + 'old review, arrives nowhere.',

        'We have corrected the address on this record. It is worth knowing that most pages about this broker '
        + 'still point at a domain that has been switched off, and that they were written before any of the '
        + 'above happened.',
      ],
    },

    {
      heading: 'What we are not saying',
      paragraphs: [
        'We are not saying Octa is a fraud. An agency has alleged it, a court has agreed to hear the '
        + 'allegation, and that is where it stands. Firms are prosecuted and acquitted.',

        'We are also not going to pretend the ranking handles this. Octa sits fifth of ten on this site because '
        + 'the score reads licences, published costs, payment terms, platforms and disclosures, and there is no '
        + 'component in it for a live money-laundering prosecution. That is a gap in the model, stated here and '
        + 'on the page rather than patched with a penalty nobody could see — the published weights are the only '
        + 'thing that makes the number worth anything.',

        'If you are weighing this broker: the European entity is supervised and its owner has been removed from '
        + 'its controls. Every other client in the world is with a company that no financial regulator licenses, '
        + 'run by the same group, while that case runs.',
      ],
    },
  ],

  facts: [
    { label: 'Assets attached by India’s ED', value: '₹2,681 crore, including 19 properties and a yacht', from: 'ed-oct' },
    { label: 'Cryptocurrency attached, 17 October 2025', value: '₹2,385 crore', from: 'ed-oct' },
    { label: 'Alleged loss to Indian investors', value: '₹1,875 crore, July 2022 to April 2023', from: 'ed-oct' },
    { label: 'Accused in the prosecution complaint', value: 'OctaFX and 54 other persons or entities', from: 'ed-oct' },
    { label: 'Stage of the Indian case', value: 'Complaint filed, court has taken cognisance — undecided', from: 'ed-oct' },
    { label: 'CySEC decision, 25 August 2025', value: 'Voting rights on 95% suspended; owner barred from the board', from: 'cy-mail' },
    { label: 'Cyprus licence 372/18', value: 'Active, authorised 10 December 2018', from: 'cy-reg' },
    { label: 'St Vincent entity', value: 'Company number 19776 IBC 2011 — no financial licence', from: 'svg' },
    { label: 'St Vincent FSA on forex licences', value: '“No Forex Trading or Cryptocurrency licenses are issued”', from: 'svg' },
    { label: 'octafx.com today', value: 'HTTP 410 Gone', from: 'cy-reg' },
  ],

  open: [
    'The score model has no component for enforcement or prosecution, so none of this moves the number. That '
    + 'is a gap in the published weights and it needs deciding in the open, not quietly.',
    'We have not found CySEC’s own announcement of the 25 August 2025 decision, only reporting of it. The '
    + 'decision is described consistently across several outlets and we would rather cite the document.',
    'What Octa now tells a new client about which entity they are joining is unknown to us: the European '
    + 'domains geo-block our infrastructure and the global site renders client-side.',
  ],

  sources: [
    {
      id: 'ed-oct',
      publisher: 'Directorate of Enforcement, Government of India',
      title: 'Press release: provisional attachment order, OctaFX — 17 October 2025',
      url: 'https://www.enforcementdirectorate.gov.in/media/press-release-documents/a490dca5-edac-400a-b916-0d73fe571ee6_Press%20Release-%20PAO%20OctaFX%20-17.10.2025%204.pdf',
      published: '2025-10-17',
      read: '2026-09-16',
      kind: 'regulator',
    },
    {
      id: 'cy-reg',
      publisher: 'Cyprus Securities and Exchange Commission',
      title: 'Register of Cyprus Investment Firms — Octa Markets Cyprus Ltd, licence 372/18',
      url: 'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/81668/',
      read: '2026-09-16',
      kind: 'register',
    },
    {
      id: 'cy-mail',
      publisher: 'Cyprus Mail',
      title: 'CySEC orders liquidation of fund, restricts shareholder voting rights',
      url: 'https://cyprus-mail.com/2025/09/04/cysec-orders-liquidation-of-fund-restricts-shareholder-voting-rights',
      published: '2025-09-04',
      read: '2026-09-16',
      kind: 'press',
    },
    {
      id: 'svg',
      publisher: 'Financial Services Authority and Financial Intelligence Unit, St Vincent and the Grenadines',
      title: 'Advisory: foreign exchange (forex) trading and cryptocurrency offerings',
      url: 'https://svgfiu.com/images/pdf/PressReleases/ADVISORY.pdf',
      read: '2026-09-16',
      kind: 'regulator',
    },
  ],
};

const XM: BrokerProfile = {
  slug: 'xm',
  checked: '2026-09-16',
  verdict:
    'XM’s British company says in its own filed accounts that it "acts as the counterparty to all trades '
    + 'entered into by its clients" — it takes the other side, which is a different business from the ones that '
    + 'hedge. It also lost money in 2024, its net assets nearly halved, and the parent put £1.1m in over the '
    + 'following quarter. And in Britain and Australia the group does not trade as XM at all.',

  sections: [
    {
      heading: 'It is the counterparty to your trade, and it says so',
      paragraphs: [
        'Most brokers are vague about whether they take the other side of your position. XM’s British subsidiary '
        + 'is not, because a filed account has to be. The 2024 strategic report of Trading.com Markets UK Limited '
        + 'says the company "enables retail customers to trade global over-the-counter CFDs" and then, flatly: '
        + '"The Company acts as the counterparty to all trades entered into by its clients" [ch-uk]. The FCA '
        + 'permission matches — it is authorised to deal in investments as principal [fca].',

        'That is worth understanding rather than being alarmed by. Somebody has to be on the other side of a CFD, '
        + 'and a broker doing it itself is normal and legal. It is simply a different arrangement from '
        + 'Pepperstone’s British company, whose accounts say its licence "does not allow it to take on any '
        + 'market risk", or Eightcap’s, which says it hedges "on a back-to-back basis with our liquidity '
        + 'provider". Three British companies, three filings, three different answers to the same question. None '
        + 'of them puts it on the marketing page.',

        'What it means in practice is that the firm’s revenue and your losses are not unrelated. That does not '
        + 'make it dishonest and it does make it a thing to know, and it is the reason this section is first.',
      ],
    },

    {
      heading: 'The British arm is small and had a bad year',
      paragraphs: [
        'Revenue rose to £1,843,567 from £1,448,366, which sounds like growth until you read what the directors '
        + 'attribute it to: "mainly ... the increase of payroll recharges to an affiliate entity" [ch-uk]. The '
        + 'company also earns commission from the Cyprus entity based on its clients’ trading volume, so its '
        + 'income is substantially internal.',

        'Net assets went the other way, down to £1,046,948 from £2,028,066, "due to the losses incurred during '
        + 'the year". The accounts then say that in January and March 2025 the directors agreed to issue 1,100,000 '
        + 'new £1 shares for cash, taken up by the sole shareholder, and that "Management remains vigilant on the '
        + 'cash position of the Company on a regular basis to ensure that it has the liquidity to operate" '
        + '[ch-uk].',

        'A parent recapitalising a subsidiary is ordinary corporate housekeeping and the company is above its '
        + 'regulatory capital. It is still a smaller and thinner balance sheet than the British arms of the '
        + 'brokers ranked above it, and the sentence about remaining vigilant on cash is not one you find in all '
        + 'of them.',
      ],
    },

    {
      heading: 'Search XM in London and you will not find XM',
      paragraphs: [
        'The group runs two brands. XM is the Cyprus and Belize business — the one with the education programme, '
        + 'the lowest entry price here and most of the world’s clients. In Britain and Australia the same group trades as '
        + 'Trading.com, and the companies were renamed to match: Trading Point of Financial Instruments UK '
        + 'Limited became Trading.com Markets UK Limited on 7 January 2025 [ch-uk], and the Australian licence '
        + 'holder went the same way.',

        'So the FCA and ASIC licences in XM’s marketing are real, and a British or Australian reader who follows '
        + 'them arrives at a differently branded site. That is legitimate segmentation and it is also the kind of '
        + 'thing that makes a licence look more available than it is. The entity map on this page now carries all '
        + 'seven companies, including the four — UK, Dubai, South Africa and Mauritius — that were missing from '
        + 'it entirely.',
      ],
    },

    {
      heading: 'The one number we could not confirm',
      paragraphs: [
        'Everyone outside Europe, Britain, Australia, the Emirates and South Africa is a client of XM Global '
        + 'Limited in Belize. That is the entity that matters most here, and its licence number is the one thing '
        + 'on this record nobody has been able to verify.',

        'Four different numbers circulate. This record carries 000261/397; review sites publish 000261/106, '
        + '000261/309 and 000261/4 for the same company, and a separate registration number under the Securities '
        + 'Industry Act 2021 is quoted as 8557558. They cannot all be right, and the fact that four sites quote '
        + 'four numbers with equal confidence is a fair summary of how much checking went into any of them.',

        'The register exists. Belize’s Financial Services Commission publishes one, and it is an application '
        + 'rather than a page: its form-definition endpoint answers and the endpoint that returns the rows is not '
        + 'documented. We have added it to the list of registers this site cannot read, next to the FCA, '
        + 'Mauritius and the NFA, so the verification panel on this page says "unchecked" rather than implying '
        + 'otherwise.',

        'XM’s own site would settle it, and XM’s own site returns 403 to our infrastructure on every path we '
        + 'tried — the second broker in this directory to do that, after Exness.',
      ],
    },

    {
      heading: 'What is not on the record against it',
      paragraphs: [
        'There is one old enforcement action and it is not in this page’s register of them. In 2013 CySEC fined '
        + 'Trading Point €5,000 over client-funds and anti-money-laundering compliance, noting that the firm had '
        + 'never been fined before; the company said it had cooperated and remediated [fm-2013]. Thirteen years '
        + 'and one rebrand ago, at a sum that would not cover a week of the marketing budget.',

        'It is mentioned here and deliberately kept out of the "on the record" block, which is for things that '
        + 'would change a reader’s mind. A directory that lists every historic infraction forever gives a reader '
        + 'no way to tell a €5,000 housekeeping fine in 2013 from a live prosecution in 2025, and the second of '
        + 'those is on another page in this directory.',

        'Beyond that we found nothing: no current regulatory action, no litigation, no warning list entry. As '
        + 'always, "we found nothing" is weaker than "there is nothing", and it is what we are able to say.',
      ],
    },
  ],

  facts: [
    { label: 'UK entity, its role in your trade', value: 'Counterparty to all client trades', from: 'ch-uk' },
    { label: 'UK entity, net assets 2024', value: '£1,046,948 (2023: £2,028,066)', from: 'ch-uk' },
    { label: 'UK entity, revenue 2024', value: '£1,843,567, largely payroll recharges to an affiliate', from: 'ch-uk' },
    { label: 'Capital injected, Q1 2025', value: '1,100,000 new £1 shares, taken by the sole shareholder', from: 'ch-uk' },
    { label: 'UK company renamed', value: 'To Trading.com Markets UK Limited, 7 January 2025', from: 'ch-uk' },
    { label: 'Group parent', value: 'Trading Point Holdings Limited', from: 'ch-uk' },
    { label: 'FCA permission', value: 'Deal as principal, hold client money — firm reference 705428', from: 'fca' },
    { label: 'CySEC register, licence 120/10', value: 'Trading Point of Financial Instruments Ltd, active', from: 'cysec' },
    { label: 'ASIC register, AFS licence 443670', value: 'Trading.com Markets Pty Ltd, active', from: 'cysec' },
    { label: 'Belize licence number', value: 'Unconfirmed — four different numbers circulate', from: 'bz' },
  ],

  open: [
    'The Belize licence number is unverified and the register cannot be read from here. Until it can, the '
    + 'number on this page is the best of four candidates rather than a fact.',
    'The counterparty disclosure is the British company’s. Whether the Cyprus and Belize entities run the same '
    + 'book is not disclosed anywhere we found, and this record still describes execution as market rather than '
    + 'dealing-desk on that basis. One filing about one subsidiary is not enough to change the field.',
    'Whether XM still onboards UK and Australian clients under the XM brand at all, or only through Trading.com, '
    + 'is not something either register answers.',
  ],

  sources: [
    {
      id: 'ch-uk',
      publisher: 'Companies House',
      title: 'Trading.com Markets UK Limited — full accounts for the year ended 31 December 2024, company 09436004',
      url: 'https://find-and-update.company-information.service.gov.uk/company/09436004/filing-history',
      published: '2025-10-01',
      read: '2026-09-16',
      kind: 'filing',
    },
    {
      id: 'cysec',
      publisher: 'CySEC and ASIC',
      title: 'Register of Cyprus Investment Firms (120/10) and the AFS licensee register (443670)',
      url: 'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/',
      read: '2026-09-16',
      kind: 'register',
    },
    {
      id: 'fca',
      publisher: 'Financial Conduct Authority',
      title: 'Financial Services Register — Trading.com Markets UK Limited, firm reference 705428',
      url: 'https://register.fca.org.uk/',
      read: '2026-09-16',
      kind: 'register',
    },
    {
      id: 'bz',
      publisher: 'Financial Services Commission, Belize',
      title: 'Public register of licensees',
      url: 'https://licensys.belizefsc.org.bz/#/publicSearch',
      read: '2026-09-16',
      kind: 'register',
    },
    {
      id: 'fm-2013',
      publisher: 'Finance Magnates',
      title: 'CySEC fines Trading Point €5,000 for infringement of client funds regulations',
      url: 'https://www.financemagnates.com/forex/regulation/cysec-flexes-its-muscles-fines-trading-point-e5000-for-infringement-of-client-funds-regulations/',
      read: '2026-09-16',
      kind: 'press',
    },
  ],
};

const FXTM: BrokerProfile = {
  slug: 'fxtm',
  checked: '2026-09-16',
  verdict:
    'FXTM’s FCA-regulated company opened 476 accounts in the whole of 2024, and 79 of them were ever funded. '
    + 'It held £362,292 of client money at the year end. The group also handed back its European licence '
    + 'outright — renounced it, and CySEC withdrew it in May 2024. This is a broker that left the regulated '
    + 'markets on purpose and kept the badges.',

  sections: [
    {
      heading: 'It gave the European licence back',
      paragraphs: [
        'Every other broker in this directory holds its tier-1 licences and routes the rest of the world '
        + 'offshore. FXTM did something none of the others did: it stopped.',

        'Forextime Ltd stopped serving EU retail clients in February 2021, ceased Cypriot operations on 31 '
        + 'December 2023, formally renounced its CIF authorisation, and CySEC withdrew licence 185/12 with '
        + 'effect from 20 May 2024 [fm-cysec]. The group’s chief commercial officer said so plainly at the '
        + 'time: "We haven’t targeted clients in Europe for a number of years through any of our brands, and we '
        + 'don’t expect to focus on European audiences as we look forward. As a result we took the decision not '
        + 'to maintain a retail licence under CYSEC" [fm-cysec].',

        'It is worth being clear about what that is and is not. It is not an enforcement action and it is not '
        + 'on this page’s record of those, because nobody acted against the firm — it resigned. A company deciding '
        + 'Europe is not its market and giving up the licence rather than keeping a dormant one is arguably more '
        + 'honest than the alternative, which is on another page in this directory.',

        'What it means for a reader is simple: whatever FXTM’s marketing shows, there is no European entity '
        + 'behind it any more, and there has not been for years.',
      ],
    },

    {
      heading: 'The British company, by its own numbers',
      paragraphs: [
        'Exinity UK Limited still holds FCA authorisation 777911, and it is the reason this broker scores a '
        + 'ten on regulation. Its accounts describe a matched principal broker in the retail CFD markets whose '
        + 'revenue comes from commissions and service charges paid by Exinity Limited in Mauritius, "as all '
        + 'client trades of the Company are matched with Exinity Limited in its capacity as the Company’s '
        + 'liquidity provider" [ch-uk].',

        'Then the numbers, which are the most interesting thing on this page. "In 2024 the Company opened 476 '
        + '(2023: 347) new accounts, of which 79 (2023: 190) had received funds deposited by clients before the '
        + 'end of the year" [ch-uk]. Seventy-nine funded accounts in a year, down from a hundred and ninety. '
        + 'Segregated client funds at 31 December 2024: £362,292, against £596,446 a year earlier [ch-uk].',

        'For scale, Pepperstone’s British company held £26.2m of client money at its year end. FXTM’s holds '
        + 'about one seventieth of that. The company is profitable, well capitalised and doing exactly what it '
        + 'says; it is simply very small, and it is what the FCA badge on the marketing refers to.',

        'This is not a criticism of the firm so much as an argument about the badge. A tier-1 licence tells you '
        + 'a regulator supervises a company. It does not tell you that the company is where your money would '
        + 'go, and on this record that gap is a factor of seventy.',
      ],
    },

    {
      heading: 'Where the business actually is',
      paragraphs: [
        'Mauritius. Exinity Limited, company C119470 C1/GBL, holds an investment dealer licence from the '
        + 'Financial Services Commission there and takes every client the other entities do not [fxtm-legal]. '
        + 'The same company holds South Africa’s FSCA licence as an over-the-counter derivative provider, which '
        + 'is why the entity map shows one legal name against two jurisdictions — that is correct rather than a '
        + 'duplicate.',

        'Two entities were missing from this page entirely and one of them is tier-1: the British company '
        + 'above, and Exinity Capital East Africa Ltd, licensed by Kenya’s Capital Markets Authority as a '
        + 'non-dealing online foreign exchange broker [fxtm-legal]. Kenya has been added to the regulator table '
        + 'for it, at tier B — a statutory regulator with a named licence category for this business and no '
        + 'compensation scheme, the same shape as South Africa and Dubai.',

        'The group says its focus is Kenya, South Africa and Mauritius, and the licences match the statement. '
        + 'That is a coherent business. It is a different business from the one a reader in Europe or Britain '
        + 'thinks they are looking at.',
      ],
    },

    {
      heading: 'What we searched for and did not find',
      paragraphs: [
        'No enforcement action against FXTM, Forextime or Exinity turned up in any register or outlet we '
        + 'checked — no fine, no restriction, no warning list entry, no litigation. The conduct component on '
        + 'this page therefore scores ten, and it means "a person looked on 16 September 2026 and found '
        + 'nothing", not "there is nothing".',

        'One number we could not settle: a review desk publishes 46614 as the South African licence where the '
        + 'group’s own documents and this record say 50320. We have no reader for the FSCA register, so it '
        + 'stays as it is with the disagreement noted.',
      ],
    },
  ],

  facts: [
    { label: 'UK entity, new accounts opened in 2024', value: '476 (2023: 347)', from: 'ch-uk' },
    { label: 'UK entity, of those ever funded', value: '79 (2023: 190)', from: 'ch-uk' },
    { label: 'UK entity, segregated client funds', value: '£362,292 (2023: £596,446)', from: 'ch-uk' },
    { label: 'UK entity, revenue 2024', value: '£1,784,690 (2023: £2,073,649)', from: 'ch-uk' },
    { label: 'UK entity, net assets', value: '£5,766,762', from: 'ch-uk' },
    { label: 'UK entity, execution model', value: 'Matched principal, hedged with the Mauritius company', from: 'ch-uk' },
    { label: 'CySEC licence 185/12', value: 'Withdrawn 20 May 2024 after the firm renounced it', from: 'fm-cysec' },
    { label: 'Stopped serving EU retail clients', value: 'February 2021', from: 'fm-cysec' },
    { label: 'Mauritius company', value: 'Exinity Limited, C119470 C1/GBL', from: 'fxtm-legal' },
    { label: 'Enforcement actions found', value: 'None, searched 16 September 2026', from: 'fm-cysec' },
  ],

  open: [
    'The FSCA licence number is published as 50320 by the group and as 46614 by at least one review desk. We '
    + 'have no reader for the South African register and have kept the group’s own figure.',
    'Whether the British company still opens accounts at the rate its 2024 accounts describe is a question the '
    + 'next filing answers, and it is the number to watch on this broker.',
    'Mauritius is on the list of registers this site cannot read, so the licence that covers most of FXTM’s '
    + 'clients has not been checked against its regulator by anyone here.',
  ],

  sources: [
    {
      id: 'ch-uk',
      publisher: 'Companies House',
      title: 'Exinity UK Limited — full accounts for the year ended 31 December 2024, company 10599136',
      url: 'https://find-and-update.company-information.service.gov.uk/company/10599136/filing-history',
      published: '2025-04-30',
      read: '2026-09-16',
      kind: 'filing',
    },
    {
      id: 'fm-cysec',
      publisher: 'Finance Magnates',
      title: 'CySEC withdraws FXTM’s CIF authorisation following renunciation',
      url: 'https://www.financemagnates.com/forex/cysec-withdraws-fxtms-cif-authorisation-following-renunciation/',
      published: '2024-05-24',
      read: '2026-09-16',
      kind: 'press',
    },
    {
      id: 'fxtm-legal',
      publisher: 'FXTM',
      title: 'Licensing and regulation',
      url: 'https://www.forextime.com/policies-regulation/license-broker',
      read: '2026-09-16',
      kind: 'broker',
    },
  ],
};

export const PROFILES: BrokerProfile[] = [EXNESS, IC_MARKETS, PEPPERSTONE, EIGHTCAP, OCTA, XM, FXTM];

export const profileFor = (slug: string) => PROFILES.find((p) => p.slug === slug);

/** Every source id a profile's prose actually cites, in order of appearance. */
const CITE = /\[([a-z0-9-]+)\]/g;

export function profileCitations(p: BrokerProfile): string[] {
  const out: string[] = [];
  for (const line of p.sections.flatMap((s) => s.paragraphs)) {
    for (const [, id] of line.matchAll(CITE)) if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

export function profileWordCount(p: BrokerProfile): number {
  return [p.verdict, ...p.sections.flatMap((s) => [s.heading, ...s.paragraphs])]
    .join(' ')
    .replace(CITE, '')
    .split(/\s+/)
    .filter(Boolean).length;
}
