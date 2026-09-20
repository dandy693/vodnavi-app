# 束2 段階② 2026-09-20 夜の抽出・生成（窓＝2026-09-20 08:40 JST 以降・対象＝x_targets の稼働 34）

**5軸**: ①対象範囲＝`active-targets.mjs`（`status=稼働 ∧ no_repropose≠true ∧ reply_restriction≠あり`）の 34 アカウントのプロフィール直読み ②期間＝抽出 20:4x〜21:2x JST・窓＝朝の抽出（08:3x）以降＝snowflake ID > `2101456301061046272`（08:40 JST）③計測系＝Chrome MCP（CSO ログイン済み @vodnavi_jp・読み取りのみ・X 検索は使わない）＋ Airtable MCP（読み戻し）＋ Supabase MCP `execute_sql`（read-only）＋ Anthropic API（`generate.mjs`）④出典＝自アカウント実測 ⑤機会の数＝34 アカウント（priority 1: 26 / 2: 4 / 3: 4）。

| 項目 | 実測 |
|---|---|
| 対象リスト | 20:4x JST に MCP で x_targets 42 件を読み戻し（差分＝@AViiyone status=候補・no_repropose=true（HUMAN 変更）／last_reply_at 4 件＝朝の投稿）→ `targets.json`（08:0x の生出力に反映）→ `active-targets.mjs` → **34 件**（`active-targets.urls.txt`） |
| 抽出 | 34/34 プロフィール読了（センシティブ警告の「プロフィールを表示する」クリックは 9 アカウント・うち 2〜3 回目で着地 5）。**窓内の投稿があったのは 16 アカウント・38 件以上**（MOODYZ は 4h より前を未確認）。窓内 0 件＝18 アカウント |
| 抽出段階の絞り込み（CSO判定 9/20 朝） | **①女優本人・レビュー系の私生活／配信お礼／出勤告知／雑談＝10 件除外**（@Aizawa_miyu03 2＝ロック座観劇・その引用／@mio_sakai_ 4＝画像・料理・買い物／@shiromine_miu 2＝配信終わり・ゲーム配信／@umi_sea_0v0 1＝撮影会 BBQ お礼／@waka_misono 1＝撮影の引用・本文なし）。**②動画フロア外＝3 件除外**（@Aizawa_miyu03 写真展 1／@MOODYZ_official 電子書籍 1・美少女万華鏡 games 1）。本文は台帳に貼らない |
| 入力 | `input.txt`＝**15 行**（候補 11 行＋本日返信済みで停止見込みの 4 ハンドルは最新 1 件のみ）。**本文欄は投稿本文のみ**（CTO 注記なし・README 規則）。@shirot_AV_chosa の 21:00 投稿は本文なし（動画のみ）のため、同アカウントのスレッド返信「作品はこちら …」を本文に用いた |
| 停止判定 | `stopcheck_all.json`＝**同日 reply_key 既存で停止 4**（FANZAdougaX / PREMIUM_AV / MOODYZ_official / IDEAPOCKETTER＝朝に返信済み）・OK 11。@Fitch_official は 9/19 21:50 返信済みだが 1 日間隔（メーカー公式）で OK。**本バッチ内の同日同ハンドル 2 件目以降は生成しない**＝5 行停止（Fitch 3 / FalenoEvent 1）※入力の並び＝優先順 |
| 作品知識 | `knowledge_union.sql`（3 行×3 フロア PK）→ Supabase MCP → `rows.json`（URL・画像・affiliateURL を除いて転記）→ `knowledge.json`。**ヒット 2**（jufe00559 / jufd00922・いずれも campaign「こだわりのフェラ50％OFF」date_end 2026-09-21 09:59:59）／**MISS 1**（pppe00127）。@5may 「痴女女将」・@sodstar 「めいちゃん 催○術」は title / actress 検索でも該当なし＝知識なし |
| 生成 | `generate.mjs` **21:26:28〜21:28:43 JST・claude-opus-5・API 10 回・input 4,382 / output 8,284 / cache_read 24,504 / cache_creation 6,148**。**生成 6 行・13 案 全通過**（知識あり 1 行＝A/B/C・知識なし 5 行＝A/C）。**一部生成不能 1 行**（@sodstarofficial＝本文「催○術をかけられるめいちゃん…」に具体が無く A/C とも R14 未通過・再生成 2 回）。停止 9 行（同日既存 4＋本バッチ内 5）。`drafts.json` / `drafts.txt` / `generate.log.txt` |
| priority 3 | @S1_No1_Style の 20:15 本告知（蒼井すずデビュー記念イベントツアー）を生成・提示（CSO判定 9/20 朝「夜の抽出で拾う」）。**提示すれば今週 1 / 2**（手動カウント・朝は 0 / 2） |

## 窓内の投稿（アカウント別・ID のみ・本文は貼らない）

| ハンドル | type / p | 窓内 | 扱い |
|---|---|---|---|
| @Fitch_official | メーカー公式 / 1 | 4（20:15 ×2・10:15 ×2） | 1 行目（jufe00559・#肉欲の秋 50%OFF）を生成。他 3 行はバッチ内停止（jufd00922 / こだわりのフェラ一覧 ×2） |
| @shirot_AV_chosa | レビュー系 / 1 | 1（21:00・動画のみ＋スレッド返信） | 生成（pppe00127・cache MISS） |
| @5may_itsukaichi | 女優本人 / 1 | 1（10:13） | 生成（「痴女女将」＝作品への言及・知識なし） |
| @Aizawa_miyu03 | 女優本人 / 1 | 4 | 09:29「この２つ観てほしい」を生成（画像 2 枚＝作品の特定不能・本ブラウザでは画像が描画されない）。3 件除外（写真展＝フロア外／ロック座 2＝私生活） |
| @FalenoEvent | メーカー公式 / 1 | 2（14:47 / 11:56） | 14:47（イベント終了・次回 10/15）を生成。11:56 はバッチ内停止 |
| @sodstarofficial | メーカー公式 / 1 | 1（19:00） | 一部生成不能（R14） |
| @mio_sakai_ | 女優本人 / 1 | 4（19:39 / 18:36 / 17:36 / 10:30・10h より前は未確認） | 4 件とも除外（私生活・雑談） |
| @waka_misono | 女優本人 / 1 | 1（11:09） | 除外（撮影の引用・本文なし）。9/19 返信済みで 3 日間隔にも該当 |
| @FANZAdougaX | セール告知系 / 1 | 4（19:00 ×2・16:xx ×2） | 同日既存で停止（最新 1 件のみ入力） |
| @PREMIUM_AV | メーカー公式 / 1 | 3（20:00 / 19:00 / 18:00） | 同日既存で停止（最新 1 件＝pred00881 のみ入力） |
| @MOODYZ_official | メーカー公式 / 2 | 7 以上（19:30〜16:xx） | 同日既存で停止（最新 1 件のみ入力）。うち電子書籍 1・games 1 はフロア外 |
| @IDEAPOCKETTER | メーカー公式 / 2 | 3（20:33 ×2 / 10:xx） | 同日既存で停止（最新 1 件のみ入力） |
| @shiromine_miu | 女優本人 / 2 | 2 | 2 件とも除外（配信お礼・配信告知） |
| @S1_No1_Style | メーカー公式 / 3 | 1（20:15） | 生成（priority 3・週 1 / 2 になる） |
| @umi_sea_0v0 | 女優本人 / 3 | 1（19:06） | 除外（撮影会・BBQ お礼） |
| 窓内 0 件（18） | — | — | Madonna_AVinfo / attackers_av / azusa_hikari_ / DMM10sale（07:00 は朝抽出済み）/ fanza_meireview / honnaka_NN / iyo_shinohara / karin_kitaoka_ / kawaii_pr / Kizukiamane / nao_satsuki / PRESTIGE_PR2020 / ran_tpowers / saki_seino / sakuramio_X / wanz_official / fanza_sns / mayukiito / shinnakanodream |

## 提示（HUMAN が選んで投稿・投稿後に `record.mjs --create --texts`）

`drafts.txt` の 6 行（Fitch_official / shirot_AV_chosa / 5may_itsukaichi / Aizawa_miyu03 / FalenoEvent / S1_No1_Style）。生成不能 1（sodstarofficial）。

## 注記

- リンク解決は `curl -s -o /dev/null -w '%{http_code} %{redirect_url}'` の 1 ホップのみ（t.co → al.dmm.co.jp / al.fanza.co.jp の `lurl` から content_id を読んだ。`video.dmm.co.jp` へは到達していない）。
- x_replies の反応（likes 等）は本 run では取得していない（9/24 朝に再取得）。
- 画像は本ブラウザ環境で描画されない（Aizawa の 2 枚は黒表示）。作品の特定は本文・リンク・スレッド返信からのみ行った。

## 投稿と記録（2026-09-20 21:37〜21:43 JST・HUMAN 投稿 4 件）

| # | reply_key | 型 | 手直し | reply_post_id | posted_at（snowflake・JST） | x_replies rec | x_targets last_reply_at |
|---|---|---|---|---|---|---|---|
| 1 | `20260920-Fitch_official` | B | **あり**（本文は投稿文を正とする・`text_overridden_for`） | `2101652024261841381` | 21:37:44 | `recTYezDasb2cTwaT` | `rec4XV4eU5UQUntIZ` → 2026-09-20T12:37:44.047Z |
| 2 | `20260920-Aizawa_miyu03` | C | なし | `2101652266273153150` | 21:38:41 | `recZPc8aGD6aCQwRz` | `recld7SvHioWfSb8o` → 12:38:41.747Z |
| 3 | `20260920-FalenoEvent` | A | なし | `2101652351027417222` | 21:39:01 | `recbvFoQg0PMeNDgD` | `recByvjAnovkOIiu3` → 12:39:01.954Z |
| 4 | `20260920-S1_No1_Style` | A | なし | `2101652588454416580` | 21:39:58 | `recJCqaVX3xBujdG7` | `recItkceKqz7rPmzD` → 12:39:58.561Z |

- `record.mjs --create drafts.json --pick … --texts posted.json`（`payload_create.json`・4 件・`text_overridden_for: ["Fitch_official"]`）→ MCP `create_records_for_table`（createdTime 21:42:28 JST）→ `--posted` × 4（`payload_posted_{fitch,aizawa,faleno,s1}.json`）→ `update_records_for_table` × 2（x_replies 4・x_targets 4）→ **読み戻し: x_replies `20260920-*` 4 件（reply_key / target / target_post_url / reply_text / draft_used / reply_post_id / posted_at）・x_targets 4 件の `last_reply_at` が payload と一致**。X 直接 URL は 4 件とも HTTP 200（99,516〜128,494 B）・対照 `1111111111111111111` は 404（21:43:34）。
- **x_replies 累計 18 件**（9/18 6・9/19 4・9/20 8＝朝 4＋夜 4）。**priority 3 の週カウント＝1 / 2**（S1_No1_Style・今週初）。
- **CSO判定（夜）**: @5may_itsukaichi（ファンからの贈り物）・@shirot_AV_chosa は見送り。**絞り込みの補足＝「作品に触れる」は作品名・出演作・発売・配信・セール・作品イベントに限り、ファンからの贈り物・交流の投稿は含めない**（ツール README 手順 0 ④に追記）。
- 反応（likes 等）は本 run では取得していない（9/24 朝に累積で再取得）。
