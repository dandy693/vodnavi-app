# ahrefs Site Audit エラー8件の調査【CSO指示・読み取り専用】

- 取得実施: **2026-08-02 06:15:10 〜 06:30:37 JST**(PowerShell 実測)
- 実施操作: **閲覧のみ**。**再クロール(New crawl / Start)は一度も押していない**。設定変更・プロジェクト削除も行っていない
- 取得元: Chrome連携 / `app.ahrefs.com`(Motelab's workspace・ベーシック=AWT Free)
- **classifier 遮断の発生と対応(報告事項)**: Data explorer 画面で JavaScript ツール経由の表データ抽出が **3回連続で `[BLOCKED: Cookie/query string data]`** となった(当該画面の URL に長いクエリ文字列が含まれるため)。**難読化・プロキシ等の迂回は一切行わず**、CSO が第一手段に指定した **Chrome の画面読み取り(スクリーンショット)** に切り替えて取得した
- 判断・評価・提案は書かない(事実の転記のみ)。Phase 1 で停止

---

## 0. 前提の確認

### 0-1. エラー8件が表示されている画面 → **(a) Site Audit(サイト監査)**

Site Audit のプロジェクト一覧の列 **「Internal URLs having errors」** の値。

### 0-2. 対象プロジェクト → **Vodnavi**(project id `8431320`)

Site Audit に登録された4プロジェクトの当該列（全件転記）:

| プロジェクト | 表示ドメイン | Last crawl | ステータス | Health score | URLs crawled | **Internal URLs having errors** | Scheduled |
|---|---|---|---|---|---|---|---|
| Moterist | moterist.com/ | 7月28日 01:38 午後 | Completed | 100% | 98 | **3** | 8月4日, 1—2 午後 |
| Kit-planning | kit-planning.net/ | 7月28日 03:43 午後 | Completed | 100% | 494 | **4**（▼1） | 8月4日, 3—4 午後 |
| Motelab | motelab.xyz/ | 7月28日 04:26 午後 | Completed | 96% | 147 | **11**（▲1） | 8月4日, 4—5 午後 |
| **Vodnavi** | **vodnavi.jp/** | **昨日 04:20 午後** | Completed | **98%** | **506** | **8** | **今日, 4—5 午後** |

→ **「エラー8件」= Vodnavi プロジェクト**。他3プロジェクトの数値（3 / 4 / 11）とは別物

### 0-3. Vodnavi プロジェクトの実クロール範囲（Structure explorer・HTTPステータス実数表）

| ホスト | Total URLs | 2xx | 3xx | **4xx** | **5xx** | xxx | Timeout |
|---|---|---|---|---|---|---|---|
| **app.vodnavi.jp** | **489** | 489 | 0 | **0** | **0** | 0 | 0 |
| **www.vodnavi.jp** | **17** | 16 | 1 | **0** | **0** | 0 | 0 |
| **vodnavi.jp**（apex） | **3** | 0 | **3** | **0** | **0** | 0 | 0 |
| **計** | **509** | 505 | 4 | **0** | **0** | 0 | 0 |

- プロジェクトは **`*.vodnavi.jp` の3ホストすべてを1つのプロジェクトとしてクロール**している（一覧の表示は `vodnavi.jp/` だが実体はサブドメイン込み）
- **4xx / 5xx は3ホストとも 0件**
- **警告バナー（原文）**: 「**The website may not be fully crawled** — The crawl has reached the maximum number of internal pages, and the website may not be crawled completely. To crawl more pages of your site, increase the "Max number of internal pages" in the project settings and start a new crawl.」= **クロール上限に到達しており、サイト全体は網羅されていない**

---

## 1. エラー8件の内訳【最優先】

### 1-1. 検査項目

Importance フィルタでの区分（原文）:

| 区分 | 項目数 |
|---|---|
| **エラー** | **1** |
| Warning | 9 |
| Notice | 12 |
| 計（Actual） | 22 |

**エラー区分に該当する検査項目は 1種類のみ**:

| 検査項目名（原文） | カテゴリ | 該当URL数 | 変更 | 追加 | New | 解除 | Missing |
|---|---|---|---|---|---|---|---|
| **`Orphan page (has no incoming internal links)`** | Links / **INDEXABLE** | **8** | 0 | 0 | 0 | 0 | 0 |

- エラー区分の追跡対象項目数（All tracked）= **52**、うち Actual = **1**
- **`5XX` / `4XX page` / `Broken redirect` / `Canonical points to redirect` などの項目は 0件（Actual に現れていない）**

### 1-2. 該当URL 全8件（Showing 8 of 8）

全件が **www.vodnavi.jp**（vodnavi.jp ブランド側）の記事ページ。

| # | PR | URL | HTTPステータス | コンテンツタイプ | オーガニックトラフィック |
|---|---|---|---|---|---|
| 1 | 20 | `https://www.vodnavi.jp/philosophy-of-cinema` | **200** | text/html; charset=utf-8 | 0 |
| 2 | 20 | `https://www.vodnavi.jp/storytelling-structure` | **200** | text/html; charset=utf-8 | 0 |
| 3 | 20 | `https://www.vodnavi.jp/compare` | **200** | text/html; charset=utf-8 | 0 |
| 4 | 20 | `https://www.vodnavi.jp/u-next-second-free-trial` | **200** | text/html; charset=utf-8 | 0 |
| 5 | 20 | `https://www.vodnavi.jp/vod-selection-guide` | **200** | text/html; charset=utf-8 | 0 |
| 6 | 20 | `https://www.vodnavi.jp/biblia-literature-eroticism` | **200** | text/html; charset=utf-8 | 0 |
| 7 | 20 | `https://www.vodnavi.jp/biblia-erotica-foundation` | **200** | text/html; charset=utf-8 | 0 |
| 8 | 20 | `https://www.vodnavi.jp/wordpress-sango-review` | **200** | text/html; charset=utf-8 | 0 |

### 1-3. 各URLの検出元とsitemap由来

**8件すべてで同一の値**:

| 項目 | 値（全8件共通） |
|---|---|
| **No. of href inlinks**（内部リンク元） | **0** |
| No. of redirect inlinks | **0** |
| No. of canonical inlinks | **0** |
| No. of hreflang inlinks | **0** |
| No. of pagination inlinks | **0** |
| **Referenced in sitemaps** | **`https://www.vodnavi.jp/sitemap.xml`** |

- **検出元（どのページからリンクされているか）= 内部リンク元は0件**。これが「Orphan page」該当の理由そのもの
- **sitemap 由来か否か = 8件すべて sitemap 由来**（`https://www.vodnavi.jp/sitemap.xml` に収録されていることでクロールされている）

### 1-4. sitemap 収録11URLとの対照（機械的差分）

`https://www.vodnavi.jp/sitemap.xml` の収録は11URL。うち **8件がエラー該当**、**3件が非該当**:

| 非該当の3URL | 状態 |
|---|---|
| `https://www.vodnavi.jp/`（トップ） | 内部リンク元あり（エラー非該当） |
| `https://www.vodnavi.jp/cinematic-chiaroscuro` | 内部リンク元あり（エラー非該当） |
| `https://www.vodnavi.jp/solitude-catharsis` | 内部リンク元あり（エラー非該当） |

---

## 2. 既知事象との照合（事実の転記のみ）

| 台帳の既知事象 | ahrefs Site Audit（Vodnavi・2026-08-01 クロール）の実測 | 照合結果 |
|---|---|---|
| **404 = 787件**（/works/videoc/ 残骸・sitemap非由来・R4で保留） | **4xx = 0件**（3ホストとも）。app.vodnavi.jp のクロール到達は **489 URL** で、**クロール上限に到達**しており全域を網羅していない | **重複しない**（検出されていない） |
| **robots による除外 648件**（意図的） | Vodnavi の「ブロック」= **0**（Dashboard 表示） | **重複しない** |
| **代替canonical 1,829件**（正常な集約と判定済み） | エラー区分に canonical 系項目は **0件**。`Canonical points to redirect` 等も Actual に現れていない | **重複しない** |
| **noindex 1件** | `Noindex page` = **3**（Warning）/ `Noindex follow page` = **3**（Notice）。**いずれもエラー区分ではない** | **数値不一致・区分も相違** |
| **vodnavi.jp / motelab.xyz の www リダイレクト（Q5関連）** | **vodnavi.jp（apex）3URL がすべて 3xx**、www.vodnavi.jp 17URL のうち 1件が 3xx。エラー区分ではなく Warning（`3XX redirect` 4件）/ Notice（`HTTP to HTTPS redirect` 2件・`リダイレクトチェーン` 1件） | **既知事象と一致**（ただしエラー8件とは別項目） |

**→ エラー8件（Orphan page）は、上記5つの既知事象のいずれとも重複しない。**

---

## 3. Warnings / Notices の件数（参考）

| 区分 | 項目数 |
|---|---|
| エラー | 1 |
| **Warning** | **9** |
| **Notice** | **12** |
| Actual 合計 | 22 |
| All tracked | 173 |
| New | 0 |
| Turned off | 0 |

### Warning 上位5項目（該当URL数の降順）

| # | 項目名（原文） | 該当URL数 | 変更 |
|---|---|---|---|
| 1 | `Open Graph tags incomplete` | **183** | ▲2 |
| 2 | `Slow page` | **152** | ▲21 |
| 3 | `Meta description too short`（INDEXABLE） | **53** | ▲2 |
| 4 | `Low word count`（INDEXABLE） | **9** | 0 |
| 5 | `3XX redirect` | **4** | 0 |

（残り4項目: `Open Graph URL not matching canonical` 4 / `Noindex page` 3 / `Page has no outgoing links` 2 / `Title too short` 2）

### Notice 上位5項目（該当URL数の降順）

| # | 項目名（原文） | 該当URL数 | 変更 |
|---|---|---|---|
| 1 | `Indexable page not in sitemap` | **475** | ▲5 |
| 2 | `Pages to submit to IndexNow` | **369** | ▼37 |
| 3 | `Structured data has schema.org validation error` | **215** | ▲17 |
| 4 | `Page has only one dofollow incoming internal link`（INDEXABLE） | **140** | ▲32 |
| 5 | `Meta description too short`（NOT INDEXABLE） | **16** | ▼4 |

（残り7項目: `Meta description changed` 11 / `Page has only one dofollow incoming internal link`(NOT INDEXABLE) 9 / `Noindex follow page` 3 / `HTTP to HTTPS redirect` 2 / `Low word count`(NOT INDEXABLE) 2 / `リダイレクトチェーン` 1 / `Page and SERP titles do not match` 1）

---

## 4. クロール日時

| 項目 | 値 |
|---|---|
| **最終クロール** | **2026-08-01 16:20:45 JST**（URLパラメータ `current=01-08-2026T162045P0900` で秒まで確認。一覧表示は「昨日 04:20 午後」） |
| ステータス | **Completed** |
| **次回スケジュール** | **2026-08-02（今日）16—17時** |
| **クロール頻度** | **日次**（クロール履歴が毎日1件） |
| 常時監査（Continuous audit） | 「Start」ボタン表示＝**未実行**。プラン表記は「ベーシック」 |
| 網羅性 | **クロール上限に到達**（§0-3 の警告バナー原文） |

### クロール履歴（日付ドロップダウン・原文転記）

| 日付 | ステータス |
|---|---|
| 昨日（2026-08-01） | **Completed** |
| 7月31日 | Completed |
| 7月30日 | Completed |
| 7月29日 | Completed |
| 7月28日 | Completed |
| 7月27日 | Completed |
| **7月26日** | **Completed** |
| **7月25日** | **Failed** |
| **7月24日** | **Failed** |
| **7月23日** | **Failed** |
| **7月22日** | **Failed** |
| **7月21日** | **Failed** |
| **7月20日** | **Failed** |
| **7月19日** | **Failed** |
| **7月18日** | **Failed** |
| **7月17日** | **Failed** |
| **7月16日** | **Failed** |
| 7月15日 | Completed |

- **2026-07-16 〜 07-25 の 10日間が連続 Failed**、**7月26日から Completed に復帰**
- Orphan page の Crawl history チャートでも 7月24日のツールチップに「**2026年7月24日 Failed / No URLs.**」と表示
- **ahrefs のクロールは 7/26 以降は毎日 Completed しており、最新は 2026-08-01 16:20:45 JST**

---

## 5. 取得不可・未実施の項目

| 項目 | 状態 | 理由 |
|---|---|---|
| Data explorer の表データのテキスト一括抽出 | **JSツールでは取得不可** | classifier 遮断（`[BLOCKED: Cookie/query string data]`）×3回。迂回せず画面読み取りに切替 |
| プロジェクト設定（Max number of internal pages / スケジュール設定の実値） | **未確認** | 設定画面は変更操作のリスクがあるため開いていない。頻度は「クロール履歴が日次」「Scheduled=今日 4—5午後」から観測 |
| 7/16〜7/25 の Failed の原因 | **取得不可** | 失敗クロールには「No URLs.」以外の詳細が表示されない |
| 他3プロジェクト（Moterist 3 / Kit-planning 4 / Motelab 11）のエラー内訳 | **未取得** | 本指示の対象外 |

> 本記録は事実の転記のみ。判断・評価・提案は記載していない。
