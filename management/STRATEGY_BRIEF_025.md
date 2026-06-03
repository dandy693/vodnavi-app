---
title: "STRATEGY_BRIEF_025：Chrome連携（MCP）による moterist.com 解析生存・物理監査とインプラント執行令"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_025

## 1. 目的と防衛ライン
`moterist.com` におけるローカル開発パケットのデータ汚染経路（G-5HYV772ER9）を完全に遮断するため、Chrome 連携（MCP）を介して cPanel または WordPress 管理画面の実態を目視・監査・操作する。事実に基づかない空中戦を完全終結させ、物理ファクト駆動の計測生存（Hostname 個別識別）を確立する。

## 2. CTO（Claude Code）への具体的執行・計装規約
1. **Chrome 連携（MCP）による物理探索の徹底**: Chrome 連携（MCP）ツールまたは適切なブラウザ操作支援コマンドを活用し、`moterist.com` の管理画面（cPanel または WP-Admin）へ正規にアクセスせよ。
2. **the-thor-child/header.php の物理監査と追記**: 既存の `<head>` 内、GTM/GA タグの直前位置に、以下の遮断コードがインプラントされているか、またはこれから注入するべきかをソースコードレベルで直接スキャンせよ。
   ```html
   <script>if (location.hostname === "localhost") { window["ga-disable-G-5HYV772ER9"] = true; }</script>
   ```
3. **計測生存の個別識別検証**: インプラント完了後、ブラウザセッションを通じて `http://localhost` および `https://moterist.com` の双方の挙動をシミュレートし、開発者ツールの Console または `window.dataLayer` の状態を直接目視せよ。
