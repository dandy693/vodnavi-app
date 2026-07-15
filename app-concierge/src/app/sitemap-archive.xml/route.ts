/**
 * D1: 旧作 works アーカイブサイトマップ（/sitemap-archive.xml）。
 *
 * Supabase の累積テーブルのみを読む（FANZA API コール 0）。既存の /sitemap.xml は
 * 一切変更しない。robots.ts が両サイトマップを宣言してクローラに自動発見させる。
 * Supabase 障害・env 未配線時は空の整形式 urlset を返し、本体サイトマップへ影響しない。
 *
 * <loc> の URL は /works/{floor_code}/{content_id}（英数字・ハイフン・アンダースコア）
 * のみで構成され `&` を含まないため XML エスケープ問題（project_app_sitemap_parse_error
 * の再発）は構造的に発生しない。
 */
import { fetchSitemapArchiveRows } from "@/lib/fanza/sitemap-archive";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const rows = await fetchSitemapArchiveRows();

  const urls = rows
    .map((row) => {
      const loc = absoluteUrl(`/works/${row.floor_code}/${row.content_id}`);
      const lastmod = row.released_at ?? row.last_seen_at;
      return `<url><loc>${loc}</loc><lastmod>${new Date(lastmod).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`;
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
