# Day 8-9 Combined Completion Summary

## 1. 全体目的

Day 8-9 の全体目的は、中核記事 `1106` / `994` の導線整理を最小変更で本番反映し、その後に判明した `Service Worker / Cache Storage` 起因の旧表示問題を恒久寄りに是正することだった。

## 2. Day 8で実施したこと

- `1106` 末尾 `次に確認したいページ` から `開催中のセール・キャンペーン情報を確認する` を削除
- `1106` 外部CTA文言を `FANZA公式ページで登録前の案内を確認する` に変更
- `994` 末尾 `利用前の確認リンク` から `開催中のセール・キャンペーン情報を確認する` を削除
- `994` 外部CTA文言を `FANZA公式ページで利用前の案内を確認する` に変更
- `1095` は変更せず、既存導線を維持
- スマホ幅での末尾圧迫感軽減、通常URL反映、キャッシュ影響切り分けを実施

## 3. Day 9で実施したこと

- Day 8 の旧表示問題が `Service Worker / Cache Storage` 起因であると整理
- 実装ルートを `MUプラグイン第一候補` に確定
- `wp-content/mu-plugins/day9-service-worker-override.php` を本番配置
- `serviceWorker.js` を安全版へ切り替え
- 公開 `serviceWorker.js` と `1106` / `994` / `1095` の通常URLを再確認

## 4. 本番で変更されたもの

- 記事 `1106` 本文末尾リンク構成
- 記事 `1106` 外部CTA文言
- 記事 `994` 本文末尾リンク構成
- 記事 `994` 外部CTA文言
- `wp-content/mu-plugins/day9-service-worker-override.php`
- 公開 `serviceWorker.js` の生成内容

## 5. 本番で変更していないもの

- 記事 `1095` 本文とCTA文言
- THE THOR 本体ファイル
- `fit_pwaFunction_switch`
- 外部リンクURL / アフィリエイトURL
- `noindex`
- canonical
- title
- meta description
- slug / 301 / 削除系設定

## 6. 記事表示確認結果

### 1106

- `FANZA公式ページで登録前の案内を確認する` を確認
- 末尾 `開催中のセール・キャンペーン情報を確認する` は消えている
- スマホ幅でも末尾圧迫感軽減を確認

### 994

- `FANZA公式ページで利用前の案内を確認する` を確認
- 末尾 `開催中のセール・キャンペーン情報を確認する` は消えている
- スマホ幅でも末尾圧迫感軽減を確認

### 1095

- `FANZA公式で最新情報を確認する` を維持
- `開催中のセール・キャンペーン情報を確認する` を維持
- 変更なしとして想定どおり

## 7. Service Worker変更内容

- `CACHE_NAME` を `cache-v260506-day9-static-assets-v1` に変更
- `document / navigate / text/html / GET以外` をキャッシュ対象外に変更
- `wp-admin / wp-login / preview=true` 除外を維持
- `style / script / image / font` の静的資産だけをキャッシュ対象に限定
- 旧 `cache-v260506182046` を廃止
- 旧 `cache.put(event.request, responseToCache)` ロジックを除去

## 8. MUプラグイン採用理由

- THE THOR の `fit_add_serviceWorker()` が再生成フックを持っており、子テーマ単独より `MUプラグイン` の方が再生成後の制御維持に有利だったため
- THE THOR 本体を直接編集せずに対応できるため
- ロールバックを対象ファイル単位で扱いやすいため

## 9. 意図しない変更がないこと

確認範囲で以下の意図しない変更は見ていない。

- `noindex` 追加
- canonical 変更
- title 変更
- meta description 変更
- 外部リンクURL / アフィリエイトURL変更

## 10. ロールバック方針

- `wp-content/mu-plugins/day9-service-worker-override.php` を対象ファイル単位で退避 / 復元
- 変更前バックアップ済み `serviceWorker.js` を復元
- DevTools で Service Worker 登録状態と Cache Storage 状態を確認
- THE THOR 本体には触れない

## 11. 最終結論

Day 8-9 の一連作業は完了した。

- Day 8 では `1106` / `994` の末尾導線整理とCTA文言修正を本番反映
- Day 9 では stale HTML の主因だった `Service Worker / Cache Storage` 挙動を `MUプラグイン` で是正
- `1095` は変更せず維持
- 公開 `serviceWorker.js`、`1106`、`994`、`1095` の確認でも想定どおりの状態を確認

現時点では、記事表示と Service Worker 安全化の両方が完了した状態として扱える。
