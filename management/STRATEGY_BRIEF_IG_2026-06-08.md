---
title: "新章メディア構築における Information Gain・インテント調律戦略ブリーフ"
last_updated: "2026-06-08"
status: "active (CTO-corrected)"
---

# 新章メディア構築における Information Gain・インテント調律戦略

> **注記 (CTO, 2026-06-08)**: CSO 原案を物理ファクト + clean/adult 境界に整合させて landed。
> 訂正点: (a) §1「96.99% 直接検索着地」は誤り→ intra-app 回遊シェアであり検索直接着地率ではない（[[project_funnel_intra_app_reclassified]]、cross-domain は 1.4%）。(b) 配置 ② ④ は clean 面（vodnavi.jp / site-brand）への成人文脈シグナル混入で BRIEF_034 境界違反・81.8k impr 毀損リスク → **境界ブロック（要 reframe/移設）**。(c) 既存 [[STRATEGY_BRIEF_INFORMATION_GAIN.md は本ブリーフの前段]]。① の review 機構は既に live 実装済（`lib/work-review.ts` + 27 fixture）。

## 1. 物理ファクトと背景
`app.vodnavi.jp` の作品詳細（`/works/videoa/{cid}`）は hostName 分割で全体の ~98.6% を占めるが、これは**アプリ内回遊**シェアであって「直接検索着地率」ではない（cross-domain 1.4%、[[project_funnel_intra_app_reclassified]]）。2026-06-08 物理監査ではインフラ・タグ・GA4 受信は健全（[[reference_ga4_property_topology]]）。
本ブリーフは、この詳細ページ層に「独自の情報利得（Information Gain）」と「インテント調律」を施し、E-E-A-T と CVR を高めるコンテンツ配置を規定する。**不変ガード**: 成人文脈は app.vodnavi.jp（年齢ゲート内）限定、clean 面 vodnavi.jp は非成人・教養のみ。

## 2. インテント別コンテンツ配置仕様

### ① 品番直接着地レビュー（intent: actress / premium）— **app-side / 境界SAFE / 既存実装**
- **対象**: `gkok00002` 等 GSC 上位品番群
- **配置**: `app-concierge/src/data/work-reviews/{content_id}.md`（**既に稼働中の機構**、27件 live fixture あり）
- **仕様**: 300〜500字 SSR レビュー。公式あらすじを脱した独自論評。残作業は実データの coverage 拡充（CCO 生成）。

### ② 秘匿性の作法（intent: beginner）— **🚫 境界ブロック（要判断）**
- 原案: 「家族にバレない運用」「クレカ明細」等の秘匿性を `site-brand/privacy` に配置。
- **CTO 判定**: 成人視聴の秘匿という文脈は clean 面への成人シグナル → **vodnavi.jp に置けない**。`/privacy` は既に clean boilerplate で landed 済（T-20260606-04）。追求するなら **app 側（年齢ゲート内）** へ移設、または clean 面では成人色を完全に排した一般的プライバシー解説に reframe。HUMAN 判断待ち。

### ③ アクトレス・キュレーション（intent: actress）— **app-side / 境界SAFE**
- **配置**: `app-concierge/src/data/work-reviews/` バッチ投入。女優の演技トーンに焦点。AI コンシェルジュへの動的パラメータ接続強化。

### ④ 感情のゆらぎ逆引き（intent: null）— **🚫 境界ブロック（要判断）**
- 原案: 「眠れない夜」「賢者タイム」等を `site-brand/about` に配置。
- **CTO 判定**: 「賢者タイム」等は成人文脈語 → clean 面 `/about` に不可。**app 側**で扱うか、clean 面では非成人の一般情緒コラムに reframe。HUMAN 判断待ち。

### ⑤ 合理的ディスカウント案内（intent: discount）— **app-side / 境界SAFE**
- **配置**: アプリ内限定解放コンポーネント／特設スロット。煽りを排したキャンペーン案内。

## 3. 次期 PDCA 監査指標
- 毎週土曜 `SATURDAY_REVIEW` で、配備品番の scroll depth + 詳細ページ main CTA（`product_click`）通過率を非配備品番と対比。
- 計測先は `G-GG7JV9MJRW` = p489519780（[[reference_ga4_property_topology]]）、hostName 分割で app/front を分離。
