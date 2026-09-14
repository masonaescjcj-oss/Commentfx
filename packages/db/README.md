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

## Incident reports

`status_reports` answers "is it down, or is it just me?" for each broker. Two
rules shape the table and both are load-bearing:

**No address is ever stored.** `reporter_hash` is a SHA-256 digest of the
network address, the user agent, a process secret and the current date. The date
in the input means the salt rotates daily, so reports cannot be correlated
across days. The hash exists to count *distinct* reporters and to deduplicate,
and it can do nothing else.

**A report is evidence, not a verdict.** The displayed status changes only above
a published threshold of distinct reporters inside a rolling window, and the
count, window and threshold are all shown to the reader either way. A unique
index on `(broker, kind, reporter_hash)` makes a repeat submission a no-op, so
one determined person counts once — there is a test that submits thirty times
from one hash and asserts the status stays normal.

Distinct reporters are counted across the whole broker, not summed per kind:
someone reporting both a withdrawal delay and a login failure is one person, and
summing the per-kind counts would let them count twice.

Incident reports never enter any score. Scores move only on verified facts.
