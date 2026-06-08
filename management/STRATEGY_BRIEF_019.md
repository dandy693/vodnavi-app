---
title: "STRATEGY_BRIEF_019：Vercel本番プロダクションデプロイ、および/concierge核心部UXの物理生存監査規約"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_019

## 1. 目的と防衛ライン
ローカルディスクに完全調律済みの50コミットの成果（fb39973）を Vercel CI/CD パイプライン経由で本番環境へ一括デプロイ（実体化）する。同時に、成約アプリの核心ドメイン（app.vodnavi.jp/concierge）におけるハイドレーション完了速度の実数値を計測し、土曜定期監査に向けたファネル追尾インフラの安全弁を100%完成させる。

## 2. 具体的デプロイ・監査規約（CTO宛最終一括執行命令）
1. **Vercelプロダクションデプロイのトリガーとビルド監視**: リポジトリの最新HEADを Vercel Production 環境へデプロイし、analytics.ts の localhost 遮断ロジックが正常にビルド最適化される事実を報告せよ。
2. **/concierge 核心ドメインの物理スクレイピング監査**: `mcp__claude-in-chrome__*` を再駆動し、本番URL `https://app.vodnavi.jp/concierge?source=moterist&intent=beginner` を探索。初期チャットGreeting画面が完全描画されるまでの実数値を測定し、`management/_metrics/2026-W23/concierge-core-audit.json` へ物理書き付けよ。
