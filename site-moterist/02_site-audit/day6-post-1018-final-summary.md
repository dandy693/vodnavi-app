# Day 6 Post 1018 Final Summary

## 作成したファイル

- `03_content/rewrites/post-1018-final-rewrite.md`
- `02_site-audit/day6-post-1018-diff-review.md`
- `02_site-audit/day6-post-1018-noindex-decision.md`
- `07_wp/day6-post-1018-wordpress-edit-plan.md`
- `02_site-audit/day6-post-1018-final-summary.md`

## 現在の推奨方針

- 削除ではなく、安全表現へリライトする
- 即時に一括修正できるなら、noindexせず公開維持を優先候補とする
- タグ、メタ、画像alt まで同時に直せない場合は、一時noindex案も保持する
- 将来的には `河北彩伽 出演作レビューまとめ` へ統合しやすい構成に寄せる

## 表記統一

- 最終リライト案、差分確認メモ、noindex判断案、WordPress反映前メモの女優名表記を `河北彩伽` に統一した

## 本番反映前に人間が確認すべきこと

- 女優名表記がタイトル、本文、メタ、タグ候補、内部リンク文言まで `河北彩伽` で統一されているか
- 作品タイトル、配信開始日、発売日、収録時間など基本情報の整合性
- カテゴリー `美少女` を維持するか見直すか
- 画像alt、タグ、メタディスクリプションに危険語が残っていないか
- CTAとFANZAリンク数が過多でないか
- noindexを使うかどうかの最終判断

## Status

- production_edit_performed: `no`
- noindex_performed: `no`
- delete_performed: `no`
- redirect_performed: `no`
