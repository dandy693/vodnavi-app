"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * STRATEGY_BRIEF_078 §2.B — マークダウン非破壊の送客リンク動的フォワード。
 *
 * クライアント mount 時に、レンダー済み HTML 内の app.vodnavi.jp 行きリンク (a[href])
 * を走査し、URL の `?source=`（無ければ `vodnavi_source` cookie）の値で `source`
 * クエリを上書きする。静的 markdown (article.md) は 1 文字も書き換えない＝SSG/SEO 不変。
 *
 * 優先順位 (T-20260627-07): **URL の ?source= を最優先**、無ければ cookie を fallback。
 * 着地時の最新キャンペーン値が過去訪問で残った古い cookie に常に勝つ（returning-visitor の
 * 誤帰属を防止）。これにより cookie 着火 (AttributionTracker) との effect race にも依存しない。
 *
 * `useSearchParams` は使わない（dynamic 化を避ける）。window.location は useEffect 内
 * （client 専用）でのみ参照するため SSG/SSR に影響しない。
 */
const SOURCE_RE = /^[a-zA-Z0-9_]{1,32}$/;

function readSource(): string | null {
  // 優先順位 (T-20260627-07): URL の ?source= を最優先。着地時の最新キャンペーン値が、
  // 過去訪問で残った古い cookie に常に勝つ（returning-visitor の誤帰属を防止）。
  // URL に無ければ cookie を回遊保持の fallback とする。cookie 着火 race にも非依存。
  const u = new URLSearchParams(window.location.search).get("source");
  if (u && SOURCE_RE.test(u)) return u;
  const m = document.cookie.match(/(?:^|;\s*)vodnavi_source=([^;]+)/);
  if (m) {
    const v = decodeURIComponent(m[1]);
    if (SOURCE_RE.test(v)) return v;
  }
  return null;
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
