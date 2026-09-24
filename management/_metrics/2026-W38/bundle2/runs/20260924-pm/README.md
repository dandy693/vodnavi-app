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
