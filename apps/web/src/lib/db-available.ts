import 'server-only';

/**
 * Whether a database is configured at all.
 *
 * The read paths have always checked this and degraded politely. The write
 * actions did not: they called getDb() regardless, which falls back to an
 * embedded database in a local directory — so on a deployment with nothing
 * configured, the first report quietly created a database on the server's disk
 * that nobody knew about and a redeploy would wipe. The reader got no error
 * either, because from their side it had worked.
 *
 * A write with nowhere to go should say so.
 */
export const DB_ENABLED =
  process.env.DATABASE_URL !== undefined || process.env.PGLITE_DIR !== undefined;

/** What a form says when there is nowhere to write. */
export const NO_DB_MESSAGE =
  'This deployment has no database, so nothing can be recorded here yet.';
