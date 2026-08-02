-- =====================================================================
-- B2① 実運用: 記事本文への内部リンク記法 投入SQL【単一Run形式・rev2】
--
-- 対象DB : Supabase vodnavi-production (ref xflqxxyvphqqmnzscpxr)
-- 対象表 : editorial_articles(列 body / slug / publish_status)
-- 承認   : CSO 2026-08-02「既存プレーンテキスト参照13件のみ」
--          + 2026-08-02 単一Run形式への改訂承認
-- 改訂   : CTO 2026-08-02 22:5x JST (rev1=3分割 → rev2=単一Run)
--
-- 【改訂理由】Supabase SQL Editor は「Run」ごとに独立したリクエストで実行される。
--   rev1 の 3分割（begin; → 検算 → commit;）では begin; が次の Run まで維持されず、
--   検算前に 12件の UPDATE が確定してしまう危険があった。
--
-- 【設計原則】「13でなければ絶対に commit されない」を DB レベルで保証する。
--   人的判断の余地を残さない。
--   - UPDATE と検算を単一の DO $$ ... $$ ブロック内で実行する。
--     DO ブロックは単一の SQL 文であり、内部で例外が発生した場合は
--     ブロック内の全 UPDATE が自動的にロールバックされる（暗黙のトランザクション）。
--     → Run 跨ぎのトランザクション維持に一切依存しない。
--   - 外側の begin; / commit; は多重防御。DO が例外を投げた場合、
--     トランザクションは aborted 状態となり commit; は ROLLBACK として作用する。
--
-- 【方式】既存文字列への「挿入のみ」。
--         「TITLE」の記事  →  「[TITLE](/articles/slug)」の記事
--         既存文字は1文字も削除・変更しない。
--
-- 【replace() の多重度について — 意図的な設計であり偶然の一致ではない】
--   PostgreSQL の replace() は対象行内の「全出現箇所」を置換する。
--   本SQLは意図的に「(slug, フレーズ) の組 = UPDATE 1文」という単位で構成しており、
--   1文がその記事内の当該フレーズの全出現を一括変換する。
--     ・12  = 相異なる (slug, フレーズ) の組数（= UPDATE 文の数）
--     ・13  = 変換される出現箇所の総数
--     ・差の1件 = fanza-tv-free-trial 内の「FANZA TVとは？」の記事 が 2箇所あり、
--                 1文の replace() が同時に両方を変換するため。
--   多重度が想定と異なった場合（例: 3箇所に増えていた場合）でも、
--   下記 (3) の事後検算が「記事別内訳」を照合するため
--   fanza-tv-free-trial = 3 が崩れて例外→自動ロールバックとなる。
--   ＝ 多重度の偶然に依存せず、期待値との一致のみが commit の条件。
--
-- 【冪等性ガード】投入前チェックを DO ブロック内に内蔵しているため、
--   誤って2回実行しても2回目は「プレーン参照0件」で例外→ロールバックとなり、
--   二重適用は構造的に発生しない。
-- =====================================================================


-- =====================================================================
-- STEP 0 : 事前カウント（読み取り専用・単独で実行すること）
--   期待値: total_plain_refs の合計が 13 / total_link_markers はすべて 0
-- =====================================================================
select
  e.slug,
  coalesce(sum((length(e.body) - length(replace(e.body, p.phrase, ''))) / length(p.phrase)), 0) as total_plain_refs,
  (length(e.body) - length(replace(e.body, '](/articles/', ''))) / length('](/articles/')       as total_link_markers
from editorial_articles e
cross join (values
  ('「はじめてのFANZA完全ガイド」の記事'),
  ('「FANZA TV無料体験の始め方と注意点」の記事'),
  ('「FANZA TVの解約タイミングと注意点」の記事'),
  ('「FANZA TVとは？」の記事'),
  ('「FANZA TVの評判は本当？」の記事'),
  ('「FANZA/DMMの支払いは明細にどう載る？」の記事')
) as p(phrase)
where e.publish_status = 'published'
group by e.slug, e.body
order by e.slug;

-- 期待される結果（2026-08-02 22:39:58 JST 本番レンダリング実測）
--   slug                     | total_plain_refs | total_link_markers
--   -------------------------+------------------+-------------------
--   fanza-first-guide        |                0 |                 0
--   fanza-kaiyaku            |                4 |                 0
--   fanza-payment-methods    |                2 |                 0
--   fanza-payment-statement  |                0 |                 0
--   fanza-tv-free-trial      |                3 |                 0
--   fanza-tv-guide           |                1 |                 0
--   fanza-tv-review          |                3 |                 0
--   -------------------------+------------------+-------------------
--   合計                     |               13 |                 0
--
-- ★ 合計が 13 でない、または total_link_markers に 0 以外がある場合は
--   ここで停止し、STEP 1 を実行しないこと。


-- =====================================================================
-- STEP 1 : 投入 + 検算 + commit判定（★この 1 回の Run で完結させること）
-- =====================================================================
begin;

do $$
declare
  v_expected constant jsonb := jsonb_build_object(
    'fanza-kaiyaku',           4,
    'fanza-tv-free-trial',     3,
    'fanza-tv-review',         3,
    'fanza-payment-methods',   2,
    'fanza-tv-guide',          1,
    'fanza-first-guide',       0,
    'fanza-payment-statement', 0
  );
  v_slug     text;
  v_exp      int;
  v_actual   int;
  v_total    int := 0;
  v_pre      int;
  v_leftover int;
  v_report   text := '';
begin
  ---------------------------------------------------------------------
  -- (1) 事前検証: プレーン参照が期待どおり存在し、リンク記法が未適用であること
  --     ＝ 冪等性ガード（2回目の実行はここで必ず失敗する）
  ---------------------------------------------------------------------
  for v_slug, v_exp in select key, value::int from jsonb_each_text(v_expected) loop
    select coalesce(sum((length(e.body) - length(replace(e.body, p.phrase, ''))) / length(p.phrase)), 0)
      into v_pre
    from editorial_articles e
    cross join (values
      ('「はじめてのFANZA完全ガイド」の記事'),
      ('「FANZA TV無料体験の始め方と注意点」の記事'),
      ('「FANZA TVの解約タイミングと注意点」の記事'),
      ('「FANZA TVとは？」の記事'),
      ('「FANZA TVの評判は本当？」の記事'),
      ('「FANZA/DMMの支払いは明細にどう載る？」の記事')
    ) as p(phrase)
    where e.slug = v_slug and e.publish_status = 'published';

    if v_pre is distinct from v_exp then
      raise exception
        'B2-1 ABORT (pre-check): slug=% プレーン参照数が期待値と不一致 expected=% actual=% / 二重適用または本文変更の可能性',
        v_slug, v_exp, v_pre;
    end if;

    select (length(body) - length(replace(body, '](/articles/', ''))) / length('](/articles/')
      into v_actual
    from editorial_articles
    where slug = v_slug and publish_status = 'published';

    if coalesce(v_actual, 0) <> 0 then
      raise exception
        'B2-1 ABORT (pre-check): slug=% 既にリンク記法が存在 count=% / 二重適用の疑い',
        v_slug, v_actual;
    end if;
  end loop;

  ---------------------------------------------------------------------
  -- (2) 投入（挿入のみ・12文 / 13箇所）
  ---------------------------------------------------------------------
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

  -- B. fanza-tv-free-trial（3件＝「FANZA TVとは？」×2 +「はじめての…」×1）
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

  ---------------------------------------------------------------------
  -- (3) 検算: 記事別内訳 と 合計。1件でも不一致なら raise → 全件ロールバック
  ---------------------------------------------------------------------
  for v_slug, v_exp in select key, value::int from jsonb_each_text(v_expected) loop
    select (length(body) - length(replace(body, '](/articles/', ''))) / length('](/articles/')
      into v_actual
    from editorial_articles
    where slug = v_slug and publish_status = 'published';

    v_actual := coalesce(v_actual, -1);   -- 行が無い場合は -1 として必ず不一致にする

    if v_actual <> v_exp then
      raise exception
        'B2-1 ABORT (post-check): slug=% リンク数が期待値と不一致 expected=% actual=%',
        v_slug, v_exp, v_actual;
    end if;

    v_total  := v_total + v_actual;
    v_report := v_report || format('%s=%s ', v_slug, v_actual);
  end loop;

  -- (3-2) 合計の照合
  if v_total <> 13 then
    raise exception 'B2-1 ABORT (post-check): 合計リンク数が 13 でない actual=% / 内訳: %', v_total, v_report;
  end if;

  -- (3-3) 変換漏れの照合: プレーン参照が 0 件になっていること
  select coalesce(sum((length(e.body) - length(replace(e.body, p.phrase, ''))) / length(p.phrase)), 0)
    into v_leftover
  from editorial_articles e
  cross join (values
    ('「はじめてのFANZA完全ガイド」の記事'),
    ('「FANZA TV無料体験の始め方と注意点」の記事'),
    ('「FANZA TVの解約タイミングと注意点」の記事'),
    ('「FANZA TVとは？」の記事'),
    ('「FANZA TVの評判は本当？」の記事'),
    ('「FANZA/DMMの支払いは明細にどう載る？」の記事')
  ) as p(phrase)
  where e.publish_status = 'published';

  if v_leftover <> 0 then
    raise exception 'B2-1 ABORT (post-check): 未変換のプレーン参照が残存 count=%', v_leftover;
  end if;

  raise notice 'B2-1 OK: 合計=% / 内訳: %', v_total, v_report;
end
$$;

commit;
-- ★ DO ブロックが例外を投げた場合、トランザクションは aborted 状態となり
--   この commit; は ROLLBACK として作用する（DO ブロック単体でも既に原子的）。


-- =====================================================================
-- STEP 2 : 事後確認（読み取り専用・commit 後に単独で実行）
--   期待値: 下表のとおり／合計 13
-- =====================================================================
select
  slug,
  (length(body) - length(replace(body, '](/articles/', ''))) / length('](/articles/') as link_count
from editorial_articles
where publish_status = 'published'
order by slug;

--   slug                     | link_count
--   -------------------------+-----------
--   fanza-first-guide        |         0
--   fanza-kaiyaku            |         4
--   fanza-payment-methods    |         2
--   fanza-payment-statement  |         0
--   fanza-tv-free-trial      |         3
--   fanza-tv-guide           |         1
--   fanza-tv-review          |         3
--   -------------------------+-----------
--   合計                     |        13
