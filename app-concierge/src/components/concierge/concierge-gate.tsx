"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * /concierge ページ用の年齢確認オーバーレイモーダル。
 *
 * STRATEGY_BRIEF_002 PHASE 1 設計：
 *   - 着地直後にクライアント側で `vodnavi_age_verified` クッキーを検査。
 *   - 未通過なら全画面ロック (#121212)。煽情画像なし、Serif 見出し、金アクセント。
 *   - 「はい」→ /api/age-gate POST → 成功でモーダルをアンマウント
 *     （ハードリロードせず、チャット UI を即時解放）。
 *   - 「いいえ」→ 外部安全サイトへ即座離脱。
 *
 * クッキー読取は `useSyncExternalStore` 経由でハイドレーション安全に行う。
 * SSR では「未確認」をスナップショットとして返し、ハイドレーション時に
 * クライアント側の `document.cookie` を読み直して即時整合させる。
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
  // POST /api/age-gate 成功時にローカルで再評価させるためのカスタムイベント。
  if (typeof window === "undefined") return () => {};
  window.addEventListener("vodnavi:cookie-updated", callback);
  window.addEventListener("focus", callback);
  return () => {
    window.removeEventListener("vodnavi:cookie-updated", callback);
    window.removeEventListener("focus", callback);
  };
}

export function ConciergeGate() {
  const verified = useSyncExternalStore(
    subscribeCookie,
    readCookieVerified,
    // SSR スナップショット：未確認扱い。クライアントハイドレーション直後に
    // readCookieVerified() で正値へ即時切り替わる。
    () => false,
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = !verified;

  // モーダル open 中は body スクロールを止める。
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
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
      // ハードリロードしない：subscribeCookie 経由で `verified` が再評価され、
      // モーダルは即座にアンマウントされてチャット UI が解放される。
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
      aria-labelledby="concierge-gate-title"
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
          id="concierge-gate-title"
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
          チャット API は本ゲート通過まで HTTP 403 で物理遮断されます。
        </p>
      </div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent"
      />
    </div>
  );
}
