-- =====================================================================
-- article_products: title 列の追加（STEP 1-1）+ fanza-first-guide 3件の投入（STEP 2）
--
-- 対象DB : Supabase vodnavi-production (ref xflqxxyvphqqmnzscpxr)
-- 対象表 : article_products / editorial_articles(参照のみ)
-- 承認   : CSO 2026-08-05「ラベル改修(a) + 3件先行投入」
--
-- 【設計原則】B2① rev2 と同一。
--   「期待件数どおりでなければ絶対に commit されない」を DB レベルで保証する。
--   人的判断の余地を残さない。
--   - Supabase SQL Editor は「Run」ごとに独立したリクエストで実行されるため、
--     begin; だけを実行しても次の Run までトランザクションは維持されない。
--     したがって begin; 〜 commit; は **1回の Run で完結**させること。
--   - INSERT と検算を単一の DO $$ ... $$ ブロックに入れる。例外が発生すれば
--     ブロック内の全変更が自動的にロールバックされる。
--   - article_id は UUID 直書きではなく slug のサブクエリで解決する。
--
-- 【実行順序の注意】
--   STEP 1-1(DDL) → レンダラのデプロイ → STEP 2(データ投入) の順に行うこと。
--   STEP 2 を先に実行すると、旧ラベル（content_id 表示）のまま
--   article_product_cta が本番で可視化される（ISR revalidate=300 のため最大5分）。
-- =====================================================================


-- =====================================================================
-- STEP 0 : 列構成の確認（読み取り専用・単独で実行すること）
--   ※ MCP が read-only 切断中で DDL を読めていないため、実行直前に確認する
-- =====================================================================
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'article_products'
order by ordinal_position;

-- 期待: article_id / content_id / asp_name / display_order が存在し、
--       title は **存在しない**（存在する場合は STEP 1-1 を実行しないこと）


-- =====================================================================
-- STEP 0-2 : 投入前の件数確認（読み取り専用・単独で実行すること）
--   期待値: 全 slug で product_count = 0
-- =====================================================================
select
  e.slug,
  count(p.content_id) as product_count
from editorial_articles e
left join article_products p on p.article_id = e.id
where e.publish_status = 'published'
group by e.slug
order by e.slug;


-- =====================================================================
-- STEP 1-1 : title 列の追加（DDL・単独 Run で可）
--   nullable。既存行があっても NULL で入るためレンダラは content_id へ
--   フォールバックする（フェイルセーフ）。
-- =====================================================================
alter table article_products add column if not exists title text;

-- 確認（読み取り専用）
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'article_products' and column_name = 'title';
-- 期待: title / text / YES


-- =====================================================================
-- STEP 2 : fanza-first-guide へ3件を投入
--   ★この 1 回の Run で完結させること（begin; から commit; まで）
--   ★レンダラのデプロイ完了後に実行すること
-- =====================================================================
begin;

do $$
declare
  v_article_id uuid;
  v_pre  int;
  v_post int;
begin
  ---------------------------------------------------------------------
  -- (1) 対象記事の解決（UUID 直書きをしない）
  ---------------------------------------------------------------------
  select id into v_article_id
  from editorial_articles
  where slug = 'fanza-first-guide' and publish_status = 'published';

  if v_article_id is null then
    raise exception
      'AP ABORT: slug=fanza-first-guide が見つからない（未公開 または slug 相違）';
  end if;

  ---------------------------------------------------------------------
  -- (2) 冪等性ガード: 既に行があれば中止（二重投入の防止）
  ---------------------------------------------------------------------
  select count(*) into v_pre from article_products where article_id = v_article_id;
  if v_pre <> 0 then
    raise exception
      'AP ABORT (pre-check): fanza-first-guide に既に % 件存在する。二重投入の疑い', v_pre;
  end if;

  ---------------------------------------------------------------------
  -- (3) 投入（3件）
  --     title は 2026-08-05 23:27:12 JST に本番 works 詳細の h1 で実測した値。
  --     3作品とも同時刻に HTTP 200 を確認済み。
  ---------------------------------------------------------------------
  insert into article_products (article_id, content_id, asp_name, display_order, title) values
    (v_article_id, '1dldss00552', 'fanza', 1,
     'こんなおばさんでもナマでしてくれますか？ 小沢菜穂'),
    (v_article_id, '1dldss00527', 'fanza', 2,
     '電撃専属今井美優 あざといくらいがやっぱり可愛くない？この子の魅力、もっと伝えたいー。可能性''無限大''の大人美女。'),
    (v_article_id, '1dldss00515', 'fanza', 3,
     '爆乳禁止区域 電撃専属 叶愛 108cm Mcup デカさ、メガトン級');

  ---------------------------------------------------------------------
  -- (4) 事後検算: 件数 / title の NULL 混入 / display_order の重複
  ---------------------------------------------------------------------
  select count(*) into v_post from article_products where article_id = v_article_id;
  if v_post <> 3 then
    raise exception 'AP ABORT (post-check): 投入後の件数が 3 でない actual=%', v_post;
  end if;

  if exists (
    select 1 from article_products
    where article_id = v_article_id and (title is null or btrim(title) = '')
  ) then
    raise exception 'AP ABORT (post-check): title が空の行がある';
  end if;

  if (select count(distinct display_order) from article_products where article_id = v_article_id) <> 3 then
    raise exception 'AP ABORT (post-check): display_order が重複している';
  end if;

  -- 他記事を巻き込んでいないこと（全体件数が 3 であること）
  if (select count(*) from article_products) <> 3 then
    raise exception 'AP ABORT (post-check): article_products 全体の件数が 3 でない actual=%',
      (select count(*) from article_products);
  end if;

  raise notice 'AP OK: fanza-first-guide に % 件投入', v_post;
end
$$;

commit;
-- ★ DO ブロックが例外を投げた場合、トランザクションは aborted 状態となり
--   この commit; は ROLLBACK として作用する（DO ブロック単体でも既に原子的）。


-- =====================================================================
-- STEP 3 : 事後確認（読み取り専用・commit 後に単独で実行）
--   期待値: 3行・slug=fanza-first-guide・display_order 1..3・title が全件非NULL
-- =====================================================================
select e.slug, p.display_order, p.content_id, p.asp_name, p.title
from article_products p
join editorial_articles e on e.id = p.article_id
order by e.slug, p.display_order;
