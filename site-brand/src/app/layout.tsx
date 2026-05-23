import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Cormorant_Garamond } from "next/font/google";

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
