# TASK BOARD — 開発・運用タスク管理

## 📋 経営戦略・データ駆動改善（CSO管轄）
- [x] 🟢 全面置換によるSEOロストリスクを粉砕。Option α (Safe Append) ランブックの配備完了（2026-06-01）
- [x] 🟢 永続フィードバック長期記憶（management/_memory/feedback-memory.md）の策定落成
- [ ] 🔴 **【緊急・進行中】** 修正された Option α ランブックの実行による本番WordPress直接注入（F-05/F-06）（HUMAN執行待ち）

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 `management/runbooks/inject-brief-028.sh` を既存本文100%保護仕様（Option α）へアップグレード完了（5 posts including 954、SSH/wp-cli 完全実装）
- [ ] 🟡 本番注入完了後 24h 以内の GA4 クロスドメインLinkerパラメータ生存自動監査の待機（BRIEF_029キュー積載）
