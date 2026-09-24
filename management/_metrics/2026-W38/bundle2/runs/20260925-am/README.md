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
