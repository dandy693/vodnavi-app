-- =====================================================================
-- B2① 実運用: ROLLBACK SQL（APPLY_b21_links.sql の逆操作）
-- 対象DB : Supabase vodnavi-production (ref xflqxxyvphqqmnzscpxr)
-- 対象表 : editorial_articles(列 body)
--
-- 【原理】APPLY は「挿入のみ」の replace() であるため、
--         逆向きの replace() で厳密に元の文字列へ戻る（不可逆な情報損失なし）。
--         全文バックアップに依存しないロールバックであり、Q(archive floor)の
--         スナップショット方式と同等以上の厳格さを持つ。
--
-- 【併用バックアップ】投入直前のレンダリング出力スナップショット:
--         management/_metrics/2026-W31/backup-20260802-b21/*.rendered.html
--         （2026-08-02 22:39:58 JST 取得・7ファイル）
-- =====================================================================

begin;

-- A. fanza-kaiyaku
update editorial_articles set body = replace(body,
  '「[FANZA TV無料体験の始め方と注意点](/articles/fanza-tv-free-trial)」の記事',
  '「FANZA TV無料体験の始め方と注意点」の記事')
where slug = 'fanza-kaiyaku';

update editorial_articles set body = replace(body,
  '「[はじめてのFANZA完全ガイド](/articles/fanza-first-guide)」の記事',
  '「はじめてのFANZA完全ガイド」の記事')
where slug = 'fanza-kaiyaku';

update editorial_articles set body = replace(body,
  '「[FANZA TVの評判は本当？](/articles/fanza-tv-review)」の記事',
  '「FANZA TVの評判は本当？」の記事')
where slug = 'fanza-kaiyaku';

update editorial_articles set body = replace(body,
  '「[FANZA TVとは？](/articles/fanza-tv-guide)」の記事',
  '「FANZA TVとは？」の記事')
where slug = 'fanza-kaiyaku';

-- B. fanza-tv-free-trial
update editorial_articles set body = replace(body,
  '「[FANZA TVとは？](/articles/fanza-tv-guide)」の記事',
  '「FANZA TVとは？」の記事')
where slug = 'fanza-tv-free-trial';

update editorial_articles set body = replace(body,
  '「[はじめてのFANZA完全ガイド](/articles/fanza-first-guide)」の記事',
  '「はじめてのFANZA完全ガイド」の記事')
where slug = 'fanza-tv-free-trial';

-- C. fanza-tv-review
update editorial_articles set body = replace(body,
  '「[FANZA TVとは？](/articles/fanza-tv-guide)」の記事',
  '「FANZA TVとは？」の記事')
where slug = 'fanza-tv-review';

update editorial_articles set body = replace(body,
  '「[FANZA TV無料体験の始め方と注意点](/articles/fanza-tv-free-trial)」の記事',
  '「FANZA TV無料体験の始め方と注意点」の記事')
where slug = 'fanza-tv-review';

update editorial_articles set body = replace(body,
  '「[はじめてのFANZA完全ガイド](/articles/fanza-first-guide)」の記事',
  '「はじめてのFANZA完全ガイド」の記事')
where slug = 'fanza-tv-review';

-- D. fanza-payment-methods
update editorial_articles set body = replace(body,
  '「[FANZA TVの解約タイミングと注意点](/articles/fanza-kaiyaku)」の記事',
  '「FANZA TVの解約タイミングと注意点」の記事')
where slug = 'fanza-payment-methods';

update editorial_articles set body = replace(body,
  '「[FANZA/DMMの支払いは明細にどう載る？](/articles/fanza-payment-statement)」の記事',
  '「FANZA/DMMの支払いは明細にどう載る？」の記事')
where slug = 'fanza-payment-methods';

-- E. fanza-tv-guide
update editorial_articles set body = replace(body,
  '「[はじめてのFANZA完全ガイド](/articles/fanza-first-guide)」の記事',
  '「はじめてのFANZA完全ガイド」の記事')
where slug = 'fanza-tv-guide';

-- 検算: 下の SELECT が全 slug で 0 を返すこと
select
  slug,
  (length(body) - length(replace(body, '](/articles/', ''))) / length('](/articles/') as link_count
from editorial_articles
where publish_status = 'published'
order by slug;

commit;
