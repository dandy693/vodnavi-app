import type { Metadata, Viewport } from "next";
import { Geist_Mono, Noto_Sans_JP, Cormorant_Garamond } from "next/font/google";

import { GoogleAnalytics } from "@/components/google-analytics";
import { GoogleTagManager } from "@/components/google-tag-manager";
import { getSiteUrl } from "@/lib/site";

import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "VODNAVI — 今夜の極上に、最短ルートで",
    template: "%s | VODNAVI",
  },
  description:
    "FANZA から厳選した最新作・話題作を、価格・レビュー・新着ですぐ見つけられる VOD ナビゲーション。スマホ最適化、ワンタップで視聴開始。",
  keywords: ["VOD", "FANZA", "アフィリエイト", "動画", "新作", "ランキング"],
  alternates: { canonical: "/" },
  // icons / manifest は Next.js App Router の file-convention auto-detect に委譲：
  //   - app/icon.svg → <link rel="icon" type="image/svg+xml" ...> を自動 emit
  //   - 追加で apple-icon.png や manifest.webmanifest を app/ 配下に置けば自動拾い上げ
  // 旧 metadata 明示参照は public/ 不在ファイルへの 404 を量産していたため撤去。
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "VODNAVI",
    title: "VODNAVI — 今夜の極上に、最短ルートで",
    description:
      "FANZA から厳選した最新作・話題作を、価格・レビュー・新着ですぐ見つけられる VOD ナビゲーション。",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "VODNAVI",
    description:
      "FANZA から厳選した最新作・話題作を、価格・レビュー・新着ですぐ見つける VOD ナビゲーション。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`dark ${notoSansJP.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/* GTM noscript iframe は body 最初の子要素として配置する GTM 公式仕様準拠。
           インライン GTM ローダ script は <Script afterInteractive> で hydration 後に
           注入されるため LCP には影響しない。NEXT_PUBLIC_GTM_ID 未設定 / 非本番では
           コンテナ自体をマウントしないので noscript も emit されない。 */}
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        {children}
        <GoogleAnalytics
          measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
        />
      </body>
    </html>
  );
}
