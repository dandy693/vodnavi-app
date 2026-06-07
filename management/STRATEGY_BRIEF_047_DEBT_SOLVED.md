# STRATEGY_BRIEF_047 — `[slug]/page.tsx` 2大技術負債の解消（build-verified）

発行: 2026-06-07 / 採番: 046 の次 = **047** / 前提: BRIEF_046（T-06 = Approach A 確定, CSO 採択）

## 1. 執行ステータス
- **T-06 確定**: vodnavi.jp メディア = **Approach A（Next.js SSG + Markdown）** に確定。
- **対象**: `site-brand/src/app/[slug]/page.tsx`（vodnavi.jp 記事レンダラ）。※原案は `app-concierge` を指していたが実体は `site-brand`。

## 2. 解消した負債（BRIEF_046 §3 で発見）
1. **Markdown レンダラ刷新**: 旧 `convertSimpleMarkdownToHtml`（regex で h1/h2/blockquote/link/改行のみ）を `mdToHtml` に置換。新版は **H1–H3 / 太字 / 斜体 / リンク / 画像 / 引用 / 箇条書き / 段落**に対応。さらに **raw HTML を escape**（`& < > " '`）し XSS 表面を除去（旧版は未 escape だった）。依存追加なし。フル CommonMark 化が必要になれば `react-markdown` + `rehype-sanitize` を `npm install` して移行（sandbox の network 制約のため本ターンは見送り）。
2. **デザイン整合**: hardcoded hex（`#121212` / `#E0E0E0`＝canonical `#FAFAFA` と不一致）+ inline `<style>` を排除。container は `bg-brand-dark` / `text-brand-text-secondary` / `font-luxury-*` の brand utility、記事内要素は `design-tokens.css` の CSS 変数（`var(--brand-gold)` 等、canonical 値）でスコープ style。

## 3. QA（物理検証）
- `tsc --noEmit` **exit 0** / `next build` **exit 0**。
- `/[slug]` SSG: 既存2記事（`u-next-second-free-trial` / `wordpress-sango-review`）が static prerender 成功。

→ **T-20260607-06 = 完了**（Approach A 確定 + 負債解消 + build verified）。記事量産の基盤が整備された。
