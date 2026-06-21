---
setup_date: "2026-06-21"
operator: "CSO (VODNAVI)"
target_events: ["ai_session_start", "product_click"]
status: "salvaged"
data_window: "2026-06-14 〜 2026-06-20 (過去7日間)"
source: "GA4 p489519780 / 新規自由形式 Exploration kJIj6zkLT8SK7TSKYsMvCA (event_name × [アクティブユーザー, イベント数], hostName フィルタなし=全ホスト)"
account_verified: "moterist.com@gmail.com (authuser=2, UI tooltip で物理確認)"
---
# GA4 自由形式（Freeform）探索による named-event サルベージ

## 1. 目的
既存ファネル探索に依存せず、event_name ディメンションから直接 `ai_session_start` / `product_click` の直近7日間実数をサルベージする。

## 2. 探索構成（実構築済）
- データソース: GA4 p489519780
- 手法: 自由形式
- 行: `event_name`
- 列: なし（全デバイス合計）
- 値: `アクティブユーザー`, `イベント数`
- 期間: 2026-06-14〜06-20
- 注: hostName フィルタは未適用のため、下表は全ホスト合算（app.vodnavi.jp が 99.6% を占めるため実質 app の数値）。

## 3. 物理確認済データ（7日, 全ホスト）

| event_name | アクティブユーザー | イベント数 |
|---|---|---|
| page_view | 794 | 1,776 |
| session_start | 784 | 802 |
| first_visit | 763 | 763 |
| user_engagement | 491 | 537 |
| click | 68 | 81 |
| ai_affiliate_click | 67 | 79 |
| **product_click** | **67** | **79** |
| scroll | 35 | 38 |
| **ai_session_start** | **7** | **8** |
| concierge_entry_click | 7 | 7 |
| **（合計）** | **797** | **4,172** |

## 4. 要求3指標の結論
- `ai_session_start`（7日）: **アクティブユーザー 7 / イベント数 8** — サルベージ完了（物理確認）。
- `product_click`（7日）: **アクティブユーザー 67 / イベント数 79** — サルベージ完了（物理確認）。
- `source × intent` セッション内訳: **データアクセス要（未取得）**。本探索は event_name 軸で source/intent クロス表ではない。app 直流入が 99.6% のため source タグ付き流入は僅少と推定（=既知 [[project_funnel_intra_app_reclassified]]）だが、実数は別 Exploration が必要。

## 5. 前回 proxy の検証結果
- ファネル step「コンシェルジュ起動」(7) は **ai_session_start (7) と一致** → 設計対応を物理確認。
- ファネル step「購入」(0) ≠ product_click。product_click は独立イベントで 7日 67ユーザー/79回 と健全に発火しており、前回「購入=product_click と断定しない」とした慎重判断が正しかった。

## 6. 残アクション
- source×intent クロス表の Exploration 構築（優先度: 中、app 直 99.6% 前提）。
- 自由形式探索 `kJIj6zkLT8SK7TSKYsMvCA`（「自由形式 1」）は保存済資産として残置。
