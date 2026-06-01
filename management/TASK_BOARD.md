# TASK BOARD — 開発・運用タスク管理

## 📋 経営戦略・データ駆動改善（CSO管轄）
- [x] 🟢 Option α (Safe Append) ランブックによる過去記事5資産の本番WordPress直接注入完了（Landed: f6b6b6e）
- [x] 🟢 BRIEF_029: GA4 クロスドメインLinker物理監査完了（verdict: セッション属性疎通・client_id断跡受託）
- [x] 🟢 BRIEF_030: 新回転 OpenAI Key 疎通テスト成功および DMM 環境変数補完完了（Landed: 21d4810、1,617 tokens 再生成確認済）
- [ ] 🔴 **【次期トリガー・待機中】** SATURDAY_REVIEW: 2026-06-06 (土) 10:00 JST 執行。GA4生データ（source×intent）に基づくデータ駆動リライトループの自律起動（仕様書 BRIEF_031 マージ済）

## 💻 技術実装・計測生存確認（CTO管轄）
- [x] 🟢 app-concierge 本番Next.js 16 routes clean build (exit 0) 検証完了
- [ ] 🟡 T-04: moterist 側 gtag.js 初期化順序の修復（async解除およびlinkerParamタイムアウトの解決、子テーマ検証経由限定）
- [ ] 🔵 **【優先度:低・クリーンアップ】** BRIEF_030_AMEND: AI SDK 警告および環境変数のマイナーリファクタ
  - [ ] scripts/generate-work-reviews.ts 冒頭への import 'dotenv/config' 追加による --env-file フラグ不要化
  - [ ] プロンプトインジェクション対策としての system message の system option 移行
  - [ ] gpt-5.5 reasoning model における temperature 設定の削除
