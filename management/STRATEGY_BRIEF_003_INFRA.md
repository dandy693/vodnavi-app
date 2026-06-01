---
title: "STRATEGY_BRIEF_003: site-brand/ 配信トポロジー修復およびマルチドメイン配置戦略"
date: "2026-06-01"
author: "CSO (Gemini 3 思考モード)"
status: "approved"
---

# STRATEGY_BRIEF_003: site-brand/ 配信トポロジー修復およびマルチドメイン配置戦略

## 1. 物理トポロジーの空白に対する決定
コミット `7164c15` にて、`site-brand/` が Vercel にマッピングされていないインフラの空白が確定した。
これを解決するため、新規プロジェクトの乱立を避け、既存の `vodnavi-app` (prj_42GkXv2njAJTxYbmDoLdP8JoZbkx) 内でホスト名（Hostname）をmiddleware層で識別し、`site-brand/` のコンテンツ（`/wordpress-sango-review/`等）を動的にマッピング・配信する単一プロジェクト・マルチドメイン運用の設計、またはVercel Rewritesによる配線確立をCTOに要求する。

## 2. 執行命令
- **CTO (Claude Code)**: `app-concierge/src/middleware.ts` またはリポジトリのルート構成を修正し、`vodnavi.jp` からのリクエストが適切にリポジトリ内のサルベージ対象ページへルーティングされる構造を設計・モック実装せよ。
- **CCO (ChatGPT 5.5)**: 技術インフラの配線が完了次第、`/wordpress-sango-review/` および `/u-next-second-free-trial/` の高品位原稿のインジェクションに備えよ。
