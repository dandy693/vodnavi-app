# 登録済みサイトの実態把握【Phase 1・コンテンツ側=完了 / 数値側(GSC・GA4・ahrefs)=未着手】

- 実施: 2026-07-31 00:23:59〜00:27:06 JST(PowerShell実測)
- 実施範囲: **読み取り専用・遷移/取得のみ**。設定変更・投稿・削除=ゼロ。**クリックによるCTA遷移=なし**(リンクはHTMLからの抽出のみ)
- 取得手段: 対象4URLはCSO明示提供。**URL推測なし**(sitemap/robots.txtは各サイトのrobots.txt記載またはサイト標準パスの取得であり、可視リンク由来またはrobots.txt明記のもの)
- classifier遮断=**発生なし**・迂回手段(プロキシ/ドメイン読み替え/URL難読化/ヘッダ偽装)=**不使用**
- 認証情報・Cookie値の記録=なし。素材(画像・動画)のDL=なし
- **手段の注記**: 本フェーズはHTTP取得(curl)で実施。Chrome連携は前タスクまでで到達性を確認済みだが、**HTMLソース内のaf_id・canonical・robotsメタの網羅抽出**が目的のため、レンダリング後DOMではなく配信ソースを直接取得した(取得値はすべて配信実体)

---

## A. コンテンツ側の実態把握(4サイト)

### 1. af_id の実装状況【最優先】

| サイト | 検出された af_id(件数) | 期待値 | 一致 |
|---|---|---|---|
| `https://www.vodnavi.jp/` | **検出なし(0件)** | 003 | af_idリンク自体が不在(=期待値との不一致ではなく未設置) |
| `https://moterist.com/` | **moterist-001(2件)** | 001 | **一致** |
| `https://www.motelab.xyz/` | **検出なし(0件)** | 005 | af_idリンク自体が不在(未設置) |
| `https://app.vodnavi.jp/`(ベースライン) | **moterist-004(20件)** / **moterist-990(40件)** | 004 | 004=一致。**990が併存** |

- **004の混入=検出なし**(vodnavi.jp / moterist.com / motelab.xyz のいずれにも004は存在しない)
- **app.vodnavi.jp の990の出現文脈(原文抜粋)**: `...al.dmm.co.jp/?lurl=https%3A%2F%2Fvideo.dmm.co.jp%2Fav%2Fcontent%2F%3Fid%3Dsavr01132&af_id=moterist-990&ch=api...` ——**`ch=api` パラメータ付き**でJSONデータ(`"imageURL"`等を含む構造)の中に出現
- **app.vodnavi.jp の004の出現文脈(原文抜粋)**: `...searchstr%3D...&af_id=moterist-004&ch=link_tool&ch_id=link" target...` ——**`ch=link_tool`** で `href` 属性内に出現
- **JSON-LD内のaf_id=検出なし**(`"@type"`構造内にaf_idを含む箇所は0件)
- 取得元: 各サイトのトップページHTML(上記4URL・00:24〜00:25 JST取得)

### 2. 広告表記の有無

| サイト | 表記 | 文言(原文) | 設置位置 |
|---|---|---|---|
| `www.vodnavi.jp` | **あり** | 「当サイトは、アフィリエイト広告（FANZA 等）を含みます。広告収入はサービスの品質向上に充当されます。」 | `<section>`内の `text-brand-text-secondary` クラス要素(トップページ本文中)。同一文言がNext.jsのフライトデータ内にも出現 |
| `moterist.com` | **あり** | 「本記事にはアフィリエイトリンクが含まれます（#PR）。 各サービスの最新の料金・配信状況は公式サイトでご確認く…」(以降は取得範囲外) | 記事本文冒頭付近。トップページHTML内に「#PR」が3件・「アフィリエイト」が6件出現 |
| `www.motelab.xyz` | **表記なし** | ——(「アフィリエイト」「広告」「PR」「プロモーション」いずれも検出0件) | —— |
| `app.vodnavi.jp`(ベースライン) | **あり** | 「本サイトはアフィリエイト広告（PR）を含みます」 | `<header class="sticky top-0 ...">` の直前=**ヘッダ上部の固定表示帯**(`text-xs ... text-muted-foreground`) |

### 3. サイトのテーマ・主題(title/description の原文転記)

| サイト | title | description(冒頭) |
|---|---|---|
| `www.vodnavi.jp` | 「VODNAVI — 次世代映像検索 AI コンシェルジュ」 | 「AI による映像解析と、人間の専門家による厳格な査読体制で運営される、次世代の VOD コンシェルジュ・サービス。VODNAVI 公式ブランドサイト。」 |
| `moterist.com` | 「紳士・淑女のための、夜の書斎。FANZA を中心とした成人向け VOD の世界を、知性と没入感で再編する案内所。今夜の孤独に寄り添う、洗練された一本へ最短ルートで導きます。│モテリスト」 | (meta description=**取得不可**・当該タグ未検出) |
| `www.motelab.xyz` | 「motelab 〜ふたりの愛の実験室〜」 | 「ふたりの関係を、やさしく見つめなおすための小さな実験室。ミユと一緒に、愛と向き合う研究ノート。」 |
| `app.vodnavi.jp` | 「VODNAVI — 今夜の極上に、最短ルートで」 | 「FANZA から厳選した最新作・話題作を、価格・レビュー・新着ですぐ見つけられる VOD ナビゲーション。スマホ最適化、ワンタップで視聴開始。」 |

### 4. 公開ページ数(sitemap基準)

| サイト | sitemap | URL数 | 内訳・備考 |
|---|---|---|---|
| `www.vodnavi.jp` | `/sitemap.xml`(robots.txtに明記) | **11 URL** | トップ+`/compare`+記事8本(`biblia-erotica-foundation`/`biblia-literature-eroticism`/`cinematic-chiaroscuro`/`philosophy-of-cinema`/`solitude-catharsis`/`storytelling-structure`/`u-next-second-free-trial`/`vod-selection-guide`)+`/wordpress-sango-review` |
| `moterist.com` | `/wp-sitemap.xml`(robots.txtに明記・sitemapindex形式) | **投稿52 URL**+固定ページ(件数=**取得不可**・index内の子sitemapは posts-post-1 / posts-page-1 / taxonomies-category-1 / taxonomies-post_tag-1 の4本) | 投稿URL例: `/arina-arata/`・`/kokoro-utano/`・`/minami-aizawa/`・`/saika-kawakita/`・`/yua-mikami/` ほか |
| `www.motelab.xyz` | `/sitemap.xml` | **80 URL** | `/about/`・`/posts/`・`/posts/couples/`・`/posts/selfcare/`・`/comparisons/`・`/info/`・`/privacy/`・`/contact/`・`/apps/concierge/` ほか |
| `app.vodnavi.jp` | `/sitemap.xml`+`/sitemap-archive.xml` | **3,045**+**1,702**(既報・2026-07-30時点) | —— |

### 5. 最終更新日(sitemapのlastmod=可視の範囲)

| サイト | lastmod範囲 |
|---|---|
| `www.vodnavi.jp` | トップ=**2026-07-03T20:20:27.375Z**(他URLの範囲は未集計) |
| `moterist.com` | **2023-09-29T05:35:20+09:00 〜 2026-06-01T12:58:47+09:00**(投稿sitemap) |
| `www.motelab.xyz` | **2025-06-14T00:00:00.000Z 〜 2026-07-29T00:00:00.000Z** |
| `app.vodnavi.jp` | (既報・ビルド時生成) |

### 6. 収益導線の有無(HTMLからの抽出のみ・**クリックなし**)

| サイト | 外部遷移先ドメイン(件数) |
|---|---|
| `www.vodnavi.jp` | `app.vodnavi.jp`(3)/`www.vodnavi.jp`(1)/`www.googletagmanager.com`(1)。**DMM系ドメインへの直接リンク=検出なし** |
| `moterist.com` | `moterist.com`(107)/`fonts.googleapis.com`(3)/**`al.dmm.co.jp`(2)**/`app.vodnavi.jp`(1)/`affiliate.dmm.com`(1) |
| `www.motelab.xyz` | `www.googletagmanager.com`(2)/`www.motelab.xyz`(1)。**外部収益導線=検出なし** |
| `app.vodnavi.jp` | (既報: al.dmm.co.jp 経由の004/990) |

### 7. vodnavi.jp と app.vodnavi.jp の関係

- **相互リンク**: `www.vodnavi.jp` → `app.vodnavi.jp` の**片方向のみ検出**。実体は `href="https://app.vodnavi.jp/concierge?source=brand"`(1種)。**逆方向(app → vodnavi.jp)=検出なし(0件)**
- **`/articles/` への導線**: `www.vodnavi.jp` のトップページHTML内に `/articles/` を含むリンク・文字列=**検出なし(0件)**
- **内容重複**: 両者のsitemap URLに**同一パスの重複=なし**(vodnavi.jp=ブランド/記事8本+compare / app=works・articles・actresses・genres中心)。※本フェーズはトップページとsitemapのURL集合の比較であり、**本文レベルの類似度は未検証=取得不可**

### 8. ホスト正規化の実態(リダイレクト実測・00:23 JST)

| 入力URL | 最終URL | HTTP | リダイレクト回数 |
|---|---|---|---|
| `https://vodnavi.jp/` | **`https://www.vodnavi.jp/`** | 200 | **1** |
| `https://www.vodnavi.jp/` | 同左 | 200 | 0 |
| `https://motelab.xyz/` | **`https://www.motelab.xyz/`** | 200 | **1** |
| `https://www.motelab.xyz/` | 同左 | 200 | 0 |
| `https://moterist.com/` | 同左 | 200 | 0 |
| `https://app.vodnavi.jp/` | 同左 | 200 | 0 |

- **canonical**: `www.vodnavi.jp`=`https://www.vodnavi.jp`(末尾スラッシュなし)/`www.motelab.xyz`=`https://www.motelab.xyz/`/`app.vodnavi.jp`=`https://app.vodnavi.jp`/**`moterist.com`=canonicalタグ検出なし=取得不可**
- **meta robots**: `app.vodnavi.jp`=`index, follow`。**他3サイトはmeta robots検出なし**(=noindex指定は検出されなかった)
- **robots.txt(原文抜粋)**:
  - `www.vodnavi.jp`: `User-Agent: *` / `Allow: /` / `Disallow: /api/` / `Disallow: /_next/` / **`Host: https://www.vodnavi.jp`** / `Sitemap: https://www.vodnavi.jp/sitemap.xml`
  - `moterist.com`: `User-agent: *` / `Disallow: /wp-admin/` / `Allow: /wp-admin/admin-ajax.php` / `Sitemap: https://moterist.com/wp-sitemap.xml`
  - `www.motelab.xyz`: `User-Agent: *` / `Allow: /` / `Allow: /api/og` / `Disallow: /wp-admin/` / `Disallow: /wp-includes/` / `Disallow: /api/` / `Disallow: /apps/match/room/`
  - `app.vodnavi.jp`: `User-Agent: *` / `Allow: /` / `Disallow: /api/` / `Disallow: /_next/` / `User-Agent: GPTBot` / `Allow: /` / `Disallow: /api/`
- **DMM登録URLとの差異(事実の記録のみ・可否の判断はしない)**: 台帳上のDMM登録は `vodnavi.jp` / `motelab.xyz`(wwwなし)。**実配信はいずれも www 付きへ301系リダイレクト**され、canonicalも www 付きを指す

---

## B. 数値側(GSC / GA4 / ahrefs)= **未着手**

本フェーズはコンテンツ側のみを実施。以下は**未取得**であり、推測での記入は行わない。

| # | 項目 | 状態 |
|---|---|---|
| 1 | GSC: 登録済みURL数 / 未登録数 / 直近28日の表示回数・クリック数(4サイト) | **未着手** |
| 2 | GSC: 最終更新日(app.vodnavi.jp=7/24停止中・他も同様か) | **未着手** |
| 3 | GA4: 直近28日セッション数 / プロパティ構成(**003が同一ストリームか別かの明記**を含む) | **未着手** |
| 4 | ahrefs: DR / 参照ドメイン数 / 被リンク総数(**vodnavi.jp と app.vodnavi.jp を別々に**) | **未着手** |
| 5 | japanero.jp からの被リンクの向き先ホスト | **未着手** |
| 6 | 公開ページ数 | **A-4で取得済**(sitemap基準) |

> 本ファイルは事実の転記のみ。提案・設計・記事案・評価は記載していない(指示準拠)。

---

## C. スポットチェック: レンダリング後DOMでのaf_id実装【2026-07-31 00:30〜00:47:34 JST・Chrome連携】

- 手段: **Chrome連携(レンダリング後DOM)**。読み取り専用・遷移のみ・**クリックによるCTA遷移なし**。classifier遮断=発生なし・迂回なし
- 計測方法: `document.querySelectorAll('a')` の **href属性内**のaf_idを実数カウント(=人間がクリックし得る導線)+DOM全体/script内の出現数を併記。※URL文字列そのものの返却は1回ブロックされたため、**カウントのみを返す方式**に切り替えて取得

| ページ | a[href]にaf_id | うち004 | うち**990** | DOM全体004 | DOM全体990 |
|---|---|---|---|---|---|
| `/works/videoa/vrkm01890` | 17 | **17** | **0** | 34 | **0** |
| `/works/videoa/vrkm01873` | 17 | **17** | **0** | 34 | **0** |
| `/articles/fanza-tv-free-trial` | 2 | **2** | **0** | 4 | **0** |
| `/articles/fanza-kaiyaku` | 2 | **2** | **0** | 4 | **0** |
| **`/`(トップ)** | **40** | 20 | **20** | 20 | 68(うちscript内48) |

### 判定(事実のみ)
- **works詳細2ページ・articles記事2ページ=期待値どおり**。href内は**004のみ**で、**990はDOM全体でも0件**。004以外のaf_id(001/003/005/006等)も0件
- **トップページ(`/`)のみ、a要素のhref属性内に af_id=moterist-990 が20件存在**。同ページのhref内004は20件で、**両者が併存**。script内にも990が48件(`ch=api` を含む文脈)
- **クライアントサイド注入の有無**: works/articlesではcurl取得HTMLとレンダリング後DOMの間に**990の差分なし(いずれも0)**。トップページはcurl時点のHTMLにも990が40件存在しており、**レンダリングによって新たに990が注入された事実は確認されていない**(DOM上の内訳がhref20+script48に分解されただけ)
- **curl結果との差分**: 前フェーズのcurl計測は「HTML内の文字列出現数」(トップ=990×40・004×20)で、href内かscript内かを区別していなかった。本チェックにより**トップのhref内990=20件**と分解できた。works/articlesはcurl未計測だったため差分比較の対象外

### PR表記(同時確認)
- `/articles/fanza-tv-free-trial`・`/articles/fanza-kaiyaku` の両ページで、本文テキストに「アフィリエイト広告（PR）を含みます」を**検出(true)**

---

## D. 未着手項目(本フェーズでは未取得・推測での記入なし)

| # | 項目 | 状態 |
|---|---|---|
| 2-1 | GSC: 登録済/未登録URL数・28日表示回数/クリック数(4サイト) | **未着手** |
| 2-2 | GSC: 最終更新日(app=7/24停止中・他も同様か) | **未着手** |
| 2-3 | GA4: 28日セッション数・プロパティ構成(**003が同一ストリームか別か**) | **未着手** |
| 2-4 | ahrefs: DR/参照ドメイン数/被リンク総数(**vodnavi.jp と app.vodnavi.jp を別々に**) | **未着手** |
| 2-5 | **japanero.jp 被リンクの向き先ホスト** | **未着手** |
| 3 | **Make.com シナリオ5615632 が生成する投稿URLの af_id(006以外の混入有無)** | **未着手**(前回指示の追加分・引き続き未報告) |

> 本追記は事実の転記のみ。提案・設計・記事案・評価は記載していない(指示準拠)。
