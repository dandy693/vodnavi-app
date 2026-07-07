# セール特集テンプレート（U3 / 新規会員導線 設計書v1）

> 骨格のみ先行実装（2026-07-07 CTO）。公開はセール判明時に CSO がコピー投入して発行。
> 器: Supabase `editorial_articles`（slug 推奨: `fanza-sale-YYYYMM`）+ `article_products`。
> `/articles/[slug]` が自動 render（CTA は FanzaAffiliateLink 経由・af_id=004）。

## 記事構成（editorial_articles.body に流し込む骨格）

```
# 【{セール名}】{割引率・目玉}まとめ｜{YYYY/MM/DD}まで

<!-- リード: セール名 / 期間 / 最大割引率。期間は公開時に必ず実画面確認値を挿入 -->

## 今回のセール概要
- 期間: {開始日} 〜 {終了日}
- 対象: {対象フロア/シリーズ}
- 目玉: {代表作品・割引率}

## 対象作品ピックアップ
<!-- article_products に content_id を投入するとグリッド自動描画（CTA自動配線） -->

## 初めての方は{初回特典}併用で最安
<!-- U1連動枠: 設計書 §4 HUMAN確認 → CSO確定コピーと同一文言を使用。
     U1 コピー確定前にセールが先に来た場合はこの節を丸ごと省略可 -->

## セール会場はこちら
<!-- 会場全体への CTA: buildSaleFeatureURL()（検証済み article=sale パス・af_id=004）
     placement="article_sale_cta"。実装済みヘルパーを使用、URL 直書き禁止 -->
```

## 実装済みの部品（CTO 側・投入不要）

| 部品 | 場所 | 状態 |
|---|---|---|
| CTA URL ヘルパー | `buildSaleFeatureURL()`（url-builder.ts） | 実装済 |
| placement | `article_sale_cta` | 型追加済・GA4 分離計測可 |
| 作品グリッド | `/articles/[slug]` + article_products | 既存 live |

## 規約（本テンプレにも適用）

- af_id は buildAffiliateURL / buildSaleFeatureURL 経由の 004 のみ。直書き禁止
- **JSON-LD への af_id 入り URL 記載は regression として拒否**（2026-06-24 bot クリック事故の主因経路）
- セール期間・割引率は実画面確認値のみ記載（未確認値の捏造禁止）
