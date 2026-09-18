# 第127便 束2 設計起案 — リプ案生成ツール（基盤A の中核）

- **起案**: CTO・2026-09-18 23:1x〜23:4x JST。**実装は未着手。CSO 承認後に着手する**（第127便「read-only 調査 → 設計 → 実装」）。
- **前提**: FACT §26-5（作品知識ソース＝`fanza_response_cache` 主＋`sitemap_works_archive` 従）／§26-8（Grok 運用則・`status` は CTO が書かない）／§26-9（`x_targets` / `x_replies` の実体・フィールド ID＝`bundle1/x_targets_field_map.json`）／§13（Airtable は一層防御）／§13-0（資格情報の値に CTO は触れない）／CSO 連絡 2026-09-18 22:4x（入力形式の追加要件）。
- **5軸ラベル（本書の実測値）**: ①対象範囲＝vodnavi-production の 2 表・`x_replies` 6 行（9/18） ②期間＝2026-09-18 23:05〜23:07 JST ③計測系＝Supabase MCP（`--read-only`・`execute_sql`）・Airtable MCP ④出典＝自社実測 ⑤機会の数＝逆引き全走査 1 回・PK 照会 2 件。
- **【厳守】本書は設計であり、「設計上の既定値」と代替案・裁定事項を分けて書く。判断は CSO。**

## 0. 要約（CSO 判断用）

> **【2026-09-18 23:3x・裁定反映】本表の「設計上の既定値」は §10-1 の裁定で上書きされた箇所がある（A＝ローカル CLI・D＝価格言及可（出典必須）・G＝2 件目は停止・H＝検証行なし）。実装は §10-1 に従う。**

| 項目 | 設計上の既定値 | 代替 | 裁定 |
|---|---|---|---|
| 形態 | **Claude Code スキル**（セッション内で入力を貼る → 作品知識を Supabase MCP で引く → 3 案を生成 → 機械ガード → 出力＋記録 payload） | ローカル CLI（`.env.local` の `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` で生成）。**ただし Supabase の資格情報はローカルに無い（§12 実測・`SUPABASE_*` なし）ため作品知識は MCP で事前エクスポートした JSON を渡す形になる** | **A** |
| 入力 | **`@ハンドル｜投稿日時｜投稿URL｜本文｜作品コード（任意）` の複数行**（CSO 2026-09-18） | — | 確定 |
| 出力 | 1 行 → **A（共感・一言）/ B（作品知識の補足）/ C（質問で返す）各 80〜140 字**＋ガード結果＋`x_replies` 記録 payload（`reply_post_id` / `posted_at` 空） | — | 確定（第127便） |
| 作品知識の引き方 | **`content_id` → `buildCacheKey` を再現して PK 照会（実測 8〜11 ms）**。品番しか無い場合は `sitemap_works_archive` の後方一致で `content_id` を解決 → PK 照会。いずれも空なら**知識なしモード** | 全走査（`payload->…->>'content_id'`・**実測 22.16 秒/件**）＝運用速度に合わない | **B** |
| ガード | 純関数 `guardReply()`（node:test 付き）。URL / ドメイン / `@` / `af_id` / `moterist-` / `vodnavi` / `#` / 宣伝語 / 容姿・露骨語 / 敬称 / 字数 80〜140 / X 重み 280 / 数値の出典 | — | **C（NG 語の初期リスト）・D（価格・セール言及の可否）** |
| 記録 | CLI が **`x_replies` 1 行分の payload（フィールド ID キー）** と `x_targets.last_reply_at` の更新 payload を出力。**書き込みは Airtable MCP**（9/18 初日と同じ経路）。`reply_post_id` は HUMAN が貼るリプ URL から抽出し snowflake → `posted_at` | HUMAN が書き込み専用 PAT（`x_targets` / `x_replies` のみ）を `.env.local` に置き CLI が直接書く（**値の配置は HUMAN 枠**） | **E** |
| 置き場 | **`management/tools/x-reply-drafts/`**（git 管理・§24-11-1 / §26-3-1 ⑦）＋スキル定義 `SKILL.md` を同ディレクトリに置く | リポジトリ `.claude/skills/`（現状 `.claude/` は `settings.local.json` のみ・未追跡） | **F** |
| 触らないもの | `posts` テーブル／Make 5615632／`x_targets.status`／FANZA API の新規呼び出し／本番コード | — | 確定 |

## 1. 入力仕様（パーサ）

- **1 行＝1 対象投稿**。区切りは全角「｜」（U+FF5C）を第一候補、半角「|」を第二候補（同一行内で混在しない前提。混在は「解析不能」として行ごとに拒否し理由を出す）。
- **フィールド**: ①`@ハンドル`（`@` 省略可・大文字小文字は保持・`x_targets.handle` と突合）②投稿日時（`YYYY-MM-DD HH:mm` または `YYYY/MM/DD HH:mm`・JST として解釈。解釈不能なら空として続行・警告）③投稿 URL（`https://x.com/<handle>/status/<id>` または `twitter.com`。`<id>` を `target_post_id` として抽出。**ハンドルが①と不一致なら警告**）④本文（**区切り文字を含みうる**——③の次から末尾までを本文とし、末尾フィールドが作品コードの形（下記）に一致する場合のみそれを⑤として切り出す）⑤作品コード（任意）＝**品番**（`[A-Z]{2,6}-\d{3,4}`・大文字化）または **content_id**（`[a-z0-9_]+`・`/works/<floor>/<cid>` の URL も可）。
- **`x_targets` 突合**: ①が `handle` に一致する行から `type` / `genres` / `note` / `reply_restriction` / `no_repropose` / `last_reply_at` を引く（MCP `list_records_for_table`・`filters` に `handle =`）。**`no_repropose=true` または `reply_restriction=あり` の対象は生成せず「対象外」と出す**（「本日の対象」の定義と整合・§26-9）。**未登録ハンドルは「台帳未登録」と出して生成は続行**（登録は HUMAN）。

## 2. 作品知識の取得（Supabase・読み取りのみ）

| 段 | 内容 | 実測 |
|---|---|---|
| 2-1 | ⑤が content_id → **`buildCacheKey({site:"FANZA", service:"digital", floor:<floor>, cid, hits:1}, false)`** を再現（`src/lib/fanza/stale-cache.ts` L32-42 と同一のアルゴリズム・`api_id` / `affiliate_id` はキーに含まれない）→ `fanza_response_cache` を PK で照会 | **`pxvr00483` / `snos00334`＝各 8〜11 ms・2/2 ヒット**（2026-09-18 23:06 JST・works 詳細ページの `getWork` と同じ params） |
| 2-2 | ⑤が品番 → `fromHinban()`（`x-post-generator.mjs` L236）は数値プレフィックス（`1sdjs…` / `h_067…`）を品番から復元できないため、**`sitemap_works_archive` を `content_id like '%<suffix>'` で後方一致**（3,749 行）→ 候補が 1 件なら 2-1 へ。複数・0 件なら「解決不能」（HUMAN が content_id を貼る） | 未実測（実装時に件数と所要を記録） |
| 2-3 | floor は⑤の URL から取れれば採用、無ければ `videoa` → `nikkatsu` → `anime` の順に 2-1 を試す（各 1 回の PK 照会） | — |
| 2-4 | **全走査**（`payload->'result'->'items'->0->>'content_id' = $cid`）は**採らない** | **22.16 秒 / 1 件**（同日実測・hits 1） |
| 2-5 | 渡すフィールド＝`title` / `date` / `volume` / `iteminfo.actress[].name` / `genre[].name` / `maker` / `label` / `series` / `director` / `review.count`・`average`（保有率 18.6%）。**渡さない**＝`affiliateURL` / `URL` / `imageURL.*` / `sampleImageURL.*` / `sampleMovieURL.*` / `prices` / `campaign`（→ 裁定 D） | §26-5 |
| 2-6 | **知識なしモード**（⑤なし・キャッシュ MISS）: B 案は `x_targets.genres` / `type` / `note` の範囲で「メーカー／ジャンル傾向」の一言に落とす。**作品固有の事実（収録時間・出演者）は捏造しない**——**知識が無い項目は書かない** | — |

- **【厳守】`fanza_response_cache` は 7 日ローリング**（§26-5）。**T1改 で配信した作品（works 詳細が X 経由で踏まれる）は載っている可能性が高いが、それ以外は MISS が既定**。FANZA API の新規呼び出しは増やさない（第127便）。
- **【厳守】Supabase MCP は `--read-only`**。書き込み系は無い。

## 3. 生成仕様（A / B / C）

| 案 | 型 | 材料 | 禁止 |
|---|---|---|---|
| **A** | 共感・一言（1〜2 文） | 本文の話題（発売・先行配信・企画名・季節タグ）と `x_targets.note` の傾向 | 作品内容の描写・容姿 |
| **B** | 作品知識の補足（1〜2 文） | 2-5 の事実（収録時間・シリーズ・レーベル・監督・ジャンル・配信日・レビュー件数）。**事実のみ・評価語なし**（`g20` の T3 と同じ思想） | 知識なしモードでは作品固有の数値を出さない |
| **C** | 質問で返す（1 文＋任意の一言） | 本文中の未確定事項（弾の切替時期・特典・配信タイミング・レーベル） | 誘導（「教えてください→リンク」等） |

- **字数**: 各 **80〜140 字**（`Array.from(text).length`・改行は 1 字・末尾空白除去）。**X 重み（全角 2 / 半角 1）で 280 以内**も併検査（リプは URL を含まないため実質 140 字 ≒ 重み 280）。
- **敬称**: 出演者名（2-5 の `actress[].name`・`x_targets.display_name`）が本文に現れる場合は **「〜さん」** を必須（正規表現で検査）。
- **文体**: 既存の 9/18 実績 6 件（`x_replies`・A 2 / B 1 / C 3）と同じ丁寧体。生成プロンプトは `x-post-generator.mjs` のテンプレート思想（事実・時点注記・評価語なし）を継承し、**プロンプト全文を `PROMPT.md` に固定**（git 差分レビュー対象・§13 の緩和①と同型）。
- **再生成**: ガード NG の案は破棄し**最大 2 回**再生成。それでも NG なら「生成不能（理由）」を出し、HUMAN が手で書く。

## 4. ガード（純関数 `guardReply(text, ctx)`・node:test）

| # | 検査 | 初期値 |
|---|---|---|
| R1 | URL / ドメイン | `https?://` / `www\.` / `[a-z0-9-]+\.(com|jp|co\.jp|net|io|me)(/|$)` / `t\.co` → NG |
| R2 | メンション | `@` を含む → NG（リプ先は X が自動付与する） |
| R3 | 自社・af_id | `vodnavi` / `ボドナビ` / `af_id` / `moterist` / `moterist-\d{3}` → NG |
| R4 | ハッシュタグ | `#` → NG（§26-2「観測窓中に新ハッシュタグを追加しない」） |
| R5 | 宣伝語（初期リスト） | 「詳しくは」「こちら」「チェック」「ぜひ」「是非」「おすすめ」「購入」「買って」「お得」「クーポン」「割引」「登録」「無料」「リンク」「プロフ」「DM」「フォロー」「限定」→ NG。**リストは `guards.config.json` に外出しし、CSO が増減する**（→ 裁定 C） |
| R6 | 容姿・露骨（初期リスト） | 容姿語（「美人」「かわいい」「スタイル」「胸」「体」「顔」等）と露骨語（既存 `T3_BANNED_WORDS` の思想を流用し初期 20 語程度）→ NG。**初期リストは実装時に提示し CSO 承認後に固定**（→ 裁定 C） |
| R7 | 敬称 | 出演者名 → 「名＋さん」でなければ NG |
| R8 | 字数 | 80〜140 字・重み 280 以内 |
| R9 | 数値の出典 | B 案に含まれる数値（分・件・年月日）が 2-5 の材料に**存在しない**場合 → NG（捏造防止）。価格・割引率は R10 |
| R10 | 価格・セール | **既定＝言及禁止**（「円」「%」「OFF」「セール」→ NG）。理由＝時点注記が要り 140 字に収まりにくい・§5-4(7)。**解禁するかは裁定 D** |

- **出力後の再検査**（第127便「正規表現で URL/@/af_id を再検査」）は R1〜R3 を生成モデルの外側（純関数）で必ず通す。**モデルの自己申告は証拠にしない**（§10）。

## 5. `x_replies` への記録導線

- CLI 出力（案ごと）に **記録 payload** を添える: `reply_key`（`YYYYMMDD-<handle>`・**同日同ハンドル 2 件目は `-2`** → 裁定 G）/ `target`（`x_targets` の recordId）/ `target_post_url`（③）/ `reply_text`（採用案）/ `draft_used`（A/B/C）。**`reply_post_id` / `posted_at` は空**。
- HUMAN が投稿後に**リプ URL を貼る** → `/status/(\d+)` で `reply_post_id` を抽出 → **snowflake → `posted_at`**（`(id >> 22) + 1288834974657` ms・9/18 の 6 件は CSO 側でこの方式で復元済み）。
- **書き込み**: 既定＝**Airtable MCP**（`create_records_for_table` × 1 ＋ `update_records_for_table` × 1 で `x_targets.last_reply_at`）。**§10 の読み戻し**（`reply_key` で `list_records_for_table`）まで含める。**`AIRTABLE_*` PAT は未発行（HUMAN 枠・§13-0）のため、ローカル CLI から Airtable へは書けない。** 代替（裁定 E）＝HUMAN が `x_targets` / `x_replies` の 2 表に限定した書き込み PAT を発行し `.env.local` に置く（CTO は値に触れない）。**§13 の限界（テーブル単位の限定であって値の限定ではない）はそのまま。**
- **dedupe**: 同じ `target_post_url` が既に `x_replies` にあれば「記録済み」として二重登録を拒否（CSO 2026-09-18「`target_post_url` をキー」）。

## 6. 置き場とファイル構成（裁定 F・§26-3-1 ⑦「`management/` 配下の慣行」）

```
management/tools/x-reply-drafts/
  SKILL.md              … Claude Code スキル定義（手順・MCP 呼び出し・出力書式）
  PROMPT.md             … 生成プロンプト（固定・差分レビュー対象）
  parse.mjs             … 入力 1 行形式のパーサ（純関数）
  guards.mjs            … guardReply()（純関数）
  guards.config.json    … R5/R6 の語リスト（CSO が編集）
  knowledge.mjs         … buildCacheKey 再現・SQL 文字列の生成（実行は MCP）
  record.mjs            … x_replies / x_targets の payload 生成・snowflake 復元
  *.test.mjs            … node:test（parse / guards / record）
```

- **本番コード（`app-concierge/src`）には触れない。** `buildCacheKey` は**同一アルゴリズムを `knowledge.mjs` に写す**（`src/lib/fanza/stale-cache.ts` を import すると `app-concierge` の依存に引きずられるため）。**写しは 2 件で PK 一致を確認済み**（§2-1）。
- **実行**: セッション内で `node management/tools/x-reply-drafts/parse.mjs < input.txt` → MCP で `x_targets` 突合・Supabase 照会 → 生成（セッションのモデル）→ `node guards.mjs` → 出力。**HUMAN が扱うのは「行を貼る」「案を選ぶ」「投稿後にリプ URL を貼る」の 3 操作。**

## 7. 実装しないこと・変えないこと

- `posts`（`tblZMqvjtJY8MfaWZ`）・Make 5615632・`x_targets.status`（HUMAN 専権・§26-8）・FANZA API の新規呼び出し・本番コード。
- 引用ポスト・フォロー営業の支援（第127便 束1 D／本束の範囲外）。
- 生成結果の**自動投稿**（投稿は HUMAN）。

## 8. 検証計画（実装後・push 前）

1. `node --test management/tools/x-reply-drafts/*.test.mjs`（parse: 全角/半角区切り・本文中の区切り文字・作品コード 3 形式・不正 URL／guards: R1〜R10 の陽性・陰性各 1 件以上／record: snowflake 復元＝9/18 の 6 件で `posted_at` 一致）。
2. **9/18 の実績 6 件の対象投稿を入力に再生成**し、ガード全通過と「6 件の `reply_text` がガードを通過すること」（既存実績が新ガードで NG にならないことの回帰確認）。
3. 記録 payload を MCP で 1 件書き込み → 読み戻し → **テスト行は削除せず `note` に「検証行」と明記**（削除は履歴保全と同型で行わない・裁定 H）。

## 9. 見積（§11-1 の形式・診断分岐を別項に置く）

| 工程 | 見積 |
|---|---|
| parse / guards / record ＋ tests | 約 60〜90 分 |
| PROMPT.md ＋ SKILL.md | 約 30 分 |
| knowledge.mjs（キー再現・SQL 生成）＋ MCP 経路の実走 | 約 30 分 |
| 9/18 実績 6 件での回帰確認 | 約 20 分 |
| **診断が必要になった場合の分岐** | 項目として存在を明示（時間は置かない・§11-1-1） |

## 10. 裁定事項（CTO は決めない）

| # | 事項 | 既定値 | 代替 |
|---|---|---|---|
| **A** | 形態 | Claude Code スキル（セッション内・MCP） | ローカル CLI＋API キー（作品知識は MCP でエクスポートした JSON を渡す） |
| **B** | 作品知識の引き方 | `buildCacheKey` 再現 → PK 照会（8〜11 ms）／品番は `sitemap_works_archive` 後方一致 | 全走査（22 秒/件・不採用理由を記録） |
| **C** | R5（宣伝語）・R6（容姿・露骨）の初期リスト | 実装時に提示 → CSO 承認 → `guards.config.json` に固定 | — |
| **D** | 価格・セールへの言及 | **禁止**（R10） | 解禁する場合は時点注記の書式（例「9/18 時点」）を 140 字内で強制 |
| **E** | 書き込み経路 | Airtable MCP（9/18 と同じ） | 2 表限定の書き込み PAT を HUMAN が発行・配置 |
| **F** | 置き場 | `management/tools/x-reply-drafts/` | `.claude/skills/`（未追跡ディレクトリ） |
| **G** | `reply_key` の衝突 | `YYYYMMDD-<handle>-2` | `target_post_id` を含める（`YYYYMMDD-<handle>-<post_id 下 6 桁>`） |
| **H** | 検証行の扱い | 削除せず `note` に明記 | 検証後に削除（履歴保全との整合を要確認） |

## 10-1. 【CSO裁定 2026-09-18 23:3x】§10 A〜H の裁定反映（本節が §0・§10 の既定値を上書きする）

| # | 裁定 | 設計への反映 |
|---|---|---|
| **A** | **ローカル CLI（node）。Claude Code から呼ぶ。スキル化は不要**——純関数＋node:test の構成が活き、将来の承認ボタン式（Make 連携）にもそのまま流用できるため | §0 の既定値を差し替え。生成は CLI が `.env.local` の `ANTHROPIC_API_KEY` で Anthropic Messages API を呼ぶ（`fetch`・SDK 依存なし・**キーの値は CLI が env から読むだけで出力・ログに載せない**）。作品知識・`x_targets` は Claude Code が MCP で取得して JSON で CLI に渡す（Supabase 資格情報はローカルに無い・§12） |
| **B** | 設計どおり採用。`buildCacheKey` 再現の PK 照会／品番のみは `sitemap_works_archive` 後方一致／MISS は知識なしモード。**全走査は禁止のまま** | §2 のまま |
| **C** | 設計案を採用。**加えて「買いました／観ました／購入済み」など事実でない主張を表す語を R に追加**（R11）。**リストは `management/tools/x-reply-drafts/` 配下のファイルに置き、HUMAN が追記できる形にする（コード内定数にしない）** | `guards.config.json` に R5（宣伝語）/ R6（容姿・露骨）/ **R11（虚偽の体験主張）** を外出し。コードは読むだけ |
| **D** | **価格・セール言及は可。ただし相手投稿本文または cache の payload に出典がある数値のみ**（R9「数値の出典」で担保）。**価格そのものを述べるより「期間・対象を問う」C 型を優先する旨をプロンプトに明記** | R10 を「禁止」から「**出典検査（R9）に統合**」へ変更。R9 の照合元に相手投稿本文を加える。`PROMPT.md` に C 型優先を明記 |
| **E** | **Airtable PAT は新規発行しない（秘密を増やさない）。ツールは payload JSON を出力し、Claude Code の Airtable MCP で書き込む。書き込み前に payload の URL/@/af_id/vodnavi 混入 0 を機械検査（束1 と同じ）** | `record.mjs` が payload を出力する前に R1〜R3 を payload 全フィールドに再適用（`FORBIDDEN` regex は束1 `followers-update.mjs` と同一） |
| **F** | **`management/tools/x-reply-drafts/` で承認** | §6 のまま |
| **G** | **同日同ハンドルの 2 件目は生成を停止して報告。3 日以内再返信禁止の検知として使う。suffix による回避はしない** | `reply_key` は `YYYYMMDD-<handle>` 固定。`x_targets.last_reply_at` が 3 日以内、または同日の `reply_key` が既存なら「停止（理由）」を出力し生成しない |
| **H** | **node:test は dry-run のみ。Airtable の本番テーブルに検証行を作らない。書き込み経路の疎通確認は既存の `20260918-*` 6 行の読み戻しで代替** | §8-3 を削除。回帰確認は 9/18 の 6 件の読み戻し（read-only）で行う |

- **実装着手＝承認（2026-09-18 23:3x）。着地目標 2026-09-21（月）。** 着地報告には **9/18 の Chrome 抽出 6 件を入力にした dry-run 出力（18 案）** を添付する（CSO が手動下書きと突き合わせて型の妥当性を判定）。
- **運用（束2 着地まで）**: `posted_at` / `reply_post_id` はチャット側が Airtable MCP で書く運用を継続。
- **§11 の「TASK_BOARD 追記は未着地」はクローズ**——CSO 訂正（2026-09-18 23:3x）: 22:4x 連絡は「追記済みの報告」ではなく「CTO への追記指示」だった。`27c5c8a` の転記で目的は充足。**指示の読み違い・実害なし。**

## 11. 併記（事実）

- **9/18 の 6 件は本ツールを使わずに作成・記録された**（チャット側 Claude・CTO が読み戻し済み）。本ツールはその手順を**置換**するものであり、拡張ではない（§26-1 裁定 6）。
- **`reply_count_30d` は `NOW()` 依存の formula＋rollup**（§26-9）であり、本ツールは触らない。
- **CSO 連絡の「TASK_BOARD に 1 行追記」は本リポジトリに未着地**（TASK_BOARD 2026-09-18 23:0x の項）。

## 12. 実装記録（2026-09-18 23:2x〜23:5x JST・CTO）— 設計からの差分と実測

- **成果物**: `management/tools/x-reply-drafts/`（`README.md` / `PROMPT.md` / `parse.mjs` / `guards.mjs` / `guards.config.json` / `knowledge.mjs` / `generate.mjs` / `record.mjs` / `airtable-fields.json` / `*.test.mjs` × 5）。**`node --test` 39 件 全通過**（API・Airtable・Supabase に触れない・裁定 H）。本番コード・`posts`・Make・`x_targets.status` には触れていない。
- **生成 API（裁定 A の実装）**: Anthropic Messages API を `fetch` で直接呼ぶ（SDK 依存なし）。`model=claude-opus-5`・`thinking: adaptive`・`output_config.format=json_schema`（A/B/C の 3 キー）・system プロンプトに `cache_control`・`max_tokens 4096`（非ストリーミング）・429/5xx は 2 回まで再試行・タイムアウト 120 秒。**キーは `process.env.ANTHROPIC_API_KEY` を読むだけで出力・ログ・payload に載せない。**

| # | 設計 | 実装（差分） | 理由 |
|---|---|---|---|
| 1 | §2-2 品番は `sitemap_works_archive` を**後方一致** | **含有一致**（`like '%sone00682%'`） | 後方一致だと `1vspds00345ai` 型（末尾付き id）を取りこぼす。複数ヒットは「解決不能」で HUMAN へ |
| 2 | §3 字数 80〜140 | 既定値は同じ。**`guards.config.json` の `R8_chars` に外出し** | 9/18 実績 6 件が全件下限未満（→ §12-1）。変更は CSO（コードを触らずに済む） |
| 3 | §4 R9「B 案に含まれる数値」＋裁定 D（R10 統合） | **B＝全数値／A・C＝「数値＋円・%・割・OFF」のみ**を出典検査 | A/C の「第2弾」「10時」のような本文由来でない推量数値まで止めると C 型の質問が書けない。価格・割引は全案で出典必須（裁定 D） |
| 4 | §2-5 `prices` / `campaign` は渡さない（→ 裁定 D） | 裁定 D に従い **`price` / `list_price` / `campaign[]` を `fetched_at` 付きで渡す** | 出典のある数値のみ言及可・時点注記が要るため取得時刻を同梱 |
| 5 | — | **`--dry-run`**（停止判定を無効化して生成のみ・`record.mjs` は拒否） | 着地報告用に 9/18 の 6 件（既に記録済み・同日 2 件目に当たる）を再生成するため |
| 6 | §1 | `#` で始まる行はコメントとして読み飛ばす | HUMAN の入力ファイルに注記を書けるように |
| 7 | §3 敬称 | R7 の対象名＝作品知識の `actress[]` ＋ 女優本人の `display_name`。**本文中のハッシュタグ名（`#東條なつ` 等）は対象外** | ハッシュタグには `#本中` `#PR` のような非人名が混じる。プロンプト側（規則 6）で「さん」を要求 |

### 12-1. 実測（回帰・疎通）

- **9/18 実績 6 件を現行ガードに通した結果**: **全件 R8（字数 52 / 53 / 62 / 50 / 55 / 47・下限 80 未満）**。加えて #2 Fitch＝**R4**（`#肉欲の秋`）、#5 Madonna＝**R5**（「お気に入り登録」の「登録」）。**ガードは緩めていない。** 字数下限（`R8_chars.min`）と「登録」「#」の扱いは CSO 裁定（`guards.config.json` で変更可）。
- **snowflake 復元**: 6 件中 5 件が Airtable の `posted_at` と秒単位で一致。Madonna（`2100938725194977383`）のみ BigInt 計算 `13:23:20.297Z` に対し記録値 `13:23:19`（1 秒差・記録側の丸め違い）。
- **`buildCacheKey` の写し**: `pxvr00483` / `snos00334`（videoa・hits 1・filtered=false）で本番 PK と一致。**Supabase MCP（read-only）で `knowledge.mjs --sql` の SQL をそのまま実行 → 1 件ヒット（`fetched_at` 2026-09-18 14:27:49 UTC）→ `--extract` で URL / af_id / 画像系が落ち、許可フィールド（title / date / volume / actress / genre / maker / label / series / director / review / price / list_price / campaign / fetched_at）だけになることを確認**（`runs/20260918-dryrun/knowledge-check/`）。
- **品番 → content_id（`sitemap_works_archive`・3,749 行）の含有一致**: `SNOS-334` → 1 件 / **`SONE-682` → 0 件 / `PXVR-483` → 0 件**（archive は main sitemap の窓を通過した works のみ・§18）。**品番だけの入力は解決できないことが多い＝content_id か works URL を貼るのが確実。**
- **停止判定（裁定 G）**: stub 実行で `--today 2026-09-18` ＋ `replies.json`（9/18 の 6 行）→ **6 件とも「停止（同日同ハンドル 2 件目）」・API 呼び出し 0**。
- **API エラー経路**: 無効キーで `API 401 authentication_error: invalid x-api-key`（キー値は出力に載らない）。

### 12-2. 【停止して報告】dry-run（18 案）は未実行 — `ANTHROPIC_API_KEY` の値が空

- `app-concierge/.env.local` の `ANTHROPIC_API_KEY` は**キー名のみで値が `""`**（実測 2026-09-18 23:46 JST・`node --env-file` で `process.env.ANTHROPIC_API_KEY` が空）。§11 の併記「キー名は存在する」は正しかったが、**値の有無は見ていなかった**。
- 資格情報の値の取得・配置は CTO の禁止事項（FACT §13-0 / §27-4）。**HUMAN が値を置いた後、`runs/20260918-dryrun/README.md` の 1 コマンドで 6 件（最大 18 回の API 呼び出し）を生成する。** 入力・台帳読み戻し・停止判定・知識経路はすべて用意済み。
- **`OPENAI_API_KEY`（値あり・166 文字）への切替は行わない**（裁定 A は Anthropic API・CTO は資格情報の選択を決めない）。

### 12-3. 見積と実測（§11-1 の形式）

| 工程 | 見積（§9） | 実測 |
|---|---|---|
| parse / guards / record ＋ tests | 60〜90 分 | **約 25 分**（23:22〜23:47・テストの期待値誤り 2 件の修正を含む） |
| PROMPT.md ＋ README | 30 分 | 約 8 分 |
| knowledge.mjs ＋ MCP 経路の実走 | 30 分 | 約 10 分 |
| 9/18 実績 6 件での回帰確認 | 20 分 | テストに同梱（`guards.test.mjs`） |
| **診断分岐（発生した）** | 項目のみ | **約 10 分**——①Bash ツール経由の heredoc / インライン python が `\u` と `\\` を書き換える（ソースは Write ツールで書く）②`process.exit()` が Windows で libuv assertion（`exitCode` へ）③9/18 本文の取得（oEmbed 403 → Chrome の `<title>` 読み取り） |
