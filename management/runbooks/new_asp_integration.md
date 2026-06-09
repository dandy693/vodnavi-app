# RUNBOOK: 新規 ASP / マネタイズ API 追加（DMM TV / U-NEXT 等）

**由来**: T-20260609-02 / BRIEF_054（env スコープ）・BRIEF_055（疎通検証ゲート）・BRIEF_058（スコープ役割・プロジェクト分離）
**対象**: `vodnavi-app`（app-concierge）/ 必要時 `site-brand`
**最終更新**: 2026-06-10

> 2026-06-09〜10 に Preview FANZA 未設定・本番 FANZA 400・AI チャット invalid x-api-key が連続発生した教訓を、新規 ASP 追加時に**構造的に再発させない**ためのチェックリスト。各項目は landed 前の必須ゲート。

## 1. 環境変数スコープ（BRIEF_054 §2 — 必須ゲート）

- [ ] **サーバー側 fetch 用シークレット**（`*_API_ID` / `*_API_KEY` / `*_AFFILIATE_ID` 等）は Vercel の **Production / Preview / Development の 3 スコープすべて**を有効化する。1 つでも欠けると当該環境で `getCredentials` 相当が throw またはプロバイダが 4xx を返し窒息する。
  - 検証: `vercel env ls` で当該変数の `environments` 列に `Production, Preview` および `Development` が揃うこと。
- [ ] **計測タグ系**（`NEXT_PUBLIC_GA_*` / `GTM` 等）は §2.4 カーブアウト対象＝ Preview へ強制バインドしない（`NODE_ENV!=="production"` ガード + CPU 防衛 noindex で Preview 隔離を維持）。
- [ ] **値（Value）の妥当性**を bind 後に必ず実測（§3 ゲート）。bind 済でも値が失効/タイポなら 4xx になる（2026-06-10 の ANTHROPIC_API_KEY / DMM_API_ID 失効が実例）。
- [ ] シークレット書込みは **HUMAN の Dashboard 操作**（auto-CTO の `--value <secret>` は classifier deny — `reference_vercel_env_secret_write_blocked`）。

## 2. プロジェクト分離・アフィリエイト ID（BRIEF_058）

- [ ] 変数名はモノレポ共通でも、**値はプロジェクト/用途ごとに分離**（3-ID: 001=集客 / 004=成約 / 990=データ）。
- [ ] **どの af_id が実際にユーザー向け URL に出るか**を本番 curl で実測（T-20260609-06 の手順）。API が返す `affiliateURL` は API 認証 ID（`DMM_AFFILIATE_ID`）を埋め込むため、`NEXT_PUBLIC_*_AFFILIATE_ID` を別 ID にしても **API 由来リンクは API 認証 ID のまま**になる点に注意。意図した成約 ID が出ているか検証する。
- [ ] clean 面（`vodnavi.jp` / site-brand）には**成人 ASP の af_id / アフィリエイトリンクを出さない**（BRIEF_037 clean 境界）。`curl https://vodnavi.jp/ | grep af_id` が 0 件であること。

## 3. 疎通検証ゲート（BRIEF_055 — landed 前必須）

- [ ] `scripts/healthcheck-api.mjs`（T-20260609-03）を本番に対して実行し **PASS**を確認。新 ASP のエンドポイントもこのスクリプトに probe を追加する。
- [ ] 新 ASP 経路で `tsc --noEmit` 0 / `next build` 0。
- [ ] エラー時に **raw プロバイダメッセージをユーザー UI に漏らさない**（route の `onError` で友好的文面へ握り潰す。`/api/concierge` の `conciergeErrorText` を範とする）。
- [ ] サーバー例外は `logFanzaSilentDeath` 相当で **本番のみ構造化ログ**（Vercel Logs）、ユーザー到達は GA4 `*_surface_error`（`ErrorTelemetry` を範とする）で二層可観測化。

## 4. デプロイ後 verify

- [ ] Production redeploy 後、§3 のヘルスチェック再実行。
- [ ] Preview は SSO(401) で直 curl 不可 → `vercel env ls` のスコープ確認 + HUMAN のログイン済ブラウザ目視。
- [ ] ALERTS は実測 verify 後にのみ `resolved` へ（`feedback_verify_before_resolving_alerts`）。
