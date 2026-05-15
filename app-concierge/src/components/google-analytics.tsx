"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Suspense, useEffect } from "react";

/**
 * Google Analytics 4 (gtag.js) integration for the App Router.
 *
 * - 初回ロード時の page_view は gtag('config') が自動送信
 * - App Router のクライアント遷移は full reload が起きないため、
 *   usePathname / useSearchParams の変化を監視して page_view を手動送信
 * - useSearchParams は static prerender を中断するので <Suspense> で隔離
 */
export function GoogleAnalytics({
  measurementId,
}: {
  measurementId: string | undefined;
}) {
  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}', {
  send_page_view: true,
  linker: {
    domains: ['moterist.com', 'vodnavi.jp', 'app.vodnavi.jp'],
    accept_incoming: true
  }
});
        `}
      </Script>
      <Suspense fallback={null}>
        <RouteChangeTracker measurementId={measurementId} />
      </Suspense>
    </>
  );
}

function RouteChangeTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }
    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    window.gtag("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
      send_to: measurementId,
    });
  }, [pathname, searchParams, measurementId]);

  return null;
}
