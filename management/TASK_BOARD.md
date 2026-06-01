# TASK BOARD — 開発・運用タスク管理

## 📋 経営戦略・データ駆動改善（CSO管轄）
- [x] 🟢 露出した3つのシークレット（Anthropic / OpenAI / Make Webhook）の物理ローテーション完了（2026-06-01）
- [x] 🟢 Make.com 新規 Webhook URL の実機疎通テスト・動作確認完了（2026-06-01、HTTP 200）
- [x] 🟢 秘密鍵の .gitignore 隔離による Git 汚染防止の完全落成
- [ ] 🔴 **【緊急・進行中】** STRATEGY_BRIEF_028 §1 — 本番 WordPress 物理注入（4記事：994/1018/1095/1106、post-954 は別タスク）
- [ ] 🟡 STRATEGY_BRIEF_028 §2 — 注入後 24h 以内の GA4 `_gl` / `source=moterist` 監査（§1 依存）
- [ ] 🟡 STRATEGY_BRIEF_028 補完 — post-954 の動線純化リライト（CCO 起動、5 資産の完全性回復）

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 物理スキャンによる OpenAI API パッケージ（^3.0.65）および環境変数枠組みの生存確認完了
- [x] 🟢 BRIEF 028 §1 用 HUMAN-executable 注入スクリプト `management/runbooks/inject-brief-028.sh` の生成完了（2026-06-01）
- [ ] 🔴 **【HUMAN 実行待ち】** `bash management/runbooks/inject-brief-028.sh` の terminal 実行（mixhost SSH は classifier-blocked のため CTO 起動不可）
- [ ] 🟡 `app-concierge` 内の OpenAI 呼び出しスタブコード（TODO uncomment）の解除と実稼働テスト

## ✍️ コンテンツ制作・世界観統制（CCO管轄）
- [ ] 🔴 **【BRIEF 028 前提条件】** `site-moterist/03_content/rewrites/post-<id>-final-rewrite.md` (Proposed draft) を `site-moterist/03_content/staging/<post_id>_<slug>.html` (装飾 HTML 完成版) に変換 — 4 件分 (994/1018/1095/1106)
- [ ] 🟡 post-954 (`03_content/954_fanzaotoku.md`) の動線純化リライト原稿生成

---

## 📅 更新履歴 (Landed Logs)
- 2026-06-01: STRATEGY_BRIEF_028 受領後の物理 inventory で 4 制約 (A: post-954 rewrite なし / B: mixhost SSH classifier-block / C: staging convention mismatch / D: rewrites/ は Proposed draft で本番注入不可) を検出。CTO は `inject-brief-028.sh` を生成し HUMAN 実行待ち。CCO に Proposed→staging HTML 変換タスクを発令。
- 2026-06-01: Make.com 新規 Webhook へのライブ疎通テスト (HTTP 200) で全シークレットローテーションを完全終了。
- 2026-06-01: 5/26成約消失に対する物理データ監査が完了。外部ノイズ要因と完全実証。
