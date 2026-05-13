# Day 9 Service Worker Final Spec Before Execution

## 最終仕様

Day 9 の本番反映では、`MUプラグイン` を使って `serviceWorker.js` の生成結果を安全版へ差し替える。

維持する前提:

- `THE THOR` 本体は直接編集しない
- `serviceWorker.js` は削除しない
- `fit_pwaFunction_switch` は `on` のまま維持する
- `document / navigate request` はキャッシュしない
- `GET` 以外はキャッシュしない
- `wp-admin / wp-login / preview=true` は除外継続
- 静的資産だけを必要に応じて `Cache Storage` に保存する

## 未決事項への回答

### 1. `wp-content/mu-plugins/` の自動読込確認

仕様として以下で確定する。

- `wp-content/mu-plugins/` が存在しない場合は作成する
- PHP ファイル配置後に、自動読込確認を実施する
- 可能なら `wp plugin list --status=must-use` で確認する
- `wp` コマンドが使えない環境では、`php -r` による `get_mu_plugins()` 相当の確認、または MUプラグイン関数の明示呼び出しで代替する

### 2. `request.destination` が空のリクエストの扱い

仕様として以下で確定する。

- 初回実装では `request.destination` が空のリクエストはキャッシュ対象に含めない
- 対象は `style / script / image / font` のみとする
- 追加対象が必要になった場合は Day 9 範囲外の追補として扱う

### 3. `CACHE_NAME` の固定値

仕様として以下で確定する。

```text
cache-v260506-day9-static-assets-v1
```

### 4. `CACHE_NAME` の更新タイミング

仕様として以下で確定する。

- `CACHE_NAME` は毎回変動させない
- `Service Worker` の仕様を変更したときだけ手動更新する
- 記事本文更新や通常の投稿更新では変更しない

### 5. 再生成維持確認の担当とタイミング

仕様として以下で確定する。

- 実装者が当日に確認する
- 少なくとも以下のイベント後に `serviceWorker.js` の維持確認を行う
  - 投稿更新
  - ログイン
  - ログアウト

### 6. DevTools での旧 Cache Storage の扱い

仕様として以下で確定する。

- DevTools で旧 `Cache Storage` を削除する
- 新しい `CACHE_NAME` だけが残るか確認する
- 旧キャッシュが残る場合は、更新状態と実際の表示差を記録する

### 7. 閲覧者側で旧表示が残る場合

仕様として以下で確定する。

- 閲覧者側で旧表示が残る場合は、ブラウザ側 `Service Worker / Cache Storage` の更新待ち、または削除が必要と記録する
- サーバー側レスポンスが新HTMLなら、まずブラウザローカル要因として扱う

## CACHE_NAME固定値

今回の固定値は以下。

```text
cache-v260506-day9-static-assets-v1
```

## `request.destination` 空リクエストの扱い

今回の初回実装では、`request.destination` が空のリクエストはキャッシュ対象外とする。

理由:

- 安全側に倒すため
- 記事HTMLや意図しないレスポンスが混ざる余地を減らすため
- Day 9 の目的は stale HTML の抑止であり、キャッシュ対象を広げることではないため

## `mu-plugins` 自動読込確認方法

第一候補:

```bash
wp plugin list --status=must-use
```

代替確認:

- `php -r` で MUプラグイン関数が読まれるか確認する
- 実装後に `day9_sw_override_write_file()` が明示呼び出しできるか確認する
- 実際に `/serviceWorker.js` が期待内容へ変わるか確認する

## 再生成維持確認の担当とタイミング

- 担当:
  - 実装者
- タイミング:
  - MUプラグイン配置直後
  - 投稿更新直後
  - ログイン直後
  - ログアウト直後

## DevToolsでの旧Cache Storage処理

- `Application > Cache Storage` を開く
- 旧キャッシュ名を削除する
- `cache-v260506-day9-static-assets-v1` だけが残るか確認する
- `1106` / `994` / `1095` を再確認し、旧表示が残るかを確認する

## 実行可否

結論は `実行可`。

ただし以下を前提とする。

- バックアップ取得を最初に実行する
- `mu-plugins` 自動読込確認を行う
- `CACHE_NAME` を上記固定値で使う
- 再生成維持確認を当日実施する

## 実行前に人間が確認すること

- `wp-content/mu-plugins/` を作成してよいか
- `wp plugin list --status=must-use` で確認できる環境か
- `CACHE_NAME` 固定値を今回の実装値として使うこと
- `request.destination` が空の静的資産を今回は切り捨てること
- 実装者が当日中に投稿更新 / ログイン / ログアウト後確認を行えること
- DevTools で旧 `Cache Storage` を整理できること

## 実装後に必ず確認すること

- `/serviceWorker.js` の内容
- `document / navigate` が除外されていること
- `GET` 以外が除外されていること
- `wp-admin / wp-login / preview=true` が除外されていること
- `style / script / image / font` だけがキャッシュ対象であること
- Service Worker 登録更新
- `Cache Storage` に記事HTMLが保存されないこと
- `1106` / `994` / `1095` の通常URL確認
- `noindex` / `canonical` / `title` / `meta description` / 外部リンクURLに意図しない変更がないこと

## 実装を中止すべき条件

- `mu-plugins` 自動読込が確認できない
- `serviceWorker.js` の書き込み権限がない
- バックアップが取得できない
- 再生成後維持確認を当日中に実施できない
- `CACHE_NAME` を確定できない
- `request.destination` 空リクエストの扱いに運用側合意がない
