import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "AI 相談窓口（コンシェルジュ）",
  description:
    "今夜の気分や悩みを伝えるだけで、VODNAVI の AI コンシェルジュが FANZA から最適な一本を提案します。",
  alternates: { canonical: absoluteUrl("/concierge") },
  openGraph: {
    title: "AI 相談窓口 | VODNAVI",
    description:
      "AI コンシェルジュがあなたの今夜の気分に合わせて FANZA から一本を選びます。",
    url: absoluteUrl("/concierge"),
    type: "website",
    locale: "ja_JP",
    siteName: "VODNAVI",
    // ルートで生成している opengraph-image を明示的に参照
    // （子セグメントが openGraph を定義すると親の images は継承されないため）。
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "VODNAVI — AI コンシェルジュ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 相談窓口 | VODNAVI",
    description:
      "AI コンシェルジュがあなたの今夜の気分に合わせて FANZA から一本を選びます。",
    images: ["/twitter-image"],
  },
};

export default function ConciergeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {/* main は 100dvh - header(3.5rem) を確保し、フッターは表示しない */}
      <main className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden">
        {children}
      </main>
    </>
  );
}
