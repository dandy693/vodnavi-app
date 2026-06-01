# TASK BOARD — 開発・運用タスク管理

## 📋 経営戦略・データ駆動改善（CSO管轄）
- [x] 🟢 全面置換の過ちを是正。Option 1.A に基づき原本保護型・動線純化HTMLの配置完了（2026-06-01）
- [x] 🟢 秘密鍵の .gitignore 隔離による Git 汚染防止の完全落成
- [ ] 🔴 **【緊急・進行中】** 整合性チェックを通過した staging/ 5アセットの本番WordPress直接注入ランブック実行（F-05/F-06）

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 本番更新用自動ランブック `management/runbooks/inject-brief-028.sh` の配備完了
- [ ] 🟡 **【要対応】** `inject-brief-028.sh` を merge モード（fetch → append → update）に改修。現状は `wp post update` で post_content を完全置換するため、5記事の本番 body（合計 890 行）が staging HTML（35 行）に縮小し SEO 資産損失リスクあり
- [ ] 🟡 本番注入完了後 24h 以内の GA4 クロスドメインLinkerパラメータ生存自動監査の待機（BRIEF_029キュー積載）
