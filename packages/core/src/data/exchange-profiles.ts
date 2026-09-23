import type { ResearchProfile } from './research.ts';

export type ExchangeProfile = ResearchProfile;

/**
 * The hand-researched layer for crypto exchanges.
 *
 * The evidence here is better than the prop-firm layer had and worse than the
 * broker layer, in an unusual way: there is no register of licensed crypto
 * exchanges to check a company against, but there is a great deal of court and
 * regulator paper, because a lot of these companies have been prosecuted. A
 * guilty plea is a stronger document than a licence.
 *
 * So the research went where the documents are, and `originReadable` is false
 * on every one of these for a reason worth being blunt about: nobody here
 * opened any of these companies' own websites. What was read was a FinCEN
 * consent order, two SEC releases, an SEC filing, a charging document from the
 * Southern District of New York, two Japanese warning lists and Dubai's notice
 * of fines. That is stronger evidence than a marketing page and it is not the
 * same thing as having checked what the company says about itself, so the
 * evidence component says so rather than claiming both.
 *
 * Every profile below is anchored on something an authority published — a FinCEN consent order, an
 * SEC press release, Japan's list of unregistered operators, Dubai's notice of
 * fines, an FBI alert — and the rules are the ones the other two layers
 * follow: nothing restates a number the record already holds, and every claim
 * carries a source id with the day it was read.
 *
 * Two things worth stating once rather than eight times.
 *
 * First, the thing these records are for. Four of the eight were warned by the
 * same Japanese regulator on the same day, three have pleaded guilty or paid
 * nine and ten figures to US authorities, and one lost $1.5bn to North Korea in
 * a single afternoon. None of that was anywhere on this site until now, while
 * the pages carefully compared taker fees to two decimal places.
 *
 * Second, what it does not mean. An exchange with a long enforcement history is
 * not necessarily one that will lose your money — Binance paid the largest
 * penalty in Treasury history for what it failed to report, not for what it
 * failed to return. The profiles say which is which, because a reader deciding
 * where to keep coins needs the difference and a headline never carries it.
 */

/* ── Coinbase ─────────────────────────────────────────────────────────────── */

const COINBASE: ExchangeProfile = {
  slug: 'coinbase',
  checked: '2026-09-17',
  revised: '2026-09-18',
  originReadable: false,
  verdict:
    'The only exchange here whose numbers are audited and filed with a securities regulator, because '
    + 'it is a listed company. The SEC sued it in 2023 and dismissed the case with prejudice in 2025 '
    + 'with no penalty and no finding — which is the outcome, not a technicality.',

  sections: [
    {
      heading: 'The case that ended',
      paragraphs: [
        'In June 2023 the SEC sued Coinbase for operating as an unregistered exchange, broker and '
        + 'clearing agency. On 27 February 2025 it dismissed that case with prejudice, meaning it '
        + 'cannot be refiled, and imposed nothing. Commissioner Hester Peirce recorded it in one '
        + 'line: "Today the Commission settled its case against Coinbase by dismissing it with '
        + 'prejudice" [peirce].',

        'The reason given is worth reading carefully, because it is not a verdict either way. The '
        + 'Commission pointed at the formation of its Crypto Task Force and a move away from making '
        + 'policy through enforcement [peirce]. That is a change in how the regulator works rather '
        + 'than a conclusion about this company — and it is still, for a reader, the difference '
        + 'between an open federal case and no case at all.',

        'This site files it at zero cost to the score and shows it in the good tone rather than the '
        + 'red one. A register that keeps the accusation from 2023 and forgets the ending from 2025 '
        + 'would be telling a reader the opposite of what happened.',
      ],
    },

    {
      heading: 'The breach it disclosed on itself',
      paragraphs: [
        'In May 2025 someone emailed Coinbase claiming to hold customer account information and '
        + 'internal documentation, and demanded money not to publish it. The company filed a Form 8-K '
        + 'with the SEC rather than quietly settling, which is the whole reason this paragraph can '
        + 'be written with figures in it.',

        'The filing says the attacker "appears to have obtained this information by paying multiple '
        + 'contractors or employees working in support roles outside the United States to collect '
        + 'information", and that the access was "independently detected by the Company’s security '
        + 'monitoring" [8k]. Names, addresses, masked identifiers, government-ID images and balance '
        + 'snapshots were exposed. No customer funds were taken and no private keys were reached.',

        'Coinbase did not pay: "The Company has not paid the threat actor’s demand" [8k]. It '
        + 'estimated expenses of roughly $180m to $400m for remediation and voluntary customer '
        + 'reimbursements [8k].',

        'This site’s security component scores breaches of customer funds, so by its own rule this '
        + 'does not move the number — and a reader should know it happened anyway. It is also the '
        + 'clearest illustration of what being a listed company buys: every other exchange here could '
        + 'have the same incident and no obligation to tell anyone the number.',
      ],
    },

    {
      heading: 'Why the solvency evidence here is different in kind',
      paragraphs: [
        'Every other exchange on this list proves its reserves the same way: it publishes a snapshot '
        + 'of wallets it chooses, on a date it chooses, usually with a Merkle tree so customers can '
        + 'check their own balance is included. That is real and it is the weakest form of evidence '
        + 'in this directory, because it says nothing about liabilities — what the exchange owes '
        + 'against what it holds.',

        'Coinbase does not publish one and scores 7.0 on that component anyway — ahead of the six '
        + 'exchanges here that publish one and have nothing else. A company listed on a US exchange '
        + 'files audited accounts on a schedule somebody else enforces, with both sides of the '
        + 'balance sheet in them and an auditor who can be sued; Coinbase files with the SEC like '
        + 'any other issuer, which is where the 8-K above came from [8k]. The thing a proof of '
        + 'reserves is a substitute for is the thing this company already does.',

        'This paragraph said "scores highest on solvency" until an article was written off the back '
        + 'of it and the arithmetic was checked. It does not: Kraken scores 8.0, on a proof of '
        + 'reserves plus a third-party audit, against Coinbase’s audit plus a listing. The claim '
        + 'this record was making — that the strongest evidence here is a public filing — is not '
        + 'what the weights say, and the weights are the published part. Corrected rather than '
        + 'quietly deleted, because a record that overstates its own best case is the failure this '
        + 'directory exists to point at in other people.',
      ],
    },
  ],

  facts: [
    { label: 'SEC action filed', value: 'June 2023, unregistered exchange, broker and clearing agency', from: 'peirce' },
    { label: 'Dismissed', value: '27 February 2025, with prejudice', from: 'peirce' },
    { label: 'Penalty imposed', value: 'None', from: 'peirce' },
    { label: 'Can the case be refiled', value: 'No — dismissal was with prejudice', from: 'peirce' },
    { label: 'Solvency evidence', value: 'Audited accounts as a listed company, not a reserve snapshot', from: '8k' },
    { label: '2025 data breach, estimated cost', value: '$180m to $400m in remediation and reimbursements', from: '8k' },
    { label: 'Extortion demand', value: 'Not paid', from: '8k' },
    { label: 'Customer funds taken', value: 'None — personal data only', from: '8k' },
  ],

  open: [
    'The 2025 breach is scored nowhere, because the security component measures breaches of customer '
    + 'funds and this was not one. A data breach that costs up to $400m and exposes government-ID '
    + 'images belongs somewhere in a model like this, and today it has no home. That is a gap in ours '
    + 'rather than in the company.',
    'Nobody here has read Coinbase’s latest 10-K. The solvency score rests on the fact that one '
    + 'exists and is audited, which is weaker than reading it.',
  ],

  sources: [
    {
      id: 'peirce',
      publisher: 'Securities and Exchange Commission',
      title: 'Getting Back on Base: statement of Commissioner Hester M. Peirce on the dismissal of the action against Coinbase',
      url: 'https://www.sec.gov/newsroom/speeches-statements/peirce-statement-coinbase-022725',
      published: '2025-02-27',
      read: '2026-09-17',
      kind: 'regulator',
    },
    {
      id: '8k',
      publisher: 'Coinbase Global, Inc., filed with the Securities and Exchange Commission',
      title: 'Form 8-K, cybersecurity incident disclosure',
      url: 'https://www.sec.gov/Archives/edgar/data/1679788/000167978825000094/coin-20250514.htm',
      published: '2025-05-15',
      read: '2026-09-17',
      kind: 'filing',
    },
  ],
};

/* ── Kraken ───────────────────────────────────────────────────────────────── */

const KRAKEN: ExchangeProfile = {
  slug: 'kraken',
  checked: '2026-09-17',
  originReadable: false,
  verdict:
    'Two SEC matters, and they ended differently: a $30m settlement in 2023 over the staking product, '
    + 'and a 2023 exchange-registration suit the SEC dropped with prejudice in 2025 after losing a '
    + 'motion to dismiss. No customer-funds breach on record in fourteen years.',

  sections: [
    {
      heading: 'The staking settlement, which was about one product',
      paragraphs: [
        'On 9 February 2023 Payward Ventures Inc and Payward Trading Ltd agreed to pay $30m and to '
        + 'stop offering their crypto staking-as-a-service programme to US customers, settling SEC '
        + 'charges that the programme was an unregistered offer and sale of securities [sec-staking].',

        'The SEC’s objection was about disclosure rather than about missing money. It said the '
        + 'programme had advertised returns as high as 21% a year since 2019, and that customers '
        + 'handing over tokens "lose control of those tokens and take on risks associated with those '
        + 'platforms, with very little protection" [sec-staking]. The $30m is disgorgement, '
        + 'prejudgment interest and civil penalties together. Nobody alleged customer assets went '
        + 'missing, and the fine ages out of this site’s conduct component on the same schedule as '
        + 'any other.',
      ],
    },

    {
      heading: 'The case they fought and the SEC dropped',
      paragraphs: [
        'The second matter is the one worth knowing about, and it is the one most summaries get '
        + 'backwards. The SEC filed on 11 November 2023, alleging Kraken ran an unregistered '
        + 'exchange. Kraken moved to dismiss and lost that motion in August 2024, so the case was '
        + 'live and had survived the court’s first look at it. On 3 March 2025 the SEC dismissed it '
        + 'with prejudice, with no penalty, no admission and no change required to the business '
        + '[sec-dismissal].',

        'The Commission was explicit that the decision "rests on its judgment that the dismissal will '
        + 'facilitate the Commission’s ongoing efforts to reform and renew its regulatory approach '
        + 'to the crypto industry, not on any assessment of the merits of the claims alleged" '
        + '[sec-dismissal]. That is a careful sentence and this page repeats it rather than '
        + 'paraphrasing: the case was dropped, and the regulator declined to say the case was wrong.',
      ],
    },
    {
      heading: 'The 2024 incident, and why the record still says no breach',
      paragraphs: [
        'This page claims no customer-funds breach in fourteen years, and a reader who follows crypto '
        + 'will immediately think of June 2024, so it is worth meeting directly. A researcher '
        + 'reported a bug through Kraken’s bounty programme that let a user inflate their balance by '
        + 'starting a deposit and spending the funds before it cleared. Rather than stop at a proof '
        + 'of concept, the finder and two others withdrew about $3m and refused to give it back until '
        + 'Kraken met their terms — which Kraken called extortion rather than white-hat work '
        + '[kraken-2024].',

        'The money came out of Kraken’s own treasury, not out of customer balances, and it was '
        + 'returned in full about ten days later minus fees. So the record’s `lastBreachYear` of null '
        + 'is accurate on its own terms — the field asks about customer funds — and a page that '
        + 'silently relied on that technicality would be doing the thing this site exists to catch. '
        + 'It was a real exploit of a real bug in a live system, it was found by someone outside, and '
        + 'it is here.',
      ],
    },
  ],

  facts: [
    { label: 'Entities in the staking settlement', value: 'Payward Ventures Inc and Payward Trading Ltd', from: 'sec-staking' },
    { label: 'Staking settlement', value: '$30m, 9 February 2023', from: 'sec-staking' },
    { label: 'Staking programme returns advertised', value: 'Up to 21% a year, since 2019', from: 'sec-staking' },
    { label: 'Exchange case filed', value: '11 November 2023', from: 'sec-dismissal' },
    { label: 'Motion to dismiss', value: 'Denied, August 2024', from: 'sec-dismissal' },
    { label: 'Exchange case dismissed', value: '3 March 2025, with prejudice, no penalty', from: 'sec-dismissal' },
    { label: '2024 bug exploit', value: 'About $3m, from Kraken’s treasury rather than customer balances', from: 'kraken-2024' },
    { label: 'Returned', value: 'In full, about ten days later, less fees', from: 'kraken-2024' },
  ],

  open: [
    'Kraken has a proof of reserves and a third-party audit on this record, and nobody here has '
    + 'opened either document. The component reads that they exist, which is weaker than reading them.',
    'Kraken is not on Japan’s list of unregistered crypto-asset exchange operators where four of the '
    + 'other seven are. Whether that is because it holds a registration or because it stays out of '
    + 'the market is not settled here.',
  ],

  sources: [
    {
      id: 'sec-staking',
      publisher: 'Securities and Exchange Commission',
      title: 'Kraken to discontinue unregistered offer and sale of crypto asset staking-as-a-service program and pay $30 million to settle SEC charges',
      url: 'https://www.sec.gov/newsroom/press-releases/2023-25',
      published: '2023-02-09',
      read: '2026-09-17',
      kind: 'regulator',
    },
    {
      id: 'kraken-2024',
      publisher: 'CoinDesk',
      title: 'Kraken says hackers turned to “extortion” after exploiting bug for $3M',
      url: 'https://www.coindesk.com/business/2024/06/19/kraken-says-hackers-turned-to-extortion-after-exploiting-bug-for-3m',
      published: '2024-06-19',
      read: '2026-09-17',
      kind: 'press',
    },
    {
      id: 'sec-dismissal',
      publisher: 'Securities and Exchange Commission',
      title: 'Litigation release — SEC v. Payward, Inc. and Payward Ventures, Inc. (d/b/a “Kraken”)',
      url: 'https://www.sec.gov/enforcement-litigation/litigation-releases/lr-26278',
      published: '2025-03-03',
      read: '2026-09-17',
      kind: 'regulator',
    },
  ],
};

/* ── Binance ──────────────────────────────────────────────────────────────── */

const BINANCE: ExchangeProfile = {
  slug: 'binance',
  checked: '2026-09-17',
  originReadable: false,
  verdict:
    'The largest penalty in the history of the US Treasury, a five-year monitor, and a founder who '
    + 'pleaded guilty and resigned — all of it about what the exchange failed to report and who it '
    + 'let trade, none of it about customer money going missing. Both halves of that matter.',

  sections: [
    {
      heading: 'What the $4.3bn was actually for',
      paragraphs: [
        'In November 2023 Binance admitted wilfully violating the Bank Secrecy Act. FinCEN assessed a '
        + '$3.4bn civil money penalty — the largest in its own and the Treasury Department’s history '
        + '— inside a roughly $4.3bn resolution coordinated with the Department of Justice, OFAC and '
        + 'the CFTC [fincen]. Changpeng Zhao pleaded guilty personally and resigned as chief '
        + 'executive.',

        'The findings are specific. The company failed to register with FinCEN as a money services '
        + 'business while telling the world it had left the United States years earlier, kept US '
        + 'users and other significant US ties, and failed to report more than 100,000 suspicious '
        + 'transactions [fincen]. A monitor sits over it for five years, reviewing compliance with '
        + 'the Bank Secrecy Act and US sanctions, and the settlement requires a complete exit from '
        + 'the United States.',

        'Now the part a reader should hold onto. Nothing in that resolution says customer assets were '
        + 'lost, misappropriated or unbacked. It is an anti-money-laundering and sanctions case: '
        + 'about who the exchange allowed to trade and what it did not tell the government. Those are '
        + 'serious in a way that bears on whether this company is well run, and they are not the same '
        + 'risk as an exchange that cannot return deposits. A directory that blurred the two would be '
        + 'as unhelpful as one that mentioned neither.',
      ],
    },

    {
      heading: 'The 2019 breach, which it covered',
      paragraphs: [
        'The other thing on this record is older and ended better. In May 2019 attackers took about '
        + '7,000 BTC — roughly $40m at the time — out of a hot wallet holding around 2% of the '
        + 'exchange’s bitcoin, using a combination of stolen API keys and two-factor codes '
        + '[hack-2019].',

        'Binance covered the whole loss out of its Secure Asset Fund for Users, a reserve it had '
        + 'started the previous year by setting aside a share of trading fees, and no customer lost '
        + 'anything [hack-2019]. That is why the security component on this page does not read like '
        + 'a warning: a breach absorbed by the company is a different event from a breach passed to '
        + 'the customers, and the model scores the difference rather than the headline.',

        'It is also seven years old now and fades on this site’s schedule. What has not faded is the '
        + 'demonstration that the fund existed and was actually spent, which is worth more than the '
        + 'existence of a fund nobody has seen tested.',
      ],
    },

    {
      heading: 'And what is still not knowable',
      paragraphs: [
        'Binance publishes a proof of reserves and has no third-party audit on this record, which is '
        + 'the ordinary state of affairs here and the reason the solvency component treats a '
        + 'self-published snapshot as the weakest evidence it accepts. For the largest exchange in '
        + 'the world by volume, that is a notable gap: the company that would be most expensive to '
        + 'be wrong about is one of the ones offering the least verifiable evidence.',

        'It is also not a US-listed company, files no audited accounts anywhere a reader can pull '
        + 'them, and is privately held. The monitorship means somebody credible is looking — but the '
        + 'monitor reports to the Treasury under the terms of the consent order [fincen], not to you, '
        + 'and its findings are not published.',
      ],
    },
  ],

  facts: [
    { label: 'FinCEN civil money penalty', value: '$3.4bn — the largest in Treasury history', from: 'fincen' },
    { label: 'Total resolution', value: 'About $4.3bn across DOJ, FinCEN, OFAC and the CFTC', from: 'fincen' },
    { label: 'Monitorship', value: 'Five years, over Bank Secrecy Act and sanctions compliance', from: 'fincen' },
    { label: 'Suspicious transactions unreported', value: 'More than 100,000', from: 'fincen' },
    { label: 'What was admitted', value: 'Wilful violation of the Bank Secrecy Act', from: 'fincen' },
    { label: 'Customer funds', value: 'Not part of the findings', from: 'fincen' },
    { label: '2019 hot wallet breach', value: 'About 7,000 BTC, roughly 2% of bitcoin held', from: 'hack-2019' },
    { label: 'Who bore the 2019 loss', value: 'Binance, from its Secure Asset Fund for Users', from: 'hack-2019' },
  ],

  open: [
    'The consent order runs to many pages and this note rests on its headline findings. Somebody '
    + 'should read it end to end; there is more in it than any summary carries.',
    'Whether the five-year monitorship has produced any public finding since 2023 is not something '
    + 'we have checked. Monitor reports are generally not published.',
  ],

  sources: [
    {
      id: 'hack-2019',
      publisher: 'Finance Magnates',
      title: 'Hackers steal 7,000 BTC from Binance in biggest attack of 2019',
      url: 'https://www.financemagnates.com/cryptocurrency/news/binance-endures-cyber-attack-7000-btc-stolen/',
      published: '2019-05-08',
      read: '2026-09-17',
      kind: 'press',
    },
    {
      id: 'fincen',
      publisher: 'Financial Crimes Enforcement Network, US Department of the Treasury',
      title: 'FinCEN consent order 2023-04 — Binance Holdings Ltd',
      url: 'https://www.fincen.gov/system/files/enforcement_action/2023-11-21/FinCEN_Consent_Order_2023-04_FINAL508.pdf',
      published: '2023-11-21',
      read: '2026-09-17',
      kind: 'regulator',
    },
  ],
};

/* ── Bybit ────────────────────────────────────────────────────────────────── */

const BYBIT: ExchangeProfile = {
  slug: 'bybit',
  checked: '2026-09-17',
  originReadable: false,
  verdict:
    'Lost about $1.5bn to North Korea in a single afternoon in February 2025 — the largest crypto '
    + 'theft on record — and had reserves back to 1:1 within 72 hours without halting withdrawals. '
    + 'The second fact is why this record does not read like a disaster.',

  sections: [
    {
      heading: 'The largest theft in the history of this industry',
      paragraphs: [
        'On or about 21 February 2025, attackers took roughly $1.5bn in virtual assets from Bybit. '
        + 'The FBI attributed it publicly five days later to North Korea, under the name it gives '
        + 'that activity: "The Federal Bureau of Investigation (FBI) is releasing this PSA to advise '
        + 'the Democratic People’s Republic of Korea (DPRK) was responsible for the theft of '
        + 'approximately $1.5 billion USD in virtual assets from cryptocurrency exchange, Bybit" '
        + '[fbi].',

        'The mechanism matters for what it says about everyone else. The theft happened during a '
        + 'routine transfer from a cold wallet to a hot one, with the attackers intercepting and '
        + 'rerouting the funds — not by breaking the exchange’s perimeter but by corrupting a signing '
        + 'process. The FBI asked node operators, exchanges, bridges and analytics firms to block '
        + 'addresses derived from the stolen assets and published a list of them [fbi]. This is a '
        + 'state actor, and no exchange on this list should be assumed out of reach of it.',
      ],
    },

    {
      heading: 'What happened next, which is the part that scores',
      paragraphs: [
        'Bybit did not halt withdrawals, and restored reserves to a one-to-one ratio for in-scope '
        + 'assets within 72 hours, partly through emergency borrowing. A fresh proof-of-reserves '
        + 'audit by Hacken on 23 February verified reserves covering user assets across 40 asset '
        + 'types, with the major assets above 100% collateral [por].',

        'That is the distinction this site’s security component is built on: an exchange that was '
        + 'hacked and covered every loss is not in the same category as one that was hacked and did '
        + 'not. Users were made whole. The record marks the breach, marks the recovery, and scores '
        + 'the difference — which is why a company that lost more money in one day than most of this '
        + 'list has ever held does not finish last.',

        'Separately, Japan’s Financial Services Agency named Bybit Fintech Limited of Dubai on its '
        + 'list of firms conducting crypto-asset exchange business with Japanese residents without '
        + 'registration, warned on 28 November 2024 [jfsa]. Three other exchanges on this page are on '
        + 'the same list, warned the same day.',
      ],
    },

    {
      heading: 'A judgement call in our own record, stated rather than buried',
      paragraphs: [
        'This record marks Bybit as publishing a proof of reserves and as having no third-party '
        + 'audit, and the two look contradictory next to a paragraph that credits an audit by Hacken '
        + '[por]. They are not, and the distinction is the most useful thing on this page for reading '
        + 'any of the others.',

        'A proof-of-reserves attestation checks that wallets an exchange points at hold what it says '
        + 'they hold, on the day somebody looks. A financial audit checks a company’s accounts: both '
        + 'sides, assets against what is owed, by a firm with professional liability for getting it '
        + 'wrong. Hacken is a named third party doing the first thing competently; it is not doing '
        + 'the second, and neither is anybody else here except the auditors of the one listed '
        + 'company.',

        'So the field stays false, and this paragraph exists because a reader is entitled to see '
        + 'the call being made rather than discover it in a scoring function. If somebody disagrees '
        + 'with where that line sits, the argument is here to have.',
      ],
    },
  ],

  facts: [
    { label: 'Amount stolen', value: 'About $1.5bn', from: 'fbi' },
    { label: 'Date', value: 'On or about 21 February 2025', from: 'fbi' },
    { label: 'Attributed to', value: 'North Korea, which the FBI calls TraderTraitor', from: 'fbi' },
    { label: 'Reserves restored to 1:1', value: 'Within 72 hours, audited 23 February 2025', from: 'por' },
    { label: 'Withdrawals halted', value: 'No', from: 'por' },
    { label: 'Japan FSA warning', value: 'Bybit Fintech Limited, Dubai, 28 November 2024', from: 'jfsa' },
  ],

  open: [
    'The emergency funding that closed the gap came partly from loans and large deposits by other '
    + 'firms. What those cost, and whether any of it is still outstanding, is not public.',
    'The Hacken attestation is a snapshot of wallets on a date, like every proof of reserves here. It '
    + 'shows assets and says nothing about liabilities.',
  ],

  sources: [
    {
      id: 'fbi',
      publisher: 'Federal Bureau of Investigation, IC3',
      title: 'Public service announcement — North Korea responsible for $1.5 billion Bybit hack',
      url: 'https://www.ic3.gov/psa/2025/psa250226',
      published: '2025-02-26',
      read: '2026-09-17',
      kind: 'regulator',
    },
    {
      id: 'jfsa',
      publisher: 'Financial Services Agency of Japan',
      title: 'Names of persons conducting virtual currency exchange business without registration',
      url: 'https://www.fsa.go.jp/policy/virtual_currency/angoushisan_mutouroku.pdf',
      read: '2026-09-17',
      kind: 'regulator',
    },
    {
      id: 'por',
      publisher: 'Bybit',
      title: 'Proof of reserves audit report, 23 February 2025',
      url: 'https://www.bybit.com/common-static/cht-static/por/Bybit_PoR_Audit_2025_Feb_23.pdf',
      published: '2025-02-23',
      read: '2026-09-17',
      kind: 'broker',
    },
  ],
};

/* ── OKX ──────────────────────────────────────────────────────────────────── */

const OKX: ExchangeProfile = {
  slug: 'okx',
  checked: '2026-09-17',
  originReadable: false,
  verdict:
    'Its operator pleaded guilty to a US federal offence in February 2025 and paid about $505m, having '
    + 'served American customers for six years against its own stated policy. A guilty plea is not an '
    + 'allegation, and this page files it as what it is.',

  sections: [
    {
      heading: 'The plea',
      paragraphs: [
        'The charging document is public and it is worth quoting rather than summarising. The '
        + 'Information filed in the Southern District of New York names "AUX CAYES FINTECH CO. LTD., '
        + 'd/b/a \u201cOKEx,\u201d d/b/a \u201cOKX\u201d" as the defendant, "a business entity incorporated in the '
        + 'Seychelles, which operates one of the highest-volume cryptocurrency exchange and trading '
        + 'platforms in the world" [information].',

        'The count is operating an unlicensed money transmitting business. From 2018 until at least '
        + 'early 2024 the company served "U.S. retail and institutional customers that engaged in '
        + 'over one trillion dollars of transactions through OKX while OKX failed to register as a '
        + 'money services business" with FinCEN, "as OKX knew was required by U.S. law" '
        + '[information]. That last clause is the one that makes this a criminal matter rather than '
        + 'a regulatory one: not that the rule was missed, but that it was known.',

        'The prosecutors also say the platform lacked adequate controls to tell whether either side '
        + 'of a transaction was subject to US Treasury sanctions, and that during the same period it '
        + 'was used "as a vehicle for laundering the proceeds of suspicious and criminal activities, '
        + 'including more than five billion dollars of suspicious transactions and illicit proceeds" '
        + '[information]. The company pleaded guilty and agreed to about $505m — an $84.4m fine and '
        + '$420.3m forfeited — with an external compliance consultant in place until February 2027 '
        + 'and a quarter off the fine for cooperating [plea].',
      ],
    },

    {
      heading: 'The policy, and the gap between it and what happened',
      paragraphs: [
        'The most quotable part of the filing is the shape of the failure, because it is not a firm '
        + 'that lacked a rule. "Since at least 2017, and up to the present, OKX has had an official '
        + 'policy preventing U.S. persons from transacting on its exchange" [information]. From '
        + 'December 2017 it blocked customers whose internet address was in the United States, and '
        + 'refused anyone who identified themselves as a US person on registration.',

        'And then: "As OKX knew, during the Relevant Period, the IP Ban did not, in actuality, '
        + 'prevent U.S. customers from accessing OKX (through a work-around process) and trading on '
        + 'the exchange" [information]. A control that was known not to work, left in place for six '
        + 'years, is a different thing from an oversight — and it is the reason the government '
        + 'charged a crime rather than writing a fine.',

        'It was September 2023 before the company required identity checks from new and existing '
        + 'customers, closing positions and freezing withdrawals for those who did not complete them '
        + '[information]. That is the date the behaviour actually changed, and it is nearly six years '
        + 'after the policy said it already had.',
      ],
    },

    {
      heading: 'What it does and does not tell you',
      paragraphs: [
        'Like the Binance resolution, this is about who the exchange let trade and what it did not '
        + 'stop, rather than about customer assets going missing. The Information charges one count, '
        + 'operating an unlicensed money transmitting business [information], and nowhere alleges '
        + 'that OKX lost or misappropriated a customer’s deposit.',

        'What it does say is that the company operated for six years in a way its own policy '
        + 'prohibited, and that it took a criminal conviction to stop. For a reader weighing where to '
        + 'keep coins, that is information about how seriously this company treats a rule when the '
        + 'rule is inconvenient — which is the same question the solvency component is really asking '
        + 'and cannot answer directly.',
      ],
    },
  ],

  facts: [
    { label: 'Entity that pleaded guilty', value: 'Aux Cayes Fintech Co. Ltd., incorporated in the Seychelles', from: 'information' },
    { label: 'Charge', value: 'Operating an unlicensed money transmitting business', from: 'information' },
    { label: 'Penalty', value: '$84.4m fine plus $420.3m forfeiture', from: 'plea' },
    { label: 'Period of conduct', value: '2018 to at least early 2024', from: 'information' },
    { label: 'US customer transactions in that period', value: 'Over one trillion dollars', from: 'information' },
    { label: 'Suspicious transactions and illicit proceeds', value: 'More than five billion dollars', from: 'information' },
    { label: 'Compliance consultant required until', value: 'February 2027', from: 'plea' },
    { label: 'Official policy against US persons since', value: '2017 — and the IP ban was known not to work', from: 'information' },
    { label: 'Identity checks required from', value: 'September 2023', from: 'information' },
  ],

  open: [
    'The plea agreement and the DOJ press release were not read here — justice.gov serves us the '
    + 'charging document and refuses the rest — so the penalty split and the consultant requirement '
    + 'rest on reporting while the allegations rest on the court filing.',
    'OKX publishes a monthly reserve attestation and nobody here has opened one.',
  ],

  sources: [
    {
      id: 'information',
      publisher: 'US Attorney’s Office for the Southern District of New York',
      title: 'United States v. Aux Cayes Fintech Co. Ltd. — Information, 25 Cr. (KPF)',
      url: 'https://www.justice.gov/usao-sdny/media/1390641/dl?inline=',
      published: '2025-02-24',
      read: '2026-09-17',
      kind: 'regulator',
    },
    {
      id: 'plea',
      publisher: 'CNBC',
      title: 'US says OKX crypto exchange operator enters $505 million guilty plea',
      url: 'https://www.cnbc.com/2025/02/24/us-says-okx-crypto-exchange-operator-enters-505-million-guilty-plea.html',
      published: '2025-02-24',
      read: '2026-09-17',
      kind: 'press',
    },
  ],
};

/* ── KuCoin ───────────────────────────────────────────────────────────────── */

const KUCOIN: ExchangeProfile = {
  slug: 'kucoin',
  checked: '2026-09-17',
  originReadable: false,
  verdict:
    'A guilty plea, $297m, a two-year exit from the United States, a permanent CFTC bar and a Japanese '
    + 'warning — the worst regulatory record on this page by a distance, alongside a 2020 breach it '
    + 'did recover from fully.',

  sections: [
    {
      heading: 'Three authorities, one direction',
      paragraphs: [
        'Peken Global Ltd, which operates KuCoin, pleaded guilty in January 2025 to operating an '
        + 'unlicensed money transmitting business: a $112.9m criminal fine and $184.5m of forfeiture, '
        + 'and an undertaking to leave the United States for at least two years [plea]. The company '
        + 'admitted failing to run the anti-money-laundering and know-your-customer programmes US law '
        + 'requires, and prosecutors said the exchange moved billions of dollars of suspicious '
        + 'transactions including proceeds of darknet markets, ransomware and fraud. Two founders, '
        + 'Chun Gan and Ke Tang, gave up any role in running it.',

        'In March 2026 a federal court entered a CFTC consent order permanently barring the operator '
        + 'from letting US participants trade on its system unless it first registers as a foreign '
        + 'board of trade, with a $500,000 penalty [cftc]. The money is small and the bar is not. The '
        + 'CFTC had sued in March 2024 over an unregistered derivatives exchange and what it called '
        + 'sham know-your-customer procedures.',

        'And Japan’s FSA named KuCoin, of the Seychelles, on its list of firms doing crypto-asset '
        + 'exchange business with Japanese residents without registration, warned 28 November 2024 '
        + '[jfsa].',
      ],
    },

    {
      heading: 'The breach it did handle well',
      paragraphs: [
        'None of the above is about customer money. On 26 September 2020 attackers took roughly $281m '
        + 'of assets out of KuCoin’s hot wallets, one of the largest exchange thefts of that year '
        + '[hack-2020].',

        'What happened next is the reason this record is not worse. By 11 November the exchange '
        + 'reported that about 84% had been recovered — through on-chain tracing, cooperation with '
        + 'other exchanges and the projects whose tokens were taken, contract upgrades and law '
        + 'enforcement — and that the remaining 16%, around $45m, was covered by its own insurance '
        + 'fund [hack-2020]. No user carried a permanent loss.',

        'That is worth saying clearly on a page that is otherwise a list of enforcement. This site '
        + 'scores a breach recovered from differently from a breach that was not, and KuCoin’s '
        + 'security record benefits from it. Where the company has done badly is with regulators, '
        + 'repeatedly, in three jurisdictions; where it has done well is in returning money somebody '
        + 'else stole. A reader is entitled to both halves, and the two are not in tension — '
        + 'reimbursing a hack is a thing a well-capitalised company can do while still running the '
        + 'compliance programme a court says it did not run.',
      ],
    },
  ],

  facts: [
    { label: 'Entity that pleaded guilty', value: 'Peken Global Ltd', from: 'plea' },
    { label: 'Penalty', value: '$112.9m fine plus $184.5m forfeiture', from: 'plea' },
    { label: 'US exit', value: 'At least two years', from: 'plea' },
    { label: 'Founders removed from management', value: 'Chun Gan and Ke Tang', from: 'plea' },
    { label: 'CFTC consent order', value: '30 March 2026, $500,000 and a permanent bar unless registered', from: 'cftc' },
    { label: 'Japan FSA warning', value: '28 November 2024', from: 'jfsa' },
    { label: '2020 breach', value: 'About $281m taken on 26 September 2020', from: 'hack-2020' },
    { label: 'Recovered or covered', value: '84% recovered, the rest from its insurance fund', from: 'hack-2020' },
  ],

  open: [
    'Sources disagree about where Peken Global is incorporated — the Seychelles in some accounts, the '
    + 'Turks and Caicos in others. Japan’s list says the Seychelles. We have not found a company '
    + 'register that settles it.',
    'The DOJ page is unreadable from here, so the plea rests on reporting; the Japanese warning and '
    + 'the FSA list are read directly.',
  ],

  sources: [
    {
      id: 'jfsa',
      publisher: 'Financial Services Agency of Japan',
      title: 'Names of persons conducting virtual currency exchange business without registration',
      url: 'https://www.fsa.go.jp/policy/virtual_currency/angoushisan_mutouroku.pdf',
      read: '2026-09-17',
      kind: 'regulator',
    },
    {
      id: 'hack-2020',
      publisher: 'FXStreet',
      title: 'KuCoin on track to reopen all operations after recovering 84% of the $280 million hack',
      url: 'https://www.fxstreet.com/cryptocurrencies/news/kucoin-on-track-to-reopen-all-operations-after-recovering-84-of-the-280-million-hack-202011111323',
      published: '2020-11-11',
      read: '2026-09-17',
      kind: 'press',
    },
    {
      id: 'plea',
      publisher: 'CoinDesk',
      title: 'KuCoin hit with nearly $300m fine after pleading guilty to US DOJ charges',
      url: 'https://www.coindesk.com/policy/2025/01/28/kucoin-hit-with-nearly-usd300-million-fine-after-pleading-guilty-to-u-s-doj-charges',
      published: '2025-01-28',
      read: '2026-09-17',
      kind: 'press',
    },
    {
      id: 'cftc',
      publisher: 'CoinDesk',
      title: 'KuCoin permanently barred from the US after CFTC order following $297m DOJ case',
      url: 'https://www.coindesk.com/policy/2026/03/31/kucoin-permanently-barred-from-u-s-after-cftc-order-following-usd297-million-doj-case',
      published: '2026-03-31',
      read: '2026-09-17',
      kind: 'press',
    },
  ],
};

/* ── MEXC ─────────────────────────────────────────────────────────────────── */

const MEXC: ExchangeProfile = {
  slug: 'mexc',
  checked: '2026-09-17',
  originReadable: false,
  verdict:
    'The cheapest fees in this directory and the least disclosure behind them. Two regulators have '
    + 'acted: Japan twice, and Dubai’s VARA fined its operator in June 2026 and ordered it to stop '
    + 'unlicensed activity.',

  sections: [
    {
      heading: 'Dubai stopped it, and named the company',
      paragraphs: [
        'On 22 June 2026 the Virtual Assets Regulatory Authority fined MX Global Ltd, which operates '
        + 'MEXC, finding the company "providing Virtual Asset Broker-Dealer and/or Exchange Services '
        + 'to customers in Dubai without obtaining the necessary licence from VARA" between 2022 and '
        + 'April 2026, and separately that it had onboarded users without meeting the '
        + 'know-your-customer obligations UAE law requires [vara]. It directed the company to '
        + '"immediately cease and desist from all unlicensed Virtual Asset activities in or from '
        + 'Dubai".',

        'Two things the notice says that a summary would drop. It records that the company cooperated '
        + 'fully and stated an intention to pursue proper licensing — which is not nothing. And it '
        + 'does not state the amount of the fine, so neither does this page; a figure we cannot see '
        + 'is a figure we do not print.',

        'Japan had named MEXC Global of Singapore on its list of unregistered crypto-asset exchange '
        + 'operators twice: in March 2023 and again, with a fresh warning, on 28 November 2024 '
        + '[jfsa]. Being named twice is a different signal from being named once.',
      ],
    },

    {
      heading: 'What you are trading against',
      paragraphs: [
        'MEXC has the lowest taker fee here by a wide margin and the widest listing of new tokens, '
        + 'and both are real advantages for a particular kind of trader. The record also shows it '
        + 'does not disclose its legal entity or publish incident reports, and has no insurance fund '
        + '— the thinnest transparency of the eight.',

        'That combination is the trade this page exists to make legible. Cheap execution, fast '
        + 'listings, and the least visibility into who you are dealing with or what happens when '
        + 'something goes wrong. The regulators above are, between them, the only outside check on '
        + 'this company anybody has published — and the only reason this page can name the operating '
        + 'company at all is that Dubai [vara] and Tokyo [jfsa] each wrote it down.',
      ],
    },

    {
      heading: 'The map of where it can still operate is shrinking',
      paragraphs: [
        'Beyond the two enforcement matters, MEXC has been leaving markets. It told users in the '
        + 'European Economic Area to withdraw before the transitional period under the EU’s markets '
        + 'in crypto-assets regime ended on 1 July 2026, holding no authorisation under it and not '
        + 'appearing on the European regulator’s register; and it suspended services to Indian '
        + 'addresses while it works on registration with that country’s financial intelligence unit '
        + '[access].',

        'For a reader the practical question is simply whether the exchange will still take them next '
        + 'year, and the answer has been changing. That is not misconduct — a firm withdrawing from a '
        + 'market it is not licensed in is doing the correct thing rather than the other one — but it '
        + 'is a fact about availability that a fee table cannot carry, and it is the pattern behind '
        + 'both the Dubai order and the Japanese warnings above.',
      ],
    },
  ],

  facts: [
    { label: 'VARA enforcement', value: '22 June 2026, MX Global Ltd', from: 'vara' },
    { label: 'Finding', value: 'Unlicensed broker-dealer and exchange services in Dubai, 2022 to April 2026', from: 'vara' },
    { label: 'Order', value: 'Cease and desist from all unlicensed virtual asset activity in or from Dubai', from: 'vara' },
    { label: 'Fine amount', value: 'Not stated in the notice', from: 'vara' },
    { label: 'Japan FSA warnings', value: 'March 2023 and 28 November 2024', from: 'jfsa' },
    { label: 'Entity named by Japan', value: 'MEXC Global, Singapore', from: 'jfsa' },
    { label: 'European Economic Area', value: 'Users told to withdraw before 1 July 2026; no MiCA authorisation', from: 'access' },
  ],

  open: [
    'Traders have publicly reported frozen accounts and withheld withdrawals, including a $3m case in '
    + '2025 that ended in a public apology and a refund. None of it is an authority’s finding, so '
    + 'none of it is on this record — but it is the most common complaint about this exchange and '
    + 'somebody should work out whether it can be evidenced.',
    'MEXC does not disclose its operating legal entity on its own site, so the only entity names here '
    + 'are the ones regulators used.',
  ],

  sources: [
    {
      id: 'vara',
      publisher: 'Virtual Assets Regulatory Authority, Dubai',
      title: 'VARA notice of fines — MX Global LTD (“MEXC”)',
      url: 'https://www.vara.ae/en/regulations/regulatory-notices/vara-notice-of-fines-mx-global-ltd-mexc/',
      published: '2026-06-22',
      read: '2026-09-17',
      kind: 'regulator',
    },
    {
      id: 'jfsa',
      publisher: 'Financial Services Agency of Japan',
      title: 'Names of persons conducting virtual currency exchange business without registration',
      url: 'https://www.fsa.go.jp/policy/virtual_currency/angoushisan_mutouroku.pdf',
      read: '2026-09-17',
      kind: 'regulator',
    },
    {
      id: 'access',
      publisher: 'Datawallet',
      title: 'MEXC review — regulation, restricted countries and market withdrawals',
      url: 'https://www.datawallet.com/crypto/mexc-review',
      read: '2026-09-17',
      kind: 'press',
    },
  ],
};

/* ── Bitget ───────────────────────────────────────────────────────────────── */

const BITGET: ExchangeProfile = {
  slug: 'bitget',
  checked: '2026-09-17',
  originReadable: false,
  verdict:
    'No breach on record and a large protection fund, against the thinnest corporate disclosure of the '
    + 'majors and two Japanese warnings — March 2023 and November 2024 — for running an exchange for '
    + 'Japanese residents without registration.',

  sections: [
    {
      heading: 'Named twice by the same regulator',
      paragraphs: [
        'Japan’s Financial Services Agency published a warning document naming Bitget Limited of '
        + 'Singapore, with Gracy Chen as its representative, on 28 November 2024, for having '
        + '"conducted crypto-asset exchange business with residents of Japan as counterparties '
        + 'through the internet" without registration, in breach of article 63-2 of the Payment '
        + 'Services Act [jfsa-bitget]. The FSA’s standing list of unregistered operators carries the '
        + 'same company from an earlier warning in March 2023 [jfsa].',

        'Four of the eight exchanges ranked here are on that list, warned on the same day, which is '
        + 'the proportion to keep in mind: Japan registers no offshore exchange that will not live '
        + 'inside its rules, so this is a statement about market access rather than about client '
        + 'money. Being named twice, nineteen months apart, is the part specific to this company.',
      ],
    },

    {
      heading: 'What is not disclosed',
      paragraphs: [
        'Bitget does not disclose its operating legal entity on its own site and publishes no '
        + 'incident reports. That is the weakest transparency score of the eight, and it is the '
        + 'reason the only company name on this page — Bitget Limited of Singapore — came from a '
        + 'Japanese regulator’s warning document [jfsa-bitget] rather than from the exchange.',

        'Against that: no customer-funds breach on record, a proof-of-reserves publication, and a '
        + 'protection fund the company says is large. None of those is audited by a third party here, '
        + 'which is the ordinary state of this industry and the reason the solvency component treats '
        + 'a self-published snapshot as the weakest evidence it will take.',
      ],
    },

    {
      heading: 'What the warnings turned into',
      paragraphs: [
        'Two warnings from the same regulator eventually produced a withdrawal. Bitget stopped '
        + 'accepting new registrations from Japanese residents in August 2026, and from November '
        + 'existing users there cannot open new positions or add to old ones across its product '
        + 'lines [japan-exit].',

        'Elsewhere it is trying the other route: it applied in 2025 for authorisation under the EU’s '
        + 'markets in crypto-assets regime through the Austrian regulator, and as of the middle of '
        + '2026 that application had not been decided [japan-exit]. A pending application is not a '
        + 'licence and it is not an enforcement matter either — it is a company choosing to ask '
        + 'rather than to route around, which is the opposite of what the Japanese warnings describe.',

        'Both facts belong on a page a reader uses to decide where to open an account, because the '
        + 'question they are really asking is whether this exchange will take them, and keep taking '
        + 'them. On current evidence the answer depends heavily on where they live and is moving.',
      ],
    },
  ],

  facts: [
    { label: 'Entity named by Japan', value: 'Bitget Limited, Singapore', from: 'jfsa-bitget' },
    { label: 'Representative named', value: 'Gracy Chen', from: 'jfsa-bitget' },
    { label: 'Warning issued', value: '28 November 2024', from: 'jfsa-bitget' },
    { label: 'Earlier warning on the same list', value: 'March 2023', from: 'jfsa' },
    { label: 'Legal provision', value: 'Article 63-2 of the Payment Services Act', from: 'jfsa-bitget' },
    { label: 'Japan', value: 'New registrations stopped August 2026; positions closing from November', from: 'japan-exit' },
    { label: 'EU authorisation', value: 'Applied in Austria in 2025, undecided in mid-2026', from: 'japan-exit' },
  ],

  open: [
    'Bitget applied for a MiCA licence in Austria and the application was still pending past the '
    + 'deadline. Whether it has since been granted is not settled here, and a pending application is '
    + 'not an enforcement matter either way.',
    'The size of the protection fund is the company’s own figure and nobody here has verified it.',
  ],

  sources: [
    {
      id: 'jfsa-bitget',
      publisher: 'Financial Services Agency of Japan',
      title: 'Warning document — persons conducting crypto-asset exchange business without registration (Bitget Limited)',
      url: 'https://www.fsa.go.jp/policy/virtual_currency02/bitget_limited_keikokushiryo.pdf',
      published: '2024-11-28',
      read: '2026-09-17',
      kind: 'regulator',
    },
    {
      id: 'jfsa',
      publisher: 'Financial Services Agency of Japan',
      title: 'Names of persons conducting virtual currency exchange business without registration',
      url: 'https://www.fsa.go.jp/policy/virtual_currency/angoushisan_mutouroku.pdf',
      read: '2026-09-17',
      kind: 'regulator',
    },
    {
      id: 'japan-exit',
      publisher: 'The Tokenist',
      title: 'Criminal penalty risk drives Bitget out of Japan by year-end',
      url: 'https://tokenist.com/bitget-japan-crypto-exit-fsa-penalties/',
      read: '2026-09-17',
      kind: 'press',
    },
  ],
};

export const EXCHANGE_PROFILES: ExchangeProfile[] = [
  COINBASE, KRAKEN, BINANCE, BYBIT, OKX, KUCOIN, MEXC, BITGET,
];

export const exchangeProfileFor = (slug: string) =>
  EXCHANGE_PROFILES.find((p) => p.slug === slug);
