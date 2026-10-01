# 投稿キュー補充 2026-10-01 夜（W13・10/3〜10/9 T1改 7 件）

**5軸ラベル**: ①対象範囲＝Airtable `posts` 全 142 件 ②期間＝2026-10-01 22:00〜22:2x JST ③計測系＝MCP `list_records_for_table`（2 ページ・2 ページ目は TSV に写し `build-dump.mjs` で結合＝142/142 一致）＋ FANZA API ④出典＝自アカウント実測 ⑤機会の数＝7 枠（10/3〜10/9 21:00）。

## 契機
木曜 PDCA（`pdca-20261001/README.md` §9）で **10/3〜10/7 が 0 件**。HUMAN 指示（同夜）で W13 を補充。

## 手順と結果
| 時刻（JST） | 事象 |
|---|---|
| 22:07:17 | FANZA 疎通 `floor=videoa&sort=rank&hits=1` → **HTTP 200** |
| 22:07:36 | `sync-actress-table.mjs` dry-run: `t_attempted=60 / u_total=0 / n_added=0 / n_changed=0 / n_removed=0`（`sync-actress-dryrun.log`） |
| 22:07:55 | 同 `--write`（`sync-actress-write.log`）。`TG_LAST_USED` は 9/25 以降 TG なしのため更新不要 |
| 22:0x | `generate-t1.mjs --slots 10/3〜10/9 21:00 --id-prefix W13 --recent X2,X3,X5,X1,X2 --existing posts_dump_20261001.json` → **7 件・ガード 23 件 全 PASS**（`generate-t1.log` / `w13-t1-generated.json`） |

- 候補プール 142 件。除外＝品番を検証できない 63／30 日以内の女優 49（g12）／出演者情報なし 25／レビューなし 21（X3 不可）ほか。
- ~~**Airtable への書き込みは承認待ち（未実施）。**~~ → 承認後に実施（下記）。 承認後に ストック作成 → 読み戻し → 読み戻し値でガード再実行 → `承認済`＋予約日時（`12:00:00.000Z`）→ 読み戻し → `sync-actress --write` の順。
- 参照表（`x-post-generator.mjs` の `ACTRESS_LAST_POSTED`）は従来どおり作業ツリーのみで更新（`app-concierge/` を含むコミットはデプロイを伴うため本便ではコミットしない）。

## 承認と投入（HUMAN 承認 2026-10-01 夜・22:3x JST）

- **承認**: 10/3〜10/7・10/9 の 6 件は承認。**10/8 DSVR-1944 は条件つき**（同作品の過去投稿の有無を確認し、未投稿なら承認）。
- **DSVR-1944 の過去投稿確認**: `posts` 全 142 件（`posts_dump_20261001.json`）に `dsvr01944`／`DSVR-1944` は **0 件**。9/23 の枠は `W11-06 T1改 八木奈々 MIZD-450`。**→ 未投稿・承認**（`management/_metrics` 全体の grep でも本便の生成物以外に出現なし）。
- 手順（実測）: MCP create 7 件＝`ストック`（createdTime 22:35:35）→ 読み戻し 7/7 → `reguard-before-approve.mjs`（読み戻し値でガード 23 件）＝**mismatch 0・PASS**（22:36:32・`reguard-before-approve.log`）→ `承認済`＋予約日時 `2026-10-03..09T12:00:00.000Z` → 読み戻しで 10/1〜10/9 の予約を確認（下表）→ `sync-actress-table.mjs` dry-run（`n_added=7`）→ `--write`。

| 日付 | 21:00 | レコード |
|---|---|---|
| 10/2（金） | W12-07 七沢みあ MIDV-174 | 既存 |
| 10/3（土） | W13-01 小宵こなん SSIS-985 | recKi5YEkv6ISA3Mj |
| 10/4（日） | W13-02 青空ひかり START-568 | recUA0eshg4aNK2st |
| 10/5（月） | W13-03 架乃ゆら SSIS-982 | rec3kHL5utL8LXXRK |
| 10/6（火） | W13-04 Himari MIDV-732 | recmLho3tN8ZiVf5w |
| 10/7（水） | W13-05 宮崎千尋 MIDV-834 | recoPDFGWKYQ2ItAP |
| 10/8（木） | W13-06 神木麗 DSVR-1944 | recz19aCfjFcn4irG |
| 10/9（金） | W13-07 虹村ゆみ MIDV-862 | rec1Qc1vrn7Oj9oH7 |

## 重複ガードが何を見ているか（HUMAN 質問への回答・コード実測）

| ガード | 検知対象 | 窓 |
|---|---|---|
| g6_one_affiliate_per_day | **アフィリエイト直リンク（al.*）の件数** | **同一 JST 暦日**（1 日 1 件まで） |
| g11_one_work_intro_per_day | **作品紹介（/works/）の件数** | **同一 JST 暦日**（1 日 1 件まで） |
| g16_article_interval | **TG の同一記事 slug** | **4 日**（`TG_MIN_REAPPEAR_DAYS`） |
| （参考）g12_actress_not_recent | **同一女優名** | **30 日**（`ACTRESS_EXCLUDE_DAYS`） |

- **【事実】同一作品 ID（content_id）を直接照合するガードは存在しない。** g6／g11 は日ごとの件数、g16 は TG 記事のみ。同一作品の再掲は g12（女優 30 日）が出演女優経由で間接的に止めるだけで、**女優が 30 日以上空けば同一作品は通る**（女優情報なしの作品は `generate-t1.mjs` の候補段階で除外）。
- 追加の要否は裁定事項（本便では実装しない）。
