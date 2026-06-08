import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Cormorant_Garamond } from "next/font/google";

import { GoogleAnalytics } from "@/components/google-analytics";
import { GoogleTagManager } from "@/components/google-tag-manager";
import { SiteFooter } from "@/components/site-footer";

import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vodnavi.jp"),
  title: {
    default: "VODNAVI — 次世代映像検索 AI コンシェルジュ",
    template: "%s | VODNAVI",
  },
  description:
    "AI による映像解析と、人間の専門家による厳格な査読体制で運営される、次世代の VOD コンシェルジュ・サービス。VODNAVI 公式ブランドサイト。",
  alternates: { canonical: "/" },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "VODNAVI",
    title: "VODNAVI — 次世代映像検索 AI コンシェルジュ",
    description:
      "AI による映像解析と、人間の専門家による厳格な査読体制で運営される、次世代の VOD コンシェルジュ・サービス。",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "VODNAVI",
    description: "次世代映像検索 AI コンシェルジュ。VODNAVI 公式。",
  },
};

const SITE_URL = "https://vodnavi.jp";

// BRAND_DESIGN_GUIDE §3② の「公式の顔（身元引受人）」を schema.org として
// 機械可読化。@graph で Organization と WebSite を 1 ペイロードに集約。
// publisher 参照は @id で正規化、サブサービスは sameAs で関連付け。
const brandJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "VODNAVI",
      legalName: "合同会社トレンドネット",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
      description:
        "AI による映像解析と、人間の専門家による厳格な査読体制で運営される、次世代の VOD コンシェルジュ・サービス。",
      email: "contact@vodnavi.jp",
      sameAs: ["https://app.vodnavi.jp", "https://moterist.com"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "VODNAVI",
      inLanguage: "ja-JP",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* BRIEF_017 §2.1: localhost で production build を起動した場合の page_view leak
           遮断盾。GTM/GA より先に `ga-disable-G-GG7JV9MJRW` フラグを true にすることで
           本番 GA4 (G-GG7JV9MJRW) への送信をブラウザレイヤーで凍結する (Google 公式
           opt-out 機構)。W23 funnel 監査で localhost 1 PV 混入を物理確認、本盾で根絶。 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if (location.hostname === "localhost") { window["ga-disable-G-GG7JV9MJRW"] = true; }`,
          }}
        />
        {/* GTM noscript iframe を body 最初の子要素として配置する GTM 公式仕様準拠。
           NEXT_PUBLIC_GTM_ID 未設定 / 非本番ではコンテナ自体をマウントしない。
           [[project_funnel_drop_off_seo_to_concierge]] 監査で vodnavi.jp に
           GA4/GTM 双方が未挿入であることが判明し補完。app-concierge と同一構成。 */}
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
        />
        {children}
        <SiteFooter />
        <GoogleAnalytics
          measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
        />
      </body>
    </html>
  );
}
