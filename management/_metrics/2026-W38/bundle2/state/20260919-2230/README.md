# 束2 state スナップショット 2026-09-19 22:2x〜22:3x JST（HUMAN 実査完了後）

CSO 連絡 2026-09-19 22:2x（x_targets 実査完了・稼働 35・残り 7 は候補・未実査・no_repropose ON のまま据え置き）を受け、Airtable MCP `list_records_for_table` の読み戻しを fields 形に転記して保存したもの。**ネットワークなしで `active-targets.mjs` / `weekly-report.mjs` の再現に使える。**

| ファイル | 内容 | 出典 |
|---|---|---|
| `targets.json` | x_targets 42 件（`status` / `reply_restriction` / `priority` / `no_repropose` / `last_reply_at` は 22:2x〜22:3x の読み戻し値。`display_name` / `type` / `genres` / `note` は 08:3x の読み戻し値のまま） | MCP `list_records_for_table` `tblStC3L57aJh22sD` |
| `replies.json` | x_replies 10 件（9/18 6・9/19 4）。`got_like` / `got_reply` / `profile_click_delta` は**全件未記入** | MCP `list_records_for_table` `tblpFVorIemSOywTH` |
| `active-targets.tsv` / `.urls.txt` / `.json` / `.summary.txt` | `node management/tools/x-reply-drafts/active-targets.mjs targets.json [--urls|--json]` の出力＝**35 件**（priority 1: 27 / 2: 4 / 3: 4・type 女優本人 15 / メーカー公式 14 / レビュー系 3 / セール告知系 3・対照＝priority 3 の 4 件） | 本フォルダの targets.json |
| `reactions.json` | **x_replies 10 件の反応（likes / replies / reposts / bookmarks / views）**＝X 投稿ページを CSO ログイン済み Chrome 連携で読み取り専用で取得（2026-09-19 22:4x〜22:5x JST・CSO 指示 22:5x）。**10 件すべて likes 0 / replies 0 / reposts 0・views 4〜35（合計 123・中央値 7.5）**。`profile_click_delta` は投稿ページから取得不能＝未取得。views は x_replies に note 欄が無いため Airtable には書かず本ファイルのみ | Chrome 連携（`get_page_text` / `find`） |
| `weekly-report-dry-20260919.md` | `node management/tools/x-reply-drafts/weekly-report.mjs --replies replies.json --targets targets.json --reactions reactions.json --since 2026-09-18 --until 2026-09-19 --md` の出力（**9/24 木曜 PDCA 用集計の dry demo**）＝10 件・全件 priority 1・A 4 / B 3 / C 3・got_like 0 / got_reply 0 / profile_click_delta 記入 0 | 本フォルダの 2 ファイル |

## 読み取れる事実（22:3x 時点・判断は書かない）

- 稼働 35 ＝ CSO 連絡の「稼働 35 件」と一致。**全件 `reply_restriction=なし`**。
- 候補 7 ＝ `@hinako_matsui` / `@rinrin_dayou` / `@hosimiyaichika` / `@piyomaru_cmore` / `@Miyoshi_style` / `@otona_rank_info` / `@SOFT_ON_DEMAND`（`no_repropose=true`・`reply_restriction=不明`）。**CSO 決定＝非稼働ではなく未実査。**
- `last_reply_at` が入っているのは 7 件（kawaii_pr / Madonna_AVinfo / PREMIUM_AV / FANZAdougaX / honnaka_NN / waka_misono / Fitch_official）。9/18 の 6 件と 9/19 の 4 件（うち 3 件は同ターゲット）に対応。
- x_replies 10 件に **priority 2・3 の行は無い**（対照用 priority 3 の 4 件はまだ 1 件も提示・投稿していない）。
- **Airtable 書き込み（22:5x）**: 10 件の `got_like` / `got_reply` を `false`（取得済み・0）で `update_records_for_table` → 読み戻し 10 件（checkbox の false は応答に現れない＝空と同じ表現・`profile_click_delta` は全件空のまま）。**したがって Airtable 側では「取得済み・0」と「未取得」を区別できない。区別の証跡は `reactions.json` の `fetched`。**
- **反応は投稿後 10〜33 時間時点の値**（9/18 投稿分は約 33 時間・9/19 12:xx 投稿分は約 10.5 時間・Fitch 21:50 投稿分は約 1 時間）。**9/24 朝の集計時に再取得する**（累積するため）。

## 明朝（2026-09-20 08:00）以降の使い方

1. Airtable MCP で x_targets を読み戻し → `state/<日付>/targets.json` に保存（本フォルダと同形）
2. `node management/tools/x-reply-drafts/active-targets.mjs state/<日付>/targets.json --urls` → 抽出対象の URL 一覧（固定 20 件リストは使わない）
3. 抽出窓 ＝ 前回抽出以降（明朝は 2026-09-19 21:3x JST 以降）
4. priority 3（対照）の 4 件は抽出には含めるが、案の提示は週 2 件まで（`generate.mjs` が warning を出す）
