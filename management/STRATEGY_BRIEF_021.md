---
title: "STRATEGY_BRIEF_021：site-brand（vodnavi.jp）本番プロダクションデプロイ執行、および土曜定期監査最終封印規約"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_021

## 1. 目的と防衛ライン
`site-brand（vodnavi.jp）` のローカル検証セッションが本番GA4プロパティ（G-GG7JV9MJRW）を汚染するリーク経路を、本番環境側で完全に機能停止させる。これをもって、土曜日に執行される 3ドメイン統合ホスト名監査の計装包囲網を100%「封印」する。

## 2. 具体的執行・計装規約（CTO宛最終一括執行命令）
1. **site-brand プロジェクトの本番デプロイ強制駆動**: `cd site-brand && vercel link --yes && vercel --prod --yes` を執行し、ga-disable 漏水防衛盾を完全実体化せよ。
2. **W23パスの最終ロック**: デプロイハッシュログは `management/_metrics/2026-W23/saturday-raw-data.json` へ構造化して完全集約させ、2026-06-06 10:00 JST まで全システムをトリガー待機状態へ移行せよ。
