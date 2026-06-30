# STRATEGY BRIEF 115 — vodnavi.jp Next.js メディア強化および年齢確認ガード統合のキックオフ

## 0. 前提の訂正（物理事実・最高法律準拠／既往ブリーフ整合）
1. **vodnavi.jp（site-brand）は既に Next.js（App Router）で本番稼働**（`next.config.ts` / `src/app/layout.tsx` / `[slug]/page.tsx` dual-read / `03_content/`）。本フェーズは「ゼロからの Next.js 構築/init」ではなく**既存への拡張・強化**（BRIEF_104 §0 と整合）。
2. **デザインシステム（ダーク×ゴールド）は定義済**: `src/app/globals.css` に `--brand-dark`(#121212) / `--brand-gold`(#D4AF37) 等の CSS 変数が存在。**hardcoded hex の再定義は禁止**＝design-tokens / CSS 変数を参照（既存規約）。
3. **「moterist.com からの完全遷都」は未承認・ゲート対象**（board `T-20260628-11`）。moterist は**完全凍結＝現在地ホールド・削除/移送しない**（BRIEF_043）。「完全遷都を受け」という既成事実化はしない。
4. **年齢確認の実装は `app-concierge/src/proxy.ts`**（Next.js 16 規約・旧 `middleware.ts` 後継）。`src/middleware.ts` の新規作成は禁止（[[project_age_gate_shield_is_proxy_ts]]）。
5. **`?sort=` への noindex は不採用（最高法律違反）**。クエリURLは self-canonical consolidation で正規絶対URLへ集約し、`noindex` は付与しない（BRIEF_101 / e82a670）。slug 付き canonical + not-found のみ noindex は実装済。
6. **クッキー機構の三者分離（混同禁止）**: 年齢確認 cookie（`vodnavi_age_verified`・proxy.ts 検査）／FANZA 早期クッキー着火（`buildEarlyCookieURL`・af_id）／GA4 クロスドメイン linker（`_gl`・gtag 自動消費）は**別機構**。proxy.ts に「承諾直後の FANZA cookie 着火」を混載しない。

## 1. 目的
2ドメイン要塞化（`vodnavi.jp`=信頼メディア / `app.vodnavi.jp`=成約アプリ）の**継続強化**として、既存 site-brand の編集体験・SEO 資産保全・年齢確認ガードの堅牢化を進める（新規スクラッチではなく既存資産の拡張）。

## 2. 物理実装および不変条件
- **ブランド世界観**: 『ビブリア・エロティカ』（高級・知性・ダーク×ゴールド）を**既存 `globals.css` の CSS 変数を参照**して具現化（hex 直書き禁止）。
- **年齢確認ガード**: `proxy.ts`（Next.js 16）で `/api/concierge/*` を 403 物理遮断、`/concierge` パススルー、**`/works` 公開（SEO 面・matcher 非対象）**。FANZA cookie-burn は CTA クリック時の `buildEarlyCookieURL` で別途（proxy に混載しない）。
- **SEO 資産保全**: 既存 slug の正規絶対URL canonical を維持、`?sort=` は self-canonical consolidation（noindex 不使用）。移植が承認された旧記事は 301 で評価継承。
- **計測継承**: GA4 プロパティ `p489519780`（測定ID `G-GG7JV9MJRW`、cross-domain linker = `vodnavi.jp`/`app.vodnavi.jp`/`moterist.com` を 2026-07-01 物理確認・[[reference_ga4_property_topology]]）のタグ・linker 設定を無傷で引き継ぐ。`?source=moterist` は hostName/source で識別。

## 3. 既存タスクとの重複整理
- 本ブリーフの実装作業は既存 **`T-20260630-UI`**（vodnavi デザインシステム）/ **`T-20260630-EDGE`**（app.vodnavi.jp proxy.ts 年齢ガード prototype）/ **`T-20260630-MW`**（proxy.ts 監視）と**重複**。新規タスクはこれらの**継続**であり、並走トラッカーを増やさない。
