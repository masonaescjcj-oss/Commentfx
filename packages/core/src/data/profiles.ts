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

export const PROFILES: BrokerProfile[] = [EXNESS];

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
