-- Reviews become polymorphic: prop firms and exchanges get them too.
--
-- Written in two steps on purpose. This one only adds, so a database that
-- already holds reviews keeps every one of them; 0005 backfills and drops.
--
-- Every statement is guarded. `applyMigrations` re-runs the whole directory on
-- each start against a file-backed database that may already be at the final
-- shape, and an unguarded DROP would throw on the second run.
ALTER TYPE "public"."review_topic" ADD VALUE IF NOT EXISTS 'payout';--> statement-breakpoint
ALTER TYPE "public"."review_topic" ADD VALUE IF NOT EXISTS 'rules';--> statement-breakpoint
ALTER TYPE "public"."review_topic" ADD VALUE IF NOT EXISTS 'evaluation';--> statement-breakpoint
ALTER TYPE "public"."review_topic" ADD VALUE IF NOT EXISTS 'security';--> statement-breakpoint
ALTER TYPE "public"."review_topic" ADD VALUE IF NOT EXISTS 'listings';--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "kind" "entity_kind" DEFAULT 'broker' NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "slug" text DEFAULT '' NOT NULL;
