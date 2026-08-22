-- price_history に batch_at を追加（第95便 CSO裁定⑤）
--
-- 【なぜ要るか】cron を1日2回（06:00 / 14:00 JST）にしたため、
-- **同じ snapshot_date に複数のスナップショットが載る**。
-- 主キー `(content_id, snapshot_date)` は「1日1作品1行」を保証するが、
-- **セール対象は時間とともに入れ替わるため、2回目の実行で新しい content_id が加わり、
-- 消えた content_id は前回の行が残る**（upsert は削除しない）。
-- したがって「その日の行」は **複数バッチの和集合**になり、日次比較の基準にならない。
--   実測（2026-08-22）: 検証で4回実行し 388 → 420行へ増加した。
--
-- 【定義】**その日の最終スナップショット ＝ `snapshot_date` ごとに `batch_at` が
-- 最大の値を持つ行の集合**。`batch_at` は **1回の実行内で全行に同じ値**を入れる
-- （`captured_at` は行ごとの `now()` でばらつくため基準にできない）。
--
-- 【既存行の扱い】2026-08-22 の 420行は `captured_at` で埋める。
-- **この日は複数バッチが混ざっており、最終スナップショットを事後に復元できない。**
-- **8/22 を日次比較の基準に使わないこと**（差分検知は 8/23 以降の比較から始める）。

begin;

alter table public.price_history
  add column if not exists batch_at timestamptz;

-- 既存行のバックフィル（8/22 分のみ・混在していることは上のコメントのとおり）。
update public.price_history
   set batch_at = captured_at
 where batch_at is null;

alter table public.price_history
  alter column batch_at set not null;

create index if not exists price_history_batch_idx
  on public.price_history (snapshot_date, batch_at desc);

do $$
declare v_cols int; v_null int; v_idx int;
begin
  select count(*) into v_cols from information_schema.columns
   where table_schema='public' and table_name='price_history';
  if v_cols <> 9 then
    raise exception '検算失敗: 列数が % で期待 9 と一致しない', v_cols;
  end if;

  select count(*) into v_null from public.price_history where batch_at is null;
  if v_null <> 0 then
    raise exception '検算失敗: batch_at が null の行が % 件ある', v_null;
  end if;

  select count(*) into v_idx from pg_indexes where tablename='price_history';
  if v_idx < 4 then
    raise exception '検算失敗: 索引が % 件（PK + 3 索引で 4 件以上を期待）', v_idx;
  end if;

  raise notice '検算OK: 列9 / batch_at の null 0件 / 索引%件', v_idx;
end $$;

commit;
