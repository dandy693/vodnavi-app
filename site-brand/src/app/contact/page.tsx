import type { Metadata } from "next";

// 準備中スタブ（BRIEF_071）。本文確定まで noindex。連絡先の正本は /about に一致。
export const metadata: Metadata = {
  title: "お問い合わせ",
  description: "VODNAVI（vodnavi.jp）へのお問い合わせ。",
  alternates: { canonical: "/contact" },
  robots: { index: false, follow: true },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
      <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
        CONTACT
      </p>
      <h1 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
        お問い合わせ
      </h1>
      <p className="mt-10 text-sm leading-relaxed text-brand-text-secondary">
        お問い合わせは{" "}
        <a href="mailto:contact@vodnavi.jp" className="text-brand-gold underline">
          contact@vodnavi.jp
        </a>{" "}
        まで（業務時間：平日 10:00–18:00 JST）。
      </p>
      <p className="mt-6 text-xs text-brand-text-secondary/70">
        （フォームは準備中です。当面はメールにて承ります。）
      </p>
    </main>
  );
}
