import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const SITE_URL = "https://vodnavi.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // index:true の固定ルートのみ手動列挙する。
  // /guide /reviews /genres /actresses /authors は robots:{index:false} のため
  // sitemap には含めない（noindex ページを sitemap に載せるのは整合性矛盾）。
  // /compare は genuine clean(index:true) へ昇格済（T-20260625-06）＝収録。
  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  // 03_content/{slug}/article.md の各記事を動的網羅（[slug]/page.tsx の
  // generateStaticParams と同じ fs スキャン流儀）。これらは index:true の編集記事/
  // サルベージ記事。wordpress-sango-review もここで 1 回だけ収録し、固定列挙との
  // 二重計上を避ける。
  try {
    const contentDir = path.join(process.cwd(), "03_content");
    if (fs.existsSync(contentDir)) {
      for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        routes.push({
          url: `${SITE_URL}/${entry.name}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("[sitemap] dynamic generation error:", error);
  }

  return routes;
}
