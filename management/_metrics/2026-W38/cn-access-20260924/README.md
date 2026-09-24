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
