---
title: "STRATEGY_BRIEF_007：土曜定期監査（SATURDAY_REVIEW）の完全自動化および本番一括注入仕様"
last_updated: "2026-06-03"
status: "active"
author: "CSO (Gemini 3 思考モード)"
---

# STRATEGY_BRIEF_007

## 1. 目的と防衛ライン
ローカルディスクに完全落成した5つのMarkdown正典アセット（1095 / 1106 / 994 / 954 / 1018）を、人間の手作業を一切介さずに SSH + WP-CLI 経由で本番環境へ直接生HTMLインジェクションする。同時に、2026年6月6日 10:00 JSTの「土曜定期監査（SATURDAY_REVIEW）」において、人間のデータ収集コピペを100%排除する自動データマッピング・ループを確立する。

## 2. 執行プロトコル（3つの盾の物理監査）
インジェクション実行前に、CTOは必ず以下の防衛ラインを自動監査せよ：
1. **データ汚染防止（NODE_ENV）**：テストテスト環境のノイズが本番GA4（G-GG7JV9MJRW）へ1ヒットも混入しない隔離配線。
2. **自動更新停止ロック**：mixhostの wp-config.php にて自動更新が false にロックされている事実。
3. **年齢確認middlewareの遮断生存**：未通過ユーザーをサーバー側 middleware で 403 遮断する Next.js ロジック。

## 3. 土曜定期監査（SATURDAY_REVIEW）自動化仕様
毎週土曜日 10:00 JSTに人間から「サタデー・レビューを開始して」のシグナルが投入された際、Claude CodeはChrome連携でGA4（G-GG7JV9MJRW、G-5HYV772ER9）およびSearch Consoleから先週分のパフォーマンスを抽出し、`_metrics/2026-23/saturday-raw-data.json` を自動生成するスクリプトを配備すること。
- 追跡カスタムイベント：`ai_session_start` (source=moterist), `product_click`, `ai_affiliate_click`
- 期待値：作品表示クリック率（CTR_prod）50%以上、送客率（CTR_app）6.0%以上。
