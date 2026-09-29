# 束2 段階② 夜の抽出（2026-09-29）

**5軸**: ①X リスト `vodnavi-targets` ＋ 稼働アカウントのプロフィール直読み ②窓＝**2026-09-29 05:32 JST（朝の抽出の走査開始）以降** ③X 読み取り（Chrome）＋ Airtable MCP ＋ Supabase MCP（read-only）④自アカウント実測 ⑤窓内の投稿 33 件（プロフィール直読みで取得・リポストを除く。停止確定の MOODYZ 3 件は数えない）。

- **朝の抽出は実施済み**（`20260929-am`・05:32 開始）＝抜けた回は無い。台帳への「抜け」記録は不要。
- **着手が遅れた**: 依頼は「21:00 前」だが、着手は **21:45:52 JST**（走査開始 21:46:46）。

## 0. 事前確認

- `x_targets` 42 件・稼働 34 件、`x_replies` 61 件を MCP で読み戻し（21:4x）。`targets.json` / `replies.json` は朝のファイルに朝の投稿 3 件（`last_reply_at` と `x_replies` 3 行）を反映したもの＝MCP の読み戻しと一致を確認。
- priority 3 の週カウント（`priority3-week.mjs`）: 週 9/28〜10/4 で **1 / 2・残り 1**。

## 1. 走査（21:46:46〜約 22:00 JST・上限 20 分内）

- **【重要】リスト `vodnavi-targets` のタイムラインは今夜、窓内の投稿を取りこぼした。** 窓内に出たのは 5 件（shirot 2・kawaii・S1・桜みおのリポスト 1）のみで、**9/29 05:00〜20:30 JST の約 15 時間が空白**だった。`@MOODYZ_official` のプロフィールには窓内の投稿が 3 件（07:00 / 12:00 / 19:30 JST）あったが、いずれもリストに出ていない。**→ 今夜は旧方式（プロフィール直読み）で全稼働アカウントを読んだ。** リスト側の原因は追っていない（未特定）。
- プロフィールを読んだのは 31 アカウント。**停止確定のため読んでいない 3 件**: `@FANZAdougaX`・`@MOODYZ_official`（今朝返信済み＝同日同ハンドル）・`@Aizawa_miyu03`（今朝返信済み＝女優 3 日）。MOODYZ はリストとの照合のためにプロフィールを 1 回だけ開いた。
- **読み切れていない可能性がある 2 件**（読み込んだ範囲の最古が窓内だった）: `@PREMIUM_AV`（最古 18:00 JST）・`@S1_No1_Style`（最古 20:00 JST）。これより前の窓内投稿は未読。
- 走査中に一度、7 アカウント分のバッチがタイムアウトした。タブの状態を読み戻したところ全件処理済みだったため、再実行はしていない（§10）。

## 2. 窓内の処理

| 区分 | 件数 | 内訳 |
|---|---|---|
| 入力 | 6 | kawaii_pr（美咲夏蓮デビュー・cawb00051）／Fitch_official（肉欲の秋 50%OFF・小田桜・juny00117）／PREMIUM_AV（こだわりのフェラ 第5弾・pred00672）／shirot_AV_chosa（ほろ酔い上司・hnds00072）／IDEAPOCKETTER（THIS IS たわわ・希月あまね・特設ページ）／S1_No1_Style（桐谷エマ デビュー・snos00489・priority 3） |
| 除外（件数のみ） | 21 | 私生活・雑談・配信 8（mio_sakai_ 2／waka_misono 2／shinnakanodream 4＝社内の雑談 2・応募告知 2）／作品名の無いイベント・交流 8（sakuramio_X 4／iyo_shinohara 1 オンラインサイン会／saki_seino 1／S1 のイベントlog 2）／動画フロア外・FANZA 外 5（DMM10sale の MGS 動画 1／shiromine_miu のグラビア 2／fanza_sns のライブチャット 1／umi_sea_0v0 の写真展 1） |
| 同一スレッド・同日同ハンドル | 6 | Fitch（こだわりのフェラ）・IDEAPOCKET（特設ページ）・shirot（作品はこちら）・S1（【PR】リンク）を各入力行に統合（4）／Fitch 10:15 の別投稿 2（北野未奈 jufe00446 ＋同スレッド）は同日同ハンドルのため入力しない。入力 6 行は投稿 10 件に相当（10 + 2 + 21 = 33） |

- **content_id**: t.co 4 本を `resolve-cid.mjs` で 1 段だけ読んだ（21:59:57）＝pred00672・hnds00072 を解決。kawaii は自社サイト宛のため未取得 → 品番 CAWB-051 を `sitemap_works_archive` で cawb00051 に解決。IDEAPOCKET は特設ページ宛で作品に紐づかない。Fitch・S1 は投稿本文に表示された遷移先文字列から読んだ。**al.fanza 以降・video.dmm へはアクセスしていない。**
- **知識（cache）**: ヒット 4（cawb00051 配信 10/2・169 分／juny00117・146 分／pred00672・122 分／snos00489 配信 10/23・180 分）・MISS 1（hnds00072）。
- 同一作品 3 日以内: 該当なし（9/26〜9/29 の input.txt と照合）。同一企画 3 日連続: 該当なし（同ハンドル単位）。

## 3. 生成（22:0x JST・claude-opus-5）

- 6 行すべて生成・停止 0・ガード全通過（`drafts.txt`）。shirot・IDEAPOCKET は知識なしのため A/C のみ。
- S1 は priority 3。提示すれば今週 2 / 2 になる。
- **引用ポスト（Q）: 候補 0**（6 件とも「発売・配信開始・予約開始」の語が本文に無い）。

## 4. フォロー候補（22:06 JST）

- 取得元: (a) `@sakuramio_X` 9/29 18:04（チェキ会）の返信欄、(b) `@kawaii_pr` 9/29 20:42 のリポスト一覧。
- 提示 3（本日の残り枠 3・朝に 7 件実施済み）: `@dtshdma`／`@Scarlet_Aniki`／`@auxyzkazu1`。次回送り 1: `@do9_f9`。
- 除外（件数のみ）: 女優本人 1／女優応援・作品紹介アカウント 1／自己紹介が無く判断材料なし 5。
- `follows.json` は累計 25 のまま（推定フォロー中 181・閾値 300 まで 119）。

## 5. 投稿と記録（HUMAN 投稿 2026-09-29 22:16〜22:24 JST）

| # | 対象 | 案 | 投稿 | 配信（snowflake・UTC） |
|---|---|---|---|---|
| 1 | https://x.com/kawaii_pr/status/2104899496228594037 | B（手直し報告なし） | 2104923193198920166 | 13:16:11.497Z |
| 2 | https://x.com/Fitch_official/status/2104892701577769224 | B | 2104923347142541805 | 13:16:48.200Z |
| 3 | https://x.com/PREMIUM_AV/status/2104858740340252883 | A | 2104923937494925414 | 13:19:08.951Z |
| 4 | https://x.com/shirot_AV_chosa/status/2104904083400466564 | A | 2104924058857152936 | 13:19:37.886Z |
| 5 | https://x.com/IDEAPOCKETTER/status/2104895221918319075 | A | 2104924248628498940 | 13:20:23.131Z |
| 6 | https://x.com/S1_No1_Style/status/2104896480398250297 | B | 2104925289507893437 | 13:24:31.296Z |

- X 実在（22:31 JST）: 6 件とも HTTP 200・Twitterbot の `<title>` で宛先と本文冒頭が選んだ案と一致／無効 ID 対照 404。
- 記録: `record.mjs --create`（手直し報告が無いため `--texts` なし）＋ reply_post_id / posted_at を同梱 → MCP create（createdTime 22:32:33 JST・`rec6Gw9Znmbl8myGL` / `recxv4WmTfiUWHhC8` / `recObuaVc1NZ2QEjb` / `rec0yv2c3wDEzUZiu` / `reccG33vXV80Jy8ow` / `recqOy33VpZNgpNzG`）→ x_targets `last_reply_at` 6 件 → **別呼び出しの読み戻しで 6＋6 件とも全項目一致**。**x_replies 累計 67 件。**
- **priority 3: S1 で今週（9/28〜10/4）2 / 2 に到達・残り 0**（`priority3-week.mjs`・`replies-after.json`）。10/4 まで S1・shinnakanodream・mayukiito・umi_sea_0v0 の案は出さない。

## 6. フォロー（HUMAN・2026-09-29 夜）

- 実施 3 件（@dtshdma／@Scarlet_Aniki／@auxyzkazu1）→ `follows.json` 追記・読み戻し一致（**累計 28・本日 10 件で上限到達・推定フォロー中 184・閾値 300 まで 116**）。次回送り: @do9_f9。
