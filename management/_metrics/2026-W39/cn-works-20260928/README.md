# 中国発アクセスの works 面拡大と DMM クリック急増の切り分け（チャット便 2026-09-28・read-only）

**5軸**: ①app.vodnavi.jp ②2026-09-20〜09-28（GA4＝Asia/Tokyo の暦日／Vercel Observability＝UTC 日＝09:00〜翌 09:00 JST）③GA4 Data API（プロパティ 489519780）＋ Vercel Observability Query（Chrome 読み取り）＋ Vercel Firewall Traffic（直近 24h のみ）④自サイト実測 ⑤下表の各行。
**取得**: GA4 2026-09-28 12:54 JST（`ga4-cn-works.json`）／Vercel 13:00〜13:18 JST。**書き込みなし**（Firewall・GA4 設定・Supabase・Airtable・リポジトリ本体は不触）。

## 0. 手段の逸脱（申告）
- **GA4 は Chrome の探索レポートではなく Data API（閲覧者権限の鍵・§3）で取得した。** 定義は 9/21 ベースライン `ga4-access-20260921.mjs` と同一（① `product_click`／② `click` かつ `linkDomain ∈ {al.dmm.co.jp, al.fanza.co.jp}`）。CN を含めて取得。
- **Vercel Firewall の Traffic 画面は直近 24h しか選べない**（カレンダーで 9/21〜9/27 を選択できず）。**日別は Observability Query（Requests Count・1 day・UTC 日）で取得した。**
- **【注意】Observability の Requests は Firewall で遮断されたリクエストを含まないと見られる**——ClaudeBot は Firewall 24h で 383.9k だが Observability の 9/27 UTC 日は 550。**Firewall の値と Observability の値を混ぜない。**
- **未取得**: §3-2 d（116.179.33.x 帯）・E28-1/E28-2 の日別ヒット（Firewall は 24h のみ）。

## 1. 判定（事前登録 §2 に照らす）— **H1: 不支持（CN 条件が不成立）／H2: 判定保留（DMM 列が未受領）**

| 日付 | GA4 JP 外部クリック ①/② | GA4 CN 外部クリック ①/② | DMM 004 | DMM 006 | DMM − GA4 JP |
|---|---|---|---|---|---|
| 09-20 | 2 / 2 | 1 / 1 | （未受領） | （未受領） | — |
| 09-21 | 5 / 5 | 1 / 1 | | | |
| 09-22 | 3 / 3 | 2 / 3 | | | |
| 09-23 | 6 / 7 | 2 / 2 | | | |
| 09-24 | 4 / 5 | 0 / 0 | | | |
| 09-25 | 7 / 7 | 0 / 0 | | | |
| 09-26 | 9 / 8 | 0 / 0 | | | |
| 09-27 | 6 / 6 | 0 / 0 | | | |
| 09-28（〜12:5x） | 2 / 2 | 0 / 0 | | | |

- **H1 の支持条件「GA4 CN の外部クリック／works 着地が同時に増えている」は満たされない**——CN の外部クリックは 9/24 以降 0、CN の works PV は 9/22 の 146 → 9/27 の 21（下表 §2-3）。**DMM 列がどう出ても H1 は支持されない。**
- **H2**（JP 外部クリックが DMM と同期して伸びる）は DMM 日別を受領してから判定する。JP は 9/26 に 9、9/27 に 6 で、9/20〜9/25 の 2〜7 と大差はない（**判定はしない**）。
- **成果 0 件は判定材料にしない**（事前登録どおり）。

## 2. GA4（日別・hostName=app.vodnavi.jp）

### 2-1. セッション × 国（JP / CN / その他）
| 日付 | JP | CN | 他 |
|---|---|---|---|
| 09-20 | 76 | 5 | 6 |
| 09-21 | 76 | 44 | 11 |
| 09-22 | 62 | 138 | 3 |
| 09-23 | 62 | 75 | 7 |
| 09-24 | 60 | 72 | 2 |
| 09-25 | 70 | 132 | 8 |
| 09-26 | 69 | 368 | 8 |
| 09-27 | 63 | 308 | 5 |
| 09-28（途中） | 19 | 118 | 3 |

### 2-2. CN のランディング上位（9/20〜9/28 計）
`/concierge` **1,038** ／ (not set) 10 ／ genres・works 各 2 以下。**CN の着地はほぼ全件 `/concierge`。**

### 2-3. CN の PV を面別に（日別）
| 面 | 09-20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 |
|---|---|---|---|---|---|---|---|---|---|
| concierge | 0 | 5 | 90 | 57 | 68 | 155 | 437 | 330 | 135 |
| works（videoa） | 8 | 67 | 134 | 51 | 26 | 34 | 55 | 19 | 2 |
| works（anime/nikkatsu/amateur） | 2 | 2 | 12 | 2 | 0 | 2 | 2 | 2 | 0 |
| actresses | 0 | 3 | 18 | 28 | 18 | 2 | 10 | 4 | 0 |
| genres | 2 | 4 | 20 | 2 | 4 | 0 | 26 | 2 | 2 |
| top | 0 | 0 | 26 | 28 | 10 | 0 | 0 | 0 | 0 |

### 2-4. CN のブラウザ・参照元（9/20〜9/28 計）
- ブラウザ: **Chrome 99.0.4844.51＝1,238**／Chrome 109 7／Chrome 153 2／Firefox 156 2／Android Webview 99 1。
- 参照元: **(direct)/(none) 1,202**／(not set) 43／google organic 11／bing organic 3／yandex referral 1。

### 2-5. JP の外部クリックを面別に（① `product_click`）
| 面 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 |
|---|---|---|---|---|---|---|---|---|---|
| works | 2 | 5 | 3 | 4 | 3 | 6 | 8 | 4 | 2 |
| actresses | 0 | 0 | 0 | 2 | 1 | 1 | 1 | 1 | 0 |
| top | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| sale | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
（② outbound もほぼ同値・`ga4-cn-works.json` の e2）

## 3. Vercel（Observability Requests Count・UTC 日）

### 3-1. 国別（全パス）
| UTC 日 | US | JP | CN | SG |
|---|---|---|---|---|
| 09-21 | 52K | 11K | 6.2K | 1.9K |
| 09-22 | 104K | 9.6K | 6.8K | 3.9K |
| 09-23 | 316K | 11K | 7K | 8.2K |
| 09-24 | 43K | 8.2K | 5.4K | 10K |
| 09-25 | 30K | 9.7K | 5.7K | 17K |
| 09-26 | 36K | 10K | 8.6K | 25K |
| 09-27 | 44K | 8.9K | 6.3K | 28K |

### 3-2. `/works/` 配下の国別
| UTC 日 | US | SG | DE | FR | JP | CN |
|---|---|---|---|---|---|---|
| 09-22 | 48K | 2.2K | 403 | — | 284 | 665 |
| 09-23 | 103K | 6.6K | 642 | 32 | 478 | 652 |
| 09-24 | 20K | 5.8K | 496 | 683 | 170 | 506 |
| 09-25 | 16K | 4.8K | 5.5K | 2.2K | 373 | 497 |
| 09-26 | 20K | 12K | 3.1K | 3.2K | 401 | 280 |
| 09-27 | 25K | 20K | 845 | 559 | 378 | 225 |
- **`/works/` の CN は 665 → 225 に減少。** 増えているのは **SG（2.2K → 20K）** と US。
- **SG の `/works/`（7 日計 61K）は AS 名＝Alibaba (US) Technology が 60K。** UA は Chrome 144〜147 の Windows / macOS が各 3.0〜3.1K ずつ均等に並ぶ（回転する UA 群）。
- `/works/` 7 日計の UA 上位: ClaudeBot 125K／bingbot 71K／ExaSearchBot 19K／Chrome 142 macOS 13K／Chrome 139 Linux aarch64 11K／AteveSearch 9.2K／MJ12bot 9K／SERanking 8.4K／Semrush 6.4K。

### 3-3. UA 別（日別・UTC）
| UTC 日 | Chrome/99.0.4844.51 | ClaudeBot | PerplexityBot |
|---|---|---|---|
| 09-21 | 4.9K | 1.4K | 13K |
| 09-22 | 4.0K | 78K | 380 |
| 09-23 | 5.7K | 288K | 2 |
| 09-24 | 4.0K | 11K | 0 |
| 09-25 | 3.5K | 4.3K | 2 |
| 09-26 | 5.2K | 1.2K | 0 |
| 09-27 | 5.4K | 550 | 0 |
- **Chrome/99 の 7 日計のパス上位**: `/` 7.5K／`/sale` 7.4K／`/concierge` 3.2K／genres 各 約 200。**works は上位に無い。**
- **ClaudeBot・PerplexityBot は Observability では減っているが、Firewall 24h（9/27 12:30〜9/28 12:00 JST）では ClaudeBot 383.9k・E28-2 の Denied 257.4k。** Observability は遮断分を含まないと見られるため、「減った」と読まない。

### 3-4. Firewall（直近 24h のみ・2026-09-28 13:0x JST 読み取り）
Allowed 642.9k／Denied 259.5k／Challenged 427。ルール: **E28-2 concierge non-browser deny 257.4k**／DDoS Mitigation 2.6k（**E28-1 PerplexityBot rate_limit は一覧に出ない＝24h ヒット 0 と見られる**）。AS 上位: Amazon 384.9k／Alibaba (US) 103.7k／Microsoft 95.2k／Oracle 55.0k／**CHINA UNICOM China169 36.1k**。パス上位: `/concierge` 332.8k／`/` 15.9k／`/sale` 12.7k。

## 4. 事前登録外の観測（仮説として登録するかは CSO）
- **`/works/` の増加は CN ではなく SG の Alibaba Cloud（回転 UA）と US のクローラである。** GA4 の「他」の国のセッションは 2〜11/日で、SG の 60K は GA4 にほとんど現れない＝JS を実行しない取得と見られる（**断定しない**）。
- **JS を実行しないクローラが works の CTA（af_id 004 の href）を辿れば、GA4 には出ずに DMM のクリックにだけ計上されうる。** これは §2 の H1（GA4 CN 条件付き）とは別の仮説であり、**事前登録していないため本便では判定しない。** 検証には DMM 日別と、Vercel での `al.dmm.co.jp` 宛の外部遷移は見えない（自サイト外）ため、DMM 側の時間帯別クリックとの突合が要る。

## 5. 9/29 E28 再裁定への材料
**戦略顧問案（転記・区別）**: PerplexityBot の効果／ClaudeBot／country=CN Challenge／UA Chrome/99 Challenge。
**CTO が出せる事実**: PerplexityBot は Observability 上 9/22 以降ほぼ 0（13K → 380 → 0〜2）／E28-2 は 24h で 257.4k を遮断／Chrome/99 は 4〜6K/日で横ばい・`/`・`/sale`・`/concierge` 中心／CN の `/works/` は減少／**SG Alibaba Cloud の `/works/` が 2.2K → 20K/日に増加（新規）**。**CTO の推奨は書かない。**
