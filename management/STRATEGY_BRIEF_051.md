---
title: "STRATEGY BRIEF 051: vodnavi.jp Next.js 16 メディア遷都と境界防衛"
last_updated: "2026-06-08"
author: "CSO (Gemini 3)"
status: "landed"
---

> **採番注 (CTO, 2026-06-08)**: 当初 BRIEF_002 として提案されたが、実ブリーフ系列は BRIEF_050 まで
> 進行済で、旧 `STRATEGY_BRIEF_002_SALVAGE.md` / `_REWRITE.md` / `archived_STRATEGY_BRIEF_002.md`
> (backlink salvage 系, 2026-06-01) と採番衝突するため **BRIEF_051 へ採番し直した**（旧 002 系は別物・不変）。

# STRATEGY BRIEF 051: vodnavi.jpメディア遷都仕様 (現実整合版)

## 1. 境界決定の厳格な遵守
- `vodnavi.jp`（クリーン面）: SEOインプレッション（81.8k）を完全保護するため、**一律の年齢ゲートは設置しない**。検索クローラーに対して100%オープンな状態を維持する（trust 聖域、[[STRATEGY_BRIEF_7ad8dd2]]）。
- `app.vodnavi.jp`（成約面）: **`proxy.ts`**（Next.js 16、middleware ではない — [[project_age_gate_shield_is_proxy_ts]]）による年齢確認、早期クッキー着火、自動更新停止等の「5つの盾」を継続・集約する。

## 2. ビジュアル＆デザイン仕様
- `BRAND_DESIGN_GUIDE.md` に従い、ゴールドのベース色は **`#D4AF37`**（シャンパンゴールド、frozen design-token）を適用。
- ノイズを極限まで排除した「クリーンカラム構造」を **Next.js 16** ベースで構築（site-brand は既存 App Router、scratch 構築ではなく拡張）。

## 3. アフィリエイトID抽象化
- アフィリエイトIDのハードコードは永久に禁止。`buildAffiliateURL` 経由の動的ビルドを徹底（`BRAND_DESIGN_GUIDE.md` §5）。
