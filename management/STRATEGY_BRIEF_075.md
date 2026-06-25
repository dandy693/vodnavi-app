---
title: "王道9品番の物理コンポーネント化と Next.js/Tailwind UI 実装定義"
brief_id: STRATEGY_BRIEF_075
created: "2026-06-26"
status: "spec（実装は要 HUMAN 承認 + tsc/next build）"
author: "CSO（原案）/ CTO（ブランド token・Next16 機構の物理是正）"
counterpart: STRATEGY_BRIEF_073_APP_CONCIERGE_LP.md / STRATEGY_BRIEF_074_INTUITIVE_UX_RECONCILED.md
---

# STRATEGY_BRIEF_075 — 王道9品番の物理コンポーネント化

## 1. 目的と背景
BRIEF_073/074 で確定した『官能の図書館』の世界観（ダーク×ゴールド）と「1秒でわかる 3タップ UX」を、`app.vodnavi.jp` の **Next.js（App Router・Next 16）** に物理コンポーネントとして実装する。404 の `h_1724m794g00002` は完全排除し、生存確認済の**王道 9 品番**のみ静的マッピングする。

## 2. 実装仕様（ブランド token 厳守・CTO 是正）
- **カラーは凍結ブランド token のみ（CSO 原案の `slate-950` / `amber-*` は不採用）**:
  - 背景 = `bg-brand-dark`（`--brand-dark: #121212`）。**`slate-950`(#020617) は別色＝不可**。
  - アクセント/ボーダー = `text-brand-gold` / `border-brand-gold`（`--brand-gold: #D4AF37`）。**`amber-400/500`(#fbbf24/#f59e0b) は別色＝不可**。
  - CTA = `.btn-luxury-gold` / `.btn-luxury-outline`。**hex 直書き・Tailwind 任意パレット禁止**、`app-concierge/design-tokens.css §2.1`（凍結・BRAND_DESIGN_GUIDE）を単一情報源とする。
- **UI コンポーネント**:
  - `AgeVerificationModal`: **年齢確認 UI**。承認で `vodnavi_age_verified=1` cookie をセットし、`proxy.ts`（Next16・matcher は `/concierge`・`/api/concierge` のみ）の gate を通過させる。**注: これは「年齢確認」であり「FANZA 早期クッキー着火」とは別物**。後者は CTA クリック時に `buildEarlyCookieURL` / `buildAffiliateURL` 経由で発火する（混同しない）。
  - `ConciergeGrid`: 俗悪表現ゼロ（BRIEF_072 §2 厳守）の 3タップカード UI。第3タップで**王道 9 品番**へ静的分岐。**動的タグ検索は構築しない**（DB に VR/4K 等の属性タグ無し＝BRIEF_074 §3）。

## 3. ガバナンス追跡（CTO 是正）
- **流入元識別**: `?source=` クエリ → `sources.ts` の `ConciergeSource` プロファイル → GA4 カスタムディメンション（`asp_name` / `source` / `intent`）。
- **機構の訂正（training-data 由来の誤りを排除）**:
  - ルート保護は Next16 の **`proxy.ts`** で行う（**`middleware.ts` は使わない・新規作成しない**）。
  - **App Router に `_app.tsx` は存在しない**（Pages Router 専用）。source 値の読取は `/concierge` ルート/レイアウト + 既存 analytics で実施。
- `source=moterist` の実流入は ~ゼロ＝主集客は vodnavi.jp である事実を実装前提に保持（過度な moterist 動線最適化はしない）。

## 4. 実装制約
- **王道 9 品番**: `gkok00002` `snos00233` `savr00978` `mkmp00726` `dvmm00393` `ofje00630` `evis00624` `gqhb00024` `1asex00014`（BRIEF_074 §4）。`h_1724m794g00002` は完全隔離。
- 既存 `/concierge`（`concierge-chat.tsx` + `sources.ts` + `proxy.ts`）を壊さないこと＝本実装は既存ルートの**置換 or 前段**かを着手前に CTO 設計確定。
- 実装・本番反映は要 HUMAN 承認（`npx tsc --noEmit` exit0 + `npm run build` exit0 + 本番 curl）。
