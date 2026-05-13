# Day 7 Summary

## 作成したファイル

- `02_site-audit/day7-core-articles-extraction-summary.md`
- `02_site-audit/day7-core-articles-plan.md`
- `02_site-audit/day7-summary.md`
- `03_content/briefs/day7-core-articles-rewrite-strategy.md`
- `07_wp/article-backups/post-1095-before.md`
- `07_wp/article-backups/post-1106-before.md`
- `07_wp/article-backups/post-994-before.md`

## バックアップ保存状況

- post_id 1095: 保存済み
- post_id 1106: 保存済み
- post_id 994: 保存済み
- 取得元: `07_wp/export/moterist-wp-export-20260502-clean.xml`

## 実施内容

- 既存スクリプト `scripts/extract-single-post-from-wxr.ps1` を使って、対象3記事をXMLからローカル抽出した
- 各記事のタイトル、URL、ステータス、カテゴリー、タグ、投稿日、更新日、本文を含むバックアップを保存した
- 本文全文を含めない抽出サマリーを作成した
- 3記事の役割分担、内部リンク方針、954セールハブとの接続方針を整理した
- Day 7 の作業計画を作成した

## 未実施事項

- 本番更新未実施
- noindex未実施
- delete未実施
- redirect未実施

## 次に行うこと

- 1095の最終リライト案を作成する
- 1095の安全表現と変動情報の扱いを先に確定する
- その後に 1106 / 994 の最終リライト案へ進む
- 3記事の相互内部リンク文言を実装前に揃える
