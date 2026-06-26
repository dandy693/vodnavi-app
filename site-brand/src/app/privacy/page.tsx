import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "VODNAVI（vodnavi.jp）のプライバシーポリシー。アクセス解析（GA4）と Cookie の取り扱いについて。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
        PRIVACY POLICY
      </p>
      <h1 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
        プライバシーポリシー
      </h1>

      <div className="mt-12 space-y-10 text-sm leading-relaxed text-brand-text-secondary sm:text-base">
        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            1. 情報の取り扱いについて
          </h2>
          <p>
            VODNavi運営事務局（運営会社：合同会社トレンドネット、以下「当事務局」）は、
            ユーザーのアクセス情報の取り扱いについて、本ポリシーに基づき適切な管理に努めます。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            2. アクセス解析ツールの利用
          </h2>
          <p>
            当事務局が運営する Web サイト（vodnavi.jp および app.vodnavi.jp）では、
            サイトの利用状況の把握・改善のため、Google Analytics 4（GA4）を利用しています。
            GA4 は Cookie を使用して匿名のトラフィックデータを収集します。
            収集されるデータは匿名であり、これにより個人を特定する情報は取得しません。
          </p>
          <p>
            また、流入元（アトリビューション）の把握とコンバージョン計測の適正化のため、
            ファーストパーティ Cookie「vodnavi_source」（有効期限 30 日間）を発行・利用する場合があります。
            この Cookie は流入経路を示す識別子のみを保持し、個人の特定や機微情報の収集は行いません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            3. Cookie の無効化
          </h2>
          <p>
            ユーザーはブラウザの設定を変更することで Cookie の受け入れを拒否できます。
            また、Google が提供するオプトアウト アドオンによっても GA4 によるデータ収集を
            無効化できます。設定方法の詳細は、お使いのブラウザのヘルプをご参照ください。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            4. お問い合わせ・改定
          </h2>
          <p>
            本ポリシーに関するお問い合わせ、および保有する情報の開示・訂正・削除等のご請求は
            contact@vodnavi.jp までご連絡ください。本ポリシーは、必要に応じて改定されることがあります。
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
