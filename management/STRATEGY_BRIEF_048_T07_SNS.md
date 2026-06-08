# STRATEGY_BRIEF_048 — app.vodnavi.jp SNS専用ランディング LP (T-07) 実装記録

発行: 2026-06-07 / 採番: 047 の次 = **048** / board: T-20260607-07 / 前提: BRIEF_037/043（X/SNS → app 集中）

## 1. 目的
X（SNS）から `?source=sns_x&intent=*` で流入したトラフィックを `app.vodnavi.jp` で受け止め、クエリを無損失で `/concierge` へ引き継ぐ専用 LP（BRIEF_038/039 の SNS 動線の着地点）。

## 2. 実装（`app-concierge/src/app/lp/page.tsx`）
- **route**: `/lp`（`searchParams` 使用のため dynamic `ƒ`）。
- **source/intent 透過**: `source` 既定 `sns_x`、`intent` は `^[a-zA-Z_]{1,24}$` で validate のうえ透過。CTA → `/concierge?source=…&intent=…`（`URLSearchParams` で組み立て、欠損は付与しない）。
- **年齢確認連動**: LP 自体はゲートしない（`proxy.ts` の matcher は `/lp` を含まない＝pass-through）。年齢確認は `/concierge` 側の既存フロー（client モーダル `ConciergeGate` + `proxy.ts` の API 403）が担保。BRIEF_044 の非対称ガード設計と整合。
- **intent 別リード文**: beginner / actress / discount / wisdom に応じた hero コピー（既定あり）。
- **意匠**: `design-tokens.css` / `brand-*` / `font-luxury-*` / `.btn-luxury-gold` / pulse-gold を継承。hardcoded hex なし（radial グラデーションの rgba のみ既存ページと同様）。`robots: { index: false }`（SNS 着地専用、検索インデックス不要）。「18 歳以上対象・広告（FANZA 等）を含む」表記。

## 3. QA（物理検証）
- `tsc --noEmit` **exit 0** / `next build` **exit 0**（`/lp` = `ƒ` dynamic、全 15 ルート生成成功）。

→ **T-20260607-07 完了。W26（T-05 proxy.ts 監査 / T-06 メディア Approach A + 負債解消 / T-07 SNS LP）全完了。**
