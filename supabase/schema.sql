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

-- ─── Pets (client profile sync across devices) ──────────────────────────────
CREATE TABLE IF NOT EXISTS pets (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  species        TEXT,
  breed          TEXT,
  birth_date     DATE,
  age            INT         NOT NULL DEFAULT 0,
  weight         NUMERIC(6,2) NOT NULL DEFAULT 0,
  alerts         TEXT[]      NOT NULL DEFAULT '{}',
  last_visit     DATE,
  sterilized     BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pets_owner_idx ON pets (owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS pets_owner_name_idx ON pets (owner_user_id, lower(name));

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

-- ─── OTP Codes (Telegram + Viber) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_codes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id  TEXT,
  viber_id     TEXT,
  code_hash    TEXT        NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  attempts     INT         NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT otp_has_channel CHECK (telegram_id IS NOT NULL OR viber_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS otp_codes_telegram_idx ON otp_codes (telegram_id);
CREATE INDEX IF NOT EXISTS otp_codes_viber_idx    ON otp_codes (viber_id);

-- Migration (run if table already exists):
-- ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS telegram_id TEXT;
-- ALTER TABLE otp_codes ALTER COLUMN viber_id DROP NOT NULL;

-- ─── Row Level Security (optional, since we use service key) ─────────────────
-- Enable RLS to block direct client access (we always use service_role key server-side)
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets           ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically — no policies needed for server-side use.

-- ─── Chat (clients ↔ doctors/staff) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id      UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id              UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at         TIMESTAMPTZ,
  last_read_message_id UUID,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_user_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text            TEXT,
  attachments     JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT message_has_payload CHECK (
    (text IS NOT NULL AND length(trim(text)) > 0)
    OR jsonb_array_length(attachments) > 0
  )
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'conversation_participants_last_read_message_fkey'
  ) THEN
    ALTER TABLE conversation_participants
      ADD CONSTRAINT conversation_participants_last_read_message_fkey
      FOREIGN KEY (last_read_message_id) REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS conversations_updated_idx ON conversations (updated_at DESC);
CREATE INDEX IF NOT EXISTS conv_participants_user_idx ON conversation_participants (user_id);
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON messages (sender_user_id, created_at);

ALTER TABLE conversations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                   ENABLE ROW LEVEL SECURITY;

-- Supabase storage bucket for chat files (create once in SQL editor):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('chat-files', 'chat-files', false)
-- ON CONFLICT (id) DO NOTHING;
