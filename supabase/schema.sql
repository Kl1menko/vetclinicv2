-- UltraVet auth schema
-- Run in Supabase SQL editor: https://app.supabase.com → SQL Editor

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT        NOT NULL,
  email          TEXT        UNIQUE,
  phone          TEXT        UNIQUE,
  password_hash  TEXT,
  telegram_id    BIGINT      UNIQUE,
  telegram_username TEXT,
  viber_id       TEXT        UNIQUE,
  role           TEXT        NOT NULL DEFAULT 'client'
                             CHECK (role IN ('client', 'doctor', 'receptionist', 'admin')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_email_idx    ON users (lower(email));
CREATE INDEX IF NOT EXISTS users_phone_idx    ON users (phone);
CREATE INDEX IF NOT EXISTS users_telegram_idx ON users (telegram_id);
CREATE INDEX IF NOT EXISTS users_viber_idx    ON users (viber_id);

-- ─── Refresh Tokens ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_hash_idx ON refresh_tokens (token_hash);

-- Auto-clean expired tokens (run as cron or manually)
-- DELETE FROM refresh_tokens WHERE expires_at < now();

-- ─── Viber OTP Codes ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  viber_id    TEXT        NOT NULL,
  code_hash   TEXT        NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS otp_codes_viber_idx ON otp_codes (viber_id);

-- ─── Row Level Security (optional, since we use service key) ─────────────────
-- Enable RLS to block direct client access (we always use service_role key server-side)
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes      ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically — no policies needed for server-side use.
