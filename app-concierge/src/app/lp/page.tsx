import type { Metadata } from "next";

/**
 * STRATEGY_BRIEF_048 — SNS（X）専用ランディング LP（T-07）。
 *
 * X 等の SNS から `?source=sns_x&intent=*` で流入したユーザーを受け止め、
 * クエリを 1 文字も損なわずに `/concierge` へ引き継ぐ。年齢確認は `/concierge`
 * 側の既存フロー（client モーダル `ConciergeGate` + `proxy.ts` の API 403）が
 * 担保するため、LP ページ自体はゲートしない（proxy.ts の matcher は /lp を含まない）。
 * 意匠は design-tokens.css / brand-* / font-luxury-* を 100% 継承。
 */

export const metadata: Metadata = {
  title: "今夜の一本を、AI コンシェルジュと。",
  description:
    "膨大なカタログから、あなただけの一本を。VODNAVI の AI コンシェルジュが、今夜の気分に最短距離で寄り添います。",
  alternates: { canonical: "/lp" },
  robots: { index: false }, // SNS 着地専用。検索インデックスは不要。
};

type Props = {
  searchParams: Promise<{ source?: string; intent?: string }>;
};

const INTENT_LEAD: Record<string, string> = {
  beginner: "はじめての夜も、迷わせません。",
  actress: "今夜の主役を、あなたの感性で。",
  discount: "見逃せない一本を、最適なタイミングで。",
  wisdom: "知性を満たす、夜の一本を。",
};

export default async function SnsLandingPage({ searchParams }: Props) {
  const params = await searchParams;
  // SNS 着地のため source 既定は sns_x。intent は付与されていれば透過。
  const source = params.source && params.source.length > 0 ? params.source : "sns_x";
  const intent =
    params.intent && /^[a-zA-Z_]{1,24}$/.test(params.intent)
      ? params.intent
      : null;

  const query = new URLSearchParams({ source });
  if (intent) query.set("intent", intent);
  const conciergeHref = `/concierge?${query.toString()}`;

  const lead = (intent && INTENT_LEAD[intent]) || "今夜の気分に、最適な一本を。";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-dark px-6 py-20 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,175,55,0.12),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-2xl">
        <p className="font-luxury-heading text-xs tracking-[0.4em] text-brand-gold/80 sm:text-sm">
          VODNAVI · 官能の図書館
        </p>
        <h1 className="mt-8 font-luxury-heading text-4xl leading-tight text-brand-text-primary sm:text-5xl">
          {lead}
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-brand-text-secondary sm:text-lg">
          チープなランキングを排し、AI があなたの孤独と欲望の深淵にシンクロする映像だけを静かに提示します。会話は数分で完結します。
        </p>
        <div className="mt-12">
          <a
            href={conciergeHref}
            className="btn-luxury-gold pulse-gold"
            aria-label="AI コンシェルジュを起動（無料）"
          >
            AI コンシェルジュを起動（無料）
          </a>
        </div>
        <p className="mt-10 text-xs text-brand-text-secondary/70">
          18 歳以上対象 · 広告（FANZA 等）を含みます
        </p>
      </div>

      <style>{`
        @keyframes pulseGold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
          50% { box-shadow: 0 0 28px -4px rgba(212,175,55,0.55); }
        }
        .pulse-gold { animation: pulseGold 3.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .pulse-gold { animation: none; } }
      `}</style>
    </main>
  );
}
