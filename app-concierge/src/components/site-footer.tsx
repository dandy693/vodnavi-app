import Link from "next/link";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-black/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-[1.4fr_1fr] sm:px-6">
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-base font-semibold tracking-[0.18em] text-foreground">
              VODNAVI
            </span>
            <span className="text-[10px] tracking-[0.3em] text-amber-400/70">
              PREMIUM
            </span>
          </div>
          <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">
            当サイトは
            <span className="px-1 font-medium text-foreground">FANZA</span>
            公式アフィリエイトプログラムに参加し、商品情報API v3.0
            を利用して作品情報を表示しています。すべての作品の閲覧・購入は
            FANZA 公式サイト上で行われます。運営: VODNavi運営事務局。
          </p>
        </div>

        <nav aria-label="フッターナビゲーション" className="sm:justify-self-end">
          <p className="mb-3 text-[10px] font-medium tracking-[0.25em] text-amber-300/80">
            INFORMATION
          </p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-muted-foreground sm:grid-cols-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-1 transition-colors hover:text-amber-300"
                >
                  <span className="text-amber-400/40">›</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-4 text-[11px] text-muted-foreground/70 sm:px-6">
          <span>© {new Date().getFullYear()} VODNavi運営事務局</span>
          <span>18歳未満の方の閲覧は禁止されています</span>
        </div>
      </div>
    </footer>
  );
}
