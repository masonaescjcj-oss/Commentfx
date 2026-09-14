import 'server-only';
import type { StatusSummary } from '@commentfx/core';
import { getDb, statusFor, statusForAll } from '@commentfx/db';
import { DB_ENABLED } from './verify';

/** As with verification, no database means no reports — and the UI says so. */
export async function brokerStatus(slug: string): Promise<StatusSummary | null> {
  if (!DB_ENABLED) return null;
  try {
    const { db } = await getDb();
    return await statusFor(db, slug);
  } catch (err) {
    console.error('[status] lookup failed:', err);
    return null;
  }
}

export async function allStatus(slugs: string[]): Promise<StatusSummary[] | null> {
  if (!DB_ENABLED) return null;
  try {
    const { db } = await getDb();
    return await statusForAll(db, slugs);
  } catch (err) {
    console.error('[status] lookup failed:', err);
    return null;
  }
}

export type { StatusSummary };
