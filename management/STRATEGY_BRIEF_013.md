---
title: "STRATEGY_BRIEF_013：claude-in-chrome MCP自動データ抽出チェーンの最終稼働仕様"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_013

## 1. 目的と防衛ライン
2026年06月06日 10:00 JSTに投入される人間からの「サタデー・レビューを開始して」という1コマンドのトリガーを合図に、`mcp__claude-in-chrome__*` 拡張機能を完全駆動。集客ドメインの Search Console 順位データと、成約チャットアプリ内の会話インテントデータを、人間の手作業を一切介さずに物理ディスクへと焼き付ける。

## 2. 厳格なる実装規約（CTO宛最終執行命令）
CTOは、以下の構造を100%満たすデータ抽出ロジックを配備せよ。
1. **MCP操作の物理配線**: `mcp__claude-in-chrome__*` のブラウジングコンテキストを使用し、`moterist.com@gmail.com` のログインセッションが確立されている既存の Chrome ウィンドウをシームレスに捕捉・起動せよ。
2. **hostName 分割の完全デプロイ**: GA4プロパティ（489519780）のイベント画面スキャン時、`hostName === 'app.vodnavi.jp'` に基づくインテント別の `ai_session_start` 発火実数値をミリ単位で個別に識別・抽出せよ。
3. **W23パス規約への固着**: 抽出された配列・数値を、`management/_metrics/2026-W23/saturday-raw-data.json` の絶対パスへ構造化して物理書き出しせよ。
