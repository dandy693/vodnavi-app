import type { Metadata } from "next";

import { LegalLayout, Section } from "@/components/legal-layout";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "VODNAVI における個人情報の取り扱い、Cookie の使用、アフィリエイトプログラムの開示、第三者配信に関するプライバシーポリシー。",
  alternates: { canonical: absoluteUrl("/privacy") },
  openGraph: {
    title: "プライバシーポリシー | VODNAVI",
    description:
      "VODNAVI における個人情報・Cookie・アフィリエイトプログラムの取扱方針。",
    url: absoluteUrl("/privacy"),
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="PRIVACY POLICY"
      title="プライバシーポリシー"
      updatedAt="2026年5月11日"
    >
      <Section heading="1. 個人情報の取り扱い">
        <p>
          VODNAVI（以下「当サイト」）は、お問い合わせフォーム等を通じて取得した
          お名前・メールアドレス・お問い合わせ内容を、ご返答およびサービス改善以外の目的では使用しません。
          取得した個人情報はご本人の同意なく第三者に提供することはありません。
        </p>
      </Section>

      <Section heading="2. Cookie の使用">
        <p>
          当サイトでは、ユーザー体験の向上およびアクセス解析のため、Cookie
          および類似技術を使用する場合があります。ブラウザの設定により Cookie
          の受け取りを拒否することができますが、その場合一部機能が利用できなくなる可能性があります。
        </p>
      </Section>

      <Section heading="3. アフィリエイトプログラムについて">
        <p>
          当サイトは
          <span className="px-1 text-foreground">FANZA</span>
          公式アフィリエイトプログラムに参加しており、紹介リンク経由で
          ユーザーが商品を購入・契約した際に紹介料を受け取ることがあります。
          紹介料の発生有無は商品の価格・レビュー等の表示内容に影響を与えません。
        </p>
      </Section>

      <Section heading="4. 第三者配信の広告サービスについて">
        <p>
          当サイトでは、将来的に第三者配信の広告サービス（Google AdSense
          等）を利用する場合があります。これらの広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、
          当サイトや他サイトへのアクセス情報を Cookie
          を用いて取得します。当該 Cookie には個人を特定する情報は含まれません。
        </p>
        <p>
          Google による Cookie の使用を無効にする方法は{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:underline"
          >
            Google 広告設定ページ
          </a>{" "}
          をご確認ください。
        </p>
      </Section>

      <Section heading="5. アクセス解析ツールについて">
        <p>
          当サイトでは将来的に Google アナリティクス等のアクセス解析ツールを利用する場合があります。
          これらのツールはトラフィックデータの収集のために Cookie
          を使用します。データは匿名で収集されており、個人を特定するものではありません。
        </p>
      </Section>

      <Section heading="6. プライバシーポリシーの変更">
        <p>
          本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、
          ユーザーに通知することなく変更することがあります。変更後のプライバシーポリシーは、
          当サイトに掲載したときから効力を生じるものとします。
        </p>
      </Section>

      <Section heading="7. お問い合わせ">
        <p>
          本ポリシーに関するお問い合わせは、
          <a href="/contact" className="px-1 text-amber-300 hover:underline">
            お問い合わせフォーム
          </a>
          よりご連絡ください。
        </p>
      </Section>
    </LegalLayout>
  );
}
