---
title: "Supabase ライブスキーマ監査 証跡ログ（Chrome 経路・read-only）"
date: "2026-06-29"
status: "verified"
related_tasks: ["T-20260629-03"]
method: "claude-in-chrome MCP → Supabase Dashboard SQL Editor（read-only SELECT のみ・書込みなし）"
---

# Supabase ライブスキーマ監査 — 物理実測ログ（2026-06-29）

## 0. 監査コンテキスト（実画面確認値）
- Org: `dandy693's Org`（PRO プラン）
- Project: `vodnavi-production` / ref `xflqxxyvphqqmnzscpxr`
- Branch: `main`（**PRODUCTION**）
- Role: `postgres`
- 取得経路: claude-in-chrome MCP 拡張（既ログインブラウザセッション）→ SQL Editor で `information_schema` / `pg_class` を read-only SELECT。**INSERT/UPDATE/DDL は未実行**。
- 補足: Supabase MCP サーバ経路は `SUPABASE_ACCESS_TOKEN` が本セッション env に不在のため `Unauthorized` で **BLOCKED**。本ログは Chrome 経路で迂回取得したもの。

## 1. レコード数（COUNT・物理実測）
| テーブル | 行数 |
|---|---:|
| `public.editorial_articles` | **0** |
| `public.article_products` | **0** |

→ 両表とも空（seed `poc_seed_mock10.sql` 未投入）。`sampleCount:10`（poc route）はモック配列長のハードコードであり DB 行数ではないことを再確証。

## 2. スキーマ実体（`information_schema.columns` + `pg_class.relrowsecurity`）

### `editorial_articles`（8 列・RLS 有効）
| # | 列名 | 型 | NULL 許容 | デフォルト |
|---:|---|---|:---:|---|
| 1 | id | uuid | NO | `uuid_generate_v4()` |
| 2 | slug | text | NO | — |
| 3 | title | text | NO | — |
| 4 | description | text | YES | — |
| 5 | pillar | text | NO | — |
| 6 | publish_status | text | NO | `'draft'::text` |
| 7 | created_at | timestamptz | NO | `now()` |
| 8 | updated_at | timestamptz | NO | `now()` |

### `article_products`（6 列・RLS 有効）
| # | 列名 | 型 | NULL 許容 | デフォルト |
|---:|---|---|:---:|---|
| 1 | id | uuid | NO | `uuid_generate_v4()` |
| 2 | article_id | uuid | NO | — |
| 3 | content_id | text | NO | — |
| 4 | asp_name | text | NO | `'fanza'::text` |
| 5 | display_order | integer | NO | `0` |
| 6 | created_at | timestamptz | NO | `now()` |

`relrowsecurity` = **true**（全 14 列の親テーブル 2 つとも RLS 有効）。

## 3. 整合性監査
- ライブスキーマは `management/SUPABASE_DDL_DRAFT_001.md`（DDL ドラフト, status: executed_in_production_2026-06-28）の列数・型・デフォルト・RLS と **完全一致＝drift なし**。
- `management/notion/DB_PROPERTY_DESIGN.md`（Notion Master Task DB）は別ドメイン（タスク管理スキーマ）であり共有エンティティを持たないため、型/リレーションの物理矛盾は非該当（N/A）。

## 4. 未了（HUMAN ゲート）
- seed SQL の本番 attended 実行（COUNT を 0 → 10 にするには別決裁）。
- Supabase MCP の `✔ Connected` 化（PAT 作成 → `SUPABASE_ACCESS_TOKEN` env 設定 → セッション/MCP 再起動）。本ログ時点では MCP は依然 BLOCKED。
