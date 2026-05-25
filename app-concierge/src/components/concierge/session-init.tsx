"use client";

import { useEffect, useRef } from "react";

import { track } from "@/lib/analytics";

/**
 * /concierge 着地時に GA4 `ai_session_start` を 1セッション 1回だけ発火する。
 *
 * Moterist 側から引き継いだ URL クエリ (`source`, `intent`) を payload に乗せて
 * 流入元アトリビューションを成立させる。React Strict Mode の二重マウントと
 * 親コンポーネントの再レンダリングに対しては firedRef で抑止する。
 *
 * 2026-05-25: 旧実装には `dataLayer.push({event: "ai_session_start", ...})` の
 * 直 push (GTM 形式) と `track()` 経由の二重発火、加えて concierge-chat.tsx 側でも
 * `ai_session_start` を発火するという三重路があった。dataLayer 直 push は素 gtag.js
 * 環境では消費されない無効 push、track() 重複は GA4 受信側で実数の 2〜3倍に膨れる
 * 原因だった。本コンポーネントを唯一の発火点に統一し、payload も `shared` を含めて
 * 拡張する。
 */
export function ConciergeSessionInit({
  source,
  intent,
  shared,
}: {
  source: string | null;
  intent: string | null;
  shared?: boolean;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (firedRef.current) return;
    firedRef.current = true;

    track("ai_session_start", {
      source: source ?? "direct",
      intent: intent ?? "browse",
      shared: shared ? "1" : "0",
      transport_type: "beacon",
    });
  }, [source, intent, shared]);

  return null;
}
