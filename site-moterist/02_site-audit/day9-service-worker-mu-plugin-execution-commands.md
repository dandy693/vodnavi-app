# Day 9 Service Worker MU Plugin Execution Commands

## 1. 実行前注意

- 今回の目的は、`serviceWorker.js` の生成内容を安全版へ差し替え、記事HTMLを `Cache Storage` に残さないこと
- 実行者は人間のみ
- 現時点の未反映原因は `MUプラグイン未配置` が最有力
- `THE THOR` 本体ファイルは編集しない
- `serviceWorker.js` は削除しない
- `fit_pwaFunction_switch` は `on` のまま維持する
- 記事本文、DB、`.htaccess`、`wp-config.php`、`noindex`、`canonical`、`title`、`meta description`、`slug` は変更しない
- 変更対象は `wp-content/mu-plugins/` 配下の MUプラグイン追加と、その MUプラグイン経由での `serviceWorker.js` 安全版生成のみ

## 2. SSH接続コマンド

```bash
ssh -i C:\Users\Tachi\.ssh\mixhost_codex_pc -p 22 rvpuxcjb@133.125.148.25
```

## 3. 本番WordPressディレクトリ移動コマンド

```bash
cd /home/rvpuxcjb/public_html/moterist.com
pwd
```

## 4. 実装前バックアップコマンド

```bash
cd /home/rvpuxcjb/public_html/moterist.com
mkdir -p ~/day9-sw-backup
cp -p serviceWorker.js ~/day9-sw-backup/serviceWorker.js.before-day9
cp -p wp-content/themes/the-thor/inc/pwa/serviceWorker.php ~/day9-sw-backup/the-thor-serviceWorker.php.readonly-backup
cp -p wp-content/themes/the-thor/inc/parts/wp_footer.php ~/day9-sw-backup/the-thor-wp_footer.php.readonly-backup
cp -pr wp-content/themes/the-thor-child ~/day9-sw-backup/the-thor-child.before-day9
if [ -d wp-content/mu-plugins ]; then cp -pr wp-content/mu-plugins ~/day9-sw-backup/mu-plugins.before-day9; fi
if [ -f wp-content/mu-plugins/day9-service-worker-override.php ]; then cp -p wp-content/mu-plugins/day9-service-worker-override.php ~/day9-sw-backup/day9-service-worker-override.php.before-day9; fi
ls -la ~/day9-sw-backup
```

## 5. `wp-content/mu-plugins/` の有無確認・作成コマンド

```bash
cd /home/rvpuxcjb/public_html/moterist.com
ls -la wp-content/mu-plugins 2>/dev/null || true
ls -la wp-content/mu-plugins/day9-service-worker-override.php 2>/dev/null || true
mkdir -p wp-content/mu-plugins
ls -la wp-content/mu-plugins
wp plugin list --status=must-use 2>/dev/null || true
```

## 6. 作成するMUプラグインファイル名

```text
wp-content/mu-plugins/day9-service-worker-override.php
```

## 7. MUプラグインの完全なPHPコード

以下を `wp-content/mu-plugins/day9-service-worker-override.php` に保存する。

```php
<?php
/*
Plugin Name: Day 9 Service Worker Override
Description: Overrides THE THOR generated serviceWorker.js with a safe version that does not cache HTML documents.
Version: 1.0.0
Author: moterist-ai-affiliate
*/

if (!defined('ABSPATH')) {
    exit;
}

function day9_sw_override_is_enabled() {
    return get_option('fit_pwaFunction_switch') === 'on';
}

function day9_sw_override_target_path() {
    return ABSPATH . 'serviceWorker.js';
}

function day9_sw_override_cache_name() {
    return 'cache-v260506-day9-static-assets-v1';
}

function day9_sw_override_js() {
    $cache_name = day9_sw_override_cache_name();

    return <<<JS
const CACHE_NAME = '{$cache_name}';
const NEVER_CACHE_PATTERNS = [
  /\\/wp-admin\\//,
  /\\/wp-login/,
  /preview=true/
];
const CACHEABLE_DESTINATIONS = new Set(['style', 'script', 'image', 'font']);

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;
  const accept = request.headers.get('accept') || '';
  const isGet = request.method === 'GET';
  const isNavigate = request.mode === 'navigate';
  const isHtml = accept.includes('text/html');
  const isNeverCache = NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url));
  const isStaticAsset = CACHEABLE_DESTINATIONS.has(request.destination);

  if (!isGet || isNeverCache || isNavigate || isHtml || !isStaticAsset) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});
JS;
}

function day9_sw_override_write_file() {
    if (!day9_sw_override_is_enabled()) {
        return;
    }

    $target = day9_sw_override_target_path();

    if (file_exists($target) && !is_writable($target)) {
        error_log('Day9 SW override: serviceWorker.js is not writable.');
        return;
    }

    if (!file_exists($target) && !is_writable(dirname($target))) {
        error_log('Day9 SW override: target directory is not writable.');
        return;
    }

    $script = day9_sw_override_js();
    $current = file_exists($target) ? file_get_contents($target) : '';

    if ($current === $script) {
        return;
    }

    file_put_contents($target, $script, LOCK_EX);
}

function day9_sw_override_write_file_on_transition($new_status = null, $old_status = null, $post = null) {
    day9_sw_override_write_file();
}

function day9_sw_override_write_file_on_login($user_login = null, $user = null) {
    day9_sw_override_write_file();
}

function day9_sw_override_write_file_on_logout($user_id = null) {
    day9_sw_override_write_file();
}

add_action('customize_register', 'day9_sw_override_write_file', 9999);
add_action('transition_post_status', 'day9_sw_override_write_file_on_transition', 9999, 3);
add_action('wp_login', 'day9_sw_override_write_file_on_login', 9999, 2);
add_action('wp_logout', 'day9_sw_override_write_file_on_logout', 9999, 1);
add_action('admin_init', 'day9_sw_override_write_file', 9999);
```

## 8. MUプラグインが出力・上書きする安全版 `serviceWorker.js` の完全なJSコード

上記 MUプラグインが生成する `serviceWorker.js` の内容は以下。

```js
const CACHE_NAME = 'cache-v260506-day9-static-assets-v1';
const NEVER_CACHE_PATTERNS = [
  /\/wp-admin\//,
  /\/wp-login/,
  /preview=true/
];
const CACHEABLE_DESTINATIONS = new Set(['style', 'script', 'image', 'font']);

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;
  const accept = request.headers.get('accept') || '';
  const isGet = request.method === 'GET';
  const isNavigate = request.mode === 'navigate';
  const isHtml = accept.includes('text/html');
  const isNeverCache = NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url));
  const isStaticAsset = CACHEABLE_DESTINATIONS.has(request.destination);

  if (!isGet || isNeverCache || isNavigate || isHtml || !isStaticAsset) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});
```

注記:

- 今回の固定値は `cache-v260506-day9-static-assets-v1`
- `CACHE_NAME` はリクエストごとに変えず、`ロジック変更時だけ手動で更新する固定値` にする
- `document / navigate request` はキャッシュしない
- `GET` 以外はキャッシュしない
- `wp-admin / wp-login / preview=true` は引き続きキャッシュしない
- `request.destination` が `style / script / image / font` の静的資産のみ `Cache Storage` に保存する

## 9. `serviceWorker.js` を安全版に再生成・上書きするコマンド

```bash
cd /home/rvpuxcjb/public_html/moterist.com
cat > wp-content/mu-plugins/day9-service-worker-override.php <<'PHP'
<?php
/*
Plugin Name: Day 9 Service Worker Override
Description: Overrides THE THOR generated serviceWorker.js with a safe version that does not cache HTML documents.
Version: 1.0.0
Author: moterist-ai-affiliate
*/

if (!defined('ABSPATH')) {
    exit;
}

function day9_sw_override_is_enabled() {
    return get_option('fit_pwaFunction_switch') === 'on';
}

function day9_sw_override_target_path() {
    return ABSPATH . 'serviceWorker.js';
}

function day9_sw_override_cache_name() {
    return 'cache-v260506-day9-static-assets-v1';
}

function day9_sw_override_js() {
    $cache_name = day9_sw_override_cache_name();

    return <<<JS
const CACHE_NAME = '{$cache_name}';
const NEVER_CACHE_PATTERNS = [
  /\\/wp-admin\\//,
  /\\/wp-login/,
  /preview=true/
];
const CACHEABLE_DESTINATIONS = new Set(['style', 'script', 'image', 'font']);

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;
  const accept = request.headers.get('accept') || '';
  const isGet = request.method === 'GET';
  const isNavigate = request.mode === 'navigate';
  const isHtml = accept.includes('text/html');
  const isNeverCache = NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url));
  const isStaticAsset = CACHEABLE_DESTINATIONS.has(request.destination);

  if (!isGet || isNeverCache || isNavigate || isHtml || !isStaticAsset) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});
JS;
}

function day9_sw_override_write_file() {
    if (!day9_sw_override_is_enabled()) {
        return;
    }

    $target = day9_sw_override_target_path();

    if (file_exists($target) && !is_writable($target)) {
        error_log('Day9 SW override: serviceWorker.js is not writable.');
        return;
    }

    if (!file_exists($target) && !is_writable(dirname($target))) {
        error_log('Day9 SW override: target directory is not writable.');
        return;
    }

    $script = day9_sw_override_js();
    $current = file_exists($target) ? file_get_contents($target) : '';

    if ($current === $script) {
        return;
    }

    file_put_contents($target, $script, LOCK_EX);
}

function day9_sw_override_write_file_on_transition($new_status = null, $old_status = null, $post = null) {
    day9_sw_override_write_file();
}

function day9_sw_override_write_file_on_login($user_login = null, $user = null) {
    day9_sw_override_write_file();
}

function day9_sw_override_write_file_on_logout($user_id = null) {
    day9_sw_override_write_file();
}

add_action('customize_register', 'day9_sw_override_write_file', 9999);
add_action('transition_post_status', 'day9_sw_override_write_file_on_transition', 9999, 3);
add_action('wp_login', 'day9_sw_override_write_file_on_login', 9999, 2);
add_action('wp_logout', 'day9_sw_override_write_file_on_logout', 9999, 1);
add_action('admin_init', 'day9_sw_override_write_file', 9999);
PHP

php -l wp-content/mu-plugins/day9-service-worker-override.php
wp plugin list --status=must-use 2>/dev/null || true
php -r "require 'wp-load.php'; echo function_exists('day9_sw_override_write_file') ? 'function exists' : 'function missing', PHP_EOL;"
php -r "require 'wp-load.php'; if (function_exists('day9_sw_override_write_file')) { day9_sw_override_write_file(); } echo file_exists('serviceWorker.js') ? 'serviceWorker.js exists' : 'serviceWorker.js missing';"
sed -n '1,260p' serviceWorker.js
```

## 10. 実装後確認コマンド

```bash
cd /home/rvpuxcjb/public_html/moterist.com
php -l wp-content/mu-plugins/day9-service-worker-override.php
wp plugin list --status=must-use 2>/dev/null || true
php -r "require 'wp-load.php'; echo function_exists('day9_sw_override_write_file') ? 'function exists' : 'function missing', PHP_EOL;"
sed -n '1,260p' serviceWorker.js
grep -n 'cache-v260506-day9-static-assets-v1' serviceWorker.js
grep -n 'cache-v260506182046' serviceWorker.js || true
grep -n 'request.mode === .navigate.' serviceWorker.js
grep -n 'text/html' serviceWorker.js
grep -n 'request.method === .GET.' serviceWorker.js
grep -n 'wp-admin\|wp-login\|preview=true' serviceWorker.js
grep -n 'CACHEABLE_DESTINATIONS' serviceWorker.js
grep -n 'cache.put(event.request, responseToCache)' serviceWorker.js || true
```

確認観点:

- `/serviceWorker.js` の内容が安全版になっている
- `cache-v260506-day9-static-assets-v1` が含まれている
- 旧 `cache-v260506182046` が消えている
- `document / navigate` がキャッシュ対象外になっている
- `GET` 以外が除外されている
- `wp-admin / wp-login / preview=true` が引き続き除外されている
- `request.destination` が `style / script / image / font` の静的資産だけがキャッシュ対象になっている
- must-use として MUプラグインが読み込まれている
- 旧 `cache.put(event.request, responseToCache)` ロジックが残っていない

## 11. サーバーcurl確認コマンド

```bash
curl -s https://moterist.com/serviceWorker.js | sed -n '1,120p'
curl -s https://moterist.com/fanza20250331/ | grep -o 'FANZA公式ページで登録前の案内を確認する'
curl -s https://moterist.com/fanza_otoku250114/ | grep -o 'FANZA公式ページで利用前の案内を確認する'
curl -s https://moterist.com/fanza20250329/ | grep -o 'FANZA公式で最新情報を確認する'
curl -s https://moterist.com/fanza20250331/ | grep -o '開催中のセール・キャンペーン情報を確認する' || true
curl -s https://moterist.com/fanza_otoku250114/ | grep -o '開催中のセール・キャンペーン情報を確認する' || true
```

追加確認観点:

- `1106` / `994` / `1095` の通常URLが意図どおりであること
- `noindex` / `canonical` / `title` / `meta description` / 外部リンクURLに意図しない変更がないこと

## 12. Chrome DevToolsでの確認手順

1. `https://moterist.com/fanza20250331/` を通常ブラウザで開く
2. `Application > Service Workers` を開く
3. Service Worker の scope と更新状態を確認する
4. `Application > Cache Storage` を開く
5. 新しい `CACHE_NAME` が使われているか確認する
6. 記事HTML URL が `Cache Storage` に残っていないか確認する
7. CSS / JS / 画像など静的資産が必要に応じて残っているか確認する
8. 旧 `Cache Storage` を削除し、新しい `cache-v260506-day9-static-assets-v1` のみ残るか確認する
9. `1106` / `994` / `1095` を通常URLで目視し、意図しない変化がないか確認する

## 13. 投稿更新・ログイン・ログアウト後の再生成維持確認

当日の実装者が以下を確認する。

- 投稿更新後に `serviceWorker.js` を再確認する
- ログイン後に `serviceWorker.js` を再確認する
- ログアウト後に `serviceWorker.js` を再確認する

確認コマンド:

```bash
cd /home/rvpuxcjb/public_html/moterist.com
sed -n '1,260p' serviceWorker.js
grep -n 'cache-v260506-day9-static-assets-v1' serviceWorker.js
grep -n 'cache-v260506182046' serviceWorker.js || true
grep -n 'request.mode === .navigate.' serviceWorker.js
grep -n 'request.method === .GET.' serviceWorker.js
```

## 14. ロールバックコマンド

```bash
cd /home/rvpuxcjb/public_html/moterist.com
if [ -f ~/day9-sw-backup/day9-service-worker-override.php.before-day9 ]; then
  cp -p ~/day9-sw-backup/day9-service-worker-override.php.before-day9 wp-content/mu-plugins/day9-service-worker-override.php
else
  mv wp-content/mu-plugins/day9-service-worker-override.php ~/day9-sw-backup/day9-service-worker-override.php.removed.$(date +%Y%m%d%H%M%S)
fi
cp -p ~/day9-sw-backup/serviceWorker.js.before-day9 serviceWorker.js
sed -n '1,260p' serviceWorker.js
```

ブラウザ側確認:

- DevTools で Service Worker の更新 / 登録解除状態を確認
- DevTools で `Cache Storage` の不要キャッシュ削除を確認

## 15. 実装中止条件

- `THE THOR` 本体編集が必要になる
- MUプラグインから安全に差し替えられない
- HTML だけでなく静的資産キャッシュまで壊すおそれが高い
- ロールバック手順を実行可能な形で確保できない
- `fit_pwaFunction_switch = off` 以外に成立ルートがなく、影響評価も未完了

## 16. 実装前レビューで補足すべき人間確認項目

- `wp-content/mu-plugins/` が PHP 実行対象として正しく読み込まれる運用か
- `request.destination` が空になる静的資産をキャッシュ対象に残したいか
- `CACHE_NAME` の更新をいつ手動で行うか
- 投稿更新、ログイン、ログアウト後に `serviceWorker.js` が期待内容へ戻るか
- DevTools 上で旧 `Cache Storage` が消え、新しいキャッシュだけが残るか
