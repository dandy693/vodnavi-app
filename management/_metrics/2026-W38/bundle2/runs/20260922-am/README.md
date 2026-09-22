# 束2 段階② 2026-09-22 朝の抽出・生成（06:00 起点・窓＝2026-09-21 21:1x JST 以降・対象＝x_targets の稼働 34）＋ 基盤D 引用ポスト（Q）初回提示

**5軸**: ①対象範囲＝`active-targets.mjs`（`status=稼働 ∧ no_repropose≠true ∧ reply_restriction≠あり`）の 34 アカウントのプロフィール直読み ②期間＝**x_targets 読み戻し 06:2x JST → セッション中断 → 08:07 再開 → 抽出 08:1x〜08:4x JST**（06:00 起点の運用に対し着手が約 2 時間遅れた＝中断の事実として記録）・窓＝夜の抽出（9/21 21:1x〜21:4x）以降＝snowflake ID > `2102004916024246272`（9/21 21:00:00 JST） ③計測系＝Chrome MCP（CSO ログイン済み @vodnavi_jp・読み取りのみ・X 検索は使わない）＋ Airtable MCP（読み戻し）＋ Supabase MCP `execute_sql`（read-only）＋ Anthropic API（`generate.mjs` / `quote.mjs`）④出典＝自アカウント実測 ⑤機会の数＝34 アカウント（priority 1: 26 / 2: 4 / 3: 4）。

| 項目 | 実測 |
|---|---|
| 対象リスト | 06:2x JST に MCP で x_targets 42 件を読み戻し（稼働 34／候補 8）→ `targets.json`（fields 形で転記・last_quote_at 全件空）→ `active-targets.mjs` → **34 件**（priority 1: 26 / 2: 4 / 3: 4・type 女優本人 15 / メーカー公式 14 / セール告知系 3 / レビュー系 2） |
| 抽出 | 34/34 プロフィール読了 08:1x〜08:4x JST。**X の SPA ナビゲーションが前ページのまま止まる事象が 2 回**（`azusa_hikari_`・2 件連続 navigate 時）→ 以後は `home` を経由してから各プロフィールへ 1 件ずつ navigate（§10・戻り値「Navigated」を信用せずタブのタイトルで着地確認）。センシティブ警告の「プロフィールを表示する」は座標クリック（Kizukiamane / mio_sakai_ / PRESTIGE_PR2020 / sakuramio_X / sodstarofficial / wanz_official）。**1 回のスクロールでは 2 件しか読み込まれない場合があり（mio_sakai_）、以後は 2 回スクロールしてから find** |
| 窓内の投稿 | **10 アカウント・22 投稿（スレッド返信を除く）**。窓内 0 件＝24 アカウント |
| 抽出段階の絞り込み（README 手順 0） | **除外 8 件**＝女優本人の私生活・雑談・イベント **6**（iyo_shinohara 07:44 撮影会の引用・雑談／mio_sakai_ 07:11 撮影会・23:23 雑談・21:05 TikTok 配信／shiromine_miu 06:30 私生活・遠征・06:31 雑談）／フロア外 **1**（MOODYZ_official 21:00 ゲームコラボ）／画像のみ本文なし **1**（MOODYZ_official 22:00「画になる横顔。」＝同時刻の別投稿）。本文は台帳に貼らない |
| 【併記】昨夜の未検出 | PREMIUM_AV の 9/21 19:00・20:00 の 2 投稿（ID `2101974728902893678` / `2101989833807933665`）は昨夜の読み込みに現れておらず未検出だった（窓外のため本朝の入力には含めない。記録のみ） |
| 入力 | `input.txt`＝**14 行**（honnaka_NN 2・iyo_shinohara 1・shiromine_miu 1・PREMIUM_AV 1・MOODYZ_official 1・IDEAPOCKETTER 2・shirot_AV_chosa 2・FANZAdougaX 1・S1_No1_Style 3）。本文欄は投稿本文のみ。**スレッド返信の作品名・「作品はこちら」を本文に連結**（MOODYZ / shirot / FANZAdougaX / S1）。女優本人の引用投稿は引用元を［引用元 …］で付記（iyo_shinohara＝マドンナ公式・shiromine_miu＝ダスッ！公式・承認済み方式） |
| 作品コード | 本文リンクから 8 件（hnmg00006 / hmn00905 / jur00889 / dsod00096 / pred00902 / mida00758 / ipzz00918 / snos00331 / sivr00508）＋ t.co 1 ホップから 1 件（shirot 23:00 → `snos00134`） |
| 停止判定 | x_replies 29 件（08:4x 読み戻し・9/22 の行なし）。**同日返信済み＝0**（9/21 に返信した 11 ハンドルは暦日が変わり全件 OK）。**本バッチ内 2 件目＝5 行**（honnaka 00:00 / IDEAPOCKET 22:30 / shirot 22:00 / S1 05:00・02:04） |
| 作品知識 | `knowledge_union.sql`（10 行×3 フロア PK）→ Supabase MCP（SQL 側で URL・画像・affiliateURL を除外）→ `rows.json` → `knowledge.json`。**ヒット 8/10**（MISS＝jur00889・ipzz00918）。配信前の作品＝hnmg00006（10/27）・hmn00905（10/23）・dsod00096（10/23）・snos00331（10/23）・sivr00508（9/22 00:00） |
| 生成（リプ） | `generate.mjs` **08:47:49〜08:50:48 JST・claude-opus-5・API 11 回**。**生成 9 行・22 案 全通過**（知識あり 6 行＝A/B/C・知識なし 3 行＝A/C）・停止 5 行。`drafts.json` / `drafts.txt`（対象 URL を 1 行目に）/ `generate.log.txt` |
| priority 3 | @S1_No1_Style 06:00（snos00331）を生成したが**今週（月〜日）2 / 2 で上限到達のため提示しない**（drafts.json に残置） |
| **生成（Q・初回提示）** | `quote.mjs` **08:51:22〜08:52:47 JST・API 4 回**。候補 14 行 → 対象外 9（該当語なし／type 対象外／知識なし／セール語）→ 停止 1（honnaka 00:00＝同日同ハンドル 2 件目）→ **提示上限外 2**（S1 06:00・02:04＝本 run 上限 2）→ **提示 2**: honnaka_NN 01:00（`hnmg00006`・works **HTTP 200**）／shiromine_miu 00:11（`dsod00096`・works **HTTP 200**）。Q1・Q2 とも全ガード通過。`quotes.json` / `quote.log.txt` |

## 窓内の投稿（アカウント別・ID のみ・本文は貼らない）

| ハンドル | type / p | 窓内 | 扱い |
|---|---|---|---|
| @honnaka_NN | メーカー公式 / 1 | 2（01:00 予約開始 hnmg00006 / 00:00 新作情報解禁 hmn00905） | 01:00 を生成（リプ A/B/C・**Q1/Q2**）。00:00 はバッチ内停止（リプ・Q とも） |
| @iyo_shinohara | 女優本人 / 1 | 2（05:19 新作の引用 jur00889 / 07:44 撮影会の引用） | 05:19 を生成（知識なし・A/C）。07:44 は除外 |
| @shiromine_miu | 女優本人 / 2 | 3（00:11 新作の引用 dsod00096 / 06:30 私生活 / 06:31 雑談） | 00:11 を生成（A/B/C・**Q1/Q2**）。他 2 件は除外 |
| @PREMIUM_AV | メーカー公式 / 1 | 1（22:00 週末5本 pred00902） | 生成（A/B/C） |
| @MOODYZ_official | メーカー公式 / 2 | 3（22:00 三咲まゆ mida00758 / 22:00 画像のみ / 21:00 ゲームコラボ） | mida00758 を生成（A/B/C）。画像のみ・ゲームコラボは除外 |
| @IDEAPOCKETTER | メーカー公式 / 2 | 2（23:00 こだわりのフェラ 50%OFF / 22:30 JK4選 ipzz00918） | 23:00 を生成（知識なし・A/C）。22:30 はバッチ内停止 |
| @shirot_AV_chosa | レビュー系 / 1 | 2（23:00 snos00134 / 22:00） | 23:00 を生成（A/B/C）。22:00 はバッチ内停止 |
| @FANZAdougaX | セール告知系 / 1 | 1（05:00 川越にこ＋%OFF リスト） | 生成（知識なし・A/C） |
| @S1_No1_Style | メーカー公式 / 3 | 3（06:00 snos00331 / 05:00 河北彩花 / 02:04 VR sivr00508） | 06:00 を生成したが priority 3 上限（2/2）で提示せず。Q は提示上限外（2/run） |
| @mio_sakai_ | 女優本人 / 1 | 3 | 撮影会・雑談・TikTok 配信＝除外 |
| 窓内 0 件（24） | — | — | 5may_itsukaichi / Aizawa_miyu03 / attackers_av / azusa_hikari_ / DMM10sale / FalenoEvent / fanza_meireview / Fitch_official / karin_kitaoka_ / kawaii_pr / Kizukiamane / Madonna_AVinfo / nao_satsuki / PRESTIGE_PR2020 / ran_tpowers / saki_seino / sakuramio_X / sodstarofficial / waka_misono / wanz_official / fanza_sns / mayukiito / shinnakanodream / umi_sea_0v0 |

## 投稿と記録（HUMAN 投稿 09:10〜09:15 JST・記録 09:21〜09:2x JST）

| 項目 | 実測 |
|---|---|
| HUMAN 申告 | リプ 5 件＋引用 1 件の URL 6 本（投稿順不明）＋対応表（本文は提示どおり・手直しなし）。①④⑧・Q-2 は見送り |
| **判別（Chrome 読み取り・09:1x〜09:2x）** | 各 URL を開き、記事の親（返信先）と引用の有無・返信先の status リンクで判別: **`2102188758477209635`＝引用（@honnaka_NN 2102065325206597775・Q1・本文＋works リンク表示 `app.vodnavi.jp/works/videoa/h…`＝t.co/3sTe76ZznP → 301 で utm 付き works URL に一致）**／`2102188993316360282`＝@iyo_shinohara 2102130716792528919 への返信（C）／`2102189166448747004`＝@shiromine_miu 2102053207619018823（B）／`2102189420178964939`＝@MOODYZ_official 2102020030712217872（B）／`2102189651192946809`＝@IDEAPOCKETTER 2102035124766585026（C）／`2102190032723603459`＝@shirot_AV_chosa 2102035297634770984（A）。**HUMAN の提示順（Q-1→②→③→⑤→⑥→⑦）と投稿順は一致していた**（snowflake 09:10:31 / 11:27 / 12:08 / 13:09 / 14:04 / 15:35） |
| X 実在確認（09:24 JST・`curl`） | 6 件とも直接 URL **HTTP 200**（99,743〜155,250 B）／対照 `1111111111111111111` **404** |
| Airtable（リプ 5） | `record.mjs --create drafts.json --pick iyo_shinohara=C --pick shiromine_miu=B --pick MOODYZ_official=B --pick IDEAPOCKETTER=C --pick shirot_AV_chosa=A --texts posted.json`（手直しなし＝`text_overridden_for` 空）→ MCP create × 1（**createdTime 09:21:25 JST**） |
| **Airtable（Q 初回）** | `record.mjs --create quotes.json --pick honnaka_NN=Q1 --replies replies.json` → `_note`（Q 未登録）どおり **`typecast: true` で create（09:21:40 JST・`recVlfdlZJuyjGR73`・reply_key `20260922-Q-honnaka_NN`・reply_text＝一言＋改行＋works URL）** → `get_table_schema` で **選択肢 Q＝`sel1aoLdq9bvHguee`（blueLight2）** を読み戻し → `airtable-fields.json` の `choices.draft_used.Q` に登録（以後 typecast 不要） |
| **【自己申告・分類D】** | Q の create で CTO が `reply_text` の Unicode エスケープを 1 字誤り（`錂`＝錂）、**「収錂78分」で書かれた**（X の投稿本文は「収録78分」で正しい）。create 応答の読み取りで検出し **09:2x に update で「収録78分」へ訂正**。読み戻しで payload と一致。**原因＝MCP へ渡す JSON を手打ちのエスケープで組んだこと**。以後は payload ファイルの文字列をそのまま貼る（エスケープしない） |
| 投稿後 | `--posted` × 5（x_replies の `reply_post_id` / `posted_at`・x_targets の `last_reply_at`）＋ **`--posted --quote` × 1（x_targets `last_quote_at` のみ・`last_reply_at` は触らない）** → MCP update × 2 |
| 読み戻し（§10） | `readback.json`＝x_replies 6 件（reply_key / target / target_post_url / draft_used / reply_post_id / posted_at が payload と**機械照合で不一致 0**・Q の `draft_used` は `{id: sel1aoLdq9bvHguee, name: Q}`）／x_targets 6 件（5 件の `last_reply_at` が posted_at と一致・honnaka は `last_reply_at` 9/19 のまま・`last_quote_at` 09:10:31 JST）／**20260922 の行＝6・重複なし・x_replies 総数 35**（9/18 6・9/19 4・9/20 8・9/21 11・9/22 6） |
| 上限 | Q 本日 1 / 2・works リンク投稿 1（＋T1改 21:00 で 2 / 3）・priority 3 週 2 / 2（S1 は提示せず） |

## E28 Firewall 適用（抽出・提示後・08:55〜08:58 JST）

→ 起案 `proposal-20260921-E28-crawler-mitigation.md` §7-7・FACT §29-3。**active version 6・rules 2・healthcheck ALL PASS。**

## ファイル

`targets.json`／`active-targets.urls.txt`・`active-targets.summary.txt`／`input.txt`（14 行）／`parsed.json`／`knowledge_sql.json`・`knowledge_union.sql`・`rows.json`（＋`rows.README.txt`）・`knowledge.json`／`replies.json`（29 件）／`drafts.json`・`drafts.txt`・`generate.log.txt`／`quotes.json`・`quote.log.txt`。`posted.json`（投稿本文・5 件）／`payload_create.json`・`payload_create_quote.json`・`payload_posted_*.json`（6 件）／`readback.json`（判別結果・X 確認・読み戻し）。
