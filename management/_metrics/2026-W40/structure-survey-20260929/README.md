# 12月に向けた構造施策4件の現状調査（読み取りのみ）— 2026-09-29

- **便**: CSO 発行「第N便（番号は収容時に採番）」— ⑧関連作品導線 ／ ⑦シリーズ・メーカー面 ／ B2① ／ ⑬値下がり通知 の前提確認
- **実施**: 2026-09-29 17:06:51 〜 17:13:04 JST（PowerShell 実測の2点）＋報告書作成。上限60分内。
- **前提SHA の照合**: 便に具体的な SHA の記載が無かった。照合点として **`origin/main` = `HEAD` = `5f1833f`**（17:06:51 に `git fetch` 後に一致を確認）を記録する。作業ツリーには本便以前からの未コミット変更（`app-concierge/scripts/generate-t1.mjs` / `x-post-generator.mjs`）があり、本便では触れていない。
- **書き込み**: `src/`・公開面・Supabase・Airtable・Firewall への書き込みは **0件**。Supabase は `SELECT` のみ、本番は `GET` のみ（works 3件・記事1件・sitemap 3本）、GA4 は Data API の読み取りのみ。成果物は本ファイルと `ga4-works2works.mjs`（§24-11-1 に従い再現用スクリプトを保存）のみ。
- **10/12 判定の観測窓（§26-2）に影響する変更**: 0件。

---

## A. works 詳細の関連作品導線（⑧の前提）

### 事実

**A-1 設計（`app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx`・900行）の自サイト内リンク**

| 種別 | 箇所 | 本数の決まり方 |
|---|---|---|
| `/` `/?floor=` | パンくず | 各1 |
| `/genres/{id}` | パンくず（主ジャンル）1 ＋ FV チップ `slice(0,4)` ＋「ジャンル」欄 `slice(0,12)` ＋ 関連作品見出しの「ジャンル一覧へ」1 | 1 + min(4,n) + min(12,n) + 1 |
| `/actresses/{id}` | FV チップ `slice(0,3)` ＋「出演」欄 `slice(0,8)` | min(3,n) + min(8,n) |
| `/works/{floor}/{cid}` | **関連作品 `getRelatedWorks` のみ**（**同一フロア × 主ジャンル × `sort=rank` × `hits: limit+4`・自作品除外・最大12**） | ≤12 |
| `/articles/{slug}` | `ArticleGuideLinks`（2本×FV/下段の2箇所）＋ `NewUserFvModule`（`fanza-first-guide`） | 固定 |
| `/concierge?...` | `ConciergeCtaLink` / `ConciergeCtaPanel` | 固定 |

- **シリーズ・メーカー・監督は「作品情報」欄にテキスト（`Row` の `value`）として出すだけで、リンクではない**（L480-493）。
- **関連作品の軸は「同ジャンル」のみ。同女優・同シリーズ・同メーカーの関連は存在しない。**
- `getRelatedWorks` は `catch { return [] }`＝取得失敗時は関連作品セクションごと消える（CTA は残る・§7 の記述と一致）。

**A-2 本番 HTML（2026-09-29 17:08 JST・`curl`・Chrome UA・HTTP 200）**

対象は本番 `sitemap.xml` の各フロア先頭 URL。`<main>`〜`<footer>` 間で数えた（ヘッダ・フッターは別記）。

| URL | genres | actresses | works | articles | concierge | 設計からの期待値 | 一致 |
|---|---|---|---|---|---|---|---|
| `/works/videoa/vrkm01944`（ジャンル9・女優1） | 15 | 2 | **12** | 6 | 3 | genres 1+4+9+1=15 / act 1+1=2 | ○ |
| `/works/anime/h_1379jdxa57841`（ジャンル8・女優0） | 14 | 0 | **12** | 6 | 3 | 1+4+8+1=14 | ○ |
| `/works/nikkatsu/174okuram00792`（ジャンル4・女優0） | 10 | 0 | **12** | 6 | 3 | 1+4+4+1=10 | ○ |

- **3件とも設計と実 HTML の本数が一致した。** `<main>` 内の `/works/` リンクは3件とも関連作品の12本だけ（一意 12）。
- ヘッダ（3件共通）: `/` 3・`/sale` 1・`/concierge` 1。フッター（3件共通）: **`/actresses/` 56・`/genres/` 70**（M-07 リンククラウド）＋固定5。
- nikkatsu の1件は「シリーズ」行が描画されていない（当該作品に series が無い）。

**A-3 `fanza_response_cache`（read-only SELECT・2026-09-29 17:0x JST）**

- **分母**: `kind='cid'` かつ `fetched_at` が直近7日（実データ範囲 2026-09-22 08:08 UTC 〜 09-29 08:07 UTC）＝ **135,891 行**、うち `items[0]` あり **135,697**（= distinct content_id 135,697）。
- **キー名**: `payload.result.items[0].iteminfo` のキー＝`actress / author / director / genre / label / maker / series`。`actress[]` は `{id, name, ruby}`、`series[]`・`maker[]` は `{id, name}`。

| 項目 | 全体（n=135,697） | videoa（131,159） | nikkatsu（3,399） | anime（1,138） |
|---|---|---|---|---|
| actress あり | 127,551（94.0%） | 94.8% | 95.2% | **0%** |
| series あり | 80,140（59.1%） | 59.6% | 26.4% | 92.4% |
| maker あり | 135,697（100%） | 100% | 100% | 100% |
| series/maker に `id` あり | series 80,140 / maker 135,697（あるもの全件） | | | |

- anime の actress 0% は §17-1（anime フロアには `iteminfo.actress` が付かない）と整合。
- **この cache は「直近7日にランタイムが要求した作品」だけ**（§26-5 ①）。在庫全体ではない。

**A-4 GA4 で works→works が取れるか（Data API・読み取り）**

- 5軸: ①`hostName=app.vodnavi.jp` ∧ `pagePath` が `/works/` 始まり ∧ `eventName=page_view` ∧ **country ≠ China**（§29-4 既定） ②**2026-09-01〜09-28** ③GA4 Data API（p489519780）④自サイト実測 ⑤works 詳細1ページ内の `/works/` リンクは関連作品の最大12本のみ（A-2）。
- **`pageReferrer` ディメンションで取れる。** `page_view` 4,071 の referrer 内訳:

| referrer | 件数 |
|---|---|
| google | 1,975 |
| 他の検索エンジン等（bing 959 / search.yahoo.co.jp 543 / duckduckgo 58 ほか） | 1,596 |
| **app.vodnavi.jp/works/（works→works）** | **94（2.3%）** |
| app.vodnavi.jp/actresses/ | 59 |
| app.vodnavi.jp/genres/ | 21 |
| 空 / (not set) | 168 |
| X（t.co 等） | 142 |
| トップ 6 / 他の app 面 9 / articles 1 | 16 |

- **関連作品のクリックを直接示すイベントは無い。** works 詳細面で発火しているイベント名は `page_view / session_start / first_visit / age_gate_view / user_engagement / age_gate_agree / scroll_custom / click / ai_affiliate_click / product_click / scroll / concierge_entry_click / age_gate_bounce / article_guide_click` の14種で、関連作品用の `placement` 等は無い。

### 台帳との整合

- **便の「af_id 付き外部リンク15本は既知」と実測が一致しない**: `<main>` 内の `href="https://al.(dmm|fanza)..."` は3件とも **17本**。15本の出典は台帳上で特定できなかった。**本便の指示どおり数えない（記録のみ）。**
- FACT §14-13-8（外部アフィリエイト導線の計装網羅性）は外部リンクの棚卸しであり、works→works 内部遷移は対象外＝矛盾ではない。
- A-3 の充足率は §20-5（等間隔120件サンプル: series 54.2%）と同じ向き。母集団が違う（本件は cache 135,697）ため数値は比較しない。

### 未確認

- **referrer 94件が関連作品のクリックかどうかは断定できない。** `<main>` 内の `/works/` リンクは関連作品だけだが、ブラウザの戻る・別タブ・リロード等でも同じ referrer になりうる。
- Next.js のクライアント遷移（`next/link`）で `page_referrer` が前ページになることは、94件が非0であることから「少なくとも一部で入る」までしか言えない。全件で入るかは未確認。
- 関連作品の取得失敗（`[]`）がどの程度起きているかは測っていない。

### 候補（実施は別便・優先順は付けない）

- works→works を計測するなら、関連作品リンクに `placement` 付きのクリックイベントを足す（**計測設計が先**。本番コード変更＝観測窓後）。
- 関連作品の軸を増やす場合のデータ源候補: cache の `iteminfo.actress` / `series` / `maker`（いずれも `id` を持つ）。ただし FANZA API を新規に呼ぶか cache に限るかは別途裁定。

---

## B. シリーズ面・メーカー面の有無（⑦の前提）

### 事実

**B-1 ルート一覧（`app-concierge/src/app`）**: `page.tsx` は `(site)/` 配下に `about / actresses/[id] / articles/[slug] / contact / disclaimer / genres/[id] / privacy / sale / works/[floor]/[id]` とトップ、ほかに `age-gate / concierge / lp`。`route.ts` は `api/age-gate / api/concierge / api/cron/snapshot-prices / sitemap.xml / sitemap-archive.xml / sitemap-cohort-1.xml`。**`/series`・`/makers` 相当の面は存在しない。**

**B-2 配信 sitemap の URL 種別（2026-09-29 17:09 JST・`curl`）**

| sitemap | 総数 | 内訳 |
|---|---|---|
| `sitemap.xml` | **2,569** | actresses 1,152 / works 1,200（videoa 400・anime 400・nikkatsu 400）/ genres 200 / articles 8 / `?floor=` 4 / 静的 5（`/`・sale・privacy・disclaimer・about） |
| `sitemap-archive.xml` | **4,330** | works videoa 3,390 / nikkatsu 488 / anime 452 |
| `sitemap-cohort-1.xml` | **5,000** | works videoa 5,000 |

- series・maker の URL は 0件。

**B-3 actresses 面の生成方式（1段落）**

`/actresses/[id]` は `generateStaticParams` を持たない動的ルートで、`export const revalidate = 300` を宣言している（§16-5(2) のとおり本番で ISR が着地しているかは別問題）。データ源は FANZA API `ItemList` を `article=actress&article_id={id}&hits=30&sort=date`（`?sort=` で切替）で videoa → anime → nikkatsu の順に歩き（`resolveAcrossFloors`）、最初に items>0 のフロアを採る。全フロア正常・該当なしで 404、1フロアでも失敗して見つからなければ 500（E6①）。関連女優は `sort=rank&hits=30` の一覧から集約、編集文は `getActressEditorial`（JSON）。**ページ数は sitemap 上 1,152**で、これは `sitemap-builder.ts` が works 窓（`PAGES_PER_FLOOR=4 × HITS_PER_REQUEST=100` × フロア）から `iteminfo.actress` を集めた集合であり、別途の女優一覧 API は使っていない。offset を使うページングは無い（1ページ30件のみ）。

**同型でシリーズ・メーカー面を作る場合（候補列挙のみ）**

| 流用できる部分 | 新規が要る部分 |
|---|---|
| `resolveAcrossFloors` による floor-walk と 404/500 の分岐（E6①） | `article=series` / `article=maker` を引く取得関数（actress の `article_id` 版の置換） |
| `ProductGrid` / `EmptyState` / `ArticleGuideLinks` / error.tsx の文言 | 面の名前の解決（actress は items から name を拾う方式。series・maker も `iteminfo` に `{id,name}` があるため同方式が可能かは要確認） |
| `sitemap-builder.ts` の「works 窓から ID を集める」方式（actressMap と同型の seriesMap / makerMap） | sitemap への収録上限・対象の裁定（series は cache だけで videoa 22,095 種・中央値2作品） |
| works 詳細からのリンク差し込み口（「作品情報」欄の `Row`） | 同欄をテキストからリンクへ変える変更（本番コード） |

**B-4 offset 上限 5,000（E27）との関係**

- **list cache（`kind='list'`・直近7日＝2026-09-22 08:08〜09-29 08:07 UTC・40,391 行）の `first_position` 最大＝1,111。1,000 超 4 行・5,000 超 0 行。** `total_count` 最大 50,000、`total_count` > 5,000 の行は 348。
- **cid cache（同7日・135,697件）の作品数を series / maker で集計（＝各面の作品数の下限）**:

| | videoa | nikkatsu | anime |
|---|---|---|---|
| maker 種類数 / 1社あたり最大 / 中央値 | 1,327 / **3,827** / 8 | 54 / 635 / 13.5 | 34 / 182 / 16.5 |
| series 種類数 / 1シリーズあたり最大 / 中央値 | 22,095 / 935 / 2 | 265 / 42 / 2 | 410 / 163 / 2 |

- **actresses と同じ「1ページ30件・offset 無し」の作りなら、offset 5,001 超は要しない。**
- **1面の全作品をページングで見せる作りにした場合、cache 上だけで 3,827作品のメーカーがある**（実数は cache 外を含めてこれ以上）。offset 5,001 超に届くかは cache からは断定できない（→ 未確認）。

### 台帳との整合

- §28-2 の「ランタイムが7日間に指定した offset の最大は 841（2026-09-14〜09-21）」に対し、本件の窓（09-22〜09-29）では **1,111**。いずれも 5,000 未満で結論（影響なし）と矛盾しない。数値の更新として記録。
- §28-2 案C「メーカー＝大手で 5,000 超・A に帰着」は一般論として記載されている。本件の cache 実測（最大 3,827・下限値）はそれを肯定も否定もしない。

### 未確認

- FANZA API の `article=maker` / `article=series` の実 `total_count`（API を新規に呼ぶため本便では照会していない）。
- `SeriesSearch` / `MakerSearch` API で面の一覧を作る場合の件数（同上）。
- `revalidate = 300` が actresses 面で着地しているか（§16-5(2) の works と同じ問題の有無）。

### 候補（実施は別便・優先順は付けない）

- 12月前の E27 実測（§28-2・11月中1回・read-only）に `article=maker` / `article=series` の最大 `total_count` を1回含める。
- シリーズ・メーカー面の URL 集合を「works 窓から集める」方式にするか「一覧 API」にするかの裁定。

---

## C. B2①（記事本文リンク）の着地状況

### 事実

**C-1 PR #62・DDL**

- **PR #62「B2①: 記事レンダラ本文リンク対応(PR-1)」＝MERGED・2026-08-02 13:17:48 UTC（22:17:48 JST）・merge commit `98b6389`**（`gh pr view 62`）。
- 適用確認の記録: `1673191`「B2①(PR #62)デプロイ後チェック — 全項目合格」／`4e44aa0`「B2①はデプロイ済み(実アンカー13本を実画面確認)」。TASK_BOARD L2829「B2①(8/2 22:18:52 デプロイ・23:19:32 リンク投入)」。
- **B2① はデータベースを使わない。** 本文の `[表示文](/articles/slug)` をレンダラが公開済み slug のホワイトリストで照合して描画する（FACT §14-14-5）。
- **`internal_links` は B2②-b のテーブル**（FACT §12）。実測（Supabase read-only）: **存在する・列11（id / source_type / source_id / target_slug / anchor_text / position / origin / status / created_at / approved_at / approved_by）・行数 0・制約9（`chk_no_self_link` 等）・トリガ3（`trg_guard_ai_proposal` / `trg_guard_live` / `trg_guard_status_transition`）・ポリシー3（`ai_insert_proposed_only` / `approver_select` / `approver_update_status`）**。DDL 適用の記録は `c2e09fd`「ddl+design: internal_links を適用」。

**C-2 本文リンクの描画（公開記事の本文、`editorial_articles` read-only）**

| slug | 本文中の `[..](/articles/..)` |
|---|---|
| fanza-kaiyaku | 4 |
| fanza-tv-free-trial | 3 |
| fanza-tv-review | 3 |
| fanza-subscription-vs-single-purchase | 2 |
| fanza-payment-methods | 2 |
| fanza-tv-guide | 1 |
| fanza-first-guide / fanza-payment-statement | 0 |
| **合計（公開8本）** | **15** |

- **本番 `/articles/fanza-kaiyaku`（2026-09-29 17:11 JST・HTTP 200）の `<article>` 内アンカー＝`fanza-tv-free-trial / fanza-first-guide / fanza-tv-review / fanza-tv-guide` の4本で、DB 本文の4本（リンク先・順序とも）と一致。** `<script>` を除いた HTML に `](/articles/` の生文字列は 0件＝未変換の残りは無い。

**C-3 B2②（works/actresses→articles）の台帳上の状態**

| 施策 | 状態 | 出典 |
|---|---|---|
| **B2②-a**（定数配列の固定リンク） | **デプロイ済**（2026-08-03 06:15:20・PR #66 `6e07942` / `643ff1f`）。本番では works 詳細の `/articles/` 6本がこれに当たる（A-2） | TASK_BOARD L3029 / L3317 |
| **B2②-b**（`internal_links` 行による可変化） | **6工程中4工程完了**（①DDL ②RLS ③トリガ ④ガードレール）。**⑤PR-2（レンダラ改修）・⑥提案バッチは未着手**。実行には `ai_proposer` の資格情報が必要（未配置・HUMAN 枠）。読み戻し経路は案1を推奨として起案済み・**「裁定確定まで B2②-b 本体には着手しない」** | TASK_BOARD L3442 / L4764 / L5321 / L7565、FACT §12 |
| 優先度 | **2026-09-12 CSO 裁定3(3)-②で「B2②を束3の E3（M3）と同格へ引き上げる」** | FACT §14-14-7 |

### 台帳との整合

- **便の C-1「internal_links の DDL 適用有無」は B2① の確認項目として書かれているが、台帳上 `internal_links` は B2②-b のもの**（FACT §12・TASK_BOARD L3316「B2②-b の正体＝リンク先の選定方法とアンカーテキストの可変化」）。B2① はテーブルを使わない。**矛盾というより項目の帰属の違いとして記録する**（指示の停止条件には当たらないと判断し、両方を実測した）。
- 8/2 の確認記録「実アンカー13本」と本件の DB 集計 15本の差 2 は、記事A（2026-08-11 公開・2本）の追加で説明がつく（13 + 2 = 15）。**本番で15本すべてを描画確認したわけではない**（確認は kaiyaku の4本）。
- TASK_BOARD L5321「B2②-b 5/6工程完了」と L3442「①〜④完了・⑤⑥未着手」で工程数の表記が揺れている。本報告は L3442 / L4764 の内訳（4/6）を採った。

### 未確認

- kaiyaku 以外の7本の本番描画（本便は1件のみ）。
- `ai_proposer` の資格情報の配置状況（TASK_BOARD 上は未配置の記録のまま・以後の更新記録は見つからなかった）。

### 候補（実施は別便・優先順は付けない）

- B2②-b の残り2工程（PR-2 レンダラ・提案バッチ）の再開可否の裁定（前提＝`ai_proposer` 資格情報と読み戻し経路案1の裁定）。

---

## D. `price_history` の値下がり検知への適合（⑬の前提）

### 事実

**D-1 スキーマと書き込み元**

- 列: `content_id text / snapshot_date date / floor_code text / price integer / list_price integer / campaign_title text / campaign_end timestamptz / captured_at timestamptz / batch_at timestamptz`。
- **主キー `(content_id, snapshot_date)`＝粒度は作品×日**（1日1作品1行・同日の再取得は upsert で上書き）。索引: `snapshot_date` / `content_id` / `(snapshot_date, batch_at desc)`。
- **行数 20,208（2026-09-29 17:1x JST）・最古 2026-08-22・最新 2026-09-29・39日・distinct content_id 6,828**。1日あたり行数 中央値 458 / 最大 857 / 最小 190、1日の `batch_at` 最大 3。
- **書き込み元**: `app-concierge/src/app/api/cron/snapshot-prices/route.ts`（Vercel Cron・`CRON_SECRET` 必須）。`vercel.json` の schedule は **`0 21 * * *`（06:00 JST）と `0 5 * * *`（14:00 JST）の1日2回**。
- **書き込む母集団**: `fetchSaleItems`（`src/lib/fanza/sale-source.ts`）＝**4フロア（videoa / anime / nikkatsu / videoc）× `sort=rank` × `hits=100` × offset 1/101/201/301（4ページ）の中で、セール中（`isOnSale`）の作品のみ**。
- **実測で裏づけ: 直近30日の 15,599 行は全件 `campaign_title` あり・全件 `price < list_price`・`price` null 0**。**セール外の作品の価格は1行も記録されていない。**

**D-2 「前回価格より下がった作品」の試算（read-only SELECT）**

```sql
with seq as (
  select content_id, snapshot_date, price, campaign_title,
         lag(price) over (partition by content_id order by snapshot_date) prev_price,
         lag(snapshot_date) over (partition by content_id order by snapshot_date) prev_date,
         lag(campaign_title) over (partition by content_id order by snapshot_date) prev_camp
  from price_history)
select snapshot_date, count(*) from seq
where prev_price is not null and price < prev_price and snapshot_date >= current_date - 30
group by 1 order by 1;
```

- 5軸: ①`price_history` 全作品 ②2026-08-30〜09-29（31日）③Supabase ④自サイト実測 ⑤記録対象はセール中の rank 上位作品のみ（D-1）。
- **値下がりイベント 計6件・31日中5日のみ発生・日別 中央値 0 / 最大 2**（9/2 1・9/9 1・9/21 1・9/23 2・9/28 1）。うち前回記録が前日のもの 1件。
- 参考: **同期間に初めて記録された作品（＝セール入り）は日別 中央値 82 / 最大 405**。

**`/sale` の「セール名の新規検知」との違い（1段落）**

`/sale` 側の差分検知（`detectNewCampaigns`）は、`snapshot_date` ごとの最終バッチの **`campaign_title` の集合**を前日と比べ、前日に無い名称を「新規キャンペーン」とする（FACT §5-4(8)）。単位はキャンペーン名で、同名の再開は拾わない。一方「前回価格より下がった作品」は単位が作品で、同じ作品の `price` の時系列差を見る。ただし `price_history` はセール中の作品しか記録しないため、**通常価格→セール価格という最も多い値下がりは「前回価格」が存在せず、上の SELECT では拾えない**（拾えたのはセール中の作品がさらに下がった6件のみ）。セール入りを作品単位で拾うなら「初めて記録された日」（中央値 82/日）が近い指標だが、それは rank 上位400 × 4フロア の窓に入った日であって値下がりした日と同一とは限らない。

**D-3 発売日通知に使える列**

- `price_history`: **配信開始日・発売日の列は無い**（`campaign_end` はセールの終了）。
- `sitemap_works_archive`: **`released_at`（timestamptz）がある**。

| floor | 行数 | released_at 最小〜最大 | 未来日付（2026-09-29 時点） |
|---|---|---|---|
| videoa | 3,390 | 2026-08-01 〜 2026-10-24 | **1,050** |
| nikkatsu | 488 | 2023-03-25 〜 2026-09-04 | 0 |
| anime | 452 | 2025-01-24 〜 2026-09-25 | 0 |

- `fanza_response_cache` の `items[].date` も配信日を持つ（§26-5）が、保持7日・要求された作品のみ。

### 台帳との整合

- §5-4（セール情報は API から機械取得できる／`campaign` と価格乖離は完全一致）と、D-1 の「全行 campaign あり・全行 price < list_price」は整合する。
- videoa の archive が未来日付を多く含むことは §18（main sitemap の videoa は未来日付で埋まる）と整合。

### 未確認

- `batch_at` が3つある日の3回目の由来（コード上は1日2回・§5 の偽装ヘッダ実測〔2026-08-22〕に由来する可能性があるが照合していない）。
- 予約作品の発売日が FANZA 側で変更された場合に `released_at` が追随するか（archive は `first_seen_at` / `last_seen_at` で更新されるが、`released_at` の上書き有無は読んでいない）。

### 候補（実施は別便・優先順は付けない）

- 値下がり通知を作品単位で成立させるには、セール外の作品の価格も記録する母集団の拡張が要る（書き込み対象の変更＝本番コード・Supabase 容量の見積りを含む裁定）。
- セール入りの作品単位通知を「初回記録日」で近似するか、`detectNewCampaigns` の名称単位のままにするかの裁定。
- 発売日通知は `sitemap_works_archive.released_at`（videoa の未来日付 1,050件）を起点にできるかの設計検討。

---

## 要別便（書き込みが要ると判明した項目）

- なし（本便の範囲では書き込みを要する確認は無かった）。

## 再現

- GA4: `node management/_metrics/2026-W40/structure-survey-20260929/ga4-works2works.mjs`（リポジトリルートで実行・`app-concierge/ga4-service-account.json` を読む）
- SQL は各節に記載の条件（`fetched_at >= now() - interval '7 days'` 等）。**cache は7日ローリングのため、再実行すると値は変わる。**
