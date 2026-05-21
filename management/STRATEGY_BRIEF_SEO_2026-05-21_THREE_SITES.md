# STRATEGY_BRIEF_SEO_2026-05-21 — 3 サイト合同 SEO 改善（実装ログ + 残作業）

- 発行：CSO (Claude Opus 4.7 — 自動監査経由)
- 日付：2026-05-21
- 関連：`management/STRATEGY_BRIEF_IG_2026-05-21_CRAWLED_NOT_INDEXED.md` / `_metrics/2026-W21/indexing-error-list.json` / `management/ALERTS.md`

## サマリ

GSC 監査（moterist.com / app.vodnavi.jp / vodnavi.jp、moterist.com@gmail.com / u=2）の結果から **3 サイト同時に SEO 構造改善を実施**。本セッションで実装した範囲と、人間の意思決定が必要な残作業を集約する。

| プロパティ | 登録済 | 未登録 | 主な未登録要因 | 本セッションの対応 |
|---|---|---|---|---|
| `sc-domain:app.vodnavi.jp` | 100 | 208 | クロール済み-未登録 134 / 検出-未登録 73 | **コード修正で 3 因子を叩く** |
| `sc-domain:vodnavi.jp`（umbrella）| 126 | 235 | 上記 + WP 旧 URL 残骸 | **`/wp-*` `/archives/*` 等を 301** |
| `sc-domain:moterist.com` | データ処理中 | データ処理中 | — | **ピラー安定化前提のため改善方針書のみ** |

---

## 1. `app.vodnavi.jp`（Next.js / app-concierge）— 実装済

### A. サイトマップの大幅拡張
**修正**：`app-concierge/src/app/sitemap.ts`

- 旧：単一フロア (`videoa`) のみ、`hits=100` 1 回 → **約 197 URL**
- 新：FANZA 全 5 フロア（`videoa` / `videoc` / `anime` / `nikkatsu` / `videobook`）× 4 ページ（`hits=100`、`offset` 1-indexed）→ **最大 2000 works + 200 genres + utility**

具体的な変更：
- 各フロアで重複 cid を `Set` で除外
- `lastModified` は FANZA の `item.date` 由来（旧来の一律 `now` をやめる）
- `fetchItemList(..., { skipImageValidation: true })` で HEAD 検証を回避（sitemap 用途のためレスポンスは速さ優先）
- ページ取得時の `items.length < HITS_PER_REQUEST` で早期 break

期待効果：
- 「検出-インデックス未登録 (73)」のサイトマップ未掲載分が一掃される
- 「クロール済み-未登録」の URL も多くがサイトマップに収録されることで再評価対象になる

### C. 関連作品セクション + ジャンル付きパンくず
**修正**：`app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx`

- 新規ヘルパー `getRelatedWorks(floor, genreId, excludeId, limit=12)` — 第 1 ジャンルで `article=genre`、`sort=rank` 取得
- パンくずを `ホーム › 動画 › [ジャンル名] › [作品]` に拡張（旧 `ホーム › 動画` のみ）
- ページ下部に **「関連作品 12 件」セクション**（タイトル・価格・サムネ・詳細リンク、`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`）

期待効果（因子 C 解消）：
- 詳細ページが「行き止まり」でなくなる → Googlebot のクロール深掘り価値が上がる
- 内部リンク密度の向上で関連 URL 群が連鎖的に評価される
- パンくずの構造化（[Genre] 経由）でジャンルページの権威も底上げ

### B. 残作業（CCO 担当）
コードで自動投入できないコンテンツ部分は本ブリーフの **§5** に列挙。

---

## 2. `vodnavi.jp`（Next.js / site-brand）— 実装済

site-brand は単一ページのブランド LP。`sitemap.ts` も `robots.ts` も無く、GSC 経由でクロール最適化されていなかった。

### 追加
- `site-brand/src/app/sitemap.ts`（新規）— ルート 1 URL のみだが Google からの明示的なエントリポイントになる
- `site-brand/src/app/robots.ts`（新規）— `/api/`, `/_next/` のみ Disallow、`Sitemap:` ヘッダ付き

### 修正
`site-brand/next.config.ts` に `redirects()` 追加。GSC で残存していた WP 時代の旧 URL を全て 301 で `/` へ畳む：

- `/wp-admin/*` / `/wp-content/*` / `/wp-includes/*`
- `/archives/*` / `/category/*` / `/tag/*`
- `/sitemap.html` / `/post-sitemap.html` / `/page-sitemap.html` → `/sitemap.xml`
- `/wordpress-sango-review/*` / `/d-anime-store-only-title/*`

**意図的に保留**：`/?p=NNN` 形式のクエリパラメータ URL（5 件）は Next.js の `redirects()` で扱うと無限ループになる可能性があるため middleware で別途処理する必要あり。影響範囲が小さいので残作業。

---

## 3. `moterist.com`（WordPress THE THOR / site-moterist）— 改善方針書のみ

`site-moterist/01_structure/SITE_MAP.md:47` で明記された通り、**ピラー 5 記事の安定化が完了するまで `noindex` / canonical / 301 リダイレクトの変更は行わない方針**。本セッションでも live WP には触れない。

GSC `sc-domain:moterist.com` は監査時「データ処理中。1 日後にもう一度確認」状態。

### 安定化後にやるべきこと（次回のレビューで判断）

1. **THE THOR テーマ標準の XML サイトマップを GSC に登録**：moterist.com/sitemap.xml が登録されているか確認し、未登録なら GSC「サイトマップ」セクションで提出。
2. **ピラー 5 記事の noindex 状態を確認**：1095 / 1106 / 994 / 954 / 1018 すべてが `index, follow` であることを再監査。
3. **THE THOR の OGP / Twitter Card 出力を確認**：カスタマイザー設定で `og:image` が記事ごとに正しく出ているか。
4. **古い `?p=NNN` 形式 URL の 301**：パーマリンクが `/<slug>/` に変わった後の旧形式が残っていないかチェック。`.htaccess` でルール追加が必要なら mixhost SSH 経由で。
5. **Day 9 で発生した Ahrefs スクリプト混入の再発確認**：MU プラグインの `/wp-content/mu-plugins/` で観察するスクリプトに変化がないか定期チェック。

→ 上記は実施時期になったら別途 `STRATEGY_BRIEF_MOTERIST_*.md` を発行する。

---

## 4. 実装ファイル一覧（このセッション）

| ファイル | 変更内容 |
|---|---|
| `app-concierge/src/app/sitemap.ts` | 全 5 フロア × 4 ページ展開、`skipImageValidation: true`、重複排除 |
| `app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx` | `getRelatedWorks` ヘルパー追加、パンくずにジャンル追加、「関連作品」セクション追加 |
| `site-brand/src/app/sitemap.ts` | **新規** — vodnavi.jp の sitemap |
| `site-brand/src/app/robots.ts` | **新規** — vodnavi.jp の robots.txt |
| `site-brand/next.config.ts` | WP 旧 URL の 301 リダイレクト追加 |

両プロジェクトとも `npx tsc --noEmit` でエラーなしを確認済。

---

## 5. CCO 担当の Information Gain 強化（因子 B、未実装）

上記の構造修正だけでは「クロール済み-インデックス未登録」の主因（本文 600 字の極薄さ）は解消しない。コード側では受け皿だけ作っており、編集投入は CCO の作業。

具体的なタスクは `STRATEGY_BRIEF_IG_2026-05-21_CRAWLED_NOT_INDEXED.md` の **「因子 B 対策（CCO 担当）」** セクションを参照。先行 30 works + 20 genres を FANZA 売上上位から。

---

## 6. 検証ライン

- **デプロイ後即時**：`https://app.vodnavi.jp/sitemap.xml` の URL 数を再カウント。期待 800+（works）+ 100+（genres）+ utility。
- **デプロイ後即時**：`/works/videoa/h_113cb00123` のパンくずに「オナニー」（または第 1 ジャンル）が表示され、ページ下部に「関連作品」セクションがある。
- **デプロイ後即時**：`https://vodnavi.jp/sitemap.xml` および `/robots.txt` がそれぞれ 200 を返す。`/wp-admin/foo` が 308 で `/` にリダイレクト。
- **1 週後 (2026-05-28)**：GSC で各プロパティの未登録件数推移を再監査。改善幅から効果を測定。
- **Saturday レビュー**：CCO に Information Gain 投入の進捗を確認、moterist.com のピラー安定化判断を更新。

以上。
