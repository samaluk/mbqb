-- Run against production ONLY after:
-- 1. A fresh pg_dump backup
-- 2. Deploying code that replaces old migrations with 20260604_000000_baseline
-- 3. Confirming the live schema already includes Lexical body columns
--
-- This does NOT change content tables — it only resets migration history so
-- `payload migrate` stops replaying the old chain.

DELETE FROM payload_migrations;

INSERT INTO payload_migrations (name, batch, created_at, updated_at)
VALUES (
  '20260604_000000_baseline',
  1,
  NOW(),
  NOW()
);
