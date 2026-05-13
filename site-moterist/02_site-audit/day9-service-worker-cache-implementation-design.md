# Day 9 Service Worker Cache Implementation Design

## 現状の問題

Day 8 の本番反映後、`1106` / `994` の通常URLで旧表示が残る現象が発生した。管理画面保存済み本文、サーバー側 curl、Service Worker をブロックした新規ブラウザコンテキストでは新HTMLが返っていたため、主因はサーバー側ではなく、ブラウザ側の `Service Worker / Cache Storage` による HTML 再利用と判断している。

## 推奨する実装方針

推奨は以下の組み合わせ。

- 恒久対応:
  - 記事HTMLを Service Worker のキャッシュ対象から外す
- 運用継続:
  - 更新確認時は `Service Worker 無効化`、`新規ブラウザコンテキスト`、`サーバーcurl確認` を併用する

実装方針としては、THE THOR 本体を直接編集せず、まずは `管理画面設定` の有無を確認し、難しければ `子テーマ` または `MUプラグイン` から Service Worker 登録や生成内容を安全に制御する。

## 採用しない方針と理由

- `serviceWorker.js` を削除する
  - 影響範囲が大きく、PWA 全体を乱暴に壊す可能性がある
- THE THOR 本体ファイルを直接編集する
  - テーマ更新で上書きされる
  - 差分追跡とロールバックが不安定になる
- キャッシュ削除だけで恒久対応扱いにする
  - 根本原因を残す

## 実装候補A: 管理画面設定でPWA調整

内容:

- THE THOR の PWA 関連設定に、Service Worker 停止、HTML キャッシュ除外、または PWA 機能調整項目があるかを確認する

利点:

- 本体ファイルに触れずに対応できる
- 反映とロールバックが比較的容易

弱点:

- HTML キャッシュ除外の粒度まで設定できるとは限らない
- PWA 全停止しか選べない可能性がある

適用優先度:

- 最優先で調査

## 実装候補B: 子テーマでserviceWorker登録制御

内容:

- 子テーマ側から、THE THOR の Service Worker 登録処理を無効化または差し替え制御する
- 可能なら `wp_footer` まわりの出力や PWA 登録フックを子テーマで調整する

利点:

- THE THOR 本体を触らずに済む
- テーマ更新耐性を持たせやすい

弱点:

- THE THOR 側のフック構造が公開されていないと難しい
- 登録停止はできても、生成される `serviceWorker.js` の中身変更までは別対応が必要な可能性がある

適用優先度:

- 管理画面設定で足りない場合の有力候補

## 実装候補C: MUプラグインでserviceWorker登録制御

内容:

- MUプラグインで、Service Worker 登録スクリプトの出力条件や関連フックを制御する
- テーマ依存のロジックをテーマ外へ逃がす

利点:

- テーマ更新の影響を受けにくい
- 制御ロジックをサイト運用側資産として独立させやすい

弱点:

- THE THOR の登録実装に強く依存する場合、完全制御できない可能性がある
- テーマ出力と MUプラグインの責務が分かれ、設計を雑にすると追跡しづらい

適用優先度:

- 子テーマより更新耐性を重視する場合の有力候補

## 実装候補D: serviceWorker.js生成処理を安全に上書き

内容:

- `wp-content/themes/the-thor/inc/pwa/serviceWorker.php` 相当の生成処理を、直接編集ではなく、子テーマまたは MUプラグイン経由で安全に差し替える
- 目的は `document / navigate` リクエストをキャッシュしない、または `network-first` に寄せること

利点:

- 問題原因である HTML キャッシュ挙動に直接手当てできる
- 静的資産キャッシュは残しつつ、記事HTMLだけ除外しやすい

弱点:

- 最も慎重な設計が必要
- どのレイヤーで生成差し替えできるかを先に特定する必要がある
- 実装前の検証不足だと、PWA 全体の挙動を壊す可能性がある

適用優先度:

- A で足りず、B/C で登録制御だけでは不十分な場合の第一候補

## fetchイベントで記事HTMLをキャッシュしない擬似コード

```js
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const isNavigate = request.mode === 'navigate';
  const accept = request.headers.get('accept') || '';
  const isHtml = accept.includes('text/html');

  // HTML ドキュメントはキャッシュしない
  if (isNavigate || isHtml) {
    event.respondWith(fetch(request));
    return;
  }

  // 静的資産だけ cache-first / stale-while-revalidate 等を適用
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
```

network-first に寄せる擬似コードは以下。

```js
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const isNavigate = request.mode === 'navigate';

  if (isNavigate) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // 静的資産は既存戦略を維持
});
```

## 本番反映前チェックリスト

- 管理画面の PWA 設定で停止・除外・調整ができるか
- THE THOR 側の Service Worker 登録が、子テーマまたは MUプラグインから制御可能か
- `document` / `navigate` リクエストが現行でどの条件でキャッシュされるか
- 変更が THE THOR 本体直接編集なしで実現できるか
- 静的資産キャッシュを維持するか、PWA を弱めるかの方針が決まっているか
- テスト環境または限定条件で以下を確認できるか
  - 通常URL更新直後の反映
  - Service Worker 再登録後の表示
  - スマホ表示
  - CSS / JS / 画像読み込み

## 本番反映後チェックリスト

- 通常ブラウザで更新記事が新HTMLを返すか
- 新規ブラウザコンテキストでも通常ブラウザでも表示差がないか
- Cache Storage に HTML 文書が保存されていないか
- `1106` / `994` のような記事修正で stale 表示が再発しないか
- オフライン時や再訪時に静的資産読み込みが壊れていないか

## ロールバック手順

1. 変更前の Service Worker 登録条件と生成内容を記録する
2. 変更差分は 1 論点ずつ反映する
3. 問題が出た場合は、直前の登録制御または生成制御へ戻す
4. ロールバック後に以下を再確認する
   - 通常URL表示
   - Service Worker 再登録状態
   - Cache Storage バージョン整合

## Day 9で実装する場合の最小変更案

第一候補:

- 管理画面設定で PWA / Service Worker の HTML キャッシュ除外ができるか確認
- できなければ、子テーマまたは MUプラグインで `document / navigate` リクエストだけを Service Worker 対象外にする
- 静的資産キャッシュは維持する

最小変更の考え方:

- PWA 全停止ではなく、まず HTML キャッシュだけを止める
- Service Worker 登録を完全撤去せず、HTML だけを対象外にする
- THE THOR 本体は直接編集しない

## 実装時に絶対に避けること

- `serviceWorker.js` を削除する
- THE THOR 本体を直接編集する
- いきなり PWA 全停止を本番反映する
- キャッシュ削除だけで恒久対応完了と判断する
