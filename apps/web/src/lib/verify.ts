import 'server-only';
import { getDb, coverageFor, verificationQueue, type Coverage, type Kind } from '@commentfx/db';

/**
 * The public site must work with no database at all — that is how it is built
 * and deployed today. When there is no database, there are no verifications,
 * and every page says so rather than implying facts were checked.
 */
export const DB_ENABLED = process.env.DATABASE_URL !== undefined || process.env.PGLITE_DIR !== undefined;

export async function coverage(kind: Kind, slug: string): Promise<Coverage | null> {
  if (!DB_ENABLED) return null;
  try {
    const { db } = await getDb();
    return await coverageFor(db, kind, slug);
  } catch (err) {
    // A database problem must never take a public page down -- but it must be
    // visible in the logs, not swallowed. Silently returning null here once hid
    // a real bundling bug for a full build cycle.
    console.error('[verify] coverage lookup failed:', err);
    return null;
  }
}

export async function queue(kind: Kind, slugs: string[]) {
  const { db } = await getDb();
  return verificationQueue(db, kind, slugs);
}

export { type Coverage, type Kind };
