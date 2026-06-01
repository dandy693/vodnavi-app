# TASK BOARD — 開発・運用タスク管理

## 📋 経営戦略・データ駆動改善（CSO管轄）
- [x] 🟢 露出した3つのシークレット（Anthropic / OpenAI / Make Webhook）の物理ローテーション完了（2026-06-01）
- [x] 🟢 Make.com 新規 Webhook URL の実機疎通テスト・動作確認完了（2026-06-01、HTTP 200）
- [x] 🟢 秘密鍵の .gitignore 隔離による Git 汚染防止の完全落成
- [ ] 🔴 **【緊急・進行中】** STRATEGY_BRIEF_028 に基づくサルベージ済み動線純化リライト記事5資産の本番WordPress（moterist.com）への WP-CLI 物理注入

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 物理スキャンによる OpenAI API パッケージ（^3.0.65）および環境変数枠組みの生存確認完了
- [ ] 🟡 注入完了 24h 以内の GA4 リアルタイムレポートによる `_gl` 付与状態 / `source=moterist` セッション分離の物理監査（BRIEF_028 §2 後段）
- [ ] 🔴 **【緊急】** `app-concierge` 内の OpenAI 呼び出しスタブコード（TODO uncomment）の解除と実稼働テスト

---

## 📅 更新履歴 (Landed Logs)
- 2026-06-01: HUMANの手動ローテーション完了を受けて、Make.comの新規Webhook（qdjeg3y...）へのライブ疎通テスト（curl）を執行、HTTP 200 を確認しインフラ盾の完全正常化をログ固定。STRATEGY_BRIEF_028 の発令を受けて 5記事の本番WordPressへの WP-CLI 物理注入フェーズを緊急始動。
- 2026-06-01: 5/26成約消失に対する物理データ監査が完了。外部ノイズ要因と完全実証。
