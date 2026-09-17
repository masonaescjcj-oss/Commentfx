import 'server-only';
import { getDb, livePatches, type Kind } from '@commentfx/db';
import {
  BROKERS, PROPS, EXCHANGES, brokerBySlug, propBySlug, exchangeBySlug,
  type Broker, type PropFirm, type Exchange,
} from '@commentfx/core';
import { DB_ENABLED } from './db-available.ts';
import { patchKey, type Patches } from './repo.ts';

/**
 * The live editor overrides, in the shape the ranking functions take.
 *
 * Same contract as `reviewStats`: no database, or a database that will not
 * answer, means an empty map and a site that renders exactly what the code
 * says. An admin panel being down is not a reason for the directory to be
 * down, and this is the line that guarantees it.
 */
export async function livePatchMap(): Promise<Patches> {
  if (!DB_ENABLED) return new Map();
  try {
    const { db } = await getDb();
    const rows = await livePatches(db);
    return new Map(
      [...rows.values()].map((r) => [patchKey(r.kind, r.slug), { patch: r.patch, isNew: r.isNew }]),
    );
  } catch (err) {
    console.error('[records] override lookup failed:', err);
    return new Map();
  }
}

/**
 * The record as the code says it, before any override.
 *
 * The editor needs both halves at once: this to show what a value used to be
 * and to work out what actually changed, and the merged record to show what a
 * reader currently sees. Undefined means the record exists nowhere in code,
 * which is how the admin knows it is creating rather than patching.
 */
export function baseRecord(kind: Kind, slug: string): Broker | PropFirm | Exchange | undefined {
  if (kind === 'broker') return brokerBySlug(slug);
  if (kind === 'prop') return propBySlug(slug);
  return exchangeBySlug(slug);
}

/** Every slug the code knows about, in ranking order. */
export function codeSlugs(kind: Kind): string[] {
  if (kind === 'broker') return BROKERS.map((b) => b.slug);
  if (kind === 'prop') return PROPS.map((p) => p.slug);
  return EXCHANGES.map((e) => e.slug);
}
