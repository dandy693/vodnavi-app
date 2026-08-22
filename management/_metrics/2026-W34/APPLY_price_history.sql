-- price_history — セール価格の時系列（第93便 CSO裁定B(1)）
--
-- 【設計方針・裁定の転記】
--   「sitemap_cohort と同じ三層構成は不要（読み取り専用データ・公開面に出ない）。
--    最小スキーマで cron 化まで実施すること」
--   → 専用ロール（`ai_proposer` / `cohort_writer` 相当）・列単位 GRANT・トリガは作らない。
--   → ただし **RLS は有効化してポリシーを1つも作らない**。これにより
--      anon / authenticated からは一切読めず、**service role だけが到達できる**。
--      三層より少ない工程で、公開面へ漏れない状態を作れる。
--
-- 【冪等性】主キー (content_id, snapshot_date) により **1日1作品1行**。
--   cron が二重起動しても行が増えない（upsert で更新されるだけ）。
--
-- 【なぜ日付が JST の date か】セールの境界（`date_end`）が JST 基準で切られるため
--   （FANZA API の日時は TZ なしの JST 文字列）。UTC 日付で束ねると境界がずれる。

begin;

create table if not exists public.price_history (
  content_id     text        not null,
  snapshot_date  date        not null,          -- JST の日付（取得日）
  floor_code     text        not null,
  price          integer,                        -- セール価格（円）。読めなければ null
  list_price     integer,                        -- 定価（円）。読めなければ null
  campaign_title text,                           -- API の campaign[0].title（定数で持たない）
  campaign_end   timestamptz,                    -- campaign[0].date_end を JST として解釈した絶対時刻
  captured_at    timestamptz not null default now(),
  primary key (content_id, snapshot_date)
);

create index if not exists price_history_date_idx on public.price_history (snapshot_date);
create index if not exists price_history_cid_idx  on public.price_history (content_id);

alter table public.price_history enable row level security;

-- 事後検算（§10 回避手順3）。不一致なら例外で自動ロールバックする。
do $$
declare v_cols int; v_rls boolean; v_pol int; v_idx int; v_pk int;
begin
  select count(*) into v_cols from information_schema.columns
   where table_schema='public' and table_name='price_history';
  if v_cols <> 8 then
    raise exception '検算失敗: price_history の列数が % で期待 8 と一致しない', v_cols;
  end if;

  select relrowsecurity into v_rls from pg_class where oid='public.price_history'::regclass;
  if not v_rls then
    raise exception '検算失敗: RLS が有効になっていない';
  end if;

  select count(*) into v_pol from pg_policies where tablename='price_history';
  if v_pol <> 0 then
    raise exception '検算失敗: ポリシーが % 件ある（0 件であるべき＝service role のみ到達）', v_pol;
  end if;

  select count(*) into v_idx from pg_indexes where tablename='price_history';
  if v_idx < 3 then
    raise exception '検算失敗: 索引が % 件（PK + 2 索引で 3 件以上を期待）', v_idx;
  end if;

  select count(*) into v_pk from pg_constraint
   where conrelid='public.price_history'::regclass and contype='p';
  if v_pk <> 1 then
    raise exception '検算失敗: 主キーが % 件', v_pk;
  end if;

  raise notice '検算OK: 列8 / RLS有効 / ポリシー0 / 索引%件 / 主キー1', v_idx;
end $$;

commit;
