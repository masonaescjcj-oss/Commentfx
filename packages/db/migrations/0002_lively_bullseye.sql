CREATE TYPE "public"."finding_kind" AS ENUM('confirmed', 'name-mismatch', 'not-found', 'source-unavailable');--> statement-breakpoint
CREATE TABLE "register_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"broker_slug" text NOT NULL,
	"regulator_code" text NOT NULL,
	"licence_number" text NOT NULL,
	"kind" "finding_kind" NOT NULL,
	"register_name" text,
	"detail" text NOT NULL,
	"source_url" text NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "register_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"regulator_code" text NOT NULL,
	"ok" boolean NOT NULL,
	"entry_count" integer,
	"reason" text,
	"ran_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "register_checks" ADD CONSTRAINT "register_checks_broker_slug_brokers_slug_fk" FOREIGN KEY ("broker_slug") REFERENCES "public"."brokers"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "register_checks_target_idx" ON "register_checks" USING btree ("broker_slug","regulator_code","licence_number");--> statement-breakpoint
CREATE INDEX "register_runs_code_idx" ON "register_runs" USING btree ("regulator_code","ran_at");