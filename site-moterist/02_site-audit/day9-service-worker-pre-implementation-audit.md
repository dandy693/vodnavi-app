# Day 9 Service Worker Pre-Implementation Audit

## 調査できた範囲

- 既存の Day 8 / Day 9 設計メモを再確認
- Day 8 時点の公開確認結果と、Service Worker をブロックした通常URL確認結果を再整理
- `serviceWorker.js` が HTML レスポンスを Cache Storage に保存・再利用する実装である、という既確認事項を前提として監査観点を整理
- THE THOR 側の関連候補ファイルとして、以下を調査対象に固定
  - `/home/rvpuxcjb/public_html/moterist.com/serviceWorker.js`
  - `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor/inc/pwa/serviceWorker.php`
  - `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor/inc/parts/wp_footer.php`
- この実行環境からは秘密鍵 `C:\Users\Tachi\.ssh\mixhost_codex_pc` にアクセスできず、SSH 読み取り調査は未成立

## 現状の問題

Day 8 の `1106` / `994` 本番修正は、管理画面保存済み本文、サーバー側 curl、Service Worker をブロックした新規ブラウザコンテキストでは反映済みだった。一方で、通常ブラウザでは旧HTMLが残るケースがあり、公開確認の誤判定リスクが発生した。

現時点では、主因はサーバー側キャッシュではなく、`Service Worker / Cache Storage` による HTML のローカル再利用と判断している。

## serviceWorker.js の現在挙動

既確認事項として、以下を前提にする。

- `serviceWorker.js` が存在する
- fetch イベントで HTML レスポンスを Cache Storage に保存・再利用する
- Chrome DevTools 上で `moterist.com` の Service Worker と `cache-v...` が確認されている
- THE THOR 側で Service Worker が登録されている

この挙動により、サーバー上では新HTMLが返っていても、既存ブラウザでは旧HTMLが返る余地がある。

## THE THOR の生成処理

直接読めたわけではないが、既存計画上の調査対象から、生成処理の第一候補は以下。

- `wp-content/themes/the-thor/inc/pwa/serviceWorker.php`

実装前に確認すべき観点は以下。

- `serviceWorker.js` を PHP 側で動的生成しているか
- キャッシュ対象の URL / request 種別を PHP 側で定義しているか
- Cache Storage バージョンや pre-cache 対象を PHP 側で出しているか
- フィルタや条件分岐で子テーマ / MUプラグインから介入できる余地があるか

## THE THOR の登録処理

直接読めたわけではないが、既存計画上の登録処理候補は以下。

- `wp-content/themes/the-thor/inc/parts/wp_footer.php`

実装前に確認すべき観点は以下。

- `navigator.serviceWorker.register(...)` をどこで出力しているか
- テーマ設定で登録自体を停止できるか
- `wp_footer`、独自アクション、独自関数など、差し替え可能な出力点があるか
- 子テーマや MUプラグインで `remove_action` 相当の制御ができるか

## 管理画面設定で対応できる可能性

優先的に確認すべきルートは `管理画面設定` での対応可否。

期待する設定候補:

- PWA 機能の停止
- Service Worker 登録停止
- HTML キャッシュ除外
- オフラインページのみ有効化
- キャッシュ対象種別の限定

評価:

- 利点:
  - 本体ファイルに触れずに済む
  - 反映とロールバックが最も単純
- 制約:
  - HTML だけ除外する粒度がない可能性が高い
  - PWA 全停止しか選べない場合、影響範囲が広い

結論:

- 最初に確認する価値は高いが、最小要件である `記事HTMLのみ除外` まで管理画面で完結する保証はない

## 子テーマで対応できる可能性

子テーマ対応は `中程度から高め` の実現可能性がある。

想定ルート:

- Service Worker 登録用の出力を止めて、差し替え登録を行う
- THE THOR 側の登録条件を子テーマ側で制御する
- 生成元がフック可能なら、HTML キャッシュ除外済みの生成内容へ誘導する

利点:

- テーマ更新耐性を持たせやすい
- テーマ依存ロジックをテーマ系レイヤーで完結しやすい

リスク:

- THE THOR のフック構造次第で差し替えが難しい
- 登録停止はできても、生成内容の細粒度制御は別ルートになる可能性がある

## MUプラグインで対応できる可能性

MUプラグイン対応は `高め` の候補とみなせる。

想定ルート:

- テーマの Service Worker 登録出力条件をフックで制御
- 登録JSや関連フックをテーマ外から上書き
- 条件次第で、記事HTMLをキャッシュしない独自の登録 / 生成制御に寄せる

利点:

- テーマ更新の影響を受けにくい
- 運用ルールをテーマ本体から切り離せる

リスク:

- テーマ側実装が密結合だと完全制御できない場合がある
- 登録停止と生成制御の責務が分かれ、設計を雑にすると追跡しにくい

## 推奨する最小実装ルート

推奨順は以下。

1. 管理画面で PWA / Service Worker の停止・粒度調整可否を確認する
2. 管理画面で足りなければ、`MUプラグイン` を第一候補にして登録制御または生成制御を行う
3. MUプラグインで難しければ、`子テーマ` で登録出力や生成条件を制御する
4. THE THOR 本体は直接編集しない

理由:

- Day 9 の最小目的は `記事HTMLを Service Worker キャッシュ対象から外すこと`
- そのため、PWA 全停止ではなく、`document / navigate` だけを対象外にできるルートが望ましい
- 更新耐性とロールバック容易性を優先すると、`MUプラグイン -> 子テーマ -> 本体編集回避` の順が安全

## 採用しない実装ルートと理由

### PWA 全停止を第一候補にしない

- 問題は解消しやすいが影響範囲が広い
- 静的資産キャッシュや既存 PWA 利点まで止まる

### serviceWorker.js の削除

- 乱暴でロールバックも追跡もしづらい
- 登録処理が残ると不整合が起きうる

### THE THOR 本体の直接編集

- テーマ更新で上書きされる
- 差分追跡と保守性が悪い

### キャッシュ削除運用だけで恒久対応扱いにする

- ユーザー側 stale HTML 問題を解消しない
- Day 8 と同種の誤判定が再発する

## fetch イベントの修正方針

最小変更の考え方は以下。

- `request.mode === 'navigate'` をキャッシュしない
- `Accept: text/html` の document request をキャッシュしない
- CSS / JS / 画像などの静的資産キャッシュは維持する

第一候補:

- `navigate` と `text/html` を `network-only` または `network-first` に寄せる

擬似コード方針:

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

  // 静的資産だけ既存キャッシュ戦略を適用
});
```

補助案:

- offline 時の UX を残したい場合だけ `network-first` を採用し、失敗時のみ cache fallback とする

## 実装前バックアップ対象

本番反映前に最低限確保すべき対象は以下。

- 現行 `/serviceWorker.js`
- `wp-content/themes/the-thor/inc/pwa/serviceWorker.php`
- `wp-content/themes/the-thor/inc/parts/wp_footer.php`
- PWA 関連の管理画面設定値
- 既存の子テーマ `functions.php` と関連 PWA 制御コード
- `wp-content/mu-plugins/` が存在する場合は、その現行一覧と該当ファイル

管理画面設定が絡む場合は、値のメモだけでなくスクリーンショットも推奨。

## 実装後確認項目

- 通常ブラウザで更新記事が即時に新HTMLを返すか
- Service Worker を有効にした通常ブラウザでも旧HTMLが残らないか
- Chrome DevTools の Cache Storage に記事HTMLが保存されていないか
- CSS / JS / 画像の読み込みが崩れていないか
- スマホ幅で表示崩れがないか
- Day 8 と同様の CTA / 内部リンク更新が通常URLで誤判定されないか
- 新規コンテキスト確認と通常ブラウザ確認で表示差がないか

## ロールバック方針

1. 変更前ファイルと設定値を退避する
2. 反映は 1 論点ずつ行う
3. 問題が出た場合は、まず登録制御だけ元に戻す
4. それでも不整合が残る場合は、生成制御も元に戻す
5. ロールバック後に以下を確認する
   - Service Worker 再登録状態
   - Cache Storage の再生成状態
   - 通常URL表示
   - 静的資産読み込み

## 残リスク

- THE THOR の実装が想定以上に密結合だと、MUプラグインや子テーマだけでは十分に制御できない可能性がある
- `network-first` を採る場合、回線不調時のフォールバック設計が必要になる
- 既存ユーザー端末には、古い Service Worker 登録や古い Cache Storage が残る移行期間が発生しうる
- 管理画面設定で見えている項目だけでは、内部の生成ロジック差分を把握しきれない可能性がある

## SSH で未確認のため人間側で読むべきコマンド

この実行環境では秘密鍵 `C:\Users\Tachi\.ssh\mixhost_codex_pc` へのアクセスで `Permission denied` が発生し、SSH 読み取り調査はできなかった。人間側で以下を読み取り専用で実行すると、実装前の確証が取れる。

```bash
ssh -i C:\Users\Tachi\.ssh\mixhost_codex_pc -p 22 rvpuxcjb@133.125.148.25
cd /home/rvpuxcjb/public_html/moterist.com
pwd
sed -n '1,240p' serviceWorker.js
sed -n '1,240p' wp-content/themes/the-thor/inc/pwa/serviceWorker.php
sed -n '1,240p' wp-content/themes/the-thor/inc/parts/wp_footer.php
find wp-content/themes -maxdepth 4 -type f | grep -Ei 'pwa|serviceworker|sw'
find wp-content/plugins -maxdepth 4 -type f | grep -Ei 'pwa|serviceworker|sw|manifest'
find wp-content/mu-plugins -maxdepth 4 -type f 2>/dev/null | grep -Ei 'pwa|serviceworker|sw|manifest' || true
grep -RIn 'serviceWorker' wp-content/themes/the-thor wp-content/plugins wp-content/mu-plugins 2>/dev/null | head -100
grep -RIn 'navigator.serviceWorker' wp-content/themes/the-thor wp-content/plugins wp-content/mu-plugins 2>/dev/null | head -100
grep -RIn 'fetch' serviceWorker.js wp-content/themes/the-thor/inc/pwa/serviceWorker.php 2>/dev/null
```

上記の出力が取れれば、`管理画面設定で足りるか`、`MUプラグインや子テーマで止められるか`、`生成内容を書き換える必要があるか` の判定精度を上げられる。
