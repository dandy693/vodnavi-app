import type { Metadata } from "next";

import { LegalLayout, Section } from "@/components/legal-layout";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "免責事項",
  description:
    "VODNAVI における作品情報の正確性、リンク先サービス、著作権、年齢制限、アフィリエイトプログラムに関する免責事項。",
  alternates: { canonical: absoluteUrl("/disclaimer") },
  openGraph: {
    title: "免責事項 | VODNAVI",
    description:
      "VODNAVI における作品情報・リンク先・著作権・年齢制限に関する免責事項。",
    url: absoluteUrl("/disclaimer"),
    type: "website",
  },
};

export default function DisclaimerPage() {
  return (
    <LegalLayout
      eyebrow="DISCLAIMER"
      title="免責事項"
      updatedAt="2026年5月11日"
    >
      <Section heading="1. 年齢制限について">
        <p>
          当サイトで紹介している作品は、すべて 18 歳以上を対象とした成人向けコンテンツです。
          18 歳未満の方の閲覧・購入は固くお断りいたします。
          リンク先である FANZA 公式サイトにおいても、18 歳以上であることを確認するページが設けられています。
        </p>
      </Section>

      <Section heading="2. アフィリエイトプログラムへの参加">
        <p>
          当サイトは
          <span className="px-1 text-foreground">FANZA（DMM.com アフィリエイトプログラム）</span>
          に参加しており、商品情報API v3.0
          を利用して FANZA 配信中の作品情報を表示しています。当サイトを経由して FANZA
          上で商品を購入・契約された場合、運営者に紹介料が支払われます。
        </p>
      </Section>

      <Section heading="3. 作品情報の正確性">
        <p>
          作品のタイトル・出演者・ジャンル・価格・サンプル画像等は FANZA
          公式 API
          から取得した時点での情報を表示しています。情報の更新には時間差が生じる場合があり、
          価格改定・配信終了・内容変更などにより、実際の FANZA
          上の情報と異なる場合があります。最新かつ正確な情報は必ず FANZA
          公式サイトでご確認ください。
        </p>
      </Section>

      <Section heading="4. リンク先のサービスについて">
        <p>
          当サイト内の「今すぐ視聴」「FANZA で視聴」等のリンクは、すべて FANZA
          公式サイトへのアフィリエイトリンクです。クリック後の視聴・購入・会員登録・決済等は
          FANZA 上で行われ、その内容について当サイトは一切の責任を負いません。
        </p>
        <p>
          リンク先のサービスにおけるトラブル（決済エラー、配信トラブル、視聴できない等）については、
          FANZA カスタマーサポートに直接お問い合わせください。
        </p>
      </Section>

      <Section heading="5. 著作権について">
        <p>
          当サイトに掲載されている作品のタイトル、画像、サンプル動画、出演者情報等の著作権は、
          各作品の制作元・配給元・出演者・FANZA（合同会社 DMM.com）に帰属します。
          当サイトはこれらの情報を、FANZA 公式アフィリエイトプログラムが提供する
          API を通じて、正当な範囲で表示しています。
        </p>
      </Section>

      <Section heading="6. 損害の免責">
        <p>
          当サイトの利用、または利用できなかったことにより発生したいかなる損害についても、
          当サイト運営者は一切の責任を負いません。リンク先サイトの内容、
          情報の正確性、そこから取得した情報の利用結果についても同様とします。
        </p>
      </Section>

      <Section heading="7. 免責事項の変更">
        <p>
          本免責事項の内容は、必要に応じて予告なく変更することがあります。
          変更後の免責事項は、当サイトに掲載したときから効力を生じるものとします。
        </p>
      </Section>
    </LegalLayout>
  );
}
