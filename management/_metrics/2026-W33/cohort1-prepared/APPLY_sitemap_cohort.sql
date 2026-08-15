-- =============================================================================
-- BRIEF_128 コホート1 — `sitemap_cohort` の三層分離 DDL【確定版・rev1】
--
--   CSO承認 2026-08-15（第59便 裁定(2)）/ 確定 2026-08-16（第61便 タスクD-1）
--
--   【厳守】本 SQL は 2026-08-21 かつ β/α の判定完了より前に実行しない。
--   理由: コホート1 の投入はクロール予算を +5,000 URL 分消費し、更新一巡が
--         108日 → 148日 になる（算術的に確実）。β/α の判定項目①は
--         「articles の再クロール」であり、投入すると観測が汚染される。
--
--   実行方法（§10 回避手順3）: begin; 〜 commit; を **単一 Run** で実行し、
--   事後検算に失敗したら `raise exception` でロールバックさせること。
--
--   【設計の出所】`internal_links`（FACT_GOVERNANCE.md §12）と同型の三層:
--     ① GRANT を出さない  ② RLS `with check`  ③ トリガによる不変条件
--
--   【§12 との意図的な差分】`approved` 中間状態を置かない。
--     `internal_links` は「承認済だが掲出タイミング未決」の状態が実際に必要
--     （R2 +4週 / β・α 〜9/30 / APCTA が同時進行）だったため `approved` を
--     挟んだ。コホートは **一括投入** であり、その状態が存在しない。
--     したがって `staged` がそのまま「投入待ち」を兼ねる。
--     **§12 をそのまま写していないことを明記する。**
--
--   【厳守・保証の範囲】三層が守る対象は「抽出バッチのプロセス」であって
--     「service role」ではない。Supabase の service role は RLS を迂回する。
--     `sitemap-cohort-1.xml` の配信は `getServiceRoleClient()` による読み取りに
--     依存するため、**実装と同時に service role 経由の書き込み経路が有効になる**
--     （`internal_links` のレンダラと同じ構造）。
--     「三層があるから誰も live を書けない」とは書かないこと。
--     → FACT_GOVERNANCE.md §12 の 2026-08-15 追記を参照。
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1) テーブル
-- ---------------------------------------------------------------------------
create table if not exists public.sitemap_cohort (
  content_id    text        primary key,
  cohort_no     smallint    not null,
  floor_code    text        not null,
  released_at   timestamptz,
  price_band    text        not null
                check (price_band in ('0-399','400-999','1000-1999','2000-2999','3000+')),
  price         integer,
  has_large     boolean,
  status        text        not null default 'staged'
                check (status in ('staged','live','retired')),
  first_seen_at timestamptz not null default now(),
  published_at  timestamptz,
  published_by  text,
  retired_at    timestamptz
);

create index if not exists sitemap_cohort_no_status_idx
  on public.sitemap_cohort (cohort_no, status);

-- ---------------------------------------------------------------------------
-- 2) ロール分離（GRANT）
--    cohort_writer   … 抽出バッチ用。INSERT のみ。UPDATE/DELETE は一切与えない
--    cohort_publisher… 掲出承認用。SELECT + 列単位 UPDATE のみ
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'cohort_writer') then
    create role cohort_writer nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'cohort_publisher') then
    create role cohort_publisher nologin;
  end if;
end $$;

grant usage on schema public to cohort_writer, cohort_publisher;
grant insert on public.sitemap_cohort to cohort_writer;
grant select on public.sitemap_cohort to cohort_publisher;
grant update (status, published_at, published_by, retired_at)
  on public.sitemap_cohort to cohort_publisher;
-- cohort_writer には UPDATE / DELETE / SELECT を与えない（意図的）

-- ---------------------------------------------------------------------------
-- 3) RLS
-- ---------------------------------------------------------------------------
alter table public.sitemap_cohort enable row level security;

drop policy if exists cohort_writer_insert on public.sitemap_cohort;
create policy cohort_writer_insert on public.sitemap_cohort
  for insert to cohort_writer
  with check (
    status       = 'staged'
    and published_at is null
    and published_by is null
    and retired_at   is null
  );

drop policy if exists cohort_publisher_select on public.sitemap_cohort;
create policy cohort_publisher_select on public.sitemap_cohort
  for select to cohort_publisher using (true);

drop policy if exists cohort_publisher_update on public.sitemap_cohort;
create policy cohort_publisher_update on public.sitemap_cohort
  for update to cohort_publisher using (true) with check (true);
  -- 遷移規則と必須列はトリガで強制する（RLS の with check では表現しない）

-- ---------------------------------------------------------------------------
-- 4) トリガ3種
-- ---------------------------------------------------------------------------

-- T1: 遷移規則  staged → live|retired / live → retired / retired → （不可）
create or replace function public.guard_cohort_transition()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if old.status = new.status then
    return new;
  end if;
  if old.status = 'staged' and new.status in ('live','retired') then
    return new;
  end if;
  if old.status = 'live' and new.status = 'retired' then
    return new;
  end if;
  raise exception
    'sitemap_cohort: 不正な状態遷移 % -> %（retired は終端。再掲出は新規行を staged から作り直す）',
    old.status, new.status;
end $$;

drop trigger if exists trg_cohort_transition on public.sitemap_cohort;
create trigger trg_cohort_transition
  before update of status on public.sitemap_cohort
  for each row execute function public.guard_cohort_transition();

-- T2: live には published_at と published_by の両方が必須
create or replace function public.guard_cohort_live_requires_publisher()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status = 'live'
     and (new.published_at is null or new.published_by is null or new.published_by = '') then
    raise exception
      'sitemap_cohort: status=live には published_at と published_by の両方が必須';
  end if;
  if new.status = 'retired' and new.retired_at is null then
    new.retired_at := now();
  end if;
  return new;
end $$;

drop trigger if exists trg_cohort_live_requires_publisher on public.sitemap_cohort;
create trigger trg_cohort_live_requires_publisher
  before update on public.sitemap_cohort
  for each row execute function public.guard_cohort_live_requires_publisher();

-- T3: INSERT は status='staged' 以外を拒否（RLS を通れない経路への二重防御）
create or replace function public.guard_cohort_insert_staged()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.status is distinct from 'staged'
     or new.published_at is not null
     or new.published_by is not null
     or new.retired_at   is not null then
    raise exception
      'sitemap_cohort: INSERT は status=staged かつ published_at/published_by/retired_at が null でなければならない';
  end if;
  return new;
end $$;

drop trigger if exists trg_cohort_insert_staged on public.sitemap_cohort;
create trigger trg_cohort_insert_staged
  before insert on public.sitemap_cohort
  for each row execute function public.guard_cohort_insert_staged();

-- ---------------------------------------------------------------------------
-- 5) 事後検算（不一致なら例外＝自動ロールバック・§10 回避手順3）
-- ---------------------------------------------------------------------------
do $$
declare
  v_rls   boolean;
  v_pol   int;
  v_trg   int;
  v_wr_up int;
begin
  select c.relrowsecurity into v_rls
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'sitemap_cohort';
  if v_rls is not true then
    raise exception '検算失敗: RLS が有効になっていない';
  end if;

  select count(*) into v_pol from pg_policies
   where schemaname = 'public' and tablename = 'sitemap_cohort';
  if v_pol <> 3 then
    raise exception '検算失敗: policy 数が 3 でない（実際 %）', v_pol;
  end if;

  select count(*) into v_trg from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
   where c.relname = 'sitemap_cohort' and not t.tgisinternal;
  if v_trg <> 3 then
    raise exception '検算失敗: トリガ数が 3 でない（実際 %）', v_trg;
  end if;

  -- cohort_writer に UPDATE 権限が無いこと
  select count(*) into v_wr_up
    from information_schema.column_privileges
   where table_schema = 'public' and table_name = 'sitemap_cohort'
     and grantee = 'cohort_writer' and privilege_type = 'UPDATE';
  if v_wr_up <> 0 then
    raise exception '検算失敗: cohort_writer に UPDATE 権限がある（% 列）', v_wr_up;
  end if;

  raise notice '検算OK: RLS=on / policy=3 / trigger=3 / cohort_writer の UPDATE 権限=0';
end $$;

commit;

-- =============================================================================
-- ロールバック（参照断ち・第一手／コード revert 不要）
--   update public.sitemap_cohort
--      set status = 'retired', retired_at = now()
--    where cohort_no = 1 and status = 'live';
--   → 次の revalidate（最大60分）で sitemap-cohort-1.xml は空の urlset になる。
--   【注意】GSC 側の数値は即座には戻らない（R2 では 8/13→8/15 のラグを実測）。
--           ロールバック後の判定は最低1週間空けること。
-- =============================================================================
