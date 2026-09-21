# 束2 段階② 2026-09-21 夜の抽出・生成・投稿記録（窓＝2026-09-21 06:00 JST 以降・対象＝x_targets の稼働 34）

**5軸**: ①対象範囲＝`active-targets.mjs`（`status=稼働 ∧ no_repropose≠true ∧ reply_restriction≠あり`）の 34 アカウントのプロフィール直読み ②期間＝抽出 **21:1x〜21:4x JST**（当初 18 時台と誤認し、X 表示と snowflake で JST 21 時台と確定）・窓＝朝の抽出（06:2x〜06:5x）以降 ③計測系＝Chrome MCP（CSO ログイン済み @vodnavi_jp・読み取りのみ・X 検索は使わない）＋ Airtable MCP（読み戻し・書き込み）＋ Supabase MCP `execute_sql`（read-only）＋ Anthropic API（`generate.mjs`）④出典＝自アカウント実測 ⑤機会の数＝34 アカウント（priority 1: 26 / 2: 4 / 3: 4）。

| 項目 | 実測 |
|---|---|
| 対象リスト | 朝の `targets.json`（06:22 の 42 件読み戻し）に 18:0x の `last_reply_at` 読み戻し 7 件を反映（`_readback` 注記）→ `active-targets.mjs` → **34 件**（`active-targets.urls.txt` / `active-targets.summary.txt`） |
| 抽出 | 34/34 プロフィール読了 21:1x〜21:4x JST（センシティブ警告の「プロフィールを表示する」は座標クリックのみ）。**窓内の投稿があったのは 21 アカウント・34 投稿**。窓内 0 件＝13 アカウント |
| 抽出段階の絞り込み（README 手順 0） | **除外 19 件**＝女優本人の私生活・交流・配信お礼・雑談 **13**（Aizawa_miyu03 3 写真展／karin_kitaoka_ 1 お礼・交流／mio_sakai_ 1 TikTok 配信／nao_satsuki 1 旅行／sakuramio_X 1 食事／saki_seino 1 雑談／shiromine_miu 2 配信／umi_sea_0v0 1 来店イベントお礼／**ran_tpowers 1 店舗イベント・作品名なし＝提示時は保留扱い → CSO判定で除外側に確定**）／動画フロア外・FANZA 外 **3**（DMM10sale 1 MGS／fanza_sns 1 ライブチャット／MOODYZ_official 1 ゲームコラボ）／画像のみ本文なし **3**（shinnakanodream 4 件のうち 3。残る 1 件＝お知らせまとめを採用）。本文は台帳に貼らない |
| 入力 | `input.txt`＝**15 行**（11 ハンドル・Fitch_official / fanza_sns / FANZAdougaX / MOODYZ_official は 2 行ずつ）。本文欄は投稿本文のみ。@S1_No1_Style は引用投稿のため引用元を［引用元 …］で付記（承認済み方式） |
| 作品コード | 本文リンクから 5 件（juny00112 / jufe00500 / kavr00266 / miab00677 / pred00889） |
| 停止判定 | **同日返信済み（今朝 9/21 の reply_key 既存・1 日 1 件）＝8 行**（FANZAdougaX ×2／MOODYZ_official ×2／IDEAPOCKETTER／PREMIUM_AV／S1_No1_Style／shirot_AV_chosa）。**本バッチ内 2 件目＝2 行**（Fitch_official 10:15 jufe00500／fanza_sns 10:00 星宮一花）。`20260920-Fitch_official`（9/20 21:37 投稿）は暦日差 1 で OK |
| 作品知識 | `knowledge_union.sql`（5 行×3 フロア PK）→ Supabase MCP → `rows.json`（URL・画像・affiliateURL を除いて転記）→ `knowledge.json`。**ヒット 5/5**。juny00112 / jufe00500 / kavr00266 の campaign「こだわりのフェラ50％OFF」は date_end 2026-09-23 09:59:59（取得時点で有効・B 案の事実には使っていない） |
| 記録済みリプ | `replies.json`＝21:5x の MCP 読み戻し **25 件**（reply_key / target_post_url / posted_at / draft_used） |
| 生成 | `generate.mjs` **21:37:35〜21:40:05 JST・claude-opus-5・API 9 回**。**生成 5 行・12 案 全通過**（知識あり 2 行＝A/B/C・知識なし 3 行＝A/C）・停止 10 行。`drafts.json` / `drafts.txt`（提示後に `print-drafts.mjs` の新形式で再出力）/ `generate.log.txt` |
| priority 3 | @shinnakanodream 18:38（お知らせまとめ）を生成・提示。**投稿により今週（月〜日）2 / 2 で上限**（1 件目＝9/21 朝の S1_No1_Style） |
| 提示（21:4x JST） | 5 行 12 案＋停止 10 行＋除外 19 件＋窓内 0 件 13 アカウント。**Q（引用ポスト）は明朝からのため提示せず**（本夜の候補になりうる行＝MOODYZ 19:00 `miab00677` のみ・停止行）。CTO 注記 4 点（②A 告知の書き方への言及の可能性／③C 次弾の前提／④A・C 続報待ち型／Q 候補）|
| 投稿（HUMAN） | **4 件**＝①@Fitch_official **C** 手直しなし／②@kawaii_pr **B**（`text_overridden_for`＝投稿本文は「kawaiiVR」＝生成の「kawaii*VR」からアスタリスクが落ちている。HUMAN 申告は手直しなし・記録は投稿本文を正とする）／③@fanza_sns **A** 手直しなし／⑤@shinnakanodream **A** 手直しなし。**④@sodstarofficial は見送り**（続報待ち型・CSO判定） |
| X 実在確認（22:29〜22:30 JST・`curl`） | 4 件とも直接 URL **HTTP 200**（100,010〜122,514 B）／対照 `1111111111111111111` **404**（34,748 B） |
| 実投稿時刻（snowflake 復元） | 22:27:16.204 / 22:27:44.396 / 22:28:26.243 / 22:28:58.855 JST（`posted_at` は UTC で格納） |
| Airtable | `record.mjs --create drafts.json --pick Fitch_official=C --pick kawaii_pr=B --pick fanza_sns=A --pick shinnakanodream=A --texts posted.json` → `payload_create.json` → MCP `create_records_for_table` × 1（**createdTime 22:31:35 JST**・rec `recwHOKZwchb1duey` / `recumgnriipAAsKW9` / `reclMnP7TvQBzz4JS` / `recpv0QJYUXdRaGwr`）→ `record.mjs --posted` × 4（`payload_posted_*.json`）→ MCP `update_records_for_table` × 2（x_replies の `reply_post_id` / `posted_at`・x_targets の `last_reply_at`） |
| 読み戻し（§10） | `readback.json`＝x_replies 4 件（reply_key / target / target_post_url / draft_used / reply_post_id / posted_at が payload と**機械照合で不一致 0**）／x_targets 4 件の `last_reply_at` が posted_at と一致・`status` 全件 `稼働`／**x_replies 総数 29**（9/18 6・9/19 4・9/20 8・9/21 11＝朝 7＋夜 4・reply_key 重複なし） |

## CSO判定（2026-09-21 夜・投稿完了報告への回答）と反映

| 判定 | 反映 |
|---|---|
| @ran_tpowers の店舗イベント（作品名なし）は除外側で確定 | README 手順 0 ④に追記 |
| 本文が 1 文のみで作品名・配信日が無い投稿は、画像に情報がある可能性が高いため「続報待ち」型の案を出さない | `PROMPT.md` 規則 12 に追加・README 手順 0 ⑤（本夜の @sodstarofficial A/C が該当・見送り） |
| 案の提示は「対象投稿 URL」を各行の 1 行目に固定する | `print-drafts.mjs` の各ブロック 1 行目を `=== 対象 <URL>（投稿日時）` に変更（本 README の `drafts.txt` は新形式で再出力）。チャットの提示でも同じ順 |

## 窓内の投稿（アカウント別・ID のみ・本文は貼らない）

| ハンドル | type / p | 窓内 | 扱い |
|---|---|---|---|
| @Fitch_official | メーカー公式 / 1 | 2（20:15 / 10:15） | 20:15（juny00112）を生成 → **投稿 C**。10:15（jufe00500）はバッチ内停止 |
| @kawaii_pr | メーカー公式 / 1 | 1（21:04） | 生成（kavr00266）→ **投稿 B** |
| @fanza_sns | セール告知系 / 1 | 3（10:00 ×2・ライブチャット 1） | 30%OFF 月野かすみを生成 → **投稿 A**。フェラ 50%OFF はバッチ内停止。ライブチャットはフロア外で除外 |
| @sodstarofficial | メーカー公式 / 1 | 1（19:00・本文 1 文） | 生成（知識なし・A/C）→ **見送り**（続報待ち型・CSO判定） |
| @shinnakanodream | メーカー公式 / 3 | 4（18:38 まとめ＋画像のみ 3） | まとめを生成 → **投稿 A**（priority 3・週 2 / 2）。画像のみ 3 件は除外 |
| @FANZAdougaX | セール告知系 / 1 | 2（17:00 / 19:00） | 同日返信済み（朝）で停止 |
| @MOODYZ_official | メーカー公式 / 2 | 3（19:00 miab00677 / 19:30 キャンペーン / ゲームコラボ 1） | 同日返信済み（朝）で停止 ×2。ゲームコラボはフロア外で除外 |
| @IDEAPOCKETTER | メーカー公式 / 2 | 1（20:47） | 同日返信済み（朝）で停止 |
| @PREMIUM_AV | メーカー公式 / 1 | 1（21:00・pred00889） | 同日返信済み（朝）で停止 |
| @S1_No1_Style | メーカー公式 / 3 | 1（20:40・引用投稿） | 同日返信済み（朝）で停止 |
| @shirot_AV_chosa | レビュー系 / 1 | 1（21:00） | 同日返信済み（朝）で停止 |
| @Aizawa_miyu03 / @karin_kitaoka_ / @mio_sakai_ / @nao_satsuki / @ran_tpowers / @sakuramio_X / @saki_seino / @shiromine_miu / @umi_sea_0v0 | 女優本人 | 3 / 1 / 1 / 1 / 1 / 1 / 1 / 2 / 1 | 私生活・交流・配信・店舗イベント＝除外（計 12） |
| @DMM10sale | セール告知系 / 1 | 1 | MGS＝FANZA 外で除外 |
| 窓内 0 件（13） | — | — | 5may_itsukaichi / attackers_av / azusa_hikari_ / FalenoEvent / fanza_meireview / honnaka_NN / iyo_shinohara / Kizukiamane / Madonna_AVinfo / PRESTIGE_PR2020 / waka_misono / wanz_official / mayukiito |

## ファイル

`targets.json`（対象の読み戻し＋18:0x 反映）／`active-targets.urls.txt`・`active-targets.summary.txt`／`input.txt`（15 行）／`parsed.json`／`knowledge_sql.json`・`knowledge_union.sql`・`rows.json`・`knowledge.json`／`replies.json`（25 件）／`drafts.json`・`drafts.txt`・`generate.log.txt`／`posted.json`（投稿本文）／`payload_create.json`・`payload_posted_*.json`／`readback.json`。
