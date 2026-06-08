3サイトのアクセス解析資産のログイン先と識別子。2026-05-20 修正後の状態。

## ログインアカウント
- 解析系すべて: `moterist.com@gmail.com`(authuser=2)
- 同ブラウザに併存: hdktchkw33@gmail.com(authuser=0, 株式会社SAFARI関係)、teraclay.resonance@gmail.com 他
- 切替ミスがあると「光糸リフト・ItoLift・LED-RoseLight」等が表示される。URL に authuser=2 付与で確実

## ホスティング
- moterist.com / vodnavi.jp とも mixhost (ik10014.mixhost.jp, ユーザー rvpuxcjb)
- SSH: `~/.ssh/config` の `mix-wp` エイリアス (IdentityFile: ~/.ssh/mixhost_codex) で接続可
  - 注意: 過去に `.ssh/config` 先頭に BOM が混入して接続失敗した実績あり。修復済 (2026-05-20)
- WP-CLI 2.12.0 利用可
- DNS/cPanel は CageFS で SSH 経由 uapi 操作不可。ブラウザでの cPanel ログインが必要

## GA4 プロパティ (moterist.com@gmail.com 配下, 修正後)

| アカウント | プロパティ | プロパティID | 測定ID | 用途 | 状態 |
|---|---|---|---|---|---|
| モテリスト (275986901) | moterist.com | 393864941 | ~~G-5HYV772ER9~~ | moterist.com 旧 | 2026-05-21 廃止、データ流入停止 |
| VODまとめ研究所 (355462253) | vodnavi.jp | 489519780 | **G-GG7JV9MJRW** | 3サイト統合 | 受信中(全3サイト) |
| ~~VODまとめ研究所~~ | ~~moterist.com~~ | ~~538218455~~ | ~~G-Y6SXENKYMT~~ | (削除済 2026-05-20) | ゴミ箱 |

## 各サイト計測タグ実装

| サイト | プラットフォーム | タグ実装 | 送信先 |
|---|---|---|---|
| moterist.com | WordPress (THE THOR + the-thor-child, mixhost) | `wp-content/themes/the-thor-child/functions.php` に直接 gtag.js 注入 | **G-GG7JV9MJRW 単独** (2026-05-21 デュアル廃止) |
| vodnavi.jp | WordPress (Site Kit 1.179.0, mixhost) | Site Kit が GT-PZQ74Z7D 経由で gtag.js を注入 + `vodnavi-cross-domain-linker.php` MU-plugin で linker 拡張 | GT-PZQ74Z7D → G-GG7JV9MJRW |
| app.vodnavi.jp | Next.js (Vercel, app-concierge) | `src/components/google-analytics.tsx` で `<Script>` 注入 | G-GG7JV9MJRW (env NEXT_PUBLIC_GA_MEASUREMENT_ID) |

## Cross-Domain Linker 状態

| 起点 | linker.domains | accept_incoming | 備考 |
|---|---|---|---|
| moterist.com (G-GG7JV9MJRW) | app.vodnavi.jp, vodnavi.jp | true | the-thor-child/functions.php (2026-05-21 デュアル廃止後の単独構成) |
| vodnavi.jp (G-GG7JV9MJRW) | vodnavi.jp, app.vodnavi.jp, moterist.com | true | mu-plugins/vodnavi-cross-domain-linker.php |
| app.vodnavi.jp (G-GG7JV9MJRW) | moterist.com, vodnavi.jp, app.vodnavi.jp | true | app-concierge/src/components/google-analytics.tsx |

## サーチコンソール プロパティ

| サイト | 種別 | プロパティID | 所有権 | サイトマップ |
|---|---|---|---|---|
| moterist.com | URL-prefix | `https://moterist.com/` | moterist.com@gmail.com | wp-sitemap.xml (88p) |
| moterist.com | ドメイン | `sc-domain:moterist.com` | **他アカウント所有** | (アクセス不可) |
| vodnavi.jp | ドメイン | `sc-domain:vodnavi.jp` | moterist.com@gmail.com | vodnavi.jp/sitemap.xml (19p)。app.vodnavi.jp/sitemap.xml は重複削除済 (2026-05-20) |
| app.vodnavi.jp | ドメイン | `sc-domain:app.vodnavi.jp` | moterist.com@gmail.com | app.vodnavi.jp/sitemap.xml (197p) |

## GTM コンテナ

| アカウント | コンテナ | ID | 用途 |
|---|---|---|---|
| kit-planning.net | kit-planning.net | GTM-NXW8R6GS | 別案件 |

3サイトとも専用 GTM コンテナは未設置。vodnavi.jp は Site Kit の Google Tag GT-PZQ74Z7D を使用 (GTM とは別物)。**Google Tag GT-PZQ74Z7D の GTM側 account/container は Site Kit が自動管理**:
- googleTagAccountID: 6295365899
- googleTagContainerID: 220178331
- googleTagContainerDestinationIDs: [G-GG7JV9MJRW]

## Ahrefs プロジェクト (Motelab's workspace, ベーシックプラン)

| プロジェクト名 | ターゲット pattern | 備考 |
|---|---|---|
| Vodnavi | `*.vodnavi.jp/*` | wildcard で vodnavi.jp と app.vodnavi.jp を同時計測 |
| Moterist | `*.moterist.com/*` | wildcard |
| Motelab | `*.motelab.xyz/*` | 別件 |
| Kit-planning | `*.kit-planning.net/*` | 別件 |

関連: [analytics-issues-3sites.md](./analytics-issues-3sites.md)
