-- A group company with no financial licence anywhere is a state the entity map
-- has to be able to hold. Eightcap's group includes CLMarkets Limited in St
-- Vincent, trading as Eightcap International, and the St Vincent FSA says
-- licensing forex business is not part of what it does.
--
-- ALTER TYPE ... ADD VALUE cannot run inside a transaction block on older
-- Postgres, and IF NOT EXISTS makes re-running the ledger safe.
ALTER TYPE "public"."licence_status" ADD VALUE IF NOT EXISTS 'unregulated';
