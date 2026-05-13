# Day 6 Post 1018 Human Edit Checklist

対象: `post_id 1018`

目的:
WordPress管理画面で人間が安全に確認・入力できるよう、反映手順を実務向けに整理する。

重要:
- このファイルはローカル手順書。WordPress本番への自動反映は行わない
- 本文全文はこのファイルに転記しない
- 削除、301リダイレクト、本文の場当たり修正は行わない
- noindex の最終判断は人間が行う

## 参照ファイル

- 最終レビュー: `02_site-audit/day6-post-1018-pre-production-review.md`
- WordPress編集計画: `07_wp/day6-post-1018-wordpress-edit-plan.md`
- 最終リライト案: `03_content/rewrites/post-1018-final-rewrite.md`
- noindex判断案: `02_site-audit/day6-post-1018-noindex-decision.md`
- 変更前バックアップ: `07_wp/article-backups/post-1018-before.md`

## WordPress編集画面を開くURL

- 記事編集画面: `https://moterist.com/wp-admin/post.php?post=1018&action=edit`

## 編集前に見る項目

- `07_wp/article-backups/post-1018-before.md` が最新の退避版であること
- `03_content/rewrites/post-1018-final-rewrite.md` を今回の唯一の反映元として使うこと
- `02_site-audit/day6-post-1018-pre-production-review.md` の Required Checks Before Editing を確認すること
- `02_site-audit/day6-post-1018-noindex-decision.md` の A案 / B案 の分岐条件を確認すること
- 既存タイトル、既存本文、タグ、カテゴリー、メタディスクリプション、画像alt に危険語や表記ゆれが残っていないか確認する前提で作業に入ること
- 女優名表記を `河北彩伽` に統一する方針を再確認すること

## 変更する項目

- タイトル
- 本文
- メタディスクリプション
- タグ
- カテゴリー
- 画像alt
- FANZAリンクの本数とリンク先
- noindex設定の有無

## 変更しない項目

- 既存URL / slug
- 記事削除
- 301リダイレクト設定
- 公開ステータスの意図しない変更
- 投稿日時、著者、アイキャッチの差し替えが不要なら触らない
- 本文以外の不要なブロック追加

## 貼り付け位置

### Proposed Title の貼り付け位置

- `03_content/rewrites/post-1018-final-rewrite.md` の `## Proposed Title` を、WordPress記事編集画面上部のタイトル入力欄に貼り付ける

### Proposed Meta Description の貼り付け位置

- `03_content/rewrites/post-1018-final-rewrite.md` の `## Proposed Meta Description` を、SEOプラグインのメタディスクリプション欄に貼り付ける
- 使用中プラグイン名が異なっても、検索結果説明文に相当する欄へ入れる

### Proposed Body の貼り付け位置

- `03_content/rewrites/post-1018-final-rewrite.md` の `## Proposed Body` を参照し、WordPress本文エリアへ置き換える
- 既存本文を部分修正で継ぎ足さず、最終案ベースで全体を整える
- 見出し、箇条書き、CTA、内部リンク候補の位置は、読みやすさを優先して整える

## タグ・カテゴリー・画像altの確認項目

- タグは必要最小限に絞り、危険語を含むタグは使わない
- 女優名タグがある場合は `河北彩伽` に統一する
- カテゴリー `美少女` は維持するか差し替えるか、その場で安全性優先で判断する
- 画像alt は画像内容を説明する最小限の文言にする
- 画像alt に危険語、露骨語、誤認を招く語、旧表記が残っていないか確認する

## noindex判断

- `A案`: タイトル、本文、タグ、メタ、画像alt を同じ作業で安全表現へ更新できるなら、noindex せず公開維持を優先する
- `B案`: どれか一つでも当日中に直し切れない、または危険語が残るなら、一時 noindex を検討する
- noindex を使う場合は、復帰条件も `00_admin/operation-log.md` に残す
- タイトルだけ直して他要素を残す中途半端な反映は避ける

## 更新ボタンを押す前の最終確認

- タイトルに危険語が残っていない
- 本文が煽り表現ではなくレビュー文として自然
- 女優名表記が `河北彩伽` に統一されている
- メタディスクリプションに煽りや危険語がない
- タグとカテゴリーが安全方針に沿っている
- 画像alt が修正済み
- FANZAリンク先が正しく、重複CTAが多すぎない
- slug を変更していない
- noindex の有無を決め、必要なら理由を記録できる状態になっている

## 更新後の公開画面確認

- 記事ページの表示崩れがない
- タイトルが意図どおり表示されている
- 本文の改行、見出し、箇条書き、CTA位置が不自然でない
- 画像表示に問題がなく、alt修正漏れがない
- FANZAリンクの遷移先が正しい
- メタディスクリプションがSEOプラグイン上で保存されている
- noindex を変更した場合は、その設定状態を管理画面上でも再確認する
- 危険語や旧表記が公開画面に残っていない

## operation-log.mdに記録する項目

- 実施日時
- 対象 `post_id 1018`
- 更新担当者
- 変更した項目
- noindex の判断結果
- noindex を使った場合の復帰条件
- カテゴリー `美少女` を維持したか差し替えたか
- タグ整理内容
- 画像alt 修正の有無
- 公開画面確認結果
- 問題があった場合のメモ
