-- Real accounts, replacing a shared bearer token that had no identity, no
-- revocation and no way to give one person less than everything.
--
-- The users table has existed since the first migration and has never had a row
-- in it. What it lacked was a way to sign in: a password, a session, and a
-- route by which an account comes to exist at all. There is no email column
-- addition and no mail provider, because this site runs on free tiers and
-- unauthenticated APIs — an admin creates an invite, copies the link, and sends
-- it however they already talk to that person.
--
-- Both secrets are stored hashed. A database dump should not be a set of
-- working passwords, and it should not be a set of working invitations either.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "disabled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_seen_at" timestamp with time zone;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "user_agent" text
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sessions_expiry_idx" ON "sessions" ("expires_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invites" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "name" text NOT NULL,
  "role" "user_role" DEFAULT 'editor' NOT NULL,
  "token_hash" text NOT NULL,
  "invited_by" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "accepted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invites_token_idx" ON "invites" ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invites_email_idx" ON "invites" ("email");
