import type { ReactNode } from "react";

interface CleanColumnProps {
  children: ReactNode;
}

/**
 * 『ビブリア・エロティカ（官能の図書館）』の世界観を体現する、読書没頭型の
 * クリーンカラム・レイアウト。
 *
 * 色・フォントは design-tokens.css 由来の brand トークンクラス
 * (`bg-brand-dark` / `text-brand-text-primary` / `font-luxury-body` /
 * `selection:bg-brand-gold`) を参照し、ハードコード hex を一切作らない
 * （frozen token / "DO NOT EDIT" 規約・BRAND_DESIGN_GUIDE §2.1 準拠）。
 */
export function CleanColumn({ children }: CleanColumnProps) {
  return (
    <div className="min-h-screen bg-brand-dark font-luxury-body text-brand-text-primary antialiased selection:bg-brand-gold selection:text-brand-dark">
      <main className="mx-auto max-w-[680px] px-6 py-16 leading-relaxed tracking-wide sm:py-24">
        {children}
      </main>
    </div>
  );
}
