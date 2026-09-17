-- Where an editor's changes live.
--
-- The curated records are TypeScript literals compiled into the build, which is
-- what lets the test suite hold every invariant over them before anything
-- ships. A form cannot edit those files at runtime, so what it writes instead
-- is a patch: the fields somebody changed, stored here, merged over the code
-- record when a page renders. Turning the table off restores the site exactly,
-- because nothing was overwritten to begin with.
--
-- One row per record — the unique index — so the merge never has to choose
-- between two patches. `status` decides whether that row is merged at all: a
-- draft is stored and shown in the admin and invisible to a reader.
--
-- Guarded throughout, because `applyMigrations` re-runs the directory against a
-- file-backed database that may already be at the final shape.
DO $$ BEGIN
  CREATE TYPE "public"."override_status" AS ENUM('draft', 'live');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "record_overrides" (
  "id" serial PRIMARY KEY NOT NULL,
  "kind" "entity_kind" NOT NULL,
  "slug" text NOT NULL,
  "patch" jsonb NOT NULL,
  "is_new" boolean DEFAULT false NOT NULL,
  "status" "override_status" DEFAULT 'draft' NOT NULL,
  "note" text,
  "updated_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "record_overrides_target_idx" ON "record_overrides" ("kind", "slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "record_overrides_status_idx" ON "record_overrides" ("status");
