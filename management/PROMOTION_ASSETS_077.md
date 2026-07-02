# SNS PROMOTION ASSETS: brand_pilot_001（BRIEF_077 Track C）

> **出自**: CSO `cso_sitemap_and_promotion_bridge.sh`。配信先 = `https://vodnavi.jp/vod-selection-guide`（clean・live・HTTP 200）。
> **実投稿は HUMAN/CCO アクション**（本ファイルは原稿アセット）。SNS 直接流入は Google インデックス状況に依存しないため、記事インデックス浸透を待つ間の**初期送客レバー**として機能する（BRIEF_077 §4「funnel は動くが誰も通らない」リスクの緩和策）。

## 配信コンセプト
一般の映画・エンタメ潜在層へ、俗悪表現（18 禁ワード）を 100% 排除しつつ「映像を私蔵の書庫として選ぶ」という知的フックで `/vod-selection-guide` へ誘引する。

## 訴求パターン A：知的審美眼（映画 / カルチャー層向け）
> 投稿本文（X・280 字以内）

動画配信サービスの比較表を眺めるのは、もうやめましょう。画質や料金ではなく「どのような知性と感性に投資するか」という審美眼で選ぶ、大人のための VOD 選び。表の書架には並ばない、あなたの今夜を処方する私設図書館の扉はこちら。
https://vodnavi.jp/vod-selection-guide

## 訴求パターン B：コンシェルジュ直撃（3 タップ診断強調）
> 投稿本文（X・280 字以内）

配信サイトの検索窓には出てこない、ディープな映像アーカイブ。あなたの今の気分（物語重視か、圧倒的な臨場感か）をわずか 3 タップするだけで、匿名で最高の一本を処方する「AI コンシェルジュ」。今夜の処方箋を引きたい方はこちらへ。
https://vodnavi.jp/vod-selection-guide

## 運用メモ
- リンクは素の記事 URL でよい（記事末尾の bridge が `/lp?source=brand_pilot_001` を自動付与）。**SNS→記事の流入を分離計測したい場合**は SNS 側リンクに `?utm_source=x&utm_campaign=brand_pilot_001` を付与する。
- リンク先は clean 記事だが funnel 下流は成約導線のため、有料/アフィリ色の強い運用では各 SNS の広告/#PR 表記ガイドラインに従う。
- 投稿前に記事 URL が 200 で生存していることを確認（現状 live・200）。

---

# [EXTENSION 2026-07-02] biblia-erotica-foundation 向け clean スニペット（T-20260702-SNS-BOUNDS / BRIEF_119 §3）

> **出自**: CSO `execute_cso_mandate_119.sh` を CTO 是正のうえ採録。配信先 = `https://vodnavi.jp/biblia-erotica-foundation`（**現状 未 deploy＝404**。clean 層は auto-deploy されないため、**実投稿は手動 prod deploy 後に URL 200 を確認してから**）。
> **実投稿は HUMAN/CCO アクション**（本ファイルは原稿アセット）。CSO 原案の「クリーンな仮面の裏に隠された」等、境界構造を公然と示唆する文言・記事の実内容（教養・選書）と乖離する煽り文は clean 面規約（BRIEF_051）に反するため**不採用**。

## 訴求パターン C：選書体験（教養・読書層向け）
> 投稿本文（X・280 字以内）

一冊の本を選ぶように、一本の映像を選ぶ——。図書館の価値は蔵書の量ではなく、司書のまなざしにあります。あなたの今夜の気分から最適な一本を選び出す、新しい「選書」の愉しみ。
https://vodnavi.jp/biblia-erotica-foundation

## 訴求パターン D：知性×情動（映画・カルチャー層向け）
> 投稿本文（X・280 字以内）

映画が映し出す孤独の輪郭も、教養としての映像美も、同じ書架のうえで静かに隣り合っている。知性と情動が交わる夜の書斎へ、今宵の一冊を探しに。
https://vodnavi.jp/biblia-erotica-foundation

## 運用メモ（C/D 共通）
- **URL パラメータ**: 本ファイル既存の運用メモに従い、SNS→記事の分離計測は `?utm_source=x&utm_campaign=biblia_001` を付与（GA4 native 属性）。**`?source=sns_x` は付けない**＝`source=` は app 側 `sources.ts`/concierge 機構の識別子であり、site-brand 記事 URL では未消費（CSO 原案から是正・taxonomy 混載防止）。記事内 CTA が `source=brand&intent=wisdom` を既に運搬するため下流計測は既配線。
- 投稿前チェック: (1) 手動 prod deploy 済みか (2) `curl -I` で 200 か (3) ハッシュタグは CCO 確定（原案 `#ビブリアエロティカ` 等は仮）。
