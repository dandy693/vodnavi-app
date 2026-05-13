# Day 5 WordPress Implementation Steps

## Objective

moterist.comの改善施策をWordPressへ反映する前の安全手順を定義する。

本ファイル作成時点では、まだ本番サイトへの変更は行わない。

## Pre-Implementation Checklist

### Backup

- [ ] mixhost WordPress Toolkitの最新バックアップがある
- [ ] WordPress標準エクスポートが保存されている
- [ ] 変更対象記事の現本文をローカルに保存する
- [ ] 変更前URL・タイトル・ステータスを記録する

### Safety

- [ ] 対象記事に未成年想起表現がないか確認する
- [ ] 過度に露骨な表現がないか確認する
- [ ] アフィリエイトリンク数を目視確認する
- [ ] 画像・サンプル素材の利用ルールを確認する
- [ ] noindex対象は理由と復帰条件を記録する
- [ ] 301リダイレクトは統合先完成後に行う

### Measurement

- [ ] GA4でページ閲覧が確認できる
- [ ] FANZAクリックイベントの計測方針を決める
- [ ] 変更前のPV・クリック・成果状況を保存する

## Implementation Order

### Phase 1: Safety Response

Target:

- 1018

Actions:

1. 現本文を確認
2. タイトル・見出し・本文・タグ・metaを確認
3. リスク表現を洗い出す
4. 一時noindexまたはリライト方針を決める
5. 変更案を作る
6. 人間確認後に反映する

Do not:

- 即削除しない
- 統合先なしで301しない
- 表現を強めない

---

### Phase 2: Core Article Rewrite

Targets:

- 1095
- 1106
- 994

Actions:

1. 現本文をバックアップ
2. 新構成案を作成
3. CTAと内部リンクを整理
4. FAQを追加
5. 表・比較要素を追加
6. タイトル・メタディスクリプションを調整
7. 公開前チェックリストを通す

---

### Phase 3: Sale Hub Rebuild

Target:

- 954

Actions:

1. 古い季節キャンペーン情報を確認
2. 常時更新型の構成へ変更
3. 開催中セール確認CTAを設置
4. 初心者記事・安全記事・ランキング記事へ内部リンク
5. X投稿から送る中継ページとして整備

---

### Phase 4: Summary Pages

Targets:

- 川北彩夏まとめ
- 三上悠亜まとめ
- miruまとめ
- 白桃はなまとめ
- 石川澪まとめ

Actions:

1. 統合対象記事を確認
2. まとめページ構成を作る
3. 旧記事から新まとめへ内部リンクする
4. 成果が出たらnoindex/301を検討する
5. 検索評価とユーザー導線を確認する

## WordPress Editing Rule

原則として、変更前に以下をローカル保存する。

- post_id
- URL
- 変更前タイトル
- 変更前本文
- 変更前ステータス
- 変更前meta
- 変更理由
- 変更日時

## Rollback Rule

問題が起きた場合は、以下の順で戻す。

1. 変更した記事本文をローカルバックアップから復元
2. タイトル・metaを戻す
3. noindexを戻す
4. 必要に応じてmixhostバックアップを確認
5. operation-log.mdに記録

## Operation Log Rule

本番に変更を加えた場合、必ず以下を記録する。

- 実施日時
- 対象post_id
- 対象URL
- 変更内容
- 変更理由
- 変更前バックアップの有無
- 確認結果
- 次回作業

## Status

- 本番反映：未実施
- 記事削除：未実施
- noindex：未実施
- 301リダイレクト：未実施
