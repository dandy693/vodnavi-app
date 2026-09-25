# 束2 段階② 夜の抽出（2026-09-25）

**5軸**: ①X リスト `vodnavi-targets` ②窓＝**2026-09-25 05:31:12 JST 以降**（朝の走査開始）③X 読み取り（Chrome・DOM）＋ Airtable／Supabase MCP ④自アカウント実測 ⑤窓内の非リポスト 72 件（リポスト 28）。

- **開始の遅れ**: 22:08:44 に着手したが Chrome 拡張が未接続（`tabs_context_mcp` 3 回失敗・接続ブラウザ 0 台・`switch_browser` も送信先 0）で停止・報告。HUMAN が再接続し **22:16:06 に走査開始**。**21:00 前の規定から 1 時間 16 分超過。**
- **走査 22:16:06〜22:19:09 JST（約 3 分）**。窓の下端（9/24 20:31Z 以前の投稿）到達を確認。補完 0。

## 1. 窓内 72 件の処理

| 区分 | 件数 | 内訳 |
|---|---|---|
| 入力（生成） | 8 | kawaii_pr（cawd00519・こだわりのフェラ第4弾・cache MISS）／Fitch_official（juny00109・50%OFF）／PREMIUM_AV（pred00482・同第4弾）／FalenoEvent（浜辺やよい 9/26 大阪・9/27 名古屋イベント）／IDEAPOCKETTER（希月あまね「あと1週間」）／honnaka_NN（倉本すみれ 週刊プレイボーイ 10/5 掲載）／FANZAdougaX（売れ筋ビデオ％OFF 第1弾）／fanza_sns（同 第1弾スタート） |
| 停止 | 25 | MOODYZ 8・wanz 2（本日朝に返信済み）／S1 10・shinnakanodream 5（priority 3 週枠 2/2） |
| 除外（件数のみ） | 21 | 女優本人の写真展・配信・私生活・雑談・予定告知 16（Aizawa_miyu03 8／mio_sakai_ 2／iyo_shinohara 2＝トレカ発売イベント・中秋の名月／shiromine_miu 1＝配信／5may_itsukaichi 1）＋ kawaii 雑談 1＋ FANZAdougaX 雑談・診断企画 3／FalenoEvent 終了報告 1 は同一ハンドル 2 件目扱い |
| 判定不能で除外 | 1 | DMM10sale「200円でも嬉しい」＝引用元が FANZA か判別できない（CSO判定 2026-09-24 夜どおり除外） |
| 動画フロア外 | 2 | fanza_sns（PandaTV・FANZAライブチャット） |
| 同一ハンドル 2 件目以降 | 残り | Fitch 3・PREMIUM 1・FalenoEvent 3・IDEAPOCKETTER 1・FANZAdougaX 6・fanza_sns 3 |

- iyo_shinohara「ラビングユートレカ発売イベント」は動画作品ではないため除外側に入れた（**CTO 判断・要否は CSO**）。
- 知識: juny00109・pred00482 は cache ヒット。cawd00519 は MISS。
- **Q: 提示なし**——works リンク投稿は本日すでに Q 2＋TG 21:00＝3 で上限（CSO裁定 2026-09-25 朝 3）。
- 同一企画: PREMIUM の「こだわりのフェラ」は 9/24 夜（第3弾）に返信済み・本日で 2 日目。3 日連続には当たらない（9/23 の PREMIUM 返信の企画は未確認）。

## 2. 生成

- 8 行 20 案・全ガード通過（drafts.txt）。

## 3. フォロー候補（基盤D-2・取得元 (b)）

- 本日朝に返信した 4 投稿（MOODYZ mimk00288 / Madonna / attackers / wanz）のリポスト一覧を読み取り（22:2x）。
- **本日の残り枠 3 件**（朝に 7 件フォロー済み）→ 提示 3、次回送り 3（jameswho00・mizumoto_yp・qUN3N1VyA7RKEn5）。
- 除外（件数のみ）: 店舗 2（24kandasohonten・booksdandykanda）／女優本人 1（hatano_yui）／RT bot 自称 1（AbsNirvana）／海外・プロフィール不明の一群 は提示対象にせず。
- 走査終了 22:23:10。

## 4. 投稿と記録（2026-09-25 22:34〜22:42 JST）

投稿は HUMAN・全件手直しなし（record.mjs の照合で `text_overridden_for` なし）。見送り＝kawaii・Fitch（同企画）・IDEAPOCKETTER（連日）・honnaka（雑誌は 5 種外）・FANZAdougaX（同キャンペーン）。

| # | 対象 | 案 | 投稿 | 配信（snowflake） |
|---|---|---|---|---|
| 3 | PREMIUM_AV 2103409189481861339 | C | 2103478367651868864 | 22:34:58.243 |
| 4 | FalenoEvent 2103459449499492439 | A | 2103478569389478051 | 22:35:46.341 |
| 8 | fanza_sns 2103288383720063081 | A | 2103478847463469519 | 22:36:52.639 |

- X 実在: 3 件とも HTTP 200・無効 ID 対照 404。
- 記録: MCP create（createdTime 22:42:29 JST・`recEKS0cpo1hdBfWC` / `recGcOP3syRzOYUMe` / `recenOGEB31wsqsN3`・reply_post_id / posted_at 同梱）→ x_targets `last_reply_at` 3 件 → **読み戻し 3＋3 件とも全項目一致**（PREMIUM の `last_quote_at` は朝の値のまま）。
- **x_replies 累計 54 件**（9/25＝9：リプ 7・Q 2）。

## 5. フォロー（HUMAN・2026-09-25 夜）

- 実施 2 件: @zzzzzz908 @gVm6vrnPYOo75Ak → `follows.json` に追記・読み戻し一致（累計 9・推定フォロー中 165）。**本日計 9 件。**
- **@danine1203 は元々フォロー済み（HUMAN 確認）**→ `follows.json` の新設 `preexisting` に「既フォロー・9/25判明」として記録。**entries・日次件数・推定フォロー中には数えず、以後の候補から除外する**（`follow-candidates.mjs --record-preexisting` を追加・テスト 1 件追加・`node --test` 90/90）。

## 6. CSO 判定（2026-09-25 夜）

- 篠原いよのトレカ発売イベントは**除外で確定**（動画作品に紐づかない）。
- 抽出の 1 時間 16 分遅れ（Chrome 再接続待ち）は記録のみ。
