# TASK BOARD — 開発・運用タスク管理

## 📋 経営戦略・データ駆動改善（CSO管轄）
- [x] 🟢 Option α (Safe Append) ランブックによる過去記事5資産の本番WordPress直接注入完了（Landed: f6b6b6e）
- [x] 🟢 BRIEF_029: GA4 クロスドメインLinker物理監査完了（verdict: セッション属性疎通・client_id断絶）
- [x] 🟢 BRIEF_030: Concierge App 本番 OpenAI/Anthropic 配線および5つの盾の稼働物理検証完了（Landed: f49d372）
- [ ] 🔴 **【次期トリガー・待機中】** STRATEGY_BRIEF_031: Saturday Review (2026-06-06 土 10:00 JST 予定、初回発火で BRIEF_028 注入の CVR 効果を初観測)

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 app-concierge 本番 Next.js 16 routes clean build (exit 0) 検証完了
- [ ] 🟡 **【HUMAN 実行待ち】** `app-concierge/.env.local` への `DMM_API_ID` / `DMM_AFFILIATE_ID` 追記後、新 OpenAI key の 1-cid live 通電テスト再試行（BRIEF_030 補遺の復旧手順参照）
- [ ] 🟡 T-04: moterist 側 gtag.js 初期化順序の修復（async解除およびlinkerParamタイムアウトの解決、優先度下げ、子テーマ functions.php ステージング検証経由のみ landed 許可）

---

## 📅 更新履歴 (Landed Logs)
- 2026-06-01: BRIEF_030 補助検証（OpenAI 1-cid live test）は FANZA fetch 前段の DMM_API_ID 不在で fail。新 OpenAI key 自体は未到達で物理テスト不能。`_metrics/2026-W22/brief-030-verification-appendix.md` に honest 失敗記録 landed、HUMAN に復旧手順提示。STRATEGY_BRIEF_031 (Saturday-Review 執行仕様) を初版策定。
- 2026-06-01: BRIEF_030 本体完了（chat live, 27 reviews live, build clean）。
- 2026-06-01: BRIEF_029 GA4 cross-domain linker audit 完了（linker dead, source attribution OK）。
- 2026-06-01: BRIEF_028 Option α 5-post production injection 完了 (f6b6b6e)。
