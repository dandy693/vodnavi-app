# 束2 段階② 朝の抽出（2026-09-25）

**5軸**: ①X リスト `vodnavi-targets` のタイムライン ②窓＝**2026-09-24 21:01:44 JST 以降**（前回走査の開始）・**走査開始 05:31:12 JST（06:00 の定時より前＝HUMAN 指示で前倒し）**・生成まで 05:40:55 ③X 読み取り（Chrome・DOM）＋ Airtable／Supabase MCP ④自アカウント実測 ⑤窓内の非リポスト 32 件。補完 0。

## 0. 配信前再検査（手順 1.5・posts 当日予約 1 件）

- **🔴配信前NG: `W9-15`（TG-15・予約 9/25 21:00 JST・承認済）＝`g16_article_interval`（fanza-first-guide の前回使用 2026-09-25 から 0 日）。**
- **【CTO の所見・断定しない】`TG_LAST_USED` の fanza-first-guide＝2026-09-25 は、2026-09-17 に本レコード自身の予約として登録した値（FACT §13-9 ②）。登録基準が「予約済み」を含むため、当日の再検査で自分自身と衝突している可能性が高い。実際の直前使用は TG-22（9/12）＝13 日前。** 是正（承認を外す／そのまま配信）は HUMAN・CSO。CTO は posts を書かない。
- 検査不能: g9 / g12 / g19 / g20 / g21。記録 → `management/_metrics/2026-W38/preflight/20260925/`。

## 1. 窓内 32 件の処理

| 区分 | 件数 | 内訳 |
|---|---|---|
| 入力（生成） | 10 | Madonna jur00854／PREMIUM pred00901／Fitch nima00086／attackers atid00698／kawaii cawb00039／honnaka hmn00904（品番 HMN-904 → sitemap_works_archive で解決）／wanz waaa00697／FANZAdougaX（こだわりのフェラ第3弾・知識なし）／MOODYZ mimk00288／IDEAPOCKETTER ipzz00912 |
| 停止 | 6 | S1_No1_Style（priority 3 週枠 2/2） |
| 除外（件数のみ） | 6 | 女優本人の写真展・配信お礼・予定告知 5（Aizawa_miyu03 3／mio_sakai_ 1／ran_tpowers 1）／動画フロア外（FANZAブックス）1（DMM10sale） |
| 同一ハンドル 2 件目以降（提示しない） | 10 | MOODYZ 4・IDEAPOCKETTER 3・PREMIUM 1・Madonna 1・attackers 1 |

- content_id: 本文中の `id%3D` 文字列 8 件＋品番 1 件。**FANZAdougaX の t.co は 1 段目の Location が `rcv.ixd.dmm.com`（クリック計測）のため不解決**（resolve-cid.json）。
- 知識: 9 件とも cache ヒット（videoa）。
- 生成: 10 行 28 案・全ガード通過（drafts.txt）。
- Q: 提示 2（PREMIUM pred00901 / Fitch nima00086・works ページ 200）・上限外 6・対象外 2（quotes.json）。**Q の 2 件はリプ案と同じ対象投稿＝どちらか一方のみ可。**

## 2. フォロー候補（基盤D-2・CSO裁定 2026-09-24 夜の新取得元 (b)）

- 9/24 に返信した対象投稿のリポスト一覧: MOODYZ 2102789090336985344（10 名）／PREMIUM 2103016594406555944（5 名）／FANZAdougaX 2102850518892920926（5 名・前回取得不能分）／fanza_sns 2102925993518215308（1 名）。引用一覧（FANZAdougaX）は 0 件。wanz は未確認。
- **提示 10 件**（follow-candidates.json）。除外: x_targets 登録済み 1（hosimiyaichika）・店舗 1（booksdandykanda）・AV ライター 1（saori_462）・アフィリエイトサイト運営 1（yofukashinavi）。

## 3. 投稿と記録（2026-09-25 06:24〜06:37 JST）

投稿は HUMAN・全件手直しなし。見送り＝kawaii・honnaka・IDEAPOCKETTER・FANZAdougaX。

| 種別 | 対象 | 案 | 投稿 | 配信（snowflake） |
|---|---|---|---|---|
| リプ | Madonna_AVinfo 2103146198580568275 | B | 2103234052363100321 | 06:24:08.939 |
| リプ | attackers_av 2103137392798634406 | A | 2103234264762593505 | 06:24:59.579 |
| リプ | wanz_official 2103137888166986023 | A | 2103234495096963256 | 06:25:54.495 |
| リプ | MOODYZ_official 2103145689752711449 | A | 2103234650546294979 | 06:26:31.557 |
| 引用 | PREMIUM_AV 2103152235022856660 | Q1 | **2103235699311075660** | 06:30:41.602 |
| 引用 | Fitch_official 2103151226225607061 | Q1 | **2103235911052095931** | 06:31:32.085 |

- **引用 2 本の判別**: `curl`（UA Twitterbot）で各投稿ページの `<title>` を読み、…5660＝「収録123分…釈アリスさん…」（本文中「釈アリス」8 回）＝PREMIUM／…5931＝「本作は収録121分…彩月七緒さん…」（「彩月七緒」8 回）＝Fitch。**引用元の投稿 ID は返却 HTML に含まれず、判別は本文一致による。**
- X 実在: 6 件とも HTTP 200・無効 ID 対照 404。
- 記録: `record.mjs --create`（リプ 4・Q 2）→ MCP create（createdTime 06:36:15 JST・reply_post_id / posted_at 同梱）→ x_targets update（リプ 4＝last_reply_at／Q 2＝last_quote_at・PREMIUM / Fitch の last_reply_at は不変）→ **読み戻し 6＋6 件とも全項目一致**。
- **x_replies 累計 51 件**（9/25＝6）。priority 3 の消費 0。**works リンク投稿は Q 2 ＋ TG 21:00＝3 で本日上限（CSO裁定 2026-09-25 朝 3）。**

## 4. CSO裁定（2026-09-25 朝）の反映

1. W9-15 は誤検知・承認のまま配信 → `preflight-today.mjs` の g16 に自レコード予約日の除外を実装（`preflight-after-fix.json` で PASS／対照 `readback-negctl-0927.json` で NG）。
2. 一斉発売日の提示上限（最大 4 件・同じ質問 1 日 1 回）→ README 手順 0・FACT §26-11-1。
3. works リンク上限＝本日 3 で到達。
