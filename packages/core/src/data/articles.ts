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
/**
 * A diagram, with the size it was exported at.
 *
 * `w` and `h` are here rather than measured because the browser cannot know
 * them until the file has arrived, and a picture whose height is unknown pushes
 * the whole article down the moment it loads. That is the one layout shift a
 * reader actually notices, and it is invisible to every test that does not load
 * the image over a slow connection.
 *
 * `alt` carries what the drawing says, not what it looks like. These diagrams
 * make an argument the prose is also making, so a reader who cannot see them
 * should get the argument, not a description of some rectangles.
 */
export interface ArticleFigure {
  src: string;
  alt: string;
  w: number;
  h: number;
  caption?: string;
}

export interface ArticleBlock {
  heading?: string;
  /** Paragraphs. A `[label](/path)` link is the only markup allowed. */
  paragraphs: string[];
  list?: { ordered?: boolean; items: string[] };
  /** A diagram of what the block just argued. */
  figure?: ArticleFigure;
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
  {
    slug: 'who-is-behind-your-prop-firm',
    title: 'Who is actually behind your prop firm',
    heading: 'Who is actually behind your prop firm',
    description:
      'A prop firm holds no financial licence, so the company name on its terms is the whole of your ' +
      'recourse. Here is how to find it, and what we found behind eight of them.',
    published: '2026-09-17',
    updated: '2026-09-17',
    author: 'CommentFX',
    question: 'Who am I actually contracting with when I buy a prop firm challenge?',
    answer:
      'Usually not the company in the marketing. A prop firm holds no financial licence anywhere, so there ' +
      'is no regulator to complain to — the legal name and country on its terms is the entirety of what you ' +
      'could ever act on.',
    blocks: [
      {
        heading: 'What you are buying, in one firm’s own words',
        paragraphs: [
          'FTMO states it plainly in its own FAQ: "all accounts we provide to our clients are demo accounts ' +
          'with fictitious funds and any trading is in a simulated environment only". That is the product ' +
          'across the whole category, not one firm’s small print.',
          'It is also why no regulator licenses any of this. A broker takes your deposit into the real market ' +
          'and is supervised for it; a prop firm sells you access to a simulation and a contract promising a ' +
          'share of what the simulation says you earned. Nothing wrong with that — but it changes completely ' +
          'what happens when something goes wrong.',
          'If a licensed broker refuses your withdrawal, you have a regulator, an ombudsman and sometimes a ' +
          'compensation scheme. If a prop firm refuses your payout, you have a contract with a company, in ' +
          'whatever country that company is registered in. That is the whole list. Which is why the name and ' +
          'the country are not trivia, and why every firm in our ' +
          '[prop firm ranking](/props) now opens with the companies behind it.',
        ],
      },
      {
        heading: 'It is rarely one company',
        paragraphs: [
          'When we read all eight firms in this directory back against their own terms in September 2026, the ' +
          'single most common finding was that the arrangement is split across jurisdictions — and that the ' +
          'address in the marketing belongs to the least important of them.',
          'FundedNext is the clearest example, and it publishes all of it honestly in its terms. Four ' +
          'companies, three live, in three countries:',
        ],
        example: {
          title: 'The companies behind one prop firm',
          rows: [
            ['The terms you accept', 'GrowthNext – F.Z.E., reg. 28831, Ajman Free Zone, UAE'],
            ['The company running your account', 'FundedNext Ltd, HY01023052, Mohéli, Comoros'],
            ['The company charging your card', 'Incenteco Trading Ltd, HE 307114, Limassol, Cyprus'],
            ['The company that used to exist', 'FundedNext Ltd, 14492007, England — dissolved 30 April 2024'],
          ],
          note:
            'Read from the firm’s own terms and from Companies House. The full working is on our ' +
            '[FundedNext record](/props/fundednext).',
        },
      },
      {
        heading: 'How to check it yourself, in about ten minutes',
        paragraphs: [
          'You do not need us for this. Every step below is a free public source, and the whole point is that ' +
          'a firm dealing straight will survive it.',
        ],
        list: {
          ordered: true,
          items: [
            'Find the terms of service — not the FAQ, not the rules page. Look for a heading like "the ' +
            'parties" or "who we are". Every firm in this directory names its companies somewhere in there.',
            'Write down every company name, registration number and country you find. If there is more than ' +
            'one, note which does what: takes the money, runs the account, holds the contract.',
            'Search the register of the country named. Companies House (UK), ARES (Czechia) and most EU ' +
            'registers are free and instant. If a company is real, you will find it in under a minute.',
            'Check the classification the company filed under. It is one line and it tells you what the ' +
            'company says it is: Alpha Capital Group is filed as an IT services business, The5%ers as human ' +
            'resources provision.',
            'If a company is registered somewhere with no searchable public register — the Comoros, St ' +
            'Vincent, Mohéli — you have reached the end of what anyone can verify. That is not proof of ' +
            'anything bad. It is the limit of what you will ever be able to check.',
          ],
        },
      },
      {
        heading: 'The number in the headline is usually the ceiling',
        paragraphs: [
          'The other thing that research turned up: of eight firms, four published a profit split that was ' +
          'the top of a range rather than what a newly funded trader is paid. FTMO advertises 90% and pays ' +
          '80 until you have traded four months, made 10% net and taken two payouts. The5%ers advertises ' +
          '100% and starts at 80. FundedNext’s 95% is partly a paid upgrade — it costs a further 20% on the ' +
          'price of the challenge.',
          'None of that is hidden. Every one of those firms publishes the real terms on its own site, in the ' +
          'scaling plan or the programme page. It is simply that the number on the homepage and the number ' +
          'in your contract are different numbers, and only one of them is the one you get.',
          'The same habit runs through broker marketing, where the licence in the advertising is often held ' +
          'by a company that would not open an account for you — the subject of our guide on ' +
          '[which entity you sign with](/learn/which-entity-are-you-signing-with), and visible on every ' +
          '[broker record we publish](/brokers).',
        ],
      },
    ],
    faq: [
      {
        q: 'Are prop firms regulated?',
        a:
          'No, and not because they are evading anything. They sell access to a simulated account rather than ' +
          'a financial service, which falls outside what financial regulators license. A firm claiming to be ' +
          '"regulated" is usually pointing at a separate brokerage company in the same group.',
      },
      {
        q: 'Is a demo account a problem?',
        a:
          'Not by itself — it is the product, and the serious firms say so in their own terms. What it means ' +
          'is that your claim is contractual rather than regulatory, so the company you are contracting with, ' +
          'and where it is registered, is the thing worth checking before you pay.',
      },
      {
        q: 'What does it mean if a firm is registered in the Comoros?',
        a:
          'It means the company exists on a register nobody outside can search, so its registration number ' +
          'cannot be independently confirmed. Two firms in this directory run their accounts from there. It ' +
          'is not evidence of wrongdoing; it is the point past which no reader can verify anything.',
      },
      {
        q: 'Why do some prop firms score lower on your rankings for reasons that are not their fault?',
        a:
          'Four of the eight refuse automated requests, so their rules could not be read where they are ' +
          'published. That is a fact about our evidence, not their honesty, and it is scored as a separate ' +
          'published component so a reader can see exactly what it cost and disagree with us.',
      },
    ],
  },
  {
    slug: 'what-proof-of-reserves-proves',
    title: 'What a proof of reserves proves, and what it does not',
    heading: 'What a proof of reserves actually proves',
    description:
      'Seven of the eight exchanges ranked here publish a proof of reserves. Two have an audit by '
      + 'somebody else. That gap is the whole of what the phrase is worth.',
    published: '2026-09-18',
    updated: '2026-09-18',
    author: 'CommentFX',
    question: 'Does a proof of reserves mean my money is safe on an exchange?',
    answer:
      'No — it shows what an exchange holds, not what it owes, on a date the exchange picks itself. '
      + 'Seven of the eight exchanges ranked here publish one, so on its own it barely tells you '
      + 'which to choose.',
    blocks: [
      {
        heading: 'What the thing actually is',
        paragraphs: [
          'A proof of reserves is a snapshot. The exchange publishes a list of wallet addresses it '
          + 'says are its own, on a date it chooses, usually with a Merkle tree so that any customer '
          + 'can check their own balance was included in the total. Nothing about that is fake and '
          + 'nothing about it is nothing. It is genuinely more than the exchanges of ten years ago '
          + 'offered, which was a sentence on a website.',
          'But read what it claims: these coins existed, in these wallets, at that moment. Every '
          + 'word of that can be true at an exchange which is insolvent, and the reason is that it '
          + 'is one side of a balance sheet published without the other.',
        ],
        figure: {
          src: '/learn/what-proof-of-reserves-proves/one-side-of-the-balance.webp',
          alt: 'A balance scale. The left pan is visible and loaded; the right pan is hidden behind '
            + 'a panel, so the beam can be seen but nothing on that side can be weighed.',
          w: 1600,
          h: 900,
          caption: 'A proof of reserves weighs one pan and publishes the result.',
        },
      },
      {
        heading: 'The three questions it does not answer',
        paragraphs: [
          'Each of the three below is the difference between an exchange that can pay everybody and '
          + 'one that cannot, and a reserves page addresses none of them.',
        ],
      },
      {
        heading: 'Does a proof of reserves show what an exchange owes?',
        paragraphs: [
          'No, and this is the whole of it. Assets without liabilities is not a solvency statement. '
          + 'An exchange holding a billion dollars of bitcoin and owing its customers two billion '
          + 'passes a proof of reserves with room to spare, and the page it publishes is entirely '
          + 'true. Solvency is the comparison of the two columns; the format only ever contains one '
          + 'of them.',
        ],
        figure: {
          src: '/learn/what-proof-of-reserves-proves/assets-without-liabilities.webp',
          alt: 'Two columns side by side. The left one is filled in solid; the right one is an '
            + 'empty dashed outline that was never filled. A rule crosses both, inviting a '
            + 'comparison that cannot be made.',
          w: 1600,
          h: 900,
          caption: 'The column on the right is the one that decides whether you get paid.',
        },
      },
      {
        heading: 'Can an exchange borrow the coins for the day of the snapshot?',
        paragraphs: [
          'Yes, and nothing in the format would show it. The snapshot is taken on a date the '
          + 'exchange chooses and announces. An exchange that borrows assets so as to be holding '
          + 'them on that day publishes a page which is true about a false position, and a reader '
          + 'checking their own balance in the Merkle tree would find it exactly where it should '
          + 'be. This is not hypothetical bookkeeping — it is the ordinary reason a single-date '
          + 'attestation is worth less than a continuous obligation.',
        ],
        figure: {
          src: '/learn/what-proof-of-reserves-proves/a-snapshot-on-a-chosen-date.webp',
          alt: 'A timeline with a camera shutter above one tick. Under that tick the holdings are '
            + 'piled high; on every other date along the line they are sparse.',
          w: 1600,
          h: 900,
          caption: 'Every date on this line is true. Only one of them was photographed.',
        },
      },
      {
        heading: 'If the exchange fails, are the coins yours?',
        paragraphs: [
          'That is decided by the terms you accepted and the law where the company is registered, '
          + 'and a wallet snapshot has nothing to say about either. Customer assets can be your '
          + 'property held on trust, or they can be part of the estate you queue up as a creditor '
          + 'against — the wallets look identical from outside either way.',
        ],
        figure: {
          src: '/learn/what-proof-of-reserves-proves/whose-coins-if-it-fails.webp',
          alt: 'A vault building holding a grid of identical boxes, with a dotted line drawn '
            + 'through the middle of the grid. The boxes on either side of the line look the same '
            + 'and belong to different people.',
          w: 1600,
          h: 900,
          caption: 'Nothing on the outside of a wallet says which side of that line it is on.',
        },
      },
      {
        heading: 'What the eight exchanges here actually have',
        paragraphs: [
          'This is our own record, and it is the reason the phrase is nearly useless as a way to '
          + 'choose. Almost everybody has one. Almost nobody has the thing it is a substitute for.',
        ],
        example: {
          title: 'Solvency evidence across the eight exchanges ranked here',
          rows: [
            ['Publish a proof of reserves', '7 of 8 — all except Coinbase'],
            ['Audited by a named third party', '2 of 8 — Coinbase and Kraken'],
            ['Listed on a public market', '1 of 8 — Coinbase'],
            ['Score for a proof of reserves alone', '4 points out of 10'],
            ['Score for an audit, or for a listing', '4 points, and 3 points'],
          ],
          note: 'A signal that seven of eight competitors also have cannot tell them apart. That is '
            + 'why it is worth four points here and not ten.',
        },
      },
      {
        heading: 'The exchange that publishes none of it and still beats six that do',
        paragraphs: [
          'Coinbase publishes no proof of reserves at all and scores 7.0 on solvency evidence in '
          + '[the exchange rankings](/exchanges) — ahead of all six exchanges that publish one and '
          + 'have nothing else. That is not a mistake in the model, it is the point of it.',
          'A company listed on a US exchange files audited accounts on a schedule somebody else '
          + 'enforces, with both sides of the balance sheet in them, signed by an auditor who can be '
          + 'sued for signing. That is a continuous obligation to a regulator rather than a page the '
          + 'company chooses to publish. The thing a proof of reserves is a substitute for is the '
          + 'thing a filed annual report already is. You can read the reasoning on '
          + '[the Coinbase record](/exchanges/coinbase).',
          'The highest score on this component is Kraken’s 8.0, and it is worth understanding why: '
          + 'a proof of reserves and an audit by a named third party, but no public listing. Two '
          + 'kinds of evidence beat one kind plus a listing, on our weights. Reasonable people would '
          + 'weigh those differently, which is the reason the weights are printed rather than '
          + 'described.',
        ],
        figure: {
          src: '/learn/what-proof-of-reserves-proves/three-kinds-of-evidence.webp',
          alt: 'Three bars of increasing length. The shortest is an empty outline, the middle one '
            + 'is half filled, and the longest is filled solid and carries an official seal.',
          w: 1600,
          h: 900,
          caption: 'A page you publish about yourself, a name that signed it, a filing somebody '
            + 'else enforces. Only the last one has a deadline.',
        },
      },
      {
        heading: 'How to use it, then',
        paragraphs: [
          'Treat it as a floor and not a finding. An exchange that publishes nothing at all in 2026 '
          + 'is telling you something; an exchange that publishes a reserves page is telling you '
          + 'almost nothing, because so does nearly everyone.',
          'What separates them is the evidence that somebody outside the company had to sign: an '
          + 'audit, a listing, a regulator with a filing deadline. That is what [our solvency '
          + 'scoring](/methodology) weighs, and why the component is called solvency evidence rather '
          + 'than solvency — nobody outside an exchange can know it is solvent, and a directory that '
          + 'implied otherwise would be selling a certainty it does not have.',
        ],
      },
      {
        paragraphs: [
          'The question underneath all of this is the one that runs through every record on this '
          + 'site: which company is actually holding your money, and what is it obliged to do. For '
          + 'brokers that argument is set out in [which company you are signing with]'
          + '(/learn/which-entity-are-you-signing-with), and it is the same argument here.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is a proof of reserves an audit?',
        a: 'No. An audit is performed by a third party who examines both assets and liabilities and '
          + 'puts their name to the result. A proof of reserves is published by the exchange about '
          + 'itself, covers assets only, and in most cases nobody outside the company has checked it.',
      },
      {
        q: 'What is the Merkle tree for?',
        a: 'It lets an individual customer verify that their own balance was counted in the total '
          + 'the exchange published. That is a real check and a narrow one: it proves you were '
          + 'included in a sum, not that the sum covers what the exchange owes everybody.',
      },
      {
        q: 'Should I avoid an exchange that does not publish one?',
        a: 'Not automatically. Coinbase publishes none and still scores above the six exchanges that '
          + 'publish one and have nothing else, because a public listing forces audited accounts '
          + 'covering far more. What matters is what evidence exists, not the format it arrives in.',
      },
      {
        q: 'Why is this only worth four points out of ten in the score?',
        a: 'Because seven of the eight exchanges ranked here have one, and a signal almost everybody '
          + 'has cannot separate them. An audit by a named third party is worth another four, and a '
          + 'public listing three, because those are the parts somebody outside the company signed.',
      },
    ],
  },
];

export const articleBySlug = (slug: string) => ARTICLES.find((a) => a.slug === slug);

/* ───────────────────────── reading an article ───────────────────────── */

/** `[label](/path)` — the only markup, so this is the only pattern. */
/**
 * What is being written next, each under the slug it will be published at.
 *
 * This list used to be four strings typed into the guides page, and it went
 * stale the first time an article shipped: the page went on promising a guide
 * that was already published and linked two cards above it. A promise nobody
 * can forget to withdraw is one the test suite checks, so these carry the slug
 * they will become and `articles.test.ts` fails the moment one of them exists.
 */
export const PLANNED: ReadonlyArray<{ slug: string; title: string }> = [
  {
    slug: 'static-and-trailing-drawdown',
    title: 'Static drawdown and trailing drawdown, and which one ends more accounts',
  },
  {
    slug: 'how-a-compensation-scheme-pays-out',
    title: 'How a compensation scheme actually pays out when a broker fails',
  },
  {
    slug: 'reading-a-calendar-release',
    title: 'Reading an economic calendar release without being caught by the revision',
  },
];

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
