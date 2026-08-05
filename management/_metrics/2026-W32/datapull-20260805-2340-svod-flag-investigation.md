# 見放題判定の調査（TV系投入の前提）— **API に判定フィールドは存在しない**

- 実施: **2026-08-05 23:35 〜 23:40 JST**
- 手段: 型定義の読み取り + **FANZA API `ItemList` への実呼び出し 1回**（`cid=1dldss00552`）
- **調査のみ。判断は加えない**
- Phase 1 で停止

---

## 1. FANZA API の返却に見放題フィールドはあるか → **無い**

### 実呼び出しの結果（HTTP 200 / result_count 1）

**トップレベルのキー（実返却の全一覧）**

```
service_code, service_name, floor_code, floor_name, category_name,
content_id, product_id, title, volume, URL, affiliateURL,
imageURL, sampleImageURL, sampleMovieURL, prices, date, iteminfo
```

**`prices` の全文（原文）**

```json
{
  "price": "2480~",
  "list_price": "2480~",
  "deliveries": {
    "delivery": [
      { "type": "4k",        "price": "3980", "list_price": "3980" },
      { "type": "hd",        "price": "2980", "list_price": "2980" },
      { "type": "download",  "price": "2480", "list_price": "2480" },
      { "type": "iosdl",     "price": "2480", "list_price": "2480" },
      { "type": "androiddl", "price": "2480", "list_price": "2480" }
    ]
  }
}
```

### キーワード含有チェック（返却 JSON 全体を対象）

| 検索語 | 含有 |
|---|---|
| `見放題` | **false** |
| `月額` | **false** |
| `monthly` | **false** |
| `svod` | **false** |
| `subscription` | **false** |
| `premium` | **false** |
| `chsub` | **false** |
| `vod` | **false** |

### 型定義との照合

`src/lib/fanza/types.ts` の `DmmItem` / `DmmPrices` / `DmmDelivery` にも
見放題・月額・サブスクリプションを示すフィールドは**定義されていない**。

```ts
export interface DmmDelivery {
  type: string;        // 実返却は 4k / hd / download / iosdl / androiddl
  price: string;
  list_price?: string;
}
```

→ **`deliveries.delivery[].type` は「配信フォーマット（画質・DL方式）」であり、
見放題対象か否かを示すものではない。** 実返却の5値はすべて**単品購入の価格**を伴う。

### 補足（本番ページの「見放題」表示について）

`app.vodnavi.jp/works/videoa/1dldss00552` に「見放題」「月額」の文字列が各4回出現するが、
その出所は **`src/components/new-user-fv-module.tsx` L62 の固定文**
（「・見放題派には月額550円のFANZA TVも（いま登録すると550ptプレゼント＝実質初月分）」）であり、
**API データ由来ではない**。works 詳細ページは `prices.deliveries` を描画していない（grep で描画箇所 0件）。

---

## 2. ある場合、`article_products` に保持できるか

**該当しない**（§1 のとおりフィールドが存在しないため）。

---

## 3. 無い場合、TV系記事への作品掲載は「手動選定」以外に方法がないか

本調査で確認できた範囲では、**FANZA API `ItemList` の返却からは判定できない**。
以下は**確認できた事実のみ**を列挙する（実現可否の評価は加えない）。

| # | 経路 | 本調査での確認状況 |
|---|---|---|
| 1 | **`ItemList` の返却フィールド** | **判定フィールド無し**（§1・実呼び出しで確定） |
| 2 | **`floor` パラメータ**（`videoa` / `anime` / `nikkatsu` / `amateur`） | いずれも**単品販売フロア**。見放題専用フロアの有無は**未確認** |
| 3 | **FANZA API の他エンドポイント**（`FloorList` / `ActressSearch` / `GenreSearch` 等） | **未調査**。見放題フロアが `FloorList` に列挙されるかは未確認 |
| 4 | **`campaign` フィールド** | 型定義には `campaign?: DmmCampaign[]` が存在するが、**本件の実返却には含まれていなかった**（キー一覧に不在）。セール等の情報であり見放題との関係は未確認 |
| 5 | **見放題対象作品の一覧ページを外部から取得** | 対象ページは `video.dmm.co.jp` 配下と推定されるが、**同ドメインは遮断確定のため本調査では到達していない** |
| 6 | **手動選定**（人が見放題対象を確認して content_id を選ぶ） | 本調査では**他に判定手段を確認できなかった**ため、現時点で確認済みの唯一の経路 |

---

## 4. 本調査の限界（明記）

- API 呼び出しは **`cid=1dldss00552`（videoa フロアの単品作品）1件のみ**。**他フロア・他作品で異なるフィールドが返る可能性は否定していない**
- **`FloorList` 等の他エンドポイントは未調査**
- **見放題対象作品を1件も特定していない**ため、「見放題対象作品なら別フィールドが返る」という可能性の検証もできていない
- ローカル IP からの API 呼び出しは**1回のみ**に留めた（過去に多用でローカル IP が DMM 側 400 スロットルを受けた記録があるため）

---

> 本記録は調査結果の転記のみ。判断・提案は加えていない。
