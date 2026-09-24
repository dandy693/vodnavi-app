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
| `follow-candidates.mjs` | **フォロー営業（CSO 指示 2026-09-24・FACT §26-13）**: 当日リプした対象投稿へ「いいね／返信」した一般ユーザーの候補を絞り込んで提示（自アカウント・`x_targets`・`follows.json` 既存・バッチ内重複を除外／1 日 10 件の残り枠で切る）→ HUMAN がフォロー → `--record` で `management/_metrics/x-follows/follows.json` に追記（読み戻し表示）。**CTO はフォローしない** | なし（Airtable の読み戻し JSON と follows.json のみ） |
| `resolve-cid.mjs` | **t.co → content_id の解決（CSO判定 2026-09-24 の 3）**: 投稿内リンク（t.co）へ **1 回だけ GET（redirect: manual）** し、Location（`al.fanza.co.jp/?lurl=…`）の URL 文字列から content_id を抜く。**al.fanza 以降・`video.dmm.co.jp` へは到達しない**（クリック計測とツール層遮断の回避）。`--tco tco.tsv --fill input.txt` で作品コード欄（⑤）が空の行に付与し、読み戻して表示する **【運用則・CSO 確定 2026-09-24】短縮 URL から遷移先を知るときは Location を 1 段読むだけにする**（FACT §26-12-2 運用則）。`--hops` で段数を増やす使用は CSO の個別許可を要する | **t.co への GET 1 回のみ** |
| `quote.mjs` / `PROMPT-Q.md` | **引用ポスト（基盤D・CSO 指示 2026-09-21 夜）**: 朝・夜の抽出結果のうち「知識あり（cache ヒット＝content_id 確定）」∧「メーカー公式・女優本人」∧「発売・配信開始・予約開始の投稿」から引用向き 1〜2 件を別枠で提示（案 Q1・Q2＝一言 40〜80 字 ＋ works 詳細 URL）。提示前に works ページの HTTP 200 を確認 | **Anthropic API ＋ works ページ GET**（app.vodnavi.jp のみ） |
| `ga4-quote-sessions.mjs` | 引用ポスト経由の計測: GA4 Data API で `utm_medium=quote` のセッション（`hostName=app.vodnavi.jp`・utm_content＝ハンドル別・landingPage 別・日別）を出す。木曜集計に `weekly-report.mjs --ga4-quote` で添付 | **GA4 Data API**（read-only・鍵は §3） |
| `weekly-report.mjs` | **木曜 PDCA 用の x_replies 集計**（priority 別・type 別・件数・`draft_used` 内訳・`got_like` / `got_reply` / `profile_click_delta` の記入状況・`--reactions reactions.json` で反応の取得済み件数・likes / replies / views・`--own-posts own_posts.csv` で自投稿インプレッション中央値との比較（観測のみ）・`--md` で表） | なし |
| `*.test.mjs` | `node --test`（dry-run のみ・API も Airtable も呼ばない・裁定 H） | なし |

```
node --test management/tools/x-reply-drafts/*.test.mjs
```

## 日次ループ（段階②・CSO判定 2026-09-19・2026-09-19 から）

| 手順 | 担当 | 内容 |
|---|---|---|
| **0** | **CTO**（CSO 連絡 2026-09-19 22:2x） | **抽出対象リストを毎回 Airtable から組み立てる**（固定の 20 件リストは使わない）: MCP で `x_targets` を読み戻し → `state/<日付>/targets.json` → `node management/tools/x-reply-drafts/active-targets.mjs state/<日付>/targets.json --urls`。条件＝`status=稼働 ∧ no_repropose≠true ∧ reply_restriction≠あり`（2026-09-19 22:3x 時点 35 件＝priority 1: 27 / 2: 4 / 3: 4）。**priority 3 の 4 件（@S1_No1_Style／@shinnakanodream／@mayukiito／@umi_sea_0v0）は抽出に含めるが、案の提示は週 2 件まで（対照用）**——`generate.mjs` が該当行に warning を付ける |
| **1**（**2026-09-24 朝から・CSO裁定 2026-09-23 夜**） | **CTO** | **リスト方式**: X リスト **`vodnavi-targets`**（非公開・`https://x.com/i/lists/2102756907912163775`）のタイムラインを**窓の起点（前回抽出時刻）まで遡って読む** → 該当判定 → **本文が取れない投稿のみ**プロフィール／投稿ページで補完 → `runs/<日付>/input.txt`。**開始・終了時刻を実測する。所要は目標 10 分・上限 20 分＝__補完を含めた全体__の上限**（CSO裁定 2026-09-23 夜。**旧方式の 45 分規定はリスト方式の下では適用しない**。超える場合は未読を列挙して打ち切る）。 **走査時に `active-targets.mjs` の稼働一覧とリストのメンバーを突き合わせ、差があれば報告する（リストの編集は HUMAN・CTO の書き込み許可は §26-12 で消尽）。** **リストに出ない投稿があれば従来どおり報告。** 読み取り専用・絞り込み（手順 0 ①〜④）は不変 |
| 1（旧・**補完用に残す**） | **CTO**（CSO 指示 2026-09-19 08:2x で HUMAN → CTO へ改訂・FACT §26-10-1） | Chrome 抽出（**1 日 2 回＝朝 06:00・夜 22:30**（**CSO 決定 2026-09-21 で朝 08:00 → 06:00／CSO判定 2026-09-24 で夜 21 時前 → 22:30**。旧時刻は訂正として残す）・窓は**前回抽出以降**＝夜 22:30 → 翌朝 06:00・読み取り専用＝投稿・返信・フォロー・いいね・ブックマークをしない）→ `@ハンドル｜投稿日時｜投稿URL｜本文｜リンク先 content_id` を `runs/<日付>/input.txt` に置く（本文は台帳に貼らない）。重複はツール側が `target_post_url` で排除 |
| **1.5**（**朝 06:00 のみ**） | **CTO**（CSO裁定 2026-09-23・承認後〜配信前の再検査） | **`posts` の当日予約行を MCP で読み戻し**（`予約日時 = today`・`Asia/Tokyo`・フィールドは Name / 投稿文 / タイプ / ステータス / リンクURL / リンク種別 / 予約日時 / ポストID / エラー詳細）→ `node management/tools/x-post-refill/preflight-today.mjs --readback <readback.json> --date <YYYY-MM-DD> --json <out.json>`。**NG があれば提示の先頭に「🔴配信前NG」として出す**（レコード名・予約時刻・ガード ID・本文）。**是正は HUMAN。CTO は `posts` を書かない。Make シナリオ 5615632 は触らない。** 検査不能（`g9` / `g12` / `g19` / `g20` / `g21`）は毎回併記。**残差＝当日朝以降の書き換えは未検知**（FACT §13-5-2） |
| 2 | CTO | ツール実行（下の手順 2〜5）→ 案を提示。**停止判定に当たった行はその旨を表示**（同一投稿 1 回のみ／同日同ハンドル 1 件／再返信間隔＝女優本人 3 日・それ以外 1 日）。**提示時に「同一企画 3 日連続」を手で確認して注記する**（CSO裁定 2026-09-23・ツールの停止判定には入れない） |
| **2.5**（**記録の後**・CSO 指示 2026-09-24） | **CTO** | **フォロー営業の候補提示**: 当日リプした対象投稿の「いいね／返信」から**一般ユーザー 5〜10 件**を読み取り専用で拾い、`follow-candidates.mjs --candidates` で絞り込んで**ハンドル＋根拠**を提示（メーカー・女優・他アフィリエイター・自動投稿は除外し、除外件数のみ報告）。**HUMAN が 1 日 10 件までフォロー**（CTO はフォローしない）→ フォローした分を `--record` で `follows.json` に追記。**推定フォロー中が 300 に達したら停止して報告**（正は HUMAN の実測・FACT §26-13） |
| 3 | HUMAN | 案を選んで投稿 → リプ URL を Claude Code に貼る。**夜の投稿は 22:30〜23:00**（CSO判定 2026-09-24 の 4） |
| 4 | CTO | `record.mjs` の payload を Airtable MCP で書き込み → 読み戻しを報告（手順 7〜8） |

チャット側（戦略顧問）は日次ループから外れる。週次（木曜）で `x_replies` を読んで型を再判定。**B 型は知識ありモード（cache ヒット）でのみ生成**（知識なしでは A・C の 2 案）。

## 手順（1 回分）

作業ディレクトリはリポジトリルート。中間ファイルは `management/_metrics/<週>/bundle2/runs/<YYYYMMDD>/` に置く（実験資産は git 管理・§24-11-1）。

0. **対象リスト**（CTO）: `x_targets` を MCP で読み戻して `state/<日付>/targets.json` に保存 → `node management/tools/x-reply-drafts/active-targets.mjs state/<日付>/targets.json --urls` の一覧を Chrome 抽出の巡回先にする（`--json` で内訳）。手順 3 の `targets.json` にもこのファイルを使える。
   - **抽出段階の絞り込み（CSO判定 2026-09-20 朝）**: ①**女優本人・レビュー系**は「作品・発売・配信・セール・ランキング・作品イベント」に触れている投稿のみ該当。**私生活・配信お礼・出勤告知・雑談は抽出段階で除外し、除外した件数だけ報告する**（本文は台帳に貼らない）。②**動画フロア外（FANZAブックス・同人・ゲーム）の告知は除外。FANZA 外（MGS動画 等）のセール・作品も同じく除外**（CSO判定 2026-09-21 朝・9/21 朝の @DMM10sale「MGS動画 300 円」引用・@shirot_AV_chosa の mgstage.com リンクは除外）。 ③メーカー公式・セール告知系は従来どおり（告知は基本すべて該当）。④**【補足・CSO判定 2026-09-20 夜】「作品に触れる」は作品名・出演作・発売・配信・セール・作品イベントに限る。ファンからの贈り物・交流の投稿（例: 「データをいただいた」「メッセージが入っていた」）は含めない**（9/20 夜の @5may_itsukaichi・@shirot_AV_chosa は見送り）。**店舗イベント・来店告知で作品名が無いものも除外側で確定**（CSO判定 2026-09-21 夜・9/21 夜の @ran_tpowers）。⑤**本文が 1 文のみで作品名・配信日が無いメーカー公式の投稿（画像側に情報がある可能性が高い）は抽出してよいが、「続報待ち」型の案は出さない**（`PROMPT.md` 規則 12・CSO判定 2026-09-21 夜・9/21 夜の @sodstarofficial「年上お姉さんが…」で A/C とも続報待ち型になった）。
   - **案の提示形式（CSO判定 2026-09-21 夜）**: 各ブロックの 1 行目は__対象投稿 URL__に固定する（`print-drafts.mjs` が `=== 対象 <URL>（投稿日時）` を先頭に出す）。チャットの提示でも同じ順で書く。
   - **抽出はプロフィール直読み**（navigate → `find` timestamp → scroll → `find`・センシティブ警告は「プロフィールを表示する」を押す＝表示切替のみ）。**X の検索（`from:` OR・最新）はプロフィールに実在する投稿を返さないことがある**（2026-09-20 実測: FANZAdougaX 05:00 の 2 件が検索に出ない）ため使わない。窓の判定は snowflake ID（`(id >> 22) + 1288834974657` ms）。
   - **【content_id の解決・CSO判定 2026-09-24 の 3】リスト方式でも、メーカー公式の投稿内リンク（t.co）を辿って content_id を解決する。** 抽出時に投稿内の t.co URL を拾い `runs/<日付>/tco.tsv`（`@ハンドル <TAB> t.co URL`）に置く → `node management/tools/x-reply-drafts/resolve-cid.mjs --tco runs/<日付>/tco.tsv --fill runs/<日付>/input.txt --json runs/<日付>/resolve-cid.json`。**Q 候補判定はこの content_id を使う。**
     - **【厳守・最小アクセス】t.co へ 1 回だけ GET（`redirect: manual`）し、その Location から抜く。** **al.fanza.co.jp 以降へは到達しない**——`ip.affiliate.dmm.com` / `rcv.ixd.*` / `lp.ixd.*` は**アフィリエイトのクリック計測が走る**（2026-09-24 実測で `rcv.ixd.dmm.com/api/click` を確認）。**`video.dmm.co.jp` へは GET / HEAD を送らない**（FACT §5-2 のツール層遮断）。
     - **実測（2026-09-24 17:0x JST）**: `https://t.co/MnUBta5TNO` → 301 の Location `al.fanza.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3Dmdvr00441&af_id=WILLaffi-061…` → **content_id `mdvr00441`**。**FANZA の遷移先は `?id=` 形式**（旧 `cid=` ではない）。**floor は URL に出ない**ため `knowledge.mjs` の 3 フロア PK 照会で解決する（cache ヒット時に `floor_code`）。
     - 解決した content_id は `parse.mjs` が `kind: content_id` として読む（floor は null のまま）。**cache ヒットすれば知識ありモードになる**——9/24 朝に「cache MISS（知識なし）」と記録した `@MOODYZ_official` の投稿は、本手順で `mdvr00441` が解決でき cache ヒットした（videoa・収録 64 分・配信 2026-09-24）。
   - **【時間上限・CSO裁定 2026-09-23】夜の抽出は 45 分を上限とする。** 超える場合は **priority 1 → 2 → 3 の順**に読み、残りは**「未読・件数のみ」で報告**する（未読のハンドルを列挙し、読めなかったことを明記する。推測で「該当なし」と書かない）。
   - **【前回未読の最優先・CSO裁定 2026-09-23 朝 ⑤】前回の抽出で「未読」として残したアカウントを、次の走査の__先頭__に回す。** 2026-09-23 朝は 26 件中 13 件を処理して **13 件（すべて priority 1）が未読**のまま打ち切った。**未読のハンドル一覧は前回の run の README に残す**（`runs/<日付>/README.md`）。**以後も『前回未読』→ priority 1 → 2 → 3 の順で読む。**
   - **【停止確定アカウントの省略・CSO裁定 2026-09-23】停止判定に当たるアカウント（女優本人 3 日・その他 1 日・priority 3 の週 2 件上限）は、本文を取得せず URL と時刻のみ記録でよい。停止が確定しているアカウントはプロフィール読み取り自体を省いてよい。** 2026-09-22 夜の逸脱（停止 6 アカウント＋priority 3 の 2 件を本文未取得で記録）を運用として採用したもの。**省いた場合は「停止確定のため未読」と報告に明記する。**
   - **【連続返信の上限・CSO裁定 2026-09-23】同一企画への連続返信は 3 日連続まで。4 日目以降は別種の告知（新作・予約・イベント）が出るまで空ける。** **ツールの停止判定には入れない**（機械検査を追加しない）。**提示時に CTO が注記する**——直近 3 日の `x_replies` を見て、同じハンドルの同じ企画（同じキャンペーン名・同じシリーズ）へ 3 日続けて返していれば、その行に「同一企画 3 日連続・4 日目は別告知を待つ」と添える。
   - **【a11y ツリーに投稿が出ないときのフォールバック・CSO裁定 2026-09-23】** **2026-09-22 夜、`@PREMIUM_AV` はセンシティブ interstitial を通過しても `find` が投稿を 1 件も返さず、3 回の試行で URL・本文とも取得不能だった**（記録 → `runs/20260922-pm/README.md` §2-2）。**再現する場合は投稿ページの `<title>` からの取得にフォールバックする**——プロフィールで拾えた `status/<id>` があればその URL へ navigate し、`tabs_context_mcp` のタブタイトル（`<本文の冒頭>さん / X` 形式）で本文冒頭を得る。**それでも取れなければ「取得不能」と記録する**（「該当なし」と書かない）。
   - **【取得不能の扱い・CSO裁定 2026-09-23 朝 ⑥】間欠的な取得不能は__環境要因__として記録する（アカウント側の設定変更と決めつけない）。** **3 回試行して取れなければ、その回は「取得不能」と記録して__次回に持ち越す__**（同じ回で 4 回目以降を試さない）。**持ち越した対象は ⑤ の『前回未読』と同じ扱いで次の走査の先頭に回す。**
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

## 引用ポスト（基盤D・CSO 指示 2026-09-21 夜・2026-09-22 朝の抽出から提示）

- **位置づけ**: テスト枠を消費しない「基盤D」。1 日 1〜2 件。リプ営業と同じ台帳（`x_targets` / `x_replies`）を使う。**引用元＝メーカー公式・女優本人の「発売日・配信開始・予約開始」の投稿に限る**（セール・ランキング・イベントは引用しない）。**【CSO裁定 2026-09-22 朝】引用は「メーカー公式を主」とし、女優本人の投稿は引用よりリプを優先（両方候補のときはリプ）＝既定の `Q_quote.allowed_types` はメーカー公式のみ。Q は priority 3 の週 2 件カウントの対象外。ただし Q 全体で 1 日 2 件・works リンク投稿 1 日 3 件の上限は維持。初回の Q 記録（2026-09-22 09:21 `20260922-Q-honnaka_NN`）で `draft_used` の選択肢 Q（`sel1aoLdq9bvHguee`）が作成され `airtable-fields.json` に登録済み＝以後 typecast 不要。****直リンク投稿 1 日 1 件上限（af_id 006）とは別枠。ただし works ページへのリンク投稿は T1改（21:00・1 件）と合わせて 1 日 3 件まで＝引用は 1 日 2 件を上限に数える。**
- **文面の型**: 一言（40〜80 字・作品の属性＝「この作品は〇〇系」「収録〇〇分・配信〇月〇日」）＋ 改行 ＋ `https://app.vodnavi.jp/works/<floor>/<content_id>?utm_source=x&utm_medium=quote&utm_content=<ハンドル>`。誘導語は不可（R5）・女優本人の引用は「名前＋さん、」で始める（R17）・容姿・内容の露骨な言及は不可（R6・R7）。**直接アフィリエイト URL は使わない**（自サイトリンク＝#PR は現行設計どおり不要・法務観点の未決はそのまま）。**URL はモデルが書かずツールが付ける**（`PROMPT-Q.md`）。
- **手順（朝・夜のリプ生成の直後に同じ中間ファイルで）**:
  ```
  node --env-file=app-concierge/.env.local management/tools/x-reply-drafts/quote.mjs --parsed parsed.json --targets targets.json --replies replies.json --knowledge knowledge.json --out quotes.json
  ```
  1. 候補選定＝知識あり ∧ type ∈ {メーカー公式, 女優本人} ∧ 本文に発売/配信開始/予約開始の語 ∧ セール/ランキング/イベントの語なし（`guards.config.json` `Q_quote`・HUMAN 編集可）。
  2. 停止判定＝`no_repropose`／同日同ハンドルの引用 2 件目（`YYYYMMDD-Q-<handle>` が既存）／**同一投稿にリプ＋引用の両方はしない**（`target_post_url` が x_replies に既存＝リプ済みの投稿は引用しない・引用済みの投稿はリプしない。`generate.mjs` の停止判定も同じ URL 重複で止まる）。
  3. 提示上限＝`max_per_run`（2）− 本日記録済みの Q 件数。入力順に先頭から。上限外は「提示上限外」で API を呼ばない。
  4. **works ページの HTTP 200 を確認してから生成**（GET・リダイレクトは追わない・200 以外は「停止（works ページが HTTP …）」で提示しない。例＝2026-09-21 17:48 の dry-run で `mida00812`（配信 10/2）が 500＝上流 400・E6①）。
  5. 生成 Q1・Q2 → 一言のガード（type=Q）→ URL 付与 → 全文ガード（`guardQuoteFull`）。NG の型だけ最大 2 回再生成。
  6. **HUMAN**: 引用ボタン → 一言 → URL の順で投稿。投稿後「@ハンドル｜Q1/Q2（手直し有無）｜引用ポストURL｜本文」を貼る。
  7. 記録: `node management/tools/x-reply-drafts/record.mjs --create quotes.json --pick <handle>=Q1 [--texts posted.json] --replies replies.json --out payload_q.json` → `draft_used="Q"`・`reply_key=YYYYMMDD-Q-<handle>`・`reply_text`＝一言＋URL（手直し時も URL は 1 本そのまま）。**初回の Q 書き込みは `draft_used` に選択肢 Q が無いため MCP `create_records_for_table` を `typecast: true` で 1 回だけ実行**（MCP に選択肢追加ツールが無い・作成後 `get_table_schema` で選択肢 ID を読み戻し `airtable-fields.json` に記す）。以後は typecast なし。
  8. 投稿後: `node management/tools/x-reply-drafts/record.mjs --posted --quote --record <x_replies rec> --target <x_targets rec> --url https://x.com/vodnavi_jp/status/…` → `reply_post_id` / `posted_at` / **`x_targets.last_quote_at`**（`last_reply_at` は触らない）→ MCP × 2 → 読み戻し。
- **計測**: GA4 は `utm_medium=quote` のセッション（`node management/tools/x-reply-drafts/ga4-quote-sessions.mjs --since … --until … --out ga4_quote.json` → `weekly-report.mjs --ga4-quote ga4_quote.json`）。X Analytics では引用ポストは「自投稿」として集計（判定指標の中央値に含める・テキスト投稿の一種）＝`weekly-report.mjs --own-posts` は `draft_used=Q` の `reply_post_id` を自投稿から除外しない（A/B/C のリプ自身だけ除外）。
- dry-run（記録しない）: `--dry-run`（停止判定を無効化）／`--no-http`（HTTP 確認を省略・テスト用）／`--stub stub.json`（API を呼ばない）。`print` は `node -e` で `quotes.json` を読む（着地報告は `runs/<日付>/README.md`）。

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
- ~~priority 3（対照）の「提示は週 2 件まで」は CTO の手動カウント（実装不要・CSO 2026-09-19 22:5x）。~~ → **🔴【機械化・CSO 指摘 2026-09-23】手で数えるのをやめ、`priority3-week.mjs` で x_replies から数える。**
  ```
  node management/tools/x-reply-drafts/priority3-week.mjs --replies <replies.json> --targets <targets.json> [--today YYYY-MM-DD] [--json <out.json>]
  ```
  - **週は月〜日（JST）。基準日を含む週の月曜が起点**（`weekRangeMonday`）。**引用（`draft_used=Q` / `reply_key` に `-Q-`）はカウント対象外**（CSO裁定 2026-09-22 朝 ②）。**終了コード 0＝残枠あり / 1＝上限到達。**
  - **機械化した理由**: **2026-09-23 夜、CTO が週起点を 9/22（火）と誤認し「今週 0 / 2」と報告した。** **実際は 9/21 が月曜で、同日の 2 件（`20260921-S1_No1_Style` 08:03 ＋ `20260921-shinnakanodream` 22:28）により既に 2 / 2 に到達していた。** **手で数えるかぎり同じ誤りが再発する。**
  - 実測（2026-09-23 23:2x）: 今週 2026-09-21〜09-27 ＝ **2 / 2・残り 0**／先週 2026-09-14〜09-20 ＝ 1 / 2（`20260920-S1_No1_Style`・9/20 は日曜）。
- **引用ポスト（Q）の扱い**: `draft_used` 内訳に `Q` 列が出る。`--own-posts` の除外は A/B/C のリプ自身だけ（Q は自投稿に含める）。`--ga4-quote ga4_quote.json` で `utm_medium=quote` のセッション表を末尾に添付する（CSO 指示 2026-09-21 夜）。
- **自投稿との比較（CSO 連絡 2026-09-20・観測のみ）**: HUMAN が X Analytics（Premium）の投稿別 CSV を `state/<日付>/own_posts.csv` に置く → `--own-posts state/<日付>/own_posts.csv` で「リプの表示回数中央値」と「同期間の自投稿インプレッション中央値」を並べる比較表が末尾に出る。**判定基準（10/12・自投稿の中央値 ≥ 50・§26-2）は変えない。** 列名は tolerant に検出（id＝`Tweet id`/`Post id`・日時＝`time`/`Date`・インプレッション＝`impressions`/`Impressions`）し、使用した列名を出力に併記する。x_replies の `reply_post_id` と一致する行（リプ自身）は自投稿から除外。**TZ 表記の無い日時は JST として扱う＝初回の HUMAN 提供 CSV で列名と TZ を実測して確定する**（旧 Twitter Analytics 形式は `+0000`＝UTC 明記）。
- **【取得担当の改訂・CSO 指示 2026-09-23】自投稿の値は CTO が取得する。** **2026-09-23 06:00 の抽出時に、X Analytics の「投稿別」（対象期間 2026-09-18〜09-24）を読み取りのみで取得**し、`state/<日付>/own_posts.csv`（または同等の JSON）に保存して `--own-posts` に渡す。**CSV エクスポートが取れない場合は画面の投稿別表を読み取って同じ列（投稿 ID / 日時 / インプレッション）を書き起こす**——**書き起こした場合はその旨と取得時刻を記録し、「CSV」と書かない。** 読み取り専用（投稿・返信・設定変更をしない）は従来どおり。

- **【フォロワー数と指標開放の併記・CSO裁定 2026-09-23 朝 ⑦】木曜集計に次の 2 つを毎回併記する。**
  1. **X Analytics の概要タブに出る表示の有無**——原文「Detailed engagement metrics become available once you reach 50 followers.」（2026-09-23 06:5x 時点で表示あり）。**消えたら消えたと記録する**。
  2. **現在のフォロワー数**（取得時刻付き）。**2026-09-24 HUMAN 実測＝フォロワー 13 / フォロー中 156**（CSO 連絡）。**フォロー営業の起点でもある**（FACT §26-13-1・停止閾値 300 まで残り 144）。
     - **【改訂・CSO判定 2026-09-24 の 7】フォロワー数は HUMAN が報告する。CTO の取得は打ち切る。**（2026-09-24 の木曜 PDCA で、`x.com/vodnavi_jp` と `x.com/i/account_analytics` への navigate が「Navigation to this domain is not allowed」で拒否され、プロフィールリンクのクリック経由でも数値が a11y ツリーに出ず 4 回試行して取得不能だった。**旧記述は訂正として残す。**）
  - **【厳守】フォロワー数を判定指標にしない**。判定は **2026-10-12・直近 14 日のテキスト投稿インプレッション中央値 ≥ 50**（§26-2）のみ。併記は**「詳細指標が取れない理由」を後から読めるようにするため**である。
- **【自投稿の中央値・観測 2026-09-23 06:5x〜07:1x】2026-09-18〜09-22 の自投稿 7 件＝74 / 55 / 61 / 58 / 37 / 14 / 29、**中央値 55**（書き起こし・`runs/20260923-am/own_posts.json`）。**観測として記録するだけで、10/12 の判定を前倒ししない**（CSO裁定 2026-09-23 朝 ⑦）。**2W 表に 2026-09-20 の行が無い件は「未特定」**（同 ⑧。`W11-03` は X 直接 URL で 200＝配信されている）。

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
| **R13（投稿時刻）** | **相手の投稿時刻への言及は NG**（「22時に」「23時ちょうどの」「23時00分の」）。**`post.posted_at_jst` は文脈であって R14 の「具体」ではない**（CSO裁定 2026-09-23 朝 ④）。検査は `postedTimeHits`＝案の時刻が投稿時刻と一致（分を書かなければ時だけで一致）。**本文に同じ表記があるか、本文に同じ時刻が別表記（`9:59` / `9時59分`）で出ていれば免除**＝本文由来の時刻（締切）は従来どおり具体に使える。**CTO が input.txt に付ける注記（`［同一スレッドの詳細投稿 HH:MM］`）は `stripTimeAnnotation` で落とし、R14 の具体にも本免除にも使わない**（`［引用元 …］` は時刻で終わらないため残る）。`N時間`（収録時間）は拾わない | `guards.config.json` `R13_no_posted_time` |
| R14 | 具体性: 案に相手投稿本文の具体（数値の完全一致・語の含有）が 1 つ以上。**R14-A（CSO判定 2026-09-21 朝）: A 型の祝福（「おめでと」）は cache の配信日（`knowledge.date`）が投稿日から 3 日以内のときのみ許可。それ以外の A 型は祝福ではなく本文の具体 1 つへの一言**（`A_congrats_window_days`・`postedAtJst` を渡さない呼び出しでは検査しない）。**B 型は作品知識が無ければ NG・あれば cache 由来の事実を 1 つ含む・最大 2 つまで**（`B_max_knowledge_facts`・種別ごとに数える・配信日の表記ゆれは 1 つ・出演者名は数えない・優先 収録時間 > 配信日 > シリーズ > その他・CSO判定 2026-09-19 12:1x） | `guards.config.json` `R14_concreteness` |
| R15 | 告知の形式・並べ方・出し方への言及 | `guards.config.json` `R15_meta_mentions` |
| R16 | 日付の斜線表記（`09/18` `9/18`）＝「9月18日」に正規化する（CTO 追加） | `guards.config.json` `R16_date_format` |
| R17 | 女優本人向けの案は「<表示名>さん、」で始める（CSO判定 2026-09-19 12:1x の PROMPT 規則の機械検査・CTO 追加） | `guards.config.json` `R17_actress_greeting` |
| R18 | 語置換（ガードではない）: 「体験版」→「サンプル動画」を生成直後に自動置換し `drafts.json` の `replacements` に記録（CSO判定 2026-09-19 12:1x） | `guards.config.json` `R18_word_replacements` |
| R9 | 数値の出典（B・Q は全数値／全案は「数値＋円・%・割・OFF」）— 出典＝相手投稿本文＋作品知識 JSON | コード（旧 R10 を統合・裁定 D） |
| **Q 型**（引用ポストの一言・`quote.mjs` のみ） | R1〜R18 をそのまま適用したうえで: R8 は `R8_chars_Q`（40〜80）／本文の具体（R14）は不要／**cache 由来の事実 1〜3 個**（`Q_quote.max_knowledge_facts`・B の 2 とは別枠・dry-run 2026-09-21 で 2 だと埋め文が出た）／全数値に出典（R9）／女優本人は「<表示名>さん、」（R17）。**`guardQuoteFull`**＝全文（一言＋改行＋URL）に対し「自サイト works 詳細 URL 1 本だけを末尾に許す」R1 の例外（URL 以外に URL/@/vodnavi/# が無いこと・X 重みは URL を 23 として ≤280） | `guards.config.json` `R8_chars_Q` / `Q_quote` |
| R11 | 虚偽の体験主張 | `guards.config.json` `R11_false_experience` |

- モデルの自己申告は証拠にしない。**生成後に必ず純関数で再検査**する（設計書 §4）。
- `record.mjs` は payload の全文字列に `FORBIDDEN = /https?:|vodnavi|af_id|moterist-\d{3}/i` を再適用する（束1 `followers-update.mjs` と同一）。

## 既知の事実（実装時の実測 2026-09-18）

- 2026-09-18 の実績 6 件（`x_replies`）を設計時のガード（R8 min 80・R5 に「登録」単体）に通すと全件 R8・#2 R4・#5 R5 だった。**CSO裁定 2026-09-19 で較正**（R8 min 40／「登録」は誘導形のみ＋本文引用は免除／R4 維持）→ 較正後は **5/6 が全通過・#2 Fitch のみ R4**（投稿済み・実害なしとして記録のみ。以後タグ名を裸で書かない）。
- snowflake 復元は 6 件中 5 件が Airtable 記録値と秒単位で一致。Madonna（`2100938725194977383`）は BigInt 計算で `13:23:20.297Z`、記録値は `13:23:19`（1 秒差・記録側の丸め）。
- `buildCacheKey` の写しは `pxvr00483` / `snos00334`（videoa・hits 1・filtered=false）で本番の PK と一致。
- 相手投稿本文は Airtable に保存していない（`x_replies` には `target_post_url` のみ）。公開 oEmbed（`publish.x.com/oembed`）は当該投稿に 403 を返す（2026-09-18 23:24 JST 実測）＝本文は HUMAN が貼る。
