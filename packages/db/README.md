# @commentfx/db

One schema, two backends. With `DATABASE_URL` set this is real PostgreSQL; with
it unset an embedded PostgreSQL (PGlite, compiled to WASM) runs in-process, so a
fresh checkout needs no database to install and `pnpm test` exercises the exact
DDL that ships.

```sh
pnpm --filter @commentfx/db generate   # SQL migrations from the schema
pnpm --filter @commentfx/db seed       # load the curated records
pnpm --filter @commentfx/db test       # against a throwaway in-memory database
```

## One constraint worth knowing

**A file-backed PGlite database is single-process.** A running dev server holds
it, so a build started alongside cannot open it and every lookup fails. That
cost a full debugging cycle here. Stop the dev server before building, or point
`DATABASE_URL` at a real PostgreSQL and the constraint disappears.

`PGLITE_DIR` chooses the directory (default `.pglite`). Tests always get a fresh
in-memory database and never touch it.

## Why verification is per field

`verifications` is keyed on `(kind, slug, field)`, not on the record, because
that is how checking actually happens: someone reads a licence number off the
regulator's register on Monday and the withdrawal terms off the broker's own
page on Thursday. A single `verified_at` column on the row would claim more than
anyone did.

Three things are required for every row and enforced in the action, not the form:

- **A source URL**, https only. A verification with no source is an opinion.
- **The value as seen at that source**, so drift is detectable later — when a
  re-check records a different value, the admin says so rather than overwriting
  quietly.
- **An audit row.** `audit_log` is append-only and the admin exposes no route
  that deletes from it.

Seeding writes no verification rows. A script running is not a person checking.

## Staleness

A verification expires after 90 days (`STALE_AFTER_DAYS`). Expired is a distinct
state from unverified in the UI, because "checked, but a while ago" and "never
checked" are different facts and the reader is entitled to both.
