---
title: "STRATEGY BRIEF 061 — /genres/{id} 404 の B-1 止血実装（フロア巡回探索）"
date: "2026-06-10"
author: "CSO (Gemini 3) / CTO 実装・検証"
status: "code_landed_tsc_build_0__prod_verify_pending_redeploy"
target_domain: "app.vodnavi.jp"
resolution: "/genres/{id} を videoa 固定→ FANZA_FLOORS 巡回(videoa/anime/nikkatsu)で items>0 のフロアを採択し 200 描画"
related: "STRATEGY_BRIEF_060_404_DIAGNOSIS / project_gsc_not_indexed_breakdown"
---

# STRATEGY BRIEF 061

## 1. 執行結論
BRIEF_060 で特定した「sitemap が全フロアの genre を出力する一方、route が `floor:"videoa"` 固定で
anime/nikkatsu 専属ジャンルを `notFound()` セルフキルしていた能動的シグナル汚染」に B-1 案を適用。

## 2. 実装（surgical / 全置換ではない）
`app-concierge/src/app/(site)/genres/[id]/page.tsx` を以下の最小編集で改修（既存の metadata / `ProductGrid` /
`EmptyState` / `getGenreEditorial` / 関連ジャンル UI 等はすべて維持）：
- `getGenrePage()` を `videoa` 固定から **`GENRE_FLOORS` 巡回**へ。候補は `FANZA_FLOORS.map(f=>f.apiFloor??f.code)`
  の重複排除で導出（= videoa / anime / nikkatsu、amateur は apiFloor=videoa に吸収）。最初に items>0 の
  フロアを採択し `{items,totalCount,genreName,floor}` を返す。各フロア取得は try/catch で失敗時は次へ。
- どのフロアにも作品が無いジャンルは従来通り `items.length===0 → notFound()`（真に存在しない genre は 404 のまま＝正しい）。
- `getRelatedGenres(id, floor)` に解決済みフロアを渡し、関連ジャンルも同フロアから提示（整合）。
- `FANZA_FLOORS` を値インポートへ変更（従来は type-only）。

## 3. 検証（物理）
- `npx tsc --noEmit` → **exit 0**。
- `npm run build`（next build） → **exit 0**、15/15 ページ生成、`/genres/[id]` は ƒ（動的・revalidate 300）で
  リクエスト時にフロア解決。
- `AGENTS.md`（非標準 Next.js）順守: 新規 Next API は不使用、既存ファイルの idiom（Promise params /
  `fetchItemList` シグネチャ）に厳密準拠。

## 4. スコープと未確定事項（正確化）
- **本実装が救済するのは `/genres/{id}` のみ**。`/works/videoc/*`（BRIEF_060 真因A）は genre ではなく
  works の旧 floor_code 残骸で、sitemap 非出力のため**本実装の対象外＝引き続き自然消滅**（必要なら別途 410）。
- **本番の 404→200 はこのコミットでは未確定**。反映には HUMAN による redeploy が必要、さらに GSC 上の
  237 件の再インデックスは Google の再クロール待ちで**即時ではなく漸進的**。「成約貢献開始」と断定しない。
- 次工程: redeploy 後に `/genres/4076` 等を curl で 200 物理確認 → GSC で「見つかりませんでした(404)」件数の
  逓減を後日モニタリング。
