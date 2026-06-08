import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { buildConciergeHandoffUrl } from "@/lib/concierge-handoff";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const contentPath = path.join(process.cwd(), "03_content", slug, "article.md");
  if (!fs.existsSync(contentPath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(contentPath, "utf8");
  const body = stripFrontmatter(fileContent);

  return (
    <main className="min-h-screen bg-brand-dark px-4 py-16 sm:py-24">
      <article
        className="vodnavi-article mx-auto max-w-3xl text-brand-text-secondary"
        dangerouslySetInnerHTML={{ __html: mdToHtml(body) }}
      />
      {/* design-tokens.css の CSS 変数のみ使用（hardcoded hex を排除し canonical 値に整合）。
          dangerouslySetInnerHTML で生成した記事要素は Tailwind utility で狙えないため、
          スコープした style で brand トークンに紐付ける。 */}
      <style>{`
        .vodnavi-article { font-family: var(--font-luxury-body); line-height: 1.9; }
        .vodnavi-article h1 { color: var(--brand-text-primary); font-family: var(--font-luxury-heading); font-size: 2.25rem; margin: 0 0 2rem; }
        .vodnavi-article h2 { color: var(--brand-gold); font-family: var(--font-luxury-heading); font-size: 1.5rem; margin: 2.5rem 0 1rem; border-bottom: 1px solid var(--brand-gold); padding-bottom: 0.5rem; }
        .vodnavi-article h3 { color: var(--brand-gold); font-family: var(--font-luxury-heading); font-size: 1.2rem; margin: 2rem 0 0.75rem; }
        .vodnavi-article p { margin: 0 0 1.5rem; text-align: justify; }
        .vodnavi-article a { color: var(--brand-gold); text-decoration: underline; font-weight: 600; }
        .vodnavi-article a:hover { color: var(--brand-dark); background-color: var(--brand-gold); }
        .vodnavi-article strong { color: var(--brand-text-primary); font-weight: 700; }
        .vodnavi-article em { font-style: italic; }
        .vodnavi-article ul { margin: 0 0 1.5rem 1.5rem; list-style: disc; }
        .vodnavi-article li { margin: 0 0 0.5rem; }
        .vodnavi-article blockquote { border-left: 4px solid var(--brand-gold); padding: 1rem; margin: 1.5rem 0; background: var(--brand-surface); color: var(--brand-text-primary); font-style: italic; }
        .vodnavi-article img { max-width: 100%; height: auto; border-radius: var(--brand-radius-card); margin: 1.5rem 0; }
      `}</style>

      {/* 送客動線 (T-20260608-x3): clean 教養コラム末尾から app.vodnavi.jp の AI コンシェルジュへ。
          境界SAFE: `buildConciergeHandoffUrl` は source/intent のみ付与（作品固有の成人 param なし）。
          成人文脈・18禁確認は app 側の年齢ゲート (proxy.ts) に委ねるため、clean 面では adult シグナルを
          出さない。トーンを崩さない控えめな `btn-luxury-outline`（既存 design-token クラス）を使用。 */}
      <div className="mx-auto max-w-3xl text-center">
        <hr className="luxury-hr-gold" />
        <p className="mb-6 text-sm leading-relaxed text-brand-text-secondary">
          作品選びに迷ったら、VODNAVI の AI コンシェルジュが今の気分から最適な一本をご案内します。
        </p>
        <a
          href={buildConciergeHandoffUrl({ source: "brand" })}
          className="btn-luxury-outline"
        >
          AI コンシェルジュに相談する
        </a>
      </div>
    </main>
  );
}

/** 先頭の `---` フロントマターブロックを除去（無ければ素通し）。 */
function stripFrontmatter(md: string): string {
  if (md.startsWith("---")) {
    const end = md.indexOf("\n---", 3);
    if (end !== -1) {
      const nl = md.indexOf("\n", end + 1);
      return nl !== -1 ? md.slice(nl + 1) : "";
    }
  }
  return md;
}

/** raw HTML を無害化（記事は信頼コンテンツだが XSS 表面を残さない）。属性安全のため `"`/`'` も escape。 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** インライン記法（escape 後に適用）: 画像 / リンク / 太字 / 斜体。 */
function inline(text: string): string {
  let t = escapeHtml(text);
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" />');
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return t;
}

/**
 * 依存追加を避けた軽量ブロックパーサ（見出し H1-H3 / 引用 / 箇条書き / 段落）。
 * 旧 `convertSimpleMarkdownToHtml`（h1/h2/blockquote/link/改行のみ）の置換。
 * フル CommonMark が必要になれば react-markdown + rehype-sanitize を `npm install` して移行する。
 */
function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      out.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`);
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      flushPara();
      flushList();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^###\s+(.+)$/))) {
      flushPara();
      flushList();
      out.push(`<h3>${inline(m[1])}</h3>`);
    } else if ((m = line.match(/^##\s+(.+)$/))) {
      flushPara();
      flushList();
      out.push(`<h2>${inline(m[1])}</h2>`);
    } else if ((m = line.match(/^#\s+(.+)$/))) {
      flushPara();
      flushList();
      out.push(`<h1>${inline(m[1])}</h1>`);
    } else if ((m = line.match(/^>\s+(.+)$/))) {
      flushPara();
      flushList();
      out.push(`<blockquote>${inline(m[1])}</blockquote>`);
    } else if ((m = line.match(/^[-*]\s+(.+)$/))) {
      flushPara();
      list.push(m[1]);
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();
  return out.join("\n");
}

export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), "03_content");
  if (!fs.existsSync(contentDir)) return [];
  return fs.readdirSync(contentDir).map((slug) => ({ slug }));
}
