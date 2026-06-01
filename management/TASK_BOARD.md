# TASK BOARD — 開発・運用タスク管理

## 📋 経営戦略・データ駆動改善（CSO管轄）
- [x] 🟢 Option α (Safe Append) ランブックによる過去記事5資産の本番WordPress直接注入完了（Landed: f6b6b6e）
- [x] 🟢 BRIEF_029: GA4 クロスドメインLinker物理監査完了（verdict: セッション属性疎通・client_id断絶）
- [x] 🟢 BRIEF_030: Concierge App 本番 OpenAI/Anthropic 配線および5つの盾の稼働物理検証完了（Landed: f49d372 + 補遺で OpenAI 通電実証）
- [ ] 🔴 **【次期トリガー・待機中】** STRATEGY_BRIEF_031: Saturday Review (2026-06-06 土 10:00 JST 予定、初回発火で BRIEF_028 注入の CVR 効果を初観測)

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 app-concierge 本番 Next.js 16 routes clean build (exit 0) 検証完了
- [x] 🟢 新 OpenAI key の 1-cid (gkok00002) live 通電テスト成功（chars=164, total=1617 tokens、2026-06-01 22:00 JST 物理確証）
- [ ] 🟢 (optional) `scripts/generate-work-reviews.ts` 冒頭に `import 'dotenv/config'` 追加で `--env-file` 不要化（将来 refactor）
- [ ] 🟡 T-04: moterist 側 gtag.js 初期化順序の修復（async解除およびlinkerParamタイムアウトの解決、優先度下げ、子テーマ functions.php ステージング検証経由のみ landed 許可）

---

## 📅 更新履歴 (Landed Logs)
- 2026-06-01 22:00 JST: HUMAN による `app-concierge/.env.local` への `DMM_API_ID` / `DMM_AFFILIATE_ID` 追記後、`node --env-file=.env.local ...` で第二試行成功。新 OpenAI key の production 通電を物理確証。BRIEF_030 全条件達成、補遺更新 landed。
- 2026-06-01: STRATEGY_BRIEF_031 (Saturday-Review 執行仕様) 初版策定。
- 2026-06-01: BRIEF_030 本体完了（chat live, 27 reviews live, build clean）。
- 2026-06-01: BRIEF_029 GA4 cross-domain linker audit 完了（linker dead, source attribution OK）。
- 2026-06-01: BRIEF_028 Option α 5-post production injection 完了 (f6b6b6e)。
