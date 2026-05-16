-- VODNAVI-GROUP 会話履歴保存機能 (STRATEGY_BRIEF_00X) の試験スキーマ
--
-- このファイルは Postgres コンテナ初回起動時に自動実行される。
-- スキーマを変えたい場合は `docker compose down -v` で初期化してから再起動すること。
--
-- 実本番では migration ツール (Prisma / drizzle / sqlx 等) を使う前提。
-- 本ファイルは「最小限のスケッチ」であり、設計確定時に置き換える。

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- セッション: 1 訪問単位（source パラメータと _gl パラメータを記録）
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source          TEXT NOT NULL DEFAULT 'default',  -- moterist / brand / default
  ga_client_id    TEXT,                              -- _gl から復元した GA client_id
  ga_session_id   TEXT,
  user_agent      TEXT,
  ip_country      TEXT
);

CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions (created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_source_idx ON sessions (source);

-- メッセージ: セッション内の発話列
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  sanitized       BOOLEAN NOT NULL DEFAULT FALSE,    -- sanitizePrompt 経由フラグ
  replacement_cnt INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages (session_id, created_at);

-- 推薦: AI が finalize_recommendations で確定した作品 ID 群
CREATE TABLE IF NOT EXISTS recommendations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  message_id      UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  content_ids     TEXT[] NOT NULL                    -- ['cid1','cid2','cid3']
);

CREATE INDEX IF NOT EXISTS recommendations_session_id_idx ON recommendations (session_id);
