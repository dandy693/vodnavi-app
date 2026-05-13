# Day 7 Core Articles Extraction Summary

## Objective

post_id 1095 / 1106 / 994 の現状を、WordPressエクスポートXMLからローカル抽出して記録した。

本文全文は `07_wp/article-backups/` に保存し、本ファイルでは集計サマリーのみを扱う。

## Extraction Results

| post_id | current_title_summary | status | post_type | content_length | category_count | tag_count | affiliate_pattern_hits | risk_word_hits | backup_saved |
| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |
| 1095 | FANZA初心者向けの入口記事。現タイトルは「FANZAってどんなサイト？」軸 | publish | post | 5605 | 1 | 0 | FANZA:46, fanza:46, DMM:6, dmm:6, al.dmm:1 | 未成年:1, 少女:1, 美少女:1 | yes |
| 1106 | FANZA入会メリット訴求記事。無料コンテンツと特典の説明軸 | publish | post | 7905 | 1 | 0 | FANZA:35, fanza:35, DMM:4, dmm:4, affiliate:1, al.dmm:1 | none | yes |
| 994 | FANZAの安全な使い方記事。初心者向けの不安解消軸 | publish | post | 3260 | 1 | 0 | FANZA:14, fanza:14, DMM:4, dmm:4, al.dmm:1 | none | yes |

## Notes

- 3記事とも `publish` / `post` で抽出できた。
- 3記事ともカテゴリーは `お役立ち情報` 1件、タグは0件だった。
- 1095は入口記事候補として有効だが、現本文内に `未成年` `少女` `美少女` のヒットがあるため、最終リライト時に安全表現へ整理する。
- 1106は3記事の中で本文量が最も多く、CV導線強化のベースにしやすい。
- 994は安全性・支払い・不安解消の受け皿として残せるが、本文量は短めのためFAQと公式確認導線の強化余地がある。
- 本番更新、noindex設定、削除、301リダイレクトは本作業では行っていない。
