import type { PropFirm } from '../props.ts';

/**
 * SEED DATA — NOT YET VERIFIED. Prop firms change their rules more often than
 * any other category on this site and rarely announce it, so every record here
 * must be re-read from the firm's own rules page before publication, and then
 * watched by the rule-change job.
 */
export const PROPS: PropFirm[] = [
  {
    slug: 'ftmo', name: 'FTMO', founded: 2015, headquarters: 'CZ',
    markets: ['forex', 'indices', 'crypto', 'stocks'],
    rules: { steps: 2, profitTargetPct: 10, dailyDrawdownPct: 5, maxDrawdownPct: 10, drawdownType: 'static', consistencyRule: false, timeLimitDays: null, newsTrading: true, weekendHolding: true, minTradingDays: 4 },
    payout: { splitPct: 90, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 540, platforms: ['MT4', 'MT5', 'cTrader', 'DXtrade'],
    transparency: { publishesRuleChanges: true, disclosesLegalEntity: true, disclosesExecutionBroker: true },
    why: 'Static drawdown and no time limit — the rules most traders can actually survive',
    logo: { initials: 'FT', bg: '#1F6B5A', fg: '#FFFFFF' },
  },
  {
    slug: 'fundingpips', name: 'FundingPips', founded: 2022, headquarters: 'AE',
    markets: ['forex', 'indices', 'crypto'],
    rules: { steps: 2, profitTargetPct: 8, dailyDrawdownPct: 4, maxDrawdownPct: 8, drawdownType: 'static', consistencyRule: false, timeLimitDays: null, newsTrading: true, weekendHolding: false, minTradingDays: 3 },
    payout: { splitPct: 90, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 439, platforms: ['MT5', 'cTrader', 'Match-Trader'],
    transparency: { publishesRuleChanges: true, disclosesLegalEntity: true, disclosesExecutionBroker: false },
    why: 'Cheapest static-drawdown challenge in the directory',
    logo: { initials: 'FP', bg: '#3E5AD4', fg: '#FFFFFF' },
  },
  {
    slug: 'fundednext', name: 'FundedNext', founded: 2022, headquarters: 'AE',
    markets: ['forex', 'indices', 'crypto', 'stocks'],
    rules: { steps: 2, profitTargetPct: 8, dailyDrawdownPct: 5, maxDrawdownPct: 10, drawdownType: 'static', consistencyRule: true, timeLimitDays: null, newsTrading: true, weekendHolding: true, minTradingDays: 5 },
    payout: { splitPct: 95, frequencyDays: 14, firstPayoutDays: 21, verifiedProofs: 0 },
    feeUsdPer100k: 549, platforms: ['MT4', 'MT5', 'cTrader'],
    transparency: { publishesRuleChanges: true, disclosesLegalEntity: true, disclosesExecutionBroker: false },
    why: 'Highest profit split, but a consistency rule applies from phase two',
    logo: { initials: 'FN', bg: '#4A5FD9', fg: '#FFFFFF' },
  },
  {
    slug: 'alpha-capital-group', name: 'Alpha Capital Group', founded: 2021, headquarters: 'GB',
    markets: ['forex', 'indices', 'crypto'],
    rules: { steps: 2, profitTargetPct: 8, dailyDrawdownPct: 4, maxDrawdownPct: 8, drawdownType: 'static', consistencyRule: false, timeLimitDays: null, newsTrading: true, weekendHolding: true, minTradingDays: 0 },
    payout: { splitPct: 90, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 599, platforms: ['MT5', 'cTrader'],
    transparency: { publishesRuleChanges: false, disclosesLegalEntity: true, disclosesExecutionBroker: false },
    why: 'No minimum trading days — a fast pass is possible',
    logo: { initials: 'AC', bg: '#7C5CD6', fg: '#FFFFFF' },
  },
  {
    slug: 'topstep', name: 'Topstep', founded: 2012, headquarters: 'US',
    markets: ['futures'],
    rules: { steps: 1, profitTargetPct: 6, dailyDrawdownPct: 2, maxDrawdownPct: 4, drawdownType: 'eod-trailing', consistencyRule: true, timeLimitDays: null, newsTrading: true, weekendHolding: false, minTradingDays: 2 },
    payout: { splitPct: 90, frequencyDays: 7, firstPayoutDays: 7, verifiedProofs: 0 },
    feeUsdPer100k: 1090, platforms: ['TradingView', 'NinjaTrader', 'Quantower'],
    transparency: { publishesRuleChanges: true, disclosesLegalEntity: true, disclosesExecutionBroker: true },
    why: 'The longest-running futures programme; weekly payouts from day seven',
    logo: { initials: 'TS', bg: '#C4762C', fg: '#FFFFFF' },
  },
  {
    slug: 'e8-markets', name: 'E8 Markets', founded: 2021, headquarters: 'US',
    markets: ['forex', 'indices', 'crypto'],
    rules: { steps: 2, profitTargetPct: 8, dailyDrawdownPct: 5, maxDrawdownPct: 8, drawdownType: 'eod-trailing', consistencyRule: false, timeLimitDays: null, newsTrading: true, weekendHolding: true, minTradingDays: 0 },
    payout: { splitPct: 80, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 588, platforms: ['MT5', 'Match-Trader'],
    transparency: { publishesRuleChanges: false, disclosesLegalEntity: true, disclosesExecutionBroker: false },
    why: 'Flexible rules offset by a lower split and end-of-day trailing drawdown',
    logo: { initials: 'E8', bg: '#0F5FA6', fg: '#FFFFFF' },
  },
  {
    slug: 'the5ers', name: 'The5%ers', founded: 2016, headquarters: 'IL',
    markets: ['forex', 'indices'],
    rules: { steps: 2, profitTargetPct: 6, dailyDrawdownPct: 4, maxDrawdownPct: 6, drawdownType: 'static', consistencyRule: true, timeLimitDays: null, newsTrading: false, weekendHolding: true, minTradingDays: 3 },
    payout: { splitPct: 100, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 1150, platforms: ['MT5'],
    transparency: { publishesRuleChanges: false, disclosesLegalEntity: true, disclosesExecutionBroker: false },
    why: 'A full 100% split, paid for with the tightest drawdown and no news trading',
    logo: { initials: 'T5', bg: '#D4404F', fg: '#FFFFFF' },
  },
  {
    slug: 'breakout', name: 'Breakout', founded: 2023, headquarters: 'AE',
    markets: ['crypto'],
    rules: { steps: 1, profitTargetPct: 10, dailyDrawdownPct: 6, maxDrawdownPct: 12, drawdownType: 'intraday-trailing', consistencyRule: false, timeLimitDays: null, newsTrading: true, weekendHolding: true, minTradingDays: 0 },
    payout: { splitPct: 80, frequencyDays: 14, firstPayoutDays: 14, verifiedProofs: 0 },
    feeUsdPer100k: 499, platforms: ['Proprietary'],
    transparency: { publishesRuleChanges: false, disclosesLegalEntity: false, disclosesExecutionBroker: false },
    why: 'Crypto-only and cheap, but intraday trailing drawdown is the strictest form',
    logo: { initials: 'BR', bg: '#2FA97C', fg: '#FFFFFF' },
  },
];

export const propBySlug = (slug: string) => PROPS.find((p) => p.slug === slug);
