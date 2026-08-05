# `article_products` 投入の起案 — **投入はCSO承認後**

- 起案: **2026-08-05 23:20 〜 23:30 JST**
- 目的: 未稼働の **`article_product_cta`** を起動し、指標①の分子を増やす
- **DB への書き込み・コード変更は一切していない**
- Phase 1 で停止

---

## 1. 表示ラベルの改修可否

### 現状（`articles/[slug]/page.tsx` L288 原文）

```tsx
FANZA で視聴する（{product.content_id}）
```

→ 読者には **「FANZA で視聴する（savr01132）」** と表示される。**作品タイトルは出ない。**

### タイトル取得元の3案

| 案 | 方式 | 実現性 | コード変更 | デプロイ |
|---|---|---|---|---|
| **(a)** | **`article_products` に `title` 列を追加**（nullable）。NULL なら現行どおり content_id 表示＝フェイルセーフ | **可能** | **1行**（`product.title ?? product.content_id`）＋型に1フィールド | **要** |
| (b) | **FANZA API から都度取得** | 可能だが**作品数だけ API 呼び出しが増える**。`fetchItemList` の `cid` は**単一のみ**（`cid?: string`）で、複数 cid の一括取得に非対応。記事7本×1〜3作品なら最大21回/再検証。※cid 取得は 7日 stale キャッシュあり | 中規模（取得層の追加・失敗時フォールバック） | 要 |
| (c) | **works テーブルを参照** | **不成立**。Supabase に works テーブルは存在せず、作品情報は FANZA API 由来（sitemap も API から生成） | — | — |

### 推奨: **(a)**

- **変更規模が最小**（DDL 1本 + レンダラ1行 + 型1フィールド）
- **API 呼び出しが増えない**（記事ページのレンダリングコストが不変）
- **NULL フェイルセーフ**により、列を足しただけの段階では**現行と完全に同じ出力**（B2① の「リンク0件なら現状同一出力」と同じ設計）
- DDL は `article_products` への `alter table … add column title text;`。**Supabase SQL Editor（Chrome 連携）で B2① と同じ経路**で適用可能

### 【重要】ラベル改修と同時に検討すべき表示上の問題

現行ラベルは **「FANZA で視聴する」固定**で、**その作品が「単品購入」なのか「見放題対象」なのかを区別できない**。
台帳の確定ファクト「**見放題は対象作品（2,200本以上）のみ。全部見放題ではない**」に照らすと、
**FANZA TV 系の記事に単品購入作品を並べると「見放題で観られる」と誤認させうる**。

- **見放題対象かどうかを FANZA API から判定できるかは未確認**
- 対応案: ラベルを **「FANZA で作品ページを見る（{title}）」** のように**視聴可否を断定しない文言**へ変更する（改修 (a) と同時に実施可能）

---

## 2. 投入候補

### 【判断】7記事のうち **4記事のみ**を対象とする

CSO 指示「**無関係な作品を並べると読者体験を損なう**」に照らし、**文脈的に作品紹介が成立しない3記事は対象外**とする。

| slug | 判定 | 理由 |
|---|---|---|
| `fanza-first-guide` | **対象** | 「はじめて買う人」向け＝作品紹介が最も自然 |
| `fanza-tv-guide` | **条件付き対象** | 見放題の説明記事。**見放題対象か未確認の作品を置くと誤認リスク**（§1 末尾） |
| `fanza-tv-free-trial` | **条件付き対象** | 同上 |
| `fanza-tv-review` | **条件付き対象** | 同上 |
| `fanza-kaiyaku` | **対象外** | 解約手順の記事。作品紹介の文脈がない |
| `fanza-payment-methods` | **対象外** | 支払い手段の記事。同上 |
| `fanza-payment-statement` | **対象外** | 明細・バレにくさの記事。同上 |

### 投入候補一覧（**works 詳細 HTTP 200 を 2026-08-05 23:27:12 JST に再確認済**）

`article_id` は **slug からのサブクエリで解決**する（UUID を直書きしない）。

| # | 対象記事 slug | content_id | 作品タイトル（本番 h1 実測） | display_order |
|---|---|---|---|---|
| 1 | `fanza-first-guide` | `1dldss00552` | こんなおばさんでもナマでしてくれますか？ 小沢菜穂 | 1 |
| 2 | `fanza-first-guide` | `1dldss00527` | 電撃専属今井美優 あざといくらいがやっぱり可愛くない？この子の魅力、もっと伝えたいー。可能性'無限大'の大人美女。 | 2 |
| 3 | `fanza-first-guide` | `1dldss00515` | 爆乳禁止区域 電撃専属 叶愛 108cm Mcup デカさ、メガトン級 | 3 |
| 4 | `fanza-tv-guide` | `1dldss00528` | '高嶺の花'の完熟期ー。48歳、元秘書。宮上唯依花 Debut 変わらぬ美貌、進化する性欲。 | 1 |
| 5 | `fanza-tv-guide` | `savr01146` | 【VR】ボクっ娘性開発 …（略）… 沙月恵奈 | 2 |
| 6 | `fanza-tv-free-trial` | `savr01157` | 【VR】夜、部下の家で二人っきり、止められない密着不倫。…（略）… 尾崎えりか | 1 |
| 7 | `fanza-tv-free-trial` | `vrkm01864` | 【VR】揺れない！垂れない！ちっぱいがいっぱい！ノーカット8k福袋1081分 | 2 |
| 8 | `fanza-tv-review` | `savr01132` | 【VR】夫婦で妊活治療に訪れた僕を…（略）…ど痴女ナースの爆ヌキ採精室。 | 1 |

- **全8作品が HTTP 200**（`ebwh00359` の404降格を踏まえ投入直前に再確認する運用とする）
- `asp_name` は全件 **`fanza`**
- **`fanza-tv-guide` / `fanza-tv-free-trial` / `fanza-tv-review` の5件は、§1末尾の誤認リスクが未解決の間は投入を保留すべき**。CSO 裁定次第で **`fanza-first-guide` の3件のみ先行**も可能

---

## 3. §6 事前登録（**投入前に確定**）

1. **`article_product_cta` の稼働により指標①の分子が増加する。これは新規 CTA の起動であり、articles 面の流入増加ではない**
2. **投入時刻を JST 秒単位で記録し、前後を分離して集計する**
3. **効果測定は「CTA あたりのクリック率」で見る。** 流入が変わらない中で CTA を足すため、**`guide_tv_signup_cta` からのカニバリが起きる可能性がある**
4. 分子の合計が増えても、**その増分が「新規 CTA の起動」由来か「流入増」由来かを、placement 別の内訳で必ず切り分ける**
5. `fanza-first-guide` は既存 `guide_tv_signup_cta` を1本持つ。**同一記事内で2種の CTA が並ぶため、カニバリの観測対象として最適**

---

## 4. 投入 SQL（B2① rev2 と同じ設計原則・**未実行**）

### 設計原則

**「期待件数どおりでなければ絶対に commit されない」を DB レベルで保証する。人的判断の余地を残さない。**

- `begin;` → `do $ … $;` → `commit;` を **1回の Run で実行**（Supabase SQL Editor は Run ごとに独立リクエストのため）
- DO ブロック内で **事前チェック（冪等性ガード）→ INSERT → 事後検算**。1件でも不一致なら `raise exception` → **自動ロールバック**
- `article_id` は **slug のサブクエリで解決**（UUID 直書きなし）

### APPLY（`fanza-first-guide` の3件のみ先行する版）

```sql
-- STEP 0: 事前確認（読み取り専用・単独 Run）
select
  e.slug,
  count(p.content_id) as product_count
from editorial_articles e
left join article_products p on p.article_id = e.id
where e.publish_status = 'published'
group by e.slug
order by e.slug;
-- 期待: 全 slug で product_count = 0

-- STEP 1: 投入（★この1回の Run で完結させること）
begin;

do $$
declare
  v_article_id uuid;
  v_pre  int;
  v_post int;
begin
  select id into v_article_id
  from editorial_articles
  where slug = 'fanza-first-guide' and publish_status = 'published';

  if v_article_id is null then
    raise exception 'AP ABORT: fanza-first-guide が見つからない（未公開または slug 相違）';
  end if;

  -- 冪等性ガード: 既に行があれば中止（二重投入の防止）
  select count(*) into v_pre from article_products where article_id = v_article_id;
  if v_pre <> 0 then
    raise exception 'AP ABORT (pre-check): 既に % 件存在する。二重投入の疑い', v_pre;
  end if;

  insert into article_products (article_id, content_id, asp_name, display_order) values
    (v_article_id, '1dldss00552', 'fanza', 1),
    (v_article_id, '1dldss00527', 'fanza', 2),
    (v_article_id, '1dldss00515', 'fanza', 3);

  select count(*) into v_post from article_products where article_id = v_article_id;
  if v_post <> 3 then
    raise exception 'AP ABORT (post-check): 投入後の件数が 3 でない actual=%', v_post;
  end if;

  raise notice 'AP OK: fanza-first-guide に % 件投入', v_post;
end
$$;

commit;

-- STEP 2: 事後確認（読み取り専用・単独 Run）
select e.slug, p.content_id, p.asp_name, p.display_order
from article_products p
join editorial_articles e on e.id = p.article_id
order by e.slug, p.display_order;
```

### ROLLBACK

```sql
begin;

do $$
declare
  v_article_id uuid;
  v_n int;
begin
  select id into v_article_id from editorial_articles where slug = 'fanza-first-guide';
  delete from article_products
   where article_id = v_article_id
     and content_id in ('1dldss00552','1dldss00527','1dldss00515');
  get diagnostics v_n = ROW_COUNT;
  if v_n <> 3 then
    raise exception 'AP ROLLBACK ABORT: 削除件数が 3 でない actual=%', v_n;
  end if;
  raise notice 'AP ROLLBACK OK: % 件削除', v_n;
end
$$;

commit;
```

- **削除対象を `content_id` で限定**しているため、他記事・他作品の行は巻き込まない
- TV系3記事も投入する場合は、同じ構造で `slug` と `content_id` を差し替えた版を用意する

### 【前提】列構成の未確認事項

`article_products` の実際の列（NOT NULL 制約・既定値・主キー・`created_at` の有無）は**未確認**（MCP は read-only で切断中のため DDL を読めていない）。
**STEP 0 の直前に `select * from article_products limit 0;` 等で列を確認してから実行する**必要がある。
コードが参照するのは `article_id / content_id / asp_name / display_order` の4列。

---

## 5. CSO 裁定を要する事項

| # | 論点 |
|---|---|
| 1 | **表示ラベルの改修 (a) を実施するか**（`article_products` に `title` 列を追加＋レンダラ1行）。**改修せず投入すると読者には content_id が表示される** |
| 2 | ラベル文言を「FANZA で視聴する」から **視聴可否を断定しない表現**へ変えるか（見放題誤認の回避） |
| 3 | **TV系3記事（5件）を投入するか**、`fanza-first-guide`（3件）のみ先行するか |
| 4 | 投入順序（**ラベル改修を先に済ませてから投入**するか、先に投入して content_id 表示のまま運用するか） |

---

## 6. 実施していないこと

- `article_products` への INSERT・`alter table`
- レンダラ・型定義の変更
- 記事本文の変更

> 本記録は起案と SQL の設計。投入は CSO 承認後。§1・§2 の判断根拠は本番実測とコード読み取りに基づく。
