---
title: "STRATEGY BRIEF 086: Supabase RLS 公開閲覧ポリシー（ドラフト・適用待ち）"
last_updated: "2026-06-28"
status: "review_pending"
author: "CTO（CSO script の事実整合補正版）"
---

# STRATEGY BRIEF 086: Supabase RLS 公開閲覧ポリシー

> ⚠️ **未適用ドラフト** — 本番 `vodnavi-production` への適用は **HUMAN 承認 + attended** で行う（DDL と同様）。
> 原 CSO script（`STRATEGY_BRIEF_041_SUPABASE_RLS` を名乗る）からの CTO 補正: (a) 採番 041→**086**（041 は既存 `041_W25_CTA_WIRING` と衝突）、(b) board 全文上書き（`writeFileSync` 全置換）は `AGENT_PROTOCOLS.md` 統治規約違反のため不採用＝本書 + in-place board 追記に是正、(c) 「EXIT_CODE=0 で成功」は不正確（接続疎通の実証は本番 `GET /api/supabase-poc` = HTTP 200 `connected`。`tsc` の exit 0 は別物）、(d) §3 backlog の「Middleware で noindex / ?sort= noindex」は `e82a670` で確定した canonical 統制・metadata 層実装と矛盾するため補正、(e) `CREATE POLICY` の非冪等性に `DROP POLICY IF EXISTS` を追加。

## 1. 背景・目的
Option-B の接続疎通が本番 runtime で `connected`（HTTP 200・`editorial_articles` read 到達）と物理確証され、2 表が RLS 有効で live。現状は **service_role のみ読める**ため、`app.vodnavi.jp` の SSR から **published 記事のみ**を anon で安全に読めるよう SELECT ポリシーを確定する。service_role は RLS をバイパスするため、anon 公開範囲を最小（published のみ）に絞ることが要点。

## 2. ポリシー SQL（ドラフト・**承認後に適用**／再実行は DROP→CREATE）

### 2.1 editorial_articles
```sql
-- published のみ anon/authenticated に公開読取
DROP POLICY IF EXISTS "public_read_published_articles" ON public.editorial_articles;
CREATE POLICY "public_read_published_articles"
ON public.editorial_articles
FOR SELECT
TO anon, authenticated
USING (publish_status = 'published');
```
> 注: service_role は RLS をバイパスするため別途 ALL ポリシーは不要（冗長）。明示したい場合のみ `FOR ALL TO service_role USING (true)` を追加。

### 2.2 article_products（published 記事に紐づく行のみ）
```sql
DROP POLICY IF EXISTS "public_read_products_of_published" ON public.article_products;
CREATE POLICY "public_read_products_of_published"
ON public.article_products
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.editorial_articles a
    WHERE a.id = public.article_products.article_id
      AND a.publish_status = 'published'
  )
);
```
> 任意最適化: 上記 EXISTS は `article_products.article_id` への index があると planner に有利（DDL では未作成）。`CREATE INDEX IF NOT EXISTS idx_article_products_article_id ON public.article_products(article_id);` を別途検討。

## 3. 適用後の検証（ファクトベース）
- anon キーで `editorial_articles` を SELECT → published 行のみ返ることを確認（draft/review は 0 件）。
- service_role で全件読めることを確認。
- 確認は使い捨て検証ルート方式を再利用するか、Supabase SQL editor の role 切替で実施。

## 4. 次期バックログ（フェーズ2・`e82a670` 準拠）
- [ ] `app-concierge/src/app/(site)/articles/[slug]/page.tsx` 動的 SSR リーダー実装（Supabase published 記事を描画）。
- [ ] インデックス方針: クエリ URL（`?sort=` 等）は **self-canonical で consolidation**（個別 noindex 注入はしない）。noindex が要る面は **Next metadata 層（`generateMetadata` の `robots`）**で付与（`proxy.ts`/"middleware" では行わない）。[[project_sop_doc_topology_and_drift_fix]]
- [ ] テスト用モックデータ投入は本番ではなく検証手順内で（捏造データを本番 published にしない）。
