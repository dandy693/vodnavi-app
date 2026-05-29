3サイト解析の整合性。2026-05-20〜21 の集中監査で全致命的不整合を解消、fanza_cta_click が GA4 Realtime で end-to-end 受信される状態まで到達。残課題は G-5HYV772ER9 廃止判断 (2-4 週後) と _gl 実機検証 (シークレットモード) のみ。**Why:** moterist.com→vodnavi.jp→app.vodnavi.jp の動線統合計測のため。**How to apply:** 後続作業時はまず「修正済み(2026-05-21時点)」セクションで現状を把握、残課題セクションから着手。

## moterist.com wp-admin 完全監査 (2026-05-21)
- CTA管理: 0 件 → THE THOR ネイティブ CTA システム未使用、the_content filter と非競合
- インストール済プラグイン 5 種 (CAPTCHA 4WP, Classic Editor, Classic Widgets, Customizer Export/Import, EWWW Image Optimizer): いずれも計測/タグ系プラグイン無し → GA4 + linker 注入の唯一源は functions.php 確定
- 投稿エディタ (post 994 編集画面) で `#content` textarea を確認: 11967 文字、`vodnavi-fanza-cta` / `al.dmm` / `link_tool` いずれも含まず → DB 側の post_content は無傷、CTA は filter のみで render 時注入 (仕様通り、reversible)
- RSS フィード (`/feed/`) に `vodnavi-fanza-cta-list` の漏洩無し ✓
- サイトヘルス: 致命的問題無し、推奨改善 2 件 (PHP モジュール / オブジェクトキャッシュ系で mixhost 共通、計測無関係)

## 修正済み(2026-05-20)

### ✓ moterist.com に G-GG7JV9MJRW デュアルタギング追加
- ファイル: `/home/rvpuxcjb/public_html/moterist.com/wp-content/themes/the-thor-child/functions.php` 行43-46
- バックアップ: `functions.php.bak_dual_ga_20260520_2245`
- 効果: moterist.com は G-5HYV772ER9 (旧, モテリスト account) と G-GG7JV9MJRW (新統合, VODまとめ研究所 account) の両方に送信。linker.domains は `['app.vodnavi.jp', 'vodnavi.jp']` + `accept_incoming: true` で両 destination に設定。
- 将来 G-5HYV772ER9 は廃止可、その時点で gtag 行と script src を片方ずつ削除する

### ✓ vodnavi.jp に Cross-Domain Linker MU-plugin 追加
- ファイル: `/home/rvpuxcjb/public_html/vodnavi.jp/wp-content/mu-plugins/vodnavi-cross-domain-linker.php`
- 効果: Site Kit が出す `set linker { domains: ['vodnavi.jp'] }` を `gtag('set', 'linker', { domains: ['vodnavi.jp', 'app.vodnavi.jp', 'moterist.com'], accept_incoming: true })` で上書き、`gtag('config', 'G-GG7JV9MJRW', { linker:{...}, send_page_view:false })` も追加
- wp_head 優先度 1000 (Site Kit の優先度 8 より後に注入)
- ログインユーザーは tracking 除外(Site Kit と整合)

### ✓ GA4 重複プロパティ削除
- VODまとめ研究所 / moterist.com (538218455, G-Y6SXENKYMT) をゴミ箱送り
- 削除前に realtime「データなし」確認済 → 安全
- 35日復元可能

### ✓ SC vodnavi.jp プロパティから app.vodnavi.jp/sitemap.xml 削除
- sc-domain:app.vodnavi.jp 側に同じ sitemap が登録済みで重複だった

### ✓ app-concierge コードの docstring 更新
- `app-concierge/src/components/google-analytics.tsx` に「moterist.com デュアルタギング前提」のメモを追加

## 残課題(ユーザー手動操作必須)

### ✓ moterist.com SC ドメインプロパティ取得完了 (2026-05-21)
- TXT 投入完了 (cPanel ゾーンエディタ, 値: `google-site-verification=y4HcYcm9VTysKgm-fQzUw_6OfxM3ZktCmN8TT00HC2w`)
- Resolve-DnsName で TXT 反映確認後、SC モーダルで [確認] 押下 → 「所有権を証明しました」表示
- サイトマップは wp-sitemap.xml (88 pages, 成功) が自動継承済
- URL-prefix `https://moterist.com/` も moterist.com@gmail.com 配下に確認済み所有、確認方法は (a) HTML ファイル + (b) ドメイン名プロバイダ TXT の 2 種類とも active で「未使用の確認トークン」は存在せず削除不要

### ✓ moterist.com ピラー残3記事 + 1106 緩和 (2026-05-20)
- `the-thor-child/functions.php` の 1106 個別ブロックを共通ハンドラに置換し、994/954/1018/1106 を post_id ベース config で一括管理
- 緩和: `closest('.content')` && `closest('li')` && al.dmm.co.jp affiliate URL 形のみで発火 (outline_1__9 位置関係 + 厳密 text 一致は廃止)
- 1095 は entry CTA で構造異なるため別ハンドラのまま据置
- backup: `functions.php.bak_day10_20260520_221713`
- HTTP 検証: 4記事すべてで該当 cfg.cta_id (`safety_anxiety_resolution__end__official_pre_use_guide` / `evergreen_sale_hub__end__official_current_sale` / `actress_curation__end__official_work_details` / `registration_benefits_guide__end__official_registration_benefits`) が出力済

### ✓ moterist.com の G-5HYV772ER9 廃止完了 (2026-05-21 04:48)
- functions.php の gtag.js script src を G-5HYV772ER9 → G-GG7JV9MJRW へ変更
- G-5HYV772ER9 の gtag config 呼び出し行を削除
- 全 5 ピラー HTTP 検証で config_5HYV=0, config_GG=1 確認済
- backup: `functions.php.bak_pre_5HYV_retire_20260521_0448xx`
- 旧プロパティ (モテリスト account / 393864941 / G-5HYV772ER9) はデータ流入停止のみ、過去データは保持。GA4 管理画面でプロパティ削除/アーカイブは任意

### ✓ Site Kit Search Console 設定の domain プロパティ化 (2026-05-20)
- `googlesitekit_search-console_settings` の propertyID を `https://vodnavi.jp/` → `sc-domain:vodnavi.jp` に変更 (WP-CLI 直接更新)
- ownerID=1 のまま据置
- backup: `~/sitekit_sc_backup_20260520_222046.json`

## fanza_cta_click 発火可能性監査 (2026-05-20 22:30)
全ピラー (1095/1106/994/954/1018) の curl レンダリングを精査した結果:
- al.dmm.co.jp anchor は **各ページ 2 本だけ** で、内訳は (a) ハンバーガーメニュー内 `.menuBtn__contentInner` の月間女優ランキング、(b) `.l-headerBottom > .infoHead` の welcome-coupon バナー — どちらも **5ページで完全に同一** (THE THOR 共通ヘッダ)
- 2 本とも `ch=toolbar&ch_id=text` で **`ch=link_tool&ch_id=link` の URL フィルタに不一致**
- さらに 2 本とも **`.content` の外**、かつ **`<li>` の外** (div ベース) のため、当方トラッカーの `closest('.content') && closest('li')` 構造条件にも不一致
- **結論: 現状の post_content / レンダリング HTML には fanza_cta_click が発火する anchor が 1 本も存在しない**。1095 の従来トラッカーも、今日設置した 994/954/1018/1106 共通トラッカーも、すべて 0 件発火状態
- 設計仕様 (`THE_THOR_SETTINGS.md` 5.x) では各記事に「ファースト/比較表下/不安解消後/記事末」の 4 配置 in-content CTA が想定されているが、実装が post_content に入っていない
- 次アクション候補:
  - (i) 各ピラー記事末に "FANZA 公式ページで利用前の案内を確認する" 等の `ch=link_tool&ch_id=link` 形リンクを `<ul><li>` で実装 (Day 8 のスケルトンを復元)
  - (ii) または、`ch` パラメータ縛りを外して toolbar 経由クリックも fanza_cta_click として集計 (cta_id を `header_menu_actress_ranking` 等に分岐)

### ✓ Phase A+B 両方適用 (2026-05-20 22:44)
**Phase A — in-content CTA を the_content filter で末尾注入** (post_content は無変更):
| post_id | text | lurl |
|---|---|---|
| 994 | FANZA公式で利用前の案内を確認する | dmm.co.jp/digital/-/guide/ |
| 954 | FANZA公式で現行セールを確認する | dmm.co.jp/digital/-/special/=/article=event/ (2026-05-20 22:50 変更: welcome-coupon → event 記事) |
| 1018 | FANZA公式で作品詳細を確認する | dmm.co.jp/digital/videoa/-/ranking/=/type=actress/ |
| 1106 | FANZA公式ページで利用前の案内を確認する | dmm.co.jp/digital/-/welcome-coupon/ |
- rendered HTML で `<section class="content">` 内 `<li>` 配置を確認、`closest('.content') && closest('li')` 条件適合
- 1095 は別ハンドラ (テキスト "FANZA公式で最新情報を確認する" 一致型) のまま運用継続。2026-05-20 23:25 に Phase A filter にも 1095 を追加し、当該テキスト + lurl=sort=date で末尾 CTA 注入したことで既存ハンドラが活性化。GA4 で `placement:'mid', cta_id:'1095_mid_official', page_type:'beginner_guide', page_role:'entry'` を受信することをクリック疑似発火で確認済

**Phase B — sitewide header CTA tracker 追加** (functions.php に新規 add_action):
- THE THOR の menuBtn ランキング (`ch=toolbar`, lurl に `type%3Dactress`) と l-headerBottom welcome-coupon バナーを補集
- cta_id: `{page_type}__sitewide_header_menu__actress_ranking` / `{page_type}__sitewide_header_banner__welcome_coupon`
- 5 ピラー全てで JS 注入確認済

**backup**: `functions.php.bak_day10_phaseAB_20260520_22xxxx`

## クロスドメイン_gl伝搬の動作確認 (2026-05-20)
- 2026-05-20 23:15 再検証: gtag.js は load 成功 (`window.google_tag_manager` populated, 12 keys)、dataLayer に config + linker 積載 OK、しかし `_ga` / `_ga_GG7JV9MJRW` cookie が **一切設定されない** → ad blocker 拡張機能が tracking cookie をブロック
- isTrusted=true な OS レベル click (computer.left_click) でも _gl decoration が走らず (client_id 不在で linker generator が起動不可)
- 設定/コードは正常。実ユーザー (拡張機能無効) では機能する想定
- 実機検証必須: シークレットウィンドウで moterist.com を開き、CTA「VODNAVI コンシェルジュへ進む」をクリック → app.vodnavi.jp の URL に `?_gl=...` が付くことを確認

## _gl 実機検証結果 (2026-05-21 04:45 JST、ユーザー incognito)
- 移動先 app.vodnavi.jp URL に `_gl=1*<chk>*_ga*<client>.<ts>*_ga_5HYV772ER9*<sess>*_ga_Y6SXENKYMT*<sess>*_ga_GG7JV9MJRW*<sess>` を確認
- **クロスドメイン _ga client_id 伝達は機能** ✓
- セッション 3 ID は **G-5HYV772ER9 廃止 (04:48) の 3 分前** のテストだったため当時のデュアルタギング HTML から発火
- `_ga_5HYV772ER9` と `_ga_Y6SXENKYMT` のセッション値が完全一致 → G-5HYV772ER9 配下の Google タグに G-Y6SXENKYMT が destination として残置されていた可能性 (server-side fan-out)
- G-5HYV772ER9 廃止後の現状: HTML に `gtag/js?id=G-GG7JV9MJRW` 単独、fan-out 源も停止予定。要再検証 (シークレット再実施)
- G-Y6SXENKYMT 自体は GA4 ゴミ箱内 (2026-05-20 削除済) なのでデータ受信されてもレポート不可、実害なし

## GA4 Realtime End-to-End 確認 (2026-05-20 23:15)
- GA4 Realtime で fanza_cta_click イベント受信を確認 (G-GG7JV9MJRW / VODまとめ研究所 / vodnavi.jp プロパティ)
- パラメータ全 15 件 (標準 9 + カスタム 6: cta_id/link_target/page_role/page_type/placement/transport_type) 受信
- moterist.com デュアルタギング機能、Realtime「ページタイトル」一覧に moterist.com 記事が混在表示

## Site Kit search-console モジュール (2026-05-20 23:00)
- `googlesitekit_active_modules` には列挙されないが、`site-verification`/`search-console` は force-active core module 仕様
- `Modules::get_active_modules()` で active 確認済、propertyID 切替 (sc-domain:vodnavi.jp) は使用される

関連: [analytics-properties-3sites.md](./analytics-properties-3sites.md)
