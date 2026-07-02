# STRATEGY_BRIEF_118_BRAND_MEDIA_EXPANSION — 2ドメイン要塞化の新章

> 2026-07-02 制定。`biblia-erotica-foundation` 記事 landed（board `T-20260702-BIBLIA` / commit `30c79c5` / origin 同期済）を起点とする site-brand メディア拡充の設計。FACT_GOVERNANCE 準拠（clean 面 = 非成人 trust 聖域・BRIEF_051 / `proxy.ts` 3機構分離）。

## 1. 物理アセット接続（Next.js 16 SSG の検証）
- ✅ **検証済（2026-07-02 CTO 物理ビルド実証）**: `site-brand` で local `next build`（Next.js 16.2.6）を実行＝**exit 0・静的 25/25 生成・エラー/警告/スロットル 0 件**。route table で `/[slug]` は `●`(SSG)、`.next/server/app/biblia-erotica-foundation.{html,meta,rsc}` の物理エミットを確認。エミット HTML 内に正タイトル・`<link rel="canonical" href="https://vodnavi.jp/biblia-erotica-foundation">`・教養本文を確認、not-found 描画でないこと（sentinel 0 件）も確認。`genres/[slug]` 等は `ƒ`(dynamic)＝ビルド時 DMM fan-out なし（ローカル IP スロットルの懸念は非該当）。
- 期待される静的ルート: `vodnavi.jp/biblia-erotica-foundation`（clean 層は auto-deploy されないため live 化は手動 prod deploy 後）。

## 2. 年齢確認ガード（app-concierge/src/proxy.ts）のルーティング監査
- `site-brand` から送客されたユーザー（`?source=brand&intent=wisdom`）が着地する `/concierge` パスは**パススルー**（`NextResponse.next()`・`_gl` 着地は `[GL_TRACKING]` console log のみ）される仕様であることを確認済み＝403 壁には衝突しない。
- ゲートの制限対象は `/api/concierge/*`（cookie `vodnavi_age_verified` 未通過で 403、2026-07-02 curl 実証済）。この API 経路の 403／provider エラー発生時、raw なエラーを露出させず友好的な文言へ変調するヘルパー（例: `conciergeErrorText`）が実在するか否かを含め、エラー文言制御ロジックのソースコードを次期フェーズで物理監査する（**現時点では存在未確認**）。

## 3. 次期サタデー・レビュー（2026-07-04 予定）への申し送り
- 凍結された `moterist.com` からの流入（`?source=moterist`）と、新設された `site-brand` からの流入（`?source=brand`）のセッション比率をホスト名（Hostname）単位で識別する（既存 Funnel Exploration の hostName fork を流用）。moterist 完全遷都は gated（`T-20260628-11`）＝本ブリーフでは既成事実化しない。
