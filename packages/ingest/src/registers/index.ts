import { BROKERS } from '@commentfx/core';
import { compareLicence, type Finding, type RegisterResult, type RegisterSource } from './types.ts';
import { cysec } from './cysec.ts';

export * from './types.ts';
export { cysec, parseCysec } from './cysec.ts';

/**
 * Sources that exist but could not be read from our infrastructure. They are
 * declared rather than omitted so the admin shows them as blocked with a
 * reason, instead of the register coverage looking complete when it is not.
 *
 * Each was probed directly: the FCA's API requires a registered key and its
 * search page is a JavaScript shell; ASIC and the Mauritius FSC refuse
 * datacentre traffic outright; the NFA's BASIC search renders client-side.
 * These may well succeed from a different host, which is why they stay here as
 * adapters waiting to be implemented rather than being deleted.
 */
export const BLOCKED_SOURCES: Array<{ code: string; name: string; sourceUrl: string; reason: string }> = [
  { code: 'FCA', name: 'Financial Conduct Authority', sourceUrl: 'https://register.fca.org.uk/',
    reason: 'API requires a registered key; the public search page renders client-side' },
  { code: 'ASIC', name: 'Australian Securities & Investments Commission', sourceUrl: 'https://connectonline.asic.gov.au/',
    reason: 'refuses requests from datacentre addresses (HTTP 403)' },
  { code: 'FSC-MU', name: 'Financial Services Commission Mauritius', sourceUrl: 'https://www.fscmauritius.org/en/supervision/register-of-licensees',
    reason: 'refuses requests from datacentre addresses (HTTP 403)' },
  { code: 'NFA', name: 'National Futures Association', sourceUrl: 'https://www.nfa.futures.org/basicnet/',
    reason: 'BASIC search renders client-side' },
];

export const SOURCES: RegisterSource[] = [cysec];

export const sourceFor = (code: string) => SOURCES.find((s) => s.code === code);

export async function fetchAllRegisters(): Promise<RegisterResult[]> {
  return Promise.all(SOURCES.map((s) => s.fetch()));
}

/** A finding tied to the record it is about. */
export interface LicenceFinding extends Finding {
  brokerSlug: string;
  brokerName: string;
  sourceUrl: string;
}

/**
 * Compares every licence we publish against the register that issued it.
 *
 * One function so the job that writes findings to the database and the job that
 * reports them in CI can never disagree about what the register said.
 */
export function licenceFindings(results: RegisterResult[]): LicenceFinding[] {
  const out: LicenceFinding[] = [];

  for (const source of SOURCES) {
    const result = results.find((r) => r.regulator === source.code);
    if (!result) continue;

    for (const broker of BROKERS) {
      for (const entity of broker.entities) {
        if (entity.licence.regulator !== source.code) continue;
        out.push({
          ...compareLicence(result, entity.licence.number, entity.legalName),
          brokerSlug: broker.slug,
          brokerName: broker.name,
          sourceUrl: source.sourceUrl,
        });
      }
    }
  }

  return out;
}
