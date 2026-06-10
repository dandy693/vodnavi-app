---
title: "STRATEGY BRIEF 059 — インデックス未登録1,401ページ奪還計画（独自テキスト解放 + 旧WP残骸410パージ）"
date: "2026-06-10"
author: "CSO (Gemini 3) / 採番・整合修正 CTO"
status: "draft_for_audit"
target_domain: "app.vodnavi.jp / vodnavi.jp"
freeze_domain: "moterist.com (完全現状維持保護)"
supersedes: "なし（新規）"
related: "STRATEGY_BRIEF_IG_2026-05-21_CRAWLED_NOT_INDEXED.md / project_gsc_search_intent_title_dominant"
---

# STRATEGY BRIEF 059

> **採番注 (CTO 2026-06-10)**: CSO 原案は本ブリーフを `STRATEGY_BRIEF_003_INDEXING_FORTRESS` と命名していたが、
> 既存最新は **058**（003/003_BUGFIX/003_CONTENT/003_INFRA は別物として実在）。番号逆行による履歴混乱を避けるため
> 次の空き番号 **059** に採番修正した（[[feedback_cso_brief_number_collision]] 準拠）。

## 1. 現状の物理ファクトおよび機会損失（診断）
Search Console 上で「インデックス未登録 1,401 ページ」が記録されている（インデックス済 2,500）。
ハルシネーションを排除するため、まず URL 内訳が「コンテンツ不足（works）」か「旧 WP の負債残骸（/archives/ 等）」かを
`audit-gsc-unregistered.ts` で正確に仕分ける。moterist.com は完全凍結（Freeze）を維持し、
app.vodnavi.jp / vodnavi.jp の Next.js モノレポ内部のみに防衛線を構築する。

**関連知見 (2026-06-10 GSC 検索意図分析)**: 検索流入の約95%は作品タイトル/品番のナビ検索で、
個別作品ページが既に捕捉している。女優/ジャンル/情報比較系は未捕捉。未登録 1,401 の多くが薄い works ページであれば、
「量産で奪還」ではなく「独自テキスト(Information Gain)で価値付与 → 再評価」が筋（[[project_gsc_search_intent_title_dominant]]）。

## 2. 執行順序（ロードマップ）
1. **フェーズ1（即時実行）**: 未登録 URL の物理監査スクリプト配置（本コミットで landed）と GSC 生データの突合。
   - 前提: GSC「ページ」レポートから未登録 URL を CSV エクスポート（HUMAN/CTO）→ `auditUrls()` で内訳比率を確定。
2. **フェーズ2**: 内訳比率に基づき分岐執行。
   - works が多数 → CCO レビューパイプライン（`generate-work-reviews.ts`）の実 API コール解放で独自テキスト付与。
   - /archives/ 残骸が多数 → `site-brand/next.config.ts` への 410/301 ルーティング実装。
3. **フェーズ3**: サタデー・レビューでの定量的効果検証（再登録ページ数の推移）。

## 3. ガード
- moterist.com 5記事 SEO インデックスは永久保護（[[project_moterist_mass_overwrite_plan]]）。
- 薄いページの新規量産は未登録を増やすだけなので不可。質（独自テキスト + 内部リンク）を担保。
- secret/env 書込み・本番 redeploy は HUMAN アクション（[[reference_vercel_env_secret_write_blocked]]）。
