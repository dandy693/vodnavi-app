-- VODNAVI-GROUP 会話履歴保存機能 (STRATEGY_BRIEF_00X) の試験スキーマ
--
-- このファイルは Postgres コンテナ初回起動時に自動実行される。
-- スキーマを変えたい場合は `docker compose down -v` で初期化してから再起動すること。
--
-- 実本番では migration ツール (Prisma / drizzle / sqlx 等) を使う前提。
-- 本ファイルは「最小限のスケッチ」であり、設計確定時に置き換える。

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- セッション: 1 訪問単位（source パラメータと _gl パラメータを記録）
-- asp_name (STRATEGY_BRIEF_003): 多 ASP 解放 (DMM TV / U-NEXT) に向けた予備配線。
--   フェーズ 1 期間中はすべて 'fanza' 固定で動作。NOT NULL + DEFAULT により
--   過去レコードのバックフィルが不要、ALTER 時の全表ロックを回避できる。
CREATE TABLE IF NOT EXISTS sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source          TEXT NOT NULL DEFAULT 'default',  -- moterist / brand / default
  asp_name        TEXT NOT NULL DEFAULT 'fanza',    -- fanza / dmm_tv / u_next (将来解放)
  ga_client_id    TEXT,                              -- _gl から復元した GA client_id
  ga_session_id   TEXT,
  user_agent      TEXT,
  ip_country      TEXT
);

CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions (created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_source_idx ON sessions (source);
CREATE INDEX IF NOT EXISTS sessions_asp_name_idx ON sessions (asp_name);

-- メッセージ: セッション内の発話列
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  asp_name        TEXT NOT NULL DEFAULT 'fanza',    -- 提案メッセージの対象 ASP
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
  asp_name        TEXT NOT NULL DEFAULT 'fanza',    -- content_ids を発行した ASP
  content_ids     TEXT[] NOT NULL                    -- ['cid1','cid2','cid3']
);

CREATE INDEX IF NOT EXISTS recommendations_session_id_idx ON recommendations (session_id);
CREATE INDEX IF NOT EXISTS recommendations_asp_name_idx ON recommendations (asp_name);

-- ---------------------------------------------------------------------------
-- 冪等マイグレーション: 既存 DB（テーブルが既に存在する場合）への ALTER 追加。
-- 初回 init では CREATE TABLE が NOT NULL DEFAULT で済むためここはスキップされる。
-- 既存 docker volume を保持したまま docker compose up を再実行した場合に効く。
-- ---------------------------------------------------------------------------
ALTER TABLE sessions        ADD COLUMN IF NOT EXISTS asp_name TEXT NOT NULL DEFAULT 'fanza';
ALTER TABLE messages        ADD COLUMN IF NOT EXISTS asp_name TEXT NOT NULL DEFAULT 'fanza';
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS asp_name TEXT NOT NULL DEFAULT 'fanza';
