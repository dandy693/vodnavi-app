"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

/**
 * クリーン面 (vodnavi.jp) のアトリビューション早期着火（STRATEGY_BRIEF_078 §2.A）。
 *
 * 着地 URL の `?source=` を検知した瞬間、ファーストパーティ cookie `vodnavi_source` に
 * 焼き付ける。SSG ページ間を回遊して URL パラメータが消えても、送客リンク書換
 * (OutboundSourceRewriter) が cookie を読んで app.vodnavi.jp 行きリンクへ source を付与できる。
 *
 * - `useSearchParams()` は static prerender を中断するため <Suspense> で隔離（既存
 *   google-analytics.tsx と同じ盾）。これで `/` 含む SSG ルートが dynamic 化しない。
 * - clean 境界: source は文字列識別子のみ。作品固有/成人パラメータは扱わない。
 */
const COOKIE_NAME = "vodnavi_source";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 日
const SOURCE_RE = /^[a-zA-Z0-9_]{1,32}$/;

function AttributionTrackerInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams?.get("source");
    if (!raw || !SOURCE_RE.test(raw)) return;
    // 親ドメイン .vodnavi.jp に着火（サブドメイン横断で読めるが、送客は URL param 経由）。
    // Secure + SameSite=Lax。localhost (http) では Domain 不一致で着火しない＝本番専用。
    document.cookie =
      `${COOKIE_NAME}=${encodeURIComponent(raw)}; Max-Age=${MAX_AGE_SECONDS}; ` +
      `Path=/; Domain=.vodnavi.jp; SameSite=Lax; Secure`;
  }, [searchParams]);

  return null;
}

export function AttributionTracker() {
  return (
    <Suspense fallback={null}>
      <AttributionTrackerInner />
    </Suspense>
  );
}
