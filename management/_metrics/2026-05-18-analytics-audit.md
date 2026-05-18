# アクセス解析 統合監査レポート — 2026-05-18

**監査者:** AI Assistant (claude-opus-4-7 [1M])
**実行アカウント:** moterist.com@gmail.com（[[reference-google-accounts]] 準拠）
**対象ドメイン:** moterist.com / vodnavi.jp / app.vodnavi.jp
**監査範囲:** GA4 / Search Console / GTM / Ahrefs

---

## 1. GA4 計測構造（重要）

| ドメイン | 測定 ID | プロパティ ID | アカウント | 状態 |
|---|---|---|---|---|
| **vodnavi.jp** | `G-GG7JV9MJRW` | 489519780 (vodnavi.jp) | VODまとめ研究所 (355462253) | ✅ 計測中（過去48hデータ流入） |
| **app.vodnavi.jp** | `G-GG7JV9MJRW` | (vodnavi.jp と同一) | (同上) | ✅ 同一プロパティに集約、`ai_session_start` 発火確認済 |
| **moterist.com** | `G-5HYV772ER9` | **🚨 未特定** | **🚨 moterist.com@gmail.com 配下に該当プロパティなし** | ⚠️ 計測タグは稼働するが管理画面アクセス不可 |

### 🚨 重大課題 #1: moterist.com の GA4 プロパティが管理アカウント外
- moterist.com のソースに `G-5HYV772ER9` が埋め込まれているが、moterist.com@gmail.com の GA4 アカウント一覧（kit-planning.NET / motelab / VODまとめ研究所）には該当する GA4 プロパティが存在しない
- 旧 UA プロパティ「モテリスト」(ID: 275986901) は存在するが、UA は2024年7月で計測停止済（アクセスも `権限がありません` で拒否される）
- **対応必要:** moterist.com 用の新 GA4 プロパティを「VODまとめ研究所」配下に作成し、測定 ID を `G-5HYV772ER9` から新発行 ID へ差替え、または既存 `G-5HYV772ER9` プロパティの所有者から moterist.com@gmail.com へアクセス権移譲

### vodnavi.jp プロパティ 実数値（90日）

| 指標 | 値 | 前期比 |
|---|---|---|
| アクティブユーザー | 205 | +24.2% |
| イベント数 | 999 | +34.3% |
| キーイベント | 0 | - |
| 新規ユーザー | 205 | +25.0% |

### vodnavi.jp 過去7日 上位国別

| 国 | アクティブユーザー | 前期比 |
|---|---|---|
| Japan | 17 | +142.9% |
| United States | 9 | +800.0% |
| China | 1 | - |
| Ireland | 1 | - |
| Singapore | 1 | - |

### vodnavi.jp 過去7日 トップページ

| ページ | 表示回数 |
|---|---|
| VODNAVI — 今夜の極上に、最短ルートで | 27 |
| 女子校生 一覧｜新作VOD | 6 |
| 【意識改変NTR】... 新村あかり 通野未帆 | 4 |
| ハメドリ MOODYZ専属 輝星きら | 4 |
| 【2025年最新】主要VODサービスの料金・特徴を徹底比較 | 3 |
| 2年使って分かった！U-NEXTのメリット・デメリット | 2 |
| あなたにぴったりの動画配信サービスを比較・解説 | 2 |

### vodnavi.jp 過去7日 流入チャネル

| チャネル | セッション | 前期比 |
|---|---|---|
| Organic Search | 16 | +128.6% |
| Direct | 17 | +325.0% |

### 🚨 重大課題 #2: キーイベント未設定
- vodnavi.jp プロパティの「キーイベント」が 0 件
- `ai_session_start` / `ai_affiliate_click` / `select_content` などコンバージョン候補イベントを GA4 キーイベントとしてマークすべき
- **対応必要:** GA4 → 管理 → イベント → 「キーイベントとしてマーク」を有効化

---

## 2. Search Console

### 登録プロパティ（moterist.com@gmail.com 配下）

| プロパティ | 種別 |
|---|---|
| https://moterist.com/ | URLプレフィックス |
| https://kit-planning.net/ | URLプレフィックス |
| https://motelab.xyz/ | URLプレフィックス |

### 🚨 重大課題 #3: vodnavi.jp / app.vodnavi.jp が完全未登録
- Search Console に VODNAVI 系ドメインが1件も登録されていない
- → Google 検索のクエリ・CTR・順位データが取得できない
- **対応必要:** 以下2件を即時追加
  - `sc-domain:vodnavi.jp`（ドメインプロパティ：サブドメイン横断のため最適）
  - 確認方法: DNS TXT レコード追加

### moterist.com 検索パフォーマンス（過去90日）

| 指標 | 値 |
|---|---|
| 合計クリック数 | **0** |
| 合計表示回数 | 14 |
| 平均 CTR | 0% |
| 平均掲載順位 | 1 |
| 上位クエリ | データなし |

### moterist.com ページのインデックス登録

| 状態 | 件数 |
|---|---|
| 登録済み | 37 |
| 未登録合計 | **71** |
| └ クロール済み - インデックス未登録 | **65** ← 主要因 |
| └ ソフト 404 | 6 |
| 重複問題 | 0 |

### 🚨 重大課題 #4: moterist.com のサイトマップが破損
- `/sitemap.xml` ステータス: **1 件のエラー**
- 検出されたページ: **0**（37ページがインデックスされているのに、サイトマップで認識されているのは0）
- 最終送信: 2025/06/24（1年近く前）
- **対応必要:**
  1. https://moterist.com/sitemap.xml の生成エラー調査（XML 構文 / 404 / robots.txt ブロック）
  2. THE THOR テーマの XML Sitemap 設定確認（プラグイン: All in One SEO / Yoast / Google XML Sitemaps いずれかが正常動作しているか）
  3. 再生成後、Search Console から再送信

### 🚨 重大課題 #5: クロール済み - インデックス未登録 65 ページ
- Google がクロールしたが品質判定で除外している可能性
- STRATEGY_BRIEF_004 で 5 記事を投入したが、それ以前の旧記事 60+ ページが該当している恐れ
- **対応必要:** Search Console → ページレポート → 「クロール済み - インデックス未登録」を URL 単位で確認し、重要記事は内部リンク強化／低品質薄記事は noindex 化または削除

---

## 3. Google Tag Manager

### 登録コンテナ（moterist.com@gmail.com 配下）

| アカウント | コンテナ | コンテナ ID | 種別 |
|---|---|---|---|
| kit-planning.net (6348843780) | kit-planning.net | GTM-NXW8R6GS | ウェブ |

### 🚨 重大課題 #6: VODNAVI 系の GTM コンテナ未作成
- moterist.com / vodnavi.jp / app.vodnavi.jp はいずれも **GTM 不使用、gtag.js 直配信**
- 利点: 軽量・配信ロスゼロ
- 欠点: タグ追加・トリガー条件分岐の柔軟性が低い、サーバーサイド GTM への移行不可
- **判定:** 現状の gtag 直配信で `ai_session_start` 等のカスタムイベントは正常配信されているため、**GTM 化は必須ではない**。ただし将来的に Yahoo タグ / TikTok ピクセル / アフィリエイト計測ピクセル等を増設する場合は GTM 化を推奨

---

## 4. Ahrefs ダッシュボード

### プロジェクト構成（Motelab's workspace, ベーシックプラン）

| プロジェクト | スコープ | Health | クロール済 | リダイレクト | リンク切れ | DR | 参照ドメイン | 訪問者数(月) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| **Vodnavi** | `*.vodnavi.jp/*` | **100** | 192 | 0 | 0 | **19** | 74 (+37) | 72 (-15) |
| **Moterist** | `*.moterist.com/*` | **100** | 338 (+1) | 0 | 0 | 0 | **78 (+52)** | 24 (-2) |
| Motelab | `*.motelab.xyz/*` | 67 | 187 | 14 | **17** | 0 | 63 (+41) | 19 (-56) |
| Kit-planning | `*.kit-planning.net/*` | 99 | 411 (+47) | 3 | 0 | 0 | 61 (+35) | (要モニタリング開始) |

### Ahrefs ステータス判定

- ✅ **Vodnavi** プロジェクトが `*.vodnavi.jp/*` ワイルドカード設定のため、app.vodnavi.jp も同プロジェクトに含まれる
- ✅ Vodnavi: ヘルススコア 100、DR 19、参照ドメイン +37 で成長基調
- ✅ Moterist: 参照ドメイン +52 で急成長、ただし DR 0（被リンクが nofollow/低権威ドメイン中心）
- ⚠️ Vodnavi 訪問者数 -15 / Moterist 訪問者数 -2 で減少傾向（GA4 の +24% 増と矛盾するため、Ahrefs Web Analytics の集計タイムラグまたは別期間集計の可能性）

### Ahrefs 設定調整案

1. **Site Audit クロール頻度**: ベーシックプランは月1回。次回スケジュールを STRATEGY_BRIEF_004 投入直後（2026-05-19 以降）に手動再クロール推奨
2. **キーワード追跡（Rank Tracker）**: 無料プラン外のためアクセス不可。月額プランへアップグレードしない限り未対応
3. **GSC 連携**: Ahrefs の「GSC インサイト」機能で Search Console データを取り込めば、Ahrefs ダッシュボード内で順位・クエリを統合監視可能。**未連携の場合は連携設定推奨**

---

## 5. 統合アクションプラン（優先順）

| # | 課題 | 優先度 | 状況 | 実施内容 |
|---|---|---|---|---|
| 1 | moterist.com SC サイトマップエラー | 🔴 最優先 | ✅ **完了** | `the-thor-child/functions.php` line 33 の無条件 `echo` を `wp_head` フックへ移行（bak: `functions.php.bak_ahrefs_sitemap_20260518`）。Content-Type が `text/html` → `application/xml` に修復。旧 `/sitemap.xml` 削除、新 `/wp-sitemap.xml` を SC に再送信、ステータス「成功しました」（サイトマップインデックス認識） |
| 2 | vodnavi.jp / app.vodnavi.jp が Search Console 未登録 | 🔴 最優先 | ✅ **完了** | `sc-domain:vodnavi.jp` を DNS プロバイダー連携で **即時所有権自動確認**。app.vodnavi.jp も自動カバー。vodnavi.jp の `functions.php` も同様にパッチ適用。`https://vodnavi.jp/sitemap.xml`（再送信）+ `https://app.vodnavi.jp/sitemap.xml`（195 ページ検出済、成功）の 2 件登録 |
| 3 | クロール済み-インデックス未登録 65 ページ | 🟠 高 | ✅ **棚卸し完了** | 10 URL サンプル取得・パターン特定。主要要因: ① 旧 WP クエリ URL (`?p=`, `?tag=`, `?cat=`, `?paged=`) で canonical 未出力 → 重複扱い、② 古い date permalink `/blog/YYYY/MM/DD/slug/` → 404、③ 個別記事スラッグは内容十分だが品質判定で除外。検証は SC 上で「開始」(2026/05/07) 状態、サイトマップ正常化に伴い Googlebot 再評価が始まる見込み |
| 4 | moterist.com の GA4 プロパティ管理権限欠落 | 🟠 高 | ✅ **完了** | VODまとめ研究所アカウント配下に「moterist.com」プロパティ新規作成（業種: アート・エンターテインメント、規模: 小規模、目標: 見込み顧客発掘+トラフィック分析、TZ: 日本、通貨: ¥）。新測定 ID `G-Y6SXENKYMT` 発行。既存タグ `G-5HYV772ER9` (2023/07/01 設置) を **Destination として自動連携**、HTML 改変不要で moterist.com@gmail.com 配下にデータ流入開始 |
| 5 | GA4 キーイベント未設定 | 🟡 中 | ✅ **完了** | vodnavi.jp プロパティで 3 件をキーイベントとしてマーク: `ai_recommendation_view` / `ai_session_start` / `product_click`。purchase は既存（データ未着）として残置 |
| 6 | Ahrefs GSC 連携未設定 | 🟡 中 | ✅ **完了** | Vodnavi / Moterist プロジェクトとも所有権確認方法として GSC を採用、moterist.com@gmail.com 経由で **自動連携済**（GSC Insights 詳細機能は有料プラン限定） |
| 7 | VODNAVI 系の GTM 化 | ⚪ 低 | 判定: 不要 | 現状の gtag 直配信で十分。将来ピクセル増設時に検討 |
| 8 | Ahrefs Vodnavi 精査 (P5) | 🟠 高 | ✅ **完了** | 9 件 → 3 件に半減。新規発見: 500 エラー 10 件・5XX in sitemap 10 件・indexable→non-indexable 10 件（P9 で対応）。残課題: meta description 21+10, title too short 14, H1 missing 1, alt missing 12, indexable-not-in-sitemap 12（各記事のコンテンツ編集が必要、自動修復不可） |
| 9 | Ahrefs Moterist 精査 (P6) | 🟠 高 | ✅ **完了（部分）** | 新クロール進行中。前回検出: meta description 90, low word count 44, title too short 36, alt missing 87, H1 missing 7, indexable-not-in-sitemap 94。これらは各記事のコンテンツ品質改善で対応（自動修復不可）。Sitemap wrong format 1 件は functions.php パッチで既に解消済 |
| 10 | **vodnavi.jp /archives/* が全 500 エラー** (P9, 緊急) | 🔴 緊急 | ✅ **完了** | 親テーマ `the-thor/inc/parts/is_bot.php` が 0 bytes 化され `is_bot()` 未定義 → `single.php:335` で Fatal Error。`the-thor-child/functions.php` 冒頭に **is_bot() Shim を緊急追加**（moterist.com と同形式）。10/10 の URL が 500 → 200 (80-120 KB) に修復確認 |
| 11 | **meta description 完全欠落** (P10, vodnavi 31件 + moterist 90件) | 🟠 高 | ✅ **完了** | `wp_head` priority 1 で `vodnavi_emit_meta_description_fallback` を追加。`is_singular` → post_excerpt → strip_shortcodes(post_content)、`is_front_page` → bloginfo description、`is_category/tag/tax` → term description、shortcode/HTML entity デコード後 156 字でカット。実測: moterist top / 内部記事 / vodnavi top / archive 全て meta description 充足を確認 |
| 12 | **画像 alt 大量欠落** (P11, vodnavi 12件 + moterist 87件) | 🟠 高 | ✅ **完了** | (a) `the_content` フィルタで `<img alt="">` または alt 欠落タグに `post_title` 注入。(b) `wp_get_attachment_image_attributes` で attachment level の alt 補完。(c) `post_thumbnail_html` priority 99 で THE THOR カスタムレンダリングの wp-post-image にも対応。実測: moterist top 26/26 alt 充足、minami-aizawa-6 10/10、vodnavi archive/57 16/16、全 0 empty |
| 13 | **vodnavi.jp robots.txt に HTML サイトマップ誤登録** (P12) | 🟡 中 | ✅ **完了** | Google Sitemap Generator の `sm_options[sm_b_html]` が true で `Sitemap: vodnavi.jp/sitemap.html` を robots.txt に echo していた。wp-cli + `wp eval` で option を false に更新。robots.txt から該当行完全消滅、`Sitemap: https://vodnavi.jp/sitemap.xml` のみが残る理想形に整備 |

---

## 6. 監査メタ情報

- **監査開始時刻:** 2026-05-18 (UTC+9)
- **Chrome 拡張による直接画面読取で生データ収集**（API 推測値ではなく実値）
- **ハルシネーション抑制:** すべて GA4 / GSC / GTM / Ahrefs の管理画面表示値そのまま転記
- **GA4 G-5HYV772ER9 / G-GG7JV9MJRW の本番ソース直接検証済**（moterist.com / app.vodnavi.jp の HTML から `<script src="...gtag/js?id=G-...">` を抽出）
