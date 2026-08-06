# /concierge のリクエスト実態 — **24時間で 16,017 件、うち 98.9% がボット判定**

- 実施: **2026-08-06 18:30 〜 19:00 JST**
- 取得元:
  - **Vercel Firewall > Traffic**（Pro プランで利用可。Run Query ビルダー / metric = `Firewall Actions Count (Sum)`）
  - Vercel Runtime Logs（MCP `get_runtime_logs` / `get_runtime_errors`）
  - GA4 プロパティ **p489519780**（アカウント **VODまとめ研究所** / プロパティ **vodnavi.jp**）
- **読み取りのみ。ファイアウォールのルール作成・Bot Protection の有効化など設定変更は一切していない**
- **判断は加えず、数値のみ**
- Phase 1 で停止

---

## 【前提】「28日間」の遡及は不可能

| 取得手段 | 取得可能な期間 |
|---|---|
| Vercel Firewall > Traffic の期間セレクタ | **Live / Past Hour / Past Day の3択のみ**（28日は選べない） |
| Vercel Runtime Logs（`group_by` 集計） | 24h までは成功。それ以上は **タイムアウトで0件返却** |
| Vercel Runtime Logs（個別行） | 直近 **2〜3分** |
| Vercel Runtime Errors（事前集計） | **最大7日** |
| GA4 | 28日以上可 |

**したがって本記録のサーバ側数値はすべて「直近24時間」であり、28日分の遡及・対応づけはできていない。**

Firewall のクエリ窓は **2026-08-05 18:30 〜 2026-08-06 18:45 JST** で固定した。
GA4 は **2026-08-05（JST 00:00〜24:00）の単日**であり、**両者の期間は完全には一致していない**。

---

## 1. リクエストの User-Agent 別分解（`/concierge`・24時間）

### Bot Category 別（同一クエリを2回実行し同値を再現）

| Bot Category | 件数 | 構成比 |
|---|---|---|
| **ai_crawler** | **6.3K** | 39.3% |
| **search_engine_optimization** | **4.6K** | 28.7% |
| **browser_impersonation** | **4.3K** | 26.8% |
| search_engine_crawler | 650 | 4.1% |
| **not set**（ボット分類なし） | **174** | **1.09%** |
| uncategorized_bot | 6 | 0.04% |
| **合計** | **≈16,017** | 100% |

→ **ボット分類が付与された行 = 15,843 件 ＝ 98.9%**
→ **`not set`（＝ボットと分類されなかった分）= 174 件 ＝ 1.09%**

### Bot Name 別（同 24時間・`/concierge`）

| Bot Name | 件数 |
|---|---|
| **amazonbot** | **5.2K** |
| **semrush** | **4.6K** |
| **not set**（名前が付かない＝主に `browser_impersonation`） | **4.5K** |
| **claudebot** | **919** |
| bingbot | 637 |
| meta-externalagent | 168 |
| ccbot | 2 |
| seranking-backlinks | 1 |
| applebot | 1 |

### サイト全体の Top User Agents（Past Day・全パス・**UA 原文**）

| User Agent | 件数 |
|---|---|
| `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot) Chrome/119.0.6045.214 Safari/537.36` | 11.0k |
| `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36` | 10.6k |
| `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; SleepBot/1.0; +http://sleepbot.com/) Chrome/131.0.0.0 Safari/537.36` | 6.4k |
| `Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)` | 5.1k |
| `Mozilla/5.0 (Windows NT 10.0; Win64; x64) … (compatible; meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler))` | 2.8k |

サイト全体（Past Day）: **Allowed 53.7k / Denied 7 / Challenged 2 / Rate Limited −**
**Bot Protection = Inactive**、**Custom Rules = 0**、Rules 欄に `DDoS Mitigation 9`
Top Hosts: `app.vodnavi.jp` 54.5k / `vodnavi-app.vercel.app` 27

---

## 2. リクエスト元 IP の分布

### `/concierge`・24時間・IP 別

| IP | 件数 | 時系列の形 |
|---|---|---|
| **216.73.217.108** | **796** | 8/6 未明に集中する**単発スパイク**（他時間帯はほぼ0） |
| 34.121.137.159 | 241 | 終日ほぼ一定 |
| 34.171.174.237 | 235 | 終日ほぼ一定 |
| 34.121.114.254 | 229 | 終日ほぼ一定 |
| 35.192.104.136 | 226 | 終日ほぼ一定 |
| 34.63.67.204 | 226 | 終日ほぼ一定 |
| 34.41.147.62 | 225 | 終日ほぼ一定 |
| 35.226.60.112 | 224 | 終日ほぼ一定 |

- 2位以下は **`34.x` / `35.x` 帯の多数の IP が各 220〜240 件で横並び**＝分散している

### サイト全体の AS Name（Past Day）

| AS Name | 件数 |
|---|---|
| Amazon.com, Inc. | 11.0k |
| Microsoft Corporation | 10.8k |
| Google LLC | 6.4k |
| SEMrush CY LTD | 5.1k |
| Facebook, Inc. | 4.2k |

### サイト全体の Top IPs（Past Day）

216.73.217.108 (1.6k) / 113.120.67.217 (477) / 153.171.106.125 (391) / 35.226.60.112 (351) / 104.197.72.96 (336)

### 参考: **Bot Category = `not set` に限定**した Request Path 別（24時間）

| Request Path | 件数 |
|---|---|
| `/` | 540 |
| （not set） | 257 |
| **`/concierge`** | **174** |
| `/genres/6533` | 122 |
| `/genres/6548` | 80 |
| `/_next/static/media/….woff2` | 80 / 80 / 80 / 79 |
| `/_next/static/chunks/….js` | 79 |

- この絞り込みでは **静的アセット（フォント・JS チャンク）が同水準で並ぶ**

---

## 3. 他の面でも同様の乖離があるか

### Vercel Runtime Logs（production・直近24時間・`group_by=route`）

| route | 件数 |
|---|---|
| `/works/[floor]/[id]` | 19,508 |
| `/concierge` | 15,993 |
| `/actresses/[id]` | 6,865 |
| `/genres/[id]` | 3,797 |
| `/index` | 944 |
| `/opengraph-image` | 76 |
| `/articles/[slug]` | 56 |
| `/api/age-gate` | 43 |

### GA4（2026-08-05 単日・全57行・**合計 表示回数 146 / アクティブユーザー 56**）

面ごとに合算した実測値:

| 面 | GA4 表示回数（8/5） |
|---|---|
| `/works/*` | **118**（4回×11行 + 2回×36行 + 1回×2行） |
| `/genres/*` | **10**（`/genres/1029` 5 + `/genres/2004` 5） |
| `/actresses/*` | **8**（4行 × 2） |
| `/`（トップ） | **6** |
| **`/concierge`** | **4** |
| `/articles/*` | **0**（該当行なし） |

### 突き合わせ

| 面 | Vercel 24h | GA4 8/5 | **倍率** |
|---|---|---|---|
| **`/concierge`** | **15,993** | **4** | **≈3,998×** |
| `/actresses/*` | 6,865 | 8 | ≈858× |
| `/genres/*` | 3,797 | 10 | ≈380× |
| `/works/*` | 19,508 | 118 | ≈165× |
| `/`（トップ） | 944 | 6 | ≈157× |
| `/articles/*` | 56 | 0 | 算出不可（GA4 が 0） |

- **乖離はすべての面に存在する**
- **`/concierge` の倍率が最大**で、2番目の `/actresses/*` の約4.7倍、`/works/*` の約24倍
- ※ 期間が完全一致していない（GA4=8/5 JST 00:00–24:00 / Vercel=8/5 18:30–8/6 18:30 JST）ため、倍率は概算

---

## 4. 前例との照合

### 前例: af_id 990 の 7,558 クリック（`management/_research/2026-07-31_af990_human_cta_incident.md` / 修正 `c237e51`）

| 項目 | 内容（記録原文より） |
|---|---|
| 事象 | 2026-06-24 から DMM 側クリックが日次 ~20 → 671 に急増。報酬ゼロのまま EPC が希釈 |
| 真因 | works Product JSON-LD の `Offer.url`、actresses / genres CollectionPage の ItemList `url` に **af_id 入り affiliateURL が露出**し、構造化データを巡回する bot の fetch が **DMM 側でクリック計上**された |
| 判定根拠 | 同期間の GA4 `ai_affiliate_click` は 8〜10件/日で**不動**＝非人間と確定 |
| 対処 | `c237e51`（2026-07-07）: JSON-LD から af_id を除去 + 全アフィリエイトアンカーに `nofollow` 付与 |
| 計上主体 | **DMM のクリックカウンタ（外部）** |
| 月次推移 | 2026/04 = 0 → **2026/05 = 1,080** → **2026/06 = 3,135** |

### 今回との対比（事実のみ）

| 観点 | af_id 990（2026-06〜07） | 今回（`/concierge`・2026-08） |
|---|---|---|
| 計上している主体 | **DMM のクリックカウンタ（外部）** | **Vercel のリクエストログ / Firewall メトリクス（自社インフラ）** |
| GA4 の挙動 | 不動（8〜10件/日） | 不動（8/5 は `/concierge` 4 表示回数） |
| 増加分の主体 | bot（JSON-LD 検証・巡回系） | bot（**98.9% が Bot Category 付与**。amazonbot / semrush / claudebot / bingbot 等） |
| 経路 | **af_id 入り URL の構造化データ露出** | **`/concierge` への直接 GET**（構造化データ経由ではない） |
| af_id の関与 | あり（`moterist-990`） | **なし**。2026-07-31 の本番HTML実測で `/concierge` の 990系 = **0件** / 004 = 1件 |
| 金銭影響 | あり（成果報酬・EPC の希釈） | 本記録では**確認していない**（Vercel 使用量への影響は未取得） |

- **共通する観測事実**: ①サーバ側／外部側のカウンタのみが増え **GA4 は不動** ②増加分の主体が **bot と特定できる**
- **異なる観測事実**: ①経路（JSON-LD 露出 vs 直接 GET） ②af_id の関与の有無 ③計上主体（外部 DMM vs 自社 Vercel）
- **同種か否かの断定は本記録では行わない**

---

## 5. 併せて観測された事実（前回記録の補足・**訂正を含む**）

### 5-1. ランタイムエラー — 直近7日で 2,713 件

前回記録（`datapull-20260806-0230`）で「error/warn 0件」と書いたのは**約2分間のログ取得範囲内での話**である。事前集計 API（最大7日）で取り直した結果は以下。

| エラー群 | 件数 | 影響ユーザー | 該当ルート | 最終発生 |
|---|---|---|---|---|
| `VODNAVI_SILENT_DEATH_GUARD` / `fetchItemList: HTTP エラー` / **FANZA API 400 Bad Request** | **2,684** | 1,321 | `/actresses/[id]`, `/genres/[id]`, `/works/[floor]/[id]`（+ `.rsc`） | 2026-08-05 19:01:27 |
| `TypeError: terminated`（HTTPParserError: Invalid EOF state） | 17 | 16 | `/concierge.rsc`, `/index.rsc`, `/genres/[id].rsc`, `/concierge`, `/actresses/[id]`, `/works/[floor]/[id]` | 2026-08-06 01:03:18 |
| `TypeError: fetch failed`（`ETIMEDOUT 202.6.245.194:443` / `ECONNRESET host: api.dmm.com`） | 12 | 10 | `/index.rsc`, `/genres/[id].rsc`, `/works/[floor]/[id]`, `/concierge` | 2026-08-06 05:35:38 |

- FANZA API 400 の初出は **2026-06-21T13:36:09**（`project_fanza_api_400_global_outage` の記録と同時期）
- **`/api/concierge`（AI 呼び出し）を該当ルートに含むエラー群は存在しない**

### 5-2. ステータスコード / ソース（直近24時間）

| statusCode | 件数 |
|---|---|
| 200 | 47,301 |
| 404 | 275 |

| source | 件数 |
|---|---|
| function | 47,265 |
| middleware | 15,999 |
| cache | 326 |
| redirect | 30 |

- `middleware`（＝`proxy.ts`）の 15,999 は `/concierge` の 15,993 とほぼ一致（matcher が `/concierge` と `/api/concierge` に限定されているため）

### 5-3. `_gl` 着地ログ

- `proxy.ts` が `_gl` パラメータ付き着地時のみ出力する `[GL_TRACKING]` ログ → **直近24時間で0件**

### 5-4. Vercel Web Analytics

- `Web Analytics not found`（**未有効化**）＝ GA4 と独立した第2の計測系は存在しない

---

## 6. 本調査で行っていないこと（明記）

- Bot Protection の有効化、ファイアウォールのカスタムルール作成、`robots.txt` の変更 — **いずれも実施していない**
- 28日分のサーバ側データ取得 — **取得手段が存在しないため未実施**
- `/concierge` が bot に繰り返し取得されている理由の特定 — **本記録では実施していない**

---

> 本記録は数値と取得可否の転記のみ。原因の断定・評価・提案は記載していない。
