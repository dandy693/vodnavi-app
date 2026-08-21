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
    // D1: 本体(回転式・最新)とアーカイブ(累積・旧作)の2本を宣言し自動発見させる。
    // BRIEF_128: コホート1(価格帯層化5,000・status=live のみ配信)を3本目として追加
    // (CSO承認 2026-08-15 第57便 / 公開 2026-08-21 第86便)。
    // ロールバック第一手はこの行から3本目を外すこと(コード revert 不要)。
    sitemap: [
      absoluteUrl("/sitemap.xml"),
      absoluteUrl("/sitemap-archive.xml"),
      absoluteUrl("/sitemap-cohort-1.xml"),
    ],
    host: getSiteUrl(),
  };
}
