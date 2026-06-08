import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約",
  description:
    "VODNAVI（vodnavi.jp）の利用規約・免責事項。サービスの目的・免責・アフィリエイトの開示について。",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
        TERMS OF SERVICE
      </p>
      <h1 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
        利用規約・免責事項
      </h1>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-brand-text-secondary sm:text-base">
        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            1. サービスの目的
          </h2>
          <p>
            本サービス「VODNAVI」（vodnavi.jp）は、合同会社トレンドネットが運営する、
            AI 技術を活用した動画配信作品の情報検索・紹介を行う情報プラットフォームです。
            利用者は、当サイトを利用することにより本規約に同意したものとみなされます。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            2. 免責事項
          </h2>
          <p>
            当サイトに掲載される配信状況・料金・各種情報および紹介文面は、AI による自動解析および
            執筆時点のデータに基づいており、その正確性・最新性・完全性について当事務局は一切の保証を
            行いません。最終的な視聴・購入・契約は、リンク先の公式サイトにて行われます。
            各サービスの詳細な利用条件・料金は、必ずリンク先の公式サイトにてご確認ください。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            3. アフィリエイト・プログラムについて
          </h2>
          <p>
            当サイトは、各種配信サービスの公式アフィリエイト・紹介プログラムに参加しています。
            紹介経由で成約が発生した場合、当サイトに紹介報酬が支払われることがあります。
            これにより提供される情報の客観性が損なわれることはありません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            4. お問い合わせ・改定
          </h2>
          <p>
            本規約に関するお問い合わせは contact@vodnavi.jp までご連絡ください。
            本規約は、必要に応じて改定されることがあります。
          </p>
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
