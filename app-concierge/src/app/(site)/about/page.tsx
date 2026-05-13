import type { Metadata } from "next";

import { LegalLayout, Section } from "@/components/legal-layout";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "運営者情報",
  description:
    "VODNAVI は FANZA 公式アフィリエイトプログラムに参加し、最新作・話題作を整理して紹介する VOD ナビゲーションサイトです。",
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    title: "運営者情報 | VODNAVI",
    description:
      "VODNAVI のコンセプトと運営方針について。FANZA 公式アフィリエイトプログラム参加サイト。",
    url: absoluteUrl("/about"),
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <LegalLayout eyebrow="ABOUT" title="運営者情報">
      <Section heading="サイトコンセプト">
        <p>
          VODNAVI は、FANZA で配信されている数十万本の VOD
          作品から、いま観るべき一本に最短で辿り着くためのナビゲーションサイトです。
          価格、レビュー、新着情報、ジャンル、出演者などの条件で素早く絞り込み、
          スマートフォンからワンタップで視聴開始できることを目指しています。
        </p>
      </Section>

      <Section heading="運営方針">
        <ul className="list-inside list-disc space-y-2">
          <li>
            <span className="text-foreground">スマホファースト</span>{" "}
            ― ユーザーの 9 割以上がスマートフォン経由でアクセスする前提で UI を設計しています。
          </li>
          <li>
            <span className="text-foreground">純粋なナビゲーション</span>{" "}
            ― 作品情報は FANZA 公式 API
            から取得した一次データに基づき、視聴・購入はすべて FANZA 公式上で行われます。
          </li>
          <li>
            <span className="text-foreground">継続的な更新</span>{" "}
            ― 最新作品が常にトップに表示されるよう、API のキャッシュは短時間で再生成しています。
          </li>
        </ul>
      </Section>

      <Section heading="運営者">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[140px_1fr]">
          <dt className="text-muted-foreground/70">サイト名</dt>
          <dd className="text-foreground">VODNAVI</dd>
          <dt className="text-muted-foreground/70">運営者</dt>
          <dd className="text-foreground">VODNavi運営事務局</dd>
          <dt className="text-muted-foreground/70">連絡先</dt>
          <dd className="text-foreground">
            <a href="/contact" className="text-amber-300 hover:underline">
              お問い合わせフォーム
            </a>
          </dd>
        </dl>
      </Section>

      <Section heading="使用している技術">
        <p>
          Next.js (App Router) / TypeScript / Tailwind CSS / shadcn/ui を採用し、
          サーバーレス環境（Vercel）上で運用しています。作品データは
          DMM/FANZA 商品情報API v3.0
          から取得した一次データを利用しており、画像・タイトル・価格などの著作権は
          各権利者に帰属します。
        </p>
      </Section>
    </LegalLayout>
  );
}
