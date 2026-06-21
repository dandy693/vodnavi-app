---
title: "戦略ブリーフ: LLMO（生成AI検索最適化）およびGEO対応の要塞化"
last_updated: "2026-06-21"
status: "active"
author: "CSO (VODNAVI)"
target: "2026-12月 月商100万円（TARGET・非確定）"
metrics_fact: "2026-06-21監査(7日窓 6/14-6/20, 全ホスト=app 99.6%, ページ別帰属は未測定): product_click 67ユーザー/79イベント、ai_session_start 7ユーザー/8イベントを物理観測。購入(成約)イベントは0。"
---
# 1. 目的と背景
生成AI検索エンジン（Perplexity, SearchGPT, Gemini等）からのインテント流入を独占するため、Next.js 16 で本番デプロイ済（200 OK 検証済）の `app.vodnavi.jp` を、LLM が最高効率で引用・抽出できる「構造化データの要塞」へ進化させる。

**物理ファクトの正確な解釈（重要・誇張禁止）**:
- 直近7日間で `product_click` は 79イベント発火（クリック意向は健全）。ただし**ページ別帰属は未測定**であり、これを「女優ハブ詳細の成約力」と断定はできない。既知データでは女優ハブは立ち上げ初期（28日で約4ビュー）であり、79クリックの大半は作品詳細 `/works/[floor]/[id]`（product-card 設置面）発火と推定。
- `購入`（成約）イベントは **0**。`product_click` は成約ではなくクリック意向の指標。
- 女優ハブ `/actresses/[id]` / ジャンル `/genres/[id]` は本番 200 OK・sitemap 各200件登録済だが、流入はこれから。**LLMO は「将来の引用流入を作る賭け」であり、現時点の成約ドライバではない**点を前提に据える。

# 2. 各ロールへの執行命令（grounded）
- **【CTO】F-12 (LLMO)**:
  - 本番 200 OK 検証済の `actresses/[id]` および `genres/[id]` 全URLへ Schema.org 準拠 JSON-LD（既設の Product/Offer/Person/ItemList 構造を流用）を動的拡張。AIクローラーが構造化データを取得できる状態にする。
  - チャット起動率 **0.88%**（7日窓ファネル Step1→Step2 完了率の実測）を改善するため、トップ/詳細UIからチャットへの導線視認性を『ビブリア・エロティカ』世界観を崩さず強化する設計案を用意。
- **【CCO】M-05 (LLMO)**:
  - 本番 `sitemap.xml` 出力済の女優詳細200件・ジャンル詳細200件に対し、AI検索が高コンテキストなプロンプト（例: 知性的で深夜に没入できる官能作品）を処理した際にグラウンディング（引用参照）されやすいキュレーション・コピーを量産。

# 3. ガバナンス
- すべてのデザイン・文体は `BRAND_DESIGN_GUIDE.md`（ダーク×ゴールド `#D4AF37`、ビブリア・エロティカ）に完全準拠。
- 年齢確認は `app-concierge/src/proxy.ts`（Next.js 16、`src/middleware.ts` 新規作成禁止）を前提に維持。
- 月商100万円は TARGET 仮説（非確定）として扱い、達成断定はしない。

# 4. 計測の残課題
- `source × intent` クロス表（データアクセス要、別 Exploration）。
- product_click / ai_session_start の **page_path 別帰属**（女優ハブ vs 作品詳細 vs ジャンルの内訳）を次回 Exploration で測定し、本ブリーフの帰属推定を実数で検証する。
