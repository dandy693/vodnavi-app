# GA4 物理設定検証報告書 — claude-in-chrome 目視監査（2026-07-01）

> T-20260701-GA4-CHROME / -GA4-REPDOC の執行記録。claude-in-chrome MCP で GA4 admin を**読み取りのみ**で走査（変更操作・保存・承認は一切行っていない）。記載は**画面で目視できた事実のみ**。目視できなかった項目は「未確認」と明記。

## 0. アカウント境界ガード（最優先・PASS）
- 既定アクティブ垢（`authuser=0`）= **`hdktchkw33@gmail.com`**（Tachikawa Hideki）＝個人垢。GA4 走査には**不使用**。
- アカウント切替メニューで **`moterist.com@gmail.com`（モテリスト）がログイン済**を目視確認。順序 hdktchkw33(0)→dandychan.auone(1)→**moterist.com(2)** ＝ `authuser=2` 仮説と一致。
- `authuser=2` で GA4 を開いた結果、画面ヘッダ **「すべてのアカウント > VODまとめ研究所」「vodnavi.jp」**、URL `a355462253p489519780` を目視確認＝**本番 vodnavi プロパティに着地・既定垢の他社プロパティ罠を回避**（PASS）。パスワード入力は一切なし（既存セッション利用）。

## 1. プロパティ / データストリーム（目視値）
| 項目 | 目視値 |
|---|---|
| アカウント | VODまとめ研究所（`a355462253`） |
| プロパティ | vodnavi.jp（`p489519780`） |
| データストリーム名 | VODまとめ研究所 |
| ストリーム URL | `https://vodnavi.jp/` |
| ストリーム ID | `11225897844` |
| 測定 ID | **`G-GG7JV9MJRW`**（Google タグ `GT-PZQ74Z7D`） |
| データ収集状態 | 過去48時間トラフィック受信中 |
| 拡張計測機能 | **ON**（測定中: ページビュー / スクロール / 離脱クリック + 他4個） |
| 接続済みサイトタグ | **0 個** |

→ 測定ID `G-GG7JV9MJRW` = `p489519780` / stream `11225897844` を**物理確認**（既存トポロジ記録と一致）。

## 2. クロスドメイン（gtag linker）設定 — 主要監査対象
「タグ設定 > ドメインの設定 > クロスドメインのリンク設定 > 次の条件に一致するドメインを含める」に**実際に構成済**のドメイン:

| マッチタイプ | ドメイン |
|---|---|
| 完全一致 | **`vodnavi.jp`** |
| 含む | **`app.vodnavi.jp`** |
| 含む | **`moterist.com`** |

→ **`vodnavi.jp ↔ app.vodnavi.jp` のクロスドメイン測定は構成済み（有効）**。moterist.com も linker 対象に残存（凍結資産だが linker ドメインは保持）。

## 3. タグ品質（要確認・1 issue・低重大度）
- 「タグの品質: **要確認**」／アクションアイテム1件 = **「構成用に追加のドメインが検出されました」**。
- 実体 = gtag が**追加ドメイン**で発火を検出＝「ドメインの候補」に挙がった **Vercel プレビュー URL 5件**（`vodnavi-bq7zjibex- / -bsb09viik- / -66wpkc4pm- / -6qolc2lgt- / -9cgqa083q- hdktchkw33-gmailcoms-projects.vercel.app`）。いずれも**未承認の候補**（本番構成には未追加）。
- 評価: これらは**短命なプレビューデプロイ**＝本番ドメインではない。本番クロスドメイン（vodnavi.jp↔app.vodnavi.jp）の破綻ではなく、プレビュー発火の検出に過ぎない低重大度の advisory。**対応は任意**（プレビューURLを本番 linker に足す必要は通常ない）。

## 4. 参考：GA4 ホーム実測（過去7日・目視）
- イベント: `page_view` 1,464 / `session_start` 622 / `first_visit` 582 / `user_engagement` 404 / `age_gate_view` 446 / `age_gate_agree` 297 / `scroll_custom` 222。
- チャネル（セッション）: Organic Search 582 / Direct 39 / Unassigned 0 / Referral 0。
- 国: Japan 537 が支配的（China 16 / Taiwan 8 / US 7 / Singapore 4 …）。
- アクティブユーザー: 30日 3,542 / 7日 599 / 1日 66。今月(7月)は月初のため 0。

## 5. 未確認（本走査で目視していない項目・捏造しない）
- プロパティのタイムゾーン / 通貨 / 業種カテゴリ（admin property-settings 深リンクが home へ bounce したため未取得）。
- 「データの収集」内の Google シグナル / 同意モード等の詳細トグル。
- 必要なら次回走査で追補する。

---
**監査手法**: claude-in-chrome MCP 拡張機能（Playwright/headless ではない）。read-only（保存・承認・トグル変更ゼロ）。スクリーンショット根拠あり。
