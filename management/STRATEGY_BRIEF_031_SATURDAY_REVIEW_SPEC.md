# STRATEGY BRIEF 031 — 土曜データ駆動 PDCA ルーティン（Saturday Review）執行仕様

## 1. 目的
本番環境に注入された 5 大記事（Moterist）から流入するリアルタイムの `source × intent` セッション生データを GA4 から抽出し、設定された漏斗 KPI（上流目標 CTR_app: 6.0% / 下流目標 CVR: 11.1%）と冷徹に突合する。売上の伸び悩んでいるインテント動線を特定し、CCO (ChatGPT 5.5) に対する自動リライト指示を無人で生成する。

## 2. コア不変条件（自律 PDCA の盾）

### 2.1 空中戦の排除
GA4 の `source=moterist` に紐づく `ai_session_start` および `product_click` の実数値を `management/OPERATION_MANUAL.md §2.3` の JSON スキーマ形式で `management/_metrics/<YYYY-WW>/saturday-raw-data.json` に物理書き出しするまで、憶測による「リライト方針」の決定を永久に禁止する。

### 2.2 E-E-A-T / Information Gain の維持
数値低下を理由にした安易なタイトル改変や、ネオン・ピンク系のアダルト表現の混入を厳禁とする。リライトは常に `BRAND_DESIGN_GUIDE.md` の最高法律（『ビブリア・エロティカ』）および `THE_THOR_DICTIONARY.md` の装飾正典を引用して行わなければならない。

### 2.3 T-04（Linker 修復）へのスタンス
Linker は破綻している（BRIEF_029 verdict）が、CVR 集計自体は `source` パラメータで担保されているため、T-04 の修復のために WordPress のコードをガチャガチャと手動で弄り、SEO 評価や表示速度を毀損することを禁止する。T-04 は安全な子テーマの `functions.php` ステージング検証を経てからのみ landed を許可する。

## 3. 執行トリガーとタイムライン

OPERATION_MANUAL.md §2.1 のタイムラインに従う：

| 時刻 (JST) | 担当 | 動作 |
|---|---|---|
| 10:00 | HUMAN | Claude Code を起動し「サタデー・レビューを開始して」と入力 |
| 10:00–10:05 | CTO (Claude Code) | Chrome MCP で GA4 / Search Console を操作、データ抽出 |
| 10:05 | CTO | `management/_metrics/<YYYY-WW>/saturday-raw-data.json` を生成 |
| 10:05–10:30 | CSO | JSON を読み込み、5 指標で診断 → 指示書を発行 |
| 10:30 | HUMAN | 指示書を確認し、CTO / CCO への割り振りを承認 |

## 4. 直近の 5 指標診断契約

CSO は `saturday-raw-data.json` を読み込み、以下のいずれかを出力（OPERATION_MANUAL §2.4）：

| 検出パターン | 出力ファイル |
|---|---|
| 送客率 -20% 超 | `STRATEGY_BRIEF_RW_<post_id>_<YYYYMMDD>.md` (CCO 宛リライト指示書) |
| CVR が intent 別目標を下回る | `STRATEGY_BRIEF_AB_<intent>_<YYYYMMDD>.md` (CTO 宛 A/B 指示書) |
| 検索順位 11〜20 位に落下 | `STRATEGY_BRIEF_IG_<post_id>_<YYYYMMDD>.md` (CCO 宛 Information Gain 強化指示) |
| 異常なし | `_metrics/<YYYY-WW>/saturday-review.md` に「異常なし」と記録のみ |

## 5. 初回 Saturday Review (W23) で期待される観測

BRIEF_028 §1 で注入した 5 記事の効果初観測。期待値：
- moterist.com 記事 → app.vodnavi.jp の **送客率** 上昇（CTA 末尾追加効果）
- `ai_session_start` の `source=moterist` 件数の前週比増
- `product_click` / `ai_affiliate_click` の絶対数増
- FANZA dashboard のクリック数 / 成約数 / CVR の変化（M0 baseline 0.374%）

## 6. 関連

- [[OPERATION_MANUAL.md §2]] — Saturday PDCA 自動化フローの canonical 手順
- [[reference_ga4_report_ids]] / [[reference_ga4_url_date_params]] — Chrome MCP で GA4 操作する際の URL 規約
- [[gtag-linker-diagnostic]] — linker dead 状態を引き継ぐため、moterist 側 client_id 継承不可
- [[funnel-drop-off-seo-to-concierge]] — 既知 1.02% ファネル基準値
- [[detail-page-concierge-cta-shipped]] — 5/25 ship 済 CTA、本 Saturday-Review で初の本格 CVR 測定対象

*v1.0 — 2026-06-01 初版策定。次期発火: 2026-06-06 (土) 10:00 JST 予定。*
