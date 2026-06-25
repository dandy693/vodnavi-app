import type { Metadata } from "next";

// 準備中スタブ（BRIEF_071）。編集ジャンル記事（app側DBとは分離）本文確定まで noindex。
export const metadata: Metadata = {
  title: "ジャンル",
  robots: { index: false, follow: true },
};

export default function GenreSlugPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
      <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
        GENRE
      </p>
      <h1 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
        ジャンル
      </h1>
      <p className="mt-10 text-sm leading-relaxed text-brand-text-secondary">
        このページは準備中です。
      </p>
    </main>
  );
}
