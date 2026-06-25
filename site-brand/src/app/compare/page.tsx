import type { Metadata } from "next";

// クリーン編集ハブ（BRIEF_071 §4 準拠）。vodnavi.jp は clean 集客面。
// 本文は純粋に VOD・映像文化の観点で比較編集を展開し、年齢制限コンテンツや
// アフィリエイト訴求語は一切置かない。CTA で app.vodnavi.jp の AI コンシェルジュへ
// 送客し、年齢確認は app 側で処理する。index:true で集客資産化。
export const metadata: Metadata = {
  title: "VOD 比較ガイド — あなたの夜の書斎にふさわしい映像ライブラリ",
  description:
    "動画配信サービス（VOD）を、料金や機能だけでなく作品性・映像文化の観点から比較・分析。あなたの時間を委ねるにふさわしいライブラリの選び方を、VODNAVI 編集部が静かに案内します。",
  alternates: { canonical: "/compare" },
  robots: { index: true, follow: true },
};

export default function CompareHubPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
        EDITORIAL / COMPARE
      </p>
      <h1 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
        映像の書斎へ、ようこそ
      </h1>
      <p className="mt-3 text-sm italic text-brand-text-secondary/80">
        ── 選び方の美学。あなたの時間を、どのライブラリに委ねるか。
      </p>

      <section className="mt-12 space-y-6 text-sm leading-relaxed text-brand-text-secondary">
        <p>
          動画配信サービス（VOD）の選択は、単なる料金表の比較に留まりません。それは、
          かけがえのない夜の時間をどの「書斎」に預けるかという、ひとつの審美的な意思決定です。
          作品のラインナップ、画質と音質、検索の知性、そして何より「出会いの質」。
          VODNAVI 編集部は、それらを静かに、しかし冷徹に見極めます。
        </p>
        <p>
          私たちは派手な煽りや根拠なき断定を排します。代わりに、あなたがまだ言葉にできていない
          「観たい気分」に寄り添い、その輪郭をともに描くことを大切にしています。
          比較とは優劣の宣告ではなく、あなた自身の感性を映す鏡なのです。
        </p>
      </section>

      <section className="mt-12 rounded border border-brand-gold/40 bg-black/20 p-8">
        <h2 className="font-luxury-heading text-xl text-brand-gold">
          言葉にならない「気分」から探す
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-brand-text-secondary">
          作品名やジャンルが定まっていなくても構いません。今夜の気分を伝えるだけで、
          AI コンシェルジュがあなたにふさわしい一作へと案内します。
        </p>
        <div className="mt-8">
          <a
            href="https://app.vodnavi.jp/concierge?source=brand_compare_hub"
            className="btn-luxury-outline"
            aria-label="AI コンシェルジュに相談する"
          >
            AI コンシェルジュに相談する →
          </a>
        </div>
      </section>

      <div className="mt-16">
        <a href="/" className="text-sm text-brand-gold underline" aria-label="トップへ戻る">
          ← トップへ戻る
        </a>
      </div>
    </main>
  );
}
