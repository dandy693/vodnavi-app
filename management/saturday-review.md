# Saturday Review — 2026-05-23 10:00 JST 起動枠

> 本ファイルは AGENT_PROTOCOLS.md §週次データ駆動 PDCA ルーティン に基づく第 1 回サタデー診断の構造化スカフォールドである。
> **HUMAN 注意**：プロトコル正典の格納先は `management/_metrics/<YYYY-WW>/saturday-review.md`（= `_metrics/2026-W21/saturday-review.md`）。本ファイルは HUMAN 指示により `management/` 直下に scaffold した複製であり、次週以降は正典側に統合するか、本ファイルを正典として §週次 PDCA を改訂するか、Saturday Review で判定要。

---

## 0. データ取得ステータス（CTO 担当ブロック）

| 取得項目 | 取得手段 | 取得結果 | 備考 |
|---|---|---|---|
| GA4 — `source × intent` 別セッション数（先週分） | **未取得（ブロック）** | — | HUMAN 指示で「manual browser execution を拒否」。GA4 Data API 接続情報（service account JSON、`GA4_PROPERTY_ID` env）が repo に未配置のため、`?authuser=2` でのブラウザ操作以外の手段で実値取得不能。 |
| GA4 — `ai_session_start` / `product_click` / `ai_affiliate_click` 発火数 | **未取得（ブロック）** | — | 同上。`moterist.com@gmail.com` セッションを別途取得して取得 routine を組むか、`@google-analytics/data` ライブラリを `scripts/pull-ga4.ts` として scaffold する判断を HUMAN に委ねる。 |
| GSC — sc-domain:vodnavi.jp の表示回数 / CTR / 平均掲載順位 / インデックス状態 | **未取得（ブロック）** | — | Search Console API も同様に service account 経由 or OAuth が必要。前回（2026-05-21）スポット監査の `_metrics/2026-W21/indexing-error-list.json` と `_metrics/2026-W21/gsc-live-audit.json` がローカルにある（前ターン生成）。 |
| サイトマップ submitted URL 数（VODNAVI 側） | **取得済**（公開 sitemap.xml を curl） | **1,809 URL** | HTTP 200、レスポンス 310,487 bytes。`<lastmod>` 最新は 2026-05-22T03:25:48Z。ISR `revalidate=3600` のため初回ヒットで再生成済の安定状態。`/works/{floor}/{id}` 系 + `/genres/{id}` 系で増加。 |
| サイトマップ discovered URL 数（Google 側） | **未取得（ブロック）** | — | GSC レポート必須。ベースライン 197 → 1,809 への遷移を Google が認識したかは GSC `Sitemaps` レポートの最終取得日時と Discovered URLs 列で確認する必要あり。**手動経路で HUMAN に確認依頼するか、API 取得経路を整備する判断要**。 |
| vodnavi.jp 旧 WP 残骸の生存確認 | **取得済**（HTTP HEAD） | **WP 稼働継続中** | 後述 §2 |

**結論**：本日の routine の「データ取得」ステップは ① 公開 endpoint で取れる構造データのみ完遂、② 認証必須の GA4/GSC は手段がブロックされているため未完。プロトコル §週次 PDCA 1. に書かれた「Claude Code 経由で読み込み」は GA4/GSC API の OAuth/service account 経路の整備が前提であり、この前提が未充足。

---

## 1. 構造ヘルス・サマリ（コード正典側の自動検出）

| レイヤ | 状態 | 出典 |
|---|---|---|
| app-concierge sitemap.ts 動的展開 | ✅ 全 5 フロア × 4 ページ展開 + 200 genres 上限、ISR 3600 秒。実測 1,809 URL。 | `app-concierge/src/app/sitemap.ts:1-109` |
| FANZA クライアント キャッシュ設定 | ✅ `revalidate=300` に正規化済（2026-05-22 12:11 JST 解決） | `app-concierge/src/lib/fanza/client.ts:88`、ALERTS.md L194 |
| FanzaImage ラッパ（Vercel Image 枠保護） | ✅ FANZA src のみ `unoptimized`、1st-party は最適化継続 | ALERTS.md L139-159 |
| works detail パンくず + 関連作品 12 件 | ✅ 実装済（commit `5ec993f` + `17e4b84`） | `app-concierge/src/app/(site)/works/[floor]/[id]/page.tsx` |
| genres detail パンくず + editorial スロット + 18 ピル | ✅ 実装済、本番 `/genres/1036` `/genres/6533` で 18 ピル確認済 | ALERTS.md L163-181 + 204-208 |
| editorial JSON 受け皿 | ✅ `data/works-editorial.json` `data/genres-editorial.json`（空で出荷、CCO 投入待ち） | ALERTS.md L73-91 |
| works `generateMetadata` editorialLead 結線 | ✅ 実装済（CCO 投入時 description/OG/twitter に流れる） | ALERTS.md L242-243 |
| favicon スイート + `metadata.icons` | ✅ 両プロジェクト配置済（sharp で再生成可能） | ALERTS.md L243-249 |
| works detail JSON-LD `Product` + 条件付き `AggregateRating`/`Offer` | ✅ 実装済 | ALERTS.md L242 |
| **genres `generateMetadata` editorialLead 結線** | ⚠️ **未結線**（重複スニペットパターン継続） | erratum #1（§3） |
| **site-brand JSON-LD（Organization / WebSite）** | ⚠️ **未実装** | erratum #2（§3） |
| **app-concierge home JSON-LD（ItemList）** | ⚠️ **未実装** | erratum #3（§3） |
| **PWA manifest（`public/site.webmanifest`）** | ⚠️ **未実装** | erratum #4（§3） |
| middleware → proxy 規約移行（Next.js 16） | ⚠️ 未着手（deprecation 警告継続） | TASK_BOARD.md L17 |

---

## 2. vodnavi.jp WP-remnants 実況スナップショット（2026-05-23 12:46 JST）

実測 HTTP プローブ結果（curl HEAD / GET HTTP コードのみ）：

| URL | HTTP | 観測 |
|---|---|---|
| `https://vodnavi.jp/` | 200 | `Server: LiteSpeed` / `Link: <https://vodnavi.jp/wp-json/>; rel="https://api.w.org/"` / `Link: <https://vodnavi.jp/wp-json/wp/v2/pages/206>; rel="alternate"` |
| `https://vodnavi.jp/wp-json/` | 200 | WP REST API 公開状態継続 |
| `https://vodnavi.jp/about` | 200 | WP page id=206 系列で配信中（site-brand `/about` ではない） |
| `https://vodnavi.jp/archives/category/test/hulu` | 404 | site-brand `next.config.ts` の 301 ルールは未到達（DNS 切替・本番デプロイ未実施） |
| `https://vodnavi.jp/d-anime-store-only-title/` | 404 | 同上 |

**判定**：ALERTS.md 2026-05-22 12:00 JST `[high/backlog]` エントリの所見と完全一致。WP は依然 mixhost LiteSpeed で稼働、site-brand コードは Vercel ビルド可だが本番未デプロイ。GSC `sc-domain:vodnavi.jp` の「ソフト 404」「noindex」バケット残存の温床。

**Saturday Review 判断オプション**（ALERTS.md 2026-05-22 12:00 JST に既出）：
- (A) WP `.htaccess` / MU プラグインで `/archives/*` `/d-anime-store-only-title/*` を 301 or 410 化（moterist.com `typo-fix-commonCtr.php` と同パターン適用可能）
- (B) site-brand を Vercel 新規プロジェクトとして link + デプロイ、DNS A/CNAME 切替
- (C) 両ホスト並行 + WP は読み取り専用化

→ HUMAN の意思決定待ち（CTO は SSH 共用可否を未確認）。

---

## 3. Erratum-class SEO follow-ups（4 件、2026-05-22 セッション内で発見）

出典：ALERTS.md L251-256「発見した別 SEO 漏れ（次のサタデー枠で要対応）」。本日付で `TASK_BOARD.md` に正式チケットとしてミラーした（§3 末尾の引用参照）。

| # | タイトル | 所有者 | 効果 | 着手難度 |
|---|---|---|---|---|
| 1 | `/genres/[id]` `generateMetadata` の description 重複スニペット排除 — `getGenreEditorial(id)?.editorialLead` を OG/twitter/description に fallback 連結 | CTO（コード）/ CCO（JSON 投入） | duplicate snippet 解消 → indexation 品質向上 | 低（works 側の同等パターンをコピー） |
| 2 | site-brand に `Organization` / `WebSite` JSON-LD 実装 | CTO | E-E-A-T 構造化、`foundingDate` `description` `sameAs` で「次世代映像検索 AI」「査読体制」を機械可読化 | 低 |
| 3 | app-concierge home (`/`) に `ItemList` JSON-LD 実装 | CTO | works grid の各カードを `ListItem` 化 → サイトリンク候補化 | 中（grid items の serialize 必要） |
| 4 | `app-concierge/public/site.webmanifest` PWA manifest 追加（`icon-192` / `icon-512` を `purpose: "any maskable"` で参照） | CTO | Android Add-to-Home-Screen 時のブランド表示安定化、Lighthouse PWA スコア改善 | 低（favicon スイート既存） |

---

## 4. 自動アクション（プロトコル §週次 PDCA 3.）

| 自動アクション | 本ターンでの発行可否 | 理由 |
|---|---|---|
| 送客率 -20% 超記事の `STRATEGY_BRIEF_RW_<記事ID>_<YYYYMMDD>.md` 発行 | **発行不可** | GA4 セッション・遷移データ未取得のため -20% 判定不能。GA4 認証経路整備後に retry。 |
| CVR 低下 intent への A/B テスト指示書 | **発行不可** | 同上、`ai_session_start` → `ai_affiliate_click` ファネル未取得。 |
| 11〜20 位クエリの IG 強化指示 | **発行不可** | GSC `searchAnalytics` API 未接続。 |

→ プロトコル §週次 PDCA の自動アクション 3 種すべて、データ取得層が未整備のため本ターンでは発行不能。**先決タスクは「GA4 Data API + GSC API への service account 接続を `scripts/pull-ga4.ts` `scripts/pull-gsc.ts` として整備すること」**。HUMAN 判断要。

---

## 5. open severity:high アラート 現況

| 起票時刻 | 件名 | status | 次アクション |
|---|---|---|---|
| 2026-05-21 14:50 JST | GSC「クロール済み-インデックス未登録」152 件（3 因子複合：sitemap 未掲載 + 本文薄 + 行き止まり） | open | 1 週後再監査（= 2026-05-28）。コード側因子 A/C は実装完了、因子 B は CCO 投入待ち。本サタデーで Google が 197 → 1,809 を discover し始めたかの GSC `Sitemaps` レポート確認要（GSC 認証経路整備が前提）。 |
| 2026-05-22 12:00 JST | vodnavi.jp WP 運用継続、site-brand 未デプロイ | open | §2 参照、HUMAN 意思決定待ち。 |

---

## 6. 本セッションでの確定アクション

1. 本ファイル（`management/saturday-review.md`）を scaffold。**HUMAN 注意：プロトコル正典 `_metrics/2026-W21/saturday-review.md` ではなく `management/` 直下に置いた**。ALERTS.md は同パスにエントリを書き加えていないが、本ターンの routine 完了として `TASK_BOARD.md` の「サタデー・レビュー（初陣）起動待機フェーズ」を進捗更新する妥当性あり（HUMAN 判定）。
2. 4 件の erratum を `TASK_BOARD.md` `[Backlog] SEO follow-ups（2026-05-22 セッション派生）` セクションに新規追記。

---

## 7. HUMAN 確認・判定が必要な 4 ブロッカ

1. **GA4/GSC API 認証経路の整備方針**（service account か OAuth か）。整備しない限り、本 routine の自動 PDCA は永続的にデータレスのまま。
2. **vodnavi.jp WP-remnants 解消の選択**（§2 オプション A/B/C）。
3. **本ファイルの格納先**（`management/saturday-review.md` vs `_metrics/2026-W21/saturday-review.md`）の正典化判断。
4. **diagnostic `dynamic = "force-dynamic"` / `revalidate = 0` の残置**（`/genres/[id]/page.tsx`、`/(site)/page.tsx`）が現在も観測目的で必要かの確認。観測終了済なら ISR 復帰要（ALERTS.md L207）。
