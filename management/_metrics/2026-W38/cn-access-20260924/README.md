# 中国発アクセスの切り分け（CSO 指示 2026-09-25・read-only・数字のみ）

**取得 2026-09-24 21:38〜22:0x JST。** 対処案の裁定は CSO。解釈は書かない。

## 1. GA4（p489519780・全ホスト・Data API・`ga4-cn.json` / `ga4-cn-spike.json`）

**5軸**: ①全ホスト（CN は app.vodnavi.jp 414 / www 4）②直近 30 日（2026-08-25〜09-24）③GA4 Data API ④自サイト実測 ⑤—。**9/23・9/24 は処理遅延で未確定（§6-1）。**

国別 上位 10（セッション / ユーザー / PV / エンゲージメント率 / 平均セッション秒）

| 国 | セッション | ユーザー | PV | ER | 平均秒 |
|---|---|---|---|---|---|
| JP | 2,064 | 1,916 | 4,702 | 0.917 | 32.5 |
| **CN** | **418** | 406 | 1,225 | **0.622** | 105.1 |
| US | 51 | 50 | 218 | 0.745 | 48.8 |
| TW | 39 | 38 | 145 | 1.000 | 100.5 |
| HK | 21 | 21 | 47 | 0.810 | 29.5 |
| SG | 20 | 19 | 42 | 1.000 | 17.2 |
| KR | 16 | 15 | 37 | 0.938 | 10.1 |
| DE | 14 | 14 | 20 | 0.571 | 6.9 |
| VN | 14 | 13 | 32 | 1.000 | 35.0 |
| ID | 10 | 9 | 28 | 1.000 | 25.3 |
| 全体 | 2,733 | 2,559 | 6,741 | 0.868 | 45.5 |

CN 日別（セッション / ER / 平均秒）: 9/1〜9/20 は 1〜11/日（計 97）→ **9/21 44（ER 0.841・5.0 秒）/ 9/22 138（0.514・22.7）/ 9/23 75（0.307・39.6）/ 9/24 25（0.240・2.5・当日分）**。JP 同期間 76 / 62 / 62 / 39。

**9/21〜 の CN（282 セッション）**: ER 0.486・平均 22.6 秒・new 281 / returning 1・source (direct) 251・(not set) 23・google 4。着地 **/concierge 147（ER 0.170・1.0 秒）**。イベント: age_gate_view 129 / age_gate_agree 9 / product_click 5。**同期間の JP 238 セッション・ER 0.903・50.1 秒。**

CN 30 日: 着地 /concierge 147（ER 0.170・1.0 秒）/ `/` 21 / works 各 ≤15。source (direct) 319・google organic 43・(not set) 30・bing 8・yandex 7。都市 (not set) 283・Shenzhen 27・Guangzhou 23・Beijing 16。端末 desktop Chrome Windows 323 / mobile Chrome Android 42 / iOS Safari 16。

## 2. Vercel（Observability Query・Chrome 画面読み取り・Last 24 hours＝2026-09-23 22:0x〜09-24 22:0x JST）

- 国別リクエスト上位: US 126K / SG 12K / JP 8.9K / **CN 6.1K** / GB 2K / FR 1.8K / DE 1.4K / UA 406 / HK 229 / ID 185。
- **CN の WAF: allow 5.9K / deny 151**（HTTP 200 5.9K / 403 150 / 404 8 / 500 6）。
- CN の UA 上位: `Chrome/99.0.4844.51 (Windows NT 10.0)` **4.9K** / Baiduspider/2.0 762 / Chrome/109 226 / Chrome/48 (WOW64) 195 / 他 各 ≤2。
- CN の AS: CHINA UNICOM China169 Backbone **5.4K** / China Telecom IDC 400 / Chinanet 231 / China Telecom 95。IP 上位は 116.179.33.x（China Unicom）が各 105〜117・113.124.37.32（Chinanet）131。
- CN のパス上位: `/` 915 / `/sale` 888 / `/concierge` 604 / `/genres/*` 各 39〜42。
- （参考・全体 Firewall Traffic Past Day）Allowed 81.6k / Denied 78.2k・`E28-2 concierge non-browser deny` 87.5k・UA 最多は ClaudeBot 107.4k。
- **MCP の observability API は 404（Observability Data not found）で使えず、画面で取得した。**

## 3. 500 の国別（同じ 24h）

- エッジの HTTP 500 = **108**（US 68 / SG 25 / **CN 6** / DE 4 / GB 2 / TR・MX・JP 各 1）＝**CN 5.6%**。
- Runtime Logs `"served":500` の行数（production・24h）= 107。**ログ行に国は無く、国別は上記エッジ側の値で代用。**

## 4. CSO裁定（2026-09-25）と実施

1. **判定（CSO）**: 中国発は実ユーザーではなく JS 実行型ボット群（`Chrome/99.0.4844.51` 固定 UA・116.179.33.x・Baiduspider 同居）。収益影響なし（FANZA は中国から購入不可）。served:500 への寄与 5.6%。実害は GA4 計測の濁り（30 日で 15%＝418 / 2,733）。
2. **実施（CTO）**: GA4 集計スクリプトに country ≠ CN を既定で入れた（`--include-cn` で解除）。GA4 プロパティ側は不変。
   - `management/tools/x-reply-drafts/ga4-quote-sessions.mjs`＝`withCountryExclusion()` / `EXCLUDE_COUNTRIES=["CN"]`・出力に `excluded_countries` と filter 文字列。実行確認（9/22〜9/24）で `filter: … AND country NOT IN (CN)`。
   - `weekly-report.mjs`＝GA4 表の見出しに ga4_quote の filter 文字列を表示（旧形式の JSON は「CN 除外なし＝旧形式」と表示）。`node --test` 89/89。
   - `management/_metrics/2026-W38/ga4-access-20260921.mjs`＝全 runReport に NOT CN を付与・見出しに表示。**構文確認のみ（再実行はしていない＝再集計しない裁定）。**
   - `access-20260921.md` 冒頭に「CN 含む・再集計しない」を注記。
3. **9/29 E28 再裁定の議題（CSO）**: (a) PerplexityBot rate_limit の効果 (b) ClaudeBot 107.4K/日への同等 rate_limit (c) country=CN への Challenge。**それまで Firewall は触らない。**

## 5. /sale の構造（read-only・9/29 の材料）

- `src/app/(site)/sale/page.tsx`: **`export const revalidate = 300`**（ISR）。`fetchSaleItems()` を `react.cache()` で 1 リクエスト内に束ねる。
- `src/lib/fanza/sale-source.ts`: **4 フロア（videoa / anime / nikkatsu / videoc）× 4 ページ（offset 1/101/201/301・hits 100・sort=rank）＝16 コール**／再生成 1 回。`fetchItemList` は `fetch(url, { next: { revalidate } })` で Data Cache に載る（コメント原文「実際に FANZA を叩くのは revalidate 間隔に1回」）。
- **実測（Vercel Observability > Edge Requests・Last 12 hours・2026-09-24 22:0x JST 画面）: `/sale` 724 リクエスト・Cached 98.3%。**
- 帰結の算術（数字のみ）: 上流 FANZA 呼び出しはリクエスト数ではなく再生成回数に比例し、**上限は 16 × 288（= 86,400 / 300）= 4,608 コール/日**。CN の `/sale` 888/日は大半がキャッシュ応答に当たる（同画面の Cached 率より）。**CN 分だけのキャッシュ率は取得していない。**

## 6. E28 日次記録（2026-09-24・Firewall Traffic・Past Day＝画面読み取り 21:4x JST）

| 項目 | 値 |
|---|---|
| Allowed / Denied | **81.6k / 78.2k** |
| `E28-2 concierge non-browser deny` | 87.5k |
| DDoS Mitigation | 64 |
| 最多 UA | **ClaudeBot/1.0 107.4k**（AS Amazon 107.4k・IP 216.73.217.80 60.8k / 216.73.217.0 37.2k） |
| 次点 UA | bingbot 13.3k・Linux aarch64 Chrome/139 5.5k・Windows Chrome/99.0.4844.51 5.1k・SemrushBot 3.4k |
| 上位パス | /concierge 94.0k・/ 1.9k・/sale 1.5k |
| `E28-1 PerplexityBot rate limit` | Rules 欄に表示なし（0 件と見られるが断定しない） |
