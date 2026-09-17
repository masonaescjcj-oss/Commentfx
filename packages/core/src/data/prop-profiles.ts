
/**
 * The hand-researched layer for prop firms.
 *
 * It exists for the same reason the broker one does and answers a harder
 * question. A broker can be checked against a register: a regulator publishes a
 * licence number, and either the company is on it or it is not. A prop firm has
 * no licence anywhere, by design — it sells a simulation, not a financial
 * service — so there is no register to check and no regulator to ask. What is
 * left is what the firm writes down about itself and what a company registry
 * says about the companies it names. That is thinner evidence than a broker
 * page has, and the way to be honest about it is to cite it precisely and say
 * where it ran out.
 *
 * The rules are the ones the broker profiles follow, because they are what make
 * the prose safe to publish beside generated figures:
 *
 * 1. **Nothing here restates a number the record holds.** The profit target,
 *    the drawdown, the split and the fee are rendered from the record. A
 *    sentence repeating them is a second copy that goes stale first.
 * 2. **Every claim carries a source id, and every source carries the date we
 *    read it.** `prop-profiles.test.ts` fails the build on a citation with no
 *    source, a source with no date, or a section that cites nothing.
 *
 * One pattern ran through all eight and is worth naming here rather than eight
 * times below: where a figure has a range, the record had the good end of it.
 * FTMO's 90% split is a ceiling four months away; The5%ers' 100% is the top of
 * a ladder that starts at 80; Alpha Capital's "no minimum trading days" was not
 * a rule the firm has. None of that is a lie by the firms — every one of them
 * publishes the real terms on its own site. It is what happens when a record is
 * seeded from marketing and never read back against the source.
 */

import type { ResearchProfile } from './research.ts';
export type { ResearchFact as PropFact, ResearchSection as PropSection } from './research.ts';

/** A prop firm's researched record. The shape is shared; see research.ts. */
export type PropProfile = ResearchProfile;

/* ── FTMO ─────────────────────────────────────────────────────────────────── */

const FTMO: PropProfile = {
  slug: 'ftmo',
  checked: '2026-09-17',
  originReadable: true,
  verdict:
    'The oldest and plainest firm here: one Czech company, named in its own terms, on the state '
    + 'register since 2014, with rules that do what they say. Two things on this page were wrong '
    + 'and both flattered it — the split it pays a newly funded trader is 80, not 90, and the '
    + 'company is a year older than we said.',

  sections: [
    {
      heading: 'One company, and you can look it up',
      paragraphs: [
        'FTMO contracts through FTMO s.r.o., and unusually for this industry that is the whole '
        + 'list. The Czech state business register carries it under IČO 03136752 at Purkyňova '
        + '2121/3, Nové Město, Prague 1, as a společnost s ručením omezeným, with a date of '
        + 'formation of 24 June 2014 [ares]. Our record said the firm was founded in 2015. The '
        + 'register is the document and the register says 2014.',

        'That matters more than a year. Every other firm in this directory routes some part of the '
        + 'arrangement through a second or third company, often somewhere with no register a reader '
        + 'can search. FTMO names one company, in an EU member state, whose registration anybody '
        + 'can pull up in a browser in about twenty seconds. The entity map above is short because '
        + 'there is nothing else in it.',
      ],
    },

    {
      heading: 'What you are buying, in the firm’s own words',
      paragraphs: [
        'It is worth quoting because it is the sentence the whole category rests on and most firms '
        + 'bury it. FTMO puts it in its FAQ: "all accounts we provide to our clients are demo '
        + 'accounts with fictitious funds and any trading is in a simulated environment only" '
        + '[ftmo-faq]. There is no money in the market. There is a simulation, a set of rules, and '
        + 'a contract that says the firm will pay you a share of what the simulation says you '
        + 'earned.',

        'That is not a criticism and it is not a loophole — it is the product, and it is why no '
        + 'regulator licenses it. It does decide what a bad outcome looks like. If a broker refuses '
        + 'a withdrawal you have a regulator to complain to; if a prop firm refuses a payout you '
        + 'have a contract with a company in whatever country it is registered in, and that is the '
        + 'whole of it. Knowing which country is not a detail.',
      ],
    },

    {
      heading: 'The split, and the four months behind it',
      paragraphs: [
        'FTMO’s Scaling Plan sets out what it takes to reach the higher reward share: a minimum of '
        + 'four months trading as an FTMO Trader since the last scale-up, at least 10% net '
        + 'simulated profit above the starting balance generated within those four months, at least '
        + 'two processed rewards in the same period, and a positive balance at the moment of '
        + 'scale-up [scaling]. Meet all four and the share goes to 90%, on the 2-step programme '
        + 'only.',

        'So 90% is real, and it is a state a trader reaches after four consecutive profitable '
        + 'months, not the state they start in. Publishing it as the split — which this page did — '
        + 'described the best outcome in the programme as the ordinary one. The record now carries '
        + 'what a newly funded trader is actually paid, and the route to the higher number is this '
        + 'paragraph rather than a figure in a table.',

        'The same care applies to the rules above. FTMO sells two programmes, and they are not '
        + 'variations of each other: the 2-step carries a static maximum loss, no consistency rule '
        + 'and a 4-day minimum, while the 1-step carries an end-of-day trailing limit that "can '
        + 'only increase, but never decrease" and a best-day rule capping any single day at 50% of '
        + 'the profitable days’ total [ftmo-rules]. The record scores the 2-step and says so. A '
        + 'directory that quietly scored whichever product tested better would be advertising.',
      ],
    },
  ],

  facts: [
    { label: 'Legal entity', value: 'FTMO s.r.o., IČO 03136752', from: 'ares' },
    { label: 'Registered office', value: 'Purkyňova 2121/3, Nové Město, 110 00 Praha 1', from: 'ares' },
    { label: 'Date of formation on the state register', value: '24 June 2014', from: 'ares' },
    { label: 'Legal form', value: 'Společnost s ručením omezeným', from: 'ares' },
    { label: 'Scaling Plan: months required for the higher share', value: '4, since the last scale-up', from: 'scaling' },
    { label: 'Scaling Plan: net profit required', value: '10% above the starting balance', from: 'scaling' },
    { label: 'Account type', value: 'Demo accounts with fictitious funds', from: 'ftmo-faq' },
  ],

  open: [
    'FTMO publishes no audited accounts anywhere we can find, so its size, its payout ratio and '
    + 'whether it can meet a bad month are not checkable by anyone outside it. That is true of every '
    + 'firm on this list and it is worth saying once.',
    'The 1-step programme is a materially different product scored nowhere on this site. Somebody '
    + 'should decide whether it deserves its own record rather than a paragraph.',
  ],

  sources: [
    {
      id: 'ares',
      publisher: 'Ministry of Finance of the Czech Republic',
      title: 'ARES — register of economic subjects, FTMO s.r.o., IČO 03136752',
      url: 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/03136752',
      read: '2026-09-17',
      kind: 'register',
    },
    {
      id: 'ftmo-rules',
      publisher: 'FTMO',
      title: 'Trading objectives — the 1-step and 2-step programmes',
      url: 'https://ftmo.com/en/trading-objectives/',
      read: '2026-09-17',
      kind: 'broker',
    },
    {
      id: 'scaling',
      publisher: 'FTMO',
      title: 'Scaling plan',
      url: 'https://ftmo.com/en/scaling-plan/',
      read: '2026-09-17',
      kind: 'broker',
    },
    {
      id: 'ftmo-faq',
      publisher: 'FTMO',
      title: 'Frequently asked questions',
      url: 'https://ftmo.com/en/faq/',
      read: '2026-09-17',
      kind: 'broker',
    },
  ],
};

/* ── Alpha Capital Group ──────────────────────────────────────────────────── */

const ALPHA: PropProfile = {
  slug: 'alpha-capital-group',
  checked: '2026-09-17',
  originReadable: false,
  verdict:
    'A real British company, filed at Companies House as an IT services business, selling trading '
    + 'evaluations. Three fields on this page were wrong and every one of them made the firm look '
    + 'easier than it is: there is a minimum number of trading days, there is a consistency rule, '
    + 'and the split is 80.',

  sections: [
    {
      heading: 'What the filing says it does',
      paragraphs: [
        'Alpha Capital Group Limited is company 13719951 in England and Wales, incorporated on 2 '
        + 'November 2021, registered office at 1 Allied Business Centre, Coldharbour Lane, '
        + 'Harpenden, AL5 4UT, and its accounts are made up to 31 March [ch-alpha]. So far, so '
        + 'ordinary — and more than most of this list offers, because a British company number is '
        + 'searchable by anybody, its officers are named, and its accounts are due on a schedule '
        + 'somebody else enforces.',

        'The interesting line is the classification. The company is filed under SIC 62090, "other '
        + 'information technology service activities" [ch-alpha]. Not financial services, not fund '
        + 'management, not investment activities. That is not an accusation of anything: selling '
        + 'access to a simulated trading platform genuinely is an IT service, and choosing a '
        + 'financial SIC code would arguably be the misleading choice. It is worth a reader knowing '
        + 'because it is the clearest statement anywhere of what the company believes it is, and it '
        + 'is filed with the state rather than written in marketing.',

        'The group also runs ACG Markets, a brokerage licensed in the Seychelles since late 2023. '
        + 'That is a separate company doing a regulated thing, and it is not the company selling '
        + 'the evaluation. A reader who sees "regulated" attached to the Alpha Capital name should '
        + 'know which half of the group it attaches to, which is the same point this site makes '
        + 'about brokers on every page.',
      ],
    },

    {
      heading: 'Three rules we had wrong',
      paragraphs: [
        'Our record said the firm required no minimum trading days, and the page said so in its '
        + 'one-line summary: "no minimum trading days — a fast pass is possible". The firm’s own '
        + 'rules require a minimum of three trading days in each phase, on every programme except '
        + 'Alpha One, which requires one [alpha-rules]. The claim was not a small overstatement; it '
        + 'was the headline, and it was describing a rule that does not exist.',

        'Second, the consistency rule. We recorded none. Alpha Capital applies a best-day rule: no '
        + 'single trading day may account for more than 40% of the total profit generated '
        + '[alpha-rules]. That is among the tighter versions in this directory — Topstep’s '
        + 'equivalent sits at 55% — and it is exactly the rule that catches a trader who passes on '
        + 'one good session, which is how a lot of people pass.',

        'Third, the split. 80%, not the 90 we published [alpha-rules]. Three errors, one direction. '
        + 'That is the thing worth noticing: mistakes in a record are not random, because a record '
        + 'seeded from a firm’s own promotional pages inherits the shape of promotion.',
      ],
    },
  ],

  facts: [
    { label: 'Legal entity', value: 'Alpha Capital Group Limited, company 13719951', from: 'ch-alpha' },
    { label: 'Incorporated', value: '2 November 2021', from: 'ch-alpha' },
    { label: 'Registered office', value: '1 Allied Business Centre, Coldharbour Lane, Harpenden, AL5 4UT', from: 'ch-alpha' },
    { label: 'Filed under SIC code', value: '62090 — other information technology service activities', from: 'ch-alpha' },
    { label: 'Best-day rule', value: 'No single day above 40% of total profit', from: 'alpha-rules' },
    { label: 'Minimum trading days per phase', value: '3, except Alpha One', from: 'alpha-rules' },
  ],

  open: [
    'The accounts filed to 31 March 2025 were not read for this note — only the company record. '
    + 'Somebody should pull them: turnover and reserves would say more about whether this firm can '
    + 'pay a good month than any rule on the page.',
    'The relationship between Alpha Capital Group Limited and ACG Markets Ltd is described on the '
    + 'firm’s site and not in any filing we read. Which company holds a funded trader’s agreement is '
    + 'not settled here.',
  ],

  sources: [
    {
      id: 'ch-alpha',
      publisher: 'Companies House',
      title: 'Alpha Capital Group Limited — company record, company number 13719951',
      url: 'https://find-and-update.company-information.service.gov.uk/company/13719951',
      read: '2026-09-17',
      kind: 'filing',
    },
    {
      id: 'alpha-rules',
      publisher: 'Alpha Capital Group',
      title: 'Alpha Capital rules explained: drawdown, profit targets, daily loss and evaluation rules',
      url: 'https://alphacapitalgroup.uk/posts/alpha-capital-rules-explained-drawdown-profit-targets-daily-loss-and-evaluation-rules-2026',
      read: '2026-09-17',
      kind: 'broker',
    },
  ],
};

/* ── The5%ers ─────────────────────────────────────────────────────────────── */

const THE5ERS: PropProfile = {
  slug: 'the5ers',
  checked: '2026-09-17',
  originReadable: true,
  verdict:
    'Every rule figure on this page was wrong, and the loudest claim on it — a 100% profit split — '
    + 'was the top of a ladder that starts at 80. The company behind it is real, named in its own '
    + 'terms twice, and filed at Companies House as a human resources business.',

  sections: [
    {
      heading: 'One company, two registrations, and a curious SIC code',
      paragraphs: [
        'The5%ers names itself plainly, which is more than most: Five Percent Online Ltd, registered '
        + 'in England and Wales as 12553363 and in Israel as 515864007, with addresses in London and '
        + 'Raanana [t5-terms]. The English company is on the register as active, incorporated 9 '
        + 'April 2020, at Enstar House, 168 Praed Street, London W2 1RH, with accounts made up to 31 '
        + 'December 2024 [ch-t5].',

        'Its filed classification is SIC 78300: "human resources provision and management of human '
        + 'resources functions" [ch-t5]. A prop firm registered as a recruitment business. As with '
        + 'Alpha Capital’s IT code there is a defensible reading — a firm whose business is finding '
        + 'and selecting traders is arguably doing exactly that — and it is still the kind of thing '
        + 'a reader is entitled to know before deciding how this company thinks of itself.',
      ],
    },

    {
      heading: 'The numbers this page had, and the numbers the firm publishes',
      paragraphs: [
        'The5%ers sells four programmes and they differ sharply. High Stakes is the two-step '
        + 'flagship: 8% in step one, 5% in step two, a 5% daily loss that terminates the account, '
        + '10% overall, three profitable days per step where a profitable day means at least 0.5% '
        + 'on closed positions, and unlimited time [t5-programs]. Hyper Growth is one step at 10% '
        + 'with a 6% stop-out and a daily loss that pauses rather than terminates; Bootcamp is '
        + 'three steps at 6% each; Pro Growth is one step at 10% [t5-programs].',

        'Our record carried a 6% target, a 4% daily loss and a 6% maximum. That is not any of them. '
        + 'It reads like Hyper Growth’s stop-out bolted onto a target from somewhere else, and the '
        + 'page then labelled it a two-step. The figures now describe High Stakes, and the page says '
        + 'which programme it is scoring.',

        'The split is the one worth dwelling on, because it was the whole headline. This page said '
        + '100%. The5%ers does pay 100% — at the top of a progression that begins at 80% on funding '
        + 'and rises with performance [t5-programs]. The difference between "pays 100%" and "can '
        + 'eventually pay 100%" is the difference between a fact and an advertisement, and we were '
        + 'printing the advertisement.',
      ],
    },

    {
      heading: 'The news rule, stated precisely',
      paragraphs: [
        'Our record marks news trading as not allowed, which is the right answer to the question a '
        + 'trader is asking and a blunt version of the rule. What the terms say is narrower and '
        + 'worth quoting: "Executing orders 2 minutes before until 2 minutes after high-impact news '
        + 'is prohibited", with profits made in that window deducted and losses left with the '
        + 'trader [t5-highstakes]. A separate clause prohibits bracketing — pending buy and sell '
        + 'stops placed around the price before a release [t5-terms].',

        'Four minutes is not a ban on trading the news in the abstract. It is a ban on the only four '
        + 'minutes a news trader cares about, and the asymmetry in the penalty — they keep your '
        + 'gains, you keep your losses — is the part most summaries leave out. Accounts also expire '
        + 'after 30 consecutive days of inactivity in evaluation, 60 when funded [t5-highstakes].',
      ],
    },
  ],

  facts: [
    { label: 'Legal entity', value: 'Five Percent Online Ltd', from: 't5-terms' },
    { label: 'England and Wales company number', value: '12553363, incorporated 9 April 2020', from: 'ch-t5' },
    { label: 'Israeli company number', value: '515864007', from: 't5-terms' },
    { label: 'Filed under SIC code', value: '78300 — human resources provision', from: 'ch-t5' },
    { label: 'Profit split at funding', value: '80%, rising with performance', from: 't5-programs' },
    { label: 'High-impact news blackout', value: '2 minutes before to 2 minutes after', from: 't5-highstakes' },
    { label: 'Inactivity expiry', value: '30 days in evaluation, 60 days funded', from: 't5-highstakes' },
  ],

  open: [
    'What performance takes a trader from 80% to 100% is described as a progression and not, '
    + 'anywhere we read, as a specific threshold. Until it is, the higher number cannot be checked '
    + 'by anyone.',
    'Which of the two Five Percent Online registrations contracts with a trader is not stated in the '
    + 'terms we read. They are named together; the obligations are not split out.',
  ],

  sources: [
    {
      id: 'ch-t5',
      publisher: 'Companies House',
      title: 'Five Percent Online Ltd — company record, company number 12553363',
      url: 'https://find-and-update.company-information.service.gov.uk/company/12553363',
      read: '2026-09-17',
      kind: 'filing',
    },
    {
      id: 't5-terms',
      publisher: 'The5%ers',
      title: 'Terms and conditions',
      url: 'https://the5ers.com/terms-and-conditions/',
      read: '2026-09-17',
      kind: 'broker',
    },
    {
      id: 't5-programs',
      publisher: 'The5%ers',
      title: 'Challenge programs — Bootcamp, High Stakes, Hyper Growth and Pro Growth explained',
      url: 'https://the5ers.com/challenge-programs-bootcamp-high-stakes-hyper-growth-explained/',
      read: '2026-09-17',
      kind: 'broker',
    },
    {
      id: 't5-highstakes',
      publisher: 'The5%ers',
      title: 'What are the general rules for the High Stakes program?',
      url: 'https://the5ers.com/faqs/what-are-the-general-rules-for-the-high-stakes-program/',
      read: '2026-09-17',
      kind: 'broker',
    },
  ],
};

/* ── FundedNext ───────────────────────────────────────────────────────────── */

const FUNDEDNEXT: PropProfile = {
  slug: 'fundednext',
  checked: '2026-09-17',
  originReadable: true,
  verdict:
    'Four companies in three jurisdictions, and the one that runs your account is registered on an '
    + 'island in the Comoros. The British company — the only one that ever filed under a financial '
    + 'classification — was dissolved in April 2024.',

  sections: [
    {
      heading: 'Where the money goes, and where the account lives',
      paragraphs: [
        'FundedNext markets an address in Ajman and describes itself as operating from the UAE and '
        + 'Bangladesh [fn-help]. Its terms name three live companies doing three different things: '
        + 'GrowthNext – F.Z.E., registration 28831, at the AI Robotics HUB in Ajman Free Zone, which '
        + 'provides the service; FundedNext Ltd, registration HY01023052, at Bonovo Road, Fomboni, '
        + 'Island of Mohéli, Comoros, responsible for operational and technical aspects; and '
        + 'Incenteco Trading Ltd, HE 307114, in Limassol, which handles financial operations '
        + '[fn-terms].',

        'Read that again as a trader rather than a lawyer. You accept terms from a free-zone company '
        + 'in Ajman. Your simulated account is run by a company in the Comoros. Your card is charged '
        + 'by a company in Cyprus. If something goes wrong, the first question is which of those '
        + 'three owes you, and the answer is not on the website.',

        'Mohéli is worth naming precisely, because this site has been here before. The Comoros is '
        + 'where Alpari’s current entity holds a Mwali International Services Authority "licence" '
        + 'that the Banque Centrale des Comores describes as a fictitious structure — the finding '
        + 'that put Alpari near the bottom of the broker ranking. FundedNext holds no licence and '
        + 'claims none, so this is not the same finding. It is the same jurisdiction, chosen for a '
        + 'company that touches every trader on the platform.',
      ],
    },

    {
      heading: 'The split you can buy',
      paragraphs: [
        'This page used to say the split was 95%, which made FundedNext the most generous firm in '
        + 'the directory. On the Stellar 2-Step programme the record describes, a newly funded '
        + 'trader gets 80%, rising to 90% through the Scale-Up programme [fn-split]. The same '
        + 'ceiling-as-headline error the other firms here produced.',

        'The difference is what sits behind the 95. It is not only a performance ladder — it is '
        + 'also sold. FundedNext offers a Lifetime Payout 95% add-on, and buying it adds a further '
        + '20% to the price of an Evaluation or Stellar challenge [fn-split]. So the best number on '
        + 'the firm’s marketing is available to anybody, immediately, for money, and a directory '
        + 'that prints it as the split is quoting a paid upgrade as though it were the terms.',

        'That is worth a reader’s attention beyond this one firm. When a payout share can be '
        + 'purchased, the share stops being a fact about how the firm treats traders and becomes '
        + 'another line on the price list — and comparing it against a firm that does not sell '
        + 'upgrades is comparing two different things.',
      ],
    },

    {
      heading: 'The company that went away',
      paragraphs: [
        'There was a fourth. FundedNext Ltd, company 14492007, was incorporated in England and '
        + 'Wales on 18 November 2022 at 2 Frederick Street, London WC1X 0ND, and dissolved on 30 '
        + 'April 2024 [ch-fn].',

        'Its filed classifications are the reason to mention it: 64205, activities of financial '
        + 'services holding companies; 64910, financial leasing; 64929, other credit granting; '
        + '66300, fund management activities [ch-fn]. Four financial SIC codes, in a jurisdiction '
        + 'with a regulator, gone inside eighteen months — and the operational entity that replaced '
        + 'it sits in a jurisdiction with none. We are not claiming those facts are connected, '
        + 'because nothing we read says so. We are publishing them next to each other because a '
        + 'reader deciding where to send a challenge fee should have them in the same place.',
      ],
    },
  ],

  facts: [
    { label: 'Split on the Stellar 2-Step at funding', value: '80%, rising to 90% through Scale-Up', from: 'fn-split' },
    { label: 'Lifetime 95% payout add-on', value: 'Costs a further 20% of the challenge price', from: 'fn-split' },
    { label: 'Service provider', value: 'GrowthNext – F.Z.E., reg. 28831, Ajman Free Zone', from: 'fn-terms' },
    { label: 'Operational entity', value: 'FundedNext Ltd, HY01023052, Mohéli, Comoros', from: 'fn-terms' },
    { label: 'Financial operations', value: 'Incenteco Trading Ltd, HE 307114, Limassol', from: 'fn-terms' },
    { label: 'Former UK company', value: 'FundedNext Ltd, 14492007, dissolved 30 April 2024', from: 'ch-fn' },
    { label: 'Its filed SIC codes', value: '64205, 64910, 64929, 66300 — all financial', from: 'ch-fn' },
  ],

  open: [
    'The 95% add-on price was read from a secondary account of FundedNext’s pricing, not from a '
    + 'checkout page. The percentage uplift should be confirmed by somebody who can reach one.',
    'The Comoros company’s registration number could not be checked against any register, because '
    + 'no searchable public register of Mwali companies exists that we could reach. The number is '
    + 'the firm’s own.',
    'Whether the Cyprus payments company is connected by ownership to the Ajman one is not stated '
    + 'in the terms. The Cyprus register would answer it and nobody here has pulled the file.',
  ],

  sources: [
    {
      id: 'ch-fn',
      publisher: 'Companies House',
      title: 'FundedNext Ltd — company record, company number 14492007, dissolved',
      url: 'https://find-and-update.company-information.service.gov.uk/company/14492007',
      read: '2026-09-17',
      kind: 'filing',
    },
    {
      id: 'fn-terms',
      publisher: 'FundedNext',
      title: 'Terms of service — the companies providing the service',
      url: 'https://fundednext.com/usa/terms-of-service',
      read: '2026-09-17',
      kind: 'broker',
    },
    {
      id: 'fn-split',
      publisher: 'JP Trading Capital',
      title: 'FundedNext: four models, the 95% split and the Lifetime Payout add-on',
      url: 'https://www.jptradingcapital.com/blog/en/fundednext-prop-firm-review',
      read: '2026-09-17',
      kind: 'press',
    },
    {
      id: 'fn-help',
      publisher: 'FundedNext',
      title: 'Where are you located?',
      url: 'https://help.fundednext.com/en/articles/8016279-where-are-you-located',
      read: '2026-09-17',
      kind: 'broker',
    },
  ],
};

/* ── FundingPips ──────────────────────────────────────────────────────────── */

const FUNDINGPIPS: PropProfile = {
  slug: 'fundingpips',
  checked: '2026-09-17',
  originReadable: false,
  verdict:
    'The second firm in this directory whose simulated accounts are run from the Comoros, behind a '
    + 'Dubai address and a Cyprus support company. Its own terms are clear that nothing trades on a '
    + 'real market, which is more honest than most of the category manages.',

  sections: [
    {
      heading: 'Three companies, and the one that matters is the least visible',
      paragraphs: [
        'FundingPips presents as Dubai. The company a trader contracts with is FP Funding LLC, with '
        + 'its address there; FundingPips Services Ltd, Cyprus company HE 450941, is described as a '
        + 'non-operational support and administrative entity; and the simulated trading services '
        + 'themselves are provided by FundingPips Corp, incorporated in the Union of the Comoros '
        + 'under company number HY01223081 [fp-terms].',

        'That third company is the one running the thing you paid for, and it is the one nobody '
        + 'mentions. It is also the second Comoros registration in this directory — FundedNext’s '
        + 'operational entity is HY01023052, from the same series — which says something about '
        + 'where this industry incorporates when it wants a company and not a regulator.',
      ],
    },

    {
      heading: 'What the terms admit',
      paragraphs: [
        'FundingPips states that all Evaluation, Master and Prime accounts are demo accounts in a '
        + 'simulated environment, that trades are not executed on live financial markets, and that '
        + 'the program fee is a service fee rather than a deposit or an investment [fp-terms]. It '
        + 'also states that the fee is not refundable, because the service is delivered on purchase '
        + '[fp-terms].',

        'Taken together that is an unusually straight description of the product, and a reader '
        + 'should weigh it as a point in the firm’s favour rather than against it. The money is '
        + 'gone when you pay it; what you have bought is access to a simulation and a contractual '
        + 'claim on a share of simulated profit. Every firm here works this way. Not every firm '
        + 'says so in the first paragraph.',
      ],
    },

    {
      heading: 'What we could not read',
      paragraphs: [
        'FundingPips answers our servers with 429 and 403 — rate limiting and a refusal — so no '
        + 'page of its site was read directly by anything of ours. The entity detail above comes '
        + 'from its terms as indexed and quoted elsewhere [fp-terms], which is weaker evidence than '
        + 'a page we fetched ourselves, and the sources list says which is which.',

        'Nothing in this record’s rule figures or fee has therefore been confirmed against the '
        + 'firm’s own live pages on this pass. They remain what the record held, and the '
        + 'verification panel on this page says what has and has not been checked. Where the other '
        + 'seven firms in this directory each had at least one figure corrected against a document, '
        + 'this one was not testable to the same standard, and saying so is more useful than '
        + 'pretending otherwise.',
      ],
    },
  ],

  facts: [
    { label: 'Contracting company', value: 'FP Funding LLC, Dubai', from: 'fp-terms' },
    { label: 'Simulated trading provided by', value: 'FundingPips Corp, Comoros, HY01223081', from: 'fp-terms' },
    { label: 'Support and administration', value: 'FundingPips Services Ltd, Cyprus, HE 450941', from: 'fp-terms' },
    { label: 'Account type', value: 'Demo accounts; trades not executed on live markets', from: 'fp-terms' },
    { label: 'Program fee', value: 'A service fee, non-refundable on purchase', from: 'fp-terms' },
  ],

  open: [
    'Every figure in the rules and cost tables on this page is unconfirmed on this pass, because the '
    + 'firm’s site refuses our requests. A person with a browser should read them and date them.',
    'The Comoros registration number cannot be checked against a public register we can reach, the '
    + 'same limit that applies to FundedNext.',
  ],

  sources: [
    {
      id: 'fp-terms',
      publisher: 'FundingPips',
      title: 'Terms and conditions — the companies providing the service, and the nature of the accounts',
      url: 'https://fundingpips.com/terms-and-conditions',
      read: '2026-09-17',
      kind: 'broker',
    },
  ],
};

/* ── Breakout ─────────────────────────────────────────────────────────────── */

const BREAKOUT: PropProfile = {
  slug: 'breakout',
  checked: '2026-09-17',
  originReadable: false,
  verdict:
    'The only firm here owned by a company this site ranks somewhere else. Kraken completed its '
    + 'acquisition with effect from 1 September 2025, and the funded programme now runs inside '
    + 'Kraken Pro — which changes who stands behind a payout more than any rule on this page does.',

  sections: [
    {
      heading: 'An exchange bought a prop firm',
      paragraphs: [
        'Kraken announced on 4 September 2025 that it had completed the acquisition of Breakout, '
        + 'with the deal effective from 1 September [bw]. The programme has been built into Kraken '
        + 'Pro and is operated by Payward Oceanic Ltd, a Kraken subsidiary; Payward, Inc. is the '
        + 'parent [bw]. Kraken’s own material describes the offer as access to up to $200,000 in '
        + 'live trading capital, keeping over 80% of profits [kraken-faq].',

        'This is the most consequential fact on the page and it is not a trading rule. Every other '
        + 'firm in this directory is a private company of unknown size with no published accounts, '
        + 'and the honest answer to "can they pay me" is that nobody outside knows. Breakout’s '
        + 'counterparty is now a subsidiary of one of the largest crypto exchanges in the world — '
        + 'which this site ranks separately, on solvency, audit and breach history. A reader can '
        + 'go and look at that record. That is a kind of assurance nothing else here offers.',

        'It cuts the other way too. Kraken’s FAQ notes that Kraken clients can reach Breakout’s '
        + 'services but that the accounts "are not directly connected" [kraken-faq], so the exchange '
        + 'relationship a trader has is not the prop relationship. And a programme folded into a '
        + 'larger platform is a programme whose terms can be changed by people whose main business '
        + 'is something else.',
      ],
    },

    {
      heading: 'What is still not pinned down',
      paragraphs: [
        'Breakout’s own site refuses our requests, so its terms were not read directly. Secondary '
        + 'accounts disagree with each other about the corporate detail — a Delaware registration, '
        + 'a Saint Vincent registration numbered 2242 BC 2023, a separate registration number '
        + 'against the same name, and a distinct company said to hold funded trader agreements. We '
        + 'are not publishing a company number we could not verify, so the entity map above carries '
        + 'only the names Kraken’s own announcement supports [bw] and no numbers at all.',

        'The drawdown on this record is intraday trailing, which is the strictest form there is and '
        + 'the reason this firm scores where it does on rules. That figure predates the acquisition '
        + 'and has not been re-read from the current programme. Anyone treating this page as '
        + 'current on rules should check that first.',
      ],
    },
  ],

  facts: [
    { label: 'Acquisition completed', value: 'Announced 4 September 2025, effective 1 September', from: 'bw' },
    { label: 'Acquirer', value: 'Kraken — Payward, Inc.', from: 'bw' },
    { label: 'Operator of the funded programme', value: 'Payward Oceanic Ltd', from: 'bw' },
    { label: 'Capital offered', value: 'Up to $200,000', from: 'kraken-faq' },
    { label: 'Relationship to a Kraken exchange account', value: 'Not directly connected', from: 'kraken-faq' },
  ],

  open: [
    'No company number for Breakout Trading Group, LLC has been confirmed against any register. '
    + 'Sources disagree between Delaware and St Vincent and we are publishing neither.',
    'The rule figures on this page were recorded before Kraken took over and have not been re-read '
    + 'from the current programme.',
  ],

  sources: [
    {
      id: 'bw',
      publisher: 'Kraken, via Business Wire',
      title: 'Kraken completes major acquisition of Breakout to offer prop trading to clients globally',
      url: 'https://www.businesswire.com/news/home/20250904012956/en/Kraken-Completes-Major-Acquisition-of-Breakout-to-Offer-Prop-Trading-to-Clients-Globally',
      published: '2025-09-04',
      read: '2026-09-17',
      kind: 'press',
    },
    {
      id: 'kraken-faq',
      publisher: 'Kraken',
      title: 'Breakout x Kraken FAQ',
      url: 'https://support.kraken.com/articles/breakout-x-kraken-faq',
      read: '2026-09-17',
      kind: 'broker',
    },
  ],
};

/* ── Topstep ──────────────────────────────────────────────────────────────── */

const TOPSTEP: PropProfile = {
  slug: 'topstep',
  checked: '2026-09-17',
  originReadable: true,
  verdict:
    'The oldest programme in this directory and the one that documents itself best. Its rules are '
    + 'harsher than most here and they are written down precisely, which is a better trade than the '
    + 'reverse — and its consistency target is a real obstacle rather than a footnote.',

  sections: [
    {
      heading: 'A consistency rule with arithmetic attached',
      paragraphs: [
        'Most firms in this directory say a consistency rule exists. Topstep publishes the formula. '
        + 'A trader’s single best day of profit must stay at or below 55% of the profit target; if '
        + 'it does not, the target itself rises, and the help centre gives the worked example — on a '
        + '$50,000 account with a $3,000 target, a best day of $1,800 pushes the target to $3,600 '
        + '[ts-consistency]. It states plainly that "55% is a hard line. It is not rounded, and '
        + 'there is no buffer" [ts-consistency].',

        'That is unusual and it is worth crediting. The rule is stricter than it sounds — one good '
        + 'session does not pass a Topstep account, it moves the goalposts — and a trader can work '
        + 'out in advance exactly where the line is. Alpha Capital’s equivalent sits tighter at 40% '
        + 'of total profit; the point is not which number is kinder but that both are knowable '
        + 'before you pay.',
      ],
    },

    {
      heading: 'How the limits move',
      paragraphs: [
        'Two mechanisms, and they work in opposite directions. The maximum loss limit on a standard '
        + 'Trading Combine trails the end-of-day closing balance rather than an intraday peak, which '
        + 'is the gentler of the two trailing designs — an unrealised spike during the session does '
        + 'not permanently raise the floor [ts-eod]. The daily loss limit is fixed until a '
        + 'profitable trade is closed, at which point it begins to trail upward, and it never '
        + 'trails down [ts-dll].',

        'Set against that is the Risk Lock-In: the risk team may set a minimum profit floor after a '
        + 'trader has made significant gains in a day, and dropping below it liquidates and locks '
        + 'the account for the rest of the session [ts-eod]. That is a discretionary rule applied by '
        + 'people, which is a different kind of risk from a published threshold, and it belongs on '
        + 'the page next to the published ones.',

        'One mechanism runs the other way, and a page that only listed the traps would be as '
        + 'misleading as one that only listed the perks. Topstep’s Dynamic Live Risk Expansion '
        + 'raises a funded account’s daily loss limit and maximum position size as its profits grow, '
        + 'a tier at a time [ts-dll]. A trader who performs is given more room rather than held at '
        + 'the opening limit for ever, which is not something most firms in this directory offer.',

        'The record scores the $50,000 tier, where the profit target is $3,000 [ts-consistency]. '
        + 'Topstep’s programme is futures-only, which is why it carries one market where every other '
        + 'firm here carries three or four, and the platform score reflects that rather than a '
        + 'judgement about futures.',
      ],
    },
  ],

  facts: [
    { label: 'Contracting entity', value: 'TopstepTrader, LLC', from: 'ts-faq' },
    { label: 'Consistency target', value: 'Best day at or below 55% of the profit target', from: 'ts-consistency' },
    { label: 'If the consistency target is breached', value: 'The profit target rises', from: 'ts-consistency' },
    { label: 'Maximum loss limit', value: 'Trails the end-of-day closing balance, never downward', from: 'ts-eod' },
    { label: 'Daily loss limit', value: 'Fixed until a profitable trade closes, then trails up only', from: 'ts-dll' },
    { label: 'Profit target, $50k account', value: '$3,000', from: 'ts-consistency' },
  ],

  open: [
    'The Risk Lock-In is applied at the risk team’s discretion and no threshold for it is published. '
    + 'How often it is used, and on what size of gain, is not knowable from outside.',
    'The monthly subscription model makes Topstep’s cost per $100k hard to compare with a one-off '
    + 'challenge fee. The figure on this record normalises it, and the normalisation is an '
    + 'assumption rather than a price anybody is quoted.',
  ],

  sources: [
    {
      id: 'ts-faq',
      publisher: 'Topstep',
      title: 'Frequently asked questions',
      url: 'https://www.topstep.com/faq/',
      read: '2026-09-17',
      kind: 'broker',
    },
    {
      id: 'ts-consistency',
      publisher: 'Topstep',
      title: 'Consistency at Topstep — what is the consistency target?',
      url: 'https://help.topstep.com/en/articles/8284208-what-is-the-consistency-target',
      read: '2026-09-17',
      kind: 'broker',
    },
    {
      id: 'ts-eod',
      publisher: 'Topstep',
      title: 'Trading Combine parameters, end-of-day trailing and Risk Lock-In',
      url: 'https://help.topstep.com/en/articles/8284197-trading-combine-parameters',
      read: '2026-09-17',
      kind: 'broker',
    },
    {
      id: 'ts-dll',
      publisher: 'Topstep',
      title: 'Daily loss limit in the Trading Combine and Express Funded Account',
      url: 'https://help.topstep.com/en/articles/10490293-daily-loss-limit-in-the-trading-combine-and-express-funded-account',
      read: '2026-09-17',
      kind: 'broker',
    },
  ],
};

/* ── E8 Markets ───────────────────────────────────────────────────────────── */

const E8: PropProfile = {
  slug: 'e8-markets',
  checked: '2026-09-17',
  originReadable: false,
  verdict:
    'A Texas company sells the contract and a Saint Lucia company runs the MT5 accounts, which is '
    + 'most of what its traders use. Both are named in its own terms — the disclosure is there, it '
    + 'is just not where the marketing is.',

  sections: [
    {
      heading: 'Dallas and Rodney Bay',
      paragraphs: [
        'E8 Funding LLC, at 4101 McEwen Rd #205, Dallas, Texas, is the company a participant '
        + 'contracts with, and the terms of service say so directly [e8-terms]. E8 Markets Ltd, '
        + 'registration 2025-00347, at Ground Floor, The Sotheby Building, Rodney Village, Rodney '
        + 'Bay, Gros-Islet, is incorporated in Saint Lucia [e8-terms].',

        'The division is on platform lines rather than geography, which is the detail worth having. '
        + 'E8 Markets Ltd operates MT5; E8 Funding LLC operates TradeLocker, cTrader and '
        + 'Match-Trader [e8-terms]. So which company holds your account depends on which platform '
        + 'you picked when you signed up — a choice most traders make on habit, without being told '
        + 'it selects a jurisdiction.',

        'A US registration is worth something: Texas has a public company registry and US courts '
        + 'are reachable. Saint Lucia is an offshore registry, and a 2025 registration number on a '
        + 'company running accounts for a firm founded in 2021 says the arrangement is recent. '
        + 'Neither is a finding against E8. Both are things a reader deciding between firms should '
        + 'be able to see in one place.',
      ],
    },

    {
      heading: 'One rule we could not settle, and are not going to guess at',
      paragraphs: [
        'E8’s site refuses our servers outright — the terms page, the help centre and the review '
        + 'aggregators all answer 403 — so nothing here was fetched by us directly. The entity '
        + 'detail above is from the firm’s own terms as indexed elsewhere, which is weaker evidence '
        + 'than a page we read, and the sources list says so.',

        'That matters most for one field. Several independent accounts of E8’s rules describe a '
        + 'best-day consistency rule — no single day above 40% of total profit on E8 One, tightening '
        + 'to 35% on Signature accounts — and a requirement that net profit exceed half the daily '
        + 'drawdown before a payout [e8-rules]. Our record says this firm has no consistency rule at '
        + 'all. One of those is wrong, and the difference is not cosmetic: a consistency rule is the '
        + 'single biggest thing standing between a good week and a passed account.',

        'We have not changed the record. The rule on this site is that a source a person could not '
        + 'read at the origin is enough to go and look and not enough to overwrite a field — the '
        + 'same restraint applied to a copy-trading claim on the Exness page. So the discrepancy is '
        + 'in the open questions below, where somebody with a browser can settle it, rather than '
        + 'quietly swapped into a table as though we had checked.',

        'What is not in doubt is the shape of the split. E8’s base share is the one on this page, '
        + 'with higher shares sold as an upfront add-on at checkout [e8-rules] — the second firm in '
        + 'this directory, after FundedNext, where the headline percentage is a thing you buy rather '
        + 'than a thing you earn.',
      ],
    },
  ],

  facts: [
    { label: 'Contracting company', value: 'E8 Funding LLC, Dallas, Texas', from: 'e8-terms' },
    { label: 'MT5 accounts operated by', value: 'E8 Markets Ltd, Saint Lucia', from: 'e8-terms' },
    { label: 'Saint Lucia registration', value: '2025-00347', from: 'e8-terms' },
    { label: 'Platforms run by the US company', value: 'TradeLocker, cTrader, Match-Trader', from: 'e8-terms' },
    { label: 'Registered address, Saint Lucia', value: 'The Sotheby Building, Rodney Bay, Gros-Islet', from: 'e8-terms' },
    { label: 'Higher profit split', value: 'Sold as an upfront add-on at checkout', from: 'e8-rules' },
    { label: 'Best-day rule, as others report it', value: '40% on E8 One, 35% on Signature — unconfirmed', from: 'e8-rules' },
  ],

  open: [
    'Whether E8 applies a best-day consistency rule is unresolved. Several accounts say 40% on E8 '
    + 'One and 35% on Signature; our record says none. Somebody who can reach the help centre should '
    + 'read it and settle the field either way.',
    'The Texas registration number was not found and is not published here. The Secretary of State '
    + 'register would settle it.',
    'No rule or cost figure on this page was re-read from E8’s live site on this pass, because the '
    + 'site refuses our requests.',
  ],

  sources: [
    {
      id: 'e8-rules',
      publisher: 'QuantVPS',
      title: 'E8 Markets payout rules — consistency, the payout ramp and the split add-on',
      url: 'https://www.quantvps.com/blog/e8-markets-payout-rules',
      read: '2026-09-17',
      kind: 'press',
    },
    {
      id: 'e8-terms',
      publisher: 'E8 Markets',
      title: 'Terms and conditions — contracting entities and which platform each one operates',
      url: 'https://e8markets.com/e8-markets-terms-and-conditions',
      read: '2026-09-17',
      kind: 'broker',
    },
  ],
};

export const PROP_PROFILES: PropProfile[] = [
  FTMO, ALPHA, THE5ERS, FUNDEDNEXT, FUNDINGPIPS, BREAKOUT, TOPSTEP, E8,
];

export const propProfileFor = (slug: string) => PROP_PROFILES.find((p) => p.slug === slug);

export { researchCitations as propProfileCitations, researchWordCount as propProfileWordCount } from './research.ts';
