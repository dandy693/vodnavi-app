import type { Metadata } from "next";

import { ConciergeQuiz } from "@/components/concierge/concierge-quiz";

/**
 * STRATEGY_BRIEF_048 / 074 / 075 — /lp。
 *
 * SNS(X) 着地（`?source=sns_x&intent=*`）の受け皿を維持しつつ、BRIEF_074 の
 * 3タップ診断（`ConciergeQuiz`）を主導線として配置する。診断結果は既存
 * `/concierge?cids=…&source=…` シードへ遷移（新規データ層なし）。
 *
 * 年齢確認は /concierge 側の既存フロー（`ConciergeGate` + `proxy.ts` の API 403）が
 * 担保するため本ページはゲートしない（proxy.ts matcher は /lp を含まない）。
 * 意匠は design-tokens.css / brand-* / font-luxury-* を 100% 継承。
 */

export const metadata: Metadata = {
  title: "AI コンシェルジュの処方箋 | VODNAVI",
  description:
    "今夜の最高の一本を、3 つの問いから。VODNAVI の AI コンシェルジュが、あなたの感性に最短距離で寄り添います。",
  alternates: { canonical: "/lp" },
  robots: { index: false }, // SNS 着地 + 診断導線。検索インデックスは不要。
};

type Props = {
  searchParams: Promise<{ source?: string; intent?: string }>;
};

export default async function LpPage({ searchParams }: Props) {
  const params = await searchParams;
  // SNS 等から引き継いだ source を温存（無ければ診断由来の app_3tap）。
  const source =
    params.source && /^[a-zA-Z0-9_]{1,32}$/.test(params.source)
      ? params.source
      : "app_3tap";

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-brand-dark px-6 pt-16 pb-10 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,175,55,0.10),transparent_70%)]"
      />

      <header className="relative w-full max-w-xl">
        <p className="font-luxury-heading text-xs tracking-[0.4em] text-brand-gold/80 sm:text-sm">
          VODNAVI · 官能の図書館
        </p>
        <h1 className="mt-6 font-luxury-heading text-3xl leading-tight text-brand-text-primary sm:text-4xl">
          今夜の一本を、3 つの問いから。
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-brand-text-secondary sm:text-base">
          チープなランキングを排し、AI があなたの気分の輪郭に静かにシンクロする映像だけを提示します。会話は数分で完結します。
        </p>
      </header>

      <div className="relative mt-6 w-full max-w-xl">
        <ConciergeQuiz source={source} />
      </div>
    </main>
  );
}
