# Day 9 Service Worker Pre-Execution Approval Check

## 実行可否

結論は `条件付きで実行可`。

理由:

- MUプラグイン実装コマンド文書は、危険な `rm -rf` を除去済み
- `serviceWorker.js` の削除や THE THOR 本体直接編集を避ける構成になっている
- バックアップ、構文チェック、`serviceWorker.js` 内容確認、サーバー curl、DevTools 確認、ロールバック手順が含まれている

一方で、実行前に人間が確認すべき未決事項が残るため、無条件承認ではない。

## 実行可と判断する条件

- `wp-content/mu-plugins/` が本番で自動読込されることを確認できる
- `fit_pwaFunction_switch` が `on` のままであることを確認できる
- `serviceWorker.js` の出力先が書き込み可能であることを確認できる
- 変更前バックアップを確実に取得できる
- `request.destination` が空になる静的資産をキャッシュ対象から外して問題ないと判断できる
- `CACHE_NAME` を今回どの値にするか人間側で確定している
- 投稿更新、ログイン、ログアウト後の再生成確認まで実施する前提で動ける
- DevTools で Service Worker / Cache Storage を確認できる担当者がいる

## 実行不可と判断する条件

- `wp-content/mu-plugins/` の自動読込可否が不明
- `serviceWorker.js` の書き込み権限が不明または不足
- 変更前バックアップが取得できない
- `request.destination` が空の静的資産をどう扱うか決められていない
- `CACHE_NAME` の更新ルールが決まっていない
- 再生成後確認、DevTools 確認、サーバー curl 確認の担当が不在
- ロールバック手順を実行できる状態にない

## 実行直前に人間が確認すべきこと

- `wp-content/mu-plugins/` が有効な運用パスか
- `wp-content/mu-plugins/day9-service-worker-override.php` を追加して問題ないか
- `serviceWorker.js` の現在内容と退避ファイル保存先
- `fit_pwaFunction_switch` の現在値
- `CACHE_NAME` に採用する固定値
- `request.destination` が空の静的資産を今回の対象外にして問題ないか
- 投稿更新、ログイン、ログアウト後の再生成確認を同日に実施できるか

## 実装時に最初に実行するバックアップ

最初に実行すべきなのは、以下のバックアップコマンド群。

```bash
cd /home/rvpuxcjb/public_html/moterist.com
mkdir -p ~/day9-sw-backup
cp -p serviceWorker.js ~/day9-sw-backup/serviceWorker.js.before-day9
cp -p wp-content/themes/the-thor/inc/pwa/serviceWorker.php ~/day9-sw-backup/the-thor-serviceWorker.php.readonly-backup
cp -p wp-content/themes/the-thor/inc/parts/wp_footer.php ~/day9-sw-backup/the-thor-wp_footer.php.readonly-backup
cp -pr wp-content/themes/the-thor-child ~/day9-sw-backup/the-thor-child.before-day9
if [ -d wp-content/mu-plugins ]; then cp -pr wp-content/mu-plugins ~/day9-sw-backup/mu-plugins.before-day9; fi
if [ -f wp-content/mu-plugins/day9-service-worker-override.php ]; then cp -p wp-content/mu-plugins/day9-service-worker-override.php ~/day9-sw-backup/day9-service-worker-override.php.before-day9; fi
```

## 実装後に最初に確認すること

実装直後の最優先確認は以下。

- `php -l wp-content/mu-plugins/day9-service-worker-override.php`
- `sed -n '1,260p' serviceWorker.js`
- `grep -n 'request.mode === .navigate.' serviceWorker.js`
- `grep -n 'text/html' serviceWorker.js`
- `grep -n 'request.method === .GET.' serviceWorker.js`
- `grep -n 'wp-admin\|wp-login\|preview=true' serviceWorker.js`

その後に以下を確認する。

- サーバー curl で `serviceWorker.js` の公開内容
- `1106` / `994` / `1095` の通常URL
- DevTools の Service Worker 登録更新
- DevTools の Cache Storage に記事HTMLが残っていないこと

## ロールバック判断基準

以下のいずれかが起きたらロールバック判断に入る。

- `serviceWorker.js` が期待した安全版になっていない
- `document / navigate` が除外されていない
- 静的資産読み込みに崩れが出る
- `1106` / `994` / `1095` の通常URLに意図しない変化が出る
- `noindex` / `canonical` / `title` / `meta description` / 外部リンクURLに意図しない変化が出る
- 投稿更新、ログイン、ログアウト後に安全版が維持されない

## 未決事項

- `wp-content/mu-plugins/` の自動読込確認
- `request.destination` が空の静的資産の扱い
- `CACHE_NAME` の固定値と更新タイミング
- 投稿更新、ログイン、ログアウト後の再生成確認を誰が行うか
- DevTools での古い Cache Storage の消え方をどう評価するか

## 最終推奨

最終推奨は `条件付きで実行承認`。

承認前に最低限そろえるべきなのは以下。

- MUプラグイン自動読込の確認
- `CACHE_NAME` の確定
- `request.destination` が空の資産方針の確定
- バックアップ保存先の確認
- 実装直後の確認担当とロールバック担当の明確化
