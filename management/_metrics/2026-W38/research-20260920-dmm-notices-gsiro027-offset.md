# DMM アフィリエイト お知らせ対応 — 掲載取り下げ依頼（gsiro027）の read-only 調査／API offset 上限 5,000 の棚卸しと分割設計案（E27）

- CSO 指示の日付表記＝2026-09-21。**受領・実施＝2026-09-20 21:58〜22:3x JST**（表記と受領日の 1 日差は記録のみ・時刻条件付きの指示ではない）。
- 読み取りのみ。Supabase MCP（`--read-only`）／Airtable MCP（検索のみ）／Vercel Runtime Logs（読み取り）／本番 sitemap の `curl`／`git grep`。**書き込み・削除・本番ページの直接取得は行っていない**（理由は §1-3）。

## 1. 掲載取り下げ依頼（2026-09-07 付・content_id `gsiro027`・amateur）

### 1-1. 調査範囲と結果（**全範囲で該当なし**）

| # | 範囲 | 方法 | 結果 |
|---|---|---|---|
| 1 | リポジトリ（作業ツリー・追跡／未追跡・`node_modules`／`.next`／`.git` 除外） | `grep -rIl gsiro027` ＋ `grep -rIli gsiro` | **0 件**（`gsiro` 接頭辞も 0） |
| 2 | git 履歴（全ブランチ） | `git log --all -S"gsiro027"` | **0 件** |
| 3 | Supabase `sitemap_works_archive` | `content_id = 'gsiro027' or ilike '%gsiro%'` | **0 件**。併記: `floor_code='videoc'` の行は **0**（archive は videoa / nikkatsu / anime のみ） |
| 4 | Supabase `sitemap_cohort` | 同上 | **0 件**。`videoc` 行 **0** |
| 5 | Supabase `fanza_response_cache`（108,135 行・22:0x 断面） | `kind='cid'` の `items->0->>'content_id'`＝0／`kind='cid'`・`kind='list'` の `items @> '[{"content_id":"gsiro027"}]'`＝**0 / 0** | **0 件**。併記: `kind='cid'` で `floor_code='videoc'` の行は **0**（ランタイムは videoc フロアを cid 照会しない） |
| 6 | Supabase `price_history` / `article_products` | `content_id` 一致／行の JSON 文字列一致 | **0 / 0**（`article_products` は `payload::text` 走査がタイムアウトしたため、行を `to_jsonb` にして再照会） |
| 7 | 配信中 sitemap 3 本（22:00:59 JST・`curl`） | `sitemap.xml`（`<loc>` 2,594・lastmod 2026-09-20T00:21:32Z）／`sitemap-archive.xml`（4,029）／`sitemap-cohort-1.xml`（5,000） | **`gsiro` 0 / `/works/videoc/` 0 / `/works/amateur/` 0**（3 本とも） |
| 8 | Vercel Runtime Logs（production・全文検索 `gsiro`） | `since 24h` | **0 件**。**24 時間より前（`2026-09-17〜19`・`7d`）は「No logs found／retention 超過」の応答で、__記録なし__と__保持期間外__を区別できない** |
| 9 | Airtable `posts`（X 投稿・`tblZMqvjtJY8MfaWZ`） | `search_records` `gsiro` 全検索可能フィールド | **0 件** |

- **【併記・出演女優】指示に女優名の記載が無く、当方のデータ（cache / archive / cohort）に当該作品が無いため、出演女優を特定できない。** 女優名が判明した場合は `/actresses/{id}`（動的ルート・API 都度取得）・M-07 フッターの女優リンククラウド（`works-editorial.json` / `editorial.json` の実名）・`ACTRESS_LAST_POSTED` を追加検査する（本報告時点では未実施＝対象が無い）。
- **【厳守】「該当なし」は上表の 9 範囲に対してのみ言える。** 画像は CDN（`pics.dmm.co.jp`）へのホットリンクであり当サイトには保存していない（`imageURL` はキャッシュ payload に含まれるが、上記 5 で当該作品の payload が存在しない）。

### 1-2. 構造上の帰結（設計から言えること・実測ではない箇所を明示）

- **当サイトは FANZA の `videoc`（素人）フロアを cid 照会しない。** UI の擬似フロア `amateur` は `apiFloor=videoa`＋`injectKeyword=素人` で **videoa** を引く（`src/lib/fanza/types.ts` `FANZA_FLOORS`）。したがって `/works/amateur/gsiro027`・`/works/videoa/gsiro027` は、**FANZA の videoa フロアが当該 cid を返す場合に限り** 200 で描画されうる（動的ルート・sitemap 収録の有無と無関係＝§5-4(6) と同型）。**videoa が返すかどうかは FANZA 側の状態であり、本調査では照会していない**（→ 1-3）。
- `videoc` を走査するのは `sale-source.ts`（`SALE_FLOORS` に videoc・rank 上位 4 ページ）のみで、結果は `list` キャッシュと `price_history` に入りうる。**上記 5・6 で 0 件。**

### 1-3. 本番ページを直接取得しなかった理由（CTO 判断・要否は CSO）

- `GET /works/{floor}/gsiro027` は **FANZA API への `cid=` 照会を発生させ、応答（空でも）を `fanza_response_cache` に upsert する**（stale-cache の設計）。**取り下げ対象の作品データを当サイト側に新たに書き込む副作用**になるため、read-only 指示に照らして実施しなかった。
- 代替として Vercel Runtime Logs（過去のリクエスト有無）を検索した（上表 8）。**必要なら CSO 承認のもとで 1 回だけ取得し、直後に cache 行を削除する手順とセットで行う。**

### 1-4. 該当があった場合の削除手順（設計・**今回は対象なし。将来の取り下げ依頼の雛形**・実施は CSO 承認後）

| 順 | 対象 | 手順 | 権限 |
|---|---|---|---|
| ① | 検索 | 本 §1-1 の 9 範囲を同じ手順で走査（`grep` / SQL / sitemap `curl` / Runtime Logs / Airtable）。**本番ページの直接取得は行わない**（副作用） | CTO・読み取り |
| ② | `sitemap_works_archive` | `delete from sitemap_works_archive where content_id = '<cid>'` → `sitemap-archive.xml` は次回生成で除外される（テーブル駆動） | **HUMAN**（Supabase MCP は `--read-only`。SQL Editor か Mac mini CLI） |
| ③ | `sitemap_cohort` | 同様に `delete`（cohort-1 は固定 5,000 件のため、削除後は 4,999 件として記録・補充しない） | HUMAN |
| ④ | `fanza_response_cache` | `delete … where kind='cid' and payload->'result'->'items'->0->>'content_id' = '<cid>'` ＋ `kind='list'` で `items @> '[{"content_id":"<cid>"}]'` の行（list はページ単位の payload のため行ごと削除＝同ページの他作品も次回取得まで MISS になる。件数を先に数える） | HUMAN |
| ⑤ | `price_history` / `article_products` / `works-editorial.json` / `editorial.json` / Airtable `posts` | 該当行・該当エントリの削除（X 投稿済みなら投稿の削除は HUMAN が X 側で） | HUMAN／CTO（リポジトリ内のみ） |
| ⑥ | 本体 `sitemap.xml` | API の `sort=date` 窓から動的生成のため、**FANZA が取り下げ済みなら次回生成で自然に落ちる**。落ちない場合は `sitemap-builder.ts` に除外リスト（cid の denylist）を追加＝**本番コード変更・CSO 承認** | CTO（承認後） |
| ⑦ | 動的ルート（404/410） | FANZA が取り下げ済みなら `items` 空 → `notFound()`＝**404**（E6① 実装どおり）。**410 を返す・API 応答に関係なく遮断する**には `works/[floor]/[id]/page.tsx` に denylist を要する＝本番コード変更・CSO 承認 | CTO（承認後） |
| ⑧ | 読み戻し | ②〜⑤の対象側を再照会して 0 件を確認（§10）。GSC の URL 削除ツールは HUMAN 枠 | CTO／HUMAN |

## 2. FANZA API の offset 上限 50,000 → 5,000（2026-09-16 告知・12 月適用・対象＝商品情報／女優／ジャンル／メーカー／シリーズ／作者検索 API）

### 2-1. offset を使う箇所の棚卸し（read-only・2026-09-20 22:0x・作業ツリー `cf1f80f`）

| # | 箇所 | 用途 | offset の決まり方 | **実運用の最大 offset** | 5,000 超 |
|---|---|---|---|---|---|
| R1 | `src/app/(site)/page.tsx` | トップ一覧のページング | `(page−1)×30+1`・`PAGE_LIMIT=50` | **1,471**（page=50） | × |
| R2 | `src/app/(site)/genres/[id]/page.tsx`・`actresses/[id]/page.tsx` | ジャンル／女優一覧 | `hits: 30`・page パラメータ無し（sort のみ） | **1**（offset 未指定） | × |
| R3 | `src/lib/sitemap-builder.ts` | 本体 sitemap の works 窓 | `page×100+1`・`PAGES_PER_FLOOR=4` | **301**（フロアごと） | × |
| R4 | `src/lib/fanza/sale-source.ts`（`/sale`・`api/cron/snapshot-prices`） | セール抽出（rank 走査） | `1+i×100`・`SALE_PAGES_PER_FLOOR=4` | **301**（4 フロア） | × |
| R5 | `src/lib/concierge/tools.ts` | コンシェルジュの検索ツール | `hits ≤ 20`・offset 未指定 | **1** | × |
| R6 | works 詳細・`sync-actress-table.mjs`・`generate-work-reviews.ts`・`upstream-failure.ts` | `cid=` 単品照会 | `hits: 1` | **1** | × |
| S1 | `scripts/generate-t1.mjs` | T1改 候補抽出（rank） | `1+p×100`・`--pages` 既定 3 | **201**（既定） | × |
| S2 | `scripts/snapshot-sale-prices.mjs` | セール名の発見＋名寄せ | `DISCOVERY_OFFSETS` 最大 **2,001**／`keyword` 走査 1〜901 | **2,001** | × |
| S3 | `scripts/healthcheck-api.mjs`・`guard-affiliate-id.mjs` | 疎通・ガード | offset 未指定 | 1 | × |
| C1 | **`management/_metrics/2026-W33/cohort1-prepared/build-cohort-1.mjs`**（2026-08-21・コホート1 構築） | 価格帯層化の悉皆走査 | `while (offset <= 50_000)`・`sort=price` / `sort=-price`・`lte_date=2026-07-31` | **49,901**（`sort=-price`）／約 15,001（`sort=price`） | **○（唯一）** |
| C2 | `management/_metrics/2026-W36/phase1-video/pick3.mjs` | 動画候補（日付範囲・rank） | 1 / 101 / 201 / 301 | 301 | × |
| — | §5-4(5) の実測（2026-08-22・研究用） | rank offset 5,001 以降の campaign 保有率 | 手動 | 5,001 以上 | 研究のみ・コード無し |

- **結論（棚卸し）**: **ランタイム・定常スクリプトは全件 5,000 未満（最大 2,001）。5,001 以上へ到達しているのは C1（コホート1 構築・一回性）のみ。** コホート1 は構築済み（5,000 行・`sitemap_cohort`）で再走査の予定は無いが、**コホート2 以降・棚卸し的な悉皆（§18 の「抜けている 17,924 件」等）を再び組む場合は C1 と同じ構造になる**ため、分割設計が要る。
- **【併記】`total_count` は現在 50,000 に張り付く（API の返却上限）。** 12 月以降に `total_count` の上限も変わるかは告知に記載が無い（**未確認**）。

### 2-2. 分割設計案（E27・**起案のみ・実装は CSO 承認後・着地目標 2026-11 中**）

**方針: 「1 クエリの母集団を `total_count ≤ 5,000` に収める」を条件で保証し、その中を offset 1〜4,901（hits 100）で全ページ取得する。** 分割軸は**互いに素で漏れが無い**ことを優先する。

| 案 | 分割軸 | 互いに素 | 漏れ | 分割数の決め方 | 評価（事実のみ） |
|---|---|---|---|---|---|
| **A（主案）** | **floor × 配信日範囲**（`gte_date`／`lte_date`） | ○（日付は 1 作品 1 値） | 無し（`date` は 100% 保有・§20-5） | **`total_count` を見て二分探索**——範囲の `total_count > 5,000` なら中点で 2 分割、`≤ 5,000` で確定。1 範囲あたり照会 1 回（hits=1）で判定できる | 既存 C2（`pick3.mjs`）と同じパラメータで実装できる。**videoa の 2026-01-30〜07-31 は 17,924 件（§18）＝最低 4 分割**。`sort=date` で範囲内を走査すれば C1 の価格順ソートは不要（価格帯は取得後にローカルで分類） |
| B | floor × ジャンル（`article=genre&article_id=`） | **×**（1 作品に複数ジャンル・中央値 7） | ジャンル無し作品は取れない | GenreSearch で列挙 | 重複除去が要り、網羅性を保証できない |
| C | floor × メーカー（`article=maker`） | ○（1 作品 1 メーカー・100% 保有） | 無し | MakerSearch で列挙（**メーカー数は未計測**） | 大手メーカー 1 社で 5,000 超の可能性あり → さらに日付分割が要る＝A に帰着 |
| D | `keyword`（キャンペーン名等） | × | あり | — | §5-4(4) のとおり名称の事前知識が要る。悉皆には不向き |

- **A の要点**: ①分割は `total_count` 駆動＝FANZA 側の件数変動に追従する ②`total_count` が 50,000 に張り付く範囲は「> 5,000」として扱い分割を続ける ③安全側の上限は **4,900**（`hits=100` の最終ページが 4,901〜5,000 に収まるように）④取得は `sort=date` 固定・`offset` 1, 101, …, 4,901 ⑤各範囲の `total_count` と取得件数を記録し、一致しない範囲は再分割して再取得（§10 の読み戻し）。
- **C1 の置き換え**: `build-cohort-1.mjs` の `while (offset <= 50_000)` を A の「範囲列挙 → 範囲ごとの走査」に置き換える。**価格帯の層化はローカル分類に変える**（`sort=price` の連続性に依存しない）。
- **影響しない箇所**: R1〜R6・S1〜S3・C2 は変更不要（最大 2,001）。**ただし `PAGE_LIMIT=50` 等の定数を将来引き上げる際は 5,000 を上限として設計する**（R1 は page=167 で 4,981 に達する）。
- **未確認（12 月前に実測で埋める）**: ①5,001 を指定したときの API 応答（400 か、空か、末尾で丸めるか）②`total_count` の上限値の変化 ③告知対象の「女優／ジャンル／メーカー／シリーズ／作者検索 API」側の offset 使用は当サイトでは **0 箇所**（`ActressSearch` 等を offset 付きで呼ぶコードは無い・上表のとおり）。

### 2-3. 登録

- **E27**（TASK_BOARD・`JUDGMENT_20260912_NOTES.md` の E 表）: **「FANZA API offset 上限 5,000 対応＝分割設計案 A の起案 → CSO 承認 → 実装（C1 系の悉皆走査のみ）・5,001 指定時の応答の実測」**。**期限＝起案 2026-10 中・着地 2026-11 中（適用 12 月）。**

## 3. 報酬料率・お知らせの記録（台帳へ転記＝FACT §5-3-1・§28）

- FANZA TV 新規無料登録 **¥2,750 の期間＝2026-09-12〜2026-10-22 23:59**（従来の「終了日記載なし」を訂正）。**TV PLUS は対象外。「一部アフィリエイターは単価UP対象外」の注記あり。** 自アカウントが対象か＝**HUMAN 確認（2026-09-21・affiliate.dmm.com 報酬料率画面・CSO 転記）: 2,750 円表示＝報酬UP対象**。
- 他の料率は台帳 v3 と一致・変更なし。**通販（アダルト）サービス新規「---」＝停止済みで確定**（「中止予定日未取得」→「停止済み」に訂正）。
- 2026-09-01 参加規約改定（`terms.dmm.com/affiliate_web_service/`）＝外部依存として 1 行登録。**電書ブログパーツ終了・インボイス機能停止＝VODNAVI に影響なし（CSO 判定の転記）。** 併記: リポジトリ（app-concierge / site-brand / site-moterist）に DMM ブログパーツの参照は 0 件（`grep -i blogparts|ブログパーツ|widget.dmm`・2026-09-20 22:1x）。
- 記事・投稿の時点注記のルールは不変（「2026年○月時点」の様式のまま）。
