# STRATEGY BRIEF 104 — vodnavi.jp メディア層の Next.js ルーティング整合と既存SEO資産の完全継承

## 0. 前提の訂正（物理事実・最高法律準拠）
- **vodnavi.jp（site-brand）は既に Next.js（App Router）で本番 deploy 済**（`src/app/[slug]/page.tsx`・`03_content/` clean 記事・dual-read 配線、TASK_BOARD 行119）。よって本ブリーフは「ゼロからの Next.js 移行」ではなく、**既存ルーティングの整合性強化と、将来の記事移植に備えた SEO 継承要件**を定義する。
- **「完全遷都（full migration）」は未承認・ゲート対象**（TASK_BOARD T-20260628-11 / 行137-139）。Next.js+Supabase 動的完全遷都は提案段階で、(1) HUMAN 承認 + (2) Supabase × FANZA API 互換 PoC を経るまで着手しない。本ブリーフは**その承認を前提せず**、承認後に備えた要件定義に留める。
- **moterist.com は完全凍結（BRIEF_043, 2026-06-07）**＝既存5記事の SEO本文/パーマリンク/GA4 はホールド、**ドメイン廃止・一斉削除はしない**。したがって moterist の URL は**現在地で生存維持**が正典であり、vodnavi.jp への移送は（条件的）凍結解除 + 完全遷都承認を経た上で **301 で SEO を保全する場合のみ**。本ブリーフ単独で moterist 資産には一切触れない。
- **物理データ**: moterist.com の検索流入は実質ゼロ（GSC clicks 0 / impr 1）、実集客は vodnavi.jp（impr 81.8k）。よって「moterist の SEO 資産を継承」する便益は限定的＝主対象は vodnavi.jp 自身の既存ルーティング保全。

## 1. 目的
vodnavi.jp（メディア要塞化・第2波）において、既存のSEO資産（URL構造・ディレクトリ階層・clean 記事 slug）を1ミリも破壊せず Next.js 16 のファイルシステムルーティング上で整合させ、404 による評価下落を防ぐ。将来 moterist 記事の移植が承認された場合に備え、301 保全と canonical 継承の要件を予め定義する。

## 2. 不変条件（最高法律への準拠）
- **URLマッピングの固定**:
  - 既存 slug / 正規パス構造を Next.js `app/[slug]/page.tsx` または静的 ISR ルーティングで完全再現し、404 を徹底防御せよ。移植が承認された旧記事は **301 リダイレクトで旧URLの評価を新URLへ継承**（旧URLの即時消滅・素の404化は禁止）。
- **インデックスの継承**:
  - `STRATEGY_BRIEF_101` の self-canonical consolidation を完全適用し、移行後のページ群でもクエリパラメータ（`?sort=` 等）による評価分散を許さず、すべてプライマリ絶対URLへ canonical を緊結せよ（`noindex` は付与しない＝consolidation を阻害するため）。
