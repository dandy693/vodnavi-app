# Day 9 Service Worker Implementation Package

## 1. 実装目的

`moterist.com` で記事HTMLが `Service Worker / Cache Storage` に保存・再利用されることで、通常URL確認時に stale HTML が返る問題を抑止する。

今回の目的は以下に限定する。

- `document / navigate` request をキャッシュしない
- `GET` 以外はキャッシュしない
- `wp-admin / wp-login / preview=true` は引き続きキャッシュしない
- 静的資産キャッシュは維持する

## 2. 採用する実装ルート

採用ルートは以下。

1. `the-thor-child` を第一候補とする
2. 子テーマで `fit_add_serviceWorker()` の生成内容差し替えが難しい場合のみ `MUプラグイン` を使う
3. `fit_pwaFunction_switch` は `on` のまま維持する
4. THE THOR 本体は直接編集しない

## 3. 採用しない実装ルートと理由

### PWA 全停止

- `fit_pwaFunction_switch = off` は正規ルートだが、停止範囲が広い
- 今回は `記事HTMLだけキャッシュしない` のが目的で、影響が大きすぎる

### `serviceWorker.js` の直接編集

- `fit_add_serviceWorker()` により再生成され、上書きされる
- 恒久対応にならない

### THE THOR 本体直接編集

- テーマ更新で消える
- 差分追跡とロールバックが難しくなる

### キャッシュ削除のみ

- 根本原因を残す
- 公開確認運用の誤判定リスクを解消しない

## 4. 本番で変更する可能性がある対象

- `wp-content/themes/the-thor-child/functions.php`
- `wp-content/themes/the-thor-child/` 配下の PWA 制御用追加ファイル
- 必要なら新設する `wp-content/mu-plugins/` 配下の制御ファイル
- `serviceWorker.js` の生成結果を変えるための周辺制御コード

## 5. 本番で変更しない対象

- `wp-content/themes/the-thor/inc/pwa/serviceWorker.php`
- `wp-content/themes/the-thor/inc/parts/wp_footer.php`
- `/serviceWorker.js` の手編集
- 既存記事本文
- `title` / `meta description` / `canonical`
- `noindex`、削除、301、slug変更
- 外部リンクURL、アフィリエイトURL

## 6. 実装前バックアップ対象

- `/home/rvpuxcjb/public_html/moterist.com/serviceWorker.js`
- `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor/inc/pwa/serviceWorker.php`
- `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor/inc/parts/wp_footer.php`
- `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor-child/` 一式
- `/home/rvpuxcjb/public_html/moterist.com/wp-content/mu-plugins/` 一式
- PWA 関連の管理画面設定値
- 現行 `CACHE_NAME`
- DevTools の Service Worker / Cache Storage 状態

## 7. serviceWorker.js の差し替え後コード案

以下は、HTML を保存しない最小方針の参考コード案。

```js
const CACHE_NAME = 'cache-vNEXT';
const NEVER_CACHE_PATTERNS = [
  /\/wp-admin\//,
  /\/wp-login/,
  /preview=true/
];

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;
  const accept = request.headers.get('accept') || '';
  const isGet = request.method === 'GET';
  const isNavigate = request.mode === 'navigate';
  const isHtml = accept.includes('text/html');
  const isNeverCache = NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url));

  if (!isGet || isNeverCache || isNavigate || isHtml) {
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

## 8. fetchイベントの仕様

仕様は以下で固定する。

- `document / navigate request` はキャッシュしない
- `GET` 以外はキャッシュしない
- `wp-admin / wp-login / preview=true` は引き続きキャッシュしない
- 静的資産のみ必要に応じて `Cache Storage` に保存する

静的資産として残す対象の例:

- CSS
- JavaScript
- 画像
- フォント
- theme asset

補足:

- `Accept: text/html` を優先して除外する
- これにより記事、固定ページ、アーカイブ等の HTML 文書を stale 化させない

## 9. the-thor-childで実装する場合の手順案

1. `the-thor-child` 側に PWA 制御用ファイルを追加する方針を決める
2. `functions.php` から読み込む構成にするかを決める
3. THE THOR 本体の `fit_add_serviceWorker()` に対して、子テーマから生成内容差し替えの導線を確保する
4. 生成される `serviceWorker.js` の fetch イベントを上記仕様へ寄せる
5. `CACHE_NAME` 更新要否を判断する
6. Service Worker 再登録状態を確認する

採用条件:

- 子テーマから制御が完結する
- 本体編集が不要
- 再生成時も差し替え結果が維持される

## 10. MUプラグインで実装する場合の手順案

1. `wp-content/mu-plugins/` の新設可否を確認する
2. MUプラグインで PWA 制御用ファイルを追加する
3. テーマの `fit_add_serviceWorker()` 周辺フックをテーマ外から制御する
4. 生成結果または生成条件を上書きし、HTML を保存しない fetch 仕様へ寄せる
5. Service Worker 再登録状態を確認する

採用条件:

- 子テーマではフック制御が不安定
- 更新耐性を優先したい
- MUプラグイン運用を受け入れられる

## 11. どちらを優先するか

優先順位は以下。

1. `the-thor-child`
2. `MUプラグイン`
3. `PWA OFF` は代替案

理由:

- 既存の子テーマがあるため変更範囲を狭めやすい
- MUプラグインは安全だが新規運用資産になる
- PWA OFF は作用が大きすぎる

## 12. 本番反映手順

1. バックアップを取得する
2. 実装ルートを `the-thor-child` か `MUプラグイン` に確定する
3. `serviceWorker.js` の生成内容差し替えコードを追加する
4. `CACHE_NAME` 更新要否を判断する
5. 反映後に Service Worker 再登録を確認する
6. 通常ブラウザと新規コンテキストで公開URL確認を行う

## 13. 反映後検証手順

1. 通常ブラウザで記事URLを開く
2. `1106` / `994` のような更新済み記事で旧表示が再発しないか確認する
3. Chrome DevTools の `Application > Service Workers` を確認する
4. `Application > Cache Storage` を確認する
5. CSS / JS / 画像の読み込みが崩れていないか確認する
6. スマホ幅で表示崩れがないか確認する
7. 新規ブラウザコンテキストでも同じ結果になるか確認する

## 14. Service Worker / Cache Storage更新確認手順

- DevTools で現在の Service Worker バージョンと scope を確認する
- `CACHE_NAME` が更新されているか確認する
- `Cache Storage` 内に記事HTML URL が保存されていないか確認する
- 旧キャッシュ名が残る場合は、移行状態を確認したうえで挙動差を見る
- 通常ブラウザと `Service Worker block` コンテキストの表示差が解消したか確認する

## 15. サーバーcurl確認手順

反映後の公開確認では、ブラウザ確認と別にサーバー curl 確認を継続する。

確認観点:

- 通常URLで新HTMLが返ること
- CTA / 内部リンク / 末尾構成など、更新対象文言が HTML に反映されていること
- ブラウザ側 stale 表示が残る場合でも、サーバー側レスポンスが正常か切り分けできること

## 16. ロールバック手順

1. 追加した子テーマコードまたは MUプラグインを差し戻す
2. バックアップした関連ファイルと設定値を復元する
3. Service Worker の登録状態を確認する
4. `Cache Storage` の状態を確認する
5. 通常ブラウザで CSS / JS / 画像読み込みに問題がないか確認する
6. 必要な場合のみ、代替案として `fit_pwaFunction_switch = off` を検討する

## 17. 実装中止条件

- 子テーマ / MUプラグインから生成内容を安全に差し替えられない
- THE THOR 本体編集が必要になる
- HTML だけでなく静的資産キャッシュまで壊すおそれが高い
- ロールバック手順を具体的に確保できない
- `PWA OFF` 以外に成立ルートが見つからず、影響評価が未完了

## 18. やってはいけないこと

- THE THOR 本体ファイルを直接編集する
- `/serviceWorker.js` を手編集して終える
- `/serviceWorker.js` を削除する
- キャッシュ削除だけで恒久対応扱いにする
- `fit_pwaFunction_switch = off` を第一候補として先に採用する
- `noindex`、削除、301、slug変更、記事本文更新を混ぜる
