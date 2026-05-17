"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics";

/**
 * /concierge 着地時に GA4 `ai_session_start` イベントを発火するクライアントフック。
 *
 * STRATEGY_BRIEF_002 PHASE 1 設計：
 *   - Moterist 側から引き継いだ URL クエリ (`source`, `intent`) を最優先で読み込み、
 *     dataLayer への直 push + track() 経由の二重ルートで発火する。
 *   - 直 push は gtag.js のロード前でも確実にキューに積むためのフォールバック。
 *   - track() ヘルパー側で本番以外は console フォールバックに落ちる。
 */
export function ConciergeSessionInit({
  source,
  intent,
}: {
  source: string | null;
  intent: string | null;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const payload = {
      source: source ?? "direct",
      intent: intent ?? "browse",
    };

    // dataLayer 直 push：gtag.js が後から読み込まれても拾われる。
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "ai_session_start",
      ...payload,
    });

    // 共通ヘルパー経由：本番なら gtag、開発なら console。
    track("ai_session_start", payload);
  }, [source, intent]);

  return null;
}
