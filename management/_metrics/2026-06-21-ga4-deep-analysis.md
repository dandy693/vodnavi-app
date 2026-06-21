---
analysis_date: "2026-06-21"
analyst: "CSO (VODNAVI)"
status: "under_audit"
data_window: "2026-06-14 〜 2026-06-20 (過去7日間)"
source: "GA4 p489519780 / Exploration h4bNtK9ST0KSgZx-yf_9ZQ (VODNAVI ファネル, hostName 内訳)"
---
# GA4 深掘りアクセス解析レポート

## 1. 物理ファクト検証スタンス
本レポートは、脳内推測やもっともらしいロジックの捏造を100%禁止し、目視で確認できた物理数値のみを「物理確認済」とし、推測・未取得は明示的にラベル分けする。

## 2. 物理確認済データ（7日窓: 2026-06-14〜06-20, hostName 分割ファネル）

| ステップ | 合計 | app.vodnavi.jp | moterist.com | www.vodnavi.jp |
|---|---|---|---|---|
| Step1 記事閲覧 (page_view) | **794** | 791 | 2 | 1 |
| Step2 コンシェルジュ起動 | **7** | 7 | 0 | 0 |
| Step3 スクリーンビュー/ページビュー | 1 | 1 | 0 | 0 |
| Step4 購入 | 0 | 0 | 0 | 0 |

- Step1→Step2 完了率 0.88%（放棄率 99.12%）。この窓で vodnavi.jp / site-brand vercel は 0。
- 参考: 過去28日（2026-05-24〜06-20）では page_view 合計 4,305（app 4,276 / vodnavi.jp 17 / moterist.com 6 / www 5 / site-brand 1）、コンシェルジュ起動 30、購入 0。

## 3. 集客・Hostname 識別の監査結果
- **moterist.com の hostName 識別は機能している**（7日で page_view 2 ユーザー、28日で 6 ユーザーが moterist.com hostname として個別計測）。ただし実数は極小で、集客の実体は app.vodnavi.jp（7日で 791/794 = 99.6%）。[[project_moterist_zero_search_inflow]] と整合。
- `?source=moterist` の **source 軸での内訳は本探索（hostName 分割）では未取得**。app 直接流入が 99.6% を占めるため source タグ付き流入は僅少と推定されるが、これは推測であり source×intent の実数は別途取得が必要。

## 4. カスタムイベント（要求3指標）の取得状況
- `ai_session_start`（直近7日間カウント）: **データアクセス要（名前付きイベント実数は未確定）**。
  - 推測 proxy: ファネル step「コンシェルジュ起動」= 7（7日）/ 30（28日）。ただし当該 step の基盤イベント定義を未検証のため、`ai_session_start` の実数と断定しない。
- `product_click`（直近7日間カウント）: **データアクセス要（未取得）**。本ファネルに product_click step は無く、Step4「購入」(=0) は transaction 系で product_click とは別物。
- `source × intent` セッション内訳: **データアクセス要（未取得）**。本探索は hostName 分割であり source/intent クロス表ではない。

## 5. 次のデータ復旧アクション
- イベント名ディメンション × イベント数指標の自由形式 Exploration を新規構築し、`ai_session_start` / `product_click` の named-event 実数を直接取得（本ファネルは保存済資産のため改変しない）。
- source×intent クロス表は別 Exploration で構築（app 直 99.6% の前提で優先度は中）。
- SPA サイレントリダイレクト回避策として Looker Studio 経由の GA4 API 直接結合を検証。
