import type { Metadata } from "next";

// 準備中スタブ（BRIEF_071 メディア層スキャフォールド）。本文確定までは noindex で
// インデックス汚染を防ぐ。運営法人・連絡先の正本は /about（本番 deploy 済の検証値
// 「合同会社トレンドネット」）に一致させ、ここでは新規法人情報を捏造しない。
export const metadata: Metadata = {
  title: "免責事項",
  description: "VODNAVI（vodnavi.jp）の免責事項・広告表記。",
  alternates: { canonical: "/disclaimer" },
  robots: { index: false, follow: true },
};

export default function DisclaimerPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
      <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
        DISCLAIMER
      </p>
      <h1 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
        免責事項
      </h1>
      <p className="mt-10 text-sm leading-relaxed text-brand-text-secondary">
        当サイトは、アフィリエイト広告を含みます。掲載情報の正確性には努めますが、
        料金・配信状況・キャンペーン内容は変動するため、最新情報は必ず各公式サイトで
        ご確認ください。運営者情報・連絡先は{" "}
        <a href="/about" className="text-brand-gold underline">
          運営者情報
        </a>{" "}
        をご参照ください。
      </p>
      <p className="mt-6 text-xs text-brand-text-secondary/70">
        （本ページは準備中です。正式な本文を順次掲載します。）
      </p>
    </main>
  );
}
