---
title: "STRATEGY BRIEF 063 — 女優別作品名鑑ハブ（柱①）実装 + 世界観テキスト発注計画"
date: "2026-06-10"
author: "CSO (Gemini 3) / CTO 実装・検証"
status: "code_landed_tsc_build_0__live_render_verify_pending_deploy"
target_domain: "app.vodnavi.jp"
pilot_target: "七沢みあ (ID: 1042129) 他"
related: "STRATEGY_BRIEF_062_ACTRESS_HUB / STRATEGY_BRIEF_061_404_RESOLUTION"
---

# STRATEGY BRIEF 063

## 1. 実装方針
BRIEF_062 の API 実証に基づき、本番で 200 描画している `(site)/genres/[id]/page.tsx`（floor-walk 実装済、BRIEF_061）を
**忠実にクローン**して女優ハブを新設。CSO 原案の stub（女優名ハードコード・データ取得未実装・`(site)` 欠落パス・
同期 params）は**不採用**（薄ページ=504 を自ら作る/規約違反のため）。

## 2. 実装内容（surgical / 全置換でない新規 + sitemap 追記）
- **新規** `app-concierge/src/app/(site)/actresses/[id]/page.tsx`: `genres/[id]` を `article:"actress"` 化。
  `ACTRESS_FLOORS`(=FANZA_FLOORS の apiFloor/code 重複排除=videoa/anime/nikkatsu) を巡回し最初に items>0 の
  フロアで 200 描画、作品0は `notFound()`。`actressName` は `iteminfo.actress` から解決。関連女優 = 同フロア
  ランキングの共演女優。`generateMetadata`（title=「{名} 出演作品一覧｜新作VOD」/ canonical / OG / noindex フォールバック）。
- **新規** `src/lib/actress-editorial.ts` + `src/data/actresses-editorial.json`（空 {}）: genre-editorial と対称。
  薄ページ回避の Information Gain リード文を CCO が JSON へ投入すると H1 直下に描画（未投入時は graceful 非表示）。
- **sitemap 追記** `src/app/sitemap.ts`: works 走査中に `iteminfo.actress` を `actressMap` 集約し `/actresses/{id}` を
  最大200件出力（パス形式＝`&` なし、ページが歩く同フロア群から収集＝genre の sitemap↔route 不整合を構造的に回避）。

## 3. 検証（物理）
- `npx tsc --noEmit` exit 0 / `npm run build` exit 0（`/actresses/[id]` は ƒ 動的 revalidate300）。
- **ライブ 200 描画はローカル検証不可だった**: 本セッションの多数 API 呼び出し＋ローカルサーバ2回起動の並列 fetch で
  **ローカル IP が DMM API にレート制限**され、全 FANZA 呼び出しが 400（article なし基本疎通も 400）。
  → 本番 app.vodnavi.jp は健全（homepage 200 / 作品63件）を確認済＝api_id 全体 BAN ではなく**ローカル IP 限定の一時スロットル**、コード起因ではない。
- **本番 200 描画 verify は deploy 後**（Vercel IP は非スロットル）に `/actresses/1042129` 等を curl で実施。

## 4. CCO 発注（世界観テキスト）
GSC 需要上位の女優（七沢みあ=1042129 等）から、`src/data/actresses-editorial.json` に `editorialLead`（300〜500字、
『ビブリア・エロティカ』トーン、チープなアフィリエイト臭排除）を投入。コード変更不要で順次公開される。

## 5. 残
deploy 後: ① 本番 `/actresses/1042129` curl 200 + DOM 実描画確認 ② `sitemap.xml` に `/actresses/` 反映確認
③ GSC 再送信 → 検出ページ増のモニタ。成人境界=app 年齢ゲート内のみ。
