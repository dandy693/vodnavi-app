import type { Metadata } from "next";

// 準備中スタブ（BRIEF_071）。E-E-A-T の編集ポリシー本文確定まで noindex。
export const metadata: Metadata = {
  title: "編集ポリシー",
  description:
    "VODNAVI（vodnavi.jp）の編集ポリシー。品質基準・査読体制・広告との分離方針。",
  alternates: { canonical: "/editorial-policy" },
  robots: { index: false, follow: true },
};

export default function EditorialPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
      <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
        EDITORIAL POLICY
      </p>
      <h1 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
        編集ポリシー
      </h1>
      <p className="mt-10 text-sm leading-relaxed text-brand-text-secondary">
        VODNAVI は、AI による解析と人間の専門家による査読を組み合わせた編集体制で
        運営されます。広告と編集コンテンツは明確に分離し、根拠なき誇大表現を排します。
      </p>
      <p className="mt-6 text-xs text-brand-text-secondary/70">
        （正式な編集ポリシー本文は準備中です。）
      </p>
    </main>
  );
}
