"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { trackScrollDepth, type ScrollDepthThreshold } from "@/lib/analytics";

/**
 * Phase-3 カスタムスクロール深度トラッカー。
 *
 * 空コンテナの GTM (GTM-TKDHM348) に依存せず、アプリ側で 25/50/75% の読了率を
 * GA4 (`scroll_custom` + `percent_scrolled`) へ直接送出する。仕様書 97a7b8e の
 * 「passive + rAF スロットル + ページ内 1 回発火ガード」に準拠。
 *
 * - **passive: true**: スクロールのジャンク（メインスレッドブロック）を回避。
 * - **requestAnimationFrame スロットル**: 高頻度の scroll イベントを1フレーム1回の
 *   計算に間引き、レイアウト読み取り (scrollHeight/clientHeight) を最小化。
 * - **ページ内 1 回ガード**: `dispatched` で各閾値はページごとに最大1回のみ発火。
 * - **ページ単位リセット**: root layout に常駐し SPA 遷移で unmount されないため、
 *   `usePathname` を依存に取り、遷移ごとにフラグ・リスナーを張り直す
 *   (google-analytics.tsx の page_view 手動送信と同一の per-page セマンティクス)。
 *
 * `track()` は非本番/localhost で no-op (analytics.ts のデータ汚染ガード) のため、
 * 本コンポーネントは常時マウントしてよい。moterist.com 側には一切関与しない。
 */
export function ScrollDepthTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ページ遷移ごとに新しい発火状態を持つ（per-page リセット）。
    const dispatched: Record<ScrollDepthThreshold, boolean> = {
      25: false,
      50: false,
      75: false,
    };
    const thresholds: ScrollDepthThreshold[] = [25, 50, 75];

    let ticking = false;

    const evaluate = () => {
      ticking = false;
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      if (docHeight <= 0) return;
      const pct = (scrollTop / docHeight) * 100;

      for (const t of thresholds) {
        if (pct >= t && !dispatched[t]) {
          dispatched[t] = true;
          trackScrollDepth(t);
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(evaluate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // 初期表示でビューポートが既に閾値を満たす短いページ（docHeight 小）にも対応。
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return null;
}
