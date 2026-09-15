import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema.ts';

/**
 * Both backends are Postgres and share this schema, so callers work against one
 * type and never branch on which driver is underneath.
 */
export type AppDb = PgDatabase<PgQueryResultHKT, typeof schema>;

export interface DbHandle {
  db: AppDb;
  kind: 'postgres' | 'pglite';
  close: () => Promise<void>;
}

/**
 * The handle is kept on globalThis, not in a module variable.
 *
 * This is not the usual hot-reload workaround. A bundler splits the server
 * into chunks, and a module-level `let` is per chunk — so the chunk holding a
 * server action and the chunk holding a page each built their own handle. With
 * real Postgres that is two connection pools and nobody notices. With a
 * file-backed PGlite it is two embedded databases over one directory, and they
 * cannot see each other's writes: a review was published, the row was really
 * there, and every page — including a force-dynamic one — rendered as though
 * nothing had been written. Days of "revalidation is flaky" were this.
 */
const HANDLE = Symbol.for('commentfx.db.handle');

interface GlobalWithDb { [HANDLE]?: Promise<DbHandle> }
const globalForDb = globalThis as unknown as GlobalWithDb;

/**
 * One schema, two backends. With DATABASE_URL set this is real Postgres; with
 * it unset an embedded Postgres runs in-process, so `pnpm test` and a fresh
 * checkout need no database to install and the DDL exercised in dev is exactly
 * the DDL that ships.
 */
async function makeDb(): Promise<DbHandle> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: url, max: 10 });
    return { db: drizzle(pool, { schema }) as unknown as AppDb, kind: 'postgres', close: () => pool.end() };
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  // A directory makes dev data survive a restart; in-memory is for tests.
  const dir = process.env.PGLITE_DIR ?? '.pglite';
  const client = new PGlite(dir);
  await applyMigrations(client);
  return { db: drizzle(client, { schema }) as unknown as AppDb, kind: 'pglite', close: () => client.close() };
}

export interface MigrationClient {
  exec: (sql: string) => Promise<unknown>;
  query: <T>(sql: string) => Promise<{ rows: T[] }>;
}

/**
 * Applies each migration once, in order, and remembers which.
 *
 * The ledger is not ceremony. This used to simply re-run every file on every
 * start and swallow "already exists", which works exactly as long as migrations
 * only ever add things. The first migration that DROPPED a column broke it: on
 * the second start, an earlier migration tried to add a constraint on a column
 * a later one had removed, failed with an error that was not "already exists",
 * and took the process down. A file-backed database would have started once and
 * never again.
 *
 * The tolerance is kept for the first pass only, so a database created before
 * this ledger existed can still adopt it without replaying into errors.
 */
export async function applyMigrations(client: MigrationClient) {
  const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  await client.exec(
    `CREATE TABLE IF NOT EXISTS _migrations (
       name text PRIMARY KEY,
       applied_at timestamptz NOT NULL DEFAULT now()
     )`,
  );
  const { rows } = await client.query<{ name: string }>('SELECT name FROM _migrations');
  const applied = new Set(rows.map((r) => r.name));

  for (const f of files) {
    if (applied.has(f)) continue;

    const sql = readFileSync(join(dir, f), 'utf8');
    for (const stmt of sql.split('--> statement-breakpoint')) {
      const trimmed = stmt.trim();
      if (!trimmed) continue;
      try {
        await client.exec(trimmed);
      } catch (err) {
        // A database that predates the ledger already holds these tables.
        const msg = err instanceof Error ? err.message : String(err);
        if (!/already exists/i.test(msg)) throw err;
      }
    }
    await client.exec(`INSERT INTO _migrations (name) VALUES ('${f}') ON CONFLICT DO NOTHING`);
  }
}

export function getDb(): Promise<DbHandle> {
  globalForDb[HANDLE] ??= makeDb();
  return globalForDb[HANDLE];
}

/** Test helper: a fresh in-memory database per call, never cached. */
export async function makeTestDb(): Promise<{ db: AppDb; close: () => Promise<void> }> {
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const client = new PGlite();
  await applyMigrations(client);
  return { db: drizzle(client, { schema }) as unknown as AppDb, close: () => client.close() };
}

export { schema };
