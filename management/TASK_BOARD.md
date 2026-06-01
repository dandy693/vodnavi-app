# TASK BOARD — 開発・運用タスク管理

## 📋 経営戦略・データ駆動改善（CSO管轄）
- [x] 🟢 Option α (Safe Append) ランブックによる過去記事5資産の本番WordPress直接注入完了（Landed: f6b6b6e）
- [x] 🟢 BRIEF_029: GA4 クロスドメインLinkerパラメータおよびホスト名個別識別物理監査完了（verdict: セッション属性疎通・client_id断絶）
- [x] 🟢 BRIEF_030: Concierge App 成約パイプライン物理確認完了（runtime chat = Anthropic Claude live / batch reviews = 27 cids 全て `source: live` 生成済 / `npx next build` clean exit）

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 BRIEF_030 検証: `npx next build` 16 routes 生成・エラーなし、`api/concierge` ƒ Dynamic 健全、`api/age-gate` 稼働、`buildAffiliateURL` 経由でハードコード ID なし
- [x] 🟢 work-reviews README の outdated「stub 解除手順」を current state（既に配備済）へ書き換え完了
- [ ] 🟡 T-04: moterist 側 gtag.js 初期化順序の修復（async解除およびlinkerParamタイムアウトの解決、優先度下げ）
- [ ] 🟡 任意: rotation 直後の新 OpenAI key を `--mode=live --target=<cid> --force` で 1 cid 単発テスト（鮮度確認）

---

## 📅 更新履歴 (Landed Logs)
- 2026-06-01: BRIEF_030 着手時の物理 inventory で「OpenAI スタブは既に解除済」を確証。chat runtime は Anthropic Claude Sonnet 4.6、batch script は 27 cids すべて 2026-05-27 に live 生成済（prompt_version cco-review-v1.1.1）。README の outdated 文言のみ修正、TASK_BOARD を達成済状態に同期。
- 2026-06-01: BRIEF_029 GA4 cross-domain linker audit 完了（linker dead, source attribution OK）。
- 2026-06-01: BRIEF_028 Option α 5-post production injection 完了 (f6b6b6e)。
