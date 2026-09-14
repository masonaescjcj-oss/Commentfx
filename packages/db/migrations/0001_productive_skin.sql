CREATE TYPE "public"."incident_kind" AS ENUM('withdrawal-delay', 'platform-down', 'slippage', 'login-failure', 'deposit-failure', 'other');--> statement-breakpoint
CREATE TABLE "status_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"broker_slug" text NOT NULL,
	"kind" "incident_kind" NOT NULL,
	"reporter_hash" text NOT NULL,
	"note" text,
	"moderated" boolean DEFAULT false NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "status_reports" ADD CONSTRAINT "status_reports_broker_slug_brokers_slug_fk" FOREIGN KEY ("broker_slug") REFERENCES "public"."brokers"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "status_reports_broker_idx" ON "status_reports" USING btree ("broker_slug","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "status_reports_dedupe_idx" ON "status_reports" USING btree ("broker_slug","kind","reporter_hash");