# 投稿キュー補充 2026-09-17（CSO 指示 2026-09-17 22:00・最優先）

**5軸ラベル**: ①対象範囲＝Airtable `posts`（`tblZMqvjtJY8MfaWZ`）全件 ②期間＝2026-09-17 22:08:58〜22:3x JST（各ファイルに秒単位の `ts`）③計測系＝MCP `list_records_for_table` / `create_records_for_table` / `update_records_for_table` ＋ FANZA API 直接照会（`generate-t1.mjs` / `sync-actress-table.mjs`）④出典＝自社 base の実測 ⑤機会の数＝posts 120 → 127 行。

## 時系列（JST）

| 時刻 | 事象 | 証跡 |
|---|---|---|
| 22:08:58 | 着手（現在時刻の実測） | TASK_BOARD |
| 22:1x | `posts` 全 120 件を読み戻し → **予約日時 ≥ 9/17 の行 0 件＝キュー切れ**（投稿済 117 / ストック 2 / エラー 1 / 承認済 0） | `posts_dump_20260917.json`（`build-dump.mjs` で MCP 生結果をフィールド名キーへ変換） |
| 22:18:35 | FANZA API 疎通 `floor=videoa&sort=rank&hits=1` → **HTTP 200**（446ms） | — |
| 22:18:56 | `sync-actress-table.mjs` dry-run: `t_attempted=45 / u_total=0 / n_added=6 / n_changed=0 / n_removed=0` | `sync-actress-dryrun-20260917.log.txt` |
| 22:19:20 | 同 `--write`（W10 の 5 名＋共演 1 名を追加・`ACTRESS_ENTRY_SOURCE` は空に） | `sync-actress-write-20260917.log.txt` |
| 22:2x | `TG_LAST_USED` を手で更新（TG-22 first-guide 9/12 / TG-23 payment-methods 9/14 / TG-24 payment-statement 9/16・いずれも投稿済＋ポストIDあり） | `x-post-generator.mjs`（作業ツリー・未コミット） |
| 22:2x | `generate-t1.mjs --slots 9/18〜9/24 21:00 --id-prefix W11 --recent X1,X2,X3,X5,X1 --existing dump` → **7 件生成・ガード21件 PASS** | `generate-t1-20260917.log.txt` / `w11-t1-generated.json` |
| 22:23:24 | MCP `create_records_for_table` × 1（7 件・`ストック`・予約日時なし） | `w11-create-payload.json` |
| 22:24:48 | 読み戻し 7/7・生成 JSON と機械照合 **不一致 0** → **ガード21件 再実行 PASS**（承認直前） | `w11-readback-stock-20260917.json` / `reguard-before-approve-20260917.log.txt` |
| 22:25 | `update_records_for_table` × 1: `承認済`＋予約日時 `2026-09-18..24T12:00:00.000Z`（21:00 JST・Z 終端） | — |
| 22:2x | 投入後の全件読み戻し（127 件）→ 日付別件数（下表） | `posts_dump_20260917_after.json` |
| 22:26:30 | `sync-actress-table.mjs` dry-run → `--write`（承認済 7 件を予約済みとして登録・`src_new=9`） | `sync-actress-dryrun-after-20260917.log.txt` / `sync-actress-write-after-20260917.log.txt` |
| 22:2x | `W9-01` / `W9-15` の再割当可否をガード21件で dry 検査（書き込みなし） | `w9-leftover-guard-check-20260917.log.txt` |

## 投入後の日付別件数（読み戻し・JST）

| 日付 | 21:00 | 22:30 | 計 |
|---|---|---|---|
| 9/17（木・本日） | 0 | 0 | **0**（配信 0 件の日） |
| 9/18（金） | W11-01 T1改 泉ももか MIMK-271（X2） | — | 1 |
| 9/19（土） | W11-02 T1改 瀬戸環奈 SNOS-334（X3） | — | 1 |
| 9/20（日） | W11-03 T1改 葵いぶき MDVR-422（X4・VR） | — | 1 |
| 9/21（月） | W11-04 T1改 小野六花 MIZD-481（X5） | — | 1 |
| 9/22（火） | W11-05 T1改 新ありな MIZD-464（X1） | — | 1 |
| 9/23（水） | W11-06 T1改 八木奈々 MIZD-450（X2） | — | 1 |
| 9/24（木） | W11-07 T1改 楪カレン MIMK-244（X3） | — | 1 |

- 7 件とも `承認済`・`リンク種別=サイト`・ポストID 空・エラー詳細 空・予約日時は Z 終端で JST 換算が想定枠と一致。
- **在庫アラート換算（承認済かつ 4 日後以降＝9/21 21:00 以降）＝4 件（閾値 6 未満）**——木 10:00 のアラートは 9/24 も鳴る見込み（9/22〜24 の 3 件のみが対象になるため）。
- **22:30 枠（Phase 1 では TG / T5 交互）は 7 日とも空**——指示「今回は現行 T1改 のみ」による。埋めるかは CSO 裁定。

## 停止・報告事項（CTO は判定しない）

1. **指示文の「型・本数・時間帯は Phase 1 と同一」と「今回は現行 T1改 のみ」**——Phase 1 は 21:00 T1改＋22:30 TG/T5 の 2 件/日。T1改 は g11 により 1 日 1 件までのため、**本補充は 21:00 の 7 件のみ**とし 22:30 は空けた。
2. **`W9-01` / `W9-15`（8/29 残置・9/10 裁定「9/17 のバッチ起票時に割り当てる」）**——`W9-15`（→ 9/18 22:30）は全 PASS／`W9-01`（→ 9/25 21:00）は **g12 NG**（`W11-02` 瀬戸環奈 9/19 と 30 日以内）。割当は未実施。選択肢＝(a) `W11-02` を `ストック` に戻し `W9-01` を 9/19 へ（再ガード要）(b) `W9-01` を 10/19 以降へ (c) 破棄。**採否は CSO。**
3. `MIZD-481`（721 分）/ `MIZD-450`（634 分）/ `MIZD-464` は収録時間から総集編と見られるが、テンプレートは現行のまま（「変数を変えない」）。**本文の自然さはガードが検査しない**（§13）——HUMAN 目視の要否は CSO。
4. `app-concierge/scripts/x-post-generator.mjs`（参照表 2 件）は作業ツリーに保持・**本コミットには含めない**（`ROUTINE_CHECKLISTS.md` §3 固定ステップ・次のデプロイ便で同梱）。
