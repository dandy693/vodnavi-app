# vodnavi.jp 被リンク監査・404 救済レポート

- 調査日時: 2026-06-01 22:23 JST
- 調査ツール: Ahrefs (Motelab's workspace, projectId 8431320, AWT Free tier) + 直接 HTTP probe (curl HEAD)
- スコープ: `target=vodnavi.jp / mode=subdomains / grouping=all / limit=100 / sort=Traffic desc`
- 物理証跡: Chrome 自動化での DOM 抽出（100 行）+ 全 unique target URL を curl -I で実 HTTP コード検証

---

## 0. エグゼクティブサマリー

| 指標 | 値 |
|---|---|
| 取得 backlink 行数 | 100 |
| 取得 unique target URL 数 | 6（query-string 派生含む） |
| **物理確認された 404 target URL** | **3** |
| Ahrefs UI が status コードを正しく示した 404 行数 | **0**（Free tier の制約） |
| 顕著な SPAM ネットワーク行数（推定） | ~60+ / 100（後述） |

**重要な発見1**: Ahrefs Free (AWT) では「リンク切れの被リンク」専用レポートは paywall（`プロジェクトをブーストして…`）。`/backlinks` 通常レポートの target HTTP code 列でも、本データセットでは 4xx を 1 件も表示せず、**直接 curl probe ではじめて 3 つの 404 が判明**。Ahrefs UI のみに依存した監査は不完全。

**重要な発見2**: 「404 救済」よりも喫緊なのは、DR 33-55 帯に均一に量産された **SEOExpress 系 PBN による spam backlink farm 攻撃**。Disavow 対象として優先度が高い。

---

## 1. 物理確認された 404 target URL と被リンク資産

curl HEAD で実 HTTP コードを確認した結果。Ahrefs 上の status 表示と現実は乖離。

| # | リンク先 URL (vodnavi.jp/*) | 実 HTTP | リンク元 URL | DR | アンカーテキスト | 初回確認 | 最後に見た |
|---|---|---|---|---|---|---|---|
| 1 | `https://vodnavi.jp/u-next-second-free-trial/` | **404** | `https://www.leawo.org/jp/tips/動画配信サービス-おすすめ-1352.html` | **66** | `U-NEXTの無料トライアルに2回目3回目の再登録をする方法>>>` | 2023-11-21 | 2026-04-07 |
| 2 | `https://vodnavi.jp/u-next-second-free-trial/` | **404** | `https://www.videoconverterfactory.com/jp/tips/record-unext-video.html` | **62** | `合わせて読みたい： U-NEXTの無料トライアルに2回目3回目の再登録をする方法` | 2023-11-02 | 2026-04-22 |
| 3 | `https://vodnavi.jp/u-next-second-free-trial/u-next-free-trial` | **404** | (上記から内部 301 で辿り着く2段目) | — | (内部リダイレクト先) | — | — |
| 4 | `https://vodnavi.jp/wordpress-sango-review/` | **404** | `https://saruwakakun.design/sango-voice/` | **73** | `ぶいなび | VODの楽しみ方をナビゲートするブログ` | 2023-08-28 | 7 日前 |

**生きている target URL**（参考、curl 200/200-via-301）:

| URL | 実 HTTP |
|---|---|
| `https://vodnavi.jp/` | 200 |
| `http://vodnavi.jp/` | 200（→ https 301） |
| `https://app.vodnavi.jp/concierge?source=moterist` | 200 |

---

## 2. 失う link equity の構造

死にページごとに失っている被リンクの DR と文脈：

### 2-1. `/u-next-second-free-trial/`（U-NEXT 2 回目以降の無料トライアル攻略記事）
- **DR 66** leawo.org/jp/tips: 動画配信サービス徹底比較記事から「合わせて読みたい」アンカー
- **DR 62** videoconverterfactory.com/jp/tips: U-NEXT 録画ハウツー記事から「合わせて読みたい」アンカー
- どちらも「u-next 無料トライアル」「u-next 再登録」関連の意図高いトラフィック源
- 初回確認 2023 年 11 月 → 直近 2026 年 4 月まで両ドメインで継続観測

### 2-2. `/wordpress-sango-review/`（WordPress テーマ SANGO レビュー記事）
- **DR 73** saruwakakun.design/sango-voice/: SANGO 公式の「ユーザーさんの声」ページ
- 単一だが本監査で**最高 DR の生きた被リンク**。SANGO ユーザー導線を失っている
- 初回確認 2023-08-28 → 「7 日前」まで継続観測 = **SANGO 公式は今もこのリンクを掲示し続けている**

---

## 3. SPAM backlink farm の検出（404 と並ぶ最重要所見）

Top 100 中 約 60+ 行が以下 4 系統の自動生成 spam に分類される。disavow 候補。

### 3-1. SEOExpress.org PBN（~40 行）
- パターン: `*.shop` / `*.store` / `*.website` の使い捨てドメインから
- 統一タイトル: `I Remember Struggling to Gain Organic Traffic and Wasting Time on Expensive Agencies Until I Discovered SEOExpress...`
- 統一アンカー: `Back when I first launched vodnavi.jp, I struggled with no visibility on search...`
- DR 33-35 に**均一に偽装**された大量ノード
- 主要参照元（例）: `seoexpress.website`, `theseohighranking.shop`, `theguestposts.shop`, `thebacklinks.shop`, `pbnseolinks.shop`, `premiumseolinks.shop`, `lixil-reformshop.shop`, `shopbetreiber-blog.shop`, `highseo.shop`, `seoexpress-*.store` 多数

### 3-2. 露西亜・チェコ系 aged-domain マーケット PBN（~10 行）
- 統一タイトル: `Where to buy 🚀 aged domains and backlinks 🔥 | 8912-3032`（または 7462-0829）
- 統一アンカー: `vodnatym.cz vodnatyma.cz vodnavi.jp vodnavi.net vodnaya-akademia.ru` （vodnavi.jp と類似 TLD を抱合せ）
- DR 0.2-32 と幅広いが共通テンプレ
- 主要参照元: `read.org.in`, `domain.com.lc`, `websiterace.com`, `getwebsiteworth.com`, `indexaward.com`, `alljobs.info`, `marathiladies.com`, `sporstcenter.com`, `indians.cc`

### 3-3. "Website Stats / Domain Report" 系（~7 行）
- 統一タイトル: `✅ Website Stats 📊` / `❤️ URL Shared ❤️` / `👲 Domain Report 👲`
- 統一アンカー: `their explanation vodnavi.jp &nbsp` （Word-press 風の難読化）
- DR 9-55、`/stats/34784`, `/share/34784`, `/report/34784` の 5 桁 ID パターン
- 主要参照元: `optimizeflow.top`, `metamagic.top`, `quero.party`, `sites.bounceme.net`, `sites.jake.eu`, `www.ready.pro`

### 3-4. その他 manual outreach 自称 PBN（~5 行）
- `rank-optimizer.website`, `rankongoogle.agency`, `linkrankpro.shop` 等から「Professional link placements for vodnavi.jp」「whitehat traffic vodnavi.jp Google ranking upto 10x」等の宣伝アンカーで貼られた spam

---

## 4. 健全な被リンク（保護対象）

| 参照元 | DR | リンク先 (vodnavi.jp/*) | アンカー |
|---|---|---|---|
| saruwakakun.design (SANGO 公式) | 73 | /wordpress-sango-review/ **(404)** | ぶいなび | VODの… |
| leawo.org (Leawo 公式 jp/tips) | 66 | /u-next-second-free-trial/ **(404)** | U-NEXTの無料トライアル… |
| videoconverterfactory.com (jp/tips) | 62 | /u-next-second-free-trial/ **(404)** | 合わせて読みたい： U-NEXT… |
| espritjapon.com (スカパー紹介サイト) | 43 | / (root, alive) | ぶいなび は、動画配信サービスの魅力やおトクな使い方… |
| takker04035555.com/profile | 25 | / (root, alive) | ぶいなび |

---

## 5. 経営戦略的考察（CSO へのフィードバック）

### 5-1. コンテンツサルベージ案
- [ ] **`/u-next-second-free-trial/` の復元**: 2023 年以前に DR 66 (leawo) / DR 62 (videoconverterfactory) から 2 年以上引き続き貼られている。**「u-next 無料トライアル 2 回目 / 再登録」関連は依然として商業的に強い検索意図**。記事を以下のいずれかで救済:
  - (a) 「ビブリア・エロティカ」世界観でサニタイズして app.vodnavi.jp 配下に移植 →  HTTP 301 で `app.vodnavi.jp/concierge?source=ext&intent=u_next_retry` 等にリダイレクト
  - (b) WordPress 側 (vodnavi.jp) で記事を最低限再構築し、最終段で `app.vodnavi.jp/concierge` への CTA 設置
- [ ] **`/wordpress-sango-review/` の復元**: SANGO 公式 (DR 73) は**今も生きた本サイトとして掲示している**点が重要。SANGO レビュー文脈は世界観と不整合だが、URL 自体は救済価値が極めて高い。最小選択肢:
  - (c) `vodnavi.jp/wordpress-sango-review/` に「このブログは SANGO で運用されていました」程度の極小ページを置き 200 を返す → SANGO 公式からの link juice を保持
  - (d) 301 で `/` トップへ流す（second best）
  - (e) 410 Gone で破棄 → **DR 73 を捨てる事になる、非推奨**

### 5-2. SPAM disavow 案（404 救済より先に着手すべき可能性）
- 3-1〜3-4 のパターンドメインを GSC の disavow.txt に投入。`*.shop` / `*.store` / `*.website` 系 SEO PBN は 40+ ドメイン、CZ/RU aged-domain 系は 10+ ドメインで、放置すると ranking 毒性が累積する
- ただし、`*.shop` 系で偽装 DR 33-35 が定着している現状を見ると、すでに SPAM index は確立されている。Google が自動 ignore する可能性も高く、disavow 優先度は要議論

### 5-3. アンチパターン警告
- `/u-next-second-free-trial/u-next-free-trial` （内部リダイレクト先）も 404 なので、復元時はディレクトリ全体を意識する必要あり
- moterist.com → app.vodnavi.jp/concierge の 30+ 行は自社の意図的内部リンクなので「外部 backlink」として扱わない

---

## 6. 監査の方法論的注釈と次のアクション

### 監査の限界
- AWT Free tier では「リンク切れの被リンク」専用レポートが paywall。`/backlinks` の HTTP status 列も 4xx を可視化しない（本データセットで Ahrefs は 100 行中 4xx を 0 件と申告、現実は curl で 3 件）
- 取得 100 行は `sort=Traffic desc` のもの。Traffic 0 帯にさらに数百〜数千の backlink が存在する可能性大（要追加 paging）

### 推奨される次のステップ
- [ ] **CSO 起票**: 本レポートをもとに `STRATEGY_BRIEF_002_SALVAGE.md` 起票
- [ ] **GSC「ページ → 未登録 → 見つかりませんでした (404)」レポート横並び照合**: Google が認識している全 404 を取得し、本監査の 3 件 + α を網羅
- [ ] **paging 追加監査**: `offset=100, 200, 300...` で全 backlink を網羅し、別の 404 target を発掘
- [ ] **`/backlinks?history=lost` ビュー監査**: 失われた被リンクの中に過去 404 起因のものがある可能性
