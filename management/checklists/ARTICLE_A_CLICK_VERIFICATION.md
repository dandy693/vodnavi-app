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
| **記録** | 各項目で着地ページ最上部のスクリーンショットを保存 |
| **禁止** | 遷移先で会員登録・購入を完了しないこと（着地確認のみ） |
| **所要** | PART 1 は**クリック4回 + 着地確認のみ**（af_id の目視は CTO 側で充足済み・下記） |

---

# PART 1 — publish 不要。**今日そのまま実施できる**（CTA 4本すべて）

記事A の CTA は、既に公開中のページと **同一の URL ビルダ**を使う。

| 記事A の CTA | 使用関数 | 同一関数を使う公開中のページ |
|---|---|---|
| `[[CTA:tv_signup]]` | `buildTvSignupURL()` | `/articles/fanza-first-guide` |
| works CTA 3本 | `buildAffiliateURL({contentId})` | `/works/videoa/{content_id}` |

`article_products` の CTA は `buildAffiliateURL({ contentId })` を **contentId のみ**で呼ぶ（`page.tsx:274`）。works 詳細ページと引数が同一のため、**生成される URL はバイト一致**する。
→ **CTA の着地先と af_id は、記事A を publish しなくても今日検証できる。**

## 【分担の確定・2026-08-11】af_id 確認は **CTO 側で充足済み**

`af_id` は**自サイトの HTML に出力される値**であり、遮断ドメインを踏まずに機械実測できる。CTO が全4本を実測済みのため、**CSO は af_id を目視しなくてよい**。

| CTA | ページ | HTTP | `moterist-004` | **`moterist-99[0-9]`** | 判定 |
|---|---|---|---|---|---|
| tv_signup | `/articles/fanza-first-guide` | 200 | **あり**（`guide_tv_signup_cta` ×1） | **0** | **充足** |
| works | `/works/videoa/ebwh00155` | 200 | **34** | **0** | **充足** |
| works | `/works/videoa/miab00373` | 200 | **34** | **0** | **充足** |
| works | `/works/videoa/dass00333` | 200 | **30** | **0** | **充足** |

（実測 2026-08-11 11:24 JST。CTO は `al.dmm.co.jp` を踏まずに自サイト HTML から href を抽出。**DMM のクリック数は汚染していない**）

**→ CSO が実施するのは「着地確認」のみ**（遷移先が遮断ドメインのため CTO は実施不可）。**省略ではなく分担の明確化**であり、af_id の確認が不要になったわけではない。

---

## 1-1. `[[CTA:tv_signup]]` — **着地確認のみ**

**URL: https://app.vodnavi.jp/articles/fanza-first-guide**

| # | 確認項目 | 期待値 | 結果 |
|---|---|---|---|
| 1 | 金色ボタン「**FANZA TVを見てみる（登録3分）**」をクリック | — | ☐ |
| 2 | **DMMプレミアムの登録ページに着地する**（エラー・404・別サービスでない） | 着地する | ☐ |

参考（CTO 実測の href。**CSO の確認は不要**）:
```
https://al.dmm.co.jp/?lurl=https%3A%2F%2Fpremium.dmm.co.jp%2F&af_id=moterist-004&ch=link_tool&ch_id=link
```

## 1-2〜1-4. works CTA 3本 — **着地確認のみ**

| # | content_id | クリック元 URL |
|---|---|---|
| 1-2 | `ebwh00155` | https://app.vodnavi.jp/works/videoa/ebwh00155 |
| 1-3 | `miab00373` | https://app.vodnavi.jp/works/videoa/miab00373 |
| 1-4 | `dass00333` | https://app.vodnavi.jp/works/videoa/dass00333 |

| # | 確認項目 | 期待値 | ebwh | miab | dass |
|---|---|---|---|---|---|
| 1 | FANZA への CTA をクリックして着地する | 着地する | ☐ | ☐ | ☐ |
| 2 | **着地先の品番が該当 content_id と一致する**（別作品でない） | **一致** | ☐ | ☐ | ☐ |

**項目2 が本パートの主目的**。着地先ページの品番表記が `ebwh00155` / `miab00373` / `dass00333` とそれぞれ一致するかを見る。

参考（CTO 実測の href。**CSO の確認は不要**）:
```
https://al.dmm.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3D{content_id}&af_id=moterist-004&ch=link_tool&ch_id=link
```

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
