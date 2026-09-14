/**
 * A regulator's public register, behind one interface.
 *
 * Every regulator publishes this data precisely so that anyone can check a firm
 * before dealing with it, which is what this reads it for: once a day, with an
 * identifying user agent, taking only what is already public.
 *
 * An adapter that cannot reach its source returns `unavailable` with the reason
 * rather than throwing or returning an empty register — because "the register
 * says nothing" and "we could not read the register" must never collapse into
 * the same answer. Treating a fetch failure as an absent licence would accuse
 * a firm of something on the strength of a network error.
 */

export interface RegisterEntry {
  licenceNumber: string;
  firmName: string;
  /** Trading names the register lists alongside the legal name. */
  tradingNames: string[];
  status: 'active' | 'withdrawn' | 'suspended' | 'unknown';
}

export type RegisterResult =
  | { ok: true; regulator: string; sourceUrl: string; entries: RegisterEntry[]; fetchedAt: string }
  | { ok: false; regulator: string; sourceUrl: string; reason: string; fetchedAt: string };

export interface RegisterSource {
  /** Matches the regulator code used across the rest of the codebase. */
  code: string;
  name: string;
  sourceUrl: string;
  fetch(): Promise<RegisterResult>;
}

/** Normalises a company name for comparison: case, punctuation, suffixes. */
export function normaliseName(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[.,'"()]/g, ' ')
    .replace(/\b(LIMITED|LTD|PLC|INC|CORP|COMPANY|CO)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export type FindingKind = 'confirmed' | 'name-mismatch' | 'not-found' | 'source-unavailable';

export interface Finding {
  regulator: string;
  licenceNumber: string;
  /** The name we publish. */
  claimedName: string;
  /** The name the register carries, when the licence was found. */
  registerName: string | null;
  kind: FindingKind;
  detail: string;
}

/**
 * Compares what we publish against what the register says. The name comparison
 * is deliberately loose — registers carry legal names, trading names and
 * historic names — so a mismatch is reported for a human to look at, never
 * acted on automatically.
 */
export function compareLicence(
  result: RegisterResult,
  licenceNumber: string,
  claimedName: string,
): Finding {
  const base = { regulator: result.regulator, licenceNumber, claimedName };

  if (!result.ok) {
    return {
      ...base, registerName: null, kind: 'source-unavailable',
      detail: `Could not read the register (${result.reason}). This says nothing about the licence.`,
    };
  }

  const entry = result.entries.find((e) => e.licenceNumber === licenceNumber);
  if (!entry) {
    return {
      ...base, registerName: null, kind: 'not-found',
      detail: `Licence ${licenceNumber} is not in the current register of ${result.entries.length} firms. It may have been withdrawn, or the number we hold may be wrong.`,
    };
  }

  const want = normaliseName(claimedName);
  const candidates = [entry.firmName, ...entry.tradingNames].map(normaliseName);
  const matched = candidates.some((c) => c.includes(want) || want.includes(c));

  if (!matched) {
    return {
      ...base, registerName: entry.firmName, kind: 'name-mismatch',
      detail: `The register holds this licence under "${entry.firmName}", which does not obviously match "${claimedName}".`,
    };
  }

  return {
    ...base, registerName: entry.firmName, kind: 'confirmed',
    detail: `Confirmed on the register as "${entry.firmName}".`,
  };
}
