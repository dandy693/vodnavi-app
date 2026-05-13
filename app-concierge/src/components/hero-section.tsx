import { Sparkles } from "lucide-react";

export function HeroSection({ totalCount }: { totalCount?: number }) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
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
          PREMIUM VOD NAVIGATION
        </div>
        <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          今夜の<span className="text-amber-300">"極上"</span>に、最短ルートで。
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          FANZA から厳選した最新作・話題作を、価格・レビュー・新着ですぐ見つける。
          スマホからワンタップで視聴開始。
        </p>
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
