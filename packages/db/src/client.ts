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

let cached: Promise<DbHandle> | null = null;

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

/** Applies every generated migration in order. Statements are idempotent-safe. */
async function applyMigrations(client: { exec: (sql: string) => Promise<unknown> }) {
  const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    const sql = readFileSync(join(dir, f), 'utf8');
    for (const stmt of sql.split('--> statement-breakpoint')) {
      const trimmed = stmt.trim();
      if (!trimmed) continue;
      try {
        await client.exec(trimmed);
      } catch (err) {
        // A file-backed database keeps its tables between runs; re-applying the
        // same DDL is expected and not an error.
        const msg = err instanceof Error ? err.message : String(err);
        if (!/already exists/i.test(msg)) throw err;
      }
    }
  }
}

export function getDb(): Promise<DbHandle> {
  if (!cached) cached = makeDb();
  return cached;
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
