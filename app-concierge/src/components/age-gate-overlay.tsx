"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { track } from "@/lib/analytics";

/**
 * (site) ルート全域用 年齢確認オーバーレイ（works / genres / home / about 等）。
 *
 * 背景:
 *   - 2026-05-27 物理監査: GA4 hostname 別アクティブユーザーの 96.99% が
 *     app.vodnavi.jp、その大半が `/works/[floor]/[id]` への外部検索からの
 *     直接着地で、`/concierge` を経由せず作品ページに先着する。
 *   - 既存の `ConciergeGate` は /concierge ページ専用、`/api/age-gate` の
 *     API ガードは proxy.ts で /api/concierge/* のみ。`/works/*` ページの
 *     UI 上に年齢確認モーダルが発火しておらず、BRAND_DESIGN_GUIDE §3
 *     「アクセス直後にモーダル発火」を満たせていなかった。
 *
 * 設計:
 *   - SSR では何も描画しない（Googlebot/SEO クローラには記事本文を素のまま
 *     見せる。検索インデックスとリッチリザルトを温存）。
 *   - ハイドレーション直後に `document.cookie` を読み、`vodnavi_age_verified=1`
 *     未通過なら全画面ロックでコンテンツを物理的に覆い隠す。
 *   - 「はい」→ /api/age-gate POST → cookie 発行成功で即時アンマウント。
 *   - 「いいえ」→ 外部安全サイト（google.com）へ離脱。
 *   - body スクロールロックで背後コンテンツへの誤タップを防止。
 *
 * `/concierge` 専用の `ConciergeGate` とは別系統で動かす（チャット UI に
 * 特化したコピー / 計測ペイロードを混ぜないため）。コア DOM 構造とブランド
 * 配色は両者で揃えて視覚的一貫性を担保する。
 */

const COOKIE_NAME = "vodnavi_age_verified";
const COOKIE_VALUE = "1";

function readCookieVerified(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .map((c) => c.trim())
    .some((c) => c === `${COOKIE_NAME}=${COOKIE_VALUE}`);
}

function subscribeCookie(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("vodnavi:cookie-updated", callback);
  window.addEventListener("focus", callback);
  return () => {
    window.removeEventListener("vodnavi:cookie-updated", callback);
    window.removeEventListener("focus", callback);
  };
}

export function AgeGateOverlay() {
  const verified = useSyncExternalStore(
    subscribeCookie,
    readCookieVerified,
    // SSR スナップショット: 「未確認」として返す。ただし overlay 自体は SSR で
    // 描画させない (`mounted` ガード) ので Googlebot は本文を素のまま受け取る。
    () => false,
  );

  // クライアントにマウント済みかを effect 内 setState を使わず判定する
  // (react-hooks/set-state-in-effect 回避)。SSR は server snapshot=false で
  // overlay を描画させず、ハイドレーション後に client snapshot=true へ切替わる。
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = mounted && !verified;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // 年齢ゲート表示の物理計測。open（mounted && !verified）成立時に一度発火。
  // 遮断率 = age_gate_bounce / age_gate_view の分母。
  useEffect(() => {
    if (!open) return;
    track("age_gate_view", { gate: "site_overlay" });
  }, [open]);

  if (!open) return null;

  async function confirm() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/age-gate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (!res.ok) {
        setError("確認に失敗しました。時間を置いて再度お試しください。");
        setBusy(false);
        return;
      }
      track("age_gate_agree", { gate: "site_overlay" });
      window.dispatchEvent(new Event("vodnavi:cookie-updated"));
    } catch {
      setError("通信に失敗しました。ネットワークを確認してください。");
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-age-gate-title"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-dark px-6 py-12 text-center"
      style={{ backgroundColor: "#121212" }}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent"
      />

      <div className="w-full max-w-md">
        <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
          VODNAVI · 年齢確認
        </p>
        <h1
          id="site-age-gate-title"
          className="mt-4 font-luxury-heading text-3xl leading-tight text-brand-text-primary sm:text-4xl"
        >
          18 歳以上ですか？
        </h1>
        <p className="mt-6 text-sm leading-relaxed text-brand-text-secondary sm:text-base">
          VODNAVI は、FANZA を中心とした成人向け動画作品（VOD）の情報・選定支援を扱います。
          日本の法令に従い、満 18 歳以上の方のみご利用いただけます。
        </p>

        <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            aria-disabled={busy}
            className="btn-luxury-gold disabled:opacity-50"
          >
            {busy ? "確認中…" : "はい、18 歳以上です"}
          </button>
          <a
            href="https://www.google.com/"
            rel="noopener noreferrer"
            onClick={() =>
              track("age_gate_bounce", {
                gate: "site_overlay",
                transport_type: "beacon",
              })
            }
            className="btn-luxury-outline"
          >
            いいえ（退出）
          </a>
        </div>

        {error && (
          <p className="mt-4 text-xs text-red-300" role="alert">
            {error}
          </p>
        )}

        <p className="mt-12 text-xs leading-relaxed text-brand-text-secondary/70">
          確認結果はクッキー（
          <span className="font-mono text-brand-gold/80">vodnavi_age_verified</span>
          、有効期限 1 年、Secure、SameSite=Lax）として保存されます。
          コンシェルジュ API は本ゲート通過まで HTTP 403 で物理遮断されます。
        </p>
      </div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent"
      />
    </div>
  );
}
