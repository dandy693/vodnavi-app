import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "VODNAVI（vodnavi.jp）の利用規約。適用範囲・広告表記・免責事項について。",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
        TERMS OF SERVICE
      </p>
      <h1 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
        利用規約
      </h1>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-brand-text-secondary sm:text-base">
        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            第1条（適用）
          </h2>
          <p>
            本規約は、合同会社トレンドネットが運営するサイト「VODNAVI」（vodnavi.jp、
            以下「当サイト」）の利用条件を定めるものです。利用者は、当サイトを利用することにより、
            本規約に同意したものとみなされます。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            第2条（広告・アフィリエイト）
          </h2>
          <p>
            当サイトは、アフィリエイト広告（FANZA 等）を含みます。最終的な視聴・購入・契約は、
            リンク先の公式サイトにて行われ、料金・配信状況・キャンペーン内容は変動するため、
            最新情報は必ず公式サイトでご確認ください。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            第3条以降（確定待ち）
          </h2>
          <div className="rounded-lg border border-dashed border-brand-gold/40 bg-brand-surface/40 p-5 text-center text-brand-text-secondary/80">
            [要 HUMAN/リーガル確定: 免責事項、禁止事項、知的財産権、サービスの変更・中断、
            準拠法および管轄裁判所、規約の変更手続きなどの正式な条文をここに展開してください。]
          </div>
        </section>
      </div>

      <div className="mt-16">
        <a href="/" className="btn-luxury-outline" aria-label="トップへ戻る">
          ← トップへ戻る
        </a>
      </div>
    </main>
  );
}
