# `article_products` 既存10行の調査 — **全件が PoC のモックデータ**

- 実施: **2026-08-06 00:15 〜 00:22 JST**
- **読み取り専用。DELETE / UPDATE / INSERT は一切行っていない**
- 判断・提案は書かない（事実の転記のみ）
- Phase 1 で停止

---

## 1. 全10行の内訳（実測・全件）

`select p.content_id, e.slug, e.publish_status, p.display_order, p.created_at …` の結果（**10 rows**）:

| # | content_id | slug（`editorial_articles`） | publish_status | display_order | created_at (JST) |
|---|---|---|---|---|---|
| 1 | `mockcid001` | `mock-poc-article-001` | **draft** | 1 | 2026-06-30 01:44:44 |
| 2 | `mockcid002` | `mock-poc-article-002` | **draft** | 1 | 2026-06-30 01:44:44 |
| 3 | `mockcid003` | `mock-poc-article-003` | **draft** | 1 | 2026-06-30 01:44:44 |
| 4 | `mockcid004` | `mock-poc-article-004` | **draft** | 1 | 2026-06-30 01:44:44 |
| 5 | `mockcid005` | `mock-poc-article-005` | **draft** | 1 | 2026-06-30 01:44:44 |
| 6 | `mockcid006` | `mock-poc-article-006` | **draft** | 1 | 2026-06-30 01:44:44 |
| 7 | `mockcid007` | `mock-poc-article-007` | **draft** | 1 | 2026-06-30 01:44:44 |
| 8 | `mockcid008` | `mock-poc-article-008` | **draft** | 1 | 2026-06-30 01:44:44 |
| 9 | `mockcid009` | `mock-poc-article-009` | **draft** | 1 | 2026-06-30 01:44:44 |
| 10 | `mockcid010` | `mock-poc-article-010` | **draft** | 1 | 2026-06-30 01:44:44 |

`asp_name` は全件 **`fanza`**、`title` は全件 **NULL**（DDL で追加した直後のため）。

**`id` / `article_id`（UUID）も全件取得済み**。以下は同一クエリの1回目実行で取得した対応（`content_id` → `article_id`）:

| content_id | article_id |
|---|---|
| `mockcid001` | `86a8632d-ef9d-485b-a51d-8675ff1bd6a8` |
| `mockcid002` | `8c5b84db-f11f-4805-ac9f-7bc29da83821` |
| `mockcid004` | `6388d5ed-c10c-49b9-a8bb-51cd29c74e22` |
| `mockcid005` | `2ece6d8a-78a6-4056-8331-f2f2d8000357` |
| `mockcid006` | `b7e73ea4-943f-4347-a091-4da68b637f8f` |
| `mockcid007` | `98f986e7-79ad-4036-8983-63d3b10b0ab2` |
| `mockcid008` | `e572df98-6900-4a18-b411-75fbcb61a199` |
| `mockcid009` | `035fbb1e-751a-4de8-81c7-7611e9b1afb9` |
| `mockcid010` | `07fdfd82-a314-4c85-bc5b-d1096d085602` |

（`mockcid003` の `article_id` は1回目の表示で画面外。2回目のクエリで `slug=mock-poc-article-003` として存在を確認済み）

---

## 2. `article_id` ごとの件数と `editorial_articles` との対応

| 項目 | 結果 |
|---|---|
| `article_id` の種類 | **10種**（1 article_id につき **1行**ずつ） |
| **孤児行（`editorial_articles` に対応が無い行）** | **0件**。10行すべてが `editorial_articles` の行と `LEFT JOIN` で対応した |
| 対応先の slug | **`mock-poc-article-001` 〜 `mock-poc-article-010`** |
| 対応先の publish_status | **全件 `draft`** |

---

## 3. `created_at` の分布

- **全10行が `2026-06-30 01:44:44 JST` で完全に同一**
- → **まとめて一括投入されたもの**（個別投入ではない）

---

## 4. `content_id` の実在確認

`content_id` は **`mockcid001` 〜 `mockcid010`** であり、**FANZA の実 content_id の書式ではない**（実物は `savr01132` / `1dldss00552` / `vrkm01864` 等）。

works 詳細 URL は `app.vodnavi.jp/works/videoa/mockcid001` の形になるが、**本調査では HTTP 確認を実施していない**
（`content_id` がモック値であることが確定しており、実作品への対応が存在しないため）。
→ **実在確認の必要な行として扱うべき対象は無い**という事実のみ記録する。

---

## 5. 描画されていない理由（機械的確認）

レンダラの条件（`app/(site)/articles/[slug]/page.tsx` / `lib/editorial-articles.ts`）:

```ts
// getPublishedArticleBySlug
.from("editorial_articles")
.eq("slug", slug)
.eq("publish_status", "published")   // ← ここ
.maybeSingle();
// → article が null なら notFound()、products も取得されない
```

```tsx
{article.products.length > 0 && ( … <FanzaAffiliateLink placement="article_product_cta"> … )}
```

**除外されている条件は `publish_status = 'published'` のフィルタ。**

- 10行が紐づく `mock-poc-article-001〜010` は**すべて `publish_status = 'draft'`**
- `getPublishedArticleBySlug` は `.eq("publish_status","published")` を課すため、**draft 記事は取得されない**
- したがって **draft 記事に紐づく `article_products` の行は、そもそも読み込まれない**
- 公開済みの7記事（`fanza-*`）に紐づく行は **0件**だったため、`article.products.length > 0` が成立せず、
  「この記事で紹介した作品」セクションは**全7記事で描画されない**

→ **`article_product_cta` が本番で0件だった原因の内訳が確定した**:
**① 公開7記事には行が1件も無い（＝データ未投入）／② 既存10行は draft 記事に紐づく PoC モックで、レンダラの `published` フィルタで除外されている。**

---

## 6. 先の検算が失敗した理由（事実）

投入 SQL の事後検算に含めた条件のうち

```sql
if (select count(*) from article_products) <> 3 then raise exception … end if;
```

は「**テーブル全体が 3 件**」を要求していた。実際は **既存10行 + 投入3行 = 13** となり条件不成立、
`AP ABORT (post-check): 全体件数が 3 でない actual=13` で **例外 → 自動ロールバック**した。

- **`fanza-first-guide` に対する事前チェック（当該記事の行数 = 0）は通過している**
- **3行の INSERT は取り消されており、DB は投入前の状態（10行）のまま**
- この条件は、CTO が「本番で全記事0件描画」から**テーブルが空であると推定**して設定したものであり、**その推定が誤りだった**

---

> 本記録は読み取り結果の転記のみ。既存10行の扱い（削除の要否等）についての判断・提案は記載していない。
