/**
 * AH(rev10/承認2026-07-30): /sitemap.xml の route handler 化。
 *
 * 旧実装(metadata route `src/app/sitemap.ts`)は `export const revalidate = 3600` の
 * 宣言がビルド manifest に反映されず(manifest 表示 5m)、ランタイム再検証が一度も
 * 着地しない実測(生成時刻がデプロイのビルド窓に固定・Age 4.4日連続増・
 * Last-Modified+filename 付き=静的アセット配信のヘッダ特徴)があった。
 * 実証済みの route handler 経路(sitemap-archive.xml と同型・ランタイム再検証の
 * 着地を2回実証)へ移行する。公開 URL は /sitemap.xml のまま不変(承認条件2)。
 *
 * - revalidate=3600 を明示(承認条件3: 5分にしない=1回の再生成は FANZA API 16 呼出)
 * - 生成ロジックは `@/lib/sitemap-builder` へ移設した現行実装のまま(API ベース維持)
 * - XML 形式は旧 metadata route の serializer 出力と同一(loc/lastmod/changefreq/priority)
 * - ロールバック=本 PR の revert(承認条件6)
 */
import { buildSitemapEntries } from "@/lib/sitemap-builder";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const entries = await buildSitemapEntries();

  const urls = entries
    .map((e) => {
      const lastmod =
        e.lastModified instanceof Date
          ? e.lastModified.toISOString()
          : new Date(e.lastModified ?? Date.now()).toISOString();
      const parts = [`<loc>${e.url}</loc>`, `<lastmod>${lastmod}</lastmod>`];
      if (e.changeFrequency)
        parts.push(`<changefreq>${e.changeFrequency}</changefreq>`);
      if (e.priority !== undefined)
        parts.push(`<priority>${e.priority}</priority>`);
      return `<url>\n${parts.join("\n")}\n</url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
