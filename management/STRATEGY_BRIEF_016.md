---
title: "STRATEGY_BRIEF_016：アプリ内部UX断絶の緊急是正、および開発環境リークの完全遮断規約"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_016

## 1. 目的と防衛ライン
`app.vodnavi.jp` 内部で発生している 98.6% のPVが `ai_session_start` に転換されない致命的UXバグを根絶。同時に、`localhost` の混入にともなう本番計装データのノイズ汚染を100%遮断し、今週末の土曜定期監査の数値を絶対正典化する。

## 2. 執行命令および技術計装（CTO宛緊急執行命令）
1. **モバイルビューポートにおけるハイドレーション監査**: モバイル端末アクセス時、ファーストビュー（チャットGreetingモーダル）が3秒以内に完全描画され、ユーザーのタップを遮断するDOMのレイアウトシフトが発生していないか監査せよ。
2. **NODE_ENV 盾の強制強化（dev env leakの永久隔離）**: `src/lib/analytics.ts` の最上位に `if (process.env.NODE_ENV !== 'production' || window.location.hostname === 'localhost')` 条件をインジェクションし、本番測定IDへの通信パケットを物理的に強制破棄せよ。
3. **W23パス規約への確定上書き**: 新探索ID `h4bNtK9ST0KSgZx-yf_9ZQ` から引き出されるホスト名分割データを、`management/_metrics/2026-W23/saturday-raw-data.json` へ上書き固着させよ。
