# 自クリック照合(再) / ahrefs リンク元の質的内訳 / 内部リンク実態 / 繰越【CSO指示「8/2実施分」への対応】

- 取得実施: **2026-08-01 21:52:56 〜 22:22:11 JST**(PowerShell 実測)
- **前提のずれ(再掲・重要)**: 指示は「8/2実施分」だが、実行時点の**システム時刻は 2026-08-01 21:52 JST**。**日付が変わっていないため §1 の「2026-08-01 確定値」は原理的に取得不能**。本記録では 17:53 取得との差分検証として再取得した値(暫定)を残す
- 取得元: DMM=`affiliate.dmm.com/report/top/`(可視ナビ経由・「現在の設定」で期間/ID適用を毎回確認) / GA4=`analytics.google.com` authuser=1(=moterist.com@gmail.com、8/1にアカウントパネルで目視確認済) / ahrefs=`app.ahrefs.com`(Motelab's workspace・ベーシック=AWT Free) / 内部リンク=PowerShell `Invoke-WebRequest`(本番HTML実測) / GSC ステータス=**CSO明示提供URL**
- 判断・評価・提案は書かない(事実の転記のみ)。Phase 1 で停止

---

## 1. 自クリック照合【最優先】

### (a) DMM af_id 990 — 再取得(21:56 JST)

| 対象 | 期間 | 結果 |
|---|---|---|
| moterist-990 | **2026/07/25 - 2026/08/01(8日間)** | **データがありません(=全日0クリック・成果0)** |
| すべて(全16ID) | 2026/08/01 - 2026/08/01 | **データがありません(=0)** |

- 17:53 取得時と**同一**(4時間経過しても 8/1 は全ID 0 のまま)
- 前回記録の観測(DMM 当日レポート未反映の可能性)は**否定も肯定もされていない**。確定は日付が変わってからの再取得が必要

### (b) GA4 `list_top_card_cta` — 2026-08-01(21:58 JST 取得・hostname 完全一致 `app.vodnavi.jp`)

| # | イベント名 | placement | イベント数 | 総ユーザー数 |
|---|---|---|---|---|
| 1 | page_view | (なし) | 192 | 71 |
| 2 | session_start | (なし) | 73 | 71 |
| 3 | first_visit | (なし) | 68 | 68 |
| 4 | scroll_custom | (なし) | 65 | 22 |
| 5 | age_gate_view | (なし) | 63 | 63 |
| 6 | age_gate_agree | (なし) | 45 | 45 |
| 7 | user_engagement | (なし) | 41 | 40 |
| 8 | click | (なし) | 10 | 7 |
| 9 | ai_affiliate_click | **detail_fv_cta** | 6 | 5 |
| 10 | product_click | **detail_fv_cta** | 6 | 5 |
| 11 | ai_affiliate_click | **detail_sample** | 4 | 2 |
| 12 | product_click | **detail_sample** | 4 | 2 |
| 13 | scroll | (なし) | 3 | 3 |
| 14 | ai_session_start | (なし) | 1 | 1 |
| — | 合計 | — | **581** | **71** |

- **`list_top_card_cta` = 0件**(全14行に不在)。`list_genres_card_cta` / `list_actresses_card_cta` / `list_card_cta` も**不在**
- 17:50 取得(合計481・58ユーザー)からイベント数は増加したが、**placement の種類は detail_fv_cta / detail_sample の2種のまま変化なし**

### (c) 4パターン判定

| DMM | GA4 | 該当 |
|---|---|---|
| **0** | **0** | **「要調査」** |

- **8/1 は当日値のため、いずれも確定値ではない**(日付が変わってからの再取得で確定)

---

## 2. ahrefs リンク元の質的内訳

取得条件: Site Explorer → 参照ドメイン、**mode=ドメイン(vodnavi.jp・サブドメインを含まない)**、DR降順、フォロー種別=すべて。総数 **394ドメイン**(ダッシュボード表記 393 との差は取得タイミング差)

### (a)(b) 参照ドメイン DR上位30件

列: DR / Dofollow参照ドメイン / Dofollowリンク先のドメイン / トラフィック / キーワード / **ターゲットへのリンク数** / **うちDofollowリンク数** / 初回確認日
※「うちDofollowリンク数 = 0」は**当該ドメインからのリンクが全て nofollow** であることを意味する
※`[SPAM]` は Ahrefs が付与する SPAM ラベル(転記のみ)

| # | ドメイン | DR | Dofollow参照ドメイン | Dofollowリンク先 | トラフィック | KW | リンク数 | Dofollow | 初回確認日 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | example3.com | 75 | 5,204 | 508 | 5 | 6 | 2 | **0** | 2023-08-06 |
| 2 | rankyour.website `[SPAM]` | 74 | 165 | 998 | 0 | 0 | 1 | **0** | 2026-05-08 |
| 3 | factmags.com `[SPAM]` | 74 | 5,194 | 41,279,165 | 0 | 0 | 1 | **0** | 2026-05-09 |
| 4 | **saruwakakun.design** | 73 | 1,529 | 83 | 194 | 38 | 1 | **1** | 2023-08-28 |
| 5 | **freelance-jp.org** | 71 | 1,644 | 3,822 | 10,783 | 564 | 1 | **1** | 2023-07-29 |
| 6 | buybacklinks.agency `[SPAM]` | 71 | 423 | 998 | 0 | 0 | 1 | **0** | 2026-05-09 |
| 7 | itxoft-affordable-seo-solutions.site `[SPAM]` | 70 | 1,153 | 0 | 0 | 0 | 1 | **0** | 2026-03-25 |
| 8 | rank-optimizer.website `[SPAM]` | 66 | 55 | 1 | 0 | 0 | 1 | **0** | 2026-04-10 |
| 9 | **videoconverterfactory.com** | 62 | 8,324 | 465 | 23,018 | 3,180 | 1 | **1** | 2023-11-02 |
| 10 | backlinker.shop `[SPAM]` | 61 | 553 | 0 | 0 | 0 | 1 | **0** | 2025-09-29 |
| 11 | rank-top.click `[SPAM]` | 60 | 145 | 998 | 0 | 0 | 1 | **0** | 2026-05-07 |
| 12 | host.io | 58 | 7,224 | 7 | 16,459 | 111 | 1 | **0** | 2026-07-18 |
| 13 | fiverr-affordable-seo-services.site `[SPAM]` | 55 | 1,158 | 0 | 0 | 0 | 1 | **0** | 2026-05-07 |
| 14 | linkrankpro.shop `[SPAM]` | 54 | 166 | 998 | 0 | 0 | 1 | **0** | 2026-05-10 |
| 15 | rankxlinks.shop `[SPAM]` | 54 | 119 | 998 | 0 | 0 | 1 | **0** | 2026-06-22 |
| 16 | ranklinkerpro.shop `[SPAM]` | 54 | 115 | 2 | 0 | 0 | 1 | **0** | 2026-06-21 |
| 17 | seorankflow.shop `[SPAM]` | 54 | 107 | 2 | 0 | 0 | 1 | **0** | 2026-06-21 |
| 18 | buyseobacklinks.shop `[SPAM]` | 54 | 104 | 998 | 0 | 0 | 1 | **0** | 2026-06-21 |
| 19 | authoritybacklinks.shop `[SPAM]` | 54 | 136 | 998 | 0 | 0 | 1 | **0** | 2026-05-11 |
| 20 | pbnseolinks.shop `[SPAM]` | 53 | 246 | 998 | 0 | 0 | 1 | **0** | 2026-05-08 |
| 21 | linkrankboost.shop `[SPAM]` | 53 | 153 | 999 | 0 | 0 | 1 | **0** | 2026-05-11 |
| 22 | linkseopro.shop `[SPAM]` | 53 | 213 | 998 | 0 | 0 | 1 | **0** | 2026-05-10 |
| 23 | ranklinkpro.shop `[SPAM]` | 53 | 143 | 998 | 0 | 0 | 1 | **0** | 2026-05-18 |
| 24 | ranklinkx.shop `[SPAM]` | 53 | 129 | 998 | 0 | 0 | 1 | **0** | 2026-05-09 |
| 25 | seolinkpro.shop `[SPAM]` | 53 | 138 | 998 | 0 | 0 | 1 | **0** | 2026-05-13 |
| 26 | premiumseolinks.shop `[SPAM]` | 53 | 137 | 998 | 0 | 0 | 1 | **0** | 2026-05-10 |
| 27 | toplinkranker.shop `[SPAM]` | 53 | 134 | 998 | 0 | 0 | 1 | **0** | 2026-05-10 |
| 28 | linkrankseo.shop `[SPAM]` | 53 | 112 | 998 | 0 | 0 | 1 | **0** | 2026-06-15 |
| 29 | bye.fyi | 49 | 871 | 18 | 33 | 3 | 1 | **0** | 2025-11-23 |
| 30 | quero.party `[SPAM]` | 49 | 478 | 18 | 0 | 0 | 1 | **0** | 2026-03-26 |

- **上位30件のうち Dofollow リンクを持つのは 3件のみ**(saruwakakun.design / freelance-jp.org / videoconverterfactory.com)。残り27件は**リンク数1〜2・すべて nofollow**
- 上位30件のうち **SPAM ラベル = 24件**
- 初回確認日: 上位30件のうち **2026年に初出 = 24件**(うち 2026-05 が 12件)

### (c) moterist.com / motelab.xyz との参照ドメイン重複

取得方法: 3サイトそれぞれの参照ドメイン全件をページ送りで取得(各100件×4ページ)し、**ドメイン名の集合演算**。取得件数は各サイトの総数と一致することを検算済み

| 集合 | 件数 |
|---|---|
| V = vodnavi.jp(mode=ドメイン) | **394** |
| M = moterist.com | **372** |
| L = motelab.xyz | **377** |
| **V ∩ M** | **318** |
| **V ∩ L** | **321** |
| **M ∩ L** | **314** |
| **V ∩ M ∩ L(3サイト共通)** | **279** |
| **V のみ(M にも L にも無い)** | **34** |

**V のみ 34件の一覧**(DR降順に近い順・取得順):

`example3.com` , `saruwakakun.design` , `freelance-jp.org` , `itxoft-affordable-seo-solutions.site` , `rank-optimizer.website` , `videoconverterfactory.com` , `backlinker.shop` , `fiverr-affordable-seo-services.site` , `espritjapon.com` , `metamagic.top` , `optimizeflow.top` , `jake.eu` , `link-baron-optimal-organic-collective.store` , `alpha-local-seo-group-rank-forge.store` , `contextual-link-baron-services.store` , `premium-contextual-link-and-guest-posting-marketplace.store` , `advanced-traffic-surge-and-keyword-rank-bureau.store` , `high-da-and-crawl-budget-strategic-exchange.store` , `proven-backlink-pro-and-outreach-pro-partners.store` , `digital-pr-and-domain-rating-premium-experts.store` , `flagship-digital-pr-and-editorial-link-central.store` , `proven-network-for-ranking-signal-and-keyword-rank.store` , `domain-rating-authority-link-and-serp-boost-services.store` , `crawl-budget-and-page-rank-expert-partners.store` , `takker04035555.com` , `newsblogsports.site` , `japansitedirectory.com` , `homefinance.co.in` , `linkloot.shop` , `seochest.shop` , `linkrank.shop` , `backlinkbuilders.shop` , `linkcollective.shop` , `rankseomasters.shop`

- **3サイトで共通のリンク元は 279ドメイン**(vodnavi.jp の参照ドメインの **70.8%**)
- vodnavi.jp 固有は 34件(**8.6%**)。うち Dofollow を持つのは saruwakakun.design / freelance-jp.org / videoconverterfactory.com / espritjapon.com / takker04035555.com / newsblogsports.site / homefinance.co.in(§2(e)の Dofollow 28件との突合による)
- ※取得中、moterist.com のページ送りで**再描画前に読み取った回で集合が 182 に縮退**する不整合が発生したため、**先頭行の変化を検知してから読む方式に切り替えて再取得**し、372件で検算一致を確認した(記録として明記)

### (d) リンク先URL（vodnavi.jp のどのページに着地しているか）

「被リンク数の多いページ」(外部被リンク・mode=サブドメイン)= **13ページ**

| # | ターゲットページ | UR | 参照ドメイン | 上位DR | ページへのリンク | Dofollow | Nofollow | 備考 |
|---|---|---|---|---|---|---|---|---|
| 1 | `vodnavi.jp/`(ルート) | 4.5 | **387** | 75 | **407** | **38** | **369** | 308 → `www.vodnavi.jp/` |
| 2 | `www.vodnavi.jp/` | 0 | 83 | 54 | 85 | 7 | 78 | タイトル「VODNAVI — 次世代映像検索 AI コンシェルジュ」 |
| 3 | `vodnavi.jp/`(http系) | 4.5 | 5 | 3.8 | 5 | 4 | 1 | 301 → `vodnavi.jp/` |
| 4 | `vodnavi.jp/u-next-second-free-trial/` | 4.5 | 1 | 62 | 1 | 1 | 0 | **404** |
| 5 | `vodnavi.jp/wordpress-sango-review/` | 0 | 1 | 73 | 1 | 1 | 0 | 307 → www |
| 6 | `app.vodnavi.jp/concierge`(source=moterist) | — | 1 | 0 | **85** | **85** | 0 | クロールされていない |
| 7 | `app.vodnavi.jp/concierge`(source=moterist&intent=beginner) | — | 1 | 0 | 2 | 2 | 0 | 同上 |
| 8 | `app.vodnavi.jp/concierge`(…&intent=actress) | — | 1 | 0 | 1 | 1 | 0 | 同上 |
| 9 | `app.vodnavi.jp/concierge`(…&intent=discount) | — | 1 | 0 | 1 | 1 | 0 | 同上 |
| 10 | `app.vodnavi.jp/concierge`(…&intent=premium) | — | 1 | 0 | 2 | 2 | 0 | 同上 |
| 11 | `app.vodnavi.jp/concierge`(その他1件) | — | 1 | 0 | 1 | 1 | 0 | 同上 |
| 12 | `app.vodnavi.jp/works/anime/stap00044` | — | 1 | 0 | 1 | 1 | 0 | クロールされていない |
| 13 | `www.vodnavi.jp/u-next-second-free-trial/` | 0 | 1 | 62 | 1 | 1 | 0 | 308 |

- **参照ドメイン 394 のうち 387(98.2%)が apex ルート `vodnavi.jp/` 1ページに集中**。そのページへのリンク 407本の内訳は **Dofollow 38 / Nofollow 369**
- **記事下層ページ(`/compare` `/biblia-*` `/philosophy-of-cinema` 等)への外部被リンクは 0件**
- `/articles/` 配下(app.vodnavi.jp)への被リンクも **0件**(13ページに不在)
- `app.vodnavi.jp/concierge` 系 6ページ(クエリ違い)は**すべて参照ドメイン1・Dofollow**(= moterist.com からの送客リンク。合計92本)

### (e) Dofollow / DR30以上での絞り込み

| 絞り込み | 件数 |
|---|---|
| **Dofollow のみ**(参照ドメイン単位) | **28**(394 中の 7.1%) |
| **Dofollow かつ DR30以上** | **4** |

Dofollow 28件(DR降順・上位):

| ドメイン | DR |
|---|---|
| saruwakakun.design | 73 |
| freelance-jp.org | 71 |
| videoconverterfactory.com | 62 |
| espritjapon.com | 43 |
| takker04035555.com | 24 |
| getwebsiteworth.com `[SPAM]` | 18 |
| websiterace.com `[SPAM]` | 10 |
| alljobs.info `[SPAM]` | 9 |
| booksreadr.org | 8 |
| newsblogsports.site `[SPAM]` | 8 |
| way2check.cv `[SPAM]` | 7 |
| allwebsitesdirectory.com `[SPAM]` | 7 |
| ycm.info `[SPAM]` | 7 |
| globalecommerce.org `[SPAM]` | 7 |
| indexaward.com `[SPAM]` | 6 |
| tunca.org `[SPAM]` | 4.3 |
| pagesearch.net `[SPAM]` | 4.1 |
| backlinkon.com `[SPAM]` | 3.8 |
| domainsc.com `[SPAM]` | 3.5 |
| bestwebstats.com `[SPAM]` | 3 |
| indians.cc `[SPAM]` | 2.2 |
| wallpapers.pro `[SPAM]` | 2.2 |
| homefinance.co.in `[SPAM]` | 2 |
| domainanalysis.org `[SPAM]` | 1.5 |
| backlinksbank.com `[SPAM]` | 1.4 |
| wonvision.com `[SPAM]` | 0.8 |
| domain.com.lc `[SPAM]` | 0.5 |
| (残り1件) | — |

- **DR30以上 かつ Dofollow = `saruwakakun.design`(73) / `freelance-jp.org`(71) / `videoconverterfactory.com`(62) / `espritjapon.com`(43) の4件**
- なお **リンク交差(Link Intersect)ツールは AWT Free では利用不可**(「価格を見る」= 有料プラン画面)。(c) はそのため参照ドメイン全件のページ送り+集合演算で算出した

---

## 3. vodnavi.jp → app.vodnavi.jp の内部リンク実態（本番HTML実測・21:53 JST）

対象: `vodnavi.jp/sitemap.xml` に収録の **11 URL 全件**(すべて `www.vodnavi.jp` 表記)。全て HTTP 200

### 順方向: vodnavi.jp → app.vodnavi.jp = **合計19本**（前回「1本のみ」は誤り）

| ページ | 本数 | href(クエリ含む) | rel | target |
|---|---|---|---|---|
| `www.vodnavi.jp/` | **3** | `app.vodnavi.jp/concierge?source=brand` ×3 | **rel属性なし** | 指定なし |
| `/compare` | 1 | `…/concierge?source=brand_compare_hub` | **rel属性なし** | 指定なし |
| `/biblia-erotica-foundation` | 2 | `…/concierge?source=brand&intent=wisdom` ×2 | **rel属性なし** | 指定なし |
| `/biblia-literature-eroticism` | 2 | `…/concierge?source=brand&intent=wisdom` ×2 | **rel属性なし** | 指定なし |
| `/cinematic-chiaroscuro` | 1 | `…/concierge?source=brand&intent=wisdom` | **rel属性なし** | 指定なし |
| `/philosophy-of-cinema` | 2 | `…/concierge?source=brand` / `…?source=brand&intent=wisdom` | **rel属性なし** | 指定なし |
| `/solitude-catharsis` | 1 | `…/concierge?source=brand&intent=wisdom` | **rel属性なし** | 指定なし |
| `/storytelling-structure` | 1 | `…/concierge?source=brand&intent=wisdom` | **rel属性なし** | 指定なし |
| `/u-next-second-free-trial` | 2 | `…/concierge?source=brand&intent=discount` / `…?source=brand&intent=wisdom` | **rel属性なし** | 指定なし |
| `/vod-selection-guide` | 2 | **`app.vodnavi.jp/lp?source=brand_pilot_001`** / `…/concierge?source=brand&intent=wisdom` | **rel属性なし** | 指定なし |
| `/wordpress-sango-review` | 2 | `…/concierge?source=brand` / `…?source=brand&intent=wisdom` | **rel属性なし** | 指定なし |
| **合計** | **19** | — | **19本すべて rel属性なし = nofollow なし(follow)** | — |

- 遷移先の内訳: **`/concierge` = 18本**、**`/lp` = 1本**(`/vod-selection-guide` のみ)
- `source` の値: `brand`(9) / `brand&intent=wisdom`(8) / `brand_compare_hub`(1) / `brand&intent=discount`(1) / `brand_pilot_001`(1)
- **`/works` `/genres` `/actresses` `/articles` へのリンクは 0本**

### 逆方向: app.vodnavi.jp → vodnavi.jp = **0本**

| 確認したページ | status | vodnavi.jp(apex/www)へのリンク |
|---|---|---|
| `app.vodnavi.jp/`(トップ) | 200 | **0** |
| `app.vodnavi.jp/works/videoa/vrkm01890`(作品詳細) | 200 | **0** |
| `app.vodnavi.jp/lp` | 200 | **0** |
| `app.vodnavi.jp/concierge` | 200 | **0** |
| `app.vodnavi.jp/articles/fanza-first-guide`(記事) | 200 | **0** |
| `app.vodnavi.jp/genres/6925`(ジャンルハブ) | 200 | **0**(af_id=990 アンカーは 21本) |
| `app.vodnavi.jp/actresses/1078618`(女優ハブ) | 200 | **0**(af_id=990 アンカーは 28本) |
| `app.vodnavi.jp/articles`(インデックス) | **404** | — |

- **app.vodnavi.jp から vodnavi.jp への発リンクは、確認した全7ページで 0本**
- 参考(sitemap 収録数): articles **7** / genres **200** / actresses **1,196**

---

## 4. 繰越項目

### (d) GSC ステータスダッシュボード（**CSO明示提供URL**を使用・22:0x JST）

**Ranking の全インシデント履歴**(提供URL):

| 直近のインシデント | 開始日 | 期間 |
|---|---|---|
| June 2026 spam update | **2026-06-24** | 2日1時間 |
| May 2026 core update | 2026-05-21 | 11日21時間 |
| March 2026 core update | 2026-03-27 | 12日4時間 |
| March 2026 spam update | 2026-03-24 | 19時間30分 |
| February 2026 Discover update | 2026-02-05 | 21日17時間 |

- **2026-07-24 以降に開始したインシデントは 1件も掲載されていない**(直近は 6/24 開始)

**ダッシュボード トップ**(可視リンク「Google Search Status Dashboard」から遷移):

- 原文: **「No incidents」**
- Last updated time: **1 Aug 2026, 06:21 PDT**
- 掲載対象サービスは **Crawling / Indexing / Ranking / Serving の4種**。**7月25日〜8月1日の全日・全4サービスが「Available」**
- **Search Console のデータ更新遅延は、本ダッシュボードの掲載対象(上記4サービス)に含まれていない** → 本ダッシュボードでは 7/24 停止に対応する**既知の告知は確認できない**

### (b) Make.com シナリオ5615632 → **HUMAN枠へ振替(2回目)**

- `make.com` を開いた時点で**未ログイン**(ヘッダに "Sign in" / "Get started free" を表示、"Dashboard" は不表示)
- 共通制約「未ログインならHUMAN枠へ振替。CTOはログイン操作を行わない」に従い**未取得**
- 未取得項目(再掲): 生成される投稿URLの af_id / 006以外(004・990系)の混入有無 / Airtable(base `app0VKGU2B16qny6c` / table `posts`)の af_id フィールド値

---

> 本記録は事実の転記のみ。判断・評価・提案は記載していない。
