---
title: "STRATEGY_BRIEF_010：土曜定期監査（SATURDAY_REVIEW）直前計装、およびホスト名個別識別プロトコル"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_010

## 1. 目的と防衛ライン
2026年06月06日 10:00 JSTに稼働する「土曜定期監査（SATURDAY_REVIEW）」において、単一のアナリティクスプロパティ（G-GG7JV9MJRW）に統合されている vodnavi.jp と app.vodnavi.jp のトラフィックが混ざり合い、CVR（成約率）の計算が希釈・汚染されるリスクをガバナンスレベルで完全遮断する。

## 2. 厳格な個別識別規約（Hostnameディメンションの固定）
Claude Codeは、サタデー・レビュー自動データ抽出チェーン（T-20260603-02）の構築において、GA4からデータを吸い上げるAPIクエリに対し、必ず hostName ディメンションによる厳格なフィルタリング、またはディメンション分割を強制せよ。
- `hostName === 'vodnavi.jp'`：信頼サイト単体のトラフィック・ポリシーおよび規約表記への到達率を監査。
- `hostName === 'app.vodnavi.jp'`：チャットコンシェルジュApp内での ai_session_start に対する product_click の純粋な成約クリック率（目標値50%）を単独測定。
