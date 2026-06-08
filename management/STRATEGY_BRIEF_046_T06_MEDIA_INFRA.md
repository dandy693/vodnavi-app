# STRATEGY_BRIEF_046 — vodnavi.jp メディア格納環境（T-06）の選定分析と推奨

発行: 2026-06-07 / 採番: 045 の次 = **046** / 前提: BRIEF_043（2ドメイン集中）/ board: T-20260607-06

## 1. 物理ファクト（※原案の「A vs B 未決」を訂正）
**vodnavi.jp は既に `site-brand/`（Next.js app, Vercel）であり、メディアは既に Approach A（Next.js SSG + Markdown）で稼働中。** ゼロからの A/B 選定ではない。
- 記事は `site-brand/03_content/<slug>/article.md`（リポジトリ内 Markdown）。
- `src/app/[slug]/page.tsx` が当該 Markdown を読み、`generateStaticParams()` で **SSG**（記事ごと静的生成）。`metadataBase=https://vodnavi.jp`。
- 既存記事: `u-next-second-free-trial` / `wordpress-sango-review`（clean）。

## 2. 選定分析
### ✅ Approach A（現状: Next.js SSG + Markdown）— 推奨・継続拡張
- **コスト**: リポジトリ内 Markdown 追加のみ。Vercel 静的配信、追加インフラ 0。
- **SEO**: 静的 HTML 事前生成でクロール耐性良好。`site-brand` の sitemap.ts / robots.ts と統合済。
- **GA4/_gl**: app.vodnavi.jp と同一 Next.js エコシステムで `source`/`intent`/`_gl` の取り回しが一貫（proxy.ts pass-through と整合）。ドメイン境界の cookie 共有リスクを増やさない。
- **保守**: WordPress 面を増やさない＝ moterist 凍結方針と一貫。

### ❌ Approach B（mixhost / WordPress / reverse-proxy マージ）— 非推奨
- vodnavi.jp を Next.js と WP の二系統に分断 → `_gl`/cookie/ドメイン境界が複雑化、保守コスト増。
- moterist 凍結で減らそうとしている WordPress 表面を vodnavi.jp に再導入することになり、戦略矛盾。
- 「コスト0で最速立ち上げ」のメリットは、既に A が稼働中のため成立しない。

## 3. 推奨（CSO 確定待ち）
**Approach A 継続**。ただし scale 前に2点の技術負債を解消すべき（監査で発見）:
1. **Markdown レンダラの貧弱さ**: `[slug]/page.tsx` の `convertSimpleMarkdownToHtml` は regex で h1/h2/blockquote/link/改行のみ対応。リスト・太字・画像・表が未対応。記事量産前に正式な Markdown ライブラリ（or MDX）へ置換推奨。
2. **デザイン非整合**: `[slug]/page.tsx` は hardcoded hex（`bg-[#121212]` / `text-[#E0E0E0]`＝canonical `#FAFAFA` と不一致）+ inline `<style>` + `font-serif`。site-brand 他ページ（policy 等）の `design-tokens.css`/`brand-*` トークン + `font-luxury-*` に揃えるべき。

## 4. 次アクション
CSO が Approach A 継続を確定後、CTO が上記2点（Markdown 強化 / styling 整合）を build-verify 付きで実装する（T-07 の SNS LP と並行可）。
