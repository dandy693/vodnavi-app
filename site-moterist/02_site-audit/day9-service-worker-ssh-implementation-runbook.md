# Day 9 Service Worker SSH Implementation Runbook

## 1. 実行前の前提

- 今回の目的は、`Service Worker` による記事HTMLの stale 表示を防ぐこと
- 実装対象は `document / navigate request をキャッシュしない` 変更に限定する
- `fit_pwaFunction_switch` は `on` のまま維持する
- 静的資産キャッシュは残す
- 第一候補は `MUプラグイン`
- `the-thor-child` は第二候補
- 理由は、THE THOR の `fit_add_serviceWorker()` が再生成フックを持つため、常時読み込みの MUプラグインの方が制御維持に有利だから
- `THE THOR` 本体は直接編集しない
- `serviceWorker.js` を手編集しない
- 記事本文、DB、SEO設定、URL設定は触らない

## 2. SSH接続情報

接続コマンド:

```bash
ssh -i C:\Users\Tachi\.ssh\mixhost_codex_pc -p 22 rvpuxcjb@133.125.148.25
```

本番パス:

```bash
/home/rvpuxcjb/public_html/moterist.com
```

接続後の初手:

```bash
cd /home/rvpuxcjb/public_html/moterist.com
pwd
```

## 3. 絶対に変更しない対象

- `wp-content/themes/the-thor/inc/pwa/serviceWorker.php`
- `wp-content/themes/the-thor/inc/parts/wp_footer.php`
- 記事本文
- DB
- `.htaccess`
- `wp-config.php`
- `noindex`
- `canonical`
- `title`
- `meta description`
- `slug`

## 4. 実装前バックアップコマンド

以下は読み取り確認とバックアップ保存の例。保存先ディレクトリは人間側で調整する。

```bash
cd /home/rvpuxcjb/public_html/moterist.com
mkdir -p ~/day9-sw-backup
cp -p serviceWorker.js ~/day9-sw-backup/serviceWorker.js.before-day9
cp -pr wp-content/themes/the-thor-child ~/day9-sw-backup/the-thor-child.before-day9
cp -p wp-content/themes/the-thor/inc/pwa/serviceWorker.php ~/day9-sw-backup/the-thor-serviceWorker.php.readonly-backup
cp -p wp-content/themes/the-thor/inc/parts/wp_footer.php ~/day9-sw-backup/the-thor-wp_footer.php.readonly-backup
if [ -d wp-content/mu-plugins ]; then cp -pr wp-content/mu-plugins ~/day9-sw-backup/mu-plugins.before-day9; fi
if [ ! -d wp-content/mu-plugins ]; then echo 'mu-plugins directory not found yet'; fi
ls -la ~/day9-sw-backup
```

読み取り確認だけ先に行う場合:

```bash
sed -n '1,240p' serviceWorker.js
sed -n '1,240p' wp-content/themes/the-thor/inc/pwa/serviceWorker.php
sed -n '1,240p' wp-content/themes/the-thor/inc/parts/wp_footer.php
```

## 5. MUプラグインで対応する場合の手順案

1. `wp-content/mu-plugins/` の有無を確認する
2. なければ作成候補とする
3. MUプラグインで PWA 制御コードを追加し、THE THOR 本体を触らずに `fit_add_serviceWorker()` の再生成結果へ介入する
4. `document / navigate` をキャッシュしない fetch 仕様へ寄せる
5. `CACHE_NAME` 更新要否を判断する
6. 投稿更新、ログイン、ログアウト後に再生成されても、差し替え結果が維持されることを確認する

事前確認コマンド例:

```bash
ls -la wp-content
ls -la wp-content/mu-plugins 2>/dev/null || true
grep -RIn 'serviceWorker\|fit_add_serviceWorker\|pwa' wp-content/mu-plugins 2>/dev/null || true
```

## 6. the-thor-child で対応する場合の手順案

1. MUプラグインが使えない場合のみ採用する
2. `wp-content/themes/the-thor-child/` の現行構成を確認する
3. 子テーマ側で PWA 制御用ファイルを追加する
4. THE THOR 本体を触らずに、`fit_add_serviceWorker()` の生成結果に介入できる導線を確保する
5. 反映後に再生成と登録状態を確認する

事前確認コマンド例:

```bash
ls -la wp-content/themes/the-thor-child
find wp-content/themes/the-thor-child -maxdepth 3 -type f
grep -RIn 'serviceWorker\|fit_add_serviceWorker\|pwa' wp-content/themes/the-thor-child 2>/dev/null
```

## 7. どちらを採用するか判断する分岐

- `MUプラグイン` を採用する条件
  - 再生成フックに対して常時安定して効く
  - テーマ更新の影響を切り離したい
  - ロールバックをプラグイン単位で扱いたい
  - 運用上 MUプラグイン追加が許容される

- `the-thor-child` を採用する条件
  - MUプラグインが使えない
  - 子テーマ内で制御が閉じる
  - 再生成後も差し替えが維持される

- 実装中止または再判断する条件
  - 本体編集が必要になる
  - `PWA OFF` 以外の成立ルートがない
  - ロールバックを具体化できない

## 8. serviceWorker.js 差し替え後コード案

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

## 9. 実装後に serviceWorker.js が期待内容になっているか確認するコマンド

```bash
cd /home/rvpuxcjb/public_html/moterist.com
sed -n '1,260p' serviceWorker.js
grep -n 'CACHE_NAME' serviceWorker.js
grep -n 'request.mode === .navigate.' serviceWorker.js
grep -n 'text/html' serviceWorker.js
grep -n 'request.method === .GET.' serviceWorker.js
grep -n 'wp-admin\|wp-login\|preview=true' serviceWorker.js
```

## 10. サーバーcurl確認コマンド

通常URLで新HTMLが返ることを確認する。

```bash
curl -s https://moterist.com/fanza20250331/ | grep -o 'FANZA公式ページで登録前の案内を確認する'
curl -s https://moterist.com/fanza_otoku250114/ | grep -o 'FANZA公式ページで利用前の案内を確認する'
curl -s https://moterist.com/fanza20250331/ | grep -o '開催中のセール・キャンペーン情報を確認する' || true
curl -s https://moterist.com/fanza_otoku250114/ | grep -o '開催中のセール・キャンペーン情報を確認する' || true
```

Service Worker 更新後の本文差分確認にも使う。

## 11. Chrome DevToolsでのService Worker / Cache Storage確認手順

1. 対象ページを開く
2. DevTools を開く
3. `Application > Service Workers` を開く
4. 現在の Service Worker 登録、scope、更新状態を確認する
5. `Application > Cache Storage` を開く
6. 新しい `CACHE_NAME` が使われているか確認する
7. 記事URLの HTML が Cache Storage に残っていないか確認する
8. CSS / JS / 画像など静的資産は必要に応じて残っているか確認する
9. `1106` / `994` / `1095` の通常URL確認で意図しない変更がないか確認する

## 12. Playwright / Codex確認時の `serviceWorkers: 'block'` 注意点

- `serviceWorkers: 'block'` はブラウザ側の Service Worker 影響を排除する確認用
- 本番利用者の通常ブラウザ挙動とは一致しない場合がある
- 反映確認では以下を併用する
  - 通常ブラウザ確認
  - DevTools での Service Worker / Cache Storage 確認
  - `serviceWorkers: 'block'` の新規コンテキスト確認
  - サーバー curl 確認

## 13. ロールバック手順

1. 追加した子テーマコードまたは MUプラグインを差し戻す
2. MUプラグインを第一候補として戻し、必要なら `the-thor-child` 側も復元する
3. `serviceWorker.js` の内容を再確認する
4. DevTools で Service Worker の登録解除状態と Cache Storage 削除状態を確認する
5. 通常ブラウザで CSS / JS / 画像読み込みが崩れていないか確認する
6. どうしても復旧できない場合のみ、代替案として `fit_pwaFunction_switch = off` を再評価する

## 14. 実装中止条件

- `THE THOR` 本体編集が必要になる
- 子テーマ / MUプラグインから安全に差し替えられない
- HTML だけでなく静的資産キャッシュまで壊すおそれが高い
- ロールバック手順を実行可能な形で確保できない
- `PWA OFF` 以外に成立ルートがなく、影響評価も未完了

## 15. 操作ログへ残すべき内容

- 実装日時
- 実施者
- 採用したルート
  - `MUプラグイン` か `the-thor-child`
- `MUプラグイン第一候補` とした理由
- 追加 / 変更したファイルパス
- 変更前バックアップ保存先
- 反映後の `serviceWorker.js` 確認結果
- 投稿更新、ログイン、ログアウト後の再生成維持確認結果
- サーバー curl 確認結果
- DevTools での Service Worker / Cache Storage 確認結果
- 通常ブラウザ確認結果
- `noindex` / `canonical` / `title` / `meta description` / 外部リンクURLの確認結果
- `serviceWorkers: 'block'` 確認結果
- 問題の有無
- ロールバック実施有無
