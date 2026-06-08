# STRATEGY_BRIEF_034_W23_PIVOT — 集客エンジンのピボット（moterist → vodnavi.jp）

発行: 2026-06-06 (W23 Saturday Review 直後) / 採番: 033 の次 = **034**（CSO 原案の "002" は既存3ファイルと衝突するため修正）
ステータス: **DRAFT — 実装は HUMAN 承認待ち（§4 リスク未決のため）**
根拠データ: `management/_metrics/2026-W23/`（`saturday_pull_2026_06_06` / `moterist-infra-audit.json` / `gsc-panel-audit.json`）

## 1. 物理ファクトに基づく状況分析（すべて 2026-06-06 物理確認）
- **moterist.com**: 5大ピラー **5/5 INDEXED**、手動ペナルティ **無し**、robots/noindex/X-Robots **クリーン**。それでも GSC は clicks **0** / impr **1**（28d）。→ 技術・ペナルティ・未インデックス要因は**全て棄却**。残る最有力説明は **Google の成人コンテンツ・SafeSearch デランク**（構造的非表示）。※「確定」ではなく、検証可能な全代替仮説を棄却した結果の**最有力推定**。SEO 技術改善・本文リライト・SSH 注入では検索流入は増えない公算が大きい。
- **vodnavi.jp**: GSC でドメイン全体 impr **81,800** / clicks **2,640** / 平均CTR **3.2%** / 平均順位 **8.7**。一般クエリで上位生存。VODNAVI-GROUP 最大のオーガニック集客源。

## 2. 戦略的ピボットの基本方針
1. **moterist の役割縮小・チャネル変更**
   - Google オーガニック前提の SEO 投資を**凍結**（流入が構造的に伸びないため）。
   - 5大ピラーの SEO インデックスは **永久保護を維持**（`project_moterist_mass_overwrite_plan` / THE_THOR_DICTIONARY.md 準拠、本文の全文上書き・移動はしない）。
   - 役割は「X（旧Twitter）運用 → 年齢確認 LP 経由のソーシャル着地面」へダウングレード（Google 検索に依存しない流入）。
2. **vodnavi.jp 集客面の強化**
   - 一般オーガニックを捕獲している面（`site-brand/`）を主集客エンジンとして強化。
   - `BRAND_DESIGN_GUIDE`（ビブリア・エロティカ世界観）の知的・教養トーンで E-E-A-T を満たすコラムを新設し、一般検索からの流入を最大化。
   - 流入後、年齢確認ゲート（**実装は `proxy.ts`**。Next.js 16 で middleware.ts→proxy.ts に rename 済、`src/middleware.ts` は新規作成しない＝`project_age_gate_shield_is_proxy_ts`）を経て `app.vodnavi.jp/concierge?source=brand&intent=...` へ送客。

## 3. アクションアイテム（T-20260606-03 / 実装ブロック中）
- **CTO**: `site-brand/` 層のコラム・スキャフォールド（MDX or 静的構造）構築。
- **CCO**: 教養トーン（柱2）の vodnavi.jp 向け **新規**ドラフト作成（moterist 既存記事の移植/複製ではなく、重複コンテンツを避けた書き下ろし）。

## 4. ⚠️ 重大リスク・前提条件（CTO 注記 — 本ピボットの核心的論点）
**本ピボットには内部矛盾がある。** vodnavi.jp が価値を持つのは「一般（非成人フィルタ）検索で生存している」からである。そこへ**成人/FANZA インテントのコラムを直載せすると、moterist を死なせたのと同一の adult デランク機構が vodnavi.jp 自身に作用し、81.8k impr の最重要資産を毀損する恐れがある。**

→ **実装着手前に HUMAN が以下の線引きを承認すること:**
- **clean 集客面（vodnavi.jp / site-brand）** には、Google 一般検索で安全な**非成人・教養コンテンツのみ**を置く。FANZA 直結・成人表現はここに置かない。
- **成人インテント・作品導線** は **app.vodnavi.jp の年齢ゲート内**（既に成人コンテキスト）に閉じる。vodnavi.jp は「年齢ゲートへ送る入口」までに留める。
- この分離を守らないと、ピボット先 vodnavi.jp も moterist と同じ末路を辿る。

**検証推奨**: vodnavi.jp の現在 impr 81.8k がどんなクエリ構成か（一般 KW か作品名か）を GSC 検索パフォーマンスの query 別で確認し、adult 比率が低いことを物理確認してから site-brand コラム方針を確定する。

---
*本文書は計画ドラフト。物理的な adult コンテンツの vodnavi.jp 配置（§4 抵触行為）は HUMAN 承認まで実行しない。*
