# Day 6 Post 1018 Pre-Production Review

## Target

- post_id: 1018

## Current Status

- Backup saved: yes
- Final rewrite draft created: yes
- Diff review created: yes
- Noindex decision draft created: yes
- WordPress edit plan created: yes
- Production edit performed: no
- Noindex performed: no
- Delete performed: no
- Redirect performed: no

## Naming Policy

- 女優名は「河北彩伽」に統一
- 旧表記や表記ゆれは本番反映時に修正対象
- 既存URLやslugは、変更提案のみ。実変更はまだ行わない

## Risk Word Check

- final_rewrite_risk_words: no
- final_rewrite_naming_ok: yes
- notes: `03_content/rewrites/post-1018-final-rewrite.md` の Proposed Title / Proposed Meta Description / Proposed Body に対象リスク語は見当たらない。`美少女` は Notes for Human Review 内のカテゴリー見直しメモとしてのみ出現する。対象5ファイルの女優名表記ゆれも検出されていない。

## Pre-Production Decision

- タイトル・本文・タグ・メタ・画像altからリスク語を除去できるなら、noindexせず公開維持を検討する
- リライト反映まで時間が空く、またはタグ・メタ・画像altにリスク語が残るなら、一時noindexを検討する
- 削除と301リダイレクトは行わない

## Required Checks Before Editing

- [ ] post-1018-before.md のバックアップが保存済み
- [ ] post-1018-final-rewrite.md のリスク語チェック済み
- [ ] 「河北彩伽」表記に統一済み
- [ ] noindex判断案を確認済み
- [ ] WordPress編集手順を確認済み
- [ ] mixhostバックアップが存在する
- [ ] 本番反映後に公開画面を確認する準備がある

## Production Edit Status

- 本文変更：未実施
- noindex：未実施
- 削除：未実施
- 301リダイレクト：未実施
