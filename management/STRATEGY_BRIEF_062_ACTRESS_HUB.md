---
title: "STRATEGY BRIEF 062 — 女優別作品名鑑ハブ（柱①）のプログラマティック自動生成 実現可能性解析"
date: "2026-06-10"
author: "CSO (Gemini 3) / CTO 物理解析"
status: "feasibility_confirmed_by_api__impl_pending_approval"
target_domain: "app.vodnavi.jp"
pillar: "柱①：女優まとめ／特集ページ【最優先・低工数】"
related: "project_gsc_search_intent_title_dominant / STRATEGY_BRIEF_061_404_RESOLUTION"
---

# STRATEGY BRIEF 062

## 1. 背景（データ駆動）
404止血（BRIEF_061）が本番通電で完了。リソースを検索意図の中流（女優名・女優名 av・作品一覧）の
総取りへ向ける。GSC 実データでも作品タイトル検索が95%だが、その多くは女優名を含む（例「七沢みあ10
タイトル」33クリック）。女優単位のハブは「タイトル検索の上流」を受け止める最有力の記事資産。

## 2. CTO 物理解析結果（2026-06-10、コード読取 + FANZA API 実照会）
- **既存ルート**: `app-concierge/src/app/(site)/` 配下に `genres/[id]`・`works/[floor]/[id]` はあるが
  **`actresses/` は未存在**＝新設。
- **API 対応**: `fetchItemList` は `article`+`article_id` 対応済（`client.ts`）、`types.ts` の `DmmArticle` に
  `"actress"`、`DmmItemInfo.actress: {id,name}[]` 定義済。`article:"actress"` の利用箇所はまだ0。
- **実現可能性 実証**: `article=actress&article_id=1100580(紗弥佳)` → **status=200 / total_count=12 / 実作品返却**。
  女優IDは人気作品の `iteminfo.actress[].id` から採取可（七沢みあ=1042129 等）。**エンドツーエンドで動作確認済**。
- **転用元**: 既に floor-walk 化した `genres/[id]/page.tsx`（BRIEF_061）が `article=genre`→`article=actress` の
  置換でほぼそのまま流用できる（同一 `fetchItemList` 形）。

## 3. 実装設計（B-1 と同じ surgical/低リスク方針）
1. **ルート新設**: `(site)/actresses/[id]/page.tsx`。`genres/[id]/page.tsx` を雛形に複製し `article:"actress"` 化。
   フロア巡回（`GENRE_FLOORS`=videoa/anime/nikkatsu）で items>0 のフロア採択→200、0件は notFound（死URL汚染を作らない）。
2. **sitemap**: `sitemap.ts` で works 走査中に `item.iteminfo.actress` を `actressMap` に集約し `/actresses/{id}` を出力
   （genres と同じパターン、上限 N 件、**空ジャンル教訓 [[T-20260610-10]] と同様に items 担保のもののみ**）。
3. **薄いページ回避（重要）**: 単なるグリッドだけだと「クロール済み-未登録」化する（現に 504 件存在）。
   女優ごとの editorial lead（`genre-editorial` 相当の `actress-editorial`）+ 代表作/総作品数/関連女優 内部リンクで
   情報量を付与。`generateMetadata`（title=「{女優名} 出演作品一覧｜新作VOD」、canonical、OG）配置。
4. **世界観**: `BRAND_DESIGN_GUIDE.md`（ダークゴールド）準拠、既存 `ProductGrid`/`EmptyState` 再利用。
5. **検証**: `npx tsc --noEmit` + `next build` + 本番 curl 200（B-1 と同じ verify ゲート）。`AGENTS.md` 非標準 Next.js 順守。

## 4. スコープ/留意
- 本ブリーフは**解析と設計**まで。実装は別タスク（要 HUMAN 承認、B-1 同様に PR→main→本番）。
- 成人境界: app.vodnavi.jp（年齢ゲート内）のみ。clean 面 vodnavi.jp への直載せはしない（既存方針堅持）。
- 次手: 承認後に `actresses/[id]` 実装 → sitemap 配線 → editorial 数件で pilot → GSC で女優クエリの掲載/CTR をモニタ。
