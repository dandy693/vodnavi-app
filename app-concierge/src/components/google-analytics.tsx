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
 *
 * 計測プロパティ整合性メモ (2026-05-20 デュアルタギング適用後の現状):
 * - app.vodnavi.jp は GA4 プロパティ "vodnavi.jp" (G-GG7JV9MJRW) に送信。
 * - vodnavi.jp も同 G-GG7JV9MJRW を送信先にしているため、両者は同一プロパティで
 *   セッション統合される。サブドメイン間なので _ga クッキーは .vodnavi.jp で共有。
 * - moterist.com は the-thor-child/functions.php で G-5HYV772ER9 (旧) と
 *   G-GG7JV9MJRW (統合) のデュアルタギング済。G-GG7JV9MJRW 経路では linker による
 *   _gl client_id 受け渡しが有効に機能する (moterist.com ↔ app.vodnavi.jp 間で
 *   セッション統合)。G-5HYV772ER9 経路は 2〜4週後に廃止判断予定。
 * - vodnavi.jp 側は mu-plugins/vodnavi-cross-domain-linker.php で
 *   linker.domains を 3 サイトに拡張済 (Site Kit デフォルトの vodnavi.jp 単独を上書き)。
 */
export function GoogleAnalytics({
  measurementId,
}: {
  measurementId: string | undefined;
}) {
  if (!measurementId) return null;

  // データ汚染防止の盾：本番以外では gtag.js 自体を一切ロードしない。
  // analytics.ts の track() も NODE_ENV ガードで console.log フォールバックに
  // 落ちるため、開発・プレビュー環境からの本番 GA4 (G-GG7JV9MJRW) 流入はゼロ。
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

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
