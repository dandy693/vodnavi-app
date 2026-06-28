---
title: "GSC物理監査（Performance/クエリ次元）およびインテント逆算戦略ブリーフ"
brief_id: "079"
last_updated: "2026-06-28"
status: "audited"
result: "management/_metrics/2026-W26/gsc-raw-data.md"
supersedes_brief_number_in_source_script: "040 (衝突のため079へ採番。040はW24_EARLY_COOKIE_BURNINGが既存)"
related:
  - "management/_metrics/2026-06-22-gsc-audit-report.md (カバレッジ/sitemap/index次元・本ブリーフはPerformance次元で補完)"
  - "project_gsc_search_intent_title_dominant (2026-06-10: 検索意図95%が作品タイトル/品番)"
  - "project_moterist_zero_search_inflow (moterist GSC clicks≈0)"
---

# STRATEGY_BRIEF_079: GSC物理監査（Performance/クエリ次元）

> 採番補正: 元 CSO スクリプトは `040_GSC_AUDIT` を指定したが、`STRATEGY_BRIEF_040_W24_EARLY_COOKIE_BURNING.md`
> が既存のため衝突。最新の空き番号 **079** に採番した（既存ブリーフ最大は 078_ATTRIBUTION）。

## 1. 目的
`sc-domain:vodnavi.jp`（app.vodnavi.jp を含む全サブドメインを集約するドメインプロパティ）の
Google Search Console **Performance（検索パフォーマンス）** 生データを claude-in-chrome MCP 拡張
による実ブラウザ操作で直接目視・抽出し、上位クエリ・表示回数・CTR・掲載順位の物理ファクトから、
2026年12月 月商100万円へ向けた Next.js メディア層のコンテンツ強化の最適解を逆算する。

2026-06-22 監査（`_metrics/2026-06-22-gsc-audit-report.md`）は sitemap / index / robots /
構造化データのカバレッジ次元を網羅済み。本ブリーフはそこで未取得の **クエリ × 着地URL ×
CTR × 順位** の Performance 次元を補完する。

## 2. 監査対象と識別規約
1. **主対象**: `sc-domain:vodnavi.jp`（ドメインプロパティ。app.vodnavi.jp 含む全サブドメイン集約）
2. **副対象（存在時のみ）**: moterist.com — ただし検証済みファクトでは GSC clicks≈0 / impr 1
   （[[project_moterist_zero_search_inflow]]）。当アカウントにプロパティが登録されていない、
   またはデータ実質ゼロの場合はその旨を記録して深追いしない（捏造値を作らない）。
- トラフィックはホスト名で分離。`?source=moterist` 等のカスタムパラメータは GA4 側の識別子で
  あり GSC クエリレポートには現れない点に留意。

## 3. アカウント前提（実行前検証必須）
- 解析アカウントは **moterist.com@gmail.com（authuser=2）**。
  個人アカウント hdktchkw33@gmail.com とは別系統（[[reference_google_accounts]]）。
- GSC/GA4 は素で開くと別 client が既定表示される罠があるため、プロパティ確定を物理確認してから
  数値を読む（[[reference_ga4_default_property_trap]]）。

## 4. 執行タスク（2026-06-28 完了）
- [x] claude-in-chrome MCP 拡張で GSC にアクセスし、アクティブアカウントが moterist.com@gmail.com
      であることを物理確認（アカウントポップアップで「モテリスト 様」を目視）。
- [x] `sc-domain:vodnavi.jp` の過去3ヶ月 Performance: クリック5,340 / 表示13.6万 / CTR3.9% / 順位9.1。
- [x] クリック上位10クエリ + 上位10着地URL を取得（→ `_metrics/2026-W26/gsc-raw-data.md`）。
- [x] 品番直撃判定: 上位10クエリ10/10・上位10着地10/10 が作品タイトル/`/works/*` 詳細＝videoa フロア大宗。
- [x] 比率算出: ナビゲーショナル品番が支配的、女優単体/ジャンル/情報・比較系は上位ゼロ＝記事機会。
- [x] 生データを `management/_metrics/2026-W26/gsc-raw-data.md` に記録（プレースホルダ・推測ゼロ）。
- [x] moterist.com 副監査: clicks0 / impr3 / CTR0%（送客資産として機能せず＝script 前提を棄却）。
