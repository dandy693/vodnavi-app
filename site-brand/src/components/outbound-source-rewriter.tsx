"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * STRATEGY_BRIEF_078 §2.B — マークダウン非破壊の送客リンク動的フォワード。
 *
 * クライアント mount 時に、レンダー済み HTML 内の app.vodnavi.jp 行きリンク (a[href])
 * を走査し、`vodnavi_source` cookie（無ければ現在 URL の `?source=`）の値で `source`
 * クエリを上書きする。静的 markdown (article.md) は 1 文字も書き換えない＝SSG/SEO 不変。
 *
 * race 回避: 着地ページでは layout 側 AttributionTracker の cookie 着火 (useEffect) が
 * 本 rewriter より後に走り得るため、cookie を第一候補・**現在 URL の source を fallback**
 * とする（同一レンダ内で cookie 未着火でも着地ページの ?source= を拾える）。
 *
 * `useSearchParams` は使わない（dynamic 化を避ける）。window.location は useEffect 内
 * （client 専用）でのみ参照するため SSG/SSR に影響しない。
 */
const SOURCE_RE = /^[a-zA-Z0-9_]{1,32}$/;

function readSource(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)vodnavi_source=([^;]+)/);
  if (m) {
    const v = decodeURIComponent(m[1]);
    if (SOURCE_RE.test(v)) return v;
  }
  const u = new URLSearchParams(window.location.search).get("source");
  return u && SOURCE_RE.test(u) ? u : null;
}

export function OutboundSourceRewriter() {
  // SPA 遷移（client-side navigation）でも遷移先ページの送客リンクを書換えるため、
  // pathname を依存に取り再発火させる。usePathname は useSearchParams と違い static
  // prerender を中断しない＝<Suspense> 不要で SSG-safe（layout 直下に置いても `/` は ○ Static）。
  const pathname = usePathname();
  useEffect(() => {
    const source = readSource();
    if (!source) return;
    const anchors = document.querySelectorAll<HTMLAnchorElement>(
      'a[href*="app.vodnavi.jp"]',
    );
    anchors.forEach((a) => {
      try {
        const url = new URL(a.href);
        if (url.hostname !== "app.vodnavi.jp") return;
        url.searchParams.set("source", source);
        a.href = url.toString();
      } catch {
        /* malformed href → skip */
      }
    });
  }, [pathname]);

  return null;
}
