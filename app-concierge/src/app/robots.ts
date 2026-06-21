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
  const baseRule = { allow: "/", disallow: ["/api/", "/_next/"] };
  // 主要 AI 検索クローラーを明示的に許可し、LLMO の引用対象として意図を宣言する。
  // 既存の "*" でも実質許可されるが、個別 UA ルールで方針を明文化・将来調整可能にする。
  const aiCrawlers = [
    "GPTBot",
    "OAI-SearchBot",
    "PerplexityBot",
    "ClaudeBot",
    "Google-Extended",
  ];
  return {
    rules: [
      { userAgent: "*", ...baseRule },
      ...aiCrawlers.map((userAgent) => ({ userAgent, ...baseRule })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl(),
  };
}
