# Day 9 Service Worker Cache Review Plan

## 1. 背景

Day 8 では、`1106` / `994` の本番修正後、通常URLで旧表示が残る現象が発生した。一方で、管理画面保存済み本文、クエリ付きURL、サーバー側 curl、新規ブラウザコンテキストでの Service Worker ブロック確認では、新HTMLが返っていた。

## 2. 現状のserviceWorker.js挙動

- `serviceWorker.js` が存在する
- fetch イベントで HTML レスポンスを Cache Storage に保存・再利用する実装が確認されている
- THE THOR 側で Service Worker が登録されている
- Chrome DevTools 上で `moterist.com` の Service Worker と `cache-v...` の Cache Storage が確認されている

## 3. 記事更新時に旧HTMLが残るリスク

- 記事本文更新後も、通常ブラウザで旧HTMLが表示される
- 人間確認時に「未反映」と誤判定しやすい
- キャッシュ削除を何層も試しても、ブラウザローカル要因を見落とすと調査が長引く
- 公開後の品質確認フローにノイズが入る

## 4. 影響範囲

- WordPress 記事本文の更新確認
- CTA文言差し替え確認
- 内部リンク変更確認
- メタ情報反映確認
- スマホ表示レビュー
- 本番反映直後の人間確認運用全般

## 5. 調査対象

- `serviceWorker.js`
- THE THOR の PWA 設定
- `wp-content/themes/the-thor/inc/pwa/serviceWorker.php`
- `wp-content/themes/the-thor/inc/parts/wp_footer.php`

## 6. 安全な見直し案

- 記事HTMLを Service Worker でキャッシュしない
  - HTML 文書全体ではなく、画像・CSS・JS 等の静的資産だけを対象に絞る案を優先する
- navigation request は network-first にする
  - 記事更新時に新HTML取得を優先し、失敗時のみキャッシュを返す方針を検討する
- Cache Storage のバージョン更新ルールを見直す
  - テーマ更新時だけでなく、運用上の更新タイミングでも古いHTMLが残りにくい設計を検討する
- PWA 機能停止の可否を検討する
  - サイト特性上、オフライン性より公開記事の即時更新確認を優先すべきかを判断する

## 7. 本番変更前の確認項目

- THE THOR 本体のどこで Service Worker が登録されるか
- 既存キャッシュ対象が HTML / navigation request を含むか
- 変更がテーマ更新で上書きされないか
- テスト環境または限定環境で、更新記事が即時反映されるか
- PWA を弱めた場合のユーザー影響が許容範囲か

## 8. ロールバック方針

- 現行 `serviceWorker.js` と関連登録箇所のバックアップを先に確保する
- 変更差分を小さく保ち、1論点ずつ反映する
- 問題が出た場合は、直前の Service Worker 実装へ戻せるようにする
- ロールバック後も Cache Storage のバージョン整合が取れるか確認する

## 9. 絶対に避けること

- いきなり `serviceWorker.js` を削除する
- THE THOR 本体を直接編集する
- キャッシュ削除だけで恒久対応扱いにする
