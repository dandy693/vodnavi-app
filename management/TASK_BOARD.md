# TASK BOARD — 運用ステータス管理

## 🪐 北極星目標 (North Star)
- **2026年12月までに月商 100 万円を達成する**[cite: 7, 9]

## 🛑 特記事項・ガバナンス防衛線（CSO絶対死守命令）
- 【Moteristアセットの完全凍結ロック】moterist.com（WordPress側）への変更・追加インジェクションループは、明朝のデータ駆動診断を経るまで完全凍結とする[cite: 5, 10]。既存の主要5記事(1095/1106/994/954/1018)のSEOインデックス資産は変更せず永久保護する[cite: 5]。
- 【ホスト名個別識別計測の厳格化】プロパティ共有状態にある `moterist.com` と `app.vodnavi.jp` のデータ漏斗（ファンネル）は、明朝 10:00 JST のサタデー・レビューにおいてホスト名ディメンションにより厳格に個別追跡・識別する[cite: 5, 7, 8, 10]。

## 🏃‍♂️ 現在進行中のタスク (In Progress)
- [x] T-03 (Saturday Review) [Done: 5/31 22:30 アカウント切替後 verification 通過 (GA4 p489519780 / GSC sc-domain:vodnavi.jp / FANZA 2026-05-01〜2026-05-31)。5月度物理データを `_metrics/2026-W22/raw_audit_report.md` に landed (DOM 生数値のみ、placeholder/ハードコード ✅ なし、保留項目は明示)]
- [ ] **T-04**: 成約アプリ（app.vodnavi.jp）側における、アクセス直後の年齢確認モーダル（サーバー側 middleware 403 遮断）および意図（intent）別中間CTAによる早期クッキー着火ロジックの完全落成（担当: CTO）[cite: 4, 5]

## 📋 バックログ (Todo / Backlog)
- *現状空（直近のモノレポ構造改革および戦略ねじれ解消タスクはすべてDoneへマージ済）[cite: 5]*

## 確定済みの実績 (Done)
- [x] インフラ・解析・運用自動化・リーガル防衛（5つの盾）の100%完全落成[cite: 4, 5]
- [x] 解析用フォルダ「SEO-MOTELAB」のモノレポメインフレーム（packages/seo-motelab）への完全統合・物理移動完了[cite: 5]
- [x] 戦略矛盾の完全サニタイズ（STRATEGY_BRIEF_002のアーカイブ化、およびサタデー・レビュー規定書013の現役復帰配線の落成）[cite: 5, 10]

### Ahrefs Integration & SEO Dominance (Added 2026-05-29)
- [ ] **T-05**: Register and authenticate `app.vodnavi.jp` on Ahrefs. Extract authentic DR, keyword, and backlink synergy data for all 3 sites once Saturday Review (T-03) freeze lifts.

### 🚨 2026-W22 物理監査残作業 ＆ セキュリティ緊急タスク (2026-05-31 確定)
- [ ] T-03-SR1: [HUMAN WAIT] ANTHROPIC_API_KEY ローテーション / runbookに基づくキー再発行および.env.local配置
- [ ] T-03-SR2: [ENV WAIT] 認証キー配備後、pull-ga4.ts を --hostname 駆動してホスト名分離ファクトを抽出
- [ ] T-03-SR3: カスタムディメンション (asp_name/source/intent) 受信ファクトの目視確認
- [ ] T-03-SR4: GA4 "今月" 全期間で product_click 件数を再抽出し、FANZA 月次クリック (1,069) との期間整合性を取った上でファネル落差の真因 (リダイレクト離脱 / 商品詳細離脱) を特定
- [ ] T-06: 5記事資産のインデックスを永久保護しつつ、THE_THOR_DICTIONARY.md 準拠で高インテント導線へ部分最適化するリライト計画の策定

### 🛠️ 6月度初期 サイトコンバージョン（CVR）改善実装タスク
- [ ] T-07: Concierge App (Next.js) 内の作品推薦プロンプト拡張（product_click 向上施策）
- [ ] T-08: Moterist 永久保護5記事のインデックスを維持した導線・CTA文言の部分最適化設計
