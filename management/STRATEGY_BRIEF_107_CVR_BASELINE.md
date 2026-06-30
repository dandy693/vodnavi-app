# STRATEGY BRIEF 107 — DMM/FANZA 成約ベースライン検証とボットフィルタ設計（ALERTS resolved 項目の残作業）

## 0. 前提の訂正（物理事実・ALERTS 整合）
- 本件 ALERTS エントリは **2026-06-28 に `[resolved]`** 済み（`ALERTS.md` 行560-583「DMM クリック増・成約0 の報告（GA4 実査で確定・アプリ側健全）」）。GA4 実査で **アプリ/GA4 側は 100% 健全＝コード修正は一切不要**と確定済み。よって本ブリーフは新規 severity:medium 異常ではなく、**resolved 項目の唯一の残作業**を定義する。
- 「408 クリック（6/25-27, 27日221）」は **CSO 報告・DMM dashboard `image_fbeeb6.jpg` 由来・CTO 未提示/未検証**の数値（行567）。GA4 物理計測は同期間 outbound click **最大23件**（`ai_affiliate_click` 23 / `product_click` 23 / `click` 22）＝DMM「408」は GA4 実測の**約18倍乖離**（[[reference_app_ga4_event_taxonomy]]）。408 を確定事実として扱わない。
- 残作業は **DMM 側「408」の定義（impression 等の可能性）を GA4 ファクトと突合する DMM 側確認のみ**（行583）。コード（middleware/env）起因説は本セッションで物理反証済み。

## 1. 目的
resolved 済み「DMM クリック増・成約0」の残作業として、H-3（bot/低intent クリック）と H-4（成約0 は従来からの ¥0 購入 CVR ベースライン、[[project_ga4_user_behavior_baseline]]）を物理データで検証・隔離し、DMM「408」の定義差を確定する。コード欠陥（env漏れ）説は既に物理反証済みのため対象外。

## 2. 不変条件および防衛策
- **計測整合性の監視**:
  - GA4 `product_click`/`ai_affiliate_click` の生件数（最大23）と DMM 管理画面クリック数（408）の乖離（約18倍）を、**定義差（impression 等）と bot/低intent を分離して**追跡する。乖離＝即障害ではない。
- **SEO・インデックス不変条件**:
  - 本検証で発生する如何なるパラメータ付きURLにも `STRATEGY_BRIEF_101` の self-canonical consolidation を強制適用し、`noindex` によるシグナル分散を禁止する。
