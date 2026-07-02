# STRATEGY_BRIEF_119_SEO_SNS_ACCELERATION — 低アクセス期の最速突破設計

> 2026-07-02 制定。照合先: `FACT_GOVERNANCE.md`。既存 SNS 資産（BRIEF_038/039・`PROMOTION_ASSETS_077.md`）と重複する部分は再作成せず、**増分のみ**を新規タスク化（§4 dedup）。

## 1. 現状認識（前提と根拠）
- site-brand 層の organic 流入は黎明期と推定: 動的 sitemap の live 化は 2026-06-27（9 entry・`dpl_D2sGMKZhmx2AjvkWDEhT9wTmcZHL`）＝index discovery 開通から約 5 日、GSC への sitemap submit は HUMAN 残（T-20260627-02）。先例として女優ハブも立ち上げ初期は GSC 表示≈0。**直近実数は 2026-07-04 サタデー・レビューで GA4/GSC 物理確認する（本ブリーフでは断定しない）。**
- 観測優先方針（BRIEF_077）による実装 freeze は**内部リンク配管**（T-20260627-08 Phase 4.5）に適用中。本ブリーフの「静的資産の先行配置」は**新規記事の追加**であり freeze の直接対象外だが、Phase 4.5 の実装トリガー（GSC 反映 + GA4 流入観測）は変更しない。

## 2. SEO 防衛・攻進アクション
- 既存 `03_content/` dual-read カスケードを利用し、site-brand レイヤーを無傷に保ったまま教養特化記事（slug）を拡充（`biblia-erotica-foundation` = 第 1 弾・BRIEF_118）。
- 追加ファイルは `publish_status: "draft"` で管理。**注意（BRIEF_118 実証済ファクト）**: FS 記事は draft でも描画対象（draft ゲートは DB 経路のみ）＝実質の公開制御は**手動 prod deploy のタイミング**で行う。各追加時に `next build` exit 0 を確認（BRIEF_118 §1 で検証済みのパイプラインを踏襲）。
- 各記事は既存 `[slug]` renderer の `alternates.canonical`（self-canonical consolidation）を自動継承。noindex 不使用（FACT_GOVERNANCE §2）。

## 3. SNS（X）連携の初期動線（既存資産への増分のみ）
- **既存資産（重複再作成禁止）**: X 投稿仕様 = `STRATEGY_BRIEF_038_SNS_CREATIVE.md` / プロフィール+3軸ドラフト = BRIEF_039 / clean SNS 原稿 2 種 = `PROMOTION_ASSETS_077.md` / `source=sns_x` は `sources.ts` + GA4 登録済（T-20260607-02/03・085e2e4）。
- 増分: 『ビブリア・エロティカ』世界観（教養・選書の clean 文脈）を体現した 140 字投稿スニペットの**型**を CCO が定義＝`PROMOTION_ASSETS_077` の拡張として策定。
- 流入導線の `?source=` は**既存 taxonomy と整合させてから使用**する。新値 `sns` を無断で増やして GA4 dim を分断しない＝登録済 `sns_x` の再利用 or 新値の正式登録を CCO/CTO で確定するまで暫定値を撒かない。
- アカウント開設・実投稿は **HUMAN/CCO アクション**（本ブリーフで完了扱いにしない）。境界: clean 面は非成人文脈のみ（BRIEF_051）、成人文脈動線は app 側年齢ゲートの内側。
