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
    const pool = new Pool({ connectionString: url, max: poolMax() });
    await migratePostgres(Pool);
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

/**
 * An arbitrary but fixed number, so every instance of this application asks for
 * the same lock and no other application is likely to collide with it. The
 * ASCII of "cmfx".
 */
const MIGRATION_LOCK = 0x636d6678;

/**
 * How many connections one instance of this application may hold.
 *
 * Ten is right for a long-running server and wrong for a serverless one, which
 * is what this is deployed as. There, an instance is one request's worth of
 * work and there may be dozens of them at once — ten each is how a Postgres
 * with a hundred connections runs out during a traffic spike rather than
 * during a load test. Three is enough for the handful of queries a page makes
 * in parallel, and anything with a real server in front of it can say so.
 */
const poolMax = () => Number(process.env.DB_POOL_MAX ?? 3);

/**
 * The connection migrations run on, which is not always the one queries use.
 *
 * A pooled Postgres — Supabase's pooler, pgbouncer, anything in transaction
 * mode — hands each statement whichever backend is free. That is exactly what a
 * serverless deployment wants for queries and exactly what a migration cannot
 * have: `pg_advisory_lock` is held by a session, so taking it on one backend
 * and releasing it on another means the lock never locked anything, and a dozen
 * cold starts run concurrent DDL against each other. The ledger keeps that from
 * corrupting anything, but concurrent CREATE TABLE is still how a deploy
 * deadlocks.
 *
 * So: point `MIGRATE_DATABASE_URL` at the direct connection (Supabase calls it
 * the session-mode or direct URL, port 5432) and `DATABASE_URL` at the pooler.
 * Unset, this is the same URL as everything else, which is correct for a
 * Postgres you connect to directly.
 */
const migrationUrl = (fallback: string) => process.env.MIGRATE_DATABASE_URL ?? fallback;

/**
 * Real Postgres gets its schema the same way the embedded one does.
 *
 * It did not until a deploy was attempted, and the shape of the mistake is
 * worth keeping: the branch that only ever runs in development migrated itself
 * on every start, and the branch that only ever runs in production did not.
 * Nothing caught it, because nothing here had ever pointed at a real Postgres.
 * A fresh database answered the first query with `relation "regulators" does
 * not exist` — a deployment that installs cleanly, builds cleanly, serves every
 * read-only page, and fails the moment anybody writes.
 *
 * Under an advisory lock, because on a serverless host a cold start is not one
 * process: a dozen instances can reach this line in the same second, and
 * concurrent DDL is how a deploy deadlocks. The ledger makes it idempotent, the
 * lock makes it orderly, and both are needed. The lock is held on one dedicated
 * connection and released in a finally, so a migration that throws does not
 * leave the next instance waiting.
 */
async function migratePostgres(Pool: typeof import('pg').Pool): Promise<void> {
  // Its own pool of one, on the migration URL, closed when this is done. The
  // query pool may be pointed at a transaction pooler, where a session-held
  // advisory lock is not held by anything.
  const pool = new Pool({ connectionString: migrationUrl(process.env.DATABASE_URL!), max: 1 });
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK]);
    await applyMigrations({
      exec: (sql) => client.query(sql),
      query: <T>(sql: string) => client.query(sql) as unknown as Promise<{ rows: T[] }>,
    });
  } finally {
    // Best effort: if the connection is already gone the lock went with it.
    await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK]).catch(() => {});
    client.release();
    await pool.end().catch(() => {});
  }
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
