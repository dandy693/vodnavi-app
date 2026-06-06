import type { Metadata } from "next";
import { Fragment } from "react";

export const metadata: Metadata = {
  title: "運営者情報",
  description:
    "VODNAVI（vodnavi.jp）の運営者情報。運営法人・運営組織・連絡先・免責事項・広告表記を掲載しています。",
  alternates: { canonical: "/about" },
};

// 値はすべて site-brand/src/app/layout.tsx の schema.org JSON-LD（本番 deploy 済の検証済値）と
// トップページ page.tsx の運営組織情報セクションに一致させる。新たな法人情報は捏造しない。
const ROWS: { term: string; desc: string }[] = [
  { term: "サイト名", desc: "VODNAVI（vodnavi.jp）" },
  { term: "運営主体（屋号）", desc: "VODNavi運営事務局" },
  { term: "運営会社（法人）", desc: "合同会社トレンドネット" },
  {
    term: "運営組織",
    desc: "VODNAVI プロジェクト運営委員会（戦略・制作・コンプライアンスの 3 部門で構成）",
  },
  {
    term: "代表サービス",
    desc: "VODNAVI（vodnavi.jp）／VODNAVI Concierge（app.vodnavi.jp）／Moterist（moterist.com）",
  },
  { term: "連絡先", desc: "contact@vodnavi.jp（業務時間：平日 10:00–18:00 JST）" },
  {
    term: "免責事項",
    desc: "VODNAVI は VOD 作品の選定支援を行うサービスであり、配信プラットフォーム自体の運営者ではありません。最終的な視聴・購入・契約は、リンク先の公式サイト（FANZA 等）にて行われます。料金・配信状況・キャンペーン内容は変動するため、最新情報は必ず公式サイトでご確認ください。",
  },
  {
    term: "広告表記",
    desc: "当サイトは、アフィリエイト広告（FANZA 等）を含みます。広告収入はサービスの品質向上に充当されます。",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
      <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
        ABOUT US
      </p>
      <h1 className="mt-4 font-luxury-heading text-3xl text-brand-text-primary sm:text-4xl">
        運営者情報
      </h1>

      <dl className="mt-14 grid gap-x-12 gap-y-6 sm:grid-cols-[180px_1fr]">
        {ROWS.map((r) => (
          <Fragment key={r.term}>
            <dt className="font-luxury-heading text-sm tracking-wide text-brand-gold">
              {r.term}
            </dt>
            <dd className="text-sm leading-relaxed text-brand-text-secondary">
              {r.desc}
            </dd>
          </Fragment>
        ))}
      </dl>

      <div className="mt-16">
        <a href="/" className="btn-luxury-outline" aria-label="トップへ戻る">
          ← トップへ戻る
        </a>
      </div>
    </main>
  );
}
