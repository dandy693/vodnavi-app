# STRATEGY_BRIEF_121_COLD_START_BREAKTHROUGH — 最速インデックス＆初動点火計画

> 2026-07-02 制定。番号は CSO 指定の 121（120 は欠番・衝突なし確認済）。照合先: `FACT_GOVERNANCE.md`・BRIEF_119。**本ブリーフは新規タスクを起票しない**＝全執行項目は既存トラッカーへの加速指示（§4 dedup: CSO 原案 `T-20260702-GSC-FORCE`/`T-20260702-SNS-FIRE` は既存タスクと重複のため新 ID を発行しない）。

## 1. 現状認識と超加速の必要性
- アクセスが少ない黎明期において、静観は最大の機会損失である。
- 本番 200 OK が実証された 2 本のコンテンツ（BRIEF_118/119・deploy `dn3e6zt5a`）を起点に、SEO クローラと SNS（X）のトラフィック初動を同期させる。

## 2. 具体的な執行要件（既存トラッカーへの前倒し指示）
1. **GSC サイトマップ送信（HUMAN・既存 T-20260627-02 残作業の即時執行指示）**
   - 前提の物理確認は **2026-07-02 完了済**: live `vodnavi.jp/sitemap.xml` は HTTP 200・**11 `<loc>`**（旧 9 + `biblia-erotica-foundation` + `biblia-literature-eroticism`）＝動的 sitemap が新 2 記事を自動収録済（curl 実証）。
   - 残るは GSC プロパティ（authuser=2）への sitemap submit / URL 検査リクエストのみ＝**HUMAN アクション、即時推奨**。
2. **SNS 初動投稿（CCO/HUMAN・既存 T-20260702-SNS-BOUNDS の即時執行指示）**
   - `PROMOTION_ASSETS_077.md` パターン C/D を投下。URL パラメータは **077 確定規約どおり `?utm_source=x&utm_campaign=biblia_001`**（CSO 原案の `utm_source=sns_x` は不採用＝`sns_x` は app 側 `source=` の値であり utm_source は配信面 `x` を入れる。taxonomy 混載の再発防止）。
   - 残ゲート: ハッシュタグの CCO 確定 → 実投稿（HUMAN/CCO）。URL 生存（308→200）は 2026-07-02 実証済。
3. **canonical/host 整合の準備（CTO・既存 T-20260702-CANONICAL-HOST の範囲内）**
   - **Option A（`SITE_ORIGIN`→www）/ Option B（apex 直配信）の両案の影響範囲調査までを前倒し**（変更ファイル一覧・sitemap/JSON-LD/OG 波及・GSC 影響の整理）。**どちらを正とするかの裁定は HUMAN（2026-07-04 アジェンダ #1）のまま**＝本ブリーフは Option A への先行実装を許可しない（片側前提のコード修正着手は裁定の既成事実化になるため不採用）。

## 3. 成功条件（コールドスタート脱出の観測定義）
- GSC: 新 2 記事の「検出−インデックス登録」遷移（submit 後 1〜2 週間観測）。
- GA4: `utm_campaign=biblia_001` セッション > 0（投稿執行後）・hostName=`www.vodnavi.jp` で観測（apex フィルタは空振り注意）。
- いずれも 2026-07-04 サタデー・レビュー（アジェンダ #2）で初回読み合わせ。
