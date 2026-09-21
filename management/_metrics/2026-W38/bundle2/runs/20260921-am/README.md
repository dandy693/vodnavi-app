# 束2 段階② 2026-09-21 朝の抽出・生成（06:00 起点・窓＝2026-09-20 21:00 JST 以降・対象＝x_targets の稼働 34）

**5軸**: ①対象範囲＝`active-targets.mjs`（`status=稼働 ∧ no_repropose≠true ∧ reply_restriction≠あり`）の 34 アカウントのプロフィール直読み ②期間＝抽出 06:2x〜06:5x JST・窓＝夜の抽出（9/20 20:4x〜21:2x）以降＝snowflake ID > `2101642528158646272`（9/20 21:00:00 JST）。**朝の抽出は本日から 06:00 起点（CSO 決定 2026-09-21・ROUTINE §3-2）** ③計測系＝Chrome MCP（CSO ログイン済み @vodnavi_jp・読み取りのみ・X 検索は使わない）＋ Airtable MCP（読み戻し）＋ Supabase MCP `execute_sql`（read-only）＋ Anthropic API（`generate.mjs`）④出典＝自アカウント実測 ⑤機会の数＝34 アカウント（priority 1: 26 / 2: 4 / 3: 4）。

| 項目 | 実測 |
|---|---|
| 対象リスト | 06:22 JST に MCP で x_targets 42 件を読み戻し（稼働 34／候補 8＝@AViiyone 含む）→ `targets.json`（9/20 pm の生出力に last_reply_at 4 件を反映）→ `active-targets.mjs` → **34 件**（`active-targets.urls.txt`） |
| 抽出 | 34/34 プロフィール読了 06:2x〜06:5x（センシティブ警告の「プロフィールを表示する」クリック 8 アカウント＝PRESTIGE_PR2020 / PREMIUM_AV / shirot_AV_chosa / sakuramio_X / sodstarofficial / wanz_official / IDEAPOCKETTER / MOODYZ_official）。**窓内の投稿があったのは 8 アカウント・12 投稿**（スレッド返信を除く）。窓内 0 件＝26 アカウント。`profiles.txt` に ID 一覧 |
| 抽出段階の絞り込み（CSO判定 9/20 朝＋夜の補足④） | **①私生活等＝0 件**（女優本人・レビュー系に窓内投稿なし。shirot を除く）。**③動画フロア外＝2 件除外**（@DMM10sale 20:54「300円ｷﾀ」＝MGS動画 300 円の引用・FANZA 外／@shirot_AV_chosa 23:00「こんな休日が必要だ…」＝スレッド返信のリンク先が mgstage.com・FANZA 外）。本文は台帳に貼らない |
| 入力 | `input.txt`＝**9 行**（8 ハンドル・PREMIUM_AV と MOODYZ_official は 2 行ずつ＝最新 ID 順）。**本文欄は投稿本文のみ**（CTO 注記なし）。@shirot_AV_chosa 22:00 は本文「愛人中出しS●X...」＋スレッド返信「作品はこちら …」を本文に連結（pm と同じ扱い）。@FANZAdougaX 05:00 の「5️⃣0️⃣」はキーキャップのまま転記（`get_page_text` は落とすため `find` で img alt を確認） |
| 作品コードの取得 | 投稿本文の `al.fanza.co.jp/?lurl=…id=<cid>` から 6 件（atvr00073 / pred00898 / pred00891 / mida00786 / mida00812 / sivr00507）、`ideapocket.com/works/detail/IPZZ947` → ipzz00947、t.co → `al.dmm.co.jp` の Location（1 ホップ・`curl -o /dev/null -w`）から 1sdhs00044。@FANZAdougaX は `rcv.ixd.dmm.com/api/surl` → 303 `…/api/click?…`（クリックトラッカー・追わない）＝作品コードなし |
| 停止判定 | `stopcheck_all.json`＝**9 行すべて OK**（9/20 朝に返信済みの FANZAdougaX / PREMIUM_AV / MOODYZ_official / IDEAPOCKETTER と 9/20 夜の S1_No1_Style は 1 日間隔で暦日が変わったため OK）。**本バッチ内の同日同ハンドル 2 件目＝2 行停止**（PREMIUM_AV 21:00 pred00891 / MOODYZ_official 平野楓 mida00812） |
| 作品知識 | `knowledge_union.sql`（8 行×3 フロア PK）→ Supabase MCP → `rows.json`（URL・画像・affiliateURL を除いて転記）→ `knowledge.json`。**ヒット 8/8**。1sdhs00044 の campaign「みんなのお気に入り30％OFF」は date_end 2026-09-20 23:59:59＝取得時点で終了済み（cache 由来・B 案には使われていない）。mida00812 は date 2026-10-02（配信前・停止行） |
| 生成 | `generate.mjs` **07:02:05〜07:05:37 JST・claude-opus-5・API 13 回・input 9,999 / output 13,822 / cache_read 27,677 / cache_creation 12,230**。**生成 6 行・16 案 全通過＋一部生成不能 1 案**（@attackers_av B＝R14「cache 由来の事実が 3 個（最大 2）」再生成 2 回とも NG → A/C のみ）。知識あり 5 行＝A/B/C（attackers は A/C）・知識なし 1 行（FANZAdougaX）＝A/C。停止 2 行（本バッチ内）。`drafts.json` / `drafts.txt` / `generate.log.txt` |
| priority 3 | @S1_No1_Style 00:21（VR 新作 sivr00507・初美なのか）を生成。**提示すれば今週 2 / 2**（手動カウント・9/20 夜の 1 件目に続く 2 件目） |

## 窓内の投稿（アカウント別・ID のみ・本文は貼らない）

| ハンドル | type / p | 窓内 | 扱い |
|---|---|---|---|
| @attackers_av | メーカー公式 / 1 | 1（9/21 00:20） | 生成（atvr00073・VR 新作・B は R14 で生成不能） |
| @PREMIUM_AV | メーカー公式 / 1 | 2（22:00 / 21:00・#PREMIUM週末5本 の連投） | 22:00（pred00898）を生成。21:00（pred00891）はバッチ内停止 |
| @FANZAdougaX | セール告知系 / 1 | 1（9/21 05:00） | 生成（こだわりのフェラ 50％OFF 第3弾・朝 9:59 まで・知識なし） |
| @shirot_AV_chosa | レビュー系 / 1 | 2（23:00 / 22:00・各スレッド返信付き） | 22:00（1sdhs00044・SOD クリエイト）を生成。23:00 は mgstage.com リンク＝フロア外で除外 |
| @MOODYZ_official | メーカー公式 / 2 | 2（22:00 ×2・各スレッド返信付き） | 泉ももか（mida00786）を生成（ID の新しい順）。平野楓 AV DEBUT（mida00812・配信 10/2）はバッチ内停止 |
| @IDEAPOCKETTER | メーカー公式 / 2 | 1（22:00・スレッド返信付き） | 生成（ipzz00947・坂井美桜） |
| @S1_No1_Style | メーカー公式 / 3 | 1（9/21 00:21） | 生成（priority 3・週 2 / 2 になる） |
| @DMM10sale | セール告知系 / 1 | 1（9/20 20:54・pm 読了後の投稿） | 除外（MGS動画 300 円の引用＝FANZA 外） |
| 窓内 0 件（26） | — | — | 5may_itsukaichi / Aizawa_miyu03 / azusa_hikari_ / FalenoEvent / fanza_meireview / Fitch_official / honnaka_NN / iyo_shinohara / karin_kitaoka_ / kawaii_pr / Kizukiamane / mio_sakai_ / Madonna_AVinfo / nao_satsuki / PRESTIGE_PR2020 / ran_tpowers / saki_seino / sakuramio_X / sodstarofficial / waka_misono / wanz_official / fanza_sns / shiromine_miu / mayukiito / shinnakanodream / umi_sea_0v0 |

## 提示（HUMAN が選んで投稿・投稿後に `record.mjs --create --texts`）

`drafts.txt` の 6 行（attackers_av / PREMIUM_AV / FANZAdougaX / shirot_AV_chosa / MOODYZ_official / IDEAPOCKETTER）＋ priority 3 の S1_No1_Style。

## 注記

- リンク解決は `curl -s -o /dev/null -w '%{http_code} %{redirect_url}'` の 1 ホップのみ。`video.dmm.co.jp` へは到達していない。`rcv.ixd.dmm.com` は 303 で同ホストのクリックトラッカーを返したため追っていない。
- 案の本文と投稿・cache の事実の突合（CTO が読んで気づいた点・判定は CSO）: @IDEAPOCKETTER A「新作、配信開始おめでとう」＝投稿本文に配信開始の記述なし・cache の配信日は 8/28（B は 8月28日 と正しく記述）／@MOODYZ_official A「新作配信おめでとう」＝投稿本文は【PR】＋作品名のみ・配信日 9/11／@FANZAdougaX A「今夜のうちにリストを眺めて」＝投稿 05:00・期限は同日 09:59（時間軸が合わない）・C「第4弾」＝本文に無い（R13 の語リスト外）。
- x_replies の反応（likes 等）は本 run では取得していない（9/24 朝に累積で再取得）。
- 画像は本ブラウザ環境で描画されない。作品の特定は本文・リンク・スレッド返信からのみ行った。

## 投稿と記録（2026-09-21 07:22〜08:03 JST・HUMAN 投稿 7 件／記録 08:08〜08:10）

| # | reply_key | 型 | 手直し | reply_post_id | posted_at（snowflake・JST） | x_replies rec | x_targets last_reply_at |
|---|---|---|---|---|---|---|---|
| 1 | `20260921-attackers_av` | A | なし | `2101799195137200513` | 07:22:32 | `recIcT6hLLbXbE7Jb` | `recGCCpEJDzLNEkLo` → 2026-09-20T22:22:32.318Z |
| 2 | `20260921-PREMIUM_AV` | C | なし | `2101799357008040412` | 07:23:10 | `recXOW0tChnz7TEc9` | `recHwHcrfE8LFcRdW` → 22:23:10.911Z |
| 3 | `20260921-FANZAdougaX` | A | **あり**（`text_overridden_for`） | `2101799431620477291` | 07:23:28 | `recDUvC3rzBqtYf6z` | `recEfvfO65s5S0o1f` → 22:23:28.700Z |
| 4 | `20260921-shirot_AV_chosa` | C | なし | `2101799614290796558` | 07:24:12 | `recTWxdUifMOVXNCf` | `recPYIDdkQ7EC0w0q` → 22:24:12.252Z |
| 5 | `20260921-MOODYZ_official` | B | **あり** | `2101809200032788851` | 08:02:17 | `rec5Mu9X5RqBm2obw` | `recuIj1YV4CmsxgJN` → 23:02:17.671Z |
| 6 | `20260921-IDEAPOCKETTER` | B | なし | `2101809432481161224` | 08:03:13 | `recAGVCP4e5mhHasV` | `rec3EWHDnA1tnjPzL` → 23:03:13.091Z |
| 7 | `20260921-S1_No1_Style` | A | なし | `2101809530401444081` | 08:03:36 | `recwx4kIDrcai15L3` | `recItkceKqz7rPmzD` → 23:03:36.437Z |

- `record.mjs --create drafts.json --pick … --texts posted.json`（`payload_create.json`・7 件・`text_overridden_for: ["FANZAdougaX","MOODYZ_official"]`）→ 事前に `search_records` で `20260921-` の既存行 0 件を確認 → MCP `create_records_for_table`（createdTime 08:08:51 JST）→ `--posted` × 7（`payload_posted_*.json`）→ `update_records_for_table` × 2（x_replies 7・x_targets 7）→ **読み戻し: x_replies `20260921-*` 7 件（reply_key / target / target_post_url / reply_text / draft_used / reply_post_id / posted_at）・x_targets 7 件の `last_reply_at` が payload と一致**。X 直接 URL は 7 件とも HTTP 200（99,843〜101,100 B）・対照 `1111111111111111111` は 404（08:10:06〜08:10:15）。
- **x_replies 累計 25 件**（9/18 6・9/19 4・9/20 8・9/21 7）。**priority 3 の週カウント＝今週 1 / 2**（CSO判定: 週は月〜日。9/20（日）の S1 は先週分）。
- **`record.mjs` の改修**: `--create` が「一部生成不能」の行（attackers_av＝A OK・B NG）を拒否したため、選んだ型がガード通過なら記録できるよう改修（`node --test` で追加検査）。
- **CSO判定（2026-09-21 朝）の反映**: ③フロア外に「FANZA 外（MGS 等）」を含める CTO 判断を採用（README）／A 型の祝福は cache 配信日が投稿日から 3 日以内のみ＝**R14-A**／「今夜」「今日中」「次弾」「第N弾」を **R13** に追加（本文に無ければ NG）。**改訂後ガードを本日の 16 案に再適用: FANZAdougaX A（R13 今夜＋R14-A）・C（R13 第4弾）・MOODYZ A（R14-A・差 9 日）・IDEAPOCKETTER A（R14-A・差 23 日）が NG＝報告した 4 点と一致。attackers_av A・S1 A（差 0 日）は通過。** 設計書 §12-9。
- 反応（likes 等）は本 run では取得していない（9/24 朝に累積で再取得）。
- **`quote_dryrun.json`**（2026-09-21 17:50〜17:51・基盤D 引用ポストの dry-run・記録も投稿もしていない）: 朝の 9 行を `quote.mjs --dry-run` に通した結果（候補 3・対象外 6・`mida00812` は works ページ 500 で提示せず・attackers_av / S1 は Q1・Q2 全通過）。本番運用は 9/22 朝から（FACT §26-11・設計書 §12-10）。
