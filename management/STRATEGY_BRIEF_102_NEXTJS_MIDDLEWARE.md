# STRATEGY BRIEF 102 — Next.js メディア構築および年齢確認ガード（proxy.ts）統合戦略

## 1. 目的
`vodnavi.jp` の Next.js 化、および `app.vodnavi.jp` における年齢確認サーバーガード（Next.js 16 規約の `proxy.ts`・旧 `middleware.ts` 後継）の厳格な統合により、ユーザーエンゲージメント向上と法的防衛ライン（**4つの盾**＝年齢確認モーダル / #PR コンプラ表記 / ブランドガイド / `buildAffiliateURL`）の双方を最大化する。

## 2. 開発・実装方針
- **Next.js メディア構築 (`vodnavi.jp`)**:
  - 『ビブリア・エロティカ』の世界観（ダーク×ゴールド、高級・知性）を design-tokens / Tailwind CSS で具現化（hardcoded hex を排し canonical 値へ整合）。
  - 既存のSEO資産（URL構造）を1ミリも破壊しない静的ルーティング/ISR設計。
- **年齢確認ガード統合 (`app.vodnavi.jp`)**:
  - 実装ファイルは **`app-concierge/src/proxy.ts`**（Next.js 16 規約）。`src/middleware.ts` の新規作成は禁止（旧名称への先祖返り防止）。
  - ページルート（`/concierge[/...]`）はクローラを含め常にパススルー＝self-canonical consolidation を妨げず**クローキングを発生させない**。API ルート（`/api/concierge/*`）は年齢確認クッキー（`vodnavi_age_verified=1`・host-only `app.vodnavi.jp`）未通過で **403**。
  - **注（混同禁止）**: 上記「年齢確認クッキー」（`proxy.ts` が検査）と、FANZA アフィリエイト動線の「早期クッキー着火」（`buildEarlyCookieURL` / `af_id`）は**別機構**として分離設計する。
