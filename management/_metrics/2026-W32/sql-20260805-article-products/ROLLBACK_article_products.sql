-- =====================================================================
-- article_products: ROLLBACK（APPLY の逆操作）
--
-- 対象DB : Supabase vodnavi-production (ref xflqxxyvphqqmnzscpxr)
--
-- 【原理】APPLY は「3行の INSERT」と「title 列の追加」のみ。
--   - データの巻き戻しは content_id を明示した DELETE（他記事・他作品を巻き込まない）
--   - 列の削除は **既定では行わない**（列が残っていても title=NULL 相当で
--     レンダラは content_id へフォールバックするため実害がない。
--     列削除は不可逆性が高いので CSO の明示指示がある場合のみ §2 を使う）
-- =====================================================================


-- =====================================================================
-- §1 データのみ巻き戻す（第一手・推奨）
--   ★この 1 回の Run で完結させること
-- =====================================================================
begin;

do $$
declare
  v_article_id uuid;
  v_n int;
begin
  select id into v_article_id
  from editorial_articles
  where slug = 'fanza-first-guide';

  if v_article_id is null then
    raise exception 'AP ROLLBACK ABORT: slug=fanza-first-guide が見つからない';
  end if;

  delete from article_products
   where article_id = v_article_id
     and content_id in ('1dldss00552', '1dldss00527', '1dldss00515');

  get diagnostics v_n = ROW_COUNT;

  if v_n <> 3 then
    raise exception 'AP ROLLBACK ABORT: 削除件数が 3 でない actual=%（想定外の状態）', v_n;
  end if;

  -- 巻き戻し後は当該記事の行が 0 件であること
  if (select count(*) from article_products where article_id = v_article_id) <> 0 then
    raise exception 'AP ROLLBACK ABORT: 削除後も行が残っている';
  end if;

  raise notice 'AP ROLLBACK OK: % 件削除', v_n;
end
$$;

commit;

-- 確認（読み取り専用）
select e.slug, count(p.content_id) as product_count
from editorial_articles e
left join article_products p on p.article_id = e.id
where e.publish_status = 'published'
group by e.slug
order by e.slug;
-- 期待: 全 slug で product_count = 0


-- =====================================================================
-- §2 列も削除する場合（**CSO の明示指示がある場合のみ**）
--   ※ レンダラが `select ... , title` を発行しているため、
--     **列を削除するとレンダラ側でエラーになりうる**。
--     列を消すなら「レンダラを title 参照前の状態へ revert してデプロイ」
--     したあとに実行すること。順序を誤ると記事ページが壊れる。
-- =====================================================================
-- alter table article_products drop column if exists title;
