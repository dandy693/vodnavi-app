# 束2 段階② 夜の抽出（2026-09-24・21:00 前規定に戻した初回）

**5軸ラベル**: ①対象範囲＝X リスト `vodnavi-targets`（34 メンバー）のタイムライン ②期間＝窓 **2026-09-24 06:06:31 JST 以降**（朝の走査開始時刻）・**走査 21:01:44〜約 21:07 JST**（抽出〜生成・Q 判定まで 21:13:12） ③計測系＝X の読み取り（Chrome 連携・DOM 読み取り）＋ Airtable MCP ＋ Supabase MCP ④出典＝自アカウントの実測 ⑤機会の数＝窓内の非リポスト投稿 38 件。

- **開始は 21:01:44 JST＝規定（21:00 前）を 1 分 44 秒超過**（CSO 裁定の受領が 21:00 以降だったため）。
- 取得手段: DOM から article を収集（**タブが hidden のため描画は screenshot 取得時にのみ進む**＝scroll → 0.1 倍 screenshot → 収集の反復。JS 内の setTimeout 待機は 45 秒タイムアウトした）。
- 窓の下端到達を確認（タイムラインが 9/24 04:30 JST 以前に到達）。**補完（プロフィール／投稿ページ）0 件。**

## 1. 窓内の非リポスト投稿 38 件の処理

| 区分 | 件数 | 内訳 |
|---|---|---|
| **入力（生成）** | 6 | PREMIUM_AV（pred00704・50%OFF 第3弾）／Fitch_official（jufe00472・50%OFF・スレッド 2 件を 1 行に統合）／wanz_official（共演イベント告知）／FalenoEvent（ラジオ第7回出演者）／IDEAPOCKETTER（希月あまね・作品名なし）／fanza_sns（MOODYZ キャンペーン第5弾 30%OFF） |
| **停止** | 14 | FANZAdougaX 5・MOODYZ_official 4（本日朝に返信済み＝1 日間隔）／S1_No1_Style 4（priority 3 週枠 2/2）／shiromine_miu 1（女優本人 3 日未満） |
| **除外（件数のみ）** | 12 | 女優本人の配信告知・雑談・撮影会・写真展 10（mio_sakai_ 3／iyo_shinohara 2／saki_seino 1／sakuramio_X 1／Aizawa_miyu03 3＝写真展・作品名なし）／FANZA 外（MGS 引用）1（DMM10sale）／動画フロア外（ライブチャット）1（fanza_sns） |
| **判定不能で除外** | 1 | DMM10sale「第1弾本日23:59まで」＝引用元が FANZA か取得できず（→ 提示しない） |
| 統合 | 1 | Fitch スレッド 2 件目 |
| 補完不要 | 4 | FANZAdougaX・MOODYZ の t.co（停止行のため解決しない） |

- content_id は本文中の `al.fanza…?lurl=…id%3D<cid>` 文字列から取得（**t.co / al.fanza への GET は 0 回**）。fanza_sns のリンクは `rcv.ixd.dmm.com`（クリック計測・到達禁止）のため解決しない。
- 知識: pred00704・jufe00472 とも cache ヒット（videoa）。他 4 行は知識なし（A・C のみ）。
- Q: 候補 0（6 行とも対象外・理由は quotes.json）。
- 同一企画 3 日連続: 該当なし（PREMIUM は 9/23 以来・Fitch は 9/21 以来）。

## 2. 生成

- 21:1x JST・claude-opus-5・6 行 16 案・全ガード通過（drafts.txt）。

## 3. フォロー候補（手順 2.5）

- 本日朝に返信した対象投稿（FANZAdougaX `2102850518892920926`・返信 3 件表示）を開いたが、**返信欄が描画されず screenshot が 3 回連続タイムアウト＝取得不能**。いいね一覧は他者の投稿では閲覧できない。**次回（投稿の記録後）に持ち越す。**

## 4. 投稿と記録（2026-09-24 21:20〜21:26 JST）

**投稿は HUMAN。** 見送り＝Fitch（同一企画）・FalenoEvent（放送は 5 種外）・IDEAPOCKETTER（本文が薄い）。**CSO 判定: DMM10sale「第1弾本日23:59まで」は引用元が判別できないため除外で確定。**

| # | 対象 | 案 | 投稿 URL | 実配信（snowflake 復元） |
|---|---|---|---|---|
| 1 | `@PREMIUM_AV` 2103016594406555944 | **A（手直しあり）** | `https://x.com/vodnavi_jp/status/2103097327133262232` | 21:20:51.104 JST |
| 2 | `@wanz_official` 2102956335071686922 | A（手直しなし・drafts と機械照合一致） | `https://x.com/vodnavi_jp/status/2103097536953389394` | 21:21:41.129 JST |
| 3 | `@fanza_sns` 2102925993518215308 | C（手直しなし・drafts と機械照合一致） | `https://x.com/vodnavi_jp/status/2103097709058310584` | 21:22:22.162 JST |

- X 実在: 3 件とも HTTP 200（108,788 / 109,691 / 107,231 B）・無効 ID 対照 404（36,986 B）。
- 記録: `record.mjs --create --texts posted.json`（`text_overridden_for`=PREMIUM_AV）→ MCP create（reply_post_id / posted_at 同梱・createdTime 21:25:24 JST・`recNjnN1z852MSGSj` / `rechZXkQpeV3reHRF` / `recQiD3vbkhLMx7rv`）→ x_targets `last_reply_at` 3 件 update → **読み戻し: x_replies 3 件・x_targets 3 件とも payload と全項目一致**（`last_quote_at` 不触）。
- **x_replies 累計 45 件**（9/24＝5）。priority 3 の消費 0（週枠 2/2 のまま）。

## 5. フォロー候補（手順 2.5・再取得）

- 今夜返信した 3 投稿の返信欄を読み取り（21:2x〜21:3x JST）: **第三者の返信 0 件**（PREMIUM_AV＝当方のみ／wanz_official＝投稿者のスレッド 1 件＋当方／fanza_sns＝当方のみ）。**いいね一覧は他者の投稿では閲覧できない。**
- **→ 候補 0 件（取得は成功・該当者なし）。** 朝の FANZAdougaX 分（§3・取得不能）は明朝へ持ち越し。`follows.json` への追記なし。
