# Day 8 Core Articles Production Fix Summary

## 目的

Day 8 の最小変更として、post_id `1106` と post_id `994` の末尾導線整理と外部CTA文言調整を WordPress 本番管理画面で反映し、公開画面で反映状況を確認して記録する。

今回は `1095` は変更しない前提で確認した。noindex、削除、301リダイレクト、slug変更、title変更、meta description変更、canonical変更、外部リンクURL変更は行わない。

## 対象

- post_id `1106`
  - URL: `https://moterist.com/fanza20250331/`
- post_id `994`
  - URL: `https://moterist.com/fanza_otoku250114/`
- post_id `1095`
  - URL: `https://moterist.com/fanza20250329/`

確認日: `2026-05-06`

## 管理画面で確認できた保存内容

### 1106

- 末尾 `次に確認したいページ` の保存済みHTMLで以下を確認
  - 外部CTA文言: `FANZA公式ページで登録前の案内を確認する`
  - 残す内部リンク:
    - `FANZA初心者向けガイドを見る`
    - `FANZAの安全な使い方を確認する`
  - 削除対象リンク:
    - `開催中のセール・キャンペーン情報を確認する`

### 994

- 末尾 `利用前の確認リンク` の保存済みHTMLで以下を確認
  - 外部CTA文言: `FANZA公式ページで利用前の案内を確認する`
  - 残す内部リンク:
    - `FANZA初心者向けガイドを見る`
    - `FANZAの入会メリットを確認する`
  - 削除対象リンク:
    - `開催中のセール・キャンペーン情報を確認する`

## 公開画面確認結果

### 1106

- 通常URL `https://moterist.com/fanza20250331/`
  - 末尾リンク集は旧表示のまま
  - 旧CTA文言 `FANZA公式で登録前の最新情報を確認する` が見える
  - `開催中のセール・キャンペーン情報を確認する` が残っている
- クエリ付きURL `https://moterist.com/fanza20250331/?v=20260506-check3`
  - 末尾リンク集は 3 本に整理済み
  - CTA文言は `FANZA公式ページで登録前の案内を確認する`
  - `開催中のセール・キャンペーン情報を確認する` は末尾から消えている
  - 本文中の `fanzaotoku` 文脈は残っている
  - 外部リンクURLは `al.dmm.co.jp` ラッパー経由、`video.dmm.co.jp/av/list/?genre=5002...` 系のまま
  - canonical: `https://moterist.com/fanza20250331/`
  - robots: `max-image-preview:large`
  - title / meta description に意図しない変更は見えない

### 994

- 通常URL `https://moterist.com/fanza_otoku250114/`
  - 末尾リンク集は旧表示のまま
  - 旧CTA文言 `FANZA公式で利用前の最新情報を確認する` が見える
  - `開催中のセール・キャンペーン情報を確認する` が残っている
- クエリ付きURL `https://moterist.com/fanza_otoku250114/?v=20260506-check2`
  - 末尾は CTA + 内部リンク2本に整理済み
  - CTA文言は `FANZA公式ページで利用前の案内を確認する`
  - `開催中のセール・キャンペーン情報を確認する` は末尾から消えている
  - 本文中の `fanzaotoku` 文脈は残っている
  - 外部リンクURLは `al.dmm.co.jp` ラッパー経由、`video.dmm.co.jp/av/list/?genre=5002...` 系のまま
  - canonical: `https://moterist.com/fanza_otoku250114/`
  - robots: `max-image-preview:large`
  - title / meta description に意図しない変更は見えない

### 1095

- 通常URL `https://moterist.com/fanza20250329/` で変更なしを確認
- CTA文言は `FANZA公式で最新情報を確認する` のまま
- `1106` 用・`994` 用の新CTA文言は入っていない
- canonical: `https://moterist.com/fanza20250329/`
- robots: `max-image-preview:large`
- title / meta description に意図しない変更は見えない

## スマホ表示に関する所見

- クエリ付きURLで反映済みHTMLを確認した限り、末尾の行動候補数は減っている
  - `1106`: 4候補相当 -> 3候補
  - `994`: CTA + 3リンク -> CTA + 2リンク
- そのため、末尾の圧迫感は軽減方向と判断してよい
- 通常URLは旧キャッシュ表示のため、キャッシュ反映前のスマホ見え方はまだ旧状態

## 意図しない変更の有無

- `1095` の本文変更: なし
- noindex: 追加なし
- canonical: 変更なし
- title: 意図しない変更なし
- meta description: 意図しない変更なし
- 外部リンクURL / アフィリエイトURL: 変更なし
- 削除、301リダイレクト、slug変更: 未実施

## 総合判定

- `1106` と `994` の最小変更自体は、WordPress 管理画面の保存済み本文とクエリ付き公開URLで確認できた
- 一方で、通常公開URLではまだ旧表示が返っており、公開キャッシュ反映待ちの状態と判断する
- `1095` は変更していない

## 通常URLの再確認

再確認日: `2026-05-06`

### 1106

- 通常URL `https://moterist.com/fanza20250331/` を再読込して確認
- 旧表示のまま
  - `開催中のセール・キャンペーン情報を確認する` が末尾に残っている
  - CTA文言は `FANZA公式で登録前の最新情報を確認する` のまま
- 外部リンクURL / アフィリエイトURLは変更なし
- noindex 追加なし
- canonical / title / meta description に意図しない変更なし

### 994

- 通常URL `https://moterist.com/fanza_otoku250114/` を再読込して確認
- 旧表示のまま
  - `開催中のセール・キャンペーン情報を確認する` が末尾に残っている
  - CTA文言は `FANZA公式で利用前の最新情報を確認する` のまま
- 外部リンクURL / アフィリエイトURLは変更なし
- noindex 追加なし
- canonical / title / meta description に意図しない変更なし

### 1095

- 通常URL `https://moterist.com/fanza20250329/` は変更なし
- `FANZA公式で最新情報を確認する` のまま
- `1106` / `994` 用の新CTA文言は入っていない
- noindex 追加なし
- canonical / title / meta description に意図しない変更なし

### 再確認時点の判断

- 通常公開URL側は、再確認時点でも `1106` / `994` の旧表示が残っている
- この時点の記録は `キャッシュ未反映` が妥当

## キャッシュ削除後の通常URL確認

確認日: `2026-05-06`

### 1106

- 通常URL `https://moterist.com/fanza20250331/` を、人間側の WordPress / サーバー / CDN キャッシュ削除後に再確認
- 依然として旧表示
  - 末尾 `開催中のセール・キャンペーン情報を確認する` が残っている
  - CTA文言は `FANZA公式で登録前の最新情報を確認する` のまま
- 外部リンクURL / アフィリエイトURLは変更なし
- noindex 追加なし
- canonical / title / meta description に意図しない変更なし
- スマホ幅 `390x844` でも末尾は 4 候補のままで、圧迫感軽減は未確認

### 994

- 通常URL `https://moterist.com/fanza_otoku250114/` を、人間側の WordPress / サーバー / CDN キャッシュ削除後に再確認
- 依然として旧表示
  - 末尾 `開催中のセール・キャンペーン情報を確認する` が残っている
  - CTA文言は `FANZA公式で利用前の最新情報を確認する` のまま
- 外部リンクURL / アフィリエイトURLは変更なし
- noindex 追加なし
- canonical / title / meta description に意図しない変更なし
- スマホ幅 `390x844` でも CTA + 内部リンク 3 本の旧構成で、圧迫感軽減は未確認

### 1095

- 通常URL `https://moterist.com/fanza20250329/` は変更なし
- `FANZA公式で最新情報を確認する` のまま
- `1106` / `994` 用の新CTA文言は入っていない
- noindex 追加なし
- canonical / title / meta description に意図しない変更なし

### 判断

- 人間側で WordPress / サーバー / CDN キャッシュ削除を行った後も、通常公開URLでは `1106` / `994` の旧表示が残っている
- この時点でも、公開URL側の記録は `未反映` が妥当

## 同日再確認

確認日: `2026-05-06`

- 通常URL `1106` / `994` / `1095` をあらためて通常遷移で再確認
- `1106`
  - 末尾 `開催中のセール・キャンペーン情報を確認する` は残存
  - CTA文言は `FANZA公式で登録前の最新情報を確認する` のまま
  - 外部リンクURL / canonical / robots / title / meta description に意図しない変更なし
- `994`
  - 末尾 `開催中のセール・キャンペーン情報を確認する` は残存
  - CTA文言は `FANZA公式で利用前の最新情報を確認する` のまま
  - 外部リンクURL / canonical / robots / title / meta description に意図しない変更なし
- `1095`
  - 変更なし
  - `FANZA公式で最新情報を確認する` のまま
- スマホ幅 `390x844` でも `1106` / `994` は 4 候補の旧末尾構成で、圧迫感軽減は未確認
- 結論:
  - この再確認時点でも通常公開URL側は `未反映`

## 補足

- 変更前バックアップは以下をローカル保存
  - `07_wp/article-backups/post-1106-before-day8-minfix-20260506.md`
  - `07_wp/article-backups/post-994-before-day8-minfix-20260506.md`

## HTML差分とヘッダー切り分け

確認日: `2026-05-06`

対象URL:

- `https://moterist.com/fanza20250331/`
- `https://moterist.com/fanza20250331/?v=day8-header-check`
- `https://moterist.com/fanza_otoku250114/`
- `https://moterist.com/fanza_otoku250114/?v=day8-header-check`

### HTML差分

- `1106`
  - 通常URL:
    - 旧文言 `FANZA公式で登録前の最新情報を確認する` を含む
    - `開催中のセール・キャンペーン情報を確認する` を含む
    - 新文言 `FANZA公式ページで登録前の案内を確認する` は含まない
  - クエリ付きURL:
    - 新文言 `FANZA公式ページで登録前の案内を確認する` を含む
    - `開催中のセール・キャンペーン情報を確認する` は含まない
    - 旧文言 `FANZA公式で登録前の最新情報を確認する` は含まない
- `994`
  - 通常URL:
    - 旧文言 `FANZA公式で利用前の最新情報を確認する` を含む
    - `開催中のセール・キャンペーン情報を確認する` を含む
    - 新文言 `FANZA公式ページで利用前の案内を確認する` は含まない
  - クエリ付きURL:
    - 新文言 `FANZA公式ページで利用前の案内を確認する` を含む
    - `開催中のセール・キャンペーン情報を確認する` は含まない
    - 旧文言 `FANZA公式で利用前の最新情報を確認する` は含まない

### レスポンスヘッダー

Playwright が受け取った main document のレスポンスヘッダーでは、4URLとも以下のみ確認できた。

- `status: 200`
- `content-type: text/html; charset=UTF-8`
- `server: LiteSpeed`
- `vary: Accept-Encoding`

未確認だった主なキャッシュ系ヘッダー:

- `cache-control`
- `expires`
- `age`
- `x-cache`
- `cf-cache-status`
- `etag`
- `last-modified`
- `x-litespeed-cache`

### 切り分け結果

- 通常URLとクエリ付きURLの HTML は実際に異なる
- クエリ付きURLでのみ新本文が返るため、`?v=...` によりクエリなしURLとは別キーでレスポンスが生成されている
- `cf-cache-status` や `cf-ray` が見えないため、Cloudflare のような前段 CDN キャッシュが返している確証はない
- `server: LiteSpeed` のみ見えており、クエリなしURLだけ旧本文を返す挙動から、最も疑わしいのは LiteSpeed 系のフルページキャッシュ、またはサーバー側ページキャッシュ
- WordPress 管理画面保存済み本文では修正後HTML、クエリ付きURLでも修正後HTMLが返っているため、WordPress のDB本文自体が旧に戻っている可能性は低い

### 疑わしいキャッシュ層

優先度順:

1. LiteSpeed / サーバー側のフルページキャッシュ
2. WordPress プラグイン系ページキャッシュ
3. CDN キャッシュ

### 人間側で次に削除すべきキャッシュ

- LiteSpeed Cache の公開URL単位パージ、またはサイト全体パージ
- mixhost 側のサーバーキャッシュ、静的化キャッシュ、Nginx / LiteSpeed キャッシュ相当があればそのパージ
- もし別途 CDN を使っているなら、そのパス単位パージ
  - `/fanza20250331/`
  - `/fanza_otoku250114/`
- purge 後は、通常URLとクエリ付きURLで本文一致を再確認する

## LiteSpeed / サーバーキャッシュ削除後の再確認

確認日: `2026-05-06`

- 通常URL `https://moterist.com/fanza20250331/`
  - 旧文言 `FANZA公式で登録前の最新情報を確認する` を引き続き含む
  - `開催中のセール・キャンペーン情報を確認する` を引き続き含む
  - 新文言 `FANZA公式ページで登録前の案内を確認する` は含まない
- 通常URL `https://moterist.com/fanza_otoku250114/`
  - 旧文言 `FANZA公式で利用前の最新情報を確認する` を引き続き含む
  - `開催中のセール・キャンペーン情報を確認する` を引き続き含む
  - 新文言 `FANZA公式ページで利用前の案内を確認する` は含まない
- 通常URL `https://moterist.com/fanza20250329/`
  - `FANZA公式で最新情報を確認する` のままで変更なし
- 外部リンクURL / アフィリエイトURL:
  - 変更なし
- noindex:
  - 追加なし
- canonical / title / meta description:
  - 意図しない変更なし
- スマホ幅 `390x844`:
  - `1106` は末尾 4 候補のまま
  - `994` も末尾 4 候補のまま
  - 圧迫感軽減は未確認

### ヘッダー変化

- 通常URL 3 本の main document ヘッダーは前回確認時と同じ
  - `status: 200`
  - `content-type: text/html; charset=UTF-8`
  - `server: LiteSpeed`
  - `vary: Accept-Encoding`
- 新たに見えるようになったキャッシュ系ヘッダーはなし

### 判断

- LiteSpeed / サーバーキャッシュ削除後も、通常URL側の本文とヘッダーに有意な変化は確認できない
- 記録上は、通常公開URL側は引き続き `未反映`

## キャッシュファイル・プラグイン・リライト観点の切り分け

確認日: `2026-05-06`

### 見つかったキャッシュ系プラグイン・ディレクトリ

- WordPress 管理画面のプラグイン一覧で確認できた有効プラグイン:
  - `CAPTCHA 4WP`
  - `Classic Editor`
  - `Classic Widgets`
  - `Customizer Export/Import`
  - `EWWW Image Optimizer`
- 管理画面上では、`LiteSpeed Cache`、`WP Super Cache`、`Autoptimize` など代表的なキャッシュ系プラグインは確認できなかった
- ローカルワークスペース内には、WordPress 実体の `wp-content/cache/` は存在しなかった
- ローカルワークスペース内には、`litespeed` / `supercache` / `autoptimize` に該当する WordPress 実ディレクトリは確認できなかった
- ローカルワークスペース内で見つかった `cache` 文字列を含む対象は、調査メモ類のみ

### .htaccess / リライト確認

- ローカルワークスペース内では `.htaccess` 実ファイルを確認できなかった
- そのため、LiteSpeed Cache 由来の rewrite ルール、query string での cache bypass 条件、`CacheLookup` 系設定の有無はローカルからは未確認

### 原因候補

- WordPress プラグインキャッシュより、ホスティング側の LiteSpeed フルページキャッシュが最有力
- 理由:
  - 管理画面保存済み本文では新HTML
  - クエリ付きURLでは新HTML
  - 通常URLだけ旧HTML
  - レスポンスヘッダーは `server: LiteSpeed`
  - 代表的な WordPress キャッシュ系プラグインは見えていない
- 追加候補:
  - `.htaccess` またはサーバー設定側で、query string 付きリクエストだけ cache miss / bypass になっている
  - LiteSpeed 側に URL 単位の古い静的ページキャッシュが残っている

### 削除候補のキャッシュファイル・キャッシュディレクトリ

ローカルワークスペースから実在確認できた削除候補はなし。削除候補はサーバー上の以下を想定する。

- WordPress 実体の `wp-content/cache/` 配下
- LiteSpeed Cache 系のページキャッシュディレクトリ
- サーバー側の vhost / domain 単位のページキャッシュ領域
- 対象URL単位のキャッシュキー
  - `/fanza20250331/`
  - `/fanza_otoku250114/`

### 人間側で実行すべき安全な削除手順

1. ホスティング管理画面またはサーバー管理画面で、対象ドメインの LiteSpeed / ページキャッシュ機能を確認する
2. まず URL 単位で以下をパージする
   - `/fanza20250331/`
   - `/fanza_otoku250114/`
3. URL 単位で変化がなければ、ドメイン単位のフルページキャッシュをパージする
4. さらに変化がなければ、`wp-content/cache/` 配下の該当キャッシュを確認する
5. `.htaccess` または LiteSpeed Cache 設定画面で、query string 付きだけ bypass されるルールがないかを確認する
6. 各段階の後で、通常URLとクエリ付きURLの本文一致を再確認する

### 現時点の結論

- ローカルからは WordPress キャッシュファイル実体も `.htaccess` も確認できない
- プラグイン一覧に代表的なキャッシュプラグインが見えないため、原因は WordPress 記事本文ではなく、LiteSpeed / サーバー側ページキャッシュ、またはその rewrite 条件である可能性が高い

## SSH 読み取り調査の試行結果

確認日: `2026-05-06`

- 指定された SSH 接続先:
  - `ssh -i C:\Users\Tachi\.ssh\mixhost_codex_pc -p 22 rvpuxcjb@133.125.148.25`
- 試行結果:
  - 接続未成立
  - この実行環境からは鍵ファイル `C:\Users\Tachi\.ssh\mixhost_codex_pc` へのアクセスで `Permission denied` が発生した
- そのため、以下はサーバー実体未確認
  - `/home/rvpuxcjb/public_html/moterist.com`
  - `wp-content/cache/`
  - サーバー上の `.htaccess`
  - サーバー上の旧文言を含むキャッシュファイル候補

### この試行で分かったこと

- 問題は認証情報の中身ではなく、ローカル実行環境から SSH 鍵パスへアクセスできない点
- したがって、本ターンではサーバー上のキャッシュ実体確認までは進められていない

### 人間側で次に行うとよいこと

1. ローカル端末から直接、指定 SSH コマンドで接続できるか確認する
2. 接続できたら、以下を読み取り確認する
   - `ls -la /home/rvpuxcjb/public_html/moterist.com/wp-content`
   - `ls -la /home/rvpuxcjb/public_html/moterist.com/wp-content/cache`
   - `find /home/rvpuxcjb/public_html/moterist.com/wp-content -maxdepth 5 -type d | grep -Ei 'cache|litespeed|lscache|supercache|autoptimize'`
   - `grep -nEi 'cache|litespeed|rewrite|expires|query|qs|vary' /home/rvpuxcjb/public_html/moterist.com/.htaccess`
   - `grep -RIl 'FANZA公式で登録前の最新情報を確認する' /home/rvpuxcjb/public_html/moterist.com/wp-content | head -50`
   - `grep -RIl 'FANZA公式で利用前の最新情報を確認する' /home/rvpuxcjb/public_html/moterist.com/wp-content | head -50`
3. キャッシュファイル候補が見つかった場合も、その場では削除せず、まずパス一覧だけ控える

## Service Worker 影響排除後の最終確認

確認日: `2026-05-06`

前提として、以下を記録する。

- 人間側確認では、サーバー上の curl で通常URLも新HTMLを返していた
- `serviceWorker.js` が存在し、fetch イベントで HTML レスポンスを Cache Storage に保存・再利用する実装が確認されている
- THE THOR 側で `serviceWorker.js` が登録されている
- Chrome DevTools 上で `moterist.com` の Service Worker と `cache-v...` の Cache Storage が確認されている

### 確認方法

- Playwright の新規ブラウザコンテキストを `serviceWorkers: 'block'` で作成
- ビューポートは `390x844`
- 通常URLを Service Worker 無効化状態で確認

### 1106

- URL: `https://moterist.com/fanza20250331/`
- `FANZA公式ページで登録前の案内を確認する` を確認
- 末尾 `次に確認したいページ` から `開催中のセール・キャンペーン情報を確認する` が消えていることを確認
- 本文中の `fanzaotoku` 文脈は残っている
- 末尾リンクは以下の 3 本
  - `FANZA公式ページで登録前の案内を確認する`
  - `FANZA初心者向けガイドを見る`
  - `FANZAの安全な使い方を確認する`

### 994

- URL: `https://moterist.com/fanza_otoku250114/`
- `FANZA公式ページで利用前の案内を確認する` を確認
- 末尾 `利用前の確認リンク` から `開催中のセール・キャンペーン情報を確認する` が消えていることを確認
- 本文中の `fanzaotoku` 文脈は残っている
- 末尾は CTA + 内部リンク 2 本
  - `FANZA公式ページで利用前の案内を確認する`
  - `FANZA初心者向けガイドを見る`
  - `FANZAの入会メリットを確認する`

### 1095

- URL: `https://moterist.com/fanza20250329/`
- 変更なしを確認
- `FANZA公式で最新情報を確認する` のまま

### 共通確認

- 外部リンクURL / アフィリエイトURL:
  - 変更なし
- noindex:
  - 3記事とも追加なし
- canonical / title / meta description:
  - 3記事とも意図しない変更なし
- スマホ幅:
  - `1106` は末尾 3 候補で圧迫感軽減を確認
  - `994` は CTA + 内部リンク 2 本で圧迫感軽減を確認

### 最終判断

- Service Worker 影響を排除した通常URL確認では、`1106` / `994` は反映済みと判断できる
- 通常ブラウザで旧表示が残る場合の原因は、`Service Worker / Cache Storage` 由来のローカルキャッシュ残存が最有力
- 今後の記事更新確認では、`Service Worker 無効化`、`新規ブラウザコンテキスト`、`サーバー curl 確認` の併用を推奨する
