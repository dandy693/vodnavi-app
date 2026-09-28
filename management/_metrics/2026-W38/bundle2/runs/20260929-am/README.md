# 束2 段階② 朝の抽出（2026-09-29）

**5軸**: ①X リスト `vodnavi-targets` ②窓＝**2026-09-28 21:26 JST（夜の抽出）以降** ③X 読み取り（Chrome）＋ Airtable MCP ④自アカウント実測 ⑤窓内の非リポスト 12 件。

## 0. 接続・事前確認

- **Supabase MCP はセッション起動時に接続失敗（`CONNECT_TIMEOUT`）**＝作品知識なし（A/C のみ・B なし・Q は提示不能）。9/28 夜に続き 2 回連続。
- **配信前再検査（§13-5-2）**: 当日予約 1 件（`W12-04 T1改 九野ひなの MIDV-855`・21:00 JST・承認済）→ **PASS**（検査不能 g9 のみ）。`preflight.json`。
- `targets.json` / `replies.json` を MCP で読み戻し（x_targets 42・稼働 34／x_replies 58）。
- 走査 **05:32〜05:4x JST**（Chrome の時刻実測 05:32:45 開始）。非表示タブで JS・`computer scroll` のタイムアウトが断続（45 秒 × 数回）。窓の下端（9/28 12:26Z）を越える 09:12Z まで到達を確認。

## 1. 窓内の処理

| 区分 | 件数 | 内訳 |
|---|---|---|
| 入力 | 8 | FANZAdougaX（MOODYZ 30%OFF キャンペーン・水卜さくら BEST）／MOODYZ（VR 予約開始・mdvr00444・美園和花）／attackers 2（桜みお same00251／こだわりのフェラ 第5弾 9/30 9:59 まで）／Aizawa_miyu03（本中 大共演 VR）／shirot（Emika 恋におちる瞬間・白上咲花）／IDEAPOCKETTER（花咲澪）／S1（希望みう デビューイベント終了） |
| 除外（件数のみ） | 2 | shinnakanodream（社内の雑談＝作品に触れない）／shirot の同一スレッド 1（入力行に統合） |
| FANZAdougaX の同一スレッド | 1 | 入力行に統合 |

- content_id は投稿本文に表示された遷移先 URL の文字列から読んだもの（mdvr00444・same00251）。**al.fanza 以降へはアクセスしていない。**

## 2. 生成

- 8 行・生成 6 行（attackers の 2 行目は別実行 `drafts2.*`）。**ガード不通過 2**: attackers 桜みお（本文に具体なし・R14）／IDEAPOCKETTER（同）。
- priority 3（S1）は今週（9/28〜）1/2 → 提示すれば 2/2。
- **Aizawa の C 案（配信開始はいつ頃）は、同じ投稿の返信欄で本人のサブ垢が「10/26 0:00〜配信開始」と既に答えている**＝C は不向き。
- attackers こだわりのフェラ 第5弾は 9/28 夜の kawaii_pr（同企画）に続く 2 日目（3 日連続ルール内）。

## 3. フォロー候補（取得元 (a)・Aizawa_miyu03 9/28 23:01 の返信欄）

- 提示 6: 前回送り 4（@HoHzs／@sakuli131／@roku_ni_san／@mgt_xknkmtc）＋新規 2（@kamipGentle／@syucreate）。
- 除外（件数のみ）: 本人のサブ垢 1／海外・定型文 1／自己紹介に判断材料が乏しい 1。
- 9/28 夜に提示した @hiyokoyahiyo のフォロー報告は未着（follows.json 累計 18 のまま）。
