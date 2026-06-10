---
title: "STRATEGY BRIEF 064 — 潜伏期（データインキュベーション）ガバナンス + 柱③情報比較ハブの先行検討"
date: "2026-06-11"
author: "CSO (Gemini 3) / CTO 採番・データ整合修正"
status: "active_incubation"
target_domain: "app.vodnavi.jp / vodnavi.jp"
related: "project_gsc_search_intent_title_dominant / project_gsc_not_indexed_breakdown / project_actress_hub_pillar1"
---

# STRATEGY BRIEF 064

> 採番注 (CTO 2026-06-11): CSO 原案は本ブリーフを root `STRATEGY_BRIEF_065.md` としたが、既存最新は **063**。
> 番号飛ばしを避け次の空き番号 **064** に採番、配置を `management/` に修正。あわせて CSO の
> `cat > TASK_BOARD.md`（root 全文上書き）は実 board(`management/TASK_BOARD.md`, 207KB)を破壊するため
> **不採用**（board は T-08 DONE まで既に最新）。

## 1. 潜伏期（コードフリーズ）の定義
本日(2026-06-11)で土台修復(PR #35/#36)と柱①女優ハブ17名(PR #37-#42)が本番 landed・物理検証完了。
ここから最低数日は **検索面のコード改変を止め(Code Freeze)**、Google の再クロール/再評価ノイズを排除する。
submit 済 sitemap(works 1600 / genres 200 / actresses 200 = 計2,008 URL)のインデックス浸透のみを観測する。

## 2. 観測タスク（read-only、改変なし）
1. **GSC 検出ページ数**: 「クロール済み-未登録(504)」「見つかりませんでした404(237)」の逓減、`/actresses/`・`/genres/` のインデックス状況。
2. **女優クエリ掲載**: 女優名単体クエリの着地が個別作品ページから `/actresses/[id]` へ移るか（順位/CTR）。
3. **sitemap ステータス反転**: app sitemap が「成功・検出>0」へ反転する物理確認（現在 Google 再読込待ち）。

## 3. 柱③「情報・比較系」ハブ — 先行検討（ただし需要は要再確認）
CSO は柱③（`/guides/` 等、「[女優] 無料 視聴」「FANZA おすすめ」「サブスク 比較」）の先行配線を提案。
**ただし重要な留保**: 2026-06-10 の GSC 分析で、情報・比較系正規表現(`無料|見放題|配信|どこで|サブスク|おすすめ|比較|vod`)は
**29クリック/1,108表示しかなく、その大半もタイトル内包含**（純粋な情報系検索はほぼ0）。柱②(genre)同様、
**柱③も現 GSC 需要は薄い**＝即効の集客にはならない。位置づけは「topical authority / 将来の長尾ベット」であり、
**潜伏期の効果測定で柱①の伸びを見てから着手判断**するのが正。先行で大規模実装はしない。

## 4. ガバナンス要件
- 既存 SEO 資産（作品個別 URL `/works/[floor]/[id]`、moterist 5記事、clean vodnavi.jp）は**1mm も毀損しない**完全アドオン型。
- moterist.com は完全凍結・識別生存を維持。
- 成人境界=app 年齢ゲート内のみ。clean 面 vodnavi.jp 直載せ禁止。
- 実装着手時は B-1 同様に tsc/build + ローカル sitemap 検証 + PR→main + 本番 curl の verify ゲートを通す。
