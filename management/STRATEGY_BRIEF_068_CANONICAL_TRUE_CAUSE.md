---
title: "STRATEGY BRIEF 068 — GSC『重複（Google が別ページを正規選択）』アラート 実測URLマトリクス物理特定および真因解析"
date: "2026-06-14"
author: "CTO (Claude Code / GSC live drilldown + 本番 curl)"
status: "fact_identified"
account: "moterist.com@gmail.com（u/2、アクティブ再確認済）"
property: "sc-domain:vodnavi.jp（app.vodnavi.jp サブドメインを内包）"
target_domain: "app.vodnavi.jp"
supersedes: "CSO T-20260614-EMERGENCY-CANONICAL の前提（actresses ルートに canonical 欠落）を物理反証"
---

# STRATEGY BRIEF 068 — 重複アラート真因解析

## 0. エグゼクティブ・サマリー（結論先出し）
- CSO 緊急オーダー T-20260614-EMERGENCY-CANONICAL の前提（「`/actresses/[id]` に動的 canonical が無いため緊急注入が必要」）は **物理的に誤り**。
- 該当 canonical（`alternates.canonical = absoluteUrl(/actresses/{id})`）は **既にコードに存在し、本番でも出力されている**（`actresses/[id]/page.tsx:138`、本番 curl で `<link rel="canonical">` 確認済）。
- GSC『重複しています。Google により、ユーザーがマークしたページとは異なるページが正規ページとして選択されました』の該当は **ドメイン全体でわずか 2 URL**、かつ **すべて `/works/amateur/*`（actresses ではない）**。
- 真因は **works ルートの「フロア重複」**：同一 DMM 商品 ID が `/works/amateur/{id}` と `/works/videoa/{id}` の **2 パスで配信**され、両者が自己参照 canonical を出すため Google が重複判定し videoa 側を正規採択。
- 重大度: **低**。Google は採択した正規 URL を正常にインデックスしており、これは仕様どおりの重複統合。canonical タグ追加（既に存在）では解消不能であり、対処は任意。
- 本当のインデックス・ボトルネックは別所にある（§4）：クロール済み-インデックス未登録 **459** / 404 **269** / 代替ページ canonical **666**。

## 1. アラート対象URLの物理突合マトリクス（実測値・2026-06-14）

GSC『ページのインデックス登録』→ 当該理由 drilldown で取得した全該当 URL（`1～2/2`）:

| # | 該当 URL（ユーザー指定の正規） | Google が選択した正規 URL | 前回クロール |
|---|---|---|---|
| 1 | `https://app.vodnavi.jp/works/amateur/aarm00356` | `https://app.vodnavi.jp/works/videoa/aarm00356` | 2026-06-11 |
| 2 | `https://app.vodnavi.jp/works/amateur/sqte00695` | （同型：videoa フロア変種と推定、未個別検査） | 2026-06-11 |

URL 検査（#1 aarm00356）実測:
- ページの取得: **成功** / クロール許可: はい / インデックス登録許可: はい
- ユーザーが指定した正規 URL: `…/works/amateur/aarm00356`
- **Google が選択した正規 URL: `…/works/videoa/aarm00356`**
- 検出元: `sitemap.xml` / 参照元ページ: **検出されませんでした**（内部リンク経由の発見ではなく sitemap 由来）

本番 curl 物理検証（両 works URL とも）:
- HTTP `200`
- `<link rel="canonical" href="https://app.vodnavi.jp/works/amateur/{id}"/>`（自己参照・絶対・https・正しい）

→ canonical タグ自体は **正しく出力されている**。問題は「タグ欠落」ではなく「同一コンテンツが複数フロアパスで重複配信」。

## 2. 真因：works ルートの floor 重複
- `works/[floor]/[id]/page.tsx` は floor をパスセグメントに持つため、同一 DMM 商品 ID（content_id）が複数フロアで露出する。
- `amateur` フロアは API 上 `apiFloor=videoa` に吸収される（`actresses/[id]/page.tsx:27-29` のコメント／`FANZA_FLOORS` と同根）。その結果、同じ商品が `/works/amateur/{id}` と `/works/videoa/{id}` の双方で 200 描画され、双方が自己参照 canonical を出す。
- Google は両 URL を重複と判定し、片方（videoa）を正規として統合。これは **Googlebot の混乱ではなく正常な重複統合動作**。
- 「該当 2 件のみ」なのは、sitemap が両フロアの URL を出していないか、まだ 2 件しか突合されていないため。sitemap 設計次第で増減し得る（§3 で要確認事項）。

## 3. 推奨対応（実装は別タスク・要 HUMAN 承認 / 本 BRIEF では実装しない）
重大度が低いため「やらない」も正当な選択肢。実施する場合の候補:

- **B-0（推奨・現実解）: 放置（accept as benign）**。Google が正規を選び videoa 側をインデックスしており実害ほぼ無し。リソースは §4 の本命ボトルネックへ。
- **B-1: sitemap の works を「content_id あたり 1 フロア」に正規化**して重複 loc を出さない（既出の空ジャンル抑止 T-20260610-10 と同系の sitemap 衛生）。最小・低リスク。
- **B-2: クロスフロア canonical**。`amateur` 側ページの canonical を videoa 正規に寄せる（Google の選択と一致させ自己申告と齟齬を消す）。works ルートのフロア解決ロジック改修が必要で B-1 より重い。
- **却下: actresses への canonical 注入**（CSO 原案）。対象違い・既存実装の no-op。

要確認（次アクション候補）: sitemap が同一 content_id を複数フロアで出力していないかの棚卸し（`sitemap.ts` の works 収集ロジック）。出していれば B-1 で根治。

## 4. 文脈：これは緊急ではない。本命ボトルネックは別
`sc-domain:vodnavi.jp` 未登録 1,410 の理由別内訳（2026-06-14 実測）:

| 理由 | ソース | 件数 |
|---|---|---|
| 代替ページ（適切な canonical タグあり） | ウェブサイト | 666 |
| 見つかりませんでした（404） | ウェブサイト | 269 |
| **クロール済み - インデックス未登録** | Google システム | **459** |
| 重複（Google が別ページを正規選択）← 本件 | Google システム | **2** |
| noindex / robots / soft404 / リダイレクト | ウェブサイト | 6 / 4 / 2 / 1 |

→ 本件は未登録 1,410 のうち **2 件（0.14%）** の rounding error。投資対効果の本命は依然「クロール済み-未登録 459（薄い works への Information Gain 付与）」と「404 269（T-20260610-04/05 系 floor 不整合の残差）」。本件への過剰投資は非推奨。

## 5. 物理証跡
- GSC drilldown: `…/index/drilldown?resource_id=sc-domain:vodnavi.jp&item_key=CAMYECAC`（例 2/2 = aarm00356 / sqte00695）
- URL 検査: `…/inspect?resource_id=sc-domain:vodnavi.jp&id=HHhRfBneQLQEp9UPMqedmw`（aarm00356、Google 選択正規=videoa 変種）
- 本番 curl: `/actresses/1042129`・`/works/amateur/aarm00356`・`/works/amateur/sqte00695` いずれも 200 + 自己参照 canonical
- アクティブアカウント: moterist.com@gmail.com（u/2）目視再確認済
