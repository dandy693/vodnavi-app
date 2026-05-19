# CURRENT AUDIT REPORT — 3 ドメイン統合監査

- 生成日時: 2026-05-20 (W21 — サタデー・レビュー初回 3 日前)
- 監査対象: `moterist.com` / `vodnavi.jp` / `app.vodnavi.jp`
- 監査範囲: GA4 / GTM 計装、サイトマップ、robots/meta、リダイレクト、ソース可視 SEO 要素
- 取得方法: 公開 HTML / sitemap / robots を curl 取得 → grep 解析 + Next.js リポジトリ静的解析
- **本レポートは read-only 監査。本番への変更は一切行っていない。**

---

## 1. エグゼクティブサマリ

| 観点 | 状態 | 重大度 |
|---|---|---|
| 3 ドメイン HTTP 応答 | 全件 200 OK | ✅ |
| GA4 単一プロパティ共有 | **断片化**（3 ドメインで 3 種類の異なる計測 ID） | 🟠 高 |
| クロスドメイン Linker | moterist/app は整合、**vodnavi.jp が片方向のみ** | 🟠 高 |
| サイトマップ存在 | 3/3 配置済 | ✅ |
| `vodnavi.jp` sitemap 鮮度 | 全 URL の lastmod が 2025-05〜2025-06（≈11ヶ月停滞） | 🟠 中 |
| robots.txt 健全性 | 3/3 標準 + `/api`,`/_next` の明示 Disallow | ✅ |
| canonical タグ | moterist.com **欠落**、他 2 ドメインは設定済 | 🟠 中 |
| moterist.com `<meta description>` | ブランド世界観（高級・知性）と乖離した低俗表現 | 🔴 重大 |
| moterist.com の HTTP→HTTPS リダイレクト | **301 リダイレクトなし**（HEAD で 200 OK 直接応答） | 🟠 中 |
| app.vodnavi.jp `<Script afterInteractive>` 初期化 | SSR HTML に inline init なし、preload のみ。クライアントハイドレーション後発火想定 | ⚠ 要検証 |
| Ahrefs / GA4 / SC 管理画面 | curl では到達不可（OAuth 認証必須） | ⚠ 別途 |

---

## 2. GA4 / GTM 計装監査

### 2.1 各ドメインの実装実態

| ドメイン | 計測 ID | プロパティ種別 | linker 設定 | install 方式 |
|---|---|---|---|---|
| `moterist.com` | **G-5HYV772ER9** | GA4 measurement | `domains: ['app.vodnavi.jp', 'vodnavi.jp']`, `accept_incoming: true` | THE THOR + WordPress functions.php に inline gtag |
| `vodnavi.jp` | **GT-PZQ74Z7D** | Google Tag Gateway（Site Kit プラグイン） | `domains: ['vodnavi.jp']`（**自身のみ**） | Site Kit が自動挿入 + `_googlesitekit.gtagEvent` ラッパ |
| `app.vodnavi.jp` | **G-GG7JV9MJRW** | GA4 measurement（Next.js） | `domains: ['moterist.com', 'vodnavi.jp', 'app.vodnavi.jp']`, `accept_incoming: true` | `app-concierge/src/components/google-analytics.tsx`（NODE_ENV=production gate あり） |

### 2.2 矛盾: 「1 ストリーム共有プロパティ G-GG7JV9MJRW」想定との乖離

仮説では 3 ドメインすべてが `G-GG7JV9MJRW` に集約されることになっていたが、実態は **3 ドメインが互いに独立したプロパティへ送信中**。データは以下のように分散している:

```
[moterist.com]  ──→ G-5HYV772ER9
[vodnavi.jp]    ──→ GT-PZQ74Z7D (Site Kit Tag Gateway)
[app.vodnavi.jp]──→ G-GG7JV9MJRW
```

GA4 管理コンソール側で「Destination」設定により `G-5HYV772ER9 → G-GG7JV9MJRW` のミラーが組まれている前提があれば、moterist データは G-GG7JV9MJRW にも届く（前セッションの commit `ee710f9` の主旨）。しかし `vodnavi.jp` の `GT-PZQ74Z7D` 経路は Destination で連結されているか curl 観測では判定不能。

**🟠 推奨**: GA4 admin にログインし、`GT-PZQ74Z7D` の Destination 設定を確認、未設定なら G-GG7JV9MJRW への送信を有効化。

### 2.3 Linker 設定の片方向リスク

`vodnavi.jp` の linker が **自ドメインのみ**なのは Site Kit デフォルト挙動。`vodnavi.jp → app.vodnavi.jp` への遷移時に `_gl=` クッキー連結パラメータが付与されず、同一ユーザーが別セッション扱いになる。

```javascript
// vodnavi.jp 現状（不足）
gtag("set","linker",{"domains":["vodnavi.jp"]});

// 期待値
gtag("set","linker",{"domains":["vodnavi.jp", "moterist.com", "app.vodnavi.jp"], "accept_incoming": true});
```

### 2.4 `app.vodnavi.jp` の Script 発火タイミング

`app-concierge/src/components/google-analytics.tsx` は `<Script strategy="afterInteractive">` で gtag.js をロード + inline `gtag('config', ...)` を実行。SSR HTML には preload リンクのみ出力されており、curl では実発火を確認できない。**Chrome DevTools / GA4 Realtime / `window.dataLayer` ダンプによる別途検証が必要**。

---

## 3. Search Console / インデックス健全性監査

### 3.1 sitemap.xml

| ドメイン | sitemap 生成器 | 子サイトマップ数 | 総 URL 想定 | lastmod 鮮度 |
|---|---|---|---|---|
| moterist.com | WordPress core (`wp-sitemap.xml`) | 5（posts, page, category, tag, users） | — | 動的（投稿更新時） |
| vodnavi.jp | Google Sitemap Generator v4.1.23 | 3（misc, post, page） | post sitemap で 8+ URL 観測 | **2025-05-18 ～ 2025-06-05 で停滞**（generated-on は 2026-05-19 19:18） |
| app.vodnavi.jp | Next.js auto-generated | 1（フラット） | **197 URLs** | 全 URL が 2026-05-19T19:16:44Z |

### 3.2 vodnavi.jp の lastmod 停滞は深刻

`/post-sitemap.xml` の全エントリが `2025-05-18T13:35` ～ `2025-06-05T14:12` の範囲で **約 11 ヶ月停滞**。Google にとっては「コンテンツが古く再クロール優先度が低い」シグナル。`vodnavi.jp` の旧コンテンツが新ブランド戦略（『ビブリア・エロティカ』『紳士の書斎』世界観）と乖離している可能性。

### 3.3 robots.txt

| ドメイン | wp-admin Disallow | API Disallow | Sitemap 参照 | sitemap.html 残置 |
|---|---|---|---|---|
| moterist.com | ✅ | — | `https://moterist.com/wp-sitemap.xml` | なし（前回除去済） |
| vodnavi.jp | ✅ | — | `https://vodnavi.jp/sitemap.xml` | 確認できず（健全） |
| app.vodnavi.jp | — | ✅ `/api`,`/_next` | `https://app.vodnavi.jp/sitemap.xml` | — |

### 3.4 メタタグ / canonical

| ドメイン | description | canonical | og:title | robots meta |
|---|---|---|---|---|
| moterist.com | 「おすすめの可愛すぎる美顔フェラAV動画をご紹介します！」 | **欠落** 🔴 | 「モテリスト」 | デフォルト |
| vodnavi.jp | 「配信サービス徹底比較メディア」 | `https://vodnavi.jp/` | 「トップページ」🟠（generic） | デフォルト |
| app.vodnavi.jp | 「FANZA から厳選した最新作・話題作を、価格・レビュー・新着ですぐ見つけられる VOD ナビゲーション。スマホ最適化、ワンタップで視聴開始。」 | `https://app.vodnavi.jp` | 「VODNAVI — 今夜の極上に、最短ルートで」 | `index, follow` |

### 3.5 リダイレクトチェーン

| ドメイン | HTTP→HTTPS | 結論 |
|---|---|---|
| moterist.com | **HEAD `http://...` が直 200 を返す**（301 リダイレクトなし） | 🟠 SEO 上は 301 で明示推奨 |
| vodnavi.jp | 301 Moved Permanently → HTTPS | ✅ |
| app.vodnavi.jp | 308 Permanent Redirect → HTTPS | ✅ |

---

## 4. Ahrefs 外部評価監査

**curl 経路ではアクセス不能**（Ahrefs Dashboard は OAuth 認証必須、公開バックリンク API はレートリミット）。

| 項目 | 状態 |
|---|---|
| DR (Domain Rating) | ⚠ Chrome DevTools / Ahrefs Dashboard 経由で別途取得必要 |
| Referring Domains | ⚠ 同上 |
| Organic Keywords | ⚠ 同上 |
| 404 / Redirect chain | curl spot-check で `/archives/63, 52, 96` は 200 OK（vodnavi.jp） |
| Toxic backlinks / Disavow | 前セッションで `disavow.txt` 候補生成は未実行（保留中） |

**🟡 推奨**: 別ターン（Chrome 自動操縦が必要）で Ahrefs Dashboard → Site Explorer → 3 ドメイン × Backlinks, Referring Domains, Organic Keywords を抽出。

---

## 5. ユーザー動線 — 送客ファネルの観測可能傾向

`moterist.com → app.vodnavi.jp` の流入導線は以下の 3 段で構築済（前セッション逆同期で確認）:

1. **moterist.com 本文内 CTA**: 5 ピラー記事それぞれに `btn__link-primary` の concierge アンカー（`https://app.vodnavi.jp/concierge?source=moterist&intent=<beginner|premium|discount>`）×2 個 / 記事
2. **moterist.com サイドバー/フッター**: テンプレ由来の追加 CTA（live ライブで btn__link カウント=14 → 本文 2 + テンプレ 12）
3. **app.vodnavi.jp 着地後**: GoogleAnalytics + Concierge SessionInit が `ai_session_start` 発火 → §4b.4 指標の起点

### 5.1 観測可能 KPI（サタデー・レビューでの照合対象）

| KPI | 観測手段 | 現時点の curl 観測 |
|---|---|---|
| moterist 単一セッションでの concierge クリック率 | GA4 outbound link event | 未取得（Realtime / Reports 要） |
| `ai_session_start` / pageview ratio at app.vodnavi.jp | GA4 funnel | 未取得 |
| `early_cookie_burn` / `ai_session_start` 率（§4b.4 期待値 50%+） | GA4 custom event | 未取得 |
| `early_cookie_burn → ai_affiliate_click` 同一セッション率（§4b.4 期待値 30%+） | GA4 funnel | 未取得 |
| `ai_affiliate_click` 全体同一セッション完結率（§4b.4 期待値 70%+） | GA4 funnel | 未取得 |

### 5.2 推察される現状リスク

- **moterist.com の `<meta description>`** がブランド世界観と完全乖離。Google 検索結果のスニペットでクリック率が劣化している可能性が極めて高い（"美顔フェラ" は高単価インテントから乖離）
- **vodnavi.jp の lastmod 停滞**: 旧ブランド時代のコンテンツのまま放置。Search Console 上で「Discovered - currently not indexed」状態の URL が増えているリスク
- **vodnavi.jp linker の片方向設定**により、`vodnavi.jp ↔ app.vodnavi.jp` の同一ユーザー判定が壊れている可能性

---

## 6. 技術的修正提案（自動適用せず — レビュー後ご指示ください）

### 6.1 [優先度: 🔴 重大] moterist.com `<meta description>` 改修

THE THOR テーマの WordPress 設定で「ホーム」description を Biblia Erotica 世界観に整える。WP-CLI / 管理画面側操作。

```bash
# WP-CLI ベースの提案（実行前要承認）
ssh -i /tmp/mixhost_key rvpuxcjb@133.125.148.25 \
  "cd public_html/moterist.com && wp option update blogdescription \
   '紳士・淑女のための、夜の書斎。FANZA を中心とした成人向けVODを、知性と没入感で再編する案内所。'"
```

ただし、現在の description はおそらく [SEO プラグイン or テーマカスタマイザー] からの出力。`wp option get blogdescription` で出処を確認した上で対象 option を更新。

### 6.2 [優先度: 🔴 重大] moterist.com `<link rel="canonical">` 追加

```php
// site-moterist/07_wp/wp-content/themes/the-thor-child/functions.php
// (既存の wp_head フック群と同レベルに追加)

if ( ! function_exists( 'vodnavi_emit_canonical_home' ) ) {
    function vodnavi_emit_canonical_home() {
        if ( is_front_page() || is_home() ) {
            echo "\n" . '<link rel="canonical" href="' . esc_url( home_url( '/' ) ) . '">' . "\n";
        }
    }
}
add_action( 'wp_head', 'vodnavi_emit_canonical_home', 1 );
```

> 注: 個別記事ページの canonical は THE THOR 親テーマが既に出力している可能性あり。`curl -s https://moterist.com/fanza20250329/ | grep canonical` で確認後決定。

### 6.3 [優先度: 🟠 高] vodnavi.jp linker のクロスドメイン拡張

WordPress 側 Site Kit プラグインの設定では 1 ドメインしか書けない場合があるため、`functions.php` で gtag を上書きする方式が確実:

```php
if ( ! function_exists( 'vodnavi_extend_linker' ) ) {
    function vodnavi_extend_linker() { ?>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('set', 'linker', {
    'domains': ['vodnavi.jp', 'moterist.com', 'app.vodnavi.jp'],
    'accept_incoming': true
  });
</script>
    <?php }
}
add_action( 'wp_head', 'vodnavi_extend_linker', 99 );  // Site Kit 出力の後に上書き
```

### 6.4 [優先度: 🟠 高] vodnavi.jp sitemap lastmod 停滞の解消

WordPress 管理画面で旧コンテンツを `Quick Edit` し「更新ボタン押下のみ」で lastmod を更新する（編集画面は使わない=本文を弄らない）。または:

```bash
# 全 post の post_modified を一括 touch（要承認、HUMAN 立会推奨）
ssh -i /tmp/mixhost_key rvpuxcjb@133.125.148.25 \
  "cd public_html/vodnavi.jp && wp post list --post_type=post --field=ID | \
   xargs -I{} wp post update {} --post_modified=now --post_modified_gmt=now"
```

> ⚠ 但し: lastmod だけ更新してコンテンツが変わっていない場合、Google が「無意味な更新」として将来的に評価を下げる可能性あり。**根本解決はコンテンツ刷新**。

### 6.5 [優先度: 🟠 中] moterist.com `http://` → `https://` 301 強制

mixhost コントロールパネル or `.htaccess` で:

```apache
# /home/rvpuxcjb/public_html/moterist.com/.htaccess
# (既存 mod_rewrite ブロックの先頭に追加)

RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
```

### 6.6 [優先度: 🟡 低] vodnavi.jp `og:title` の改善

「トップページ」→ ブランドコピーへ。Site Kit 経由ではなく WordPress 設定で。

---

## 7. 監査の限界 & 次フェーズへの推奨

### 7.1 curl ベース監査の限界

| 検証できなかった項目 | 必要ツール |
|---|---|
| GA4 Realtime での実イベント発火確認 | Chrome 自動操縦 → analytics.google.com |
| Search Console の「インデックス カバレッジ」レポート | Chrome 自動操縦 → search.google.com/search-console |
| Search Console の「Performance > Queries」上位語の取得 | 同上 |
| Ahrefs DR / Referring Domains / Organic Keywords | Chrome 自動操縦 → app.ahrefs.com |
| `app.vodnavi.jp` のクライアント側 gtag 実発火 | Chrome DevTools / `window.dataLayer` ダンプ |

### 7.2 サタデー・レビュー（2026-05-23 10:00 JST）への接続

本日配置済の `management/scripts/saturday-audit.sh` が `management/_metrics/2026-w21/saturday-raw-data.json` の雛形（`indicators` 3 種 null）を生成済み。土曜当日は以下の手順で実値を投入する想定:

1. Chrome で GA4 (G-GG7JV9MJRW) → Realtime / Reports から §4b.4 指標を抽出
2. JSON の `observed` / `samples` フィールドを埋める
3. 異常閾値（30% 未満）に到達した指標があれば CSO 自動診断ループへ

### 7.3 即時アクションの提示

下記の優先順で対応推奨:

1. **🔴 重大**: moterist.com `<meta description>` 改修（CTR ロスの最大要因）
2. **🔴 重大**: moterist.com canonical 追加
3. **🟠 高**: vodnavi.jp linker 拡張（クロスドメイン計測の精度確保）
4. **🟠 高**: vodnavi.jp lastmod 停滞の原因調査（コンテンツ刷新 or 棚卸し）
5. **🟠 中**: moterist.com http→https 301
6. **🟡 低**: vodnavi.jp og:title 改善

---

## 8. 監査メタデータ

- 取得時刻: 2026-05-20 (Asia/Tokyo)
- 取得方法: `curl -fsSL` + grep / Next.js リポジトリ静的解析
- 生成スクリプト: 本レポートは Claude Opus 4.7 (1M context) による手動生成
- 本番への副作用: **なし**（read-only 監査）
