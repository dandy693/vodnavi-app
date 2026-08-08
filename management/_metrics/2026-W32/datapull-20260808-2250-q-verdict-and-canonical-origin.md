# Q 効果測定の判定と、代替canonical / 検出未登録 増加の差分洗い出し

- 実施: **2026-08-08 22:30 〜 23:00 JST**（PowerShell / GSC 実測）
- **読み取りのみ**。コード変更・設定変更・URL送信のいずれも行っていない
- **判断は加えず、事実のみ**。§2 は運用則7に従い**仮説を立てる前に差分を列挙**した
- Phase 1 で停止

---

# 1. §6 予測の判定（観測結果として記録）

| 項目 | 内容 |
|---|---|
| 予測（§6事前登録） | **「Q 適用で代替canonicalは減少する」** |
| 実測 | **1,829（7/24） → 2,000（8/05）= +171** |
| **判定** | **不支持** |

- **Q の実装自体は完了している**（`4467594` 2026-07-29 23:58 JST・PR #61）。**予測が外れただけであり、実装の撤回・巻き戻しの対象ではない**
- Q が意図した効果は **archive 側では実現している**（§2-4 の実測）。減少しなかったのは **sitemap 本体側**に同じ形の URL が残っているため（§2-3）

---

# 2. 増加の原因調査（運用則7: 差分の機械的洗い出しを先行）

## 2-1. 「検出 - インデックス未登録」 607 → 1,067（**+460**）の内訳

上位500件（1,067件中／GSC のドリルダウン上限は1,000件）を機械集計:

| セグメント | 件数 | 構成比 |
|---|---|---|
| **`/works/`** | **355** | 71.0% |
| `/actresses/` | 138 | 27.6% |
| `/genres/` | 7 | 1.4% |
| `/articles/` | **0** | 0% |

works の floor 内訳:

| floor | 件数 |
|---|---|
| **`amateur`** | **234**（works の 65.9%／サンプル全体の 46.8%） |
| `nikkatsu` | 62 |
| `videoa` | 35 |
| `anime` | 24 |

- **前回のクロール = 「該当なし」が 500件中 500件（100%）**＝**まだ1度もクロールされていない**
- URL 例（原文）:
  `https://app.vodnavi.jp/actresses/1000626` / `.../actresses/1001982` / `.../actresses/1002304` /
  `.../actresses/1009247` / `.../actresses/1009531` / `.../actresses/1012030` /
  `https://app.vodnavi.jp/works/amateur/1dldss00515` / `.../works/amateur/1dldss00521` /
  `.../works/amateur/1dldss00527` / `.../works/videoa/1fns00230` / `.../works/videoa/1ftht00345`

## 2-2. 「代替ページ（適切な canonical タグあり）」 1,829 → 2,000（**+171**）の内訳

上位500件（2,000件中）を機械集計:

| セグメント | 件数 | 構成比 |
|---|---|---|
| **`/works/amateur/`** | **456** | **91.2%** |
| **`/concierge?source=…&intent=…&seed_cid=…`** | **44** | 8.8% |
| `/works/` の amateur 以外 | **0** | 0% |
| `/articles/` | **0** | 0% |

- URL 例（原文・works）:
  `https://app.vodnavi.jp/works/amateur/okzu00049` / `.../amateur/enki00098` / `.../amateur/mfyd00193` /
  `.../amateur/1sw01064` / `.../amateur/gma00100` / `.../amateur/rlmp00006` / `.../amateur/mdtm00883` /
  `.../amateur/h_1664spz01178` / `.../amateur/snos00335` / `.../amateur/tikb00225`
- URL 例（原文・concierge）: `https://app.vodnavi.jp/concierge?source=brand` / `.../concierge?source=moterist` /
  `.../concierge?source=app_detail&intent=re_recommend&seed_cid=…`（22件）/ `.../concierge?source=app_direct&intent=actress&seed_cid=…`（20件）
- **前回のクロール日**（上位500件・降順ソート）: **2026/07/08 〜 2026/08/06 に分布**。うち **7/24 以降が 168件（33.6%）**。日別の最多は **7/30 = 75件**、次いで 7/08 = 72件 / 7/16 = 53件 / 7/15 = 50件 / 7/17 = 40件 / 7/31 = 28件 / 8/02 = 18件

## 2-3. 増えた URL の供給元 —— 本番 sitemap の実測（2026-08-08 22:47:59 JST 取得）

### `https://app.vodnavi.jp/sitemap.xml`（HTTP 200 / loc 2,963）

| セグメント | 件数 |
|---|---|
| works | 1,600 |
| actresses | 1,148 |
| genres | 200 |
| articles | **7** |
| その他（トップ・`?floor=` 4本・about/privacy/disclaimer） | 8 |

works の floor 内訳:

| floor | 件数 |
|---|---|
| **`amateur`** | **400** |
| `anime` | 400 |
| `nikkatsu` | 400 |
| `videoa` | 400 |

→ **sitemap 本体は現在も `/works/amateur/` を 400 URL 出力している。**

### `https://app.vodnavi.jp/sitemap-archive.xml`（HTTP 200 / loc 2,146）

| floor | 件数 |
|---|---|
| `videoa` | 1,256 |
| `nikkatsu` | 471 |
| `anime` | 419 |
| **`amateur`** | **0** |

→ **archive 側の amateur は 0件**（Q 実装前の 2026-07-29 実測は 887行）。**Q は archive 側では効いている。**

### コード上の差分（原文）

`4467594`（Q）が変更したのは **`app/sitemap.ts` の1行のみ**:

```diff
-            floor_code: floor.code,
+            floor_code: floor.apiFloor ?? floor.code,
```

一方 sitemap 本体の URL 生成は `lib/sitemap-builder.ts:98`:

```ts
const path = `/works/${floor.code}/${item.content_id}`;
```

→ **`floor.code` を直接使用しており、Q の変更は本体の出力に一切触れていない。**
これは `STRATEGY_BRIEF_128` Q-2 の記述と一致する（原文）:
「floor正規化後も sitemap 本体に amateur 400 は残る＝**R2（worksループで amateur スキップ）は引き続き必要**」

### canonical の実装状態（実測）

| URL | HTTP | canonical |
|---|---|---|
| `https://app.vodnavi.jp/works/amateur/mfyd00193` | 200 | **`https://app.vodnavi.jp/works/videoa/mfyd00193`** |
| `https://app.vodnavi.jp/works/videoa/mfyd00193` | 200 | `https://app.vodnavi.jp/works/videoa/mfyd00193`（自己参照） |

→ **canonical タグは正しく videoa を指している**。GSC が「代替ページ（適切な canonical タグあり）」に分類しているのはこの状態を指す。

## 2-4. 供給元の分類（sitemap / 内部リンク / 外部）

| 経路 | 実測 |
|---|---|
| **sitemap 経由** | `/works/amateur/` **400 URL** が sitemap 本体に現存。`/concierge?…` は sitemap に**含まれない**（loc 一覧に concierge は0件） |
| **内部リンク経由** | `/concierge?source=app_detail&intent=re_recommend&seed_cid=…` / `?source=app_direct&intent=actress&seed_cid=…` は **works 詳細に設置された `ConciergeCtaLink` が生成するクエリ付き URL** と同型。sitemap 非収録のため**内部リンクからの発見以外の経路が実測上ない** |
| **外部経由** | 本調査では**確認していない**（参照元の特定手段を用いていない） |

---

# 3. B2 デプロイとの時系列照合

| 時刻(JST) | 事象 |
|---|---|
| 2026-07-29 23:58 | **Q**（`4467594` archive floor 正規化）コミット |
| 2026-08-02 22:18:52 | **B2① デプロイ**（記事本文の内部リンク描画） |
| 2026-08-02 23:19:32 | **B2① リンク投入**（13リンク） |
| 2026-08-03 06:15:20 | **B2②-a デプロイ**（works/actresses → articles 導線） |
| 2026-08-05 | GSC「ページのインデックス登録」データの最終日 |

→ GSC の 8/05 までのデータは**上記すべてを含む期間**である。

## 内部リンク追加により新たに検出された URL があるか

| 確認 | 実測 |
|---|---|
| B2①・B2②-a が追加したリンクの**リンク先** | いずれも既存の **`/articles/<slug>`**（sitemap 収録済み・**7 URL**）。**新規 URL を生成しない** |
| 「検出 - インデックス未登録」500件中の `/articles/` | **0件** |
| 「代替canonical」500件中の `/articles/` | **0件** |
| sitemap の articles 件数 | **7**（B2 前後で増減の記録なし） |

→ **B2①・B2②-a に起因して新たに GSC へ現れた URL は、本調査のサンプル範囲では確認できない。**

## 併記（時系列の一致のみ・因果は未確定）

- 代替canonical 上位500件の**前回クロール日の最多は 2026/07/30 の 75件**で、これは **Q コミット（7/29 23:58 JST）の翌日**にあたる
- **時系列の一致のみを記録する。因果は本記録では確定していない**

---

# 4. 取得できなかったこと（明記）

| 項目 | 理由 |
|---|---|
| 1,067件・2,000件の**全件**内訳 | GSC のドリルダウンは**1,000件が上限**、1ページ最大500件。本記録は各**上位500件**のサンプル |
| 「前回のクロール」のソート順の仕様 | 画面表示は「前回のクロール ↓」だが、ページサイズ変更後の並び順は**未検証** |
| 外部経由での URL 発見の有無 | 参照元を特定する手段を用いていない |
| `sitemap_works_archive` の 887行 UPDATE（BRIEF_128 提案）の適用有無 | **Supabase MCP が Unauthorized** で DB を直接読めない（既知事象）。ただし配信中の `sitemap-archive.xml` の amateur が **0件**であることは実測済み |
| 7/24〜8/5 の GSC 日次推移 | レポートは最終日の値のみ表示。日別の増減は取得していない |

---

> 本記録は数値と差分の転記のみ。原因の断定・評価・提案は記載していない。
