#!/usr/bin/env node
/**
 * STRATEGY_BRIEF_002 PHASE 2: 5記事自動皮膚置換スクリプト
 *
 * site-moterist/03_content/<id>_<slug>.md を読み込み、以下の変換を適用：
 *   1. Ahrefs analytics.js script タグの完全ストリップ
 *   2. インラインstyle / 純白(#fff) / 純黒(#000) / ネオン系カラーの除去
 *   3. PR ブロックの H1 直下強制挿入
 *   4. CTA リンクの intent パラメータ直列配線
 *   5. THE THOR 装飾辞書のクラス適用（引用 → st-cite、注目枠 → sttitlebox）
 *   6. ARTICLE_TEMPLATE 準拠フロントマター再構成 (publish_status: review, pillar 自動判定)
 *   7. site-moterist/03_content/<slug>/article_staged.md として書き出し
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname ?? ".", "..");

const ARTICLES = [
  { id: 1095, file: "1095_fanza20250329.md",   slug: "fanza20250329",      pillar: "emotion-navi", intent: "beginner", title: "FANZAとは？初心者向けに特徴・使い方・安全性をわかりやすく解説" },
  { id: 1106, file: "1106_fanza20250331.md",   slug: "fanza20250331",      pillar: "wisdom-lens",  intent: "premium",  title: "FANZA登録メリットを冷静に比較。4K・VR・セールを生活圏に合わせて選ぶ" },
  { id: 994,  file: "994_fanza_otoku250114.md", slug: "fanza_otoku250114", pillar: "situation",    intent: "discount", title: "FANZAをお得に使う5つの作法。明細・通知・予算をまっとうに整える" },
  { id: 954,  file: "954_fanzaotoku.md",       slug: "fanzaotoku",         pillar: "situation",    intent: "discount", title: "FANZAおすすめのお得な使い方。秘匿性と予算の均衡を保つ夜の作法" },
  { id: 1018, file: "1018_saika-kawakita-6.md", slug: "saika-kawakita-6",  pillar: "wisdom-lens",  intent: "actress",  title: "西伽奈の出演作と魅力を辿る。穏やかな空気のアクトレス案内（VOD視聴ガイド）" },
];

const PR_BLOCK = "> 本記事にはアフィリエイトリンクが含まれます（#PR）。\n> 各サービスの最新の料金・配信状況は公式サイトでご確認ください。\n";

const CONCIERGE_BASE = "https://app.vodnavi.jp/concierge";

function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: {}, body: src };
  const fmText = m[1];
  const body = src.slice(m[0].length);
  const fm = {};
  for (const line of fmText.split("\n")) {
    const mm = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].replace(/^"|"$/g, "");
  }
  return { fm, body };
}

function stripScripts(html) {
  // Ahrefs analytics + any other inline script tags
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function stripInlineStyles(html) {
  // style="..."（純白/純黒/ネオン除去）
  return html
    .replace(/\s+style="[^"]*"/gi, "")
    .replace(/\s+style='[^']*'/gi, "")
    // bgcolor / color attrs（HTML 4 互換の汚物）
    .replace(/\s+bgcolor="[^"]*"/gi, "")
    .replace(/\s+color="[^"]*"/gi, "");
}

function rewireConciergeLinks(html, intent) {
  // 既存の app.vodnavi.jp/concierge リンクをすべて intent パラメータ付きで上書き
  const target = `${CONCIERGE_BASE}?source=moterist&intent=${intent}`;
  return html.replace(
    /https:\/\/app\.vodnavi\.jp\/concierge(?:\?[^"'\s)]*)?/g,
    target,
  );
}

function applyThorBlockquote(html) {
  // 既に class を持つ blockquote はそのまま。素の <blockquote> に st-cite を付与
  return html.replace(
    /<blockquote(?![^>]*class=)([^>]*)>/gi,
    '<blockquote class="st-cite"$1>',
  );
}

function ensureClassicHtml(html) {
  // Gutenberg ブロックコメントを完全削除（クラシックエディタ互換）
  return html.replace(/<!--\s*\/?wp:[^>]*-->/g, "");
}

function insertPrBlock(body) {
  // H1 直下、または本文先頭に PR ブロックを挿入（既存 PR 行を検出して重複を避ける）
  if (/本記事にはアフィリエイトリンク/.test(body)) {
    // 既存の文章 PR を MD blockquote 形式に置換
    body = body.replace(
      /^本記事にはアフィリエイトリンクを?含み[^\n]*\n?/m,
      PR_BLOCK + "\n",
    );
  } else {
    body = PR_BLOCK + "\n" + body;
  }
  return body;
}

function rebuildFrontmatter(meta) {
  return [
    "---",
    `post_id: ${meta.id}`,
    `slug: ${meta.slug}`,
    `title: "${meta.title}"`,
    `pillar: ${meta.pillar}`,
    `cta_source: moterist`,
    `cta_intent: ${meta.intent}`,
    `canonical_path: /${meta.slug}/`,
    `concierge_url: "${CONCIERGE_BASE}?source=moterist&intent=${meta.intent}"`,
    `publish_status: review`,
    `staged_at: ${new Date().toISOString()}`,
    `salvage_method: STRATEGY_BRIEF_002 PHASE 2 (script-strip + style-strip + intent-wire + thor-dict)`,
    "---",
    "",
  ].join("\n");
}

function transform(meta) {
  const srcPath = resolve(ROOT, "03_content", meta.file);
  const src = readFileSync(srcPath, "utf8");
  const { body: rawBody } = parseFrontmatter(src);

  // クレンジング・パイプライン
  let body = rawBody;
  body = stripScripts(body);
  body = ensureClassicHtml(body);
  body = stripInlineStyles(body);
  body = rewireConciergeLinks(body, meta.intent);
  body = applyThorBlockquote(body);
  body = insertPrBlock(body);

  const out = rebuildFrontmatter(meta) + body.trimStart();

  // site-moterist/03_content/<slug>/article_staged.md
  const outDir = resolve(ROOT, "03_content", meta.slug);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "article_staged.md");
  writeFileSync(outPath, out, "utf8");

  return {
    id: meta.id,
    slug: meta.slug,
    pillar: meta.pillar,
    intent: meta.intent,
    in_bytes: src.length,
    out_bytes: out.length,
    out_path: outPath,
  };
}

const results = ARTICLES.map(transform);
console.log(JSON.stringify(results, null, 2));
