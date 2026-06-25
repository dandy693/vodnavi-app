import type { Metadata } from "next";

// 親ハブの準備中スタブ（BRIEF_071）。/guide 直アクセスの 404 を解消。本文確定まで noindex。
export const metadata: Metadata = {
  title: "ガイド",
  robots: { index: false, follow: true },
};

export default function GuideHubPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
      <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
        GUIDE
      </p>
      <h1 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
        ガイドハブ
      </h1>
      <p className="mt-10 text-sm leading-relaxed text-brand-text-secondary">
        このインデックスは準備中です。
      </p>
    </main>
  );
}
