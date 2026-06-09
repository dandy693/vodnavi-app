"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics";

/**
 * BRIEF_057 §2.2（component 層シグナル）: ユーザーがエラー UI（FANZA 取得失敗 /
 * 認証情報未設定）を **実際に目にした瞬間** に、本番のみ GA4 へ severity:high の
 * シグナルを射出する。
 *
 * 役割分担:
 *   - lib 層（`fetchItemList` / `getCredentials` の `logFanzaSilentDeath`）→ Vercel
 *     Logs にサーバー側で構造化検知（"窒息が起きた"）。
 *   - component 層（本コンポーネント）→ GA4 にクライアント側で "窒息がユーザーに
 *     到達した" 事実を可観測化し、CVR 影響をサタデー・レビューで監視可能にする。
 *
 * `track()` は `NODE_ENV !== 'production'` / localhost で no-op（GA4 汚染防止）なので、
 * §2.2 の「本番環境でトリガー」要件をそのまま満たす。描画専用ではないため null を返す。
 */
export function ErrorTelemetry({
  kind,
  detail,
}: {
  kind: "config" | "api";
  detail?: string;
}) {
  useEffect(() => {
    track("fanza_surface_error", {
      severity: "high",
      kind,
      detail: detail ?? null,
      path: typeof window !== "undefined" ? window.location.pathname : null,
    });
  }, [kind, detail]);

  return null;
}
