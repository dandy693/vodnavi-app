# 既存7記事の広告表記点検 / 未稼働 CTA の起動可否調査

- 実施: **2026-08-05 22:54:59 〜 22:58 JST**（本番実測・コード読み取り）
- **コード変更・DB 書き込みはしていない**
- Phase 1 で停止

---

## 1. 広告表記の点検（全7記事）— **7/7 で表記あり・欠落 0件**

全記事で **同一の2箇所**に表記が存在する（共通レイアウト由来）。

| 設置位置 | 文言（原文） |
|---|---|
| **ページ最上部**（`<h1>` より上・ヘッダ直下） | **「本サイトはアフィリエイト広告（PR）を含みます」** |
| **フッター** | **「当サイトは FANZA 公式アフィリエイトプログラムに参加し、商品情報API v3.0 を利用して作品情報をアフィリエイト広告（PR）として表示しています。すべての作品の閲覧・購入は FANZA 公式サイト上で行われます。運営: VODNavi運営事務局」** |

### 記事別の検出数（本文テキスト抽出後にキーワード計数）

| slug | 「広告」 | 「PR」 | 「アフィリエイト」 | 判定 |
|---|---|---|---|---|
| `fanza-first-guide` | 2 | 4 | 3 | **あり** |
| `fanza-tv-guide` | 2 | 4 | 3 | **あり** |
| `fanza-tv-free-trial` | 2 | 4 | 3 | **あり** |
| `fanza-tv-review` | 2 | 4 | 3 | **あり** |
| `fanza-kaiyaku` | 2 | 4 | 3 | **あり** |
| `fanza-payment-methods` | 2 | 4 | 3 | **あり** |
| `fanza-payment-statement` | 2 | 4 | 3 | **あり** |

- **表記がない記事: 0件**（CSO 指示の「残5記事」も含め全件で確認）
- 検出数が全記事で同一なのは、**表記が記事本文ではなく共通レイアウトに実装されている**ため
- ※`<title>` にも同文が含まれるため「広告」の計数に重複が入っている（表示上は最上部とフッターの2箇所）

→ **修正を要する記事はない。**

---

## 2. `article_product_cta` が 0件の原因 — **確定：データ未投入**

### コードの実装（`articles/[slug]/page.tsx` L264-）

```tsx
{article.products.length > 0 && (
  <section …>
    <h2>この記事で紹介した作品</h2>
    …
      <FanzaAffiliateLink … placement="article_product_cta">
```

**`article.products.length > 0` のときだけセクション全体が描画される**（条件付きレンダリング）。

### データの取得元（`lib/editorial-articles.ts` L58-）

```ts
const { data: products } = await supabase
  .from("article_products")
  .select("content_id, asp_name, display_order")
  .eq("article_id", a.id)
  .order("display_order", { ascending: true });
…
products: (products as EditorialArticleProduct[] | null) ?? [],
```

### 本番実測

見出し「**この記事で紹介した作品**」の出現数:

| slug | 出現 |
|---|---|
| `fanza-first-guide` | **0** |
| `fanza-tv-guide` | **0** |
| `fanza-tv-review` | **0** |
| `fanza-payment-methods` | **0** |

→ **原因は「設置されていない」でも「発火しない」でもなく、`article_products` テーブルに行が1件も無いこと。**
**コードは実装済みで稼働可能**であり、**行を INSERT すれば即座に描画される**。

### 【CSO の問いへの回答】既存記事に `article_product_cta` を追加できるか → **できる**

- **新規記事を待たずに分子を増やせる**
- 必要な作業は **`article_products` への INSERT のみ**（コード変更・デプロイ不要）
- 投入する値は **`article_id` / `content_id` / `asp_name` / `display_order`** の4列。**af_id 入り URL は保存しない**（描画時に `buildAffiliateURL` が生成する設計）
- 実行経路: **Supabase SQL Editor（Chrome 連携）**。MCP は `--read-only` のため不可（B2① と同じ経路）
- **前提条件**: 紐づける `content_id` の works 詳細が **HTTP 200** を返すこと（7/24 `ebwh00359` の 404 前例）。**表示ラベルが `content_id` そのもの**である点も要確認（コード L288: `FANZA で視聴する（{product.content_id}）`）

---

## 3. `guide_tvplus_add_cta` のマーカー投入条件

| 項目 | 状態 |
|---|---|
| レンダラ | **実装済み**（`articles/[slug]/page.tsx` L170: `if (p === "[[CTA:tvplus_add]]")`） |
| マーカー | **記事本文に未投入**＝本番 0件 |
| 投入方法 | 記事本文（`editorial_articles.body`）に **`[[CTA:tvplus_add]]`** を単独段落として置くだけ |
| URL ビルダ | `buildTvPlusAddURL()`。af_id は `NEXT_PUBLIC_TVPLUS_ADD_AFFILIATE_ID` があればそれ、無ければ **004 へフォールバック** |
| **ブロッカー** | `url-builder.ts` に**「HUMAN 実査①（TV Plus 追加手続きの実画面 URL）確認後、公開前にこの定数を実査確認 URL へ更新する（未確認パスのままの公開は不可）」**と明記。現行の着地先は `premium.dmm.co.jp` ルート（＝`tv_signup` と同一）で、**TV Plus 追加手続きの画面ではない** |

→ **マーカー投入だけなら即可能だが、コード上の禁則により「実査前の公開は不可」。**
実査結果は本日の探索では得られなかった（`datapull-20260805-2300-tvplus-help-search.md`）。

---

## 4. 稼働状況まとめ（指標①の分子・4種）

| placement | 実装 | 本番の発火 | 起動に必要なもの |
|---|---|---|---|
| `guide_tv_signup_cta` | 済 | **稼働**（tv-guide 2 / tv-review 2 / first-guide 1） | — |
| `article_product_cta` | 済 | **0件** | **`article_products` への INSERT のみ**（コード変更不要） |
| `guide_tvplus_add_cta` | 済 | **0件** | 記事本文へのマーカー投入 ＋ **HUMAN 実査（禁則）** |
| `article_sale_cta` | 済 | **0件** | 記事本文へのマーカー投入（候補Bの記事） |

→ **最も早く分子を増やせるのは `article_product_cta`**（コード変更もデプロイも不要）。

---

> 本記録は事実の転記のみ。判断・評価・提案は書いていない（§2 の「回答」は CSO の問いに対する事実の提示）。
