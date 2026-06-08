# STRATEGY_BRIEF_041 — W25：Moterist 5記事のインテントCTAサージカル配線

発行: 2026-06-07 / 採番: 040 の次 = **041** / HUMAN 採択: Option 1（CTA/導線のみ・本文不改変）

## 1. 経営判断と背景
- **意思決定**: 既存5記事の**本文は永久保護**（Google-SEO および既存流入の維持）。成人デランクのリスクおよび SSH 遮断を回避するため、「超解像リライト」は全面的に**棄却**する。
- **執行内容**: W24 で計装した `url-builder.ts` のインテント判定（Option 3 / `buildEarlyCookieURL`）を活かすため、5記事の「**末尾 CTA および中間導線の HTML ブロックのみ**」をサージカルに Safe-Append（差分置換・追記）配線する。

## 2. インテントパラメータ配線仕様
各記事の送客リンクに以下のインテントを付与し、`app.vodnavi.jp/concierge` 側の初期挙動および早期クッキー着火フォールバック（Option 3）を発動させる。パーマリンクは 2026-06-06 に GSC URL検査で実在確認済（`gsc-panel-audit.json`）。

| 記事 ID | パーマリンク（**絶対保護**） | 役割 | 割当インテント |
|---|---|---|---|
| **1095** | `/fanza20250329/` | Beginner Guide | `?source=moterist&intent=beginner` |
| **1106** | `/fanza20250331/` | Registration Guide | `?source=moterist&intent=beginner` |
| **994** | `/fanza_otoku250114/` | Safety / Privacy | `?source=moterist&intent=beginner` |
| **954** | `/fanzaotoku/` | Evergreen Sale Hub | `?source=moterist&intent=discount` |
| **1018** | `/saika-kawakita-6/` | Actress Arc | `?source=moterist&intent=actress` |

## 3. 執行ガイドラインと防衛線
- **本文の完全固定**: 記事本文テキストへの改変・修正は一切禁止（SEO body 永久保護）。
- **URL 不変**: パーマリンク（スラッグ）は 1 文字も変更しない。
- **HTML のサージカル置換**: 既存の古い CTA リンク（`?source=moterist` 単体）を検出し、上記インテント付き URL へ WP-CLI または Safe-Append ランブックで安全置換。`wp-admin` 編集画面は開かない（TinyMCE スタイル破壊防止）。
- **ROI の明記**: 本作業は T-02 由来の実験的動線統合であり、Google 検索流入の純増ではなく「流入したユーザーの成約率（漏斗底上げ）」が目的。moterist 検索流入は ~ゼロ（adult デランク）であり、効果は流入がある分のみに限定される。

## 4. 注記（前提整合）
- mixhost SSH は classifier ブロックの履歴あり（`reference_mixhost_ssh_classifier_block`）。注入は SSH 直叩きではなく、実績のある Safe-Append ランブック / WP-CLI 経路で、人手の認可下に行う（無人 SSH 一斉注入は不採用）。
- 集客の主軸は引き続き Option 3（vodnavi.jp clean + X/SNS → app）。本ブリーフは既存 moterist 資産の CTA 整合に限定。
