---
title: "Supabase スキーマ設計・DDL ドラフト (BRIEF_085 §5 step2)"
last_updated: "2026-06-28"
status: "executed_in_production_2026-06-28"
---

# Supabase スキーマ設計・DDL ドラフト

> ✅ **実行済 2026-06-28** — HUMAN の "run" 明示承認 + attended browser automation により `vodnavi-production`（main PRODUCTION）で実行＝Success、`editorial_articles`(8列/RLS) + `article_products`(6列/RLS) を `pg_tables` で物理確認。当初は `BRIEF_085` §5 step2（HUMAN レビュー＆承認）の review-pending ドラフトとして起票。
> CSO script 原案からの CTO 補正: (a) 文字列デフォルトの二重引用符 `"draft"` / `"fanza"`（Postgres では識別子扱い＝実行時エラー）を単一引用符に修正、(b) `BRIEF_085` §2 準拠で RLS を有効化、(c) `TIMESTAMP WITH TIME ZONE` → `TIMESTAMPTZ` / `CURRENT_TIMESTAMP` → `now()` 統一、(d) board 全文上書きは不採用・in-place 追記。

## 1. 設計思想
- **マルチ ASP 拡張性**: `asp_name` の初期値 `'fanza'`、将来 `'dmm_tv'` / `'u_next'` をテーブル改修なしで追加。
- **参照整合性**: article ↔ product を FK + `ON DELETE CASCADE` で保証し、孤児行による 404 を構造的に防衛。
- **af_id 非保存（ID 抽象化）**: affiliate URL / af_id はテーブルに保存しない。CTA URL は既存 `lib/concierge/url-builder.ts`（env 由来）で runtime 生成（[[reference_dmm_affiliate_id_registry]]）。
- **RLS**: service_role 経由は RLS をバイパスするが、anon / authenticated の既定アクセスを塞ぐため PoC 段階から有効化（`BRIEF_085` §2）。

## 2. 実行用 SQL（DDL Draft・**承認後に実行**）

```sql
-- 1. UUID 生成（uuid-ossp）。Supabase 既定の gen_random_uuid()（pgcrypto）でも可。
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 記事マスター（editorial_articles）
CREATE TABLE IF NOT EXISTS public.editorial_articles (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    description   TEXT,
    pillar        TEXT NOT NULL,                 -- 'emotion-navi' | 'wisdom-lens' | 'situation' | 'technology-premium'
    publish_status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'review' | 'published'
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_editorial_articles_modtime ON public.editorial_articles;
CREATE TRIGGER update_editorial_articles_modtime
    BEFORE UPDATE ON public.editorial_articles
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 3. 記事 × プロダクト結合（article_products）。af_id は保存しない。
CREATE TABLE IF NOT EXISTS public.article_products (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id    UUID NOT NULL REFERENCES public.editorial_articles(id) ON DELETE CASCADE,
    content_id    TEXT NOT NULL,                 -- FANZA 品番 (e.g., 'gkok00002')
    asp_name      TEXT NOT NULL DEFAULT 'fanza', -- 'fanza' | 'dmm_tv' | 'u_next'
    display_order INT  NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_article_product_sku UNIQUE (article_id, content_id, asp_name)
);

CREATE INDEX IF NOT EXISTS idx_article_products_content_id ON public.article_products(content_id);
CREATE INDEX IF NOT EXISTS idx_editorial_articles_pillar   ON public.editorial_articles(pillar);

-- 4. RLS 有効化（BRIEF_085 §2）。service_role はバイパス、anon/authenticated は既定遮断。
ALTER TABLE public.editorial_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_products  ENABLE ROW LEVEL SECURITY;
-- 公開読取が必要になった段階で published のみ SELECT 許可する policy を別途定義（PoC では追加しない）。
```

## 3. 次の HUMAN 決裁ステップ
- [ ] 本 DDL ドラフトのレビュー＆承認（承認まで本番 Supabase で実行しない）
- [ ] 承認後、Supabase SQL editor で実行 → `app-concierge/src/lib/supabase/poc-test.ts` の status が `connected_no_table` → `connected` に遷移することを確認

## 4. 追補（2026-06-30）: `body` 列（PoC 用・純加算・**status: executed_in_production_2026-06-30 (via HUMAN-attended browser automation)**）
> ✅ **executed_in_production_2026-06-30**（HUMAN-attended browser automation・claude-in-chrome SQL Editor / role postgres）。`body` 列は本番 `public.editorial_articles` に物理適用済＝検証 SELECT で mock 全 10 行 `has_body=true` を実測（seed step0 の `ADD COLUMN IF NOT EXISTS body TEXT` 点火・mainline `3d3e2a7`）。これにより §2 の 8 列＋`body`＝9 列が本番の現状。

- **追加列**: `public.editorial_articles.body TEXT`（NULL 可）。記事の prose 本文（`/articles/[slug]` の `page.tsx` が空行区切りで段落描画）。§2 の `description`(meta 相当) / `pillar`(カテゴリ) とは別に、本文を格納する列が無いため純加算する。
- **適用経路**: `app-concierge/supabase/poc_seed_mock10.sql` の **step 0** に `ALTER TABLE public.editorial_articles ADD COLUMN IF NOT EXISTS body TEXT;` を冪等同梱。HUMAN-attended の seed 実行時に一括適用される。
- **可逆性**: nullable・既存行に無影響。revert は `DROP COLUMN body`。
- **昇格条件（達成済）**: 2026-06-30 本番 attended 実行で点火確認済（mock 10 行 `has_body=true`）。次回 §2 改訂時に `body TEXT` を正式列として統合する。
- **是正履歴**: リーダーコード/旧 seed が参照していた `meta_description` / `intro_template` / `floor_code` / `sort_order` は本番に存在せず（42703）、`description` / `body` / `display_order` / `asp_name` へコード側を調律済（コードを本番スキーマに合わせる方針、HUMAN 決定 2026-06-30）。
