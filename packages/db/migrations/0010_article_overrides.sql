-- Where an article written in the admin lives.
--
-- Its own table rather than a row in `record_overrides`, because the
-- alternative was adding 'article' to `entity_kind` — the enum that also says
-- what can carry a verification, a review and a status report. An article
-- carries none of those.
--
-- `audit_log.kind` becomes nullable in the same breath. An article is not a
-- broker, a prop firm or an exchange, and writing one of those into the trail
-- so the column can stay NOT NULL would put a false fact in the one table
-- nothing may delete from. A null there means "not about a record", and the
-- action says what it was about instead.
CREATE TABLE IF NOT EXISTS "article_overrides" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "patch" jsonb NOT NULL,
  "is_new" boolean DEFAULT false NOT NULL,
  "status" "override_status" DEFAULT 'draft' NOT NULL,
  "note" text,
  "updated_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "article_overrides_slug_idx" ON "article_overrides" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "article_overrides_status_idx" ON "article_overrides" ("status");
--> statement-breakpoint
ALTER TABLE "audit_log" ALTER COLUMN "kind" DROP NOT NULL;
