-- =====================================================================
-- BRIEF_085 §4 PoC — mock 10 件 seed（ドラフト・HUMAN attended 実行用）
-- 対象: 本番 vodnavi-production (ref xflqxxyvphqqmnzscpxr)
-- =====================================================================
-- ⚠️ 統治ガード（BRIEF_086 §4）: 「捏造データを本番 published にしない」。
--    → 本 seed は全件 publish_status = 'draft' で投入する。
--    → 公開リーダー /articles/[slug] は published のみ描画する（lib/editorial-articles.ts）
--       ため、draft の mock は anon には一切露出しない＝SEO/品質汚染ゼロ。
--    → service_role（SQL editor / SSR）からのみ読める。
--
-- ⚠️ スキーマ整合（2026-06-30 ライブ再検証で確定）: 本 seed の列名は
--    vodnavi-production の実スキーマ（information_schema.columns 物理再確認済）に一致させる＝
--      editorial_articles: title / slug / description / pillar / body / publish_status
--      article_products  : article_id / content_id / display_order（asp_name は既定 'fanza'）
--    旧ドラフトの meta_description / intro_template / floor_code / sort_order は
--    ライブに存在しない（42703）ため description / body / display_order へ是正済。
--    `body` は本 PoC 用の純加算列（下記 step 0、HUMAN 決定 2026-06-30）。
--    pillar は NOT NULL のため必須供給する
--    （許容値: 'emotion-navi' | 'wisdom-lens' | 'situation' | 'technology-premium'）。
--
-- 実行方法（HUMAN attended）: Supabase SQL Editor で本ファイルを実行。
--    DDL/RLS と同じく attended（CTO は secret/DB へ直接到達しない）。
-- 冪等性: slug UNIQUE 前提の upsert + 子行は mock 分のみ delete→再投入。
--    step 0 の add column も `if not exists` で冪等。
-- mock の content_id は実在品番ではない（mockcidNNN）。実 FANZA データではない。
-- =====================================================================

begin;

-- 0) body 列（PoC 用・純加算）。ライブ editorial_articles に prose 本文列が無いため追加。
--    nullable・既存行に無影響・revert は drop column で可逆。
alter table public.editorial_articles add column if not exists body text;

-- 1) editorial_articles（10 件 / すべて draft）
insert into public.editorial_articles
  (title, slug, description, pillar, body, publish_status)
values
  ('（モック）検証用ダミー記事 01', 'mock-poc-article-001',
   '（モック）PoC 検証用のダミー description 01。', 'emotion-navi',
   E'（モック）これは PoC 検証用のダミー本文です。\n\n二段落目のダミーテキスト。', 'draft'),
  ('（モック）検証用ダミー記事 02', 'mock-poc-article-002',
   '（モック）PoC 検証用のダミー description 02。', 'emotion-navi',
   E'（モック）これは PoC 検証用のダミー本文です。\n\n二段落目のダミーテキスト。', 'draft'),
  ('（モック）検証用ダミー記事 03', 'mock-poc-article-003',
   '（モック）PoC 検証用のダミー description 03。', 'emotion-navi',
   E'（モック）これは PoC 検証用のダミー本文です。\n\n二段落目のダミーテキスト。', 'draft'),
  ('（モック）検証用ダミー記事 04', 'mock-poc-article-004',
   '（モック）PoC 検証用のダミー description 04。', 'emotion-navi',
   E'（モック）これは PoC 検証用のダミー本文です。\n\n二段落目のダミーテキスト。', 'draft'),
  ('（モック）検証用ダミー記事 05', 'mock-poc-article-005',
   '（モック）PoC 検証用のダミー description 05。', 'emotion-navi',
   E'（モック）これは PoC 検証用のダミー本文です。\n\n二段落目のダミーテキスト。', 'draft'),
  ('（モック）検証用ダミー記事 06', 'mock-poc-article-006',
   '（モック）PoC 検証用のダミー description 06。', 'emotion-navi',
   E'（モック）これは PoC 検証用のダミー本文です。\n\n二段落目のダミーテキスト。', 'draft'),
  ('（モック）検証用ダミー記事 07', 'mock-poc-article-007',
   '（モック）PoC 検証用のダミー description 07。', 'emotion-navi',
   E'（モック）これは PoC 検証用のダミー本文です。\n\n二段落目のダミーテキスト。', 'draft'),
  ('（モック）検証用ダミー記事 08', 'mock-poc-article-008',
   '（モック）PoC 検証用のダミー description 08。', 'emotion-navi',
   E'（モック）これは PoC 検証用のダミー本文です。\n\n二段落目のダミーテキスト。', 'draft'),
  ('（モック）検証用ダミー記事 09', 'mock-poc-article-009',
   '（モック）PoC 検証用のダミー description 09。', 'emotion-navi',
   E'（モック）これは PoC 検証用のダミー本文です。\n\n二段落目のダミーテキスト。', 'draft'),
  ('（モック）検証用ダミー記事 10', 'mock-poc-article-010',
   '（モック）PoC 検証用のダミー description 10。', 'emotion-navi',
   E'（モック）これは PoC 検証用のダミー本文です。\n\n二段落目のダミーテキスト。', 'draft')
on conflict (slug) do update set
  title          = excluded.title,
  description    = excluded.description,
  pillar         = excluded.pillar,
  body           = excluded.body,
  publish_status = excluded.publish_status;

-- 2) article_products（mock 記事の子行を一旦掃除→再投入＝冪等）
--    article_products の UNIQUE は (article_id, content_id, asp_name)。asp_name は
--    既定 'fanza' のため明示せず、冪等性は delete→insert で担保する。
delete from public.article_products
where article_id in (
  select id from public.editorial_articles
  where slug like 'mock-poc-article-%'
);

insert into public.article_products (article_id, content_id, display_order)
select a.id, v.content_id, v.display_order
from public.editorial_articles a
join (values
  ('mock-poc-article-001', 'mockcid001', 1),
  ('mock-poc-article-002', 'mockcid002', 1),
  ('mock-poc-article-003', 'mockcid003', 1),
  ('mock-poc-article-004', 'mockcid004', 1),
  ('mock-poc-article-005', 'mockcid005', 1),
  ('mock-poc-article-006', 'mockcid006', 1),
  ('mock-poc-article-007', 'mockcid007', 1),
  ('mock-poc-article-008', 'mockcid008', 1),
  ('mock-poc-article-009', 'mockcid009', 1),
  ('mock-poc-article-010', 'mockcid010', 1)
) as v(slug, content_id, display_order)
  on v.slug = a.slug;

commit;

-- 検証 SELECT（service_role で全件 / anon は 0 件のはず）
-- select slug, publish_status from public.editorial_articles where slug like 'mock-poc-article-%' order by slug;

-- =====================================================================
-- [検証専用・任意] anon RLS + /articles/[slug] レンダリングの物理確認
-- ---------------------------------------------------------------------
-- ⚠️ BRIEF_086 §4: 捏造データを本番 published に「残さない」。下記は *一時* 検証で、
--    確認後ただちに revert すること（mock を published のまま放置しない）。
--
--   -- 1 件だけ一時 published 化:
--   update public.editorial_articles set publish_status = 'published'
--     where slug = 'mock-poc-article-001';
--
--   -- curl で 200 + 本文描画を確認:
--   --   curl -A "Googlebot" -I https://app.vodnavi.jp/articles/mock-poc-article-001
--
--   -- 確認後ただちに revert:
--   update public.editorial_articles set publish_status = 'draft'
--     where slug = 'mock-poc-article-001';
-- =====================================================================
