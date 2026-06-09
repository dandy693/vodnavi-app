# STRATEGY BRIEF 058: Vercelスコープ（Prod/Dev/Preview）の役割定義とプロジェクト分離規約

- **ステータス**: APPROVED (CSO 策定 / インフラガバナンス)
- **策定日**: 2026-06-09
- **対象ドメイン**: *.vodnavi.jp (全域)
- **関連**: `STRATEGY_BRIEF_053`〜`057`（env 同期・検証ゲート・監視）/ T-20260609-01（Preview 未バインドの originating fix）
- **採番注**: 元 CSO script は BRIEF_059 を指定したが、現最大は 057 のため空き番号 **058** を採用（[[feedback_cso_brief_number_collision]]）。

## 1. 目的と結論

Vercel における `Production`（本番）および `Development`（ローカル開発）は、どちらも運用の継続および安全な検証のために削除不可（双方必須）である。ドメイン別（メディア/アプリ）のアフィリエイト ID の分離は、1 つのプロジェクト内のスコープ切り替えではなく、Vercel の「プロジェクト単位のカプセル化」によって物理実現する。

## 2. インフラ配置要件（遵守ルール）

1. **全スコープ全点灯の継続**:
   - `DMM_API_ID` / `DMM_AFFILIATE_ID` を**配備するプロジェクトでは**、Production / Preview / Development の 3 スコープすべてを有効化すること（localhost / Preview の窒息防止）。**注**: FANZA/DMM API を実際に呼ぶのは `vodnavi-app`（app-concierge）。`site-brand`（clean メディア）は FANZA API を呼ばない構成なら `DMM_*` 自体が不要 — 不要なプロジェクトへ cred を撒かない（BRIEF_037 clean 境界 + cred sprawl 回避）。
2. **プロジェクト間での値のアイソレーション**:
   - 変数名（`DMM_AFFILIATE_ID`）はモノレポ共通ライブラリの整合性のために同一とするが、Vercel Dashboard 上で入力する実際の「値（Value）」をプロジェクトごとに物理的に分けること（既存 3-ID 並列識別: 001=集客 / 004=成約 / 990=データ と整合）。

## 3. 監査ゲート

- 本設定変更に伴い、CTO は次期デプロイ時に各ドメインから出力されるアフィリエイトリンクのパラメータが、意図した ID（media 用 / app 用）に正しくマッピングされているかを目視または自動テストで検証すること。

## 4. 境界（BRIEF_037 堅持）

moterist.com 完全凍結・5記事 SEO 永久保護・clean面/成人導線の境界は不変。本規約は env スコープ配置のガバナンスに閉じる。
