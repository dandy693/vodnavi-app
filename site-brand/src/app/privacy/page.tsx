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
            1. アクセス解析ツールについて
          </h2>
          <p>
            当サイトは、サイトの分析・改善のため Google Analytics 4（以下「GA4」）を
            利用しています。GA4 は Cookie を使用して匿名のトラフィックデータを収集します。
            収集されるデータは匿名であり、これにより個人を特定する情報は取得しません。
          </p>
          <p>
            Cookie の利用はブラウザの設定により無効化できます。また、Google が提供する
            オプトアウト アドオンによっても GA4 によるデータ収集を無効化できます。
          </p>
          {/* 注: トップページ page.tsx の記載「第三者への送信は GA4 の匿名計測のみ」と整合させる。
              クロスドメイン計測の具体的機構（_gl リンカー等）は実態が未確定のため、
              本番公開する確定文言は §3 の HUMAN/リーガル提供テキストに委ねる。捏造しない。 */}
          <p>
            なお、第三者への送信は GA4 の匿名計測の範囲に限られ、クレジットカード情報・
            個人情報は当サイトを経由しません。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            2. 運営者・お問い合わせ
          </h2>
          <p>
            本サイトの運営者は合同会社トレンドネットです。本ポリシーに関するお問い合わせは
            contact@vodnavi.jp までご連絡ください。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-luxury-heading text-xl text-brand-text-primary">
            3. 詳細条文（確定待ち）
          </h2>
          <div className="rounded-lg border border-dashed border-brand-gold/40 bg-brand-surface/40 p-5 text-center text-brand-text-secondary/80">
            [要 HUMAN/リーガル確定: 取得する情報の範囲、利用目的、保存期間、第三者提供、
            Cookie の詳細なオプトアウト手順、開示・訂正・削除請求の窓口、改定履歴などの
            正式な条文をここに展開してください。技術的な計測仕様（クロスドメイン計測の
            有無等）は実装の物理確認後に確定文言を記載すること。]
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
