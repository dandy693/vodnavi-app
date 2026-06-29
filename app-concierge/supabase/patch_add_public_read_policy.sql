-- =====================================================================
-- パブリック閲覧専用 RLS ポリシー（anon・published のみ）— DRAFT
-- 対象: 本番 vodnavi-production (ref xflqxxyvphqqmnzscpxr)
-- 作成: 2026-06-30 / status: DRAFT（**未実行**・HUMAN attended SQL Editor で執行）
-- =====================================================================
-- 目的: site-brand（メディア側 / 将来の anon クライアント）および検索クローラーが
--       `public.editorial_articles` の **published 記事のみ** を読めるようにする。
--       draft / review は anon に物理露出させない（USING 句で 100% 遮断）。
--
-- ⚠️ 統治ガード（BRIEF_086 §4）: 「捏造データを本番 published にしない」。
--    本ポリシーは published のみ可視化＝現状の draft mock(10件) は anon に出ない。
--
-- 前提: service_role（SSR / SQL Editor）は RLS をバイパスするため本ポリシーの影響外。
--       本ポリシーは anon ロール（公開ブラウザ / クローラー）専用の SELECT 許可。
--       RLS は DDL_DRAFT_001 §2 で有効化済（本パッチでも冪等に再保証）。
--
-- 冪等性: ENABLE RLS（再実行 no-op）/ GRANT（再付与 no-op）/
--         DROP POLICY IF EXISTS → CREATE POLICY の安全ラッパー。再実行可。
--
-- ⚠️ スコープ注（誠実・本パッチには含めない follow-up）:
--    本パッチは `editorial_articles` のみ。リーダーが `article_products` も anon で
--    引く設計に進める場合は、親記事が published の行だけを許可する anon SELECT
--    ポリシーを別途 `article_products` に要定義
--    （例: USING (EXISTS (SELECT 1 FROM public.editorial_articles ea
--                        WHERE ea.id = article_products.article_id
--                          AND ea.publish_status = 'published')) ）。
--    現行リーダー（lib/editorial-articles.ts）は service_role 経由＝RLS バイパスのため
--    本ポリシーは「将来 anon クライアントを足す」ための公開境界の土台（多重防御）。
-- =====================================================================

begin;

-- 0) RLS 有効化を冪等に保証（DDL_DRAFT_001 §2 で有効化済＝通常 no-op）。
alter table public.editorial_articles enable row level security;

-- 1) 基盤権限: anon に table-level SELECT を付与（RLS ポリシーは「制限」のみで
--    基盤 privilege は別＝GRANT が無いと policy は機能しない）。Supabase 既定で
--    付与済の可能性が高いが、冪等な明示として実行（再付与は no-op）。
grant select on public.editorial_articles to anon;

-- 2) anon: published のみ SELECT 許可（draft/review は USING で不可視）。
drop policy if exists "anon_select_published_editorial_articles" on public.editorial_articles;

create policy "anon_select_published_editorial_articles"
  on public.editorial_articles
  for select
  to anon
  using (publish_status = 'published');

commit;

-- =====================================================================
-- 検証（任意・HUMAN / SQL Editor は postgres ＝ RLS バイパスのため set role で確認）:
--   set role anon;
--   select count(*) from public.editorial_articles;
--     -- 期待: published 行数のみ（現状 mock は全 draft ＝ 0 行）。
--   select count(*) from public.editorial_articles where publish_status <> 'published';
--     -- 期待: 0（draft/review は anon に物理不可視＝漏洩ゼロ）。
--   reset role;
-- =====================================================================
