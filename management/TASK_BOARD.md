# TASK BOARD — 開発・運用タスク管理

## 📋 経営戦略・データ駆動改善（CSO管轄）
- [x] 🟢 STRATEGY_BRIEF_028 §1 — 過去記事5資産 (994/1018/1095/1106/954) の本番 WordPress への Option α 物理注入完了（2026-06-01 12:58 JST、5/5 production live 確認）
- [x] 🟢 永続フィードバック長期記憶（management/_memory/feedback-memory.md）の策定落成
- [ ] 🔴 **【緊急・進行中】** STRATEGY_BRIEF_028 §2 / 029 — 本番注入完了後 24h 以内の GA4 `_gl` linker + `source=moterist` cross-domain attribution 監査（CTO Chrome MCP）

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 inject-brief-028.sh Option α (Safe Append) ランブックの実行完了 — 全 5 posts SSH/wp-cli 物理成功、backup landed at `site-moterist/03_content/backups/<id>_<slug>_20260601_125825.html`
- [x] 🟢 verify script のバグ修正完了（curl -L 追加、redirect-follow）
- [ ] 🟡 BRIEF 029 受領後、Chrome MCP で `r=top-events` Explorer の `ai_session_start` × source × hostname 分割集計を `_metrics/2026-W22/brief-029-verification.md` に landed

---

## 📅 更新履歴 (Landed Logs)
- 2026-06-01 12:58 JST: bash inject-brief-028.sh 実行成功。5/5 本番 wp post update SUCCESS、curl -sL 検証で btn__link-primary 7-9 / compliance-disclaimer 1 / concierge URL 3-4 hits を全 post で確認。Option α (SEO body 100% 保全 + CTA 末尾追加) 物理確証。
- 2026-06-01: Make.com 新規 Webhook へのライブ疎通テスト (HTTP 200) で全シークレットローテーションを完全終了。
- 2026-06-01: 5/26成約消失に対する物理データ監査が完了。外部ノイズ要因と完全実証。
