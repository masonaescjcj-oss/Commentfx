/**
 * Country names for the two-letter codes the data carries.
 *
 * "Headquarters: AU" is a field a reader has to decode, and half of them will
 * decode it wrong — AE, SC, VC and MU are not codes anyone holds in their head,
 * and they are exactly the ones that matter on this site, because where a
 * company is registered is most of what its licence is worth.
 *
 * Only the codes that appear in the data and in the regulator table, plus the
 * ones a broker's `serves` list uses. A code with no entry falls back to itself
 * rather than to "Unknown": the code is at least true.
 */
export const COUNTRIES: Record<string, string> = {
  AE: 'United Arab Emirates',
  AU: 'Australia',
  BZ: 'Belize',
  CH: 'Switzerland',
  CY: 'Cyprus',
  CZ: 'Czechia',
  DE: 'Germany',
  ES: 'Spain',
  FR: 'France',
  GB: 'United Kingdom',
  IL: 'Israel',
  IT: 'Italy',
  MT: 'Malta',
  MU: 'Mauritius',
  BS: 'The Bahamas',
  IN: 'India',
  JP: 'Japan',
  KE: 'Kenya',
  KM: 'Comoros',
  NL: 'Netherlands',
  NZ: 'New Zealand',
  PL: 'Poland',
  PH: 'the Philippines',
  SC: 'Seychelles',
  SG: 'Singapore',
  US: 'United States',
  VC: 'St Vincent & the Grenadines',
  ZA: 'South Africa',
};

export const countryName = (code: string): string =>
  Object.hasOwn(COUNTRIES, code) ? COUNTRIES[code]! : code;
