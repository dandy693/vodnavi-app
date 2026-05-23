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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
