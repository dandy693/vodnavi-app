import { AgeGateOverlay } from "@/components/age-gate-overlay";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* 検索エンジン直接着地 (`/works/[floor]/[id]` 等) でも 18 禁モーダルが
         確実に発火するようサイト共通レイヤーに配置。SSR では描画されず、
         ハイドレーション後に cookie 未通過なら全画面ロック。BRAND_DESIGN_GUIDE
         §3「年齢確認の盾」要件。 */}
      <AgeGateOverlay />
    </>
  );
}
