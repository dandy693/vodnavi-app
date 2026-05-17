#!/usr/bin/env node
/**
 * STRATEGY_BRIEF_004 PHASE 3 — staged Markdown → 純粋 HTML 本文 (full converter)
 *
 * 変換責務:
 *   1. フロントマター除去
 *   2. ## / ### 見出しを <h2> / <h3> 化（クローズドタグ完備）
 *   3. 連続する "> " 行を <blockquote class="st-cite"> ブロックへ
 *      （最初の "> 本記事..." PR 行のみ既定の THOR 黄色枠へ置換。
 *        ただし冒頭にラグジュアリー免責 <div class="nth-box-luxury"> が
 *        既に存在する場合は PR 置換を完全スキップ）
 *   4. **bold** → <strong>bold</strong>
 *   5. 単独 <a class="btn__link-..."> を <div class="btn btn-center"> で包む
 *   6. プレーン段落を <p> でラップ（wpautop の二重 <p> 干渉を排除）
 *   7. HTML 既存ブロック (<div>, <blockquote>, <h2>, <ul>, <hr>, <span>) は触らない
 *   8. 末尾 intent 付きコンシェルジュ tail CTA を、既存 concierge リンクが無い場合のみ付与
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname ?? ".", "..");

const ARTICLES = [
  { id: 1095, slug: "fanza20250329",      intent: "beginner", title_cta: "迷ったら AI コンシェルジュに相談する（初心者向け案内）" },
  { id: 1106, slug: "fanza20250331",      intent: "premium",  title_cta: "プレミアム体験の案内を AI コンシェルジュに相談する" },
  { id: 994,  slug: "fanza_otoku250114",  intent: "discount", title_cta: "今夜の予算に合う案内を AI コンシェルジュに相談する" },
  { id: 954,  slug: "fanzaotoku",         intent: "discount", title_cta: "今夜の予算に合う案内を AI コンシェルジュに相談する" },
  { id: 1018, slug: "saika-kawakita-6",   intent: "premium",  title_cta: "プレミアム鑑賞の案内を AI コンシェルジュに相談する" },
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

const HTML_BLOCK_PREFIXES = [
  "<div", "<section", "<article", "<aside",
  "<blockquote", "<table", "<thead", "<tbody", "<tr", "<th", "<td",
  "<ul", "<ol", "<li",
  "<h1", "<h2", "<h3", "<h4", "<h5", "<h6",
  "<hr", "<pre", "<figure", "<img", "<picture",
  "<p", "<span", "<a", "<!--",
];

function stripFrontmatter(src) {
  return src.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

function hasLuxuryNotice(body) {
  // 冒頭近く (最初の 500 文字以内) に nth-box-luxury もしくは NOTICE 免責があれば
  // PR ブロック置換は不要（オーナー設置のラグジュアリー枠を保持する）。
  const head = body.slice(0, 500);
  return /nth-box-luxury|【NOTICE/.test(head);
}

function replaceFirstPrBlockquote(body) {
  // 「> 本記事には...」で始まる最初の "> " ブロック行群のみ PR_HTML に置換。
  // 単一回置換 (no /g)。他の "> " ブロックは convertBlockquotes が拾う。
  return body.replace(
    /^(?:>\s*本記事[^\n]*\n)(?:>\s+[^\n]*\n?)*/m,
    PR_HTML + "\n",
  );
}

function applyInlineStrong(text) {
  // **bold** → <strong>bold</strong>。ネスト/エスケープは想定外（仕様簡略化）。
  return text.replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
}

function convertBlockquotes(body) {
  // 連続する "> " 行 (空 "> " も含む) を <blockquote class="st-cite"> ブロックへ。
  return body.replace(
    /(?:^>[^\n]*\n?)+/gm,
    (block) => {
      // 各行頭の "> " を剥がす。空行 (">" のみ) は段落区切り。
      const lines = block.replace(/\n$/, "").split("\n").map((l) =>
        l.replace(/^>\s?/, ""),
      );
      // 連続する空行を段落区切りとして扱い、空でない連続行は <p> にまとめる。
      const paragraphs = [];
      let buffer = [];
      for (const line of lines) {
        if (line.trim() === "") {
          if (buffer.length > 0) {
            paragraphs.push(buffer.join(" "));
            buffer = [];
          }
        } else {
          buffer.push(line);
        }
      }
      if (buffer.length > 0) paragraphs.push(buffer.join(" "));

      const inner = paragraphs
        .map((p) => `  <p>${applyInlineStrong(p)}</p>`)
        .join("\n");
      return `<blockquote class="st-cite">\n${inner}\n</blockquote>\n`;
    },
  );
}

function convertMarkdownHeadings(body) {
  // 見出しは独立した行：行頭の "## "・"### " を <h2>・<h3> に変換し、行末で閉じる。
  // ## より長いプレフィックス（####）も保険として扱う。
  body = body.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  body = body.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  body = body.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  // 念のため "# " の素のH1も処理（記事内では使われない前提だが安全弁）。
  body = body.replace(/^#\s+(.+)$/gm, "<h2>$1</h2>");
  return body;
}

function wrapBareCtas(body) {
  // 行単独の <a class="btn__link-..."> を <div class="btn btn-center"> で囲む。
  // 既に <div class="btn"> 内にある CTA は触らない（先頭が "<div" でない行のみ）。
  return body.replace(
    /^(<a\b[^>]*class="[^"]*btn__link[^"]*"[^>]*>.*?<\/a>)\s*$/gm,
    (_m, a) => `<div class="btn btn-center">\n  ${a}\n</div>`,
  );
}

function startsWithHtmlBlock(line) {
  const trimmed = line.trimStart();
  return HTML_BLOCK_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

function wrapBareParagraphs(body) {
  // 段落 = 空行で区切られたチャンク。HTML 要素で始まるチャンクは触らない。
  const chunks = body.split(/\n{2,}/);
  return chunks
    .map((chunk) => {
      const trimmed = chunk.trim();
      if (trimmed === "") return "";
      // HTML タグで始まる、または閉じタグで終わる構造化チャンクはそのまま。
      if (startsWithHtmlBlock(trimmed)) return chunk;
      // 改行を含むプレーンテキスト段落 → 改行を保持しつつ <p> でラップ。
      return `<p>${applyInlineStrong(trimmed)}</p>`;
    })
    .join("\n\n");
}

function tidy(body) {
  return body.replace(/\n{3,}/g, "\n\n").replace(/^\s+/, "").replace(/\s+$/, "");
}

function buildHtmlBody(meta) {
  const { id, slug, intent, title_cta } = meta;
  const stagedPath = resolve(ROOT, "03_content", slug, "article_staged.md");
  let body = readFileSync(stagedPath, "utf8");

  body = stripFrontmatter(body);

  // PR 置換：冒頭にラグジュアリー免責 (<div class="nth-box-luxury"> や 【NOTICE） が
  // 既にあれば、Markdown "> 本記事..." PR ブロックを THOR 黄色枠で置換する処理はスキップ。
  // それ以外は従来通り最初の PR 行群を THOR 黄色枠へ。
  if (!hasLuxuryNotice(body)) {
    body = replaceFirstPrBlockquote(body);
  }

  // 見出し → 引用 → CTA → 段落の順で構造を確定。
  body = convertMarkdownHeadings(body);
  body = convertBlockquotes(body);
  body = wrapBareCtas(body);
  body = wrapBareParagraphs(body);
  body = tidy(body);

  // 末尾 CTA: 既存 concierge リンクが本文中にあれば重ね打ちしない。
  const hasInlineCta = new RegExp(
    `app\\.vodnavi\\.jp\\/concierge\\?source=moterist&intent=${intent}`,
  ).test(body);
  if (!hasInlineCta) {
    body += buildTailCta(intent, title_cta);
  }
  body += "\n";

  const outDir = resolve(ROOT, "07_wp", "staged_html");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, `${id}.html`);
  writeFileSync(outPath, body, "utf8");
  return {
    id,
    slug,
    intent,
    bytes: body.length,
    inline_cta: hasInlineCta,
    path: outPath,
  };
}

const results = ARTICLES.map(buildHtmlBody);
console.log(JSON.stringify(results, null, 2));
