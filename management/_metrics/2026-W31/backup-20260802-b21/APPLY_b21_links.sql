-- =====================================================================
-- B2① 実運用: 記事本文への内部リンク記法 投入SQL
-- 対象DB : Supabase vodnavi-production (ref xflqxxyvphqqmnzscpxr)
-- 対象表 : editorial_articles(列 body / slug / publish_status)
-- 承認   : CSO 2026-08-02 「既存プレーンテキスト参照13件のみ」
-- 作成   : CTO 2026-08-02 22:4x JST
--
-- 【方式】既存文字列への「挿入のみ」。replace() で
--         「TITLE」の記事  →  「[TITLE](/articles/slug)」の記事
--         に置換する。既存文字は1文字も削除・変更しない。
--
-- 【重要】実行は Supabase SQL Editor 等から HUMAN が行うこと。
--         CTO 側に SUPABASE_SERVICE_ROLE_KEY の実値が無いため実行不可
--         （Vercel の Encrypted 変数は pull すると [SENSITIVE] にマスクされる）。
-- =====================================================================

-- ---------------------------------------------------------------------
-- STEP 0: 投入前チェック（必ず先に実行し、期待値と一致することを確認）
--   期待値: 下の SELECT が合計 13 を返すこと
-- ---------------------------------------------------------------------
select
  slug,
  (length(body) - length(replace(body, '「はじめてのFANZA完全ガイド」の記事',        ''))) / length('「はじめてのFANZA完全ガイド」の記事')        as ref_first_guide,
  (length(body) - length(replace(body, '「FANZA TV無料体験の始め方と注意点」の記事', ''))) / length('「FANZA TV無料体験の始め方と注意点」の記事') as ref_free_trial,
  (length(body) - length(replace(body, '「FANZA TVの解約タイミングと注意点」の記事', ''))) / length('「FANZA TVの解約タイミングと注意点」の記事') as ref_kaiyaku,
  (length(body) - length(replace(body, '「FANZA TVとは？」の記事',                  ''))) / length('「FANZA TVとは？」の記事')                  as ref_tv_guide,
  (length(body) - length(replace(body, '「FANZA TVの評判は本当？」の記事',           ''))) / length('「FANZA TVの評判は本当？」の記事')           as ref_tv_review,
  (length(body) - length(replace(body, '「FANZA/DMMの支払いは明細にどう載る？」の記事', ''))) / length('「FANZA/DMMの支払いは明細にどう載る？」の記事') as ref_pay_statement
from editorial_articles
where publish_status = 'published'
order by slug;

-- 期待される内訳（2026-08-02 22:39:58 JST 本番レンダリング実測）
--   fanza-first-guide        : 0 / 0 / 0 / 0 / 0 / 0
--   fanza-kaiyaku            : 1 / 1 / 0 / 1 / 1 / 0   = 4
--   fanza-payment-methods    : 0 / 0 / 1 / 0 / 0 / 1   = 2
--   fanza-payment-statement  : 0 / 0 / 0 / 0 / 0 / 0
--   fanza-tv-free-trial      : 1 / 0 / 0 / 2 / 0 / 0   = 3
--   fanza-tv-guide           : 1 / 0 / 0 / 0 / 0 / 0   = 1
--   fanza-tv-review          : 1 / 1 / 0 / 1 / 0 / 0   = 3
--   ------------------------------------------------- 合計 13

-- ---------------------------------------------------------------------
-- STEP 1: 投入（トランザクションで一括／件数が合わなければ ROLLBACK）
-- ---------------------------------------------------------------------
begin;

-- A. fanza-kaiyaku（4件）
update editorial_articles set body = replace(body,
  '「FANZA TV無料体験の始め方と注意点」の記事',
  '「[FANZA TV無料体験の始め方と注意点](/articles/fanza-tv-free-trial)」の記事')
where slug = 'fanza-kaiyaku' and publish_status = 'published';

update editorial_articles set body = replace(body,
  '「はじめてのFANZA完全ガイド」の記事',
  '「[はじめてのFANZA完全ガイド](/articles/fanza-first-guide)」の記事')
where slug = 'fanza-kaiyaku' and publish_status = 'published';

update editorial_articles set body = replace(body,
  '「FANZA TVの評判は本当？」の記事',
  '「[FANZA TVの評判は本当？](/articles/fanza-tv-review)」の記事')
where slug = 'fanza-kaiyaku' and publish_status = 'published';

update editorial_articles set body = replace(body,
  '「FANZA TVとは？」の記事',
  '「[FANZA TVとは？](/articles/fanza-tv-guide)」の記事')
where slug = 'fanza-kaiyaku' and publish_status = 'published';

-- B. fanza-tv-free-trial（3件 = 「FANZA TVとは？」×2 + 「はじめての…」×1）
update editorial_articles set body = replace(body,
  '「FANZA TVとは？」の記事',
  '「[FANZA TVとは？](/articles/fanza-tv-guide)」の記事')
where slug = 'fanza-tv-free-trial' and publish_status = 'published';

update editorial_articles set body = replace(body,
  '「はじめてのFANZA完全ガイド」の記事',
  '「[はじめてのFANZA完全ガイド](/articles/fanza-first-guide)」の記事')
where slug = 'fanza-tv-free-trial' and publish_status = 'published';

-- C. fanza-tv-review（3件）
update editorial_articles set body = replace(body,
  '「FANZA TVとは？」の記事',
  '「[FANZA TVとは？](/articles/fanza-tv-guide)」の記事')
where slug = 'fanza-tv-review' and publish_status = 'published';

update editorial_articles set body = replace(body,
  '「FANZA TV無料体験の始め方と注意点」の記事',
  '「[FANZA TV無料体験の始め方と注意点](/articles/fanza-tv-free-trial)」の記事')
where slug = 'fanza-tv-review' and publish_status = 'published';

update editorial_articles set body = replace(body,
  '「はじめてのFANZA完全ガイド」の記事',
  '「[はじめてのFANZA完全ガイド](/articles/fanza-first-guide)」の記事')
where slug = 'fanza-tv-review' and publish_status = 'published';

-- D. fanza-payment-methods（2件）
update editorial_articles set body = replace(body,
  '「FANZA TVの解約タイミングと注意点」の記事',
  '「[FANZA TVの解約タイミングと注意点](/articles/fanza-kaiyaku)」の記事')
where slug = 'fanza-payment-methods' and publish_status = 'published';

update editorial_articles set body = replace(body,
  '「FANZA/DMMの支払いは明細にどう載る？」の記事',
  '「[FANZA/DMMの支払いは明細にどう載る？](/articles/fanza-payment-statement)」の記事')
where slug = 'fanza-payment-methods' and publish_status = 'published';

-- E. fanza-tv-guide（1件）
update editorial_articles set body = replace(body,
  '「はじめてのFANZA完全ガイド」の記事',
  '「[はじめてのFANZA完全ガイド](/articles/fanza-first-guide)」の記事')
where slug = 'fanza-tv-guide' and publish_status = 'published';

-- ---------------------------------------------------------------------
-- STEP 2: コミット前の検算（この SELECT が合計 13 を返すこと）
-- ---------------------------------------------------------------------
select
  slug,
  (length(body) - length(replace(body, '](/articles/', ''))) / length('](/articles/') as link_count
from editorial_articles
where publish_status = 'published'
order by slug;
-- 期待値: kaiyaku=4 / tv-free-trial=3 / tv-review=3 / payment-methods=2 / tv-guide=1
--         first-guide=0 / payment-statement=0   → 合計 13

-- 13 でなければ  rollback;  を実行して中止すること
commit;
