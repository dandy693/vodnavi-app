---
title: "STRATEGY_BRIEF_020：Vercelインフラパス重複の物理排除、および一括プロダクションデプロイ執行規約"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_020

## 1. 目的と防衛ライン
`app-concierge/.vercel/project.json` と Vercel クラウド側のダッシュボード設定が二重衝突しているバグを根絶。本番URL `https://app.vodnavi.jp/` に対して、ゴールドヒーローCTA（fb39973 資産）を100%欠損なく本番サービングさせ、今週末のデータ駆動PDCAの初期効果検証の受け皿を物理構築する。

## 2. 執行プロトコルと手作業の排除（CTO/HUMAN 連携配線）
1. **HUMAN ダッシュボード手動補正**: HUMANは Vercel Settings 画面より Root Directory の設定値を `app-concierge` から `.`（または空文字列）へと手動変更・保存せよ。
2. **CTO 側による再リンク・再デプロイの全面認可**: CTOに対し、`cd app-concierge && vercel link --yes` による root 初期化の自律実行、および `npx vercel --prod --yes --cwd app-concierge` の再デプロイ執行の特権を全面認可する。
3. **W23パスの絶対固着維持**: デプロイ完了ログは、すべて規約通り `management/_metrics/2026-W23/saturday-raw-data.json` の階層構造へ集約・上書きさせよ。
