"use client";

import { useEffect, useState } from "react";

import { track } from "@/lib/analytics";

/**
 * 年齢確認モーダル（クライアント側 UI）
 *
 * BRAND_DESIGN_GUIDE.md §3「年齢確認の盾」準拠：
 *   - 背景透過なし、画面全体を覆う。
 *   - ダーク × ゴールド配色のみ。煽情画像は一切置かない（AdSense / 各社規約 BAN 防止）。
 *   - 「はい」のみ通過、「いいえ」は外部安全サイトへ離脱。
 *   - クッキーの発行は `/api/age-gate` POST 経由（サーバー側で `Set-Cookie` する）。
 */
export function AgeGateModal({ next }: { next: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // /age-gate ページは未通過ユーザー専用の到達面。マウント時に一度発火。
  useEffect(() => {
    track("age_gate_view", { gate: "age_gate_page" });
  }, []);

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
      track("age_gate_agree", { gate: "age_gate_page" });
      // ハードナビゲーション（middleware を再評価させて、新クッキーで通過させる）
      window.location.href = next;
    } catch {
      setError("通信に失敗しました。ネットワークを確認してください。");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-dark px-6 py-12 text-center">
      {/* 上部の金箔ライン */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent"
      />

      <div className="w-full max-w-md">
        <p className="font-luxury-heading text-xs tracking-[0.35em] text-brand-gold/80">
          VODNAVI · 年齢確認
        </p>
        {/* 【2026-09-05・第120便 補遺1 A】`font-luxury-heading` は Cormorant Garamond で、
            **既定の数字がオールドスタイル（非ライニング）**である。実描画では「18」が
            `ɪ8`（1 が小文字高・8 がアセンダ付き）となり、同ページ本文の Noto Sans JP 側の
            「満 18 歳以上」（ライニング数字）と字形が食い違っていた。
            `lining-nums` を当てて数字の高さを揃える。**文言は一切変更していない**
            （年齢確認は法的定型のため可読性のみ触る、という裁定に従う）。 */}
        <h1 className="mt-4 font-luxury-heading text-3xl leading-tight text-brand-text-primary lining-nums sm:text-4xl">
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
            className="btn-luxury-gold lining-nums disabled:opacity-50"
          >
            {busy ? "確認中…" : "はい、18 歳以上です"}
          </button>
          <a
            href="https://www.google.com/"
            rel="noopener noreferrer"
            onClick={() =>
              track("age_gate_bounce", {
                gate: "age_gate_page",
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
          確認結果はクッキー（<span className="font-mono text-brand-gold/80">vodnavi_age_verified</span>、有効期限 1 年）として保存されます。
          本ゲートを通過せずにコンシェルジュ機能・API へ到達することはできません（HTTP 403）。
        </p>
      </div>

      {/* 下部の金箔ライン */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent"
      />
    </div>
  );
}
