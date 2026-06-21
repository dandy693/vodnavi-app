import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import type { ConciergeSource } from "@/lib/concierge/sources";

export interface HeroCopy {
  badge: string;
  headlineLead: string;
  headlineHighlight: string;
  headlineTail: string;
  subcopy: string;
  ctaLabel: string;
  /**
   * CTA 直下に置くバーテンダー調の whisper マイクロコピー（任意）。
   * F-12 UI 強化で導入。チャネル別トーン（default/moterist/brand）に合わせて
   * page.tsx の selectHeroCopy で個別注入する。未指定なら何も描画しない
   * （= 既存呼び出しを破壊しない optional 設計）。
   */
  ctaWhisper?: string;
}

export function HeroSection({
  totalCount,
  source,
  copy,
}: {
  totalCount?: number;
  source: ConciergeSource;
  copy: HeroCopy;
}) {
  const conciergeHref =
    source === "default"
      ? "/concierge"
      : `/concierge?source=${encodeURIComponent(source)}`;

  return (
    <section
      className="relative overflow-hidden border-b border-white/5"
      data-source={source}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(245,200,80,0.18),transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-3 px-4 py-10 sm:px-6 sm:py-14">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/5 px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-amber-300 sm:text-xs">
          <Sparkles className="size-3" aria-hidden />
          {copy.badge}
        </div>
        <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          {copy.headlineLead}
          <span className="text-amber-300">{copy.headlineHighlight}</span>
          {copy.headlineTail}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {copy.subcopy}
        </p>
        {/* BRIEF_018 §2.1: H3 hypothesis (header top-right の CTA は prominence 低)
           対抗。モバイル幅では full-width + 中央寄せ + brand gold (#121212 / #D4AF37)
           で「ゴールド・ヒーローCTA」として要塞化、desktop では従来の inline 表示を維持。
           F-12 UI 強化 (2026-06-21): ai_session_start 起動率 0.88% を破壊するため、
           (a) シャンパンゴールドの静かな光彩 (blur 光輪 + glow shadow) で網膜を誘導、
           (b) Sparkles の微発光、(c) CTA 直下の whisper マイクロコピーで「相談したい」
           インテントを喚起。世界観 (#121212 / #D4AF37) は 1mm も崩さず、光彩は
           motion-safe に限定し prefers-reduced-motion を尊重する。 */}
        <div className="relative mt-4 w-full self-stretch sm:mt-2 sm:w-auto sm:self-start">
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-1 rounded-full bg-[#D4AF37]/20 opacity-70 blur-md motion-safe:animate-pulse"
          />
          <Link
            href={conciergeHref}
            prefetch={false}
            className="relative inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold shadow-[0_0_30px_-8px_rgba(212,175,55,0.55)] transition-all duration-300 hover:shadow-[0_0_45px_-6px_rgba(212,175,55,0.85)] active:translate-y-px sm:w-auto sm:px-5 sm:py-2 sm:text-sm"
            style={{
              backgroundColor: "#121212",
              color: "#D4AF37",
              border: "2px solid #D4AF37",
            }}
          >
            <Sparkles className="size-4 motion-safe:animate-pulse" aria-hidden />
            {copy.ctaLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {copy.ctaWhisper && (
          <p
            className="max-w-md text-xs italic leading-relaxed text-amber-300/70 sm:text-sm"
            style={{ fontFamily: "serif" }}
          >
            {copy.ctaWhisper}
          </p>
        )}
        {typeof totalCount === "number" && totalCount > 0 && (
          <p className="text-xs text-muted-foreground/70">
            掲載作品 <span className="font-semibold text-amber-300">
              {totalCount.toLocaleString("ja-JP")}
            </span> 件
          </p>
        )}
      </div>
    </section>
  );
}
