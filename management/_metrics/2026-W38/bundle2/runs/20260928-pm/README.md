# 束2 段階② 夜の抽出（2026-09-28）

**5軸**: ①X リスト `vodnavi-targets` ②窓＝**2026-09-28 06:16 JST（朝の抽出）以降** ③X 読み取り（Chrome）＋ Airtable MCP ④自アカウント実測 ⑤窓内の非リポスト 22 件。

## 0. 接続・走査

- **Supabase MCP は起動時に接続失敗（`CONNECT_TIMEOUT: Request timed out`）**。作品知識（`fanza_response_cache`）を引けず、全行が知識なしモード＝**A/C のみ・B なし・Q は提示不能**。原因は追っていない（再接続は次回の起動時に `list_tables` で確認）。
- 走査 **21:26〜21:32 JST**（上限 20 分内）。Chrome タブが非表示状態で、JS の連続スクロールが 45 秒タイムアウト（2 回）→ `computer scroll` で描画させて収集。窓の下端（9/27 21:00Z）到達を確認。
- 候補投稿の全文は `get_page_text`（遷移後 4 秒待ち）で取得。

## 1. 窓内の処理

| 区分 | 件数 | 内訳 |
|---|---|---|
| 入力 | 6 | kawaii_pr（こだわりのフェラ第5弾・kavr00218）／shirot_AV_chosa（本郷愛・sone00318・カードは video.dmm＝FANZA）／honnaka_NN（VR 予約開始・リンクは自社サイト＝content_id 未解決）／fanza_sns（MOODYZ 第6弾）／FANZAdougaX（フェラ第5弾）／Fitch_official（フェラ・jufe00543） |
| 除外（件数のみ） | 11 | 女優本人の私生活 7／FalenoEvent（ラジオのアーカイブ）1／fanza_sns ライブチャット 1／DMM10sale「200円」1／タグのみの返信 1 |
| 同一ハンドルの別投稿 | 3 | fanza_sns 2（売れ筋第2弾・フェラ第5弾）／shirot 詳細投稿 1 |

- t.co 解決（1 段のみ）: kavr00218・jufe00543・sone00318。FANZAdougaX・fanza_sns は rcv.ixd 経由で未解決・honnaka は自社サイトで未解決。
- 生成 6 行 12 案・全ガード通過（`drafts.txt`）。

## 2. 提示の逸脱（自己申告）

- **チャットの提示で各ブロック 1 行目の対象投稿 URL を落とした**（README 手順 0 の「案の提示形式（CSO判定 2026-09-21 夜）」違反）。`drafts.txt` には出ていたが、チャット用の表でハンドルと時刻だけにした。HUMAN の指摘で #1・#3 の URL を再提示。以後はチャットでも 1 行目に URL を置く。

## 3. 投稿と記録（2026-09-28 21:46 JST）

| # | 対象 | 案 | 投稿 | 配信（snowflake） |
|---|---|---|---|---|
| 1 | https://x.com/kawaii_pr/status/2104543151591710874 | C（手直しなし） | 2104553236162351593 | 12:46:06.866Z |
| 3 | https://x.com/honnaka_NN/status/2104391739650036051 | A（手直しなし） | 2104553331104649553 | 12:46:29.502Z |

- 見送り（HUMAN）: FANZAdougaX・Fitch（第5弾は kawaii の 1 件に集約）・fanza_sns（同企画の続き）・shirot（投稿がレビューでない）。
- X 実在: 2 件とも HTTP 200（Twitterbot の `<title>` で本文一致）・無効 ID 対照 404。
- 記録: `record.mjs --create --texts` → MCP create（`recwhirPbAz3mR1Y6` / `reclZ745ZyLC7i3ID`・reply_post_id / posted_at 同梱）→ x_targets `last_reply_at` 2 件 → **読み戻し 2＋2 件とも全項目一致**。**x_replies 累計 58 件。**
- `targets.json` / `replies.json` は朝のファイルを使用（x_targets は 21:3x に MCP で状態・last_reply_at を再確認し、候補の停止判定に差がないことを確認）。

## 4. フォロー候補（取得元 (b)・honnaka_NN 9/28 11:04 のリポスト一覧）

- 本日の残り枠 1（朝に 9 件実施）→ 提示 1: @hiyokoyahiyo。次回送り 4: @HoHzs／@sakuli131／@roku_ni_san／@mgt_xknkmtc。
- 除外（件数のみ）: 女優本人 2／既フォロー 1／自己紹介なしで判断材料がない 2／宣伝用アカウント 1。FANZAdougaX 第5弾のリポストは 1 件（自己紹介なし）で候補なし。
