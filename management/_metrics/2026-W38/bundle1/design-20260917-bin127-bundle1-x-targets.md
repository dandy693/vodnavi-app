# 第127便 束1 — `x_targets` / `x_replies` の設計報告（**実装前・CSO 承認待ち**）

- **作成**: 2026-09-17 00:2x〜00:4x JST（CTO）／**根拠**: 第127便 §2（束1）・第128便 §1 ⑥（束別の範囲差・束1 は posts に触れない）・§6 末尾（設計着手可・実装前に設計を報告）・**CSO 指示 2026-09-17（Grok 候補の初期投入・運用則）**
- **許可範囲（第127便 束1）**: Airtable base `app0VKGU2B16qny6c` に **2 テーブル新設のみ**。**既存 `posts`（`tblZMqvjtJY8MfaWZ`）は触らない。** 初期データ投入は HUMAN（CTO は X 閲覧をしない）。
- **【厳守】本書は設計であり、実装（テーブル作成・レコード投入）は行っていない。** 実測（2026-09-17 00:18 JST・`list_tables_for_base`）＝base のテーブルは `posts` / `internal_link_proposals` の 2 つのみで、`x_targets` / `x_replies` は未存在。
- **【厳守】選択肢名は本書で定義し、作成後に `get_table_schema` で実在を確認してから投入する**（§4「選択肢値はスキーマ実測値のみ」）。

## 1. `x_targets`（対象アカウント台帳）

| # | フィールド | 型（Airtable） | 選択肢・制約 | 出典 | 備考 |
|---|---|---|---|---|---|
| 1 | **`handle`** | singleLineText（**主キー**） | `@` 付き・`^@[A-Za-z0-9_]{1,15}$` | 便 | 一意。取り込みスクリプトが形式と重複を検査 |
| 2 | `display_name` | singleLineText | — | 便 | 表示名（メーカー名・女優名） |
| 3 | `type` | singleSelect | **`女優本人` / `メーカー公式` / `レビュー系` / `セール告知系` / `その他`** | 便 | 5 値・便の原文どおり |
| 4 | `followers` | number（整数） | — | 便 | **HUMAN 実査値のみ**。Grok 目安は `note` に置き、ここには入れない（CSO 2026-09-17） |
| 5 | `genres` | multipleSelects | **17 値**（§1-1） | 便 | 「既存ジャンル語彙に合わせる」＝FANZA API の `iteminfo.genre.name` の実在値から選定 |
| 6 | `priority` | number（整数 1〜3） | 1〜3 | 便 | **数値**（「本日の対象」ビューの昇順ソート用）。**「保留」は表現できない → §4 ①** |
| 7 | `status` | singleSelect | **`候補` / `稼働` / `除外`** | 便 | 3 値・便の原文どおり。**`稼働` にできるのは HUMAN の実査後のみ**（CSO 運用則 2026-09-17） |
| 8 | `last_reply_at` | dateTime | — | 便 | `x_replies` から手動 or CLI で更新 |
| 9 | `last_quote_at` | dateTime | — | 便 | 引用ポストの実績 |
| 10 | `reply_count_30d` | rollup（`x_replies` → `posted_at`・**条件付き**「`posted_at` is within the past 30 days」・`COUNTA(values)`） | — | 便 | **Airtable の条件付きロールアップ**で実装。条件が UI で設定できない場合は §4 ④ |
| 11 | `note` | multilineText | — | 便 | Grok 目安・根拠（メーカー公式からのメンション）・cache 上位ジャンル・保留理由 |
| 12 | **`source`**（追加提案） | singleSelect | **`Grok調査` / `HUMAN実査` / `CSO指定`** | **CTO 追加** | CSO 運用則「Grok の出力は候補扱い」の出所を列で持つ。**不要なら削除可** |
| 13 | **`verified_at`**（追加提案） | dateTime | — | **CTO 追加** | HUMAN 実査日（実在／フォロワー数／直近 7 日の投稿／返信制限） |
| 14 | **`reply_restricted`**（追加提案） | checkbox | — | **CTO 追加** | 実査項目「返信制限」の記録。ON なら「本日の対象」から除外 |
| 15 | `x_replies` | link（`x_replies` 側のリンクの逆） | — | 便 | 自動生成 |

### 1-1. `genres` の選択肢（17 値・**すべて FANZA API `iteminfo.genre.name` の実在値**）

`熟女` / `人妻・主婦` / `美少女` / `企画` / `巨乳` / `スレンダー` / `お姉さん` / `痴女` / `淫乱・ハード系` / `寝取り・寝取られ・NTR` / `辱め` / `ドラマ` / `OL` / `素人` / `女子校生` / `ギャル` / `VR専用`

- 出典＝`fanza_response_cache`（2026-09-17 00:2x 断面・`kind=cid`・items あり）のジャンル出現数上位（`ハイビジョン` 39,158 / `単体作品` 27,801 / `独占配信` 20,552 …）から、**属性系**のみを選び、**形式系**（ハイビジョン・4K・VR 各種・ベスト・4時間以上）と**行為系**（中出し・フェラ・騎乗位・潮吹き…）を除外した。**`VR専用` のみ形式系だが、対象選定に効くため残した。**
- **【併記】これは束2「知識なしモード」の方向づけ用であり、厳密な分類ではない**（CSO 2026-09-17「厳密性は不要」）。

### 1-2. ビュー「本日の対象」

- フィルタ: `status = 稼働` **AND** `reply_restricted` が OFF **AND**（`last_reply_at` が空 **OR** `last_reply_at` が 3 日以上前）
- ソート: `priority` 昇順 → `last_reply_at` 昇順（古い順）
- **【併記】`last_reply_at` の更新が漏れると同じ対象が連日出る。** `x_replies` 追記時に CLI が親の `last_reply_at` を書く（束2 の実績記録導線で実装）。

## 2. `x_replies`（リプ実績ログ）

| # | フィールド | 型 | 選択肢・制約 | 出典 | 備考 |
|---|---|---|---|---|---|
| 1 | **`reply_key`** | singleLineText（**主キー**） | `<handle>_<posted_at ISO>` | **CTO 追加** | Airtable は主キー必須のため。CLI が生成 |
| 2 | `target` | link → `x_targets` | 1 件 | 便 | |
| 3 | `posted_at` | dateTime | — | 便 | **UTC 格納・`Z` 終端を検査**（§13 の予約日時と同じ罠） |
| 4 | `draft_used` | singleSelect | **`A` / `B` / `C`** | 便 | A=共感・一言 / B=作品知識の補足 / C=質問で返す（束2） |
| 5 | `reply_text` | multilineText | — | 便 | **投稿した最終稿**（束2 ガード: URL・ドメイン・af_id・vodnavi を含まない） |
| 6 | `got_like` | checkbox | — | 便 | |
| 7 | `got_reply` | checkbox | — | 便 | |
| 8 | `profile_click_delta` | number | 任意 | 便 | |
| 9 | **`reply_post_id`**（追加提案） | singleLineText | — | **CTO 追加** | 自分のリプの投稿 ID。**§13-5 の直接 URL 確認**を可能にする |
| 10 | **`target_post_url`**（追加提案） | url | 相手の投稿 URL | **CTO 追加** | 実績の突合用。**相手の URL であり自サイト URL ではない**（束2 ガードの対象外） |

## 3. 取り込み手順（**テーブル作成の承認後に実行・本書時点では未実行**）

| 段 | 内容 | 実施者 |
|---|---|---|
| 0 | 本設計の承認（追加提案 §1 #12〜14・§2 #1,9,10 の採否・§4 の裁定） | CSO |
| 1 | `x_targets` → `x_replies` の順に作成（MCP `create_table`・選択肢は本書の値で作成） | CTO |
| 2 | `get_table_schema` で **選択肢名の実在を読み戻し**（§4） | CTO |
| 3 | `node management/_metrics/2026-W38/bundle1/seed-to-records.mjs` → `x_targets_seed_20260917.batches.json`（**42 件・10 件×5 バッチ・status は全件 `候補` 固定・followers は空**） | CTO（読み取りのみ） |
| 4 | MCP `create_records_for_table` を 5 回 | CTO |
| 5 | `list_records_for_table` で **42 件を読み戻し**（handle 一致・status=候補・priority 分布 24/13/4/空 1） | CTO |
| 6 | HUMAN が X 画面で実査（実在／フォロワー数／直近 7 日の投稿／返信制限）→ `followers` を入力・`verified_at`・`reply_restricted` を記録 → **`status=稼働`** | HUMAN |

- **【厳守】status を書く箇所はスクリプト内の 1 箇所（`STATUS = "候補"`）に限定**（§13 の緩和①と同型）。
- **【厳守】seed に URL・`vodnavi`・`af_id`・`moterist-NNN` が含まれないことをスクリプトが検査する**（束2 ガードの前倒し適用）。実行結果＝違反 0。

## 4. 【停止して報告】台帳・便との不一致の候補（解消は CSO）

| # | 事項 | 内容 | 扱いの選択肢（**推奨は書かない**） |
|---|---|---|---|
| ① | **`@otona_rank_info` の priority「保留」** | 便の `priority` は 1〜3。「保留」は表現できない | (a) `priority` 空・`status=候補`・`note` に保留理由（**seed の現状**）／(b) `status` に `保留` を追加（4 値目）／(c) 投入しない |
| ② | フォロワー目安 1万〜20万（便 束1）と候補の乖離 | 20万超が 8 件（p1 の `@Aizawa_miyu03` 20.1万・`@nao_satsuki` 23.5万 を含む）・1万未満が 3 件（レビュー系 p1） | **CSO 指定のため矛盾ではない**（「目安」）。記録のみ |
| ③ | 初期件数 30 件（便）→ 42 件（CSO 2026-09-17） | 便の「初期30件を登録」を上回る | CSO 指定のため矛盾ではない。記録のみ |
| ④ | `reply_count_30d` の条件付きロールアップ | Airtable の UI では設定可能だが、**MCP `create_field` で条件付きロールアップを作れるかは未確認** | 作成時に確認。不可なら (a) HUMAN が UI で作る／(b) 単純ロールアップ（全期間 COUNT）＋ビューで代替 |
| ⑤ | `genres` の CSO 例示と cache 上位の差 | 本中・PREMIUM＝CSO「企画」だが cache 上位は 美少女／お姉さん | **CSO 例示を採用**し、cache 上位を `note` に併記。「厳密性不要」の指示どおり |

## 5. 投入候補の内訳（seed 実測・`seed-to-records.mjs` の出力）

| 区分 | 件数 | priority 1 / 2 / 3 / 空 |
|---|---|---|
| セール告知系 | 3 | 2 / 1 / 0 / 0 |
| レビュー系 | 4 | 3 / 0 / 0 / **1（保留）** |
| メーカー公式 | 15 | 11 / 2 / 2 / 0 |
| 女優本人 | 20 | 8 / 10 / 2 / 0 |
| **計** | **42** | **24 / 13 / 4 / 1** |

- **不採用 13 件**（理由付きで `x_targets_seed_20260917.json` の `meta.excluded` に記録・台帳 FACT §26-9 にも転記）: ゲーム／同人／電子書籍の公式 3 件（フロア不一致）・同人作家 10 件（読者層が同人購入者で単品動画に転換しない）。
- **`genres` に使った値（12 種）**: OL / お姉さん / スレンダー / ドラマ / 人妻・主婦 / 企画 / 寝取り・寝取られ・NTR / 巨乳 / 熟女 / 痴女 / 美少女 / 辱め。
- **cache 由来の併記（事実）**: 女優 20 名のうち 19 名は `fanza_response_cache`（7 日窓）に作品があり、`@umi_sea_0v0`（八掛うみ）のみ 0 件。メーカーではプレステージ・SODSTAR が 0 件（maker 名一致なし）。

## 6. 関連する事実（束2 への申し送り・判断ではない）

- 候補の女優のうち **篠原いよ（W10-03・9/14）・彩月七緒（W10-05・9/16）・逢沢みゆ（W9-06・9/3 / 動画 3 本目 9/9）・美園和花（動画 1 本目 9/4）** は直近の自アカウント投稿で紹介済み（Airtable `posts` 実読み・`ACTRESS_LAST_POSTED`）。**g12（30 日以内の再登場禁止）は posts 側の検査であり、x_targets のリプ対象選定には及ばない**（別テーブル・別目的）。
- ファイル一式: `management/_metrics/2026-W38/bundle1/`（`x_targets_seed_20260917.json` / `.csv` / `.batches.json` / `seed-to-records.mjs`）。§24-11-1 のとおり git 管理下に置いた。
