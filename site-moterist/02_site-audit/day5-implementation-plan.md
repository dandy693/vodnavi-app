# Day 5 Implementation Plan

## Objective

Day 5では、本番サイトを直接変更せず、moterist.com改善のための実装設計を作成する。

Day 4で作成した分類結果をもとに、以下を設計する。

1. 緊急安全対応
2. 中核記事のリライト設計
3. セールハブ設計
4. 女優別・ジャンル別まとめの優先順位
5. WordPress反映手順

## Current Status

- WordPress標準エクスポート取得済み
- mixhost WordPress Toolkitで完全バックアップ作成済み
- 既存58件の記事棚卸し済み
- 優先30件の分類済み
- delete候補：0件
- 本番記事の削除・noindex・本文変更は未実施

## Day 4 Final Direction

### Keep

以下3記事を中核資産として活用する。

- 1095：FANZA初心者向け
- 1106：FANZA入会メリット
- 994：FANZA安全な使い方

### Rewrite

以下を優先的にリライト・再構築する。

- 954：セール常設ハブ
- 120：女優別レビュー代表記事
- 100：シチュ別ランキング起点

### Safety Priority

- 1018：未成年想起ワードを含むため、最優先で安全対応を検討する

### Merge

薄い作品単体記事は、女優別まとめ・ジャンル別まとめへ統合する。

## Implementation Policy

### Do

- 削除よりもリライト・統合・noindex候補化を優先する
- まとめページ完成後に301リダイレクトを検討する
- Xからは作品単体記事ではなく、初心者・セール・ランキング系へ送客する
- アフィリエイトリンクは記事ごとに整理する
- 未成年想起・過度な露骨表現は安全側に倒す

### Do Not

- いきなり記事を削除しない
- 統合先ページがない状態で301を設定しない
- noindexを大量に一括適用しない
- Xからリスクの高い作品単体記事へ直接送客しない
- 無断素材・過度な表現・誤認表現を使わない

## Day 5 Deliverables

- 02_site-audit/day5-safety-action-plan.md
- 03_content/briefs/day5-core-article-briefs.md
- 03_content/briefs/day5-sale-hub-brief.md
- 03_content/briefs/day5-actress-summary-priority.md
- 07_wp/day5-wordpress-implementation-steps.md

## Next Phase

Day 6以降で、設計に基づき下書き作成・リライト案作成・WordPress反映手順のテストを行う。
