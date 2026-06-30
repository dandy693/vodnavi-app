# STRATEGY BRIEF 112 — Chrome 連携（claude-in-chrome MCP）による GA4 設定の物理目視監査要件

## 0. 機構の訂正（事実誤認の排除）
- 本プロジェクトの「Chrome 連携」は **claude-in-chrome MCP 拡張機能経由**であり、**Playwright / Puppeteer / remote-debug / headless ではない**（[[feedback_cso_chrome_mechanism]]）。本ブリーフの全手順は claude-in-chrome MCP（ユーザーの実 Chrome の認証済セッションを利用）を前提とする。

## 1. 目的
Chrome 連携（claude-in-chrome MCP）での GA4 設定目視確認の方針に基づき、本番 GA4 プロパティ（`p489519780`）の設定実態を正確に目視スクリーニングし、ハルシネーションを排除したファクト元帳を作成する。

## 2. 物理走査対象と認証規約
- **ターゲットURL**:
  - `https://analytics.google.com/analytics/web/?authuser=2#/admin/property-settings?id=489519780`（プロパティ設定画面）
  - `https://analytics.google.com/analytics/web/?authuser=2#/admin/data-streams/stream?id=11225897844`（データストリーム詳細・タグ設定・クロスドメイン）
- **監査時の不変条件（account guard）**:
  - **`authuser=2`（`moterist.com@gmail.com` ＝ VODNAVI 解析アカウント）**の認証セッションが有効であることを claude-in-chrome のスクリーンショットで**事前に物理確認**せよ（[[reference_google_accounts]] / [[feedback_account_check]]）。
  - デフォルトアカウント（`authuser=0` ＝ 別 client `coushilift.com` / `hdktchkw33` 系）の他社情報への誤接続を検知した場合は即座に Abort（[[reference_ga4_default_property_trap]]）。
  - 数値のブレ要因識別のため、ホスト名（hostname）別セッション内訳の自由形式探索レポート画面まで進めてキャプチャを記録せよ。

## 3. 実行と記録の規約
- 本ブリーフは**要件定義**であり、実走査（claude-in-chrome 起動・GA4 ログイン済セッション利用）は HUMAN の明示実行指示があった時に行う。実行前に必ずアクティブ Google アカウントを再確認する（[[feedback_account_check]]）。
- 報告書は**目視できた設定値のみ**を事実として記載し、目視できなかった項目は「未確認」と明記する（推測・捏造の完全禁則）。
