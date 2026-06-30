# STRATEGY BRIEF 109 — vodnavi.jp / app.vodnavi.jp インデックス方針および XML サイトマップ物理監査

## 0. 前提の訂正（物理事実・最高法律準拠）
- **`?sort=` への `noindex` は不採用（最高法律違反）**。BRIEF_101 / e82a670 / BRIEF_085 §3 / BRIEF_086 §4 では**クエリURLは self-canonical consolidation で正規絶対URLへ評価集約し、`noindex` は付与しない**（noindex は consolidation を阻害）。本ブリーフは CSO 原案の「noindex 制御」を要件から除外し、self-canonical のみを索引方針とする。
  - 注: site-brand は**特定のハブ/一覧ページ**（`/guide` `/reviews` `/genres` `/actresses` `/authors`）に **page-level `robots:{index:false}`** を適用済（`sitemap.ts` も整合的にこれらを除外）。これは**ページ単位の意図的 noindex** であり、`?sort=` クエリの扱い（＝self-canonical）とは**別問題**。混同しない。
- **サイトマップ上限は 1ファイル 50,000 URL / 50MB**（sitemaps.org / Google 仕様）。CSO 原案「20,000件上限」は**誤り**。
- **現状チャンク分割ロジックは存在しない**＝両 `sitemap.ts` は単一フラット配列を返す。app-concierge は約2,008 URL（root + floors + works + genres(≤`MAX_GENRES=200`) + actresses）で **50,000 を大きく下回り分割不要**。site-brand は `/`・`/compare`・`03_content/{slug}` のみで極小。

## 1. 目的
2ドメイン（`vodnavi.jp` = site-brand / `app.vodnavi.jp` = app-concierge）の全公開URLにおける索引方針（self-canonical consolidation・`?sort=` への noindex 不付与）と、各 `src/app/sitemap.ts` が生成する XML の実コード由来の絶対URL構造・整形式（well-formed）を物理監査する。

## 2. 監査の不変条件
- **空中戦の排除**: 憶測によるクローラー挙動の捏造を禁止し、`site-brand/src/app/sitemap.ts` および `app-concierge/src/app/sitemap.ts` の**実コードから生成される XML の絶対URL構造のみ**をファクトとして検証する。
- **正規化の徹底**: `?sort=` 等の並び替えパラメータは self-canonical で正規絶対URLへ集約（noindex 不使用）。汚染の有無を実コード／本番 curl で確認する。
- **整形式の死守**: pagination 等の**生 `&`** を `<loc>` に出さない（過去 [[project_app_sitemap_parse_error]] で約1,800 URL を巻き込み「検出0」化した回帰の再発防止）。
