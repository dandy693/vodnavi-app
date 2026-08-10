# 記事A draft 投入完了 + article_products 3行投入 + 公開前チェック

- 実施: **2026-08-11 07:40:01 〜 07:49:08 JST**
- **publish は実施していない**（`publish_status = 'draft'` のまま。公開面は 404）
- 遮断ドメイン（`premium` / `video` / `tv`.dmm.co.jp）へは**一切アクセスしていない**

---

# タスクA 見放題判定の台帳化 → **完了**

`FACT_GOVERNANCE.md` に **§5-2-1**（再現可能な判定手順）と **§5-2-2**（3本の判定結果）を追記した。

## §5-2-1 再現可能な判定手順（記事の主張の実証にあたる）

1. **`tv.dmm.co.jp` の検索窓に品番をそのまま入力**する（品番は FANZA 動画の作品ページに記載）
2. **検索結果が表示された** → 見放題の対象。**赤い「Plus」バッジあり＝TV Plus（+1,078円）が必要 / なし＝550円プランで見られる**
3. **「該当する見放題作品が見つかりませんでした」** → **見放題の対象外**（単品購入のみ）
- 一覧からは左サイドバー「サービス」の `FANZA TV` / `Plus限定` 切替でも確認可
- **HUMAN 実査枠**（`tv.dmm.co.jp` はツール層遮断のため CTO/ツールからは実行不可）

## §5-2-2 works CTA 3本の判定（CSO/HUMAN 実査 2026-08-11・実画面スクリーンショット）

| content_id | FANZA TV 側の品番検索結果 | 判定 |
|---|---|---|
| `ebwh00155` | 「該当する見放題作品が見つかりませんでした」 | **見放題対象外** |
| `miab00373` | 同上 | **見放題対象外** |
| `dass00333` | 同上 | **見放題対象外** |

- いずれも FANZA 動画側では1件ヒットするが、FANZA TV 側の見放題検索では該当なし
- **帰結: 本文記述「いずれも発売から1年以上が経過し、FANZA TV側で確認したところ見放題の対象外だった作品です」は事実と一致。publish ゲートを解除**

---

# タスクB 記事A の draft 投入 → **完了**

## STEP0 スキーマ確認（実測）

| 確認項目 | 実測値 |
|---|---|
| `editorial_articles` の列 | `id:uuid, slug:text, title:text, description:text, pillar:text, publish_status…, body` |
| **`pillar` の既存値** | **`emotion-navi`（PoC モック10件・すべて draft）/ `newuser-funnel`（公開7記事すべて）** |
| **slug 衝突** | **`(none)`** |
| 投入前の件数 | 全 **17** 行 / published **7** 行 |

### `pillar = newuser-funnel` を選定した理由

**公開中の7記事（`fanza-first-guide` / `fanza-kaiyaku` / `fanza-payment-methods` / `fanza-payment-statement` / `fanza-tv-free-trial` / `fanza-tv-guide` / `fanza-tv-review`）がすべて `newuser-funnel`** であり、`emotion-navi` は PoC モック（`mock-poc-article-001`〜`010`・body_len 40・すべて draft）にしか使われていない。記事Aは FANZA の課金判断を扱う新規会員導線であり、既存7記事と同系統。

## 投入方法（打鍵事故の回避）

| 課題 | 対策 |
|---|---|
| 長文 SQL の `Input.dispatchKeyEvent` タイムアウト（過去3回発生） | **クリップボード経由（`Set-Clipboard` → `Ctrl+V`）** で打鍵を回避 |
| Monaco の自動インデントが本文へ空白を混入させる | 本文の改行を **`\n` エスケープに変換し SQL 全体を1行**にした（Enter キーを一度も押さない） |
| 実行前の状態確認 | 貼付後に **Monaco モデルの値を実測**（SQL長 4,882＝クリップボードと一致 / **改行 0**）し、Results ペインが前クエリのままであること（＝未実行）を確認してから Run |

## 投入内容と結果

```
do $do$ … insert into editorial_articles (slug, title, description, pillar, publish_status, body)
values ('fanza-subscription-vs-single-purchase', 'FANZAの単品購入と見放題、どちらが得か — 在庫データで検証した損益分岐',
        null, 'newuser-funnel', 'draft', E'…') ; …6項目の事後検算… end $do$;
```

**実行結果: `Success. No rows returned`** ＝ **6項目の事後検算すべて通過 → コミット**

| 事後検算 | 期待値 | 結果 |
|---|---|---|
| `length(body)` | 3457 | **通過** |
| `[[CTA:tv_signup]]` の出現 | 1 | **通過** |
| `](/articles/` の出現 | 2 | **通過** |
| published 件数（不変） | 7 | **通過** |
| 全件数 | 18 | **通過** |
| 当該 slug の draft 行 | 1 | **通過** |

※ いずれか不一致なら `raise exception` で **DO ブロック全体が自動ロールバック**する設計。

---

# タスクC article_products 3行の投入 → **完了**

## 投入直前の再実測（2026-08-11 07:40:01）

| content_id | HTTP | 自己 canonical | af 990系 | af 004 |
|---|---|---|---|---|
| `ebwh00155` | **200** | **OK** | **0** | 34 |
| `miab00373` | **200** | **OK** | **0** | 34 |
| `dass00333` | **200** | **OK** | **0** | 30 |

## 投入した3行

| display_order | content_id | asp_name | title（FANZA API 実取得値） | 価格 | レビュー |
|---|---|---|---|---|---|
| 1 | `ebwh00155` | fanza | 普段は真面目な部下が出張先の温泉相部屋で…（清宮仁愛） | 300円 | 25件 / 4.64 |
| 2 | `miab00373` | fanza | 彼氏に紹介された整体師（父親）が…（小坂ひまり） | 300円 | 20件 / **4.90** |
| 3 | `dass00333` | fanza | 派遣マッサージ師にきわどい秘部を…（橘メアリー） | 300円 | 22件 / 4.68 |

- **af_id は保存していない**（`article_products` は `content_id / asp_name / display_order / title` のみ。CTA URL は描画時に `buildAffiliateURL` が env から生成＝**004 のみ**）
- title に半角アポストロフィが無いことを投入前に検査済み（3件とも0）

**実行結果: `Success. No rows returned`** ＝ 5項目の事後検算すべて通過

| 事後検算 | 期待値 | 結果 |
|---|---|---|
| 投入前の既存行 | 0 | **通過** |
| 投入後の行数 | 3 | **通過** |
| `display_order` の distinct | 3 | **通過** |
| `title is null` の件数 | 0 | **通過** |
| `asp_name <> 'fanza'` の件数 | 0 | **通過** |
| **`fanza-first-guide` の行数（不変）** | **3** | **通過** |

※ **グローバルな総件数は検算条件に入れていない**。2026-08-05 に「テーブル全体=3」という未確認の前提で検算を組み自動ロールバックさせた事故があるため、**確認していない値を条件にしない**方針とした。

## (4) 比較可能性

| 記事 | article_products 行数 |
|---|---|
| `fanza-first-guide` | **3** |
| `fanza-subscription-vs-single-purchase` | **3** |

**同一の3本構成であり、比較可能性が保たれている。**

---

# 投入後の DB 実測（検証 SELECT）

| slug | pillar | publish_status | description NULL | body_len | CTA | 内部リンク | products |
|---|---|---|---|---|---|---|---|
| `fanza-first-guide` | newuser-funnel | published | false | 1165 | 1 | 0 | **3** |
| **`fanza-subscription-vs-single-purchase`** | **newuser-funnel** | **draft** | **true** | **3457** | **1** | **2** | **3** |

`description` が既存7記事と異なり NULL である点は**意図どおり**（CSO 未提供のため創作していない。`generateMetadata` は description が NULL のとき title から生成するフェイルセーフを持つ）。

---

# タスクD 公開前チェック（CTO実施分・2026-08-11 07:49:08）

## (1) curl 二点法

| 点 | 対象 | 結果 |
|---|---|---|
| 点1 | `https://app.vodnavi.jp/articles/fanza-subscription-vs-single-purchase` | **HTTP 404** ← **draft のため正常**（`getPublishedArticleBySlug` が `publish_status='published'` を課す多重防御が効いている＝公開面へ漏れていない） |
| 点2 | `https://app.vodnavi.jp/articles/fanza-first-guide`（対照） | **HTTP 200** / `article_product_cta` **3本** |

※ **公開面 HTML に対するレンダリング検証は publish 後にしか実施できない**（draft は 404 のため）。本便では「公開面へ漏れていないこと」の確認までが実施範囲。

## (2) grep 4カテゴリ（DB へ投入した本文に対して）

| カテゴリ | 実測 | 判定 |
|---|---|---|
| **a. 生マーカー** | `[[CTA:` の未変換残り **0** / `](/articles/` **2**（公開済 slug のみ＝正常） | **合格** |
| **b. af_id** | `moterist-99[0-4]` **0** / 本文への `af_id` 直書き **0** | **合格** |
| **c. 禁止語** | `90%OFF` **0** / クーポン＋金額 **0** / 「全作品見放題」型の断定 **0** | **合格** |
| **d. 広告表記** | 記事本文への記載は不要（**共通レイアウトの2箇所で担保**）。対照記事で 上部「アフィリエイト広告」表記 **4** / フッタ `PR` **8** を確認 | **合格** |

## (3) Canceled 確認

| 項目 | 実測 |
|---|---|
| **draft 投入によるデプロイ** | **発生していない**（Supabase への直接 INSERT であり git push を伴わないため） |
| 直近のデプロイ状況 | 直近3件（`75a1049` / `54290f4` / `35e4955`）は **CANCELED**＝`vercel.json` の `ignoreCommand` による**意図された最適化**（管理台帳のみのコミット） |
| 直近の READY | `dpl_kf7RAzywWcKVoTvGmBfDeDtuSWUZ`（`4e44aa0`） |

**判定: 記事の投入・公開はデプロイを伴わないため CANCELED が正常であり、異常なし。**

## (4) sitemap 生成時刻と収録

| 項目 | 実測 | 判定 |
|---|---|---|
| `sitemap.xml` loc 総数 | **2,963** | R2 未実施のため不変＝正常 |
| **articles 収録数** | **7本** | **draft は収録されないため 7 のままが正常** |
| **新記事 slug の収録** | **0件** | **正常** |
| root `lastmod` | **2026-08-10T20:23:41.530Z**（＝2026-08-11 05:23:41 JST） | 直近 READY デプロイ時刻と整合 |

**構造的ズレの明記**: 記事 publish は Supabase 直接 UPDATE で**即時反映**される一方、**sitemap 収録は次ビルドまで保留**される。publish 時はこのズレを台帳に明記し、**公開後チェックで吸収**する。

---

# タスクE publish

**実施していない。** `publish_status = 'draft'` のままであり、公開面は 404。publish は **CSO の実クリック検証と最終承認の後、別便**とする。

---

# 禁止事項の遵守状況

| 禁止事項 | 状況 |
|---|---|
| 記事A の publish | **していない**（draft のまま・公開面 404 を実測確認） |
| `premium` / `video` / `tv`.dmm.co.jp へのアクセス | **していない**。`tv.dmm.co.jp` のタブが開いていたが**参照・読み取りとも行っていない**（前便と同じ扱いを継続） |
| af_id 990〜994 の人間向けCTAへの使用 | **していない**（本文0 / works詳細実測0 / `article_products` は af_id を保存しない設計） |
| 本文の書き換え | **していない**（保全済み原文をそのまま使用。body_len 3457 が一致） |
| description の創作 | **していない**（NULL で投入） |
| R2 の先行実行 | **していない**（sitemap loc 2,963・amateur 400 のまま） |
| 新規ページ種別・namespace の作成 | **していない** |

---

> 本記録は実測値の転記。publish は行っていない。
