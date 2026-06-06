// 共通フッター。layout.tsx で全ページ（トップ + /about /privacy /terms）に描画する。
// 色・フォントは design-tokens.css 由来の brand-* トークン / font-luxury-* を使用し、
// ハードコード hex は使わない。著作権表記は実体法人「合同会社トレンドネット」。
const LEGAL_LINKS: { href: string; label: string }[] = [
  { href: "/about", label: "運営者情報" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/terms", label: "利用規約" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-gold/10">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <nav
          aria-label="ポリシー"
          className="mb-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-brand-text-secondary"
        >
          {LEGAL_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-brand-gold"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <p className="text-center text-xs text-brand-text-secondary/70">
          © {new Date().getFullYear()} 合同会社トレンドネット / VODNAVI プロジェクト運営委員会 ·
          <span className="ml-2">広告を含む · 18 歳以上対象</span>
        </p>
      </div>
    </footer>
  );
}
