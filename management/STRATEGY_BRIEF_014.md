---
title: "STRATEGY_BRIEF_014：T-02 自動抽出チェーンの dry-run 監査、および W23 パスロック規約"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_014

## 1. 目的と防衛ライン
本番データ抽出時のトークン・セッション寸断、およびファイルパースエラーを 0% に抑え込むため、`mcp__claude-in-chrome__*` を用いた自動ブラウジングとデータ格納プロセスの dry-run を執行し、物理的なファイル生成結果を検証する。

## 2. dry-run 実装・監査規約（CTO宛最終執行命令）
CTOは、本認可に基づき即座に MCP 拡張機能を駆動し、以下の dry-run シーケンスを無人で実行せよ。
1. **Chrome Session アタッチ**: `moterist.com@gmail.com` の既存ログイン状態を維持しているブラウザを正確に捕捉。
2. **GA4（p489519780）探索クエリ**: 管理画面のイベントログ、またはカスタムレポートから、`hostName === 'app.vodnavi.jp'` に紐づくイベント配列データをテスト取得。
3. **W23テスト書き出し**: 取得したデータを、規約に完全準拠した `management/_metrics/2026-W23/saturday-raw-data.json` へ物理的に書き込み、正常終了ログを端末に出力せよ。
