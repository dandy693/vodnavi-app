"use client";

import Script from "next/script";

/**
 * Google Tag Manager コンテナ初期化コンポーネント。
 *
 * 役割:
 *   - 将来のマルチ ASP 計測タグ群（DMM TV / U-NEXT 等のフェーズ 2 解放分）を
 *     GTM 経由で一元配信できるよう、3 ドメイン共通の伏線を張る。
 *   - 既存の gtag.js（`google-analytics.tsx`）と二重稼働する設計。
 *     - gtag.js: 直接 GA4 へ送る現行ルート（変更しない）
 *     - GTM:     将来タグ（広告ピクセル、Hotjar、Microsoft Clarity 等）の
 *                配信パイプとして待機
 *
 * データ汚染防止の二重ガード（[[project_ga4_property_access_redirect]] 教訓）:
 *   1) `gtmId` 未設定（env 欠如）→ `null` を返してマウントしない
 *   2) `NODE_ENV !== 'production'` → コンテナ自体をロードせず `null` 返却
 *      （非本番ビルドが本番 GTM コンテナにヒットを混入させる経路ゼロ）
 *   非本番でも分析イベントは `lib/analytics.ts` の `track()` が
 *   `console.log("[track-dev]", ...)` で開発者にエコーするため、可視性は維持。
 *
 * 配置:
 *   `app/layout.tsx` の `<body>` 直下、`{children}` より前に 1 度だけマウント。
 *   Next.js が `<Script>` を最適配置し、`<noscript>` iframe は GTM 公式仕様に
 *   従って body 最初の子要素として残る（JS 無効環境での計測フォールバック）。
 *
 * 使い方:
 *   <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
 *   .env.local / Vercel env で `NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"` をセット。
 */
export function GoogleTagManager({
  gtmId,
}: {
  gtmId: string | undefined;
}) {
  if (!gtmId) return null;

  // データ汚染防止の盾：本番以外では GTM コンテナを一切ロードしない。
  // analytics.ts の track() も同じ NODE_ENV ガードで console.log フォール
  // バックに落ちるため、非本番ビルドから本番 GTM への漏洩経路はゼロ。
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
