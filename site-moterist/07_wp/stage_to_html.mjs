#!/usr/bin/env node
/**
 * STRATEGY_BRIEF_002 PHASE 3 pre-step: staged Markdown → 純粋 HTML 本文
 *
 * site-moterist/03_content/<slug>/article_staged.md からフロントマターを除外し、
 * MD 形式の PR ブロックを THE THOR 装飾辞書の <div class="sttitlebox st-mybox-yellow"> へ
 * 構造変換した最終 HTML を site-moterist/07_wp/staged_html/<id>.html として出力する。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname ?? ".", "..");

const ARTICLES = [
  { id: 1095, slug: "fanza20250329",      intent: "beginner", title_cta: "迷ったら AI コンシェルジュに相談する（初心者向け案内）" },
  { id: 1106, slug: "fanza20250331",      intent: "premium",  title_cta: "プレミアム体験の案内を AI コンシェルジュに相談する" },
  { id: 994,  slug: "fanza_otoku250114",  intent: "discount", title_cta: "今夜の予算に合う案内を AI コンシェルジュに相談する" },
  { id: 954,  slug: "fanzaotoku",         intent: "discount", title_cta: "今夜の予算に合う案内を AI コンシェルジュに相談する" },
  { id: 1018, slug: "saika-kawakita-6",   intent: "actress",  title_cta: "気になる女優の案内を AI コンシェルジュに相談する" },
];

const CONCIERGE_BASE = "https://app.vodnavi.jp/concierge";

function buildTailCta(intent, label) {
  return [
    '',
    '<div class="btn btn-center">',
    `  <a class="btn__link btn__link-secondary" href="${CONCIERGE_BASE}?source=moterist&intent=${intent}">`,
    `    ${label}`,
    '  </a>',
    '</div>',
  ].join('\n');
}

const PR_HTML = [
  '<div class="sttitlebox is-style-st-default-ttlbox st-mybox-yellow">',
  '  <p class="st-mybox-title">免責</p>',
  '  <p>本記事にはアフィリエイトリンクが含まれます（#PR）。各サービスの最新の料金・配信状況は公式サイトでご確認ください。</p>',
  '</div>',
].join("\n");

function stripFrontmatter(src) {
  return src.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

function mdBlockquoteToPrBlock(body) {
  // 連続する "> ..." 行を THE THOR の注意ボックスへ置換（最初の 1 ブロックのみ）
  return body.replace(
    /^(?:>\s+[^\n]*\n?)+/m,
    PR_HTML + "\n\n",
  );
}

function tidyMultipleBlankLines(body) {
  return body.replace(/\n{3,}/g, "\n\n");
}

function buildHtmlBody(meta) {
  const { id, slug, intent, title_cta } = meta;
  const stagedPath = resolve(ROOT, "03_content", slug, "article_staged.md");
  let body = readFileSync(stagedPath, "utf8");
  body = stripFrontmatter(body);
  body = mdBlockquoteToPrBlock(body);
  body = tidyMultipleBlankLines(body);
  body = body.replace(/^\s+/, "").replace(/\s+$/, "");
  // 末尾に intent 付きコンシェルジュ送客 CTA を強制配線
  body += buildTailCta(intent, title_cta) + "\n";

  const outDir = resolve(ROOT, "07_wp", "staged_html");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, `${id}.html`);
  writeFileSync(outPath, body, "utf8");
  return { id, slug, intent, bytes: body.length, path: outPath };
}

const results = ARTICLES.map(buildHtmlBody);
console.log(JSON.stringify(results, null, 2));
