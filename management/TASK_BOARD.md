# TASK_BOARD — 2026-05-19 23:45 JST 状態同期

## [Done] インフラ・コンテンツ・逆同期完全落成（100%完了）
- [x] \[HUMAN]\ DMMアフィリエイト管理画面での vodnavi.jp / app.vodnavi.jp の副サイト登録・申請（事実確認：すでに『moterist-03』『moterist-04』として【承認済み】であることを確認、成果没収リスクを完全排除）
- [x] \[CTO]\ 5大過去記事の本番DBからの生HTML（143,258 B）逆抽出＆ローカル正典配置（commit a8a44bc）
- [x] \[CTO]\ post 1106 のタイトルタイポ（of → の）の正常補正完了
- [x] \[CTO]\ inject-pillars.sh 安全弁（1,000行ガード）付きインフラ配置の完了（commit 75a5f3d）
- [x] \[CTO]\ saturday-audit.sh 規律指標（§4b.4）に基づく雛形配置の完了（commit a779c54）
- [x] \[CTO]\ app-concierge 静的解析（tsc/eslint）エラー・警告0件の型安全性検証
- [x] \[CCO]\ 1095, 1106, 994, 954, 1018 の『ビブリア・エロティカ』リライト・本番ライブ化大成功

## [In Progress] サタデー・レビュー（初陣）起動待機フェーズ
- [ ] \[CSO/CTO]\ 2026-05-23 10:00 JST 起動の「第1回サタデー・レビュー（データ駆動PDCA）」の実値投入・無人インフラ監視（※注意：CURRENT_AUDIT_REPORT.mdで検出されたGA4 ID断片化（G-5HYV772ER9 / GT-PZQ74Z7D / G-GG7JV9MJRW）を考慮し、saturday-audit.shの集計ロジック側でデータを統合パースすること）

## [Backlog] 成果没収リスクの完全排除（最優先リーガルタスク）

## [Backlog/Low] Next.js middleware → proxy 規約移行（次サタデー枠）
- [ ] \[CTO]\ `app-concierge/src/middleware.ts`（年齢ゲート HMAC 判定）を Next.js 16 系の新 `proxy` ファイル規約に移行。ビルド時の deprecation 警告 *"The 'middleware' file convention is deprecated. Please use 'proxy' instead."* を解消する。挙動互換性（age-gate cookie 検証、`/api/concierge` 403 ガード）を維持。2026-05-23 10:00 JST のサタデー・レビュー枠で着手判定。参考：https://nextjs.org/docs/messages/middleware-to-proxy

## [Backlog] SEO follow-ups（2026-05-22 Ultimate SEO & Brand Polish セッション派生）

> 出典：`management/ALERTS.md` 2026-05-22「Ultimate SEO & Brand Polish」エントリ L251-256「発見した別 SEO 漏れ（次のサタデー枠で要対応）」。本日 2026-05-23 サタデー・レビューで正式チケット化（`management/saturday-review.md` §3）。

- [x] \[CTO+CCO]\ **erratum-1 / `/genres/[id]` description 重複スニペット排除**：`app-concierge/src/app/(site)/genres/[id]/page.tsx` の `generateMetadata()` に `getGenreEditorial(id)?.editorialLead` フォールバックを組み込み、未登録時のみ既存構造化文を使う形に refactor。works 側 (`works/[floor]/[id]/page.tsx`) の同等改修と同一パターン。`data/genres-editorial.json` が空のため実効効果は CCO 投入後。`description` だけでなく `openGraph.description` / `twitter.description` まで貫通させること。**[CTO 完了 2026-05-24 / commit `12aed2e` / dpl_EThdRhEmpuVCKb8nsR1r19dd95hY 本番反映]**。CCO 側の `data/genres-editorial.json` 投入は引き続き未着手 — JSON エントリ追加で即時 SERP/OG/Twitter snippet がユニーク化する状態。
- [ ] \[CTO]\ **erratum-2 / site-brand `Organization` + `WebSite` JSON-LD 実装**：`site-brand/src/app/layout.tsx` に `<script type="application/ld+json">` で `Organization`（`name`, `url`, `logo`, `description`, `foundingDate`, `sameAs[]`）+ `WebSite`（`url`, `name`, `potentialAction.SearchAction`）を埋め込む。`BRAND_DESIGN_GUIDE.md` §3② の「次世代映像検索 AI」「査読体制」表現を構造化データとして機械可読化。
- [ ] \[CTO]\ **erratum-3 / app-concierge home `ItemList` JSON-LD 実装**：`app-concierge/src/app/(site)/page.tsx` の works grid を `ItemList` + `ListItem`（`position`, `url`, `name`, optional `image`）として `<script type="application/ld+json">` に serialize。サイトリンク候補化を狙う。FANZA fetch 失敗時の空グリッドは JSON-LD も emit しない（空 `itemListElement` で構造化スパム警告を出さないため）。
- [ ] \[CTO]\ **erratum-4 / PWA manifest 追加**：`app-concierge/public/site.webmanifest` を新設。`name: "VODNAVI"`, `short_name: "VODNAVI"`, `start_url: "/"`, `display: "standalone"`, `theme_color: "#121212"`, `background_color: "#121212"`, `icons[]` で既存 `icon-192.png` / `icon-512.png` を `purpose: "any maskable"` で参照。`layout.tsx` の `metadata.manifest = "/site.webmanifest"` を追加。Android Add-to-Home-Screen 時のブランド表示安定化、Lighthouse PWA スコア改善。site-brand 側にも同等 manifest 追加を検討。