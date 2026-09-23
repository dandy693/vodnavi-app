# 投稿キュー補充 2026-09-24（W12・CSO 指示 2026-09-24 朝 ③②）

**5軸ラベル**: ①対象範囲＝Airtable `posts`（`tblZMqvjtJY8MfaWZ`）全件 ②期間＝**2026-09-24 06:58〜07:09 JST**（各ログに秒単位の `ts`）③計測系＝MCP `list_records_for_table` / `create_records_for_table` / `update_records_for_table` ＋ FANZA API 直接照会（`generate-t1.mjs` / `sync-actress-table.mjs`）④出典＝自社 base の実測 ⑤機会の数＝posts **131 → 138 行**。

## 契機

**配信前再検査のために `posts` を読み戻した際、9/26（土）以降の予約が 0 件であることが判明した**（`CLAUDE.md` 週次チェック手順 0 / FACT §13-9 の Check 条件に該当）。**本日は木曜 PDCA の日でもある。**

| 補充前の予約残 | |
|---|---|
| 9/24（木） | `W11-07 T1改 楪カレン MIMK-244`（承認済・21:00） |
| 9/25（金） | `W9-15 TG-15 ガイド誘導 登録前の全体像`（承認済・21:00） |
| **9/26（土）〜10/2（金）** | **0 件** |

ステータス別（131 件）＝投稿済 127 / 承認済 2 / ストック 1（`W9-01`・10/19 以降に再判定＝CSO裁定 2026-09-17）/ エラー 1。

## 時系列（JST・実測）

| 時刻 | 事象 | 証跡 |
|---|---|---|
| 06:58〜07:00 | `posts` 全 131 件を読み戻し（2 ページ）→ dump 化。**件数 131 で一致** | `posts_dump_20260924.json` / `build-dump.mjs` / `page2.tsv` |
| **07:01:11** | **FANZA API 疎通 `floor=videoa&sort=rank&hits=1` → HTTP 200**（`result_count=1` / 363ms）＝§13-8-1 恒久手順 ① | `ping-fanza.mjs` |
| 07:01:33 | `sync-actress-table.mjs` **dry-run**: `t_attempted=53 / u_total=0 / u_rate=0 / n_added=1 / n_changed=0 / n_removed=0` → 件数目視 ② | `sync-actress-dryrun-20260924.log.txt` |
| 07:01:52 | 同 **`--write`**（W11-07 楪カレン 9/24 を追加）④ | `sync-actress-write-20260924.log.txt` |
| 07:0x | **`TG_LAST_USED` は dump と完全一致・更新不要**（直近の TG は 9/16 TG-24 配信済み・9/25 TG-15 予約済みで既に反映済み） | 本 README |
| 07:0x | `generate-t1.mjs --slots 9/26〜10/2 21:00 --id-prefix W12 --recent X4,X5,X1,X2,X3 --existing dump` → **7 件生成・全 PASS** | `generate-t1-20260924.log.txt` / `w12-t1-generated.json` |
| 07:05:28 / 07:06:15 | MCP `create_records_for_table` × 2（1 + 6 件・`ストック`・予約日時なし） | `w12-create-payload.json` / `build-create-payload.mjs` |
| 07:07:28 | 読み戻し 7/7 → **`reguard-before-approve.mjs`（読み戻し値でガード23件 再実行）＝mismatch 0・PASS**（`textFrom: airtable` 7/7） | `w12-readback-stock-20260924.json` / `reguard-before-approve-20260924.log.txt` |
| 07:0x | `update_records_for_table` × 1: **`承認済` ＋ 予約日時 `2026-09-26..10-02T12:00:00.000Z`**（21:00 JST・**Z 終端**） | — |
| 07:0x | 承認後の読み戻し 7/7 → **予約日時の JST 換算が想定枠と全件一致**（機械検算） | `append-approved.mjs` / `posts_dump_20260924_after.json` |
| 07:08:43 / 07:09:02 | `sync-actress-table.mjs` dry-run → **`--write`**（承認済 7 件を予約済みとして登録・`n_added=5 / n_changed=2 / src_new=8`）＝§13-8-2 の定常ステップ | `sync-actress-dryrun-after-20260924.log.txt` / `sync-actress-write-after-20260924.log.txt` |

## 投入後の日付別件数（読み戻し・JST）

| 日付 | 21:00 | 22:30 | 計 |
|---|---|---|---|
| 9/24（木） | W11-07 T1改 楪カレン MIMK-244 | — | 1 |
| 9/25（金） | W9-15 TG-15 ガイド誘導 登録前の全体像 | — | 1 |
| **9/26（土）** | **W12-01 T1改 石川澪 MIDV-229（X5）** | — | 1 |
| **9/27（日）** | **W12-02 T1改 河北彩花（河北彩伽） SNOS-377（X1）** | — | 1 |
| **9/28（月）** | **W12-03 T1改 希望みう SNOS-299（X2）** | — | 1 |
| **9/29（火）** | **W12-04 T1改 九野ひなの MIDV-855（X3）** | — | 1 |
| **9/30（水）** | **W12-05 T1改 二葉エマ ROYD-170（X5）** | — | 1 |
| **10/1（木）** | **W12-06 T1改 美谷朱音（美谷朱里） HNDB-221（X1）** | — | 1 |
| **10/2（金）** | **W12-07 T1改 七沢みあ MIDV-174（X2）** | — | 1 |

- **0 件の日は無い**（本日〜翌週水曜 9/24〜9/30 のいずれも 1 件以上）。
- 7 件とも `承認済`・`リンク種別=サイト`・ポストID 空・エラー詳細 空。
- **在庫アラート換算（承認済かつ 4 日後以降＝9/28 21:00 以降）＝5 件（閾値 6 未満）**——**本日 10:00 のアラートは鳴る見込み。**
- **22:30 枠は 9 日とも空**（CSO裁定 2026-09-17 22:5x ①「21:00 のみで受容。22:30 枠は束3 の実装後に充てる」による）。

## 生成の内訳（`generate-t1.mjs`）

- 候補プール 188 件（FANZA から 300 件取得・3 ページ）。除外＝品番を検証できない 47 / **30 日以内に登場済みの女優 38（g12）** / 出演者情報なし 25 / レビューなし（X3 が組めない）2。
- テンプレートは `--recent X4,X5,X1,X2,X3`（W11-03〜07 の使用順）を渡して連続を避けた。

## 停止・報告事項（CTO は判定しない）

1. **MCP `create_records_for_table` が `singleSelect` に `{"id": "sel..."}` 形式を受け付けなくなった**——初回の 7 件一括 create が **422 `Cannot parse value for field タイプ`** で失敗した。**`get_table_schema` で選択肢 ID と名前を実測し（T1改 / ストック / サイトとも実在）、名前文字列に変えて成功**。**9/17（W11）の payload は `{"id": ...}` 形式で通っていた**ため、MCP 側の受理形式が変わったと見られる。**原因は追っていない。** 以後の payload 生成は名前文字列に揃える（`build-create-payload.mjs` は ID 形式のまま残置＝当日の記録）。
2. **`generate-t1.mjs` の見出し文字列が「ガード17件」のまま**（L5 / L200 / L213）。**実行される件数は実測 23 件**（`GUARDS` 22 ＋ `ASYNC_CHECKS` 1＝`g17_link_reachable`）で台帳と一致。**表示だけが古い。** 本番コードの文言変更は裁定事項のため触っていない。
3. `app-concierge/scripts/x-post-generator.mjs`（参照表 2 件の更新）は**作業ツリーに保持し、本コミットには含めない**（`ROUTINE_CHECKLISTS.md` §3 固定ステップ・次のデプロイ便で同梱）。**g22 / g23 は保持されていることを確認済み**（grep 2 件）。
