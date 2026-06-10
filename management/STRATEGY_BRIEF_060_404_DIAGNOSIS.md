---
title: "STRATEGY BRIEF 060 — app.vodnavi.jp 内製404（237件）のルーティング/sitemap不整合 真因特定"
date: "2026-06-10"
author: "CSO (Gemini 3) / CTO 物理解析・結論追記"
status: "diagnosed_by_code_and_curl"
target_domain: "app.vodnavi.jp"
symptom: "/genres/{id} および /works/videoc/{code} の 2026/05/17 以降のバースト的404検出"
related: "STRATEGY_BRIEF_059_INDEXING_FORTRESS / project_gsc_not_indexed_breakdown"
---

# STRATEGY BRIEF 060

## 1. 物理データが突きつけた危機（診断）
GSC 監査の結果、旧 WordPress 残骸ではなく、現行 Next.js アプリ（app.vodnavi.jp）自体の特定URL
（`/genres/4076` 等、`/works/videoc/*` 等）が合計 237 件の 404 を返していることが確定。
「動的サイトマップで URL を送信しておきながらアクセスすると 404」というインデックス上最悪の不整合。

## 2. 調査軸（CSO 原案）
1. ルーティング層の欠陥（`videoc` フロアの弾き）
2. DB/API 同期の欠陥（delisted CID）
3. SSG/ISR 生成漏れ

## 3. CTO 物理解析結果（2026-06-10、コード読取 + 本番 curl）
**FANZA_FLOORS の code = `videoa` / `amateur` / `anime` / `nikkatsu` の4種のみ（`types.ts:156`）。`videoc` は存在しない。**

### 真因A — `/works/videoc/*` = レガシー・キャッシュURL（発生源は既に修正済）
- 旧 sitemap が `item.floor_code`（FANZA API 返却値、videoc 等）を URL に直接埋めていた残骸を Google がキャッシュ（クロール 2026/05/17-27）。
- 再クロール時、`works/[floor]/[id]/page.tsx` の `getWork("videoc", id)` が `FANZA_FLOORS.find(code==="videoc")=undefined` →
  **fallback `FANZA_FLOORS[0]`=videoa** で cid を引く → videoc 作品は videoa に不在 → 0件 → `notFound()` → 404。
- **現 sitemap.ts は `floor.code` のみ出力（videoc 非出力）**、`normalizeFloorForUrl` ヘルパも対策済。
- 判定: **能動的汚染源ではない**。sitemap に含まれないため自然に de-index される。加速したい場合のみ未知フロアに 410 を返す。

### 真因B — `/genres/{id}` = sitemap↔ルートの能動的フロア不整合（現在進行形バグ）★要対応
- `sitemap.ts:96` は `item.iteminfo.genre` を**全フロア（videoa/anime/nikkatsu）**の item から収集して `/genres/{id}` を出力。
- 一方 `genres/[id]/page.tsx:29-37` は **`floor:"videoa"` 固定** + `article=genre` で引く。
- → anime/nikkatsu **のみ**に出現するジャンルは videoa で 0件 → `:151 notFound()` → 404。
- **sitemap が出した URL を route 自身が殺している**＝Google への能動的シグナル汚染。これが残存 404 の主因。

### 実測（本番 curl, read-only HEAD, 2026-06-10）
`/genres/4076`=404 / `/genres/6114`=404 / `/genres`(裸)=404 / `/works/videoc/iat041`=404 / `/works/videoc/iat042`=404
／ 対照 `/works/videoa/gkok00002`=200 / `/works/anime/196glod00406`=200。コード機序と完全一致。

## 4. 止血手法の選択（ファクトベース提言）
- **B（genres, 主因・優先）**: 2案。
  - **B-1 推奨**: genres ページを「ジャンルが実在するフロアで引く」よう修正し **200 描画**へ復帰。
    ジャンルページは記事戦略の「ジャンル特集ハブ」資産そのもの（[[project_gsc_search_intent_title_dominant]] 柱②）なので、殺すより活かす。
    実装案: `article=genre` 取得を videoa 固定でなく全 FANZA_FLOORS をフォールバック探索（最初に items>0 のフロアを採用）。
  - **B-2 最小止血**: sitemap の `genreMap` を **videoa 由来ジャンルのみ**に絞り、404 になる URL を出力しない。
    記事資産化を諦める場合の暫定。
- **A（videoc, 残骸）**: 低優先。sitemap 非出力で自然消滅。加速するなら works ルートで「未知フロア（FANZA_FLOORS.code 不一致）」時に `notFound()` ではなく **410 Gone** を返す。
- **共通注意**: `app-concierge/AGENTS.md` 通り当 Next.js は非標準改変版。実装前に `node_modules/next/dist/docs/` を確認。env/redeploy は HUMAN。

## 5. 次アクション
HUMAN 承認後、B-1（推奨）の実装に着手。実装は別タスクとして起票し `tsc`+`next build`+本番 curl 200 で verify。
