# STRATEGY BRIEF 114 — claude-in-chrome による GA4 タイムゾーン・通貨設定のUI走査監査

## 1. 目的
コミット `b78d646` の報告書 §5 で「未確認」だった**プロパティのタイムゾーン / 通貨 / 業種**を、admin 深リンク bounce を回避する route 経路で取得し、未確認領域をパージする。

## 2. 物理走査および不変条件
- **アカウント・トラップの継続防御**: `authuser=2`（`moterist.com@gmail.com`）/ vodnavi（`p489519780`）のセッション領域を死守（`authuser=0` 罠回避・[[reference_ga4_default_property_trap]]）。
- **インデックスポリシーの不変条件**: 本監査でも `?sort=` 等への `noindex` 制御案は排除し、`self-canonical consolidation`（正規絶対URLへの統合）の正典を維持。

## 3. 実行結果（2026-07-01・同セッション完了・read-only）
- **deep-link bounce 回避の route 確定**: `#/admin/property-settings?id=489519780` は home へ bounce するが、**account-prefixed `#/a355462253p489519780/admin/property/settings` で直接到達**（再利用可能な知見）。
- 取得値（目視・変更ゼロ）:
  - **レポートのタイムゾーン = (GMT+09:00) 日本時間（日本）**
  - **通貨の表示 = 日本円 (¥) / JPY**
  - 業種 = アート、エンターテインメント ／ ビジネス規模 = 小規模（従業員 1〜10名）／ 目標 = 見込み顧客発掘・売上促進・トラフィック分析・エンゲージメント/維持
- 報告書 `management/_metrics/2026-W27/ga4-chrome-settings-audit.md` §5 を「追加確認」へ更新。`T-20260701-GA4-TZ` は同セッションで `[x]`。
- なお未取得（次走査任意）: 「データの収集」内の Google シグナル / 同意モード等の詳細トグル。
