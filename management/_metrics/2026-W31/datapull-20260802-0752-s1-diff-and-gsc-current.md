# S1計装の不良調査（差分の機械的洗い出し） / GSC現況の再取得【CSO指示・8/2】

- 取得実施: **2026-08-02 07:28 〜 07:52:49 JST**(PowerShell 実測)
- 取得元: ソース=ローカルリポジトリ(`main` / `8fdd300`) / 本番HTML・JSチャンク=PowerShell `Invoke-WebRequest` / GA4=authuser=1 p489519780 / GSC=同アカウント
- **修正の実装は行っていない**（原因特定の報告後にCSO承認を得てから）。Phase 1 で停止

---

# A. S1計装の不良調査

> 運用則7に従い、**仮説を立てる前に差分の機械的洗い出しを完了**させた。以下 §A-1〜§A-4 はすべて実測の列挙であり、原因の断定は §A-5 に分離する。

## A-1. 呼び出し側 props の差分（ソースコード実測）

| 項目 | works詳細 `works/[floor]/[id]/page.tsx` | 一覧系 `components/product-card.tsx` |
|---|---|---|
| 呼び出し箇所 | L310 / L465 / L529 / L673（**4箇所**） | L139（**1箇所**） |
| **呼び出し元コンポーネントの種別** | **Server Component**（`"use client"` なし） | **Client Component**（1行目 `"use client"`） |
| `href` | `fanzaAffiliate.primaryUrl`（buildAffiliateURL 経由・af_id=004） | `item.affiliateURL ?? item.URL`（API 返却・af_id=990） |
| **`placement`** | **文字列リテラル直書き**（`"detail_fv_cta"` / `"detail_main_cta"` 等） | **式**：`surface ? SURFACE_PLACEMENT[surface] : "list_card_cta"` |
| `content_id` | `item.content_id` | `item.content_id` |
| `title` | `item.title` | `item.title` |
| `floor_code` | `floor`（ルートパラメータ） | `normalizeFloorForUrl(item.floor_code)` |
| `className` | `cn(...)` | `cn(...)` |
| **`aria-label`** | **渡していない** | **渡している**（L153 `aria-label={...}`） |

**`aria-label` に関する実測**: `fanza-affiliate-link.tsx` L21-54 の分割代入は `href / content_id / title / floor_code / placement / className / children` の**7つのみ**で、`aria-label` は受け取られず `<a>` にも付与されない。本番SSR HTML でも一覧系CTAアンカーに `aria-label` は **0件**（§A-3）。→ **計測経路とは無関係**

## A-2. placement の受け渡し経路（実測）

**コード経路**
1. `app/(site)/page.tsx` L273: `<ProductGrid items={items} surface="top" />`
2. `app/(site)/genres/[id]/page.tsx` L265: `surface="genres"`
3. `app/(site)/actresses/[id]/page.tsx` L264: `surface="actresses"`
4. `components/product-grid.tsx` L19: `<ProductCard item={item} priority={idx<4} surface={surface} />`
5. `components/product-card.tsx` L144: `placement={surface ? SURFACE_PLACEMENT[surface] : "list_card_cta"}`
6. `components/fanza-affiliate-link.tsx` L61-80: `onClick` で `trackProductClick({... placement ...})` と `trackAiAffiliateClick({... placement ...})` を発火

**本番HTML実測（RSCフライトペイロード内の `surface` prop）**

| ページ | `surface` prop の出現 | 「今すぐ視聴」の出現 | 一致 |
|---|---|---|---|
| `/`（トップ） | **`top` × 23** | **23** | ✓ |
| `/genres/6925` | **`genres` × 21** | **21** | ✓ |
| `/actresses/1078618` | **`actresses` × 28** | **28** | ✓ |

→ **`surface` prop は全カードに漏れなく伝播している**

## A-3. placement が undefined になり得るか（実測）

- コード上、`placement` は三項式で必ず値が入る。`surface` が `undefined` の場合でもフォールバック `"list_card_cta"` が代入されるため、**`undefined` になる経路はソース上に存在しない**
- 本番では `surface="top"` が23件伝播しているため、`SURFACE_PLACEMENT["top"] = "list_top_card_cta"` が確定的に選択される
- **本番配信JSチャンク内の文字列検出**（トップページが読み込む16チャンクを全走査）:

| 文字列 | 検出 |
|---|---|
| `list_top_card_cta` | **あり**（`14u~hafahta35.js`） |
| `list_genres_card_cta` | **あり**（同上） |
| `list_actresses_card_cta` | **あり**（同上） |
| `list_card_cta` | **あり**（同上） |
| `fanza_affiliate` | **あり**（同上） |
| `ai_affiliate_click` / `product_click` | **あり**（`0c29k_rjgt_-z.js`） |

→ **S1 のコードと placement 文字列は本番トップに配信済み**

## A-4. その他の機械的差分

**(a) 本番SSR HTML のアンカータグ（両者ともイベントハンドラ属性なし＝Reactの通常挙動）**

| | トップ（一覧系CTA） | works詳細CTA |
|---|---|---|
| `target` | `_blank` | `_blank` |
| `rel` | `nofollow noopener noreferrer sponsored` | `nofollow noopener noreferrer sponsored` |
| `onclick` 属性 | 0 | 0 |
| `data-*` 属性 | 0 | 0 |
| `aria-label` 属性 | **0** | 0 |

→ **SSR マークアップに構造差はない**

**(b) バンドル配置と RSC クライアント境界の差分**

| 項目 | works詳細 | トップ |
|---|---|---|
| placement 文字列のクライアントチャンク内存在 | **なし**（Server Component でサーバ評価→RSCペイロード経由） | **あり**（`14u~hafahta35.js`） |
| `FanzaAffiliateLink` 本体の所在チャンク | `04f3qzwe9bwq2.js` | `14u~hafahta35.js` |
| **RSC クライアント参照として登録されるコンポーネント** | **`FanzaAffiliateLink`**（+ Image / Separator / ConciergeCtaLink / ConciergeCtaPanel） | **`ProductCard`**（+ SearchForm / FilterBar）。**`FanzaAffiliateLink` は登場しない**（ProductCard 内部に取り込まれるため） |

**(c) デプロイ同一性**

- `/` `/works/videoa/vrkm01890` `/genres/6925` `/actresses/1078618` の**全4ページで `dpl_7vUHSbUpNmRoefgemMFE4iUrFWhz` と同一** → 面ごとに別デプロイという事象ではない

**(d) GA4 実績（S1デプロイ 2026-07-31 06:27:51 以降の全期間 = 7/31〜8/2、hostname 完全一致、全32行を走査）**

placement 値が観測されたのは以下のみ:

| placement | ai_affiliate_click | product_click |
|---|---|---|
| `detail_sample` | 13 | 13 |
| `detail_fv_cta` | 7 | 7 |
| `detail_main_cta` | 4 | 4 |
| `detail_sticky_cta` | 1 | 1 |
| `mid_session`（early_cookie_burn） | — | — |

- **`list_top_card_cta` / `list_genres_card_cta` / `list_actresses_card_cta` / `list_card_cta` は全32行に1件も存在しない**
- → **S1計装はデプロイ後3日間で一度も発火していない**

## A-5. 差分列挙の結論（事実のみ）

**確認できたこと（すべて正常）**
1. `surface` prop は全カード（トップ23 / genres21 / actresses28）に伝播している
2. `placement` が `undefined` になる経路はソース上に存在しない
3. placement 文字列4種は本番配信JSチャンクに含まれている
4. SSRアンカーの構造は works詳細と同一（`target`/`rel`/クラスのみ）
5. デプロイIDは全面同一

**works詳細と異なる点（列挙）**
| # | 差分 |
|---|---|
| 1 | 呼び出し元が **Client Component**（works詳細は Server Component） |
| 2 | `placement` が**式**（works詳細は文字列リテラル） |
| 3 | RSC クライアント境界が **`ProductCard`**（works詳細は `FanzaAffiliateLink` 自身） |
| 4 | placement 文字列が**クライアントチャンクに載る**（works詳細はRSCペイロード経由） |
| 5 | `aria-label` を渡している（受け取られず `<a>` に到達しない） |
| 6 | `href` の af_id が 990（works詳細は 004） |

**原因は未特定**。上記1〜6のいずれも、それ単独では「onClick が発火しない」ことを機械的に説明しない。SSR マークアップ・バンドル内容・prop 伝播はいずれも正常であり、**実際のブラウザ上でハンドラが登録されているか（ハイドレーションの成否）を確認する検証が未実施**である。

**未実施の検証（次段で必要・CSO承認事項）**
- 実ブラウザでトップページのCTAに React の click ハンドラが登録されているかの確認
- クリック時に `dataLayer` / `gtag` に `product_click` が積まれるかの確認
  - ※台帳既知: 検証用Chromeは GA4 `/g/collect` を送信しないため、**GA4計上での検証は不可**。`dataLayer` への push までを確認対象とする必要がある
- 標本数の注記: S1デプロイ後の一覧系CTAクリックは **DMM 990 で 8/1 の1件のみ**（7/25〜7/31 は0、8/2は未取得）。**「発火しなかった」の標本は現時点で n=1**

---

# B. GSC 現況の再取得（app.vodnavi.jp）

## B-1. データ範囲と最終更新日【最重要】

**同一プロパティ内でレポートごとに更新状況が異なることを実測で確認した。**

| レポート | 最終更新日 | データ範囲 |
|---|---|---|
| **検索パフォーマンス** | **5.5 時間前**（= 2026-08-02 未明） | **2026年7月3日〜7月30日**（28日間指定時） |
| **ページのインデックス登録** | **2026/07/24**（画面表示のまま） | 〜2026-07-24 |

→ 従前の「7/24停止」は **「ページのインデックス登録」レポートの停止**であり、**検索パフォーマンスは停止していない**（前回記録 §2-4 の訂正を、さらに精緻化する）

## B-2. 現在値（= 2026/07/24 時点の値。以降更新なし）

| 指標 | 現在値 |
|---|---|
| **登録済み** | **12,538** |
| **未登録** | **4,695**（理由7件） |

### 理由別内訳（全7件・原文転記）

| 理由 | ソース | 確認 | ページ数 |
|---|---|---|---|
| **代替ページ（適切な canonical タグあり）** | ウェブサイト | 開始前 | **1,829** |
| 見つかりませんでした（404） | ウェブサイト | 開始前 | **787** |
| robots.txt によりブロックされました | ウェブサイト | 開始前 | **648** |
| 検出 - インデックス未登録 | Google システム | 合格 | **607** |
| クロール済み - インデックス未登録 | Google システム | 失敗しました | **595** |
| 重複しています。Google により、ユーザーがマークしたページとは異なるページが正規ページとして選択されました | Google システム | 失敗しました | **228** |
| noindex タグによって除外されました | ウェブサイト | 開始前 | **1** |
| **合計** | — | — | **4,695** |

## B-3. 7/24 値との比較

| 指標 | 台帳の7/24値 | 今回取得値 | 差分 |
|---|---|---|---|
| 未登録 | 4,700 | **4,695** | −5（※台帳値は概数「4,700」表記） |
| **代替ページ（適切な canonical タグあり）** | **1,829** | **1,829** | **±0** |
| 見つかりませんでした（404） | 787 | **787** | **±0** |
| robots.txt によりブロックされました | 648 | **648** | **±0** |
| noindex タグによって除外されました | 1 | **1** | **±0** |
| クロール済み - インデックス未登録 | 504（※6月診断時の値） | **595** | 台帳値の取得時点が異なるため単純比較不可 |
| 重複（別ページを正規選択） | 2 URL（※6月診断時の値） | **228** | 同上 |
| 検出 - インデックス未登録 | （台帳に記載なし） | **607** | — |

### 代替canonical 1,829 の推移（§6予測の検証）

- **1,829 → 1,829 で変化なし**
- **推移が観測できない理由（実測）**: 「ページのインデックス登録」レポートの**最終更新日が 2026/07/24 のまま**であり、**7/24以降の新しいデータが1日分も生成されていない**。したがって取得値は 7/24 時点値そのものであり、**§6予測の検証は現時点では実施不能**
- 検索パフォーマンスは 7/30 まで更新されているため、**プロパティ全体の停止ではなく、インデックス作成レポート系のみの停止**である

## B-4. サイトマップの状態（同画面の表示）

- 登録サイトマップ: `https://app.vodnavi.jp/sitemap-archive.xml` / `https://app.vodnavi.jp/sitemap.xml`
- **最終更新日: 2026/07/24**（両サイトマップの読み取り日も同日で停止）

---

> 本記録は事実の転記のみ。原因の断定・修正提案は記載していない（§A-5 に「原因は未特定」と明記）。
