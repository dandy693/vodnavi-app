# TASK BOARD — 開発・運用タスク管理

## 📋 経営戦略・データ駆動改善（CSO管轄）
- [x] 🟢 露出した3つのシークレット（Anthropic / OpenAI / Make Webhook）の物理ローテーション完了（2026-06-01）
- [x] 🟢 秘密鍵の .gitignore 隔離による Git 汚染防止の完全落成
- [x] 🟢 Option α (Safe Append) ランブックによる過去記事5資産の本番WordPress直接注入完了（Landed: f6b6b6e）
- [ ] 🔴 **【緊急・進行中】** BRIEF_029: 5大記事反映直後の GA4 クロスドメインLinkerパラメータ（_gl）およびホスト名個別識別自動監査

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 本番更新用自動ランブック `management/runbooks/inject-brief-028.sh` の配備・検証完了（curl -sL 修正済）
- [ ] 🔴 **【緊急】** `app-concierge` 内の OpenAI 呼び出しスタブコード（TODO uncomment）の解除と実稼働テスト
