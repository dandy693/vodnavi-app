import Link from "next/link";
import { Sparkles } from "lucide-react";

import { SaleEntryLink } from "@/components/sale-entry-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/70 backdrop-blur-xl supports-[backdrop-filter]:bg-black/50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-1.5"
          aria-label="VODNAVI ホーム"
        >
          <span className="font-heading text-lg font-semibold tracking-[0.18em] text-foreground transition-colors group-hover:text-amber-300 sm:text-xl">
            VODNAVI
          </span>
          <span className="hidden text-[10px] font-medium tracking-[0.3em] text-amber-400/70 sm:inline">
            PREMIUM
          </span>
        </Link>

        <nav
          className="flex items-center gap-3 sm:gap-5"
          aria-label="メインナビゲーション"
        >
          <Link
            href="/?sort=rank"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-amber-300 sm:inline"
          >
            ランキング
          </Link>
          <Link
            href="/?floor=videoa&sort=date"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-amber-300 sm:inline"
          >
            新着
          </Link>

          {/* /sale への導線（第95便 CSO裁定③・案 b）。GA4: sale_entry_click / nav_sale。
              セールは時限のため、他のナビより目立つ色にしている。 */}
          <SaleEntryLink
            placement="nav_sale"
            ariaLabel="セール中の作品一覧を開く"
            className="text-sm font-medium text-rose-300 transition-colors hover:text-rose-200"
          >
            セール
          </SaleEntryLink>

          {/* AI コンシェルジュへの導線 — 全ページに表示するメイン CTA */}
          <Link
            href="/concierge"
            className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 px-3 text-xs font-semibold text-black shadow-[0_0_20px_-5px_rgba(245,200,80,0.6)] transition-all hover:from-amber-400 hover:to-amber-300 active:translate-y-px sm:px-4 sm:text-sm"
            aria-label="AI 相談窓口を開く"
          >
            <Sparkles className="size-3.5 animate-pulse" aria-hidden />
            <span className="hidden sm:inline">AI 相談窓口</span>
            <span className="sm:hidden">AI 相談</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
