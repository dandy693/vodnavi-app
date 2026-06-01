import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // 物理ディスク上の Markdown ファイルへの絶対パスを構築
  const contentPath = path.join(process.cwd(), '03_content', slug, 'article.md');

  if (!fs.existsSync(contentPath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(contentPath, 'utf8');

  // フロントマターと本文のミニマルな分離（仕様に適合させるためのプレースホルダーパース）
  const parts = fileContent.split('---');
  const bodyText = parts.length >= 3 ? parts.slice(2).join('---') : fileContent;

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] px-4 py-12 font-serif">
      <article className="max-w-3xl mx-auto space-y-6 leading-relaxed">
        <div className="prose prose-invert max-w-none">
          {/* 世界観『ビブリア・エロティカ』に準拠したプレミアムホワイトとシャンパンゴールドのインジェクション */}
          <style dangerouslySetInnerHTML={{ __html: `
            h1 { color: #D4AF37; font-size: 2.25rem; margin-bottom: 2rem; font-family: serif; }
            h2 { color: #D4AF37; font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 1rem; border-bottom: 1px solid #D4AF37; padding-bottom: 0.5rem; }
            p { margin-bottom: 1.5rem; text-align: justify; }
            a { color: #D4AF37; text-decoration: underline; font-weight: bold; }
            a:hover { color: #E0E0E0; background-color: #D4AF37; }
            blockquote { border-left: 4px solid #D4AF37; padding-left: 1rem; color: #E0E0E0; font-style: italic; margin: 1.5rem 0; background: #1E1E1E; padding: 1rem; }
          `}} />
          <div dangerouslySetInnerHTML={{ __html: convertSimpleMarkdownToHtml(bodyText) }} />
        </div>
      </article>
    </div>
  );
}

// 物理的な依存追加を排すため、インラインで必要最小限のHTML置換を処理するセーフ関数
function convertSimpleMarkdownToHtml(md: string): string {
  let html = md;
  // H1, H2, ブロッククォート、リンク、改行のプリミティブ変換
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^\s*$/gm, '<br/>');
  return html;
}

export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), '03_content');
  if (!fs.existsSync(contentDir)) return [];

  const dirs = fs.readdirSync(contentDir);
  return dirs.map((slug) => ({ slug }));
}
