import type { Metadata, Viewport } from "next";
import { Geist_Mono, Noto_Sans_JP, Cormorant_Garamond } from "next/font/google";

import { GoogleAnalytics } from "@/components/google-analytics";
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
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
        {children}
        <GoogleAnalytics
          measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
        />
      </body>
    </html>
  );
}
