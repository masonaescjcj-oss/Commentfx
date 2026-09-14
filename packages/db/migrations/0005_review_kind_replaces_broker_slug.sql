-- Carries every existing review over before anything is dropped. Without this
-- line a database holding reviews would forget which company each was about,
-- and it would forget silently.
UPDATE "reviews" SET "slug" = "broker_slug" WHERE "slug" = '' AND "broker_slug" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_broker_slug_brokers_slug_fk";--> statement-breakpoint
DROP INDEX IF EXISTS "reviews_broker_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "reviews_dedupe_idx";--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "kind" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "slug" DROP DEFAULT;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reviews_target_idx" ON "reviews" USING btree ("kind","slug","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_dedupe_idx" ON "reviews" USING btree ("kind","slug","topic","author_hash");--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "broker_slug";
