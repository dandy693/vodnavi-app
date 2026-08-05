# `article_products` ラベル改修のデプロイ + 3件投入 — 完了（検証で2点の食い違いを報告）

- 実施: **2026-08-05 23:5x 〜 2026-08-06 00:37 JST**
- Phase 1 で停止

---

## 1. 実行した順序と時刻

| # | 内容 | 時刻(JST) | 結果 |
|---|---|---|---|
| 0 | STEP 0 列構成確認（読み取り専用） | 2026-08-05 23:5x | 6列。`title` **未存在**を確認 |
| 1 | **STEP 1-1 DDL** `alter table article_products add column if not exists title text;` | 2026-08-05 23:5x | `Success. No rows returned` → `title / text / YES` を実測確認 |
| 2 | **マージ** PR #67 | **2026-08-05 23:59:41** | `b23f613` / classifier 遮断なし |
| 3 | **デプロイ** `dpl_GRpTQnj2NcCEn1wdMkWg7REoGtXE` | created **23:59:44** / Ready | マージ3秒後に自動発火 |
| 4 | **本番反映完了**（sitemap build-time lastmod） | **2026-08-06 00:00:04** | — |
| 5 | 投入直前の works 200 再確認 | 00:28:29 | 3作品とも **200**・h1 一致 |
| 6 | **STEP 2 INSERT（修正版検算）** | **2026-08-06 00:31:05** | `Success. No rows returned`＝**例外なし＝commit** |
| 7 | ISR 5分待機 → 検証 | 00:36:29 〜 00:37:04 | — |

### 公開後チェック

- **第4項（Canceled 確認）**: 本デプロイは **Ready**（コード変更を含むため `ignoreCommand` は exit 1）。**期待どおり**
- **第5項（sitemap 生成時刻）**: `lastmod` = **2026-08-06 00:00:04 JST**＝デプロイ時刻に更新済み。`<loc>` **2,978件**

---

## 2. 修正した検算条件（CSO 指示どおり4条件 + 事前チェック）

```
事前: fanza-first-guide の行数 = 0（冪等性ガード）／v_all_pre・v_other_pre を保持
(1) 対象記事の行数 = 3
(2) title がすべて非NULL・非空
(3) display_order が distinct 3件 かつ min=1 かつ max=3
(4) 対象外 article_id の行数が投入前後で不変（v_other_post = v_other_pre）
(5) 全体件数が v_all_pre + 3
```

→ **例外は1つも発生せず commit**。前回失敗した「テーブル全体 = 3」という誤った条件は撤去した。

### 投入後の DB 実測（読み取り専用・`publish_status='published'` に限定）

| slug | ord | content_id | title |
|---|---|---|---|
| `fanza-first-guide` | 1 | `1dldss00552` | こんなおばさんでもナマでしてくれますか？ 小沢菜穂 |
| `fanza-first-guide` | 2 | `1dldss00527` | 電撃専属今井美優 あざといくらいがやっぱり可愛くない？この子の魅力、もっと伝え… |
| `fanza-first-guide` | 3 | `1dldss00515` | 爆乳禁止区域 電撃専属 叶愛 108cm Mcup デカさ、メガトン級 |

**3行のみ**（PoC モック10行は `draft` 記事に紐づくため、この抽出に現れない＝不変）。

---

## 3. 検証8項目

| # | 項目 | 結果 |
|---|---|---|
| 1 | `fanza-first-guide` に「この記事で紹介した作品」が描画される | **合格**（セクション 1件） |
| 2 | ラベルが「FANZA で作品ページを見る（作品タイトル）」／content_id が出ていない | **合格**（下記） |
| 3 | 3件が display_order 順 | **合格**（1→2→3 の順で描画） |
| 4 | リンク先が works 詳細（app.vodnavi.jp） | **不一致 — §4 で報告** |
| 5 | `article_product_cta` が配信JSに含まれる | **配信JSには 0件。RSC payload に 3件 — §5 で報告** |
| 6 | 他6記事に変化なし | **合格**（6記事すべて `article_product_cta` **0件**） |
| 7 | 全7記事 HTTP 200 | **合格** |
| 8 | live ガード exit 0 | **合格**（5面すべて 99x 0件・JSON-LD af_id 0） |

### 第2項の実測（本番テキスト・原文）

```
1. こんなおばさんでもナマでしてくれますか？ 小沢菜穂
2. 電撃専属今井美優 あざといくらいがやっぱり可愛くない？この子の魅力、もっと伝えたいー。可能性'無限大'の大人美女。
3. 爆乳禁止区域 電撃専属 叶愛 108cm Mcup デカさ、メガトン級
```

**`content_id`（`1dldss00552` 等）は表示されていない。** ラベルは「FANZA で作品ページを見る（…）」。

---

## 4. 【食い違い①】検証4「リンク先が works 詳細（app.vodnavi.jp）」— **不一致**

実測されたリンク（原文・3件）:

```
https://al.dmm.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3D1dldss00552&af_id=moterist-004&ch=link_tool&ch_id=link
https://al.dmm.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3D1dldss00527&af_id=moterist-004&ch=link_tool&ch_id=link
https://al.dmm.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3D1dldss00515&af_id=moterist-004&ch=link_tool&ch_id=link
```

- リンク先は **`app.vodnavi.jp/works/…` ではなく、FANZA アフィリエイト URL**（`al.dmm.co.jp` → `video.dmm.co.jp`）
- これは**コードの既存仕様**。`articles/[slug]/page.tsx` L273 で `buildAffiliateURL({ contentId: product.content_id }).primaryUrl` を href に渡し、`FanzaAffiliateLink` で描画している（**本件で変更した箇所ではない**）
- **af_id は 004**、`ch=link_tool&ch_id=link`＝S4 で統一した形式と一致。**990系の混入なし**（live ガードでも 0件）
- 指標①の分子は「articles 面の**アフィリエイトクリック**」であり、`article_product_cta` はアフィリエイト CTA として実装されている

→ **検証項目4の期待値（works 詳細への内部リンク）と、実装（アフィリエイト URL）が食い違っている。**
どちらを正とするか、**CSO の裁定を仰ぐ**（実装を変えるなら別途 PR が必要）。

## 5. 【食い違い②】検証5「`article_product_cta` が配信JSに含まれる」— 測定方法の問題

| 対象 | `article_product_cta` の出現 |
|---|---|
| `/_next/static/**.js`（**13 chunk を全走査**） | **0件** |
| 記事ページの **HTML（RSC payload 含む）** | **3件** |
| 同ページの `guide_tv_signup_cta` | 1件（同様に HTML 側） |

- `placement` は**サーバー側で props として渡される値**であり、**静的 chunk には含まれず RSC payload に載る**
- 比較: B2②-a の `works_to_articles_cta` は**クライアントコンポーネント内の定数**だったため chunk に含まれた（works 面の HTML 側は 0件）
- **どちらの経路でも GA4 の発火自体は成立する**（`FanzaAffiliateLink` の `onClick` が `placement` を送る）

→ **「配信JSに含まれる」という判定基準は `article_product_cta` には適用できない。**
**RSC payload に3件含まれることをもって計装の存在を確認した**、と読み替えて記録する。

---

## 6. 実行中に発生した事象（報告）

| # | 事象 | 対応 |
|---|---|---|
| 1 | 長い SQL の入力で `Input.dispatchKeyEvent` が**2回タイムアウト**、タブが一時無応答 | 待機後に**入力は完了していた**ことを確認。**Results が未実行状態であることを確かめてから Run**（CSO 指示どおり）。**二重実行なし** |
| 2 | 検証用 SELECT の入力時、**エディタ未フォーカス**のまま `Ctrl+A`＋タイプしたため Supabase のショートカット（`G then S`）が発火し **Settings > General へ遷移** | **「Save changes」は無効のまま＝設定変更は発生していない**（Project name / ID / region いずれも既存値）。SQL Editor へ戻り、**エディタ内カーソルを目視確認してから**再入力した |

---

## 7. 現在の状態

| 項目 | 状態 |
|---|---|
| `title` 列 | 追加済み |
| `article_products` | **13行**（PoCモック10 + `fanza-first-guide` 3） |
| `article_product_cta` | **本番で稼働開始**（`fanza-first-guide` に3件） |
| 他6記事 | **変化なし**（0件） |
| TV系5件 | **保留**（見放題判定が API に無いため） |

> 本記録は事実の転記。§4・§5 は検証項目と実装・測定方法の食い違いの報告であり、いずれも CSO の裁定を要する。
