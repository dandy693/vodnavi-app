"use client";

import Script from "next/script";

/**
 * Google Tag Manager コンテナ初期化コンポーネント (site-brand / vodnavi.jp 用)。
 *
 * app-concierge/src/components/google-tag-manager.tsx を正典として移植。
 * 3 ドメイン共通の GTM 配信パイプを vodnavi.jp 側にも張る目的。
 *
 * データ汚染防止の二重ガード:
 *   1) gtmId 未設定 (env 欠如) → null
 *   2) NODE_ENV !== 'production' → null
 *
 * 配置: layout の <body> 直下、{children} より前に 1 度だけマウント。
 * Next.js が <Script> を最適配置し、<noscript> iframe は GTM 公式仕様に従って
 * body 最初の子要素として残る (JS 無効環境での計測フォールバック)。
 *
 * 使い方:
 *   <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
 */
export function GoogleTagManager({
  gtmId,
}: {
  gtmId: string | undefined;
}) {
  if (!gtmId) return null;

  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager (noscript fallback)"
        />
      </noscript>
    </>
  );
}
