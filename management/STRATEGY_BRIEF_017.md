---
title: "STRATEGY_BRIEF_017：計測プロパティ全域の完全サニタイズ、およびモバイルハイドレーション物理監査規約"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_017

## 1. 目的と防衛ライン
単一のGA4プロパティ（G-GG7JV9MJRW）にデータを流し込む全ドメイン（集客・信頼・成約）において、ローカル開発環境（localhost）からのパケットリークを100%遮断。同時に、モバイル環境におけるチャットGreetingモーダルの完全描画遅延（3秒の壁）の有無を物理監査し、UX断絶の真因を特定する。

## 2. 具体的計装・監査規約（CTO宛一括執行命令）
1. **Next.js <GoogleAnalytics> の条件付きレンダリング実装**: 環境変数が production かつホスト名が localhost 以外の場合にのみタグコンポーネントを出力する配線を完了せよ。
2. **site-brand（vodnavi.jp）側へのリークブロックインジェクション**: WordPressの header.php 内のGA4コード直前に、`window['ga-disable-G-GG7JV9MJRW'] = true;` 条件（localhost判定時）を強制インプラントし、ブラウザレイヤーで測定を凍結せよ。
3. **モバイルハイドレーション監査の執行**: モバイルエミュレーション環境における初期描画のブロック要素、およびハイドレーション完了までのTime to Interactive（TTI）の実数値を測定し、`management/_metrics/2026-W23/hydration-audit.json` へ物理書き出せ。
