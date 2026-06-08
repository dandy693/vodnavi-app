---
title: "STRATEGY_BRIEF_022：site-brand（vodnavi.jp）本番一括実体化、および土曜定期監査カウントダウン凍結"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_022

## 1. 目的と防衛ライン
人間（HUMAN）からの直接認可シグナル「site-brand を deploy して」の投入をもって、自動セキュリティ分類器の境界を正規にクリーン。`site-brand`（WordPress統合静的レイヤー）側へ ga-disable 漏水防衛盾（commit 7a07973）をプロダクション反映させ、データ汚染経路を完全遮断する。

## 2. 具体的執行・計装規約（HUMAN指示受領後のCTO宛最終命令）
1. **--project フラグの明示指定による安全な Vercel デプロイ**: `npx vercel --prod --yes --cwd site-brand` を執行し、重複・自動推測エラーを防止するため、カレントワーキングディレクトリ（--cwd）による境界分離、および project 明示リンクを維持して本番サービングを完了せよ。
2. **W23パスの最終ロック**: デプロイハッシュログは `management/_metrics/2026-W23/saturday-raw-data.json` へ構造化して完全集約させ、2026-06-06 10:00 JST まで全システムをトリガー待機状態へ移行せよ。
