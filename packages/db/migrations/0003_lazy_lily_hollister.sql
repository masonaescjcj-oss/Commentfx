CREATE TYPE "public"."review_topic" AS ENUM('withdrawals', 'execution', 'costs', 'support', 'platform', 'account-opening');--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"broker_slug" text NOT NULL,
	"rating" integer NOT NULL,
	"topic" "review_topic" NOT NULL,
	"body" text NOT NULL,
	"author_hash" text NOT NULL,
	"delete_token_hash" text NOT NULL,
	"evidence_note" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"hidden_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_broker_slug_brokers_slug_fk" FOREIGN KEY ("broker_slug") REFERENCES "public"."brokers"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reviews_broker_idx" ON "reviews" USING btree ("broker_slug","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_dedupe_idx" ON "reviews" USING btree ("broker_slug","topic","author_hash");