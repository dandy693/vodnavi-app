# R2 起案 — sitemap 本体から `/works/amateur/` 400 URL を除外する

- 起案: **2026-08-08 23:20 JST**
- **起案のみ。実装は CSO 承認後**
- **【重要】8/13 の判定まで実装しない**（観測期間の交絡回避）
- 本文中の数値はすべて **2026-08-08 23:16:27 JST の本番実測**（`sitemap.xml` HTTP 200）

---

# 1. 実装確認

## 1-1. 該当箇所（原文）

`app-concierge/src/lib/sitemap-builder.ts`

```ts
const HITS_PER_REQUEST = 100;
const PAGES_PER_FLOOR = 4;          // → 1フロアあたり最大 400 URL

for (const floor of FANZA_FLOORS) {
  const apiFloorParam = floor.apiFloor ?? floor.code;      // L74
  for (let page = 0; page < PAGES_PER_FLOOR; page++) {
    const data = await fetchItemList({
      site: "FANZA", service: floor.service, floor: apiFloorParam,
      hits: HITS_PER_REQUEST, offset: page * HITS_PER_REQUEST + 1, sort: "date",
    }, { skipImageValidation: true });
    ...
    for (const item of items) {
      const path = `/works/${floor.code}/${item.content_id}`;   // ← L98
      if (seenWorks.has(path)) continue;
      seenWorks.add(path);
      works.push({ url: absoluteUrl(path), ... });
      archiveEntries.push({ content_id: item.content_id,
        floor_code: floor.apiFloor ?? floor.code, ... });        // ← Q が是正した箇所
      // genreMap / actressMap もここで更新
    }
  }
}
```

`app-concierge/src/lib/fanza/types.ts:156-167`

```ts
export const FANZA_FLOORS: FanzaFloor[] = [
  { code: "videoa",   label: "動画",     service: "digital" },
  { code: "amateur",  label: "素人",     service: "digital", apiFloor: "videoa", injectKeyword: "素人" },
  { code: "anime",    label: "アニメ",   service: "digital" },
  { code: "nikkatsu", label: "成人映画", service: "digital" },
];
```

## 1-2. 機械的に確認した事実

| 確認項目 | 実測 |
|---|---|
| `seenWorks` の重複判定キー | **パス**（`/works/{code}/{cid}`）。`videoa` と `amateur` は**別パスになるため両方出力される** |
| ループ順 | `videoa` → `amateur` → … ＝ **videoa が先に全 400 件を出力済み** |
| `injectKeyword` の使用箇所 | **`(site)/page.tsx:117-118` のみ**。**`sitemap-builder.ts` では未使用（grep 0件）** |
| ⇒ amateur の API 呼び出し | `service: "digital"` / `floor: "videoa"` / 同 hits・offset・sort ＝ **videoa と完全に同一のリクエスト** |
| sitemap 内の amateur cid | **400件（uniq 400）** |
| **amateur cid のうち videoa に無いもの** | **0件** |
| amateur ∩ anime / amateur ∩ nikkatsu | **0 / 0** |

→ **`/works/amateur/*` 400 URL は `/works/videoa/*` 400 URL と content_id が完全一致する鏡像である**（CSO 前提を実測で裏付け）。

## 1-3. 変更案（2案）

### 案A: works の**出力だけ**スキップ（挙動差分が最小）

```ts
// 鏡像フロア（apiFloor が別フロアを指す＝実体は他フロアと同一リスト）は
// sitemap 本体に出さない。canonical 先（videoa）だけを提出する。
const isMirrorFloor = !!floor.apiFloor && floor.apiFloor !== floor.code;
...
      if (!isMirrorFloor) {
        works.push({ url: absoluteUrl(path), lastModified: itemDate, ... });
      }
```

| 項目 | 規模 |
|---|---|
| 変更ファイル | **1**（`sitemap-builder.ts`） |
| 追加/変更行 | **約4行** |
| FANZA API 呼び出し | **変化なし（16回のまま）** |
| `archiveEntries` / `genreMap` / `actressMap` | **完全に不変** |
| 依存する前提 | なし（出力を止めるだけ） |

### 案B: 鏡像フロアの**ループごと**スキップ

```ts
for (const floor of FANZA_FLOORS) {
  if (floor.apiFloor && floor.apiFloor !== floor.code) continue;  // 鏡像フロアは走査しない
```

| 項目 | 規模 |
|---|---|
| 変更ファイル | **1** |
| 追加/変更行 | **約2行** |
| FANZA API 呼び出し | **16回 → 12回（−25%）** |
| `archiveEntries` / `genreMap` / `actressMap` | 理論上不変（amateur の items は videoa と同一・§1-2 で実測確認） |
| 依存する前提 | 「amateur の返却 items が videoa と常に同一」。**現在は実測一致だが、将来 `injectKeyword` を sitemap 側でも使う等の変更が入ると崩れる** |

### 推奨

**案A**。理由は、削減効果（sitemap から 400 URL 除外）は両案で同一である一方、案B は「amateur と videoa の items が常に一致する」という**将来にわたる前提**に依存するため。API 呼び出し 4回分の節約は、`revalidate=3600`（1時間に1回の再生成）における効果としては小さい。

**※ 案B を採る場合の追加条件**: `FANZA_FLOORS` に鏡像フロアを追加/変更する際、sitemap 側の前提が崩れないことを確認する旨をコメントで固定すること。

## 1-4. 除外対象**外**（明記）

- **`/?floor=amateur`（トップの素人フィルタ着地・sitemap に1 URL）は除外しない**。`(site)/page.tsx:117-118` が `injectKeyword: "素人"` を検索キーワードに強制結合しており、**videoa 着地とは異なる作品集合を出す実体のあるページ**であるため
- **`/works/[floor]/[id]` のルート自体は削除しない**。既存の `/works/amateur/*` は 200 のまま・canonical は videoa を指したまま維持する

---

# 2. 除外後の影響

## 2-1. sitemap の loc 数

| 区分 | 現状 | 除外後 | 差分 |
|---|---|---|---|
| **loc 総数** | **2,963** | **2,563** | **−400** |
| works 合計 | 1,600 | **1,200** | −400 |
| └ videoa | 400 | 400 | ±0 |
| └ **amateur** | **400** | **0** | **−400** |
| └ anime | 400 | 400 | ±0 |
| └ nikkatsu | 400 | 400 | ±0 |
| actresses | 1,148 | 1,148 | ±0 |
| genres | 200 | 200 | ±0 |
| articles | 7 | 7 | ±0 |
| その他（トップ・`?floor=`×4・about/privacy/disclaimer） | 8 | 8 | ±0 |

- `sitemap-archive.xml`（loc 2,146）は **変更なし**（既に amateur 0件）
- クロール予算（既存記録の実測 **317/日**）: 全周 **2,963÷317 ≒ 9.3日 → 2,563÷317 ≒ 8.1日（約 −1.3日）**

## 2-2. コンテンツの喪失

**発生しない。** §1-2 のとおり amateur 400 cid は videoa 400 cid と**完全一致**しており、除外後も同じ作品が `/works/videoa/{cid}` として sitemap に残る。

## 2-3. 既にインデックスされている amateur URL の扱い

| 項目 | 実測・仕様 |
|---|---|
| 除外後の HTTP 応答 | **200 のまま**（ルートは削除しないため 404 化しない）。実測: `/works/amateur/mfyd00193` = 200 |
| canonical | **`/works/videoa/mfyd00193` を指したまま**（実装変更なし） |
| GSC 上の分類 | **即座には消えない**。sitemap からの取り下げは「新規提出をやめる」だけで、Google が既知 URL の再クロール・再評価を終えるまで「代替ページ（適切な canonical タグあり）」に残り続ける |
| リスク | **なし（想定される機能的な劣化は特定できていない）**。canonical が正しく videoa を指しているため、評価は既に videoa へ集約されている |

---

# 3. §6 事前登録（実装前・数値で明示）

## 3-1. 予測（**定量的に織り込む**）

| # | 予測 | 織り込んだ残存要因 |
|---|---|---|
| P1 | **代替canonical は減少する。ただしゼロにはならない** | 現状 2,000。上位500件サンプルの内訳は **`/works/amateur/` 456件（91.2%）／`/concierge?source=…&intent=…&seed_cid=…` 44件（8.8%）**。**concierge のクエリ付き URL は sitemap 非収録**のため、本施策では**一切減らない** |
| P2 | **減少は「除外直後」には起きない** | GSC「ページのインデックス登録」の**反映ラグは現状 5日程度**（8/8 時点の最終更新日 = 8/05）。加えて Google が既提出の amateru URL を再クロール・再評価する周期が必要 |
| P3 | **既提出分の自然減衰には数週間かかる** | 代替canonical 上位500件の前回クロール日は **7/08〜8/06 に分布**＝約1か月かけて巡回している。全 2,000 件の再評価には**同等以上の期間**を要する |
| P4 | 検出 - インデックス未登録も減りうる | 同バケット上位500件中 **`/works/amateur/` 234件（46.8%・すべて未クロール）**。sitemap から外れれば新規クロール対象から外れるが、**actresses 138件・amateur 以外の works 121件・genres 7件は本施策の対象外** |

## 3-2. 期待しないこと（明示）

- **「除外直後に代替canonical がゼロになる」ことは期待しない**
- **`/concierge?source=…` 由来の分（サンプル比 8.8%）は本施策では減らない**
- **404 が増える／評価が失われることは期待しない**（canonical は既に videoa を指しているため）

## 3-3. 観測設計

| 項目 | 内容 |
|---|---|
| 基準線 | **代替canonical 2,000**（GSC 最終更新 2026-08-05 の値・2026-08-08 取得）／上位500件の amateur 構成比 **91.2%** |
| 主指標 | 代替canonical の**総数** |
| 補助指標 | ドリルダウン上位500件の **amateur 構成比**（総数より先に動く見込み） |
| 中間記録 | 実装 **+2週間**（構成比のみ記録・判定しない） |
| 判定 | 実装 **+4週間** |
| 交絡要因 | ①8/13 の `article_product_cta` 判定期間と重ならないよう**実装は 8/13 以降** ②F-1（+1 URL）実装時期 ③GSC 側の停止再発（7/24〜8/4 に前例あり） |

## 3-4. ロールバック

- **1コミットの revert + デプロイ**（変更は `sitemap-builder.ts` のみ）
- sitemap は route handler（`app/sitemap.xml/route.ts`・`revalidate = 3600`）で配信されるため、**デプロイ後は最大1時間で復帰**
- DB・外部設定の変更を伴わないため、ロールバックに副作用はない

---

# 4. 実装順序（承認後）

1. **8/13 の `article_product_cta` 判定を完了**（本施策はそれまで着手しない）
2. `sitemap-builder.ts` を案A で修正 → PR
3. マージ・デプロイ後、**本番 `sitemap.xml` を実測**（loc 2,563 / works 1,200 / amateur 0 を確認）
4. `/works/amateur/mfyd00193` が **200 かつ canonical=videoa のまま**であることを実測
5. GSC のサイトマップ「検出されたページ数」が 3,012 → 減少することを次回読み取り時に確認
6. §3-3 の観測設計に従い +2週間 / +4週間で記録

---

> 本記録は起案。実装・デプロイは CSO 承認後、かつ 8/13 の判定完了後に行う。
