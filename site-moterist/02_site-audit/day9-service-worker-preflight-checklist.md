# Day 9 Service Worker Preflight Checklist

## 実装目的

Day 9 の目的は、`moterist.com` で記事HTMLが `Service Worker / Cache Storage` に残り続けることを防ぎ、記事更新後の通常URL確認で stale HTML が返るリスクを下げること。

今回の対象は `記事HTMLのキャッシュ除外` に限定し、静的資産キャッシュは残す。

## 採用予定ルート

採用予定ルートは以下。

1. `the-thor-child` を第一候補として使う
2. 子テーマで差し替え困難な場合は `MUプラグイン` を追加する
3. `fit_pwaFunction_switch` は `on` のまま維持する
4. `document / navigate` を Service Worker キャッシュ対象から外す
5. `THE THOR` 本体は直接編集しない

## 実装前バックアップ対象

本番反映前に必ず確保すべき対象は以下。

- `/home/rvpuxcjb/public_html/moterist.com/serviceWorker.js`
- `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor/inc/pwa/serviceWorker.php`
- `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor/inc/parts/wp_footer.php`
- `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor-child/` 配下の現行ファイル一式
- `/home/rvpuxcjb/public_html/moterist.com/wp-content/mu-plugins/` がある場合はその一覧と現行ファイル
- PWA 関連の管理画面設定値
- Chrome DevTools 上の現行 Service Worker 登録状態
- Chrome DevTools 上の `Cache Storage` 状態

推奨する保存形:

- ファイル実体のコピー
- 設定値のメモとスクリーンショット
- 反映前の通常URL表示キャプチャ

## 実装前確認項目

- `fit_pwaFunction_switch` が現在 `on` であること
- `serviceWorker.js` が `fit_add_serviceWorker()` により再生成されること
- `wp_footer.php` で `navigator.serviceWorker.register()` が出力されること
- `the-thor-child` に追加コードを置けること
- `wp-content/mu-plugins/` が未作成なら、新設可否を把握していること
- 現行の `CACHE_NAME` を控えていること
- 現行 Service Worker が `caches.match(event.request)` を先に行うこと
- `document / navigate` 除外後も、CSS / JS / 画像キャッシュを残す方針で問題ないこと

## the-thor-child 案の確認項目

- 子テーマの `functions.php` に追加してよい運用か
- 子テーマ側で PWA 制御用の分離ファイルを持てるか
- THE THOR の `fit_add_serviceWorker()` や関連フックに対して、子テーマから差し替えまたは追記制御できるか
- テーマ更新時に子テーマ差分が保持される運用になっているか
- 子テーマ側で `serviceWorker.js` 生成結果の制御責務を持たせても追跡可能か

子テーマ案を採る条件:

- 本体編集なしで生成内容差し替えの導線が確保できること
- 実装差分が子テーマ内だけで閉じること

## MUプラグイン案の確認項目

- `wp-content/mu-plugins/` を新設して問題ないか
- MUプラグインを常時有効の運用資産として扱えるか
- テーマの PWA ロジックをテーマ外から制御することにチーム合意があるか
- 生成フックや出力制御を MUプラグイン側から安全に差し込めるか
- 子テーマよりも更新耐性を優先したいか

MUプラグイン案を採る条件:

- 子テーマだけではフック制御が不安定
- 生成 / 登録制御をテーマ更新から切り離したい

## serviceWorker.js 生成内容の方針

差し替え方針は以下。

- `CACHE_NAME` は変更時に上げることを検討する
- `urlsToCache` の見直しではなく、fetch イベントの `HTML 保存禁止` を主軸にする
- `neverCacheUrls` 依存ではなく、request 種別で除外する
- `request.mode === 'navigate'` をキャッシュしない
- `Accept: text/html` を含む request をキャッシュしない
- CSS / JS / 画像などの静的資産だけを既存キャッシュ戦略に残す

## fetchイベントの除外仕様

除外対象:

- `request.mode === 'navigate'`
- `Accept` ヘッダーに `text/html` を含む request

保存対象として残すもの:

- CSS
- JavaScript
- 画像
- フォント
- 必要な静的アセット

除外仕様の意図:

- 記事本文や固定ページ本文の stale HTML を残さない
- 静的資産の再訪高速化は維持する

補足:

- オフライン時の HTML 表示まで残したいなら `network-first` も候補だが、最小変更では `HTML を保存しない` 方が優先

## 本番反映手順の概要

1. バックアップを確保する
2. 実装ルートを `the-thor-child` または `MUプラグイン` に確定する
3. `serviceWorker.js` 生成内容の差し替えコードを追加する
4. `document / navigate` 除外仕様だけを入れる
5. 必要に応じて `CACHE_NAME` 更新を行う
6. Service Worker 再登録状態を確認する
7. 通常URLと新規コンテキストで表示差がないか検証する

## 反映後検証項目

- 通常ブラウザで更新記事が新HTMLを返すか
- 新規ブラウザコンテキストでも同じHTMLが返るか
- `1106` / `994` のような記事変更で旧表示が再発しないか
- Chrome DevTools の `Cache Storage` に記事HTMLが残っていないか
- CSS / JS / 画像の読み込みが崩れていないか
- スマホ幅で表示崩れがないか
- `Service Worker 無効化確認 / 新規コンテキスト / サーバーcurl確認` の運用手順が継続可能か

## ロールバック手順

1. 追加した子テーマコードまたは MUプラグインを無効化または差し戻す
2. 必要なら変更前バックアップからファイルを戻す
3. Service Worker 登録状態を再確認する
4. `Cache Storage` の状態を確認する
5. 通常ブラウザで表示崩れやアセット欠落がないか確認する
6. 最小変更で復旧できない場合だけ、代替案として `fit_pwaFunction_switch = off` を検討する

## 実装中止条件

- 子テーマ / MUプラグインから生成内容を安全に差し替えられない
- 実装に THE THOR 本体編集が必要になる
- HTML 除外だけでは済まず、PWA 全体停止が必須になる
- 静的資産キャッシュまで壊すリスクが高い
- ロールバック手順が実行可能な形で確保できない

## やってはいけないこと

- `THE THOR` 本体ファイルを直接編集する
- `serviceWorker.js` を手編集して終える
- `serviceWorker.js` を削除する
- キャッシュ削除だけで恒久対応完了と判断する
- `fit_pwaFunction_switch = off` を、代替案評価なしで先に採用する
- `noindex`、削除、301、slug変更、記事本文変更を混ぜる
