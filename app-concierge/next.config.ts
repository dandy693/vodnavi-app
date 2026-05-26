import type { NextConfig } from "next";

const CANONICAL_HOST = "app.vodnavi.jp";
const VERCEL_ALIAS_HOST = "vodnavi-app.vercel.app";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pics.dmm.co.jp" },
      { protocol: "https", hostname: "pics.dmm.com" },
      { protocol: "https", hostname: "awsimgsrc.dmm.co.jp" },
      { protocol: "https", hostname: "p1.dmm.co.jp" },
      { protocol: "https", hostname: "doc.dmm.co.jp" },
    ],
  },
  async redirects() {
    return [
      {
        // SEO の重複コンテンツ回避：vercel.app の本番エイリアスへの全リクエストを
        // 正規ドメイン (app.vodnavi.jp) に 301 で集約する。
        source: "/:path*",
        has: [{ type: "host", value: VERCEL_ALIAS_HOST }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // 防壁: vercel.app のプレビューデプロイ(branch / commit 単位の
      // vodnavi-app-git-xxxx.vercel.app など)が誤クロールされ Vercel CPU を
      // 燃焼させていた経路を遮断する。host 正規表現で .vercel.app 全般を捕捉し、
      // X-Robots-Tag で完全 noindex/nofollow を強制する。正規ホストの
      // app.vodnavi.jp には適用されない (前段の host redirect で正規化されるため)。
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
