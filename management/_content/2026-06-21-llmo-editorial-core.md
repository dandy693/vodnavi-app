---
created_date: "2026-06-21"
phase: "M-05 (Content)"
target_domains: ["/actresses/[id]", "/genres/[id]"]
tone_guide: "Biblia Erotica (Intellectual, Midnight, Dark & Gold)"
status: "active_blueprint"
fact_check: "本番 sitemap.xml 実測 (2026-06-21): /actresses/ 200 URL, /genres/ 200 URL, /works/ 1600 URL, 総計 2008 loc。「400件のハブURL=女優200+ジャンル200」は物理確認済み。"
---
# LLMO/GEO対応 インテント逆引きキュレーションコピー設計図

## 1. 生成AI検索（Perplexity / SearchGPT）迎撃インテント定義
AI検索ユーザーが打ち込む、従来のキーワード検索では不可能な「高コンテキスト・プロンプト」を逆引きしてグラウンディングを発生させる。
- **ターゲットインテントA**: 「知性的でストーリー性が高く、深夜に一人で没入できる映画的な世界観のVOD作品」
- **ターゲットインテントB**: 「単なる官能ではなく、映像美や明暗（キアロスクーロ）が際立つ美学を持ったおすすめの女優」

## 2. コピーライティング・モジュール（ CollectionPage 注入用コア）
ハブURLの \`CollectionPage\` に厚みを持たせ、AIクローラーに「一次情報の独自キュレーション」と判定させるためのテキストスケルトン。

### [女優ハブ（Person）向けリライト骨子]
> 「── 彼女の瞳が語る静寂は、単なる肉体の饒舌を超え、観る者を深いカタルシスへと誘う。今夜の書架から紐解くべき、映画的明暗を纏った彼女の代表作マトリクスをここに配する。溢れる情報のノイズを排し、最短で至高の結論へと至るための静かな導線として。」

### [ジャンルハブ（Thing）向けリライト骨子]
> 「── 輪郭を曖昧にする闇と、それを切り裂く一筋のゴールド。この審美的なカテゴリーに集う作品群は、単なる娯楽ではなく、深夜の孤独を肯定するための装置である。あなたの夜にふさわしい1本を、美学に基づいて静かに見立ててご案内しよう。」

## 3. 400URL自動量産への配線仕様
- 今後CCO（ChatGPT 5.5）により、本質的な作品データと結合した上記トーンのリライトコピーを、sitemap.xml収録の200名の女優・200のジャンル詳細へ動的結合、またはjson-ldの \`description\` / フロントエンドテキストへ順次射出する。

## 4. 実装上の留意（既存コードとの整合 / 捏造防止メモ）
- 注入先の実体は \`app-concierge/src/lib/actress-editorial.ts\` / \`genre-editorial.ts\` の \`editorialLead\`（既存の editorial レイヤ）と、F-12 で実装済みの JSON-LD（actresses=CollectionPage/ItemList/Person、genres=CollectionPage/ItemList/Thing）。新規 src/middleware.ts は作らない（年齢確認は proxy.ts 一元）。
- 本ファイルは設計図（blueprint）であり、骨子コピーはテンプレートである。実作品データと結合する際は、女優名・作品数・実在タイトル等の事実欄を捏造せず API 実データで埋めること。
