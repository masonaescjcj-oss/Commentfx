import type { PropFirm } from '../props.ts';

/**
 * Researched on 17 September 2026, and unevenly, which the pages say.
 *
 * This carried a "SEED DATA — NOT YET VERIFIED" banner until every record was
 * read back against the firms' own terms and, where a company register existed,
 * against that. Seven of the eight had at least one figure wrong and the errors
 * were not random: four firms had a profit split on record that was the ceiling
 * of a range rather than what a newly funded trader is paid, and one had a rule
 * ("no minimum trading days") that the firm does not have. A record seeded from
 * marketing inherits the shape of marketing.
 *
 * The unevenness is the part to keep in view. FundingPips, E8 Markets, Breakout
 * and Alpha Capital answer our servers with 403 or 429, so their rule figures
 * were not re-read at the origin on this pass and their profiles say so. The
 * consequence is uncomfortable and is left visible rather than tuned away:
 * FundingPips now ranks first, and it is the firm whose record we could confirm
 * least. The score model reads the fields, and the fields it reads are the ones
 * nobody has been able to check.
 *
 * Prop firms change rules more often than any other category here and rarely
 * announce it, so every record still needs the rule-change job watching it.
 */
/**
 * Logos are each firm's own icon, squared to 100px so one <img> rule fits every
 * record. Four of them — FundingPips, Alpha Capital Group, E8 Markets and
 * Breakout — could not be taken from the firms' own sites, which answer an
 * automated request with 403 or 429, and this file used to say so and leave
 * them as initials tiles.
 *
 * They now come from Google's public favicon endpoint, which is a different
 * source rather than a way around the first one: the same shape of decision as
 * taking the exchange logos from CoinGecko's public API instead of from eight
 * exchange websites. Each was looked at before it was used — all four are the
 * firm's real mark, not a screenshot or a placeholder — and each keeps its own
 * background, as FTMO's and Topstep's do.
 *
 * The initials tile is still the fallback and still worth keeping legible: a
 * firm added tomorrow may have no icon anywhere.
 */
export const PROPS: PropFirm[] = [
  {
    // 2014, not 2015: the Czech state register gives FTMO s.r.o. a datumVzniku
    // of 24 June 2014 against IČO 03136752.
    slug: 'ftmo', name: 'FTMO', founded: 2014, headquarters: 'CZ',
    website: 'https://ftmo.com/',
    entities: [
      { legalName: 'FTMO s.r.o.', country: 'CZ', role: 'contracting', registration: 'IČO 03136752' },
    ],
    markets: ['forex', 'indices', 'crypto', 'stocks'],
    // The 2-step programme, which is the one the record describes. FTMO also
    // sells a 1-step with an end-of-day trailing limit and a 50% best-day rule;
    // scoring the easier product and naming the firm would be a lie by omission,
    // so the profile says both exist and this row stays on the 2-step.
    rules: { steps: 2, profitTargetPct: 10, dailyDrawdownPct: 5, maxDrawdownPct: 10, drawdownType: 'static', consistencyRule: false, timeLimitDays: null, newsTrading: true, weekendHolding: true, minTradingDays: 4 },
    // 80, not 90. 90% is the Scaling Plan ceiling and it costs four months,
    // 10% net profit and two processed rewards to reach. We were publishing the
    // best case as the case.
    payout: { splitPct: 80, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 540, platforms: ['MT4', 'MT5', 'cTrader', 'DXtrade'],
    transparency: { publishesRuleChanges: true, disclosesLegalEntity: true, disclosesExecutionBroker: true },
    why: 'Static drawdown and no time limit — the rules most traders can actually survive',
    logo: { initials: 'FT', bg: '#1F6B5A', fg: '#FFFFFF', img: '/logos/ftmo.png' },
  },
  {
    slug: 'fundingpips', name: 'FundingPips', founded: 2022, headquarters: 'AE',
    website: 'https://fundingpips.com/',
    // Dubai is the address in the marketing. The company that runs the
    // simulated accounts is registered in the Comoros — the same jurisdiction
    // whose licensing structure the Comoros central bank calls fictitious, and
    // which this site already flags on Alpari's record.
    entities: [
      { legalName: 'FP Funding LLC', country: 'AE', role: 'contracting' },
      { legalName: 'FundingPips Corp', country: 'KM', role: 'trading', registration: 'HY01223081' },
      { legalName: 'FundingPips Services Ltd', country: 'CY', role: 'payments', registration: 'HE 450941' },
    ],
    markets: ['forex', 'indices', 'crypto'],
    rules: { steps: 2, profitTargetPct: 8, dailyDrawdownPct: 4, maxDrawdownPct: 8, drawdownType: 'static', consistencyRule: false, timeLimitDays: null, newsTrading: true, weekendHolding: false, minTradingDays: 3 },
    payout: { splitPct: 90, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 439, platforms: ['MT5', 'cTrader', 'Match-Trader'],
    transparency: { publishesRuleChanges: true, disclosesLegalEntity: true, disclosesExecutionBroker: false },
    why: 'Cheapest static-drawdown challenge in the directory',
    logo: { initials: 'FP', bg: '#3E5AD4', fg: '#FFFFFF', img: '/logos/fundingpips.png' },
  },
  {
    slug: 'fundednext', name: 'FundedNext', founded: 2022, headquarters: 'AE',
    website: 'https://fundednext.com/',
    // Four companies, three jurisdictions and a dissolution. The UK company was
    // the one with financial SIC codes against it; it went in April 2024 and the
    // operational entity is now in the Comoros.
    entities: [
      { legalName: 'GrowthNext – F.Z.E.', country: 'AE', role: 'contracting', registration: '28831' },
      { legalName: 'FundedNext Ltd', country: 'KM', role: 'trading', registration: 'HY01023052' },
      { legalName: 'Incenteco Trading Ltd', country: 'CY', role: 'payments', registration: 'HE 307114' },
      { legalName: 'FundedNext Ltd', country: 'GB', role: 'dissolved', registration: '14492007' },
    ],
    markets: ['forex', 'indices', 'crypto', 'stocks'],
    rules: { steps: 2, profitTargetPct: 8, dailyDrawdownPct: 5, maxDrawdownPct: 10, drawdownType: 'static', consistencyRule: true, timeLimitDays: null, newsTrading: true, weekendHolding: true, minTradingDays: 5 },
    // 80 on the Stellar 2-Step this record describes, rising to 90 through
    // Scale-Up. 95 is either the top of a performance ladder or a paid add-on
    // that costs 20% on top of the challenge price — a number you can buy.
    payout: { splitPct: 80, frequencyDays: 14, firstPayoutDays: 21, verifiedProofs: 0 },
    feeUsdPer100k: 549, platforms: ['MT4', 'MT5', 'cTrader'],
    transparency: { publishesRuleChanges: true, disclosesLegalEntity: true, disclosesExecutionBroker: false },
    why: 'Four companies in three countries, and the best split is one you pay extra for',
    logo: { initials: 'FN', bg: '#4A5FD9', fg: '#FFFFFF', img: '/logos/fundednext.png' },
  },
  {
    slug: 'alpha-capital-group', name: 'Alpha Capital Group', founded: 2021, headquarters: 'GB',
    website: 'https://alphacapitalgroup.uk/',
    // Companies House 13719951, incorporated 2 November 2021, registered office
    // in Harpenden rather than the London of the marketing — and filed under SIC
    // 62090, "other information technology service activities". ACG Markets is
    // the group's own brokerage, licensed in the Seychelles, and is a different
    // company from the one selling the evaluation.
    entities: [
      { legalName: 'Alpha Capital Group Limited', country: 'GB', role: 'contracting', registration: '13719951' },
      { legalName: 'ACG Markets Ltd', country: 'SC', role: 'group' },
    ],
    markets: ['forex', 'indices', 'crypto'],
    // Three corrections here, and all three had been in the firm's favour: the
    // minimum was never zero (three trading days per phase), there IS a
    // consistency rule (no single day above 40% of total profit), and the split
    // is 80.
    rules: { steps: 2, profitTargetPct: 8, dailyDrawdownPct: 4, maxDrawdownPct: 8, drawdownType: 'static', consistencyRule: true, timeLimitDays: null, newsTrading: true, weekendHolding: true, minTradingDays: 3 },
    payout: { splitPct: 80, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 599, platforms: ['MT5', 'cTrader'],
    transparency: { publishesRuleChanges: false, disclosesLegalEntity: true, disclosesExecutionBroker: false },
    why: 'A British company behind the brand, and a 40% best-day rule behind the target',
    logo: { initials: 'AC', bg: '#7C5CD6', fg: '#FFFFFF', img: '/logos/alpha-capital-group.png' },
  },
  {
    slug: 'topstep', name: 'Topstep', founded: 2012, headquarters: 'US',
    website: 'https://www.topstep.com/',
    entities: [
      { legalName: 'TopstepTrader, LLC', country: 'US', role: 'contracting' },
    ],
    markets: ['futures'],
    rules: { steps: 1, profitTargetPct: 6, dailyDrawdownPct: 2, maxDrawdownPct: 4, drawdownType: 'eod-trailing', consistencyRule: true, timeLimitDays: null, newsTrading: true, weekendHolding: false, minTradingDays: 2 },
    payout: { splitPct: 90, frequencyDays: 7, firstPayoutDays: 7, verifiedProofs: 0 },
    feeUsdPer100k: 1090, platforms: ['TradingView', 'NinjaTrader', 'Quantower'],
    transparency: { publishesRuleChanges: true, disclosesLegalEntity: true, disclosesExecutionBroker: true },
    why: 'The longest-running futures programme; weekly payouts from day seven',
    logo: { initials: 'TS', bg: '#C4762C', fg: '#FFFFFF', img: '/logos/topstep.png' },
  },
  {
    slug: 'e8-markets', name: 'E8 Markets', founded: 2021, headquarters: 'US',
    website: 'https://e8markets.com/',
    // Texas is where the contract is. Saint Lucia is where the MT5 accounts
    // are, which is the platform most of its traders actually use.
    entities: [
      { legalName: 'E8 Funding LLC', country: 'US', role: 'contracting' },
      { legalName: 'E8 Markets Ltd', country: 'LC', role: 'trading', registration: '2025-00347' },
    ],
    markets: ['forex', 'indices', 'crypto'],
    rules: { steps: 2, profitTargetPct: 8, dailyDrawdownPct: 5, maxDrawdownPct: 8, drawdownType: 'eod-trailing', consistencyRule: false, timeLimitDays: null, newsTrading: true, weekendHolding: true, minTradingDays: 0 },
    payout: { splitPct: 80, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 588, platforms: ['MT5', 'Match-Trader'],
    transparency: { publishesRuleChanges: false, disclosesLegalEntity: true, disclosesExecutionBroker: false },
    why: 'Flexible rules offset by a lower split and end-of-day trailing drawdown',
    logo: { initials: 'E8', bg: '#0F5FA6', fg: '#FFFFFF', img: '/logos/e8-markets.png' },
  },
  {
    slug: 'the5ers', name: 'The5%ers', founded: 2016, headquarters: 'IL',
    website: 'https://the5ers.com/',
    // One company, named twice in its own terms — registered in England and
    // Wales as 12553363 and in Israel as 515864007. The English filing gives
    // SIC 78300: "human resources provision and management of human resources
    // functions". A prop firm filed as a recruitment business.
    entities: [
      { legalName: 'Five Percent Online Ltd', country: 'GB', role: 'contracting', registration: '12553363' },
      { legalName: 'Five Percent Online Ltd', country: 'IL', role: 'group', registration: '515864007' },
    ],
    markets: ['forex', 'indices'],
    // The High Stakes programme, which is the flagship 2-step. Every number
    // here was wrong: 8% then 5% rather than a flat 6%, 5% daily rather than 4%,
    // 10% overall rather than 6%. The old figures look like Hyper Growth's,
    // which is a different product with a different shape.
    rules: { steps: 2, profitTargetPct: 8, dailyDrawdownPct: 5, maxDrawdownPct: 10, drawdownType: 'static', consistencyRule: true, timeLimitDays: null, newsTrading: false, weekendHolding: true, minTradingDays: 3 },
    // 80 at funding. 100% is the top of a progression, and publishing it as the
    // split made the single loudest claim on this page a claim about a state
    // almost nobody is in.
    payout: { splitPct: 80, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 1150, platforms: ['MT5'],
    transparency: { publishesRuleChanges: false, disclosesLegalEntity: true, disclosesExecutionBroker: false },
    why: 'A route to a 100% split, starting at 80, with a four-minute blackout around the news',
    logo: { initials: 'T5', bg: '#D4404F', fg: '#FFFFFF', img: '/logos/the5ers.png' },
  },
  {
    slug: 'breakout', name: 'Breakout', founded: 2023, headquarters: 'AE',
    website: 'https://breakoutprop.com/',
    // Kraken completed the acquisition with effect from 1 September 2025, and
    // the funded programme now runs as Kraken Prop through Payward Oceanic. It
    // is the only firm in this list owned by an exchange this site also ranks,
    // which is a fact about both records.
    entities: [
      { legalName: 'Breakout Trading Group, LLC', country: 'US', role: 'contracting' },
      { legalName: 'Payward Oceanic Ltd', country: 'US', role: 'trading' },
      { legalName: 'Payward, Inc. (Kraken)', country: 'US', role: 'group' },
    ],
    markets: ['crypto'],
    rules: { steps: 1, profitTargetPct: 10, dailyDrawdownPct: 6, maxDrawdownPct: 12, drawdownType: 'intraday-trailing', consistencyRule: false, timeLimitDays: null, newsTrading: true, weekendHolding: true, minTradingDays: 0 },
    payout: { splitPct: 80, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 499, platforms: ['Proprietary'],
    transparency: { publishesRuleChanges: false, disclosesLegalEntity: false, disclosesExecutionBroker: false },
    why: 'Crypto-only and cheap, but intraday trailing drawdown is the strictest form',
    logo: { initials: 'BR', bg: '#2FA97C', fg: '#FFFFFF', img: '/logos/breakout.png' },
  },
];

export const propBySlug = (slug: string) => PROPS.find((p) => p.slug === slug);
