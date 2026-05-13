# Day 9 Service Worker Minimal Implementation Plan

## 読み取り結果の要約

人間側 SSH 読み取り結果から、以下を前提に実装方針を確定する。

- `/serviceWorker.js` は実在する
- `CACHE_NAME = "cache-v260506182046"` を使っている
- `urlsToCache` は `/` のみだが、fetch イベント内で通常リクエストも `cache.put(event.request, responseToCache)` により保存される
- `caches.match(event.request)` が先に走るため、記事HTMLの旧表示が残りうる
- `neverCacheUrls` は `/wp-admin/`、`/wp-login/`、`preview=true` のみ
- `wp-content/themes/the-thor/inc/pwa/serviceWorker.php` の `fit_add_serviceWorker()` が `serviceWorker.js` を生成している
- `fit_pwaFunction_switch = on` の場合は `file_put_contents()` で生成する
- `fit_pwaFunction_switch = off` の場合は `serviceWorker.js` を `unlink()` する
- `fit_add_serviceWorker()` は `customize_register`、`transition_post_status`、`wp_login`、`wp_logout` にフックされている
- `wp-content/themes/the-thor/inc/parts/wp_footer.php` では `fit_pwaFunction_switch = on` の場合に `navigator.serviceWorker.register()` を出力する
- `fit_pwaFunction_switch = off` の場合は `unregister-worker.min.js` を読み込む
- `the-thor-child` は存在する
- `wp-content/mu-plugins` は現時点では存在確認できていない

## serviceWorker.js の現状挙動

今回の stale HTML 問題の本体は、pre-cache 対象の `/` だけではなく、fetch イベント内の通常リクエスト保存にある。

現状の問題点:

- 記事詳細URLも `event.request` 単位で Cache Storage に保存されうる
- 次回以降の通常アクセスでは `caches.match(event.request)` が先に評価される
- `neverCacheUrls` に記事URL条件がない
- その結果、記事更新後も旧HTMLがローカルに残りやすい

結論:

- Day 9 で止めるべきなのは `記事HTMLの保存と再利用`
- 静的資産キャッシュ全体を止める必要はない

## THE THOR 側の生成処理

生成処理は `wp-content/themes/the-thor/inc/pwa/serviceWorker.php` の `fit_add_serviceWorker()` が担っている。

読み取り結果から分かること:

- `fit_pwaFunction_switch` が `on` のとき、テーマが `serviceWorker.js` を生成する
- 投稿ステータス遷移やログイン系イベントでも再生成が走る
- 実装変更を入れる場合、`fit_add_serviceWorker()` の出力内容か、その呼び出し結果を制御する必要がある

評価:

- `serviceWorker.js` 単体を書き換えても、再生成で上書きされるリスクがある
- 恒久対応は `生成処理をどこで制御するか` を決める必要がある

## THE THOR 側の登録処理

登録処理は `wp-content/themes/the-thor/inc/parts/wp_footer.php` 側で行われている。

読み取り結果から分かること:

- `fit_pwaFunction_switch = on` の間は、テーマが `navigator.serviceWorker.register()` を出力する
- `fit_pwaFunction_switch = off` にすると、テーマの正規ルートとして `unregister-worker.min.js` が読み込まれる

評価:

- PWA OFF は正規ルートとして成立している
- ただし今回は `PWA全停止` が第一候補ではない
- したがって、登録停止だけでなく `生成内容を最小限に調整する` 方向が本筋

## 実装方針の最終推奨

最終推奨は以下。

- `fit_pwaFunction_switch` は維持したまま `on`
- `serviceWorker.js` の生成内容だけを調整し、`document / navigate` をキャッシュしない
- 静的資産キャッシュは維持する
- 運用上は引き続き `Service Worker 無効化確認 / 新規ブラウザコンテキスト / サーバーcurl確認` を併用する

理由:

- 問題は `HTML 文書キャッシュ` に限定されている
- THE THOR 側に PWA OFF 正規ルートはあるが、影響範囲が広い
- `serviceWorker.js` の再生成元が明確なので、生成内容へ最小変更を入れる方が狙いが明確

## 採用する実装ルート

第一候補:

- `the-thor-child` または新設 `mu-plugin` から、THE THOR 本体を直接編集せずに `serviceWorker.js` 生成内容を差し替える
- 差し替え内容は、fetch イベントで `request.mode === 'navigate'` または `Accept: text/html` のリクエストをキャッシュ対象から外すものに限定する

実装優先順:

1. 子テーマで `fit_add_serviceWorker()` の差し替えや出力制御が可能か確認
2. 子テーマで難しければ、`mu-plugin` を追加して生成フックを制御する
3. それでもテーマ実装と密結合で差し替え不能なら、PWA OFF を代替案として残す

この順にする理由:

- 既に `the-thor-child` が存在しており、最小変更にしやすい
- `mu-plugin` は更新耐性が高いが、新設ディレクトリと運用説明が増える
- PWA OFF は正規ルートだが、機能停止の影響が大きい

## 採用しない実装ルートと理由

### 管理画面で `fit_pwaFunction_switch` を off にする

採用しない理由:

- 正規ルートであり安全性は高い
- ただし `serviceWorker.js` を削除し、`unregister-worker.min.js` へ切り替わるため、PWA 全停止に近い
- 今回の目的は `記事HTMLだけキャッシュしない` であり、停止範囲が広すぎる

### `serviceWorker.js` を直接編集する

採用しない理由:

- `fit_add_serviceWorker()` の再生成で上書きされる
- 運用上の恒久対応にならない

### THE THOR 本体ファイルを直接編集する

採用しない理由:

- テーマ更新で上書きされる
- ロールバックと差分管理が悪化する

### キャッシュ削除運用だけで終える

採用しない理由:

- ブラウザ側 stale HTML 問題を解消しない
- 再発時の確認工数が残る

## 変更対象候補

最小変更の対象候補は以下。

- `the-thor-child` 側の `functions.php` または PWA 制御用追加ファイル
- 必要なら新設する `wp-content/mu-plugins/` 配下の制御ファイル
- `serviceWorker.js` の生成ロジックを安全に差し替えるための周辺コード

変更内容の粒度:

- `document / navigate` リクエストだけを除外
- 既存の静的資産キャッシュ戦略は維持
- `CACHE_NAME` の更新も実装時に併せて検討

## 変更しない対象

- THE THOR 本体ファイル
  - `wp-content/themes/the-thor/inc/pwa/serviceWorker.php`
  - `wp-content/themes/the-thor/inc/parts/wp_footer.php`
- 既存記事本文
- `title` / `meta description` / `canonical`
- URL、slug、301、noindex
- 外部リンクURL、アフィリエイトURL

## 実装前バックアップ対象

- 現行 `/serviceWorker.js`
- `wp-content/themes/the-thor/inc/pwa/serviceWorker.php`
- `wp-content/themes/the-thor/inc/parts/wp_footer.php`
- `the-thor-child` の現行ファイル一式
- `wp-content/mu-plugins/` がある場合はその一覧
- PWA 関連の管理画面設定値
- Chrome DevTools 上の現行 Service Worker / Cache Storage 状態のスクリーンショット

## 実装手順案

1. `the-thor-child` 側で PWA 制御用の追加実装ポイントを決める
2. THE THOR 本体を触らずに `fit_add_serviceWorker()` の生成結果を差し替えられるか確認する
3. 差し替え可能なら、生成される fetch イベントを以下方針へ変更する
   - `navigate` はキャッシュしない
   - `text/html` はキャッシュしない
   - CSS / JS / 画像だけ既存戦略を維持する
4. 差し替え困難なら、`mu-plugin` で生成フック制御を行う
5. 実装後に Service Worker 再登録と Cache Storage 状態を確認する

## fetch イベントの最小変更方針

擬似コード方針は以下。

```js
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const accept = request.headers.get('accept') || '';
  const isNavigate = request.mode === 'navigate';
  const isHtml = accept.includes('text/html');

  if (isNavigate || isHtml) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
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

補足:

- offline 時の HTML フォールバックを重視するなら `network-first` も候補
- ただし最小変更としては、まず `HTML を保存しない` 方が意図が明確

## 検証手順

1. 実装後に通常ブラウザで記事URLを確認する
2. Chrome DevTools で Service Worker と Cache Storage を確認する
3. 記事HTMLが Cache Storage に保存されていないことを確認する
4. CSS / JS / 画像の読み込みが崩れていないか確認する
5. `1106` / `994` のような記事更新確認を通常URLで再テストする
6. 新規ブラウザコンテキスト確認と通常ブラウザ確認で差がないか確認する
7. スマホ幅で表示崩れや圧迫感悪化がないか確認する

## ロールバック手順

1. 変更前の子テーマファイルまたは `mu-plugin` を退避しておく
2. 問題が出た場合は、追加した制御コードだけを元に戻す
3. 元に戻した後で Service Worker 再登録状態を確認する
4. Cache Storage の再生成状態を確認する
5. 通常ブラウザと新規コンテキストで表示差がないか再確認する
6. 必要なら最終手段として `fit_pwaFunction_switch = off` を代替案として検討する

## リスクと注意点

- THE THOR の関数定義順やフック構造次第で、子テーマだけでは差し替えにくい可能性がある
- `mu-plugin` は安全だが、新規運用資産として保守説明が必要になる
- `CACHE_NAME` を上げないと、既存 Cache Storage の移行確認が複雑になる可能性がある
- 既存ユーザー端末には古い Service Worker が残る移行期間がある
- PWA OFF は代替案として安全だが、今回は最小変更案ではない

## 最終結論

Day 9 の最小実装案としては、`the-thor-child` を第一候補にし、必要なら `mu-plugin` を使って `serviceWorker.js` の生成内容を安全に差し替え、`document / navigate` をキャッシュ対象から外す方針が最も妥当である。

PWA 全停止は、子テーマ / MUプラグインでの最小変更が成立しない場合の代替案として残す。
