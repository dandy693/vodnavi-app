# STRATEGY_BRIEF_040 — 早期クッキー着火動線の抽象化とインテント別配線仕様

発行: 2026-06-07 / 採番: 039 の次 = **040**（CSO 原案の "041" は 040 を飛ばしていたため訂正）/ board: T-20260607-04
既存実装の参照: `app-concierge/src/lib/analytics.ts`（`trackEarlyCookieBurn`）/ `concierge-chat.tsx`（早期クッキー着火カード）/ `OPERATION_MANUAL.md §4b`

## 1. 目的
24時間で失効する FANZA アフィリエイト Cookie の特性を踏まえ、コンシェルジュが最終成約カードを出す前段（会話初手）の高熱量タイミングで「クッキーの早期着火（初期踏ませ）」を完了させ、成果ロストを構造的に抑える。

## 2. コア仕様
- **発火トリガー**: `source=sns_x` 等の流入後、初手インテント（`beginner` / `actress` / `discount` / null）が確定した瞬間。
- **既存実体**: `trackEarlyCookieBurn`（`analytics.ts`、`early_cookie_burn` イベント送出）+ `concierge-chat.tsx` の早期クッキー着火カード。**注**: `buildEarlyCookieURL` という builder は現状**未存在** — 着火 URL 構築の builder 層抽象化は本ブリーフで新規 design する対象。
- **UI**: `#121212` 背景に `#D4AF37`（シャンパンゴールド）アウトラインボタン（`design-tokens.css` の `--brand-dark` / `--brand-gold`、`.btn-luxury-outline` を使用しハードコード hex は避ける）。煽り表現は禁止。

## 3. インテント別中間動線マッピング
1. `beginner` → 大人のための初心者ラインナップ特集
2. `actress` → 今夜の主役を選ぶサンプル動画一覧
3. `discount` → 期間限定 24h タイムセール特集
4. null → 最新ジャンル別新着ランキング

> taxonomy 注: 登録済 intent は `beginner / actress / discount`（+ null）。`wisdom`（BRIEF_039）を使う場合は別途 GA4 値追加。本ブリーフは登録済値のみ使用。

## 4. ガバナンス防衛
- アフィリエイトマスターID の直書きは永久禁止。必ず env からビルダ層（`url-builder.ts` の `resolveAffiliateId` 系）へ動的結合する。
- 本番計測タグ汚染防止: `NODE_ENV !== "production"` では本番 GA4 プロパティ（`G-GG7JV9MJRW`）への送信をバイパス（既設の localhost `ga-disable-*` 盾と整合）。

## 5. 実装の前提（CTO）
`app-concierge/AGENTS.md` の Next.js 注意（`node_modules/next/dist/docs/` のガイド確認）に従い、builder 抽象化・カード分岐の実装前に現行 API を確認する。実装は build verify（`tsc --noEmit` + `next build`）通過を完了条件とする。
