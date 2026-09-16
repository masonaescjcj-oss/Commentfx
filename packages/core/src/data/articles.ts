/**
 * The articles.
 *
 * Structured rather than written as markup, for the same reason everything else
 * here is: a paragraph in a .tsx file cannot be counted, linted or tested, and
 * the first thing a directory does wrong is let its prose drift from its data.
 * These are typed, so articles.test.ts can hold them to a length, a link count
 * and an author.
 *
 * What goes in one, from docs/SEO.md §5.3: one question, answered in the first
 * two sentences; a worked example with real numbers; at least three links into
 * the pages that make money; a named author and a date. An article that cannot
 * meet those is an article this site has no business publishing — the category
 * is "your money or your life", where Google's guidance is explicit that trust
 * is the ranking factor that matters most.
 */
export interface ArticleBlock {
  heading?: string;
  /** Paragraphs. A `[label](/path)` link is the only markup allowed. */
  paragraphs: string[];
  list?: { ordered?: boolean; items: string[] };
  /** A worked example, set apart. */
  example?: { title: string; rows: Array<[string, string]>; note?: string };
}

export interface Article {
  slug: string;
  title: string;
  /** The <h1>, which may differ from the <title> tuned for a result page. */
  heading: string;
  description: string;
  published: string;
  updated: string;
  author: string;
  /** The question this answers, in the reader's words. */
  question: string;
  /** Answered in the first two sentences, before anything else. */
  answer: string;
  blocks: ArticleBlock[];
  faq: Array<{ q: string; a: string }>;
}

export const ARTICLES: Article[] = [
  {
    slug: 'check-a-broker-licence',
    title: 'How to check a broker’s licence yourself, in about five minutes',
    heading: 'How to check a broker’s licence yourself',
    description:
      'Every serious regulator publishes a register you can search for free. Here is where each one is, ' +
      'what the statuses mean, and the three things a licence does not cover.',
    published: '2026-09-16',
    updated: '2026-09-16',
    author: 'CommentFX',
    question: 'How do I know a broker’s licence is real?',
    answer:
      'Search the regulator’s own register for the licence number the broker publishes, and check that the ' +
      'company name on the register is the company you would actually be signing with. Both halves matter: ' +
      'a real number under a different company is the most common way this goes wrong.',
    blocks: [
      {
        heading: 'The registers, and what to type into them',
        paragraphs: [
          'Every tier-1 regulator runs a free public register. You do not need an account and you do not ' +
          'need to ask the broker for anything — the number is on their own website, usually in the footer ' +
          'or on a page called Legal Documents.',
          'Search by the number rather than the name. Names are close enough to each other to be confusing ' +
          'on purpose; a licence number is not.',
        ],
        list: {
          items: [
            'FCA (United Kingdom) — the Financial Services Register. Search the firm reference number.',
            'CySEC (Cyprus) — the investment firms list. Numbers look like 178/12.',
            'ASIC (Australia) — Professional Registers. The AFS licence number is six digits.',
            'FSCA (South Africa) — the FSP register. Numbers are four or five digits.',
            'FSA Seychelles, FSC Mauritius, IFSC Belize — these publish lists rather than searchable ' +
            'registers, and that difference is itself worth noting.',
          ],
        },
      },
      {
        heading: 'What the statuses mean',
        paragraphs: [
          'A register entry is not a yes or no. The word beside the number is the whole point of looking.',
        ],
        list: {
          items: [
            '**Authorised** — the firm may do the activities listed. This is what you want.',
            '**Registered** — it is on a list, which is not the same as being supervised. Most offshore ' +
            'licences are this.',
            '**Suspended** — it may not take new business. Leave.',
            '**Withdrawn** or **cancelled** — the licence is gone. A broker still advertising it is ' +
            'telling you something about itself.',
          ],
        },
      },
      {
        heading: 'The name on the register is the thing people miss',
        paragraphs: [
          'A broker brand is usually several companies. The FCA entry belongs to the UK company; the person ' +
          'who signs up from outside Europe is usually onboarded to an offshore one with a different name, ' +
          'a different regulator and no compensation scheme behind it.',
          'So the check is not "does this number exist" but "does this number belong to the company I will ' +
          'be a client of". Every broker page here publishes the entity map for exactly this reason — see ' +
          '[which entity you will be onboarded to](/learn/which-entity-are-you-signing-with).',
        ],
        example: {
          title: 'What a full check looks like',
          rows: [
            ['1. Find the number', 'On the broker’s own site, in the footer or on the legal page'],
            ['2. Search the register', 'By number, not by name'],
            ['3. Read the company name', 'It must match the entity in your account agreement'],
            ['4. Read the status', 'Authorised, not registered, not suspended'],
            ['5. Read the permissions', 'Some licences do not cover CFDs at all'],
          ],
          note:
            'We run steps 1–4 automatically against the registers we can read, and every broker page says ' +
            'the date of the last reading — or says plainly that we have no reader for that register.',
        },
      },
      {
        heading: 'Three things a licence does not do',
        paragraphs: [
          'A licence is necessary and it is not sufficient, and the gap between those two is where most ' +
          'losses actually happen.',
        ],
        list: {
          ordered: true,
          items: [
            'It does not cover trading losses. No regulator refunds a bad trade, and none of them promise to.',
            'It does not always follow you. A compensation scheme covers clients of the licensed entity, ' +
            'not everybody who uses the brand.',
            'It does not mean the price you get is the price on the screen. Execution quality is a separate ' +
            'question, and one no register answers.',
          ],
        },
      },
      {
        paragraphs: [
          'If you would rather start from the answer: the [brokers ranked by licence](/best/tier-1-regulated) ' +
          'are the ones holding a tier-1 licence, and each [broker page](/brokers) shows every entity, every ' +
          'number, and what our last reading of the register said.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is a Seychelles or Belize licence worthless?',
        a: 'No, and it is not the same thing as an FCA or ASIC licence either. Those jurisdictions register ' +
           'firms rather than supervise them closely, and none of them runs a compensation scheme. It is a ' +
           'trade-off — usually higher leverage in exchange for less protection — and it should be a decision ' +
           'rather than a surprise.',
      },
      {
        q: 'The broker says it is “regulated” but shows no number. What now?',
        a: 'Treat it as unregulated until you see a number you can find on a register. Every regulated firm ' +
           'is required to publish its number; not publishing one is a choice.',
      },
      {
        q: 'How often should I re-check?',
        a: 'Licences get suspended and withdrawn without announcements. Once a year is reasonable for an ' +
           'account you keep money in, and immediately if withdrawals start being slow.',
      },
    ],
  },

  {
    slug: 'what-a-spread-really-costs',
    title: 'What a forex spread actually costs you, in money',
    heading: 'What a spread actually costs you',
    description:
      'Spread and commission are the same cost measured two ways. Here is the arithmetic that turns both ' +
      'into one number, and what that number is on a real trade.',
    published: '2026-09-16',
    updated: '2026-09-16',
    author: 'CommentFX',
    question: 'Is a 0.0 pip spread with commission cheaper than a 1.0 pip spread with none?',
    answer:
      'Usually yes, and you cannot tell without converting both to the same unit. A round-turn commission of ' +
      '$7 per standard lot is worth about 0.7 pips on EUR/USD, so “raw spread plus $7” costs about 0.7 pips ' +
      'all in and beats any account quoting 1.0.',
    blocks: [
      {
        heading: 'One number, two ways of charging it',
        paragraphs: [
          'A spread is the gap between the buy price and the sell price. You pay it the moment you open, ' +
          'because you open at one and close at the other.',
          'A commission is the same cost charged separately so the spread can be advertised as zero. Neither ' +
          'is a trick; what is a trick is comparing one against the other without converting.',
          'On a standard lot of EUR/USD — 100,000 units — one pip is $10. So a commission per standard lot ' +
          'round turn, divided by ten, is what that commission is worth in pips.',
        ],
        example: {
          title: 'Two accounts, same trade: one standard lot of EUR/USD',
          rows: [
            ['Account A — 1.0 pip spread, no commission', '1.0 pip = $10.00'],
            ['Account B — 0.1 pip spread + $7 round turn', '0.1 pip + 0.7 pip = 0.8 pip = $8.00'],
            ['Difference per lot', '$2.00 in B’s favour'],
            ['Over 100 lots a month', '$200'],
            ['Over a year at that rate', '$2,400'],
          ],
          note:
            'This is the calculation behind the all-in figure on every broker page here: published spread ' +
            'plus commission ÷ 10, in pips, so the ten brokers can be put in one column.',
        },
      },
      {
        heading: 'What the published number is not',
        paragraphs: [
          'Every broker publishes a *typical* spread, and typical is doing a lot of work in that sentence. ' +
          'The number is an average over conditions the broker chooses not to describe.',
        ],
        list: {
          items: [
            'It widens on news. A payrolls release can take EUR/USD from 0.1 to several pips for a few seconds.',
            'It widens at the session close, when liquidity providers step back.',
            'It is quoted on EUR/USD, the tightest pair there is. Everything else is worse, often by a lot.',
            'It says nothing about slippage, which is a separate cost and larger than the spread on a bad fill.',
          ],
        },
      },
      {
        heading: 'Comparing two brokers without fooling yourself',
        paragraphs: [
          'Once both accounts are in pips, the comparison is one subtraction — and it is still the ' +
          'easy half. The costs that decide the year are the ones that are not quoted at all.',
        ],
        list: {
          ordered: true,
          items: [
            'Convert both to all-in pips on the same pair. Anything else is comparing two units.',
            'Multiply by how much you actually trade. Half a pip is $5 a lot; at two lots a week it is ' +
            '$520 a year, which is real and is not life-changing.',
            'Check the withdrawal record. A fee saved and not paid out is not a saving — the ' +
            '[withdrawal and outage log](/status) is the version of this nobody advertises.',
            'Check which entity you would be a client of, because the cheap account and the protected ' +
            'account are frequently not the same account.',
          ],
        },
      },
      {
        heading: 'Where cost actually stops mattering',
        paragraphs: [
          'Cost is 20% of the broker score on this site rather than the whole of it, and that is a deliberate ' +
          'ratio. A broker half a pip cheaper is worth nothing if your withdrawal takes three weeks or the ' +
          'entity you signed with has no compensation scheme behind it.',
          'The order that survives contact with reality is: can I get my money out, is anyone supervising ' +
          'them, then what does it cost. See [how the score is built](/methodology), or go straight to ' +
          '[the cheapest all-in](/best/lowest-spread) — and read the licence column while you are there. ' +
          'If the entity question is new to you, ' +
          '[which company you sign with](/learn/which-entity-are-you-signing-with) is the one to read first.',
        ],
      },
    ],
    faq: [
      {
        q: 'How do I convert a commission on a pair that is not EUR/USD?',
        a: 'One pip on a standard lot is 10 units of the quote currency. On USD/JPY that is ¥1,000, so you ' +
           'have to convert at the current rate before comparing. On EUR/USD the quote currency is dollars, ' +
           'which is why every comparison uses it.',
      },
      {
        q: 'Is a zero-spread account real?',
        a: 'The spread can genuinely be 0.0 on the top of the book for a moment. What is never zero is the ' +
           'total cost, because the commission is where it moved to.',
      },
      {
        q: 'What about swap?',
        a: 'Swap is the overnight financing charge and it is not in the all-in figure, because it depends on ' +
           'the direction and how long you hold. For anything held for days it is usually larger than the ' +
           'spread. Swap-free accounts exist and each broker page says whether there is one.',
      },
    ],
  },

  {
    slug: 'which-entity-are-you-signing-with',
    title: 'Which broker entity are you actually signing with?',
    heading: 'Which company are you actually signing with?',
    description:
      'One broker brand is usually four or five companies with different regulators. Which one you are ' +
      'onboarded to decides your protection, and it is decided by where you live.',
    published: '2026-09-16',
    updated: '2026-09-16',
    author: 'CommentFX',
    question: 'Why does the same broker show a different licence depending on my country?',
    answer:
      'Because it is not one company. A broker brand is a group, and each company in it holds its own licence ' +
      'and serves its own list of countries — so two people using the same platform under the same logo can ' +
      'have completely different protection.',
    blocks: [
      {
        heading: 'The shape of a broker group',
        paragraphs: [
          'A typical group looks like this: a UK company with an FCA licence for British clients, a Cyprus ' +
          'company with a CySEC licence for the EU, sometimes a South African or Australian one, and an ' +
          'offshore company — Seychelles, Belize, Mauritius, St Vincent — that takes everyone else.',
          'That last one is the important one, because "everyone else" is most of the world. If you are not ' +
          'in a country named on one of the licensed entities, the offshore company is who you are signing ' +
          'with, whatever licence is advertised on the homepage you arrived at.',
        ],
      },
      {
        heading: 'What changes between them',
        paragraphs: [
          'Not the platform, not the spreads, not the support. What changes is everything that matters when ' +
          'something goes wrong.',
        ],
        list: {
          items: [
            '**Compensation.** The FCA’s FSCS covers up to £85,000 if the firm fails; CySEC’s ICF up to ' +
            '€20,000. Offshore entities have nothing equivalent.',
            '**Leverage.** 1:30 under EU and UK rules, 1:500 or 1:2000 offshore. The higher number is the ' +
            'offshore entity, always.',
            '**Segregation.** Whether client money is legally separate from the firm’s own is a licence ' +
            'condition in tier-1 jurisdictions and a promise elsewhere.',
            '**Who hears a complaint.** A UK client has the Financial Ombudsman. An offshore client has the ' +
            'company’s own complaints desk.',
          ],
        },
      },
      {
        heading: 'How to find out which one is yours',
        paragraphs: [
          'Before you deposit, not after. There are three places it is written down, and they should agree.',
        ],
        list: {
          ordered: true,
          items: [
            'The client agreement you tick to accept — the company name is in the first paragraph.',
            'The footer of the page you are on, which usually lists every entity and who each one serves.',
            'The confirmation email, which comes from the entity, not from the brand.',
          ],
        },
        example: {
          title: 'A group, laid out',
          rows: [
            ['UK company', 'FCA · authorised · FSCS up to £85,000 · UK clients'],
            ['Cyprus company', 'CySEC · authorised · ICF up to €20,000 · EU clients'],
            ['South Africa company', 'FSCA · authorised · no scheme · South African clients'],
            ['Seychelles company', 'FSA · registered · no scheme · everyone else'],
          ],
          note:
            'Every [broker page](/brokers) here carries this map, because it is the single fact the ' +
            'marketing is organised to keep quiet, and it is the one that decides what you have.',
        },
      },
      {
        heading: 'Is the offshore entity a bad thing?',
        paragraphs: [
          'Not automatically. It is a trade: you get leverage a tier-1 regulator will not allow a retail ' +
          'client, and you give up the scheme that would pay you if the firm failed. Plenty of people take ' +
          'that trade knowingly.',
          'What is not acceptable is taking it without being told. A broker that advertises its FCA licence ' +
          'to an audience it will onboard to Seychelles is not lying, exactly — and it is not telling you ' +
          'either. That gap is what this site exists to close. Start with ' +
          '[brokers holding a tier-1 licence](/best/tier-1-regulated), or read ' +
          '[how to check a licence yourself](/learn/check-a-broker-licence).',
        ],
      },
    ],
    faq: [
      {
        q: 'Can I choose which entity I sign with?',
        a: 'Almost never. It is decided by the country you give at sign-up, and giving a false one breaks ' +
           'the agreement — which is exactly the clause a firm reaches for when it does not want to pay out.',
      },
      {
        q: 'My broker only has one entity. Is that better?',
        a: 'It is simpler, and whether it is better depends entirely on which licence that one entity holds. ' +
           'One tier-1 licence covering everybody is the best case there is; one offshore registration ' +
           'covering everybody is the worst.',
      },
      {
        q: 'Does the compensation scheme cover my trading losses?',
        a: 'No. It covers the firm failing and being unable to return your money. Nothing covers a losing trade.',
      },
    ],
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);

/* ───────────────────────── reading an article ───────────────────────── */

/** `[label](/path)` — the only markup, so this is the only pattern. */
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

const textOf = (b: ArticleBlock): string[] => [
  ...(b.heading ? [b.heading] : []),
  ...b.paragraphs,
  ...(b.list?.items ?? []),
  ...(b.example ? [b.example.title, ...b.example.rows.flat(), ...(b.example.note ? [b.example.note] : [])] : []),
];

/**
 * Every path an article links to, in order.
 *
 * §5.3 asks for at least three links to pages that earn, in the prose, with
 * descriptive anchors. That is a rule a test can hold only if the links can be
 * counted, which is the reason the articles are data rather than markup.
 */
export function articleLinks(a: Article): Array<{ label: string; path: string }> {
  const out: Array<{ label: string; path: string }> = [];
  for (const line of a.blocks.flatMap(textOf)) {
    for (const [, label = '', path = ''] of line.matchAll(LINK)) out.push({ label, path });
  }
  return out;
}

/** What a reader actually gets, with the markup taken back out. */
export function articleWordCount(a: Article): number {
  const prose = [a.answer, ...a.blocks.flatMap(textOf)]
    .join(' ')
    .replace(LINK, '$1')
    .replace(/\*/g, '');
  return prose.split(/\s+/).filter(Boolean).length;
}
