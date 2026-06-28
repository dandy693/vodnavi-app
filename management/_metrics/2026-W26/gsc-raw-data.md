---
audit_date: "2026-06-28"
brief: "STRATEGY_BRIEF_079_GSC_AUDIT.md (元 CSO script の 040 は衝突採番のため 079 に補正)"
dimension: "Performance（クエリ × 着地URL × CTR × 掲載順位）"
complements: "management/_metrics/2026-06-22-gsc-audit-report.md（カバレッジ/sitemap/index 次元）"
mechanism: "claude-in-chrome MCP 拡張による実ブラウザ目視（Puppeteer/Playwright/headless ではない）"
account: "moterist.com@gmail.com（authuser=2 / 「モテリスト 様」をアカウントポップアップで物理確認。default は hdktchkw33@gmail.com のため trap 回避）"
range: "過去3か月（GSC『3 か月』プリセット）、最終更新: 監査時点で 4 時間前"
status: "audited"
placeholders: "none（全数値は GSC UI 実描画の生値）"
---

# GSC 物理ファクト監査 — Performance 次元（2026-W26）

> 監査手段は claude-in-chrome MCP 拡張による実ブラウザ操作（既ログインセッション）。
> アカウントは Google アカウントポップアップで **moterist.com@gmail.com（モテリスト 様）** を
> 目視確認済み。数値は GSC UI の実描画生値のみ。推測・プレースホルダはゼロ。

## 0. プロパティ構成（前提の更新）
プロパティセレクタ実測で、当アカウント（authuser=2）には以下が登録されている:

| グループ | プロパティ | 種別 |
|---|---|---|
| KIT-PLANNING.NET | https://kit-planning.net/ | URL プレフィックス |
| MOTELAB.XYZ | motelab.xyz / https://motelab.xyz/ / https://www.motelab.xyz/ | ドメイン + URL×2 |
| MOTERIST.COM | moterist.com | ドメイン |
| VODNAVI.JP | **app.vodnavi.jp** | ドメイン |
| VODNAVI.JP | **vodnavi.jp** | ドメイン |

- **更新点（2026-06-22 報告の精緻化）**: 前回監査は「ドメインプロパティ `sc-domain:vodnavi.jp`
  1 本のみ」と記載したが、実際は **`app.vodnavi.jp` 専用のドメインプロパティも別途存在**する。
  本監査の数値は `sc-domain:vodnavi.jp`（全サブドメイン集約・app 含む）から取得。app 単独で
  切り分けたい場合は `app.vodnavi.jp` プロパティを別途参照可能。

## 1. sc-domain:vodnavi.jp — 過去3か月サマリ
| 指標 | 実測値 |
|---|---|
| 合計クリック数 | **5,340** |
| 合計表示回数 | **136,000（13.6万）** |
| 平均CTR | **3.9%** |
| 平均掲載順位 | **9.1** |

## 2. クリック上位10クエリ（sc-domain:vodnavi.jp）
全クエリ総数の表示上限は 1,000。クリック降順 上位10件:

| # | クエリ | クリック | 表示 | 種別 |
|---|---|---|---|---|
| 1 | オフパコ枕営業している巨乳コスプレイヤーに媚薬を仕込んで…潮射ま○こにキメセク中出し鬼ピストンした。 九井スナオ | 161 | 1,278 | 作品タイトル＋女優名 |
| 2 | アニメ版「入り浸りギャルにま〇〇使わせて貰う話#3・#4」 | 83 | 1,172 | 作品タイトル（アニメ） |
| 3 | 制服マ○コ拡張少女 鳥羽みもり | 70 | 1,038 | 作品タイトル＋女優名 |
| 4 | あの河北彩伽とお泊まりデートで痴女られたら1日20発は余裕だよね？ | 39 | 563 | 作品タイトル＋女優名 |
| 5 | 超放尿1266分】…935連発 総尿量241,045mlの大放出！ | 36 | 342 | 作品タイトル |
| 6 | 働く女の変態セックス 真緒26歳 桜木真緒 | 35 | 990 | 作品タイトル＋女優名 |
| 7 | 【超放尿1266分】…935連発 総尿量241,045mlの大放出！ | 35 | 375 | 作品タイトル（#5 の括弧違い重複） |
| 8 | 七沢みあ10タイトル！大放出！12時間 best | 33 | 1,257 | 作品タイトル＋女優名 |
| 9 | お仕置き客室乗務員 浣腸プライド破壊アナル侵犯 月待青花 | 23 | 518 | 作品タイトル＋女優名 |
| 10 | 部活後の蒸れた汗だくユニフォーム越しに密着…陸上部のエース 逢沢みゆ | 22 | 490 | 作品タイトル＋女優名 |

- **10/10 が作品タイトル直撃（品番ナビ）クエリ**。うち 8 件は末尾に女優名を内包
  （九井スナオ・鳥羽みもり・河北彩伽・桜木真緒・七沢みあ・月待青花・逢沢みゆ）。
- **女優名“単体”・ジャンル名・比較/情報系（“おすすめ”“見放題”“どこで見れる”等）は上位10に皆無**。

## 3. クリック上位10着地URL（sc-domain:vodnavi.jp）
全ページ総数の表示上限は 1,000。クリック降順 上位10件:

| # | 着地URL | クリック | 表示 | フロア |
|---|---|---|---|---|
| 1 | https://app.vodnavi.jp/works/videoa/gqhb00024 | 119 | 1,290 | videoa |
| 2 | https://app.vodnavi.jp/works/videoa/gkok00002 | 101 | 1,382 | videoa |
| 3 | https://app.vodnavi.jp/works/videoa/snos00233 | 70 | 1,020 | videoa |
| 4 | https://app.vodnavi.jp/works/videoa/sivr00490 | 63 | 635 | videoa |
| 5 | https://app.vodnavi.jp/works/videoa/mizd00341 | 59 | 1,835 | videoa |
| 6 | https://app.vodnavi.jp/works/anime/h_1261amcp00247 | 47 | 208 | anime |
| 7 | https://app.vodnavi.jp/works/videoa/savr00978 | 43 | 934 | videoa |
| 8 | https://app.vodnavi.jp/works/videoa/cmf00095 | 42 | 904 | videoa |
| 9–10 | （同パターン /works/* 継続。1〜10/1000 表示） | — | — | videoa |

- **上位は 100% `/works/{floor}/{content_id}` 作品詳細ページ**。フロアは videoa が大宗、anime 1 件。
- **女優ハブ `/actresses/*`・ジャンルハブ `/genres/*`・clean 記事層は上位着地に皆無＝オーガニック流入≈0**。
- 元 script が例示した品番 `gkok00002` は実際に着地URL #2（101 クリック）として実在を確認。

## 4. 品番直撃 vs その他 の比率判定
- **クエリ次元**: 上位10クエリは作品タイトル/品番ナビ = **10/10（100%）**。情報・比較・女優単体・
  ジャンル系は上位ゼロ。2026-06-10 メモ「検索意図≈95% 作品タイトル/品番」（[[project_gsc_search_intent_title_dominant]]）
  を Performance 実データで再確証。
- **着地URL次元**: 上位10着地は作品詳細 `/works/*` = **10/10（100%）**、うち videoa フロアが大宗。
- **構造的含意**: vodnavi のオーガニックエンジンは「品番/タイトルで検索 → 作品詳細へ着地」の
  ナビゲーショナル一択。記事層・ハブ層は検索流入に寄与していない。

## 5. moterist.com — 過去3か月サマリ（副対象・存在確認のうえ実測）
moterist.com はドメインプロパティとして実在したため数値を物理取得:

| 指標 | 実測値 |
|---|---|
| 合計クリック数 | **0** |
| 合計表示回数 | **3** |
| 平均CTR | **0%** |
| 平均掲載順位 | 12 |

- **オーガニック検索クリック 3か月で 0 件**。[[project_moterist_zero_search_inflow]] を物理再確証。
- 元 CSO script の「moterist をトラフィック源として監査」する前提は、データ自体により棄却。
  moterist は送客資産として機能していない。

## 6. 戦略含意（月商100万円・逆算メモ）
1. **収益はすべて作品詳細ページの品番ナビ流入に依存**。CVR 改善・金CTA最適化は
   `/works/*` 詳細ページが最大レバレッジ点（既存 [[project_ga4_user_behavior_baseline]] と整合）。
2. **女優ハブ／ジャンルハブ／clean 記事層はオーガニック検索でほぼ無風**。
   柱①女優ハブ（[[project_actress_hub_first_measurement]]）と clean 記事（[[project_vodnavi_clean_deploy_gap]]
   = 本番未 deploy で 404）は、検索流入の立ち上げ前段階。内部リンクが唯一の送客路。
3. **未捕捉の情報・比較・女優単体クエリ＝純粋なコンテンツ機会**（記事/ハブの information-gain）。
   ただし新規記事の検索インデックス確立には時間がかかる前提。
4. **moterist 集客を前提にした戦略仮説は無効**。送客導線は moterist ではなく内部リンク/SNS で設計すべき。
