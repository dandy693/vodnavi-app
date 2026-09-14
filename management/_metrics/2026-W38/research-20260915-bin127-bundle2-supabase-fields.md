# 第127便 束2 — 作品知識ソース（Supabase）の read-only 調査：リプ案生成に使えるフィールド一覧

- **実施**: 2026-09-15 06:52:07〜07:0x JST（CTO）／**CSO 承認**（2026-09-15）: 両表のカラム定義（`verbose: true`）＋ `fanza_response_cache` の代表行 3 件のサンプル読み取り（read-only）
- **計測系**: Supabase MCP（`--read-only`・project `xflqxxyvphqqmnzscpxr`＝vodnavi-production）`list_tables` / `execute_sql`（SELECT のみ）
- **5軸ラベル**: ①対象範囲＝`public` スキーマ 7 表のうち束2 対象の 2 表 ②期間＝2026-09-15 06:5x の断面（`fanza_response_cache` は 7 日ローリング） ③計測系＝Supabase MCP ④出典＝自サイトの実測 ⑤機会の数＝代表行 3 件（サンプル）＋集計は全行
- **【厳守】本書は調査結果の記録であり設計ではない。** 束2 の設計は別途。推奨は書かない。

## 1. CSO 裁定（2026-09-15）

| 項目 | 裁定 |
|---|---|
| §26-3 ⑤ | **解消。** Supabase MCP は PAT 差し替えで復旧（読み取り専用・vodnavi-production スコープ・**期限 2027-09-13**・秘密系 Read なし・Backups なし） |
| 束2 の作品知識ソース | **`fanza_response_cache`（主）＋ `sitemap_works_archive`（従）**。**`sitemap_cohort` は束2 の対象外** |
| §26-3 の残り 7 件（①②③④⑥⑦⑧） | 「扱い」欄のとおりで **1〜8 OK** |

## 2. `public` の実在テーブル（7 表・works 表は無い）

| テーブル | RLS | 行数（06:52） | 束2 での扱い |
|---|---|---|---|
| **`fanza_response_cache`** | 有効 | **93,704**（07:0x 再集計 93,659＝ローリング削除で変動） | **主** |
| **`sitemap_works_archive`** | 有効 | **3,749** | **従** |
| `sitemap_cohort` | 有効 | 5,000 | 対象外（裁定） |
| `price_history` | 有効 | 13,296 | 対象外（本便で言及なし） |
| `editorial_articles` / `article_products` / `internal_links` | 有効 | 18 / 16 / 0 | 対象外 |

## 3. `fanza_response_cache` — カラム定義と構造

| カラム | 型 | 備考 |
|---|---|---|
| `cache_key` | text（PK） | **`sha256(JSON.stringify(sorted(params) + ["__filtered", bool]))`**（`src/lib/fanza/stale-cache.ts` `buildCacheKey`）。**`api_id` / `affiliate_id` は params に含まれずキーにも混入しない** |
| `kind` | text | CHECK `'list' | 'cid'` |
| `payload` | jsonb | **`{ result: {...} }` のみ**（`sanitizePayload` が `request`＝api_id echo を落として保存）＝**資格情報は payload に無い** |
| `fetched_at` | timestamptz | default `now()` |

**集計（07:0x）**:

| kind | 行数 | 最古 `fetched_at` | 最新 | payload 平均バイト |
|---|---|---|---|---|
| `cid` | **70,748**（distinct content_id **70,535**） | 2026-09-07 21:53 UTC | 2026-09-14 21:54 UTC | 1,722 |
| `list` | 22,911 | 2026-09-07 21:53 UTC | 2026-09-14 21:54 UTC | 19,107 |

- **保持は 7 日ローリング**: `persistStaleCandidate` が upsert のたびに 2% の確率で `fetched_at < now − 604,800s` の行を DELETE する（`stale-cache.ts` L70-84）。**最古が 9/7 なのはこのため。** **「6 万件の在庫」全体ではなく、直近 7 日にランタイムが要求した作品だけが載る。**
- **`cid` 行のうち items が空の行＝199 件**（API が正常応答し該当なしだった応答のキャッシュ）。**`iteminfo.actress` を持つ行＝63,480**（89.7%）。**`campaign` を持つ行＝633。**
- **content_id からの逆引き**: `cache_key` はパラメータのハッシュのため、**`payload->'result'->'items'->0->>'content_id'` の全走査**か、**ページが使う params の再現（`buildCacheKey`）**のどちらかが要る。**index は無い（PK のみ）。**

### 3-1. 代表行 3 件（`kind='cid'`・`fetched_at` 降順・2026-09-14 21:53〜21:54 UTC）

| content_id | floor | title（60 字） | date | volume | price / list_price | actress | genre | maker / label / series / director | review | sample_s 枚数 / 動画 | campaign |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `masm00023` | videoa | 不登校引きこもり女子生徒の自宅訪問 大人しい子を想像してたのに… | 2024-04-06 | 125 | `300~` / `300~` | 百仁花 | ハイビジョン/4K/M男/巨乳/女子校生/中出し/単体作品/妄想族/ビッチ | かぐや姫Pt/妄想族 / マゾマン / 不登校引きこもり女子生徒の自宅訪問 / ノートン | 1 件・2.00 | 20 / あり | なし |
| `65stv01137` | videoa | ホワイトウェディング 初夜の鐘が鳴る 可愛静果 | 2013-07-25 | 50 | `300~` / `300~` | 可愛静果 | スレンダー/若妻・幼妻/単体作品 | ロイヤルアート / Stella / ホワイトウェディング / — | なし | 20 / なし | なし |
| `h_067nass00931` | videoa | 密着性交 燃え上がる男女の肉体関係 | 2018-10-26 | 159 | `300~` / `300~` | 翔田千里/松本まりな/花島瑞江/結城みさ | 人妻・主婦/痴女/巨尻/熟女/巨乳/ハイビジョン | なでしこ / Nadeshiko / — / — | なし | 15 / あり | なし |

- **`result` のキー**: `first_position` / `items` / `result_count` / `status` / `total_count`。
- **`items[0]` のキー（3 件の和集合）**: `affiliateURL` / `category_name` / `content_id` / `date` / `floor_code` / `floor_name` / `imageURL`（`large`/`list`/`small`）/ `iteminfo` / `prices` / `product_id` / `review`（無い行あり）/ `sampleImageURL` / `sampleMovieURL`（無い行あり）/ `service_code` / `service_name` / `title` / `URL` / `volume`。**§5-2-3(1) の 33 キーと同型。**
- **`iteminfo` のサブキー**: `actress` / `genre` / `maker` / `label` / `series` / `director`（**series・director は無い行あり**）。各要素は `{ id, name }`。
- **【併記】`affiliateURL` は API 返却値（af_id 990 埋め込み・§8 の「API 返却の 990 は正常」）。** **束2 のガード「URL・ドメイン・af_id・vodnavi を含めない」に照らし、リプ案生成では `affiliateURL` / `URL` / `imageURL` / `sampleImageURL` / `sampleMovieURL` を__入力に渡さない__ことになる（設計時に確定）。**

## 4. `sitemap_works_archive` — カラム定義

| カラム | 型 | 備考 |
|---|---|---|
| `content_id` | text（PK） | |
| `floor_code` | text | |
| `released_at` | timestamptz（nullable） | 配信日（未来日付あり・最大 2026-10-10） |
| `first_seen_at` | timestamptz | main sitemap の窓を通過した日（§18） |
| `last_seen_at` | timestamptz | |

| floor | 行数 | `released_at` 最小〜最大 |
|---|---|---|
| videoa | 2,820 | 2026-08-01 〜 2026-10-10 |
| nikkatsu | 488 | 2023-03-25 〜 2026-09-04 |
| anime | 441 | 2025-01-24 〜 2026-09-12 |

- **作品の属性（タイトル・出演・ジャンル）は持たない。** **content_id と配信日だけ。** **束2 での役割は「対象 content_id の候補リスト（新作寄り・sitemap 収録済み）」に限られる。**
- **archive 3,749 件のうち、現在の `cid` キャッシュに payload がある content_id＝2,963 件（79.0%・07:0x 断面）。** 残り 786 件は 7 日以内にランタイムが要求していない＝キャッシュに無い。

## 5. リプ案生成に使えるフィールド一覧（**事実の整理・設計ではない**／第128便 §6-3 の形式＝フィールド名／型／欠損の有無／用途）

| フィールド | 型（jsonb 内） | 欠損の有無（実測） | 作品知識としての用途候補 | 出典表 |
|---|---|---|---|---|
| `content_id` / `product_id` / `floor_code` | string | なし（3/3） | 作品の同定。品番表記（例 `MASM-023`）は `product_id` 側 | cache（cid） |
| `title` | string | なし | 作品名（60 字超あり・§20-1） | cache |
| `iteminfo.actress[].name` | array of {id,name} | **あり**——cid 行の 89.7%（63,480 / 70,734）が保有。anime 等は無い（§17-1） | 出演 | cache |
| `iteminfo.genre[].name` | array of {id,name} | 3/3 に存在（代表行で 3〜9 件・中央値 7 件 §20-5） | ジャンル | cache |
| `iteminfo.maker[].name` / `label[].name` | array of {id,name} | 3/3 に存在 | メーカー / レーベル | cache |
| `iteminfo.series[].name` / `director[].name` | array of {id,name} | **あり**（3 件中 series 2・director 1。保有率 54.2% / 53.4% §20-5） | シリーズ / 監督 | cache |
| `date` | string `YYYY-MM-DD HH:MM:SS` | なし | 配信日 | cache |
| `released_at` | timestamptz（nullable） | 列は nullable・未来日付あり（最大 2026-10-10） | 配信日（候補リスト側） | archive |
| `volume` | string（分） | なし | 収録分数 | cache |
| `prices.price` / `prices.list_price` | **string**（例 `300~`） | なし（3/3） | 価格（`parseYen` 相当の解釈が要る・§5-4(1)） | cache |
| `campaign[]`（`title` / `date_begin` / `date_end`） | array | **あり**——633 行のみ（0.9%）。時限 | セール（取得時刻の併記必須・§5-4(7)） | cache |
| `review.count` / `review.average` | string | **あり**（3 件中 1。保有率 18.6% §20-5） | レビュー | cache |
| `fetched_at` | timestamptz | なし | 鮮度（7 日ローリング）の判定 | cache |
| **渡さない（束2 ガード）** `affiliateURL` / `URL` / `imageURL.*` / `sampleImageURL.*` / `sampleMovieURL.*` | string / object | `sampleMovieURL` は無い行あり | URL・af_id（990 埋め込み）を含むため入力に渡さない | cache |
| `content_id` / `floor_code` / `first_seen_at` / `last_seen_at` | text / timestamptz | なし | 候補の母集団（3,749 件・属性なし） | archive |

## 6. 制約（設計時に前提とする事実）

1. **cache は直近 7 日のランタイム要求分のみ**（ローリング削除）。**「既存 works データから引く」＝この窓に載っている作品に限られる。** **窓に無い作品は FANZA API の新規呼び出しを要する**（束2 は「新規呼び出しを増やさない」と規定）。
2. **content_id → payload の逆引きに index が無い**（PK は `cache_key`）。70k 行の JSONB 走査は MCP からは可能（本調査で実行）だが、ツール内で常用するなら params 再現によるキー計算が要る。
3. **MCP は `--read-only`**（本 PAT のスコープどおり）。束2 の実績記録先は Airtable `x_replies`（束1）であり Supabase には書かない。
4. **`payload` に資格情報は含まれない**（`sanitizePayload`）。**`affiliateURL` の af_id 990 は API 返却値の埋め込み**であり、これを入力に渡さない設計が束2 ガードと整合する。
