# STRATEGY BRIEF 053: Vercel Preview 環境における FANZA API 認証情報の安全同期

- **ステータス**: DRAFT (HUMAN/CTO 承認待ち)
- **起票日**: 2026-06-09
- **対象**: Vercel project `vodnavi-app` の Preview / Development スコープ（本番 Production スコープは設定済・影響外）
- **関連**: TASK_BOARD `T-20260609-01` / ALERTS `2026-06-09 11:40 JST` エントリ

## 1. 物理事象と背景

Vercel の Preview Environment において、FANZA API の認証情報（`DMM_API_ID` / `DMM_AFFILIATE_ID`）がバインドされていないため、開発・検証用ホスト（`*.vercel.app`）へのアクセス時にシステム警告（`image_6dd163.png`）が発生している。

- 本番環境（`app.vodnavi.jp` / Production スコープ）は既に設定済で正常描画・成約動線健全。
- コードは例外を安全に catch して graceful hide／警告表示しており、**コード崩壊ではない**。

## 2. 執行ランブック（CTO/HUMAN 向け手順）

> 実行には Vercel プロジェクト権限が必要。auto Claude 単独では完了不可、HUMAN/CTO の手動アクション。

1. Vercel Dashboard ＞ `vodnavi-app` プロジェクト ＞ `Settings` ＞ `Environment Variables` へアクセス。
2. `DMM_API_ID` および `DMM_AFFILIATE_ID` の編集画面を開く。
3. `Preview` および `Development` スコープのチェックボックスを有効化し、保存する（または `vercel env pull .env.preview.local --environment=preview` で Development へ同期）。
4. 該当の開発環境ブランチ、または最新の Preview デプロイメントを `Redeploy`（Rebuild）する。
5. Preview host で警告表示が消失し、API データが正常に fetch されていることを curl／目視で verify。
6. verify 完了後、ALERTS `2026-06-09 11:40` エントリの `status` を `resolved` へ flip し、`T-20260609-01` を `[x]` に更新。

## 3. 境界（BRIEF_037 堅持）

本件は Preview 環境の開発体験の問題に閉じる。moterist.com 完全凍結・5記事 SEO 永久保護・`?source=moterist` 動線・本番成約能力はいずれも本件と無関係で不変。clean 面（vodnavi.jp）／成人導線（app.vodnavi.jp 年齢ゲート）の境界も変更しない。
