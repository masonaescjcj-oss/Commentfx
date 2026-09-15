import type { NextRequestInit } from '../fetch.ts';
import type { RegisterEntry, RegisterResult, RegisterSource } from './types.ts';

/**
 * ASIC's register of Australian Financial Services licensees.
 *
 * connectonline.asic.gov.au — the search a person would use — refuses
 * datacentre traffic outright, which is why this regulator sat in
 * BLOCKED_SOURCES while four of the licences on this site went unchecked. ASIC
 * also publishes the same register as an open dataset on data.gov.au, which
 * answers fine, is the same authority's own publication, and needs no key.
 *
 * Two requests rather than one hard-coded file, because the CSV is renamed
 * every month (afs_lic_202609.csv) and a URL with a date in it is a link that
 * breaks on a schedule. The catalogue entry is asked for the current resource
 * first, then that resource is read through its datastore, so no version of the
 * file name is written down here.
 */
const DATASET = 'asic-afs-licensee';
const CKAN = 'https://data.gov.au/data/api/3/action';

/** Where a person can check the same thing by hand. */
const SOURCE_URL = 'https://data.gov.au/data/dataset/asic-afs-licensee';

const PAGE = 1000;
/** 6,521 licensees at the time of writing. The cap is a runaway guard. */
const MAX_PAGES = 30;

interface Row {
  AFS_LIC_NUM?: unknown;
  AFS_LIC_NAME?: unknown;
}

export function toEntries(rows: Row[]): RegisterEntry[] {
  const out: RegisterEntry[] = [];
  for (const r of rows) {
    const licenceNumber = String(r.AFS_LIC_NUM ?? '').trim();
    const firmName = String(r.AFS_LIC_NAME ?? '').trim();
    if (!/^\d{4,}$/.test(licenceNumber) || firmName.length < 2) continue;
    out.push({
      licenceNumber,
      firmName,
      // The dataset carries no trading names, and inventing an empty one is
      // not the same as not having the field.
      tradingNames: [],
      /**
       * Every row is a current licensee: the dataset is the live register, not
       * a history of it. A licence that has been cancelled is absent rather
       * than marked, which compareLicence reads as not-found — the right
       * finding for a person to look at, and not one this file should soften
       * into "unknown".
       */
      status: 'active',
    });
  }
  return out;
}

async function json(url: string, init: NextRequestInit): Promise<unknown> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const asic: RegisterSource = {
  code: 'ASIC',
  name: 'Australian Securities & Investments Commission',
  sourceUrl: SOURCE_URL,

  async fetch(): Promise<RegisterResult> {
    const fetchedAt = new Date().toISOString();
    const init: NextRequestInit = {
      headers: { accept: 'application/json', 'user-agent': 'CommentFX/0.1 (+https://commentfx.com)' },
      signal: AbortSignal.timeout(30_000),
      next: { revalidate: 86_400 },
    };
    const fail = (reason: string): RegisterResult =>
      ({ ok: false, regulator: 'ASIC', sourceUrl: SOURCE_URL, reason, fetchedAt });

    let resourceId: string;
    try {
      const pkg = await json(`${CKAN}/package_show?id=${DATASET}`, init) as {
        result?: { resources?: Array<{ format?: string; datastore_active?: boolean; id?: string }> };
      };
      const resources = pkg.result?.resources ?? [];
      const current = resources.find((r) => r.datastore_active && r.format?.toUpperCase() === 'CSV')
        ?? resources.find((r) => r.datastore_active);
      if (!current?.id) return fail('the catalogue lists no queryable resource for this dataset');
      resourceId = current.id;
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'catalogue unreachable');
    }

    const rows: Row[] = [];
    try {
      for (let page = 0; page < MAX_PAGES; page++) {
        const url = `${CKAN}/datastore_search?resource_id=${resourceId}`
          + `&fields=AFS_LIC_NUM,AFS_LIC_NAME&limit=${PAGE}&offset=${page * PAGE}`;
        const body = await json(url, init) as { result?: { records?: Row[] } };
        const batch = body.result?.records ?? [];
        rows.push(...batch);
        if (batch.length < PAGE) break;
      }
    } catch (err) {
      return fail(err instanceof Error ? err.message : 'register unreachable');
    }

    const entries = toEntries(rows);

    /**
     * The same two sanity checks the CySEC adapter has, for the same reason: a
     * parser fails in two ways and only one of them looks like a failure.
     * Australia licenses thousands of firms, so a handful means the shape of
     * the answer changed; and a perfect count with empty names reads as data
     * and would publish false not-founds against every broker here.
     */
    if (entries.length < 1000) {
      return fail(`read only ${entries.length} licensees — the dataset's shape has probably changed`);
    }
    const named = entries.filter((e) => e.firmName.length > 2);
    if (named.length < entries.length * 0.95) {
      return fail(`only ${named.length} of ${entries.length} rows carry a name — the field names have changed`);
    }

    return { ok: true, regulator: 'ASIC', sourceUrl: SOURCE_URL, entries, fetchedAt };
  },
};
