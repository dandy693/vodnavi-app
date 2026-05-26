import type { MetadataRoute } from "next";

import { absoluteUrl, getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // プレビュー/開発デプロイは検索エンジンから完全に遮断する。
  // Vercel は production デプロイで VERCEL_ENV="production"、それ以外で
  // "preview" または "development" を build-time に注入する。
  // 本番以外で sitemap も emit しない (preview を index 候補に乗せない)。
  const isProduction = process.env.VERCEL_ENV === "production";
  if (!isProduction) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
