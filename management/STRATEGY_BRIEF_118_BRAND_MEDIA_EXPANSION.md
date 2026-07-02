# STRATEGY_BRIEF_118_BRAND_MEDIA_EXPANSION — 2ドメイン要塞化の新章

> 2026-07-02 制定。`biblia-erotica-foundation` 記事 landed（board `T-20260702-BIBLIA` / commit `30c79c5` / origin 同期済）を起点とする site-brand メディア拡充の設計。FACT_GOVERNANCE 準拠（clean 面 = 非成人 trust 聖域・BRIEF_051 / `proxy.ts` 3機構分離）。

## 1. 物理アセット接続（Next.js 16 SSG の検証）
- 本日 landed した `biblia-erotica-foundation` を、`site-brand` の `generateStaticParams`（`03_content` のディレクトリ名を slug 化）が正しく検知しているかビルドテストで検証する。ディレクトリ検知はローカル `ls` で確認済だが、実 `next build`／SSG 出力は未検証。
- 期待される静的ルート: `vodnavi.jp/biblia-erotica-foundation`（clean 層は auto-deploy されないため live 化は手動 prod deploy 後）。

## 2. 年齢確認ガード（app-concierge/src/proxy.ts）のルーティング監査
- `site-brand` から送客されたユーザー（`?source=brand&intent=wisdom`）が着地する `/concierge` パスは**パススルー**（`NextResponse.next()`・`_gl` 着地は `[GL_TRACKING]` console log のみ）される仕様であることを確認済み＝403 壁には衝突しない。
- ゲートの制限対象は `/api/concierge/*`（cookie `vodnavi_age_verified` 未通過で 403、2026-07-02 curl 実証済）。この API 経路の 403／provider エラー発生時、raw なエラーを露出させず友好的な文言へ変調するヘルパー（例: `conciergeErrorText`）が実在するか否かを含め、エラー文言制御ロジックのソースコードを次期フェーズで物理監査する（**現時点では存在未確認**）。

## 3. 次期サタデー・レビュー（2026-07-04 予定）への申し送り
- 凍結された `moterist.com` からの流入（`?source=moterist`）と、新設された `site-brand` からの流入（`?source=brand`）のセッション比率をホスト名（Hostname）単位で識別する（既存 Funnel Exploration の hostName fork を流用）。moterist 完全遷都は gated（`T-20260628-11`）＝本ブリーフでは既成事実化しない。
