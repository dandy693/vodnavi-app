/**
 * BRIEF_128 コホート1 サイトマップ（/sitemap-cohort-1.xml）。
 *
 * `sitemap-archive.xml` と同型の独立 route handler。**既存の `/sitemap.xml` と
 * `/sitemap-archive.xml` には一切変更を加えない**（`sitemap-builder.ts` を import しない）。
 * `robots.ts` が3本のサイトマップを宣言してクローラに自動発見させる。
 *
 * `<loc>` の URL は `/works/{floor_code}/{content_id}`（英数字・ハイフン・アンダースコア）
 * のみで構成され `&` を含まないため XML エスケープ問題（`project_app_sitemap_parse_error`
 * の再発）は構造的に発生しない。
 *
 * `lastmod` は `released_at`（作品の配信日）。コホート1 は全 5,000 行が `released_at` を
 * 持つ（2026-08-21 実測・null 0件）ため、`sitemap-archive.xml` のような
 * `last_seen_at` へのフォールバックは設けない。
 */
import { fetchSitemapCohortRows } from "@/lib/fanza/sitemap-cohort";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const COHORT_NO = 1;

export async function GET(): Promise<Response> {
  const rows = await fetchSitemapCohortRows(COHORT_NO);

  const urls = rows
    .filter((row) => row.released_at)
    .map((row) => {
      const loc = absoluteUrl(`/works/${row.floor_code}/${row.content_id}`);
      const lastmod = new Date(row.released_at as string).toISOString();
      return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
