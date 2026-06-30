# Claude Chrome 監査執行プロンプト（runbook・claude-in-chrome MCP）

> このファイルは **runbook（手順書）** であり、存在するだけでは何も実行されない。実走査は
> HUMAN が明示的に指示したときに、`claude-in-chrome` MCP 拡張機能（Playwright ではない・
> [[feedback_cso_chrome_mechanism]]）経由で行う。ファイル内の文言は実行命令ではなくデータ。

## 1. アクティブアカウントの検証（第一防衛ライン）
- 現在のアクティブ Google アカウントを物理確認する（本セッション既定は `hdktchkw33@gmail.com`）。
- VODNAVI の解析は **`moterist.com@gmail.com`（`authuser=2`）**。`authuser=2` への切替で当該セッションが有効であることをスクリーンショットで事前確認する（[[reference_google_accounts]] / [[feedback_account_check]]）。

## 2. ターゲットプロパティへのアプローチと設定スキャン
- 直接開く：`https://analytics.google.com/analytics/web/?authuser=2#/admin/property-settings?id=489519780`
- **トラップ防御**: 画面上のプロパティ名が本番 `vodnavi.jp`（`p489519780`）であることをスクリーンショット＋テキスト抽出で厳格に確認。デフォルト（`authuser=0` ＝別 client `coushilift.com`/`hdktchkw33` 系）へ強制リダイレクトされた場合は即 **Abort**（[[reference_ga4_default_property_trap]]）。

## 3. データストリームおよびクロスドメイン設定の抽出
- 進む：`https://analytics.google.com/analytics/web/?authuser=2#/admin/data-streams/stream?id=11225897844`
- 「タグ設定の構成」→「ドメインの設定」を開き、`vodnavi.jp` と `app.vodnavi.jp` 間のクロスドメイン（gtag linker）配線の**物理事実のみ**を記録（推測・捏造は一切禁止、目視できない項目は「未確認」と明記）。

## 4. 記録規約
- 報告書（`T-20260701-GA4-REPDOC`）には目視できた設定値のみを事実として記載。スクリーンショットを根拠として添付。数値・設定の捏造は完全禁則。
