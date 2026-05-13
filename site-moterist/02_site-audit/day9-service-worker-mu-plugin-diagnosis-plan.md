# Day 9 Service Worker MU Plugin Diagnosis Plan

## 現状の問題

Day 9 の MUプラグイン実装後確認では、記事本文側の公開状態は正常だった一方、公開 `https://moterist.com/serviceWorker.js` は旧版のままだった。

確認できている状況:

- 公開 `serviceWorker.js` に期待した `cache-v260506-day9-static-assets-v1` が含まれていない
- 公開 `serviceWorker.js` には旧 `CACHE_NAME` `cache-v260506182046` が残っている
- `document / navigate request` 除外、`text/html` 除外、`style / script / image / font` 限定処理も確認できていない
- `1106` / `994` / `1095` の記事本文は正常
- `noindex` / `canonical` / `title` / `meta description` / 外部リンクURL に意図しない変更はない

したがって、問題の主因は記事本文ではなく、`MUプラグイン配置 / 読込 / 書き込み / 再生成競合` のどこかで止まっている可能性が高い。

## 想定される未反映原因

優先度順に整理すると以下。

1. `wp-content/mu-plugins/day9-service-worker-override.php` が本番に存在しない
2. MUプラグインは存在するが、must-use として読み込まれていない
3. MUプラグインに PHP 構文エラーがある
4. MUプラグイン内に `day9_sw_override_write_file()` が存在しない、または期待どおり定義されていない
5. MUプラグインは読まれているが、`/serviceWorker.js` への書き込み権限やパス解決で失敗している
6. 手動明示呼び出しが未実行
7. 手動呼び出しで一度は更新されても、後から THE THOR の `fit_add_serviceWorker()` が旧版へ戻している

## SSHで人間が実行すべき読み取り専用確認コマンド

接続:

```bash
ssh -i C:\Users\Tachi\.ssh\mixhost_codex_pc -p 22 rvpuxcjb@133.125.148.25
cd /home/rvpuxcjb/public_html/moterist.com
pwd
```

### 1. MUプラグイン実ファイルの存在確認

```bash
ls -la wp-content/mu-plugins 2>/dev/null || true
ls -la wp-content/mu-plugins/day9-service-worker-override.php 2>/dev/null || true
```

### 2. MUプラグインの内容確認

```bash
sed -n '1,260p' wp-content/mu-plugins/day9-service-worker-override.php 2>/dev/null || true
grep -n 'day9_sw_override_write_file' wp-content/mu-plugins/day9-service-worker-override.php 2>/dev/null || true
grep -n 'serviceWorker.js' wp-content/mu-plugins/day9-service-worker-override.php 2>/dev/null || true
grep -n 'cache-v260506-day9-static-assets-v1' wp-content/mu-plugins/day9-service-worker-override.php 2>/dev/null || true
```

### 3. MUプラグインの must-use 認識確認

```bash
wp plugin list --status=must-use 2>/dev/null || true
```

WP-CLI が使えない場合の代替:

```bash
php -r "require 'wp-load.php'; if (function_exists('get_mu_plugins')) { print_r(get_mu_plugins()); }"
```

### 4. PHP構文エラー確認

```bash
php -l wp-content/mu-plugins/day9-service-worker-override.php
```

### 5. `serviceWorker.js` 実ファイル確認

```bash
ls -l --time-style=full-iso serviceWorker.js
sed -n '1,260p' serviceWorker.js
grep -n 'cache-v260506-day9-static-assets-v1' serviceWorker.js || true
grep -n 'cache-v260506182046' serviceWorker.js || true
grep -n "request.mode === 'navigate'" serviceWorker.js || true
grep -n 'text/html' serviceWorker.js || true
grep -n 'CACHEABLE_DESTINATIONS' serviceWorker.js || true
grep -n 'cache.put(event.request, responseToCache)' serviceWorker.js || true
```

### 6. 書き込み先権限とパス確認

```bash
php -r "require 'wp-load.php'; echo ABSPATH, PHP_EOL;"
php -r "require 'wp-load.php'; echo is_writable(ABSPATH . 'serviceWorker.js') ? 'serviceWorker.js writable' : 'serviceWorker.js not writable', PHP_EOL;"
php -r "require 'wp-load.php'; echo is_writable(ABSPATH) ? 'ABSPATH writable' : 'ABSPATH not writable', PHP_EOL;"
```

### 7. MUプラグイン関数の読込確認

```bash
php -r "require 'wp-load.php'; echo function_exists('day9_sw_override_write_file') ? 'function exists' : 'function missing', PHP_EOL;"
```

### 8. THE THOR 側の再生成元確認

```bash
grep -n 'fit_add_serviceWorker' wp-content/themes/the-thor/inc/pwa/serviceWorker.php
sed -n '1,260p' wp-content/themes/the-thor/inc/pwa/serviceWorker.php
grep -n 'file_put_contents' wp-content/themes/the-thor/inc/pwa/serviceWorker.php
grep -n 'customize_register\|transition_post_status\|wp_login\|wp_logout' wp-content/themes/the-thor/inc/pwa/serviceWorker.php
```

## まだ実行してはいけないコマンド

この診断フェーズでは以下を実行しない。

- `cat > wp-content/mu-plugins/day9-service-worker-override.php ...`
- `php -r "require 'wp-load.php'; day9_sw_override_write_file(); ..."`
- `cp`, `mv`, `rm`, `unlink`, `file_put_contents` を伴う更新操作
- `wp option update`
- `wp post update`
- `.htaccess` や `wp-config.php` の編集

## 診断結果ごとの判断分岐

### A. MUプラグイン実ファイルが存在しない

判断:

- 本番へ未配置

次の対応方針:

- 実装手順書どおり、MUプラグイン配置工程の実施有無を人間側で確認する
- まず配置漏れとして扱い、更新作業に戻る

### B. MUプラグインは存在するが must-use に出ない

判断:

- 配置場所が誤っているか、自動読込されていない

次の対応方針:

- `wp-content/mu-plugins/` 直下に置かれているか確認する
- ディレクトリ階層違い、ファイル名誤りを疑う

### C. MUプラグインに構文エラーがある

判断:

- 読み込まれていない、または途中で停止している

次の対応方針:

- 更新作業に戻り、コード修正が必要

### D. 関数が存在しない

判断:

- MUプラグイン内容が想定と違う

次の対応方針:

- 配置ファイル内容の取り違え、貼り付け不備、途中欠落を疑う

### E. MUプラグインは読まれているが `serviceWorker.js` 実ファイルが旧版

判断:

- 書き込みが走っていない
- 書き込み権限で失敗している
- `fit_pwaFunction_switch` 判定で処理がスキップされている

次の対応方針:

- 次段階で `fit_pwaFunction_switch` 値確認と手動明示呼び出し実行結果確認が必要

### F. 一度新しい内容になるが、その後旧版へ戻る

判断:

- THE THOR の `fit_add_serviceWorker()` が後から再生成している可能性が高い

次の対応方針:

- 再生成タイミングと MUプラグインのフック優先順位を再設計する必要がある

## MUプラグイン未配置の場合の対応方針

- まず「反映失敗」ではなく「未配置」として扱う
- 配置漏れ、配置先誤り、保存忘れを確認する
- 更新フェーズに戻り、MUプラグイン配置からやり直す

## MUプラグイン未読込の場合の対応方針

- `wp-content/mu-plugins/` 直下配置かを確認する
- `must-use` 一覧に出るか確認する
- ディレクトリが一段深くなっていないかを疑う

## `serviceWorker.js` 書き込み未実行の場合の対応方針

- `fit_pwaFunction_switch` 判定
- 関数存在確認
- 書き込み権限確認
- 手動明示呼び出し実施有無確認

この 4 点を次段階の確認対象にする。

## THE THOR再生成で戻っている場合の対応方針

- THE THOR 側 `fit_add_serviceWorker()` の再生成タイミングを確認する
- MUプラグイン側フック優先順位や発火箇所を見直す必要がある
- 実装自体は通っているが、最終的な勝ち負けで負けているケースとして扱う

## 次に進むために必要な情報

- `wp-content/mu-plugins/day9-service-worker-override.php` の存在確認結果
- `wp plugin list --status=must-use` の結果
- `php -l` の結果
- `function_exists('day9_sw_override_write_file')` の結果
- `serviceWorker.js` 実ファイルの内容と更新日時
- `ABSPATH` と書き込み可否確認結果
- THE THOR 側 `fit_add_serviceWorker()` のフック定義確認結果
