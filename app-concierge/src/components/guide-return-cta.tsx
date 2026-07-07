"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { trackAiAffiliateClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * U2: ガイド記事クロージングの「作品ページに戻って観る」CTA。
 *
 * 直前に見ていた作品詳細（same-origin の /works/... リファラ）へ戻す。
 * リファラ取得不可・外部リファラ時はトップ（人気作品一覧）へフォールバック
 * （CSO 発注 2026-07-07 の指定挙動）。リファラは client でしか読めないため
 * client component。GA4 は placement="guide_first_purchase_cta" で分離計測
 * （内部遷移だが placement 軸でフィルタ可能なため既存系列を汚染しない）。
 */
export function GuideReturnCta({ className }: { className?: string }) {
  const [target, setTarget] = useState("/");

  useEffect(() => {
    try {
      const ref = document.referrer;
      if (!ref) return;
      const u = new URL(ref);
      if (
        u.origin === window.location.origin &&
        u.pathname.startsWith("/works/")
      ) {
        setTarget(u.pathname);
      }
    } catch {
      // リファラが URL として不正な場合はフォールバック（"/"）のまま。
    }
  }, []);

  const isWorkReturn = target.startsWith("/works/");
  const parts = target.split("/").filter(Boolean); // ["works", floor, id]

  return (
    <a
      href={target}
      className={cn(
        "btn-luxury-gold inline-flex w-full items-center justify-center gap-2 rounded-xl",
        "min-h-12 px-5 py-3 text-sm font-semibold",
        "group",
        className,
      )}
      onClick={() => {
        trackAiAffiliateClick({
          asp_name: "fanza",
          content_id: isWorkReturn ? (parts[2] ?? "unknown") : "top_fallback",
          title: "guide_return",
          floor_code: isWorkReturn ? (parts[1] ?? "videoa") : "videoa",
          link_variant: "primary",
          placement: "guide_first_purchase_cta",
          transport_type: "beacon",
        });
      }}
    >
      <span>作品ページに戻って観る</span>
      <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
    </a>
  );
}
