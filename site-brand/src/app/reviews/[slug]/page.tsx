import type { Metadata } from "next";

// 準備中スタブ（BRIEF_071）。レビュー記事本文確定まで noindex。
export const metadata: Metadata = {
  title: "レビュー",
  robots: { index: false, follow: true },
};

export default function ReviewSlugPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
      <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
        REVIEW
      </p>
      <h1 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
        レビュー
      </h1>
      <p className="mt-10 text-sm leading-relaxed text-brand-text-secondary">
        このページは準備中です。
      </p>
    </main>
  );
}
