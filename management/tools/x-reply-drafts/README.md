# x-reply-drafts — リプ営業の下書き生成ツール（第127便 束2・基盤A）

- 設計書: `management/_metrics/2026-W38/bundle2/design-20260918-bin127-bundle2-reply-drafts.md`（§10-1 の CSO裁定 A〜H が正）
- 形態: **ローカル CLI（node・依存パッケージなし）。Claude Code から呼ぶ。スキル化しない**（裁定 A）
- 触らないもの: `posts` / Make 5615632 / `x_targets.status`（HUMAN 専権・§26-8）/ FANZA API の新規呼び出し / 本番コード
- 資格情報: 生成は `app-concierge/.env.local`（`.gitignore` の `.env*.local` に一致・git 管理外）の `ANTHROPIC_API_KEY` を **環境変数として読むだけ**（値は出力・ログ・payload に載せない）。値の配置は HUMAN。Airtable PAT は発行しない（裁定 E）。Supabase の資格情報はローカルに無い（§12）ので、Airtable / Supabase の読み書きは **Claude Code の MCP** が行う。

## ファイル

| ファイル | 役割 | ネットワーク |
|---|---|---|
| `parse.mjs` | 入力 1 行形式のパーサ（純関数） | なし |
| `guards.mjs` / `guards.config.json` | `guardReply(text, ctx)` R1〜R11（純関数）／語リスト（**HUMAN 編集可**・R8 の字数範囲もここ） | なし |
| `knowledge.mjs` | `buildCacheKey` 再現・PK 照会 SQL の生成・execute_sql 結果からの知識抽出 | なし（SQL 文字列を出すだけ） |
| `generate.mjs` | 生成オーケストレータ（Anthropic Messages API を `fetch`・ガード・再生成 ≤2 回・停止判定） | **Anthropic API のみ** |
| `record.mjs` | `x_replies` / `x_targets` の payload 生成・snowflake → `posted_at` | なし |
| `PROMPT.md` | system プロンプト（固定・差分レビュー対象） | — |
| `airtable-fields.json` | フィールド ID（`bundle1/x_targets_field_map.json` の写し） | — |
| `print-drafts.mjs` | `drafts.json` を人が読む形に出す（`node print-drafts.mjs drafts.json`） | なし |
| `active-targets.mjs` | **抽出対象リストの組み立て**（`status=稼働 ∧ no_repropose≠true ∧ reply_restriction≠あり`・priority 昇順・`--urls` で Chrome 抽出用 URL 一覧・CSO 連絡 2026-09-19 22:2x） | なし |
| `weekly-report.mjs` | **木曜 PDCA 用の x_replies 集計**（priority 別・type 別・件数・`draft_used` 内訳・`got_like` / `got_reply` / `profile_click_delta` の記入状況・`--reactions reactions.json` で反応の取得済み件数・likes / replies / views・`--own-posts own_posts.csv` で自投稿インプレッション中央値との比較（観測のみ）・`--md` で表） | なし |
| `*.test.mjs` | `node --test`（dry-run のみ・API も Airtable も呼ばない・裁定 H） | なし |

```
node --test management/tools/x-reply-drafts/*.test.mjs
```

## 日次ループ（段階②・CSO判定 2026-09-19・2026-09-19 から）

| 手順 | 担当 | 内容 |
|---|---|---|
| **0** | **CTO**（CSO 連絡 2026-09-19 22:2x） | **抽出対象リストを毎回 Airtable から組み立てる**（固定の 20 件リストは使わない）: MCP で `x_targets` を読み戻し → `state/<日付>/targets.json` → `node management/tools/x-reply-drafts/active-targets.mjs state/<日付>/targets.json --urls`。条件＝`status=稼働 ∧ no_repropose≠true ∧ reply_restriction≠あり`（2026-09-19 22:3x 時点 35 件＝priority 1: 27 / 2: 4 / 3: 4）。**priority 3 の 4 件（@S1_No1_Style／@shinnakanodream／@mayukiito／@umi_sea_0v0）は抽出に含めるが、案の提示は週 2 件まで（対照用）**——`generate.mjs` が該当行に warning を付ける |
| 1 | **CTO**（CSO 指示 2026-09-19 08:2x で HUMAN → CTO へ改訂・FACT §26-10-1） | Chrome 抽出（**1 日 2 回＝朝 06:00・21 時前**（**CSO 決定 2026-09-21 で 08:00 → 06:00 へ変更**）・窓は**前回抽出以降**＝夜 21 時前 → 翌朝 06:00・読み取り専用＝投稿・返信・フォロー・いいね・ブックマークをしない）→ `@ハンドル｜投稿日時｜投稿URL｜本文｜リンク先 content_id` を `runs/<日付>/input.txt` に置く（本文は台帳に貼らない）。重複はツール側が `target_post_url` で排除 |
| 2 | CTO | ツール実行（下の手順 2〜5）→ 案を提示。**停止判定に当たった行はその旨を表示**（同一投稿 1 回のみ／同日同ハンドル 1 件／再返信間隔＝女優本人 3 日・それ以外 1 日） |
| 3 | HUMAN | 案を選んで投稿 → リプ URL を Claude Code に貼る |
| 4 | CTO | `record.mjs` の payload を Airtable MCP で書き込み → 読み戻しを報告（手順 7〜8） |

チャット側（戦略顧問）は日次ループから外れる。週次（木曜）で `x_replies` を読んで型を再判定。**B 型は知識ありモード（cache ヒット）でのみ生成**（知識なしでは A・C の 2 案）。

## 手順（1 回分）

作業ディレクトリはリポジトリルート。中間ファイルは `management/_metrics/<週>/bundle2/runs/<YYYYMMDD>/` に置く（実験資産は git 管理・§24-11-1）。

0. **対象リスト**（CTO）: `x_targets` を MCP で読み戻して `state/<日付>/targets.json` に保存 → `node management/tools/x-reply-drafts/active-targets.mjs state/<日付>/targets.json --urls` の一覧を Chrome 抽出の巡回先にする（`--json` で内訳）。手順 3 の `targets.json` にもこのファイルを使える。
   - **抽出段階の絞り込み（CSO判定 2026-09-20 朝）**: ①**女優本人・レビュー系**は「作品・発売・配信・セール・ランキング・作品イベント」に触れている投稿のみ該当。**私生活・配信お礼・出勤告知・雑談は抽出段階で除外し、除外した件数だけ報告する**（本文は台帳に貼らない）。②**動画フロア外（FANZAブックス・同人・ゲーム）の告知は除外。FANZA 外（MGS動画 等）のセール・作品も同じく除外**（CSO判定 2026-09-21 朝・9/21 朝の @DMM10sale「MGS動画 300 円」引用・@shirot_AV_chosa の mgstage.com リンクは除外）。 ③メーカー公式・セール告知系は従来どおり（告知は基本すべて該当）。④**【補足・CSO判定 2026-09-20 夜】「作品に触れる」は作品名・出演作・発売・配信・セール・作品イベントに限る。ファンからの贈り物・交流の投稿（例: 「データをいただいた」「メッセージが入っていた」）は含めない**（9/20 夜の @5may_itsukaichi・@shirot_AV_chosa は見送り）。
   - **抽出はプロフィール直読み**（navigate → `find` timestamp → scroll → `find`・センシティブ警告は「プロフィールを表示する」を押す＝表示切替のみ）。**X の検索（`from:` OR・最新）はプロフィールに実在する投稿を返さないことがある**（2026-09-20 実測: FANZAdougaX 05:00 の 2 件が検索に出ない）ため使わない。窓の判定は snowflake ID（`(id >> 22) + 1288834974657` ms）。
1. **CTO**（旧: HUMAN・08:2x 改訂）: 対象投稿を 1 行 1 件で `input.txt` に貼る
   `@ハンドル｜投稿日時｜投稿URL｜本文｜作品コード（任意）`
   - 区切りは全角「｜」（半角「|」も可・混在不可）。本文に「｜」があっても末尾が作品コードでなければ本文として扱う。
   - 作品コードは content_id（`pxvr00483`）／works URL／品番（`SONE-682`）のいずれか。**content_id があればそれを貼る（Chrome 抽出の「リンク先 content_id」列・CSO 2026-09-19）。品番は content_id が無いときのフォールバック**（`sitemap_works_archive` に無い作品は解決できない）。無ければ省略。
2. `node management/tools/x-reply-drafts/parse.mjs input.txt > parsed.json`
3. **Claude Code（MCP）**: `x_targets` を `list_records_for_table`（`handle` で絞る・フィールドは `handle / display_name / type / genres / note / reply_restriction / no_repropose / last_reply_at / status`）→ `targets.json` に保存。`x_replies` を `reply_key / target_post_url / posted_at` で読み戻し → `replies.json`。**MCP の生出力（`records[].cellValuesByFieldId`）のまま保存してよい。**
4. 作品コードがある行のみ: `node management/tools/x-reply-drafts/knowledge.mjs --sql parsed.json` → 行ごとの SQL。**Claude Code が Supabase MCP `execute_sql` で実行**（read-only）。
   - `step=hinban` の SQL は `sitemap_works_archive` から content_id 候補を返す。候補が 1 件なら `node knowledge.mjs --key <content_id>` の 3 フロア分を `execute_sql` に流す（`--sql` の `cid` 型と同じ SQL）。複数・0 件なら「解決不能」＝HUMAN が content_id を貼り直す。
   - `step=cid` の SQL の結果（`[{cache_key, fetched_at, item}]`）を `{"<lineNo>": rows}` の形で `rows.json` に保存 → `node knowledge.mjs --extract rows.json > knowledge.json`。ヒット 0 件の行は知識なしモード（B は台帳の傾向のみ）。
5. 生成:
   ```
   node --env-file=app-concierge/.env.local management/tools/x-reply-drafts/generate.mjs \
     --parsed parsed.json --targets targets.json --replies replies.json --knowledge knowledge.json --out drafts.json
   ```
   - 行ごとに A / B / C の 3 案・ガード結果・`reply_key`・停止理由を出す。**停止（対象外／同日 2 件目／3 日以内／記録済み）の行は API を呼ばない**（裁定 G）。
   - `record.mjs --create` は同一ハンドルが複数行あるとき生成済みの行を使う（停止行は読み飛ばす・2026-09-20）。
   - **同一バッチ内の同日同ハンドル 2 件目以降も生成しない**（`checkStop` は x_replies の既存行しか見ないため・2026-09-20 追加）。**入力の並び順＝優先順**（先に書いた行を生成）。全行を生成したいときは `--all-lines`。
   - **本文欄に CTO の注記（「（画像 1 枚・スレッド返信…）」等）を入れない**——案に混入する（2026-09-20 12 行目で実発生・注記を外して再生成した）。補足は作品コード欄か README に書く。
   - ガード NG の案だけ最大 2 回再生成。それでも NG なら「一部生成不能」。
6. **HUMAN**: 案を選んで投稿する（投稿はツールの範囲外）。
7. 記録 payload: `node management/tools/x-reply-drafts/record.mjs --create drafts.json --pick FANZAdougaX=C --pick honnaka_NN=A [--texts posted.json] --out payload.json`
   - **HUMAN が文面を手直しして投稿した場合、記録は投稿した本文を正とする**（CSO判定 2026-09-19 12:1x）: `posted.json` に `{"<handle>": "投稿した本文"}` を置いて `--texts` で渡す（`draft_used` は選んだ型のまま・payload の `text_overridden_for` に手直しした handle が出る）。
   → **Claude Code が Airtable MCP `create_records_for_table`（`x_replies`）で書き込み → `reply_key` で読み戻し（§10）**。payload は書き込み前に URL/@/af_id/vodnavi の混入 0 を機械検査済み（`target_post_url` を除く）。
8. 投稿後、HUMAN がリプ URL を貼る → `node management/tools/x-reply-drafts/record.mjs --posted --record <x_replies の rec> --target <x_targets の rec> --url https://x.com/vodnavi_jp/status/…`
   → `reply_post_id` / `posted_at`（snowflake 復元）/ `x_targets.last_reply_at` の update payload → **MCP `update_records_for_table` × 2 → 読み戻し**。

## 木曜 PDCA 集計（`weekly-report.mjs`・CSO 連絡 2026-09-19 22:2x）

9/24（水）朝の時点で `x_replies` を **priority 別・type 別**に集計して報告する（件数・`draft_used` の内訳・`got_like` / `got_reply` の記入状況）。判断は書かない。**集計の起点は朝の抽出と同じ 06:00**（CSO 決定 2026-09-21・反応の補完 → 集計の順で 06:00 から）。

```
# 0) 反応の補完（CSO 指示 2026-09-19 22:5x）: x_replies の各 reply_post_id を Chrome 連携で読み取り専用で開き
#    （https://x.com/vodnavi_jp/status/<id>・get_page_text＝表示回数・find＝返信/リポスト/いいねの aria-label）
#    → state/<日付>/reactions.json に生カウントを記録 → got_like / got_reply を Airtable MCP で書き込み（取得済み・0 は false）→ 読み戻し。
#    profile_click_delta は投稿ページから取れない＝空のまま（未取得）。表示回数は x_replies に note 欄が無いため Airtable に書かず reactions.json のみ。
# 1) MCP で x_replies（全フィールド）と x_targets を読み戻して state/<日付>/ に保存
# 2) 集計（期間は posted_at の JST 暦日・両端含む・--reactions を付けると「反応 取得済（未取得 n）」「likes / replies 合計」「views 合計（中央値）」列が出る）
node management/tools/x-reply-drafts/weekly-report.mjs --replies state/<日付>/replies.json --targets state/<日付>/targets.json --reactions state/<日付>/reactions.json --since 2026-09-18 --until 2026-09-24 --md
```

- `x_targets` に紐づかない行は priority 空・type 不明で別行に出る（`unmatched`）。`posted_at` 空の行は期間で落とさず記入状況に出す。
- **Airtable の `got_like` / `got_reply` はチェックボックスで「取得済み・0」と「未取得」を区別できない。** 区別は `reactions.json` の有無（`--reactions` の「反応 取得済」列）で見る。`reactions.json` に無い行＝未取得。
- 初回（9/18〜9/19・10 件・反応は 2026-09-19 22:4x〜22:5x 取得）→ `management/_metrics/2026-W38/bundle2/state/20260919-2230/weekly-report-dry-20260919.md`＝全件 priority 1・A 4 / B 3 / C 3・likes 0 / replies 0・views 合計 123（中央値 7.5）。
- priority 3（対照）の「提示は週 2 件まで」は CTO の手動カウント（実装不要・CSO 2026-09-19 22:5x）。**週は月〜日で数える**（CSO判定 2026-09-21 朝。9/20（日）の S1_No1_Style は先週分・9/21（月）の S1_No1_Style で今週 1 / 2）。
- **自投稿との比較（CSO 連絡 2026-09-20・観測のみ）**: HUMAN が X Analytics（Premium）の投稿別 CSV を `state/<日付>/own_posts.csv` に置く → `--own-posts state/<日付>/own_posts.csv` で「リプの表示回数中央値」と「同期間の自投稿インプレッション中央値」を並べる比較表が末尾に出る。**判定基準（10/12・自投稿の中央値 ≥ 50・§26-2）は変えない。** 列名は tolerant に検出（id＝`Tweet id`/`Post id`・日時＝`time`/`Date`・インプレッション＝`impressions`/`Impressions`）し、使用した列名を出力に併記する。x_replies の `reply_post_id` と一致する行（リプ自身）は自投稿から除外。**TZ 表記の無い日時は JST として扱う＝初回の HUMAN 提供 CSV で列名と TZ を実測して確定する**（旧 Twitter Analytics 形式は `+0000`＝UTC 明記）。

## ガード（`guards.mjs`）

| # | 検査 | 語・値の置き場 |
|---|---|---|
| R1 | URL / ドメイン（`https?://` `www.` `xxx.com/jp/co.jp/net/io/me` `t.co`） | コード |
| R2 | `@` `＠` | コード |
| R3 | `vodnavi` `ボドナビ` `af_id` `moterist` | コード |
| R4 | `#` `＃` | コード |
| R5 | 宣伝語（「登録」は誘導形のみ）。**ヒット語が相手投稿本文にそのまま含まれていれば免除**（`R5_quote_exempt`・CSO裁定 2026-09-19） | `guards.config.json` `R5_promo` |
| R6 | 容姿・露骨語 | `guards.config.json` `R6_appearance_explicit` |
| R7 | 女優名には「さん」／メーカー・レーベル名に「さん」は NG | `ctx.names`（作品知識の `actress[]`・女優本人の `display_name`）／`ctx.orgNames`（それ以外の `display_name`・maker/label） |
| R8 | 字数（既定 **30〜140**・`R8_chars`・CSO裁定 2026-09-19 で min 80 → 40 → 30）・X 重み ≤280・**文数 ≤2**（`R8_sentences_max`） | `guards.config.json` |
| R12 | 定型句（追う側としては／予定が立てやすい／助かります など）＋**報告書調の締め（確認しました／把握しました／届いた／受け止め・CSO判定 2026-09-19 12:1x）** | `guards.config.json` `R12_stock_phrases` |
| R13 | 根拠なし断定語（恒例／毎回／一定 など）＋暦の推定語（三連休／連休／週末／祝日／休日）＋**投稿時刻・本文にない時間表現・次弾の推定（今夜／今日中／次弾／第N弾・CSO判定 2026-09-21 朝）**。本文にあれば引用として免除（regex は全マッチを 1 箇所ずつ判定＝本文が「第3弾」なら「第4弾」だけ NG） | `guards.config.json` `R13_unfounded_assertions` |
| R14 | 具体性: 案に相手投稿本文の具体（数値の完全一致・語の含有）が 1 つ以上。**R14-A（CSO判定 2026-09-21 朝）: A 型の祝福（「おめでと」）は cache の配信日（`knowledge.date`）が投稿日から 3 日以内のときのみ許可。それ以外の A 型は祝福ではなく本文の具体 1 つへの一言**（`A_congrats_window_days`・`postedAtJst` を渡さない呼び出しでは検査しない）。**B 型は作品知識が無ければ NG・あれば cache 由来の事実を 1 つ含む・最大 2 つまで**（`B_max_knowledge_facts`・種別ごとに数える・配信日の表記ゆれは 1 つ・出演者名は数えない・優先 収録時間 > 配信日 > シリーズ > その他・CSO判定 2026-09-19 12:1x） | `guards.config.json` `R14_concreteness` |
| R15 | 告知の形式・並べ方・出し方への言及 | `guards.config.json` `R15_meta_mentions` |
| R16 | 日付の斜線表記（`09/18` `9/18`）＝「9月18日」に正規化する（CTO 追加） | `guards.config.json` `R16_date_format` |
| R17 | 女優本人向けの案は「<表示名>さん、」で始める（CSO判定 2026-09-19 12:1x の PROMPT 規則の機械検査・CTO 追加） | `guards.config.json` `R17_actress_greeting` |
| R18 | 語置換（ガードではない）: 「体験版」→「サンプル動画」を生成直後に自動置換し `drafts.json` の `replacements` に記録（CSO判定 2026-09-19 12:1x） | `guards.config.json` `R18_word_replacements` |
| R9 | 数値の出典（B は全数値／全案は「数値＋円・%・割・OFF」）— 出典＝相手投稿本文＋作品知識 JSON | コード（旧 R10 を統合・裁定 D） |
| R11 | 虚偽の体験主張 | `guards.config.json` `R11_false_experience` |

- モデルの自己申告は証拠にしない。**生成後に必ず純関数で再検査**する（設計書 §4）。
- `record.mjs` は payload の全文字列に `FORBIDDEN = /https?:|vodnavi|af_id|moterist-\d{3}/i` を再適用する（束1 `followers-update.mjs` と同一）。

## 既知の事実（実装時の実測 2026-09-18）

- 2026-09-18 の実績 6 件（`x_replies`）を設計時のガード（R8 min 80・R5 に「登録」単体）に通すと全件 R8・#2 R4・#5 R5 だった。**CSO裁定 2026-09-19 で較正**（R8 min 40／「登録」は誘導形のみ＋本文引用は免除／R4 維持）→ 較正後は **5/6 が全通過・#2 Fitch のみ R4**（投稿済み・実害なしとして記録のみ。以後タグ名を裸で書かない）。
- snowflake 復元は 6 件中 5 件が Airtable 記録値と秒単位で一致。Madonna（`2100938725194977383`）は BigInt 計算で `13:23:20.297Z`、記録値は `13:23:19`（1 秒差・記録側の丸め）。
- `buildCacheKey` の写しは `pxvr00483` / `snos00334`（videoa・hits 1・filtered=false）で本番の PK と一致。
- 相手投稿本文は Airtable に保存していない（`x_replies` には `target_post_url` のみ）。公開 oEmbed（`publish.x.com/oembed`）は当該投稿に 403 を返す（2026-09-18 23:24 JST 実測）＝本文は HUMAN が貼る。
