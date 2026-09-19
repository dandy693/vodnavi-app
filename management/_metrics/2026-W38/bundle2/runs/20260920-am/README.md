# 束2 段階② 2026-09-20 朝の抽出・生成（窓＝2026-09-19 21:3x JST 以降・対象＝x_targets の稼働 35）

| 段 | 実測 |
|---|---|
| 対象リスト | 08:0x JST に MCP で x_targets 42 件を読み戻し（`targets.json`・生出力）→ `active-targets.mjs` → **35 件**（priority 1: 27 / 2: 4 / 3: 4・`active-targets.urls.txt`）。固定 20 件リストは使っていない |
| 抽出 | **08:1x〜08:4x JST・Chrome 連携 tab 1 本・読み取りのみ**（CSO ログイン済み @vodnavi_jp・投稿/返信/フォロー/いいね/ブックマークなし）。各プロフィールを navigate → `find`（timestamp link・href に /status/）→ scroll → `find`。センシティブ警告のプロフィール 9 件は「プロフィールを表示する」を押して表示（表示切替のみ）。qualifying は snowflake ID > `2101287690040246272`（=2026-09-19 12:30Z＝21:30 JST） |
| 該当 | **13 アカウント・30 投稿**（FANZAdougaX 2・PREMIUM_AV 1・DMM10sale 1・Aizawa_miyu03 3・AViiyone 1(＋)・karin_kitaoka_ 1・ran_tpowers 1・sakuramio_X 1・shirot_AV_chosa 4(本体 2＋スレッド返信 2)・MOODYZ_official 6・IDEAPOCKETTER 4・shiromine_miu 1・S1_No1_Style 1）。**該当なし 22**（Madonna_AVinfo / honnaka_NN / Fitch_official / kawaii_pr / 5may_itsukaichi / attackers_av / azusa_hikari_ / FalenoEvent / fanza_meireview / iyo_shinohara / Kizukiamane / mio_sakai_ / nao_satsuki / PRESTIGE_PR2020 / saki_seino / sodstarofficial / waka_misono / wanz_official / fanza_sns / mayukiito / shinnakanodream / umi_sea_0v0）。**@AViiyone は同型の PR 投稿を約 30 分間隔で連投（プロフィール名に「パロディアカウント」）＝最新 1 件（08:00）のみ採取・以降の同型は個別に取っていない** |
| 本文取得 | 各投稿ページを navigate → `get_page_text`（**絵文字は落ちる**・例「5⃣0⃣％OFF」→「％OFF」＝入力では「50％OFF」に戻した）。リンクは `read_page`（t.co の href）→ `curl` の Location / redirect_url のみで追跡（`video.dmm.co.jp` 等の遮断ホストは到達せず Location を記録）。作品コードは表示 URL の `id=` から: prwf00016 / ipbz00018 / miab00677 / mida00812 / mida00780 / jur00190 / dejo006（amateur）/ IPZZ-902 |
| 入力 | `input.txt`（25 行・`@ハンドル｜投稿日時｜投稿URL｜本文｜作品コード`）。**本文中の「（画像 1 枚・スレッド返信…）」等の注記は CTO の付記**（12 行目は注記が案に混入したため `input.txt.v2` で注記を外して再生成→ `drafts.shirot-v2.json`）。**引用投稿は ［引用元 …］ 方式**（CSO 採用済み） |
| 停止判定 | `stopcheck_all.json`＝x_replies 既存との照合は **全 25 行 OK**（記録済み URL なし・間隔 OK）。**同一バッチ内の同日同ハンドル 2 件目以降は生成しない**（本 run で `generate.mjs` に追加・`--all-lines` で解除）＝**12 行停止**（FANZAdougaX 1 / Aizawa 2 / shirot 1 / MOODYZ 5 / IDEAPOCKETTER 3）。入力の並び＝優先順 |
| 知識 | `knowledge_union.sql` → Supabase MCP `execute_sql`（read-only）→ **PK ヒット 6**（prwf00016 / ipbz00018 / miab00677 / mida00812 / mida00780 / ipzz00902＝品番 IPZZ-902 を `sitemap_works_archive` で解決）・**ミス 2**（jur00190 / dejo006）→ `rows.json`（URL・画像・affiliateURL は落として転記）→ `knowledge.json`（20 行目は 21 行目と同一作品として転記＝CTO 判断） |
| 生成 | `generate.mjs` **08:49:44〜08:52:58 JST・claude-opus-5・API 16 回（13 行）・31 案 全通過**（知識あり 4 行＝A/B/C・知識なし 9 行＝A/C）。shirot 再生成 08:5x（2 回・2 案）。`drafts.json` / `drafts.txt` / `generate.log.txt` |
| priority 3 | S1_No1_Style 1 件を提示（**今週の提示 1 / 2・手動カウント**） |

## 併記（事実のみ）

- **X の検索（`from:` OR 検索・最新タブ）は、プロフィールに実在する投稿を返さないことがある**: FANZAdougaX 05:00 の 2 投稿はプロフィールには表示されるが検索結果には出なかった（08:1x 実測）。**以後の抽出はプロフィール直読みで行う（検索は使わない）。**
- **新規対象 15 件（9/19 の固定 20 件に無かった稼働）の「前回抽出以降」は本 run が初回**＝9/19 21:30 より前の投稿（例: @nao_satsuki 20:34・@mio_sakai_ 9/19 11:xx）は窓外として採らなかった。
- @DMM10sale の該当投稿は **FANZAブックス（電子書籍）** のセール告知（動画フロアではない）。
- x_replies の反応（likes 等）は本 run では取得していない（9/24 朝に再取得）。
