import type { Regulator } from './types.ts';

/**
 * Tier A — statutory compensation scheme, enforced capital rules, a public
 * register anyone can check.
 * Tier B — real supervision, weaker or no compensation scheme.
 * Tier C — registration only. In practice no recourse for a retail client.
 */
export const REGULATORS: Record<string, Regulator> = {
  FCA:      { code: 'FCA',      name: 'Financial Conduct Authority',            country: 'GB', tier: 'A', compensation: 'FSCS up to £85,000',  registryUrl: 'https://register.fca.org.uk/' },
  ASIC:     { code: 'ASIC',     name: 'Australian Securities & Investments Commission', country: 'AU', tier: 'A', compensation: null,          registryUrl: 'https://connectonline.asic.gov.au/' },
  CySEC:    { code: 'CySEC',    name: 'Cyprus Securities and Exchange Commission', country: 'CY', tier: 'A', compensation: 'ICF up to €20,000', registryUrl: 'https://www.cysec.gov.cy/en-GB/entities/investment-firms/cypriot/' },
  BaFin:    { code: 'BaFin',    name: 'Federal Financial Supervisory Authority', country: 'DE', tier: 'A', compensation: 'EdW up to €20,000',  registryUrl: 'https://portal.mvp.bafin.de/database/InstInfo/' },
  FINMA:    { code: 'FINMA',    name: 'Swiss Financial Market Supervisory Authority', country: 'CH', tier: 'A', compensation: 'up to CHF 100,000', registryUrl: 'https://www.finma.ch/en/finma-public/authorised-institutions-individuals-and-products/' },
  MAS:      { code: 'MAS',      name: 'Monetary Authority of Singapore',        country: 'SG', tier: 'A', compensation: null,                 registryUrl: 'https://eservices.mas.gov.sg/fid' },
  NFA:      { code: 'NFA',      name: 'National Futures Association',           country: 'US', tier: 'A', compensation: null,                 registryUrl: 'https://www.nfa.futures.org/basicnet/' },
  FSCA:     { code: 'FSCA',     name: 'Financial Sector Conduct Authority',     country: 'ZA', tier: 'B', compensation: null,                 registryUrl: 'https://www.fsca.co.za/Fais/Search_FSP.htm' },
  DFSA:     { code: 'DFSA',     name: 'Dubai Financial Services Authority',     country: 'AE', tier: 'B', compensation: null,                 registryUrl: 'https://www.dfsa.ae/public-register' },
  MFSA:     { code: 'MFSA',     name: 'Malta Financial Services Authority',     country: 'MT', tier: 'B', compensation: 'ICS up to €20,000',  registryUrl: 'https://www.mfsa.mt/financial-services-register/' },
  'FSC-MU': { code: 'FSC-MU',   name: 'Financial Services Commission Mauritius', country: 'MU', tier: 'C', compensation: null,                registryUrl: 'https://www.fscmauritius.org/en/supervision/register-of-licensees' },
  'FSA-SC': { code: 'FSA-SC',   name: 'Financial Services Authority Seychelles', country: 'SC', tier: 'C', compensation: null,                registryUrl: 'https://fsaseychelles.sc/regulated-entities' },
  'IFSC-BZ':{ code: 'IFSC-BZ',  name: 'Financial Services Commission Belize',   country: 'BZ', tier: 'C', compensation: null,                 registryUrl: 'https://www.ifsc.gov.bz/' },
  'FSA-SVG':{ code: 'FSA-SVG',  name: 'Financial Services Authority SVG',       country: 'VC', tier: 'C', compensation: null,                 registryUrl: 'https://svgfsa.com/' },
};

export const TIER_SCORE: Record<Regulator['tier'], number> = { A: 10, B: 6.5, C: 2.5 };

export function regulator(code: string): Regulator | undefined {
  return REGULATORS[code];
}
