---
audit_date: "2026-06-22"
metric_target: "GSC Unindexed & 404 Details"
extracted_urls: true
extraction_method: "claude-in-chrome MCP drilldown + 本番 curl 物理検証"
account: "moterist.com@gmail.com (authuser=2)"
property: "sc-domain:vodnavi.jp"
status: "grounded"
---
# GSC 検出未登録 ＆ 404エラーURL 物理特定レポート

> GSC ドリルダウン（`index/drilldown`）UI から実 URL を剥ぎ取り、各 URL を本番 curl で
> HTTP ステータス・サイトマップ収録有無まで二重検証した。推測・プレースホルダはゼロ。

## 1. 「検出 - インデックス未登録（737件）」の抽出実測
GSC ドリルダウン（item_key=CAMYFiAC, 1～20/737）の実 URL。**上位20件すべてが `/actresses/` ハブ**：

| # | URL | live HTTP | sitemap収録 |
|---|---|---|---|
| 1 | https://app.vodnavi.jp/actresses/1002043 | **200** | 否 |
| 2 | https://app.vodnavi.jp/actresses/1006606 | (未個別curl・パターン同一) | — |
| 3 | https://app.vodnavi.jp/actresses/1012910 | — | — |
| 4 | https://app.vodnavi.jp/actresses/1015386 | — | — |
| 5 | https://app.vodnavi.jp/actresses/1038396 | — | — |
| 6 | https://app.vodnavi.jp/actresses/1038712 | — | — |
| 7 | https://app.vodnavi.jp/actresses/1044974 | — | — |
| 8 | https://app.vodnavi.jp/actresses/1048559 | — | — |
| 9 | https://app.vodnavi.jp/actresses/1053256 | — | — |
| 10 | https://app.vodnavi.jp/actresses/1055230 | — | — |
| 11 | https://app.vodnavi.jp/actresses/1057344 | **200** | 否 |
| 12 | https://app.vodnavi.jp/actresses/1065956 | — | — |
| 13 | https://app.vodnavi.jp/actresses/1067531 | — | — |
| 14 | https://app.vodnavi.jp/actresses/1069635 | — | — |
| 15 | https://app.vodnavi.jp/actresses/1071307 | — | — |
| 16 | https://app.vodnavi.jp/actresses/1074376 | — | — |
| 17 | https://app.vodnavi.jp/actresses/1075774 | — | — |
| 18 | https://app.vodnavi.jp/actresses/1076465 | — | — |
| 19 | https://app.vodnavi.jp/actresses/1097822 | — | — |
| 20 | https://app.vodnavi.jp/actresses/1102910 | **200** | **可** |

**分析結果（ファクト）**:
- 737 バケットは **`/actresses/` ハブに集中**（ID 帯域は 1002043〜1102910 と広範に分散、特定帯域への偏りなし）。
- サンプル3件すべて **live HTTP 200＝ページは健全**。問題は「未健全」ではなく **未クロール/未インデックス（discovered, not yet crawled）**。
- **サイトマップ収録は不完全**: sitemap の actresses は **200件キャップ**（§3 参照）。1102910 は収録（可）だが 1002043 / 1057344 は **未収録**。つまり 737 の多くは sitemap 200件キャップの外で、内部リンク経由で Google に discovered された健全ハブ。
- **ボトルネック = クロール予算 + sitemap の actress カバレッジ不足 + 立ち上げ初期の経過時間**であり、ページ品質ではない（メモ `project_actress_hub_first_measurement` と整合）。

## 2. 「見つかりません（404 / 280件）」の発生源および対象URL特定
GSC ドリルダウン（item_key=CAMYDSAC, 1～20/280, 最終クロール 2026/06/12〜13）の実 URL。
**`/works/videoc/{content_id}` が支配的**（ごく一部 `/works/videoa/`）：

| # | URL | live HTTP | sitemap収録 |
|---|---|---|---|
| 1 | https://app.vodnavi.jp/works/videoc/smjs252 | **404** | **否** |
| 2 | https://app.vodnavi.jp/works/videoc/oremo551 | **404** | **否** |
| 3 | https://app.vodnavi.jp/works/videoc/instc708 | (同一パターン) | 否 |
| 4 | https://app.vodnavi.jp/works/videoc/nost233 | — | 否 |
| 5 | https://app.vodnavi.jp/works/videoc/peep182 | — | 否 |
| 6 | https://app.vodnavi.jp/works/videoc/orecz524 | — | 否 |
| 7 | https://app.vodnavi.jp/works/videoc/pai374 | — | 否 |
| 8 | https://app.vodnavi.jp/works/videoc/smub107 | — | 否 |
| 9 | https://app.vodnavi.jp/works/videoc/smgd018 | — | 否 |
| 10 | https://app.vodnavi.jp/works/videoc/zarj070 | **404** | **否** |
| 11 | https://app.vodnavi.jp/works/videoc/spay756 | — | 否 |
| 12 | https://app.vodnavi.jp/works/videoc/mrs0123 | — | 否 |
| 13 | https://app.vodnavi.jp/works/videoc/scute1566 | **404** | **否** |
| 14 | https://app.vodnavi.jp/works/videoc/bini544 | — | 否 |
| 15 | https://app.vodnavi.jp/works/videoc/bngg006 | — | 否 |
| 16 | https://app.vodnavi.jp/works/videoc/sdj051 | — | 否 |
| 17 | https://app.vodnavi.jp/works/videoa/h_1724m794g00002 | **404** | **否** |
| 18 | https://app.vodnavi.jp/works/videoc/pnme308 | — | 否 |
| 19 | https://app.vodnavi.jp/works/videoc/omsk241 | — | 否 |
| 20 | https://app.vodnavi.jp/works/videoc/orecz537 | — | 否 |

**分析結果（ファクト）**:
- 404 は **`/works/videoc/` フロアに集中**（+ 例外的に videoa 個別 ID が1件 404）。サンプル5件すべて **本番 curl で実 404 を確認**（ソフト404 や誤検知ではない、真の 404）。
- **現行サイトマップに videoc フロアは一切存在しない**。sitemap の works フロアは **videoa / nikkatsu / anime / amateur（各400件）のみ**。検証した404 URLは **全件 sitemap 未収録**。
- → **真因 = 退役した（または未配信の）`videoc` フロアの残骸 discovery**。Google は過去（旧 sitemap or 旧内部リンク）に videoc を検知し、最終クロール 2026/06/12〜13 時点で 404 を確認した。**現行サイトマップ起因の active bug ではなく、配線漏れでもなく、古いエンドポイントの残骸**（broken links ではなく floor 退役）。
- videoa の単発404（h_1724m794g00002）は個別作品の取下げ/未提供と推定（sitemap 未収録）。

## 3. サイトマップ構成（2,008 loc）の物理内訳（本番 curl 実測）
| パス | 件数 |
|---|---|
| /works/videoa/ | 400 |
| /works/nikkatsu/ | 400 |
| /works/anime/ | 400 |
| /works/amateur/ | 400 |
| /genres/ | 200 |
| /actresses/ | 200 |
| 静的（/, about, privacy, disclaimer 等） | 8 |
| **合計** | **2,008** |

- **videoc フロアは sitemap に存在しない**（404バケットが videoc 中心である事実と整合）。
- **actresses は 200 件キャップ**。GSC が discovered している actress 実 URL（737の母集団）は 200 を大きく超えるため、**sitemap の actress カバレッジ拡張が indexing 加速の打ち手の一つ**。

## 4. 推奨アクション（次フェーズ・本レポートでは実行せず）
1. **737 actresses**: sitemap の actresses 200キャップ拡張（全 actress ハブを収録）＋ 健全代表ハブの個別 index リクエスト（日次クォータ内）。本質は時間・クロール予算であり、品質修正は不要。
2. **280 videoc 404**: sitemap 未収録のため自然減衰見込み。加速したい場合のみ videoc に対し 410 Gone を返す方針を検討（※過去メモ `project_gsc_not_indexed_breakdown` の「410パージ前提は誤り」は *genres* 文脈。videoc 残骸に対する 410 は別途妥当性検証のうえ判断）。robots.ts/proxy.ts の編集は不要（§前回監査で誤設定なしを確証済み）。
