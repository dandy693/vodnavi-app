# Day 9 Service Worker Final Command Plan

## 1. 実装目的

`moterist.com` の Service Worker が記事HTMLを `Cache Storage` に残して stale 表示を起こす問題を抑止する。

今回の変更目的は以下に限定する。

- `document / navigate request` をキャッシュしない
- `GET` 以外をキャッシュしない
- `wp-admin / wp-login / preview=true` を引き続きキャッシュしない
- 静的資産だけを必要に応じて `Cache Storage` に保存する

## 2. 採用する実装ルート

採用予定ルート:

1. `MUプラグイン` を第一候補にする
2. `wp-content/mu-plugins/` が存在しない場合は作成候補とする
3. `the-thor-child` は、MUプラグインが使えない場合の第二候補とする
4. THE THOR の `fit_add_serviceWorker()` が再生成しても、MUプラグイン側で安全な `serviceWorker.js` 内容を上書き・維持する方針を採る
5. `THE THOR` 本体は直接編集しない
6. `fit_pwaFunction_switch` は `on` のまま維持する

## 3. 実行者

- SSH操作: 人間が実施する
- Codex: 記録、差し替え方針、確認コマンド、検証指示の作成のみ行う

## 4. 実装前バックアップコマンド

```bash
ssh -i C:\Users\Tachi\.ssh\mixhost_codex_pc -p 22 rvpuxcjb@133.125.148.25
cd /home/rvpuxcjb/public_html/moterist.com
mkdir -p ~/day9-sw-backup
cp -p serviceWorker.js ~/day9-sw-backup/serviceWorker.js.before-day9
cp -pr wp-content/themes/the-thor-child ~/day9-sw-backup/the-thor-child.before-day9
cp -p wp-content/themes/the-thor/inc/pwa/serviceWorker.php ~/day9-sw-backup/the-thor-serviceWorker.php.readonly-backup
cp -p wp-content/themes/the-thor/inc/parts/wp_footer.php ~/day9-sw-backup/the-thor-wp_footer.php.readonly-backup
if [ -d wp-content/mu-plugins ]; then cp -pr wp-content/mu-plugins ~/day9-sw-backup/mu-plugins.before-day9; fi
ls -la ~/day9-sw-backup
```

## 5. 実装で作成・更新する候補ファイル

MUプラグイン案:

- `wp-content/mu-plugins/` 配下の新規制御ファイル
- `wp-content/mu-plugins/` ディレクトリ自体

子テーマ案:

- `wp-content/themes/the-thor-child/functions.php`
- `wp-content/themes/the-thor-child/` 配下の PWA 制御用追加ファイル

## 6. THE THOR本体を変更しないこと

以下は読み取り確認のみで、編集しない。

- `wp-content/themes/the-thor/inc/pwa/serviceWorker.php`
- `wp-content/themes/the-thor/inc/parts/wp_footer.php`

## 7. serviceWorker.js を削除しないこと

- `/home/rvpuxcjb/public_html/moterist.com/serviceWorker.js` は直接削除しない
- `fit_pwaFunction_switch = off` による `unlink()` ルートは第一候補にしない
- `serviceWorker.js` の再生成元を制御し、安全な生成内容へ差し替えて維持する

## 8. 差し替え後 serviceWorker.js の完成コード案

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

## 9. MUプラグインで実装する場合の具体コマンド案

事前確認:

```bash
cd /home/rvpuxcjb/public_html/moterist.com
ls -la wp-content
ls -la wp-content/mu-plugins 2>/dev/null || true
grep -RIn 'serviceWorker\|fit_add_serviceWorker\|pwa' wp-content/mu-plugins 2>/dev/null || true
```

実装コマンド案:

```bash
cd /home/rvpuxcjb/public_html/moterist.com
mkdir -p wp-content/mu-plugins
$EDITOR wp-content/mu-plugins/day9-service-worker-override.php
php -l wp-content/mu-plugins/day9-service-worker-override.php
```

注記:

- MUプラグイン側で THE THOR の再生成フックに対して常時有効な制御を持たせる
- `serviceWorker.js` そのものを直接保存し直す運用にはしない
- 再生成後も安全な内容が維持されることを優先する

## 10. the-thor-childで実装する場合の具体コマンド案

事前確認:

```bash
cd /home/rvpuxcjb/public_html/moterist.com
ls -la wp-content/themes/the-thor-child
find wp-content/themes/the-thor-child -maxdepth 3 -type f
grep -RIn 'serviceWorker\|fit_add_serviceWorker\|pwa' wp-content/themes/the-thor-child 2>/dev/null
```

実装コマンド案:

```bash
cd /home/rvpuxcjb/public_html/moterist.com
mkdir -p wp-content/themes/the-thor-child/inc/pwa
$EDITOR wp-content/themes/the-thor-child/inc/pwa/service-worker-override.php
$EDITOR wp-content/themes/the-thor-child/functions.php
php -l wp-content/themes/the-thor-child/inc/pwa/service-worker-override.php
php -l wp-content/themes/the-thor-child/functions.php
```

注記:

- MUプラグインが使えない場合の第二候補として扱う
- 子テーマ側で `fit_add_serviceWorker()` の生成内容へ介入できる構造が明確な場合のみ採用する

## 11. どちらを採用するかの最終判断基準

MUプラグインを採る:

- 再生成フックに対して常時安定して効く
- `serviceWorker.js` 生成内容の差し替え管理をテーマから分離できる
- ロールバックを MUプラグイン単位で扱える
- `wp-content/mu-plugins/` の運用を受け入れられる

子テーマを採る:

- MUプラグインが使えない
- 子テーマ内で制御が閉じる
- 再生成後も差し替えが維持される

実装中止または再判断:

- 本体編集が必要になる
- ロールバックを具体化できない
- `PWA OFF` 以外に成立ルートがない

## 12. 実装後確認コマンド

```bash
cd /home/rvpuxcjb/public_html/moterist.com
sed -n '1,260p' serviceWorker.js
grep -n 'CACHE_NAME' serviceWorker.js
grep -n 'request.mode === .navigate.' serviceWorker.js
grep -n 'text/html' serviceWorker.js
grep -n 'request.method === .GET.' serviceWorker.js
grep -n 'wp-admin\|wp-login\|preview=true' serviceWorker.js
```

追加確認観点:

- `document / navigate request` がキャッシュ対象外になっていること
- 投稿更新、ログイン、ログアウト後の再生成でも期待内容が維持されること

## 13. サーバーcurl確認コマンド

```bash
curl -s https://moterist.com/fanza20250331/ | grep -o 'FANZA公式ページで登録前の案内を確認する'
curl -s https://moterist.com/fanza_otoku250114/ | grep -o 'FANZA公式ページで利用前の案内を確認する'
curl -s https://moterist.com/fanza20250331/ | grep -o '開催中のセール・キャンペーン情報を確認する' || true
curl -s https://moterist.com/fanza_otoku250114/ | grep -o '開催中のセール・キャンペーン情報を確認する' || true
curl -s https://moterist.com/fanza20250329/ | grep -o 'FANZA公式で最新情報を確認する'
```

追加確認観点:

- `1106` / `994` / `1095` の通常URLで意図どおりの表示か
- `noindex` / `canonical` / `title` / `meta description` / 外部リンクURLに意図しない変更がないか

## 14. Chrome DevTools確認手順

1. 対象URLを通常ブラウザで開く
2. `Application > Service Workers` を開く
3. Service Worker の scope と更新状態を確認する
4. `Application > Cache Storage` を開く
5. 新しい `CACHE_NAME` が使われているか確認する
6. 記事HTML URL が `Cache Storage` に残っていないか確認する
7. CSS / JS / 画像など静的資産が必要に応じて残っているか確認する
8. Service Worker の登録更新が完了しているか確認する

## 15. Service Worker / Cache Storage更新確認手順

1. `CACHE_NAME` 更新有無を確認する
2. 旧キャッシュ名が残る場合は、挙動差を確認する
3. 通常ブラウザで記事URLを再読み込みする
4. `serviceWorkers: 'block'` の確認結果と通常ブラウザ結果を比較する
5. `Cache Storage` に HTML 文書が再保存されていないか確認する
6. `/serviceWorker.js` を開いて期待内容になっているか確認する

## 16. ロールバックコマンド案

MUプラグイン案:

```bash
cd /home/rvpuxcjb/public_html/moterist.com
if [ -d ~/day9-sw-backup/mu-plugins.before-day9 ]; then cp -pr ~/day9-sw-backup/mu-plugins.before-day9/* wp-content/mu-plugins/; fi
```

子テーマ案:

```bash
cd /home/rvpuxcjb/public_html/moterist.com
cp -pr ~/day9-sw-backup/the-thor-child.before-day9/* wp-content/themes/the-thor-child/
php -l wp-content/themes/the-thor-child/functions.php
```

共通:

```bash
cp -p ~/day9-sw-backup/serviceWorker.js.before-day9 serviceWorker.js
sed -n '1,260p' serviceWorker.js
```

ブラウザ側の後処理:

- DevTools で Service Worker の登録解除状態を確認する
- DevTools で `Cache Storage` の不要キャッシュ削除を確認する

## 17. 実装中止条件

- `THE THOR` 本体編集が必要になる
- 子テーマ / MUプラグインから安全に差し替えられない
- HTML だけでなく静的資産キャッシュまで壊すおそれが高い
- ロールバック手順を実行可能な形で確保できない
- `PWA OFF` 以外に成立ルートがなく、影響評価が未完了

## 18. 操作ログへ残すべき内容

- 実装日時
- 実施者
- 採用したルート
- `MUプラグイン第一候補` の判断理由
- 追加 / 変更したファイルパス
- 変更前バックアップ保存先
- `serviceWorker.js` 確認結果
- 再生成後維持確認結果
- サーバー curl 確認結果
- DevTools での Service Worker / Cache Storage 確認結果
- 通常ブラウザ確認結果
- `1106` / `994` / `1095` 通常URL確認結果
- `noindex` / `canonical` / `title` / `meta description` / 外部リンクURLの確認結果
- `serviceWorkers: 'block'` 確認結果
- 問題の有無
- ロールバック実施有無
