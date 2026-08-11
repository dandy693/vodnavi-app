# 記事A 実クリック検証チェックリスト（CSO / HUMAN 実施）

対象記事: `fanza-subscription-vs-single-purchase`（FANZAの単品購入と見放題、どちらが得か）
作成: 2026-08-11 CTO / 実施者: **CSO（HUMAN）**
状態: 記事A は **draft**（公開面 404）

---

## 0. 事前準備（必読）

| 項目 | 内容 |
|---|---|
| **使用ブラウザ** | **検証用 Chrome** を使う |
| **GA4 への影響** | **なし**。検証用 Chrome は `/g/collect` を送信しないため、`ai_affiliate_click` / `product_click` は**計上されない**（クリック実測値を汚染しない） |
| **⚠ DMM 側への影響** | **あり**。`al.dmm.co.jp` を実際に踏むため **DMM アフィリエイトレポートの「クリック数」には計上される**。GA4 と DMM の乖離（既知・約18倍）の分子が動く点を留意すること |
| **記録** | 各項目でアドレスバーの URL とページ最上部のスクリーンショットを保存 |
| **禁止** | 遷移先で会員登録・購入を完了しないこと（着地確認のみ） |

### URL 中の af_id を目視する方法
遷移**前**に、リンクを右クリック →「リンクのアドレスをコピー」→ メモ帳等に貼って `af_id=` の値を読む。
遷移**後**は `al.dmm.co.jp` が転送するため、アドレスバーからは af_id が読めない場合がある。**必ず遷移前に確認すること。**

---

# PART 1 — publish 不要。**今日そのまま実施できる**（CTA 4本すべて）

記事A の CTA は、既に公開中のページと **同一の URL ビルダ**を使う。

| 記事A の CTA | 使用関数 | 同一関数を使う公開中のページ |
|---|---|---|
| `[[CTA:tv_signup]]` | `buildTvSignupURL()` | `/articles/fanza-first-guide` |
| works CTA 3本 | `buildAffiliateURL({contentId})` | `/works/videoa/{content_id}` |

`article_products` の CTA は `buildAffiliateURL({ contentId })` を **contentId のみ**で呼ぶ（`page.tsx:274`）。works 詳細ページと引数が同一のため、**生成される URL はバイト一致**する。
→ **CTA の着地先と af_id は、記事A を publish しなくても今日検証できる。**

## 1-1. `[[CTA:tv_signup]]`（プレミアム14日無料）

**URL: https://app.vodnavi.jp/articles/fanza-first-guide**

| # | 確認項目 | 期待値 | 結果 |
|---|---|---|---|
| 1 | 金色ボタン「**FANZA TVを見てみる（登録3分）**」が表示される | 表示される | ☐ |
| 2 | リンクアドレスに `af_id=moterist-004` が含まれる | **含まれる** | ☐ |
| 3 | リンクアドレスに `moterist-990`〜`999` が**含まれない** | **含まれない** | ☐ |
| 4 | クリック後、DMMプレミアムの登録ページに着地する | 着地する | ☐ |

**CTO 実測の期待 URL（2026-08-11 11:24 JST・公開面から取得）:**
```
https://al.dmm.co.jp/?lurl=https%3A%2F%2Fpremium.dmm.co.jp%2F&af_id=moterist-004&ch=link_tool&ch_id=link
```

## 1-2〜1-4. works CTA 3本

| # | content_id | URL |
|---|---|---|
| 1-2 | `ebwh00155` | https://app.vodnavi.jp/works/videoa/ebwh00155 |
| 1-3 | `miab00373` | https://app.vodnavi.jp/works/videoa/miab00373 |
| 1-4 | `dass00333` | https://app.vodnavi.jp/works/videoa/dass00333 |

各ページで確認する項目:

| # | 確認項目 | 期待値 | ebwh | miab | dass |
|---|---|---|---|---|---|
| 1 | ページが表示される（404 でない） | 表示 | ☐ | ☐ | ☐ |
| 2 | FANZA への CTA リンクに `af_id=moterist-004` | **含まれる** | ☐ | ☐ | ☐ |
| 3 | `moterist-990`〜`999` が含まれない | **含まれない** | ☐ | ☐ | ☐ |
| 4 | クリック後、**その品番の作品ページ**に着地する（別作品でない） | 一致 | ☐ | ☐ | ☐ |

**CTO 実測の期待 URL（2026-08-11 11:24 JST）:**
```
https://al.dmm.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3D{content_id}&af_id=moterist-004&ch=link_tool&ch_id=link
```
`{content_id}` に `ebwh00155` / `miab00373` / `dass00333` が入る。**着地先の品番がこれと一致するか**が項目4。

**CTO 側の機械実測（参考・同日）**: 3ページとも HTTP 200 / `moterist-004` の出現 34・34・30 / **`moterist-99[0-9]` の出現 0**。

---

# PART 2 — 記事A 本体でしか検証できない項目（**publish またはプレビュー経路が必要**）

**現時点では実施できない。** draft を表示する経路が実装上存在しないため（詳細は本便の報告書を参照）。
CSO が「一時 publish」を選択した場合、下記を**記事A の公開 URL 上で**実施する。

**URL: https://app.vodnavi.jp/articles/fanza-subscription-vs-single-purchase**

| # | 確認項目 | 期待値 | 結果 |
|---|---|---|---|
| 2-1 | `[[CTA:tv_signup]]` が**生マーカーのまま表示されていない**（角括弧の文字列が本文に見えない） | 金ボタンに変換 | ☐ |
| 2-2 | `## ` 見出しが **10本**、見出しとして描画されている（`##` の記号が本文に見えない） | 10本 | ☐ |
| 2-3 | 内部リンク①「FANZA TV の無料体験」系のテキストが**アンカー**になっている → `/articles/fanza-tv-free-trial` へ遷移 | 遷移する | ☐ |
| 2-4 | 内部リンク②「解約」系のテキストが**アンカー**になっている → `/articles/fanza-kaiyaku` へ遷移 | 遷移する | ☐ |
| 2-5 | 角括弧 `[` `]` `(` `)` の記法がそのまま本文に見えていない | 見えない | ☐ |
| 2-6 | 記事末尾に「**この記事で紹介した作品**」セクションがあり、CTA が **3本** | 3本 | ☐ |
| 2-7 | 3本の順序が `ebwh00155` → `miab00373` → `dass00333`（display_order 1→2→3） | 一致 | ☐ |
| 2-8 | 本文中央付近に金色の `[[CTA:tv_signup]]` ボタンが1つある | 1つ | ☐ |
| 2-9 | ページ上部に「アフィリエイト広告」表記がある | ある | ☐ |
| 2-10 | 表・箇条書き・太字が崩れた形（`|` や `**` の生文字）で出ていない | 出ていない | ☐ |

**内部リンク先の公開状態（CTO 実測 2026-08-11 11:25 JST）**: `/articles/fanza-tv-free-trial` = **200** / `/articles/fanza-kaiyaku` = **200**（両方ともホワイトリスト照合を通る）。

---

# 3. 判定

| 結果 | 対応 |
|---|---|
| **PART 1 が全項目 OK** | CTA の着地先と af_id は確定。publish の可否判断材料としては十分 |
| **PART 2 が全項目 OK** | 記事Aの描画に問題なし → 本 publish へ |
| **いずれかが NG** | **その場で CTO に差し戻す**。一時 publish 中であれば先に draft へ戻すこと（所要 1分・反映まで最大5分） |

---

> af_id は URL に保存されておらず**描画時に環境変数から生成**される（`article_products` は af_id を持たない）。したがって PART 1 で 004 を確認できれば、記事A 側も同一の値になる。
