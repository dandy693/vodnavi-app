# Day 9 Service Worker Completion Summary

## 1. Day 9 の目的

Day 9 の目的は、`moterist.com` で公開記事更新後に旧HTMLが残る問題に対して、`Service Worker / Cache Storage` の運用を見直し、記事HTMLを stale 化しにくい状態へ改善することだった。

## 2. 背景となった Day 8 の Service Worker / Cache Storage 問題

Day 8 では、`1106` / `994` の記事本文修正後、管理画面保存済み本文、サーバー curl、Service Worker をブロックした新規ブラウザコンテキストでは新HTMLが返っていた一方、通常ブラウザでは旧HTMLが見えるケースがあった。

その切り分け結果から、主因はサーバー側ではなく、ブラウザ側の `Service Worker / Cache Storage` による HTML 再利用と判断した。

## 3. 採用した実装ルート

採用ルートは `MUプラグイン` 第一候補。

- `wp-content/mu-plugins/day9-service-worker-override.php` を配置
- THE THOR 本体は直接編集しない
- `serviceWorker.js` は削除しない
- `fit_pwaFunction_switch` は `on` のまま維持

## 4. MUプラグインを第一候補にした理由

- THE THOR の `fit_add_serviceWorker()` が `customize_register` / `transition_post_status` / `wp_login` / `wp_logout` にフックされ、`serviceWorker.js` を再生成するため
- 子テーマよりも `MUプラグイン` の方が常時読み込みで再生成後の制御維持に有利だったため
- テーマ更新の影響を受けにくく、ロールバックをファイル単位で扱いやすいため

## 5. 実装した MUプラグインの役割

`day9-service-worker-override.php` の役割は以下。

- THE THOR 本体を編集せずに、安全版 `serviceWorker.js` を生成する
- `document / navigate / text/html / GET以外` をキャッシュ対象外にする
- `style / script / image / font` の静的資産だけを `Cache Storage` 対象に残す
- 再生成フック後も安全版を維持する

## 6. `serviceWorker.js` の変更後仕様

公開確認できた変更後仕様は以下。

- `CACHE_NAME`: `cache-v260506-day9-static-assets-v1`
- `request.mode === "navigate"` は除外
- `request.destination === "document"` は除外
- `Accept: text/html` を含む request は除外
- `request.method !== "GET"` は除外
- `wp-admin / wp-login / preview=true` は除外
- `style / script / image / font` だけを静的資産キャッシュ対象にする
- 保存時は `cache.put(request, responseToCache)` を使う

## 7. キャッシュ対象外にしたリクエスト

- `document` request
- `navigate` request
- `text/html` を返す request
- `GET` 以外の request
- `wp-admin / wp-login / preview=true` を含む request
- `request.destination` が空、または `style / script / image / font` 以外の request

## 8. キャッシュ対象として残したリクエスト

- `request.destination` が以下の静的資産
  - `style`
  - `script`
  - `image`
  - `font`

## 9. 確認済み項目

- MUプラグインが `must-use` として認識されること
- PHP 構文チェック通過
- `function_exists('day9_sw_override_write_file')` が `function exists`
- `serviceWorker.js` が安全版へ切り替わっていること
- 旧 `cache-v260506182046` が公開 `serviceWorker.js` に残っていないこと
- 旧 `cache.put(event.request, responseToCache)` が残っていないこと
- `wp-load.php` 読み込み後も安全版が維持されること
- 通常コンテキストと `serviceWorkers: 'block'` 新規コンテキストで記事本文差が出ていないこと

## 10. `1106` / `994` / `1095` の公開確認結果

### 1106

- `FANZA公式ページで登録前の案内を確認する` を確認
- 末尾 `開催中のセール・キャンペーン情報を確認する` は消えている
- スマホ幅でも末尾圧迫感軽減を維持

### 994

- `FANZA公式ページで利用前の案内を確認する` を確認
- 末尾 `開催中のセール・キャンペーン情報を確認する` は消えている
- スマホ幅でも末尾圧迫感軽減を維持

### 1095

- `FANZA公式で最新情報を確認する` を確認
- `開催中のセール・キャンペーン情報を確認する` は残存
- 変更なしとして想定どおり

## 11. 意図しない変更がないこと

確認範囲で、以下の意図しない変更は見ていない。

- `noindex` 追加
- canonical 変更
- title 変更
- meta description 変更
- 外部リンクURL / アフィリエイトURL変更

## 12. 既存閲覧者ブラウザに旧 Cache Storage が残る可能性

Day 9 実装後も、既存閲覧者ブラウザには旧 `Service Worker / Cache Storage` が残る可能性がある。

そのため、旧表示が残る場合は以下として扱う。

- サーバー側の本文や公開 `serviceWorker.js` が正常なら、まずブラウザローカル要因と判断する
- 必要に応じて Service Worker 更新待ち、または Cache Storage 削除を案内対象とする

## 13. ロールバック方針

- `wp-content/mu-plugins/day9-service-worker-override.php` を対象ファイル単位で退避 / 復元する
- 変更前に保存した `serviceWorker.js` を戻す
- DevTools で Service Worker 登録状態と Cache Storage 状態を確認する
- THE THOR 本体は触らない

## 14. 残課題

### WP-CLI 出力に Ahrefs script が混入する件

- Day 9 本筋への影響は軽微
- ただし、運用コマンド出力のノイズ要因として別課題候補

### 旧 Service Worker 保持ブラウザへの扱い

- 旧ブラウザローカルキャッシュが残る閲覧者への説明方針
- どの時点で「更新待ち」か「削除案内」かを分けるか

## 15. Day 9 の最終結論

Day 9 の `Service Worker / PWA キャッシュ見直し` は、本番反映と公開確認まで完了した。

結果として、

- 記事HTML stale 化の主因だった `Service Worker / Cache Storage` の挙動を是正
- THE THOR 本体を編集せずに MUプラグインで制御
- `1106` / `994` / `1095` の公開状態も正常維持

という状態を確認できた。
