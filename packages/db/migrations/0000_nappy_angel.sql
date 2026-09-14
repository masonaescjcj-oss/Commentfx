CREATE TYPE "public"."entity_kind" AS ENUM('broker', 'prop', 'exchange');--> statement-breakpoint
CREATE TYPE "public"."licence_status" AS ENUM('authorised', 'registered', 'suspended', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."regulator_tier" AS ENUM('A', 'B', 'C');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor', 'moderator', 'viewer');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"kind" "entity_kind" NOT NULL,
	"slug" text NOT NULL,
	"field" text,
	"before" text,
	"after" text,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broker_entities" (
	"id" serial PRIMARY KEY NOT NULL,
	"broker_slug" text NOT NULL,
	"legal_name" text NOT NULL,
	"country" text NOT NULL,
	"regulator_code" text NOT NULL,
	"licence_number" text NOT NULL,
	"status" "licence_status" NOT NULL,
	"serves" text[] NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brokers" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"founded" integer NOT NULL,
	"headquarters" text NOT NULL,
	"why" text NOT NULL,
	"eurusd_spread" real NOT NULL,
	"commission_per_lot" real NOT NULL,
	"swap_free_available" boolean NOT NULL,
	"payment_methods" text[] NOT NULL,
	"stated_withdrawal_hours" real NOT NULL,
	"min_deposit_usd" integer NOT NULL,
	"platforms" text[] NOT NULL,
	"execution" text NOT NULL,
	"copy_trading" boolean NOT NULL,
	"max_leverage" integer NOT NULL,
	"publishes_entity_mapping" boolean NOT NULL,
	"publishes_audited_accounts" boolean NOT NULL,
	"segregated_client_funds" boolean NOT NULL,
	"public_ownership" boolean NOT NULL,
	"logo" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchanges" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"founded" integer NOT NULL,
	"headquarters" text NOT NULL,
	"kind" text NOT NULL,
	"why" text NOT NULL,
	"taker_fee_pct" real NOT NULL,
	"maker_fee_pct" real NOT NULL,
	"spot_volume_usd" real NOT NULL,
	"proof_of_reserves" boolean NOT NULL,
	"third_party_audit" boolean NOT NULL,
	"publicly_listed" boolean NOT NULL,
	"last_breach_year" integer,
	"insurance_fund" boolean NOT NULL,
	"made_users_whole" boolean,
	"publishes_fee_schedule" boolean NOT NULL,
	"discloses_legal_entity" boolean NOT NULL,
	"publishes_incident_reports" boolean NOT NULL,
	"logo" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "props" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"founded" integer NOT NULL,
	"headquarters" text NOT NULL,
	"markets" text[] NOT NULL,
	"why" text NOT NULL,
	"steps" text NOT NULL,
	"profit_target_pct" real NOT NULL,
	"daily_drawdown_pct" real NOT NULL,
	"max_drawdown_pct" real NOT NULL,
	"drawdown_type" text NOT NULL,
	"consistency_rule" boolean NOT NULL,
	"time_limit_days" integer,
	"news_trading" boolean NOT NULL,
	"weekend_holding" boolean NOT NULL,
	"min_trading_days" integer NOT NULL,
	"split_pct" integer NOT NULL,
	"payout_frequency_days" integer NOT NULL,
	"first_payout_days" integer NOT NULL,
	"verified_proofs" integer DEFAULT 0 NOT NULL,
	"fee_usd_per_100k" integer NOT NULL,
	"platforms" text[] NOT NULL,
	"publishes_rule_changes" boolean NOT NULL,
	"discloses_legal_entity" boolean NOT NULL,
	"discloses_execution_broker" boolean NOT NULL,
	"logo" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regulators" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"tier" "regulator_tier" NOT NULL,
	"compensation" text,
	"registry_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "entity_kind" NOT NULL,
	"slug" text NOT NULL,
	"field" text NOT NULL,
	"value_seen" text NOT NULL,
	"source_url" text NOT NULL,
	"note" text,
	"verified_by" text NOT NULL,
	"verified_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "broker_entities" ADD CONSTRAINT "broker_entities_broker_slug_brokers_slug_fk" FOREIGN KEY ("broker_slug") REFERENCES "public"."brokers"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broker_entities" ADD CONSTRAINT "broker_entities_regulator_code_regulators_code_fk" FOREIGN KEY ("regulator_code") REFERENCES "public"."regulators"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_target_idx" ON "audit_log" USING btree ("kind","slug");--> statement-breakpoint
CREATE INDEX "audit_log_at_idx" ON "audit_log" USING btree ("at");--> statement-breakpoint
CREATE INDEX "broker_entities_broker_idx" ON "broker_entities" USING btree ("broker_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "broker_entities_licence_idx" ON "broker_entities" USING btree ("regulator_code","licence_number");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "verifications_target_idx" ON "verifications" USING btree ("kind","slug","field");--> statement-breakpoint
CREATE INDEX "verifications_age_idx" ON "verifications" USING btree ("verified_at");