---
title: "/works/* 年齢ゲート裁定 — クロールセーフJSオーバーレイ採用（既存実装の批准）"
brief_id: "081"
last_updated: "2026-06-28"
status: "ratified"
decision: "crawl-safe JS overlay（SSR 200 全員 + client側モーダル）。403クロークは棄却。"
implementation_status: "ALREADY SHIPPED（新規実装不要・物理検証済）"
---

# STRATEGY_BRIEF_081: /works/* 年齢ゲート裁定

> 経緯: CSO script は「`/works/*` をユーザー403で遮断 / Googlebot は通過」（クローキング）を
> 当初要求（BRIEF_080）。これは①オーガニック流入100%の着地点を自壊②cloaking=デインデックス
> リスク③正典は proxy.ts（works は意図的非ゲート）の3点で棄却。HUMAN 裁定で
> **「クロールセーフJSオーバーレイ」**を採用。本ブリーフはその裁定を記録する。

## 1. 決定（2026-06-28 HUMAN 裁定）
`/works/*` の年齢確認は **SSR では一切遮断せず（Googlebot/ユーザーとも HTTP 200・素のHTML）**、
**ハイドレーション後のクライアント側モーダル**でのみ担保する。403クローク方式は採用しない。

| 案 | 判定 |
|---|---|
| 403クロークゲート（user403 / bot200） | **棄却**（cloaking=規約違反・全面デインデックス risk、集客エンジン自壊） |
| **クロールセーフJSオーバーレイ** | **採用** |
| ゲートなし | 不採用（BRAND_DESIGN_GUIDE §3 リーガル盾要件を満たさない） |

## 2. 重要: 実装は既に存在し本番稼働中（新規実装不要）
裁定された方式は **既にコードベース（main）に実装・マウント済み**で、新規実装は発生しない
（verify-before-act：捏造的「実装した」を作らない）。

- **コンポーネント**: `app-concierge/src/components/age-gate-overlay.tsx`（`AgeGateOverlay`）。
  - `"use client"`、`useSyncExternalStore` の server snapshot=false で **SSR 非描画**＝クローラは本文を素で受領。
  - ハイドレーション後 `document.cookie` の `vodnavi_age_verified=1` を確認、未通過なら全画面ロック
    （`body overflow:hidden`）＋ゴールド×ダーク `#121212` のブランドモーダル。
  - 「はい」→ `POST /api/age-gate` で cookie 発行→即アンマウント。「いいえ」→ google.com 退出。
  - 計測 `age_gate_view` / `age_gate_agree` / `age_gate_bounce` 発火。
- **マウント**: `app-concierge/src/app/(site)/layout.tsx` 行19 に配置済。`/works/[floor]/[id]` は
  `(site)` 配下のため全作品詳細をカバー。
- **Cookie 契約**: `vodnavi_age_verified=1`（proxy.ts の `COOKIE_NAME`/`COOKIE_VALUE` と一致）。
  同一 cookie で `/api/concierge/*` の 403 ガードも通過する整合設計。

## 3. 本番物理検証（2026-06-28, curl）
- `https://app.vodnavi.jp/works/videoa/gqhb00024`（前回監査トップ着地）に Googlebot UA で curl:
  **HTTP 200 / 181,925 B / text/html**。403 ではない＝クローラ遮断なし。
- 同 SSR HTML 内に overlay マークアップ（`site-age-gate-title` / 「18 歳以上ですか」）は **不在**、
  本文「作品」は 38 箇所。→ **非クローキング／クロールセーフを本番で確証**。

## 4. レビュー生成パイプライン（generate-work-reviews.ts）— 2026-06-28 判断で保留
> CSO script §3 は「本ゲート配備により安全担保されたので live 解放を並行執行せよ」としたが、
> HUMAN 判断（本日 Q2）は **「今は実行しない」**。よって本ブリーフでは live 解放を保留とする。

- 事実訂正: 当該スクリプトの前提に反し、`callCcoForReview` に解除すべきモック/TODO は無く、
  `@ai-sdk/openai`+`ai.generateText` の **live 経路は既に実装済**（`--mode=live` で起動）。
  プロバイダは **OpenAI**（`OPENAI_API_KEY` は `.env.local` に実在）。
- live 実行は OpenAI 課金 + AI 生成テキストの本番焼き込み（publish）+ commit/push を伴うため、
  別途 HUMAN 明示承認を得てから実施する（dry-run/1件試走→人間レビュー→本番反映の段階導入推奨）。
