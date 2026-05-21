# STRATEGY_BRIEF_IG_2026-05-21 — app.vodnavi.jp 大量「クロール済み-インデックス未登録」の Information Gain 強化指示

- 発行：CSO (Claude Opus 4.7 — 自動監査経由)
- 宛先：CCO (Content Chief Officer)
- 日付：2026-05-21
- ステータス：open / Saturday レビュー時の優先議題候補
- 関連: `_metrics/2026-W21/indexing-error-list.json` / `management/ALERTS.md`

> **CSO 追記 (2026-05-21 後刻)**：本ブリーフ発行直後、URL Inspection ライブツールで `/privacy`, `/works/videoa/h_113cb00123`, `/genres/1036` をスポット確認したところ、いずれも「URL は Google に登録されています」だった。GSC のカバレッジ集計レポートは 1〜2 日タイムラグがあり、152 件全てが今日時点で未登録とは限らない。**本ブリーフの優先度はやや下方修正**するが、IG 強化方針自体は app.vodnavi.jp の中長期 indexing 健全度に直接効くため、戦略は維持する。

## 観測事実 (What we saw)

Search Console (`sc-domain:vodnavi.jp`, account: moterist.com@gmail.com) 監査結果。

| 区分 | 件数 | 主な対象 |
| --- | --- | --- |
| インデックス登録済み | **126** | — |
| インデックス未登録 | **235** | — |
| ├ クロール済み - インデックス未登録 | **152** | app.vodnavi.jp/works/videoa/* と /genres/* が大半 |
| ├ 検出 - インデックス未登録 | **73** | app.vodnavi.jp/genres/* 多数（クロール待ち） |
| ├ noindex 除外 | 5 | vodnavi.jp/?s=... 検索結果ページ（正常） |
| ├ ソフト 404 | 3 | vodnavi.jp 旧カテゴリ・アーカイブ |
| ├ リダイレクト / 代替canonical | 各1 | http→https の正常リダイレクト |

## 技術的監査の結論 (Why it's not a tech bug)

サンプル 3 URL（`/works/videoa/h_113cb00123`, `/genres/1036`, `/privacy`）を生 HTML レベルで監査：

- `<link rel="canonical">` … **自己URLを正しく指す** ✓
- `<meta name="robots" content="index, follow">` ✓
- `<meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1">` ✓
- Ahrefs / Semrush / 不審な解析タグ … **未検出**（Day 9 の WP-CLI 注入再発なし）✓
- `robots.txt` … `Allow: /` で正常（`/api/`, `/_next/` のみ Disallow）✓
- HTML は Next.js SSR 出力、botに正しく配信されている ✓

**つまり Google は「クロールして HTML を見た上で、インデックスに値しない」と判断している**。原因は技術ではなくコンテンツ側にある。

## 確定原因 (Root Cause — 2026-05-21 深掘り監査の結果)

**3 つの要因が複合して「クロール済み-未登録」を作り出している**。順に重い順：

### 因子 A：サイトマップ未掲載（構造的）
- `sitemap.xml` の URL 数：**197 件のみ**（works=88 / genres=100 / utility=9）
- 「クロール済み-未登録」サンプル 8 件の works URL を確認 → **8/8 すべてサイトマップ未掲載**
- genres も 5/8 が未掲載
- 一方「検出-未登録」のサンプル 10 件は 9/10 がサイトマップ掲載済（クロール待ち）
- → **Google は内部リンクから 154+ 件の URL を発見しているが、サイトマップに無いため低優先度として扱われている**。

### 因子 B：ページの可読本文が極端に薄い（品質的）
PowerShell でレンダリング後の可読テキストを計測（Googlebot UA、Next.js SSR）：

| URL | 可読テキスト長 |
|---|---|
| `/works/videoa/h_113cb00123` | **629 字** |
| `/works/videoa/mght00384` | **646 字** |
| `/works/videoa/vrkm01843` | **605 字** |
| `/genres/1036` | 2,985 字 (FANZA 作品 30 件のラベル繰り返しが大半) |
| `/genres/1032` | 2,790 字 (同上) |

works ページの 600 字のうち **9 割はサイトナビ・パンくず・FANZA 由来のメタ羅列（タイトル / 出演者 / ジャンル / 価格 / CTA）**。VODNAVI 固有の論評・差別化情報は実質ゼロ。Google から見れば DMM.co.jp 本家との情報乖離が無く、indexing する動機が無い。

### 因子 C：作品ページが「行き止まり」になっている（内部リンク的）
- `/genres/1036` (ハブ) → works 詳細への発リンク **30 本**（適切）
- `/works/videoa/h_113cb00123` (詳細) → 他 works への発リンク **0 本** / genres への発リンク **5 本**
- 詳細ページから他作品へ流れる導線が無く、Googlebot にとって深掘り価値の薄い「葉ノード」。関連作品・類似作品セクションが欠如している。

### 補足：GSC レポートが時間差で揺れる現象
- スポット 3 URL を URL Inspection ライブで確認 → すべて「登録済み」
- ボーダーライン品質のページは indexed と not-indexed の間を行き来する。これ自体が「品質が閾値ギリギリ」のサイン。安定化させるには A〜C すべての改善が必要。

## 改善アクション（因子別）

### 因子 A 対策（CTO 担当 — 構造修正）
1. **サイトマップを動的拡張**：内部リンクで実在する works/genres URL を全て sitemap.xml に含める。現状 88+100=188 件 → 推定 800+ 件規模が必要。
2. **`<lastmod>` を正確に**：FANZA 側の作品データ更新日を反映。古いダミー日付（`2026-05-21T14:09:17Z`）の一律使用を停止。
3. **サイトマップ・インデックス導入**：規模が増えた場合、`sitemap-works.xml` / `sitemap-genres.xml` に分割しサイトマップインデックス経由で提出。

### 因子 B 対策（CCO 担当 — Information Gain 強化）
4. **`/works/videoa/*` に編集本文を追加**：FANZA 本家にない情報を 200〜400 字で各作品に上乗せ。
   - 「この作品の見どころ 3 点」
   - 「どんな夜・気分に合うか」
   - 「類似作との違い」
   - 「VODNAVI 編集部からの一言」
5. **`/genres/{id}` 冒頭に編集論評**：「このジャンルの何が他と違うか」「VODNAVI が推す現役オススメ 3 本」を 300〜500 字で書き下ろし。**最低 20 ジャンル先行**。
6. **優先順位**：FANZA 売上ランク上位から投入し、クロール予算を浪費しない。最低 30 件先行で A/B 検証。

### 因子 C 対策（CTO 担当 — 内部リンク強化）
7. **作品詳細ページに「関連作品」セクション**：同ジャンル・同シリーズ・同出演者の他作品 10〜15 件を発リンク。FANZA API/DB からプログラム的に取得。
8. **作品詳細から「次の作品 / 前の作品」ナビ**：ジャンル単位での連続閲覧導線を作る。
9. **パンくず階層の充実**：現状「ホーム › 動画」のみ。ジャンル経由のパンくずを実装（例：ホーム › 動画 › オナニー › 尻穴ロシアンズ...）。

### 周辺対策
10. **`/privacy` 等の utility ページに URL Inspection から「インデックス登録をリクエスト」**：Claude Code が必要に応じて自動実行（ただし 1 週後再監査で本当に未登録のものに限定）。
11. **WordPress 側の旧 ID URL（`/?p=52,54,96,99,104`）の処理**：CTO が 301 リダイレクト健全性を確認。効いていない場合は `.htaccess`/nginx ルール追加。

## KPI（次回レビュー時の指標）

- 「クロール済み - インデックス未登録」件数：152 → **50 以下**（4 週間以内）
- インデックス登録済みページ数：126 → **220 以上**（4 週間以内）
- `/works/videoa/*` のうち Information Gain 段落を持つページ：0 → **80 件以上**（2 週間以内）

## 検証ライン

- 1 週後：Information Gain 段落を入れた 30 件のうち、何件が indexed になったかを GSC で再監査。
- 2 週後：URL Inspection で個別チェック（Claude Code が自動）。
- 4 週後：本ブリーフの完了判定 + 次フェーズ判断。

以上。
