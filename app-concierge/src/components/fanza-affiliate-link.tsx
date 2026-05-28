"use client";

import type { ReactNode } from "react";

import { trackAiAffiliateClick, trackProductClick } from "@/lib/analytics";

/**
 * 詳細ページ (works/[floor]/[id]) は server component なので、FANZA アフィリエイト
 * リンクのクリックを GA4 に通知するには client component の薄いラッパーが必要。
 *
 * 2026-05-25 監査で判明: 推薦カードの「今すぐ視聴」(L571 の <a>) はほぼ使われず、
 * 実ユーザーはカード画像 → 内部詳細ページ経由 (L496) で着地するため、過去全期間で
 * `ai_affiliate_click` は 0件発火だった。本コンポーネントで詳細ページからの FANZA
 * 遷移にも `product_click` + `ai_affiliate_click` 双発を仕込み、コンバージョン
 * ファネルの最終ステップを GA4 で観測可能にする。
 *
 * placement は `product_click` イベントで「メイン CTA」か「サンプル画像経由」かを
 * 区別する。`ai_affiliate_click` の link_variant は両方とも "primary"
 * (両方とも意図的な FANZA 遷移、fallback ではない)。
 */
export function FanzaAffiliateLink({
  href,
  content_id,
  title,
  floor_code,
  placement,
  className,
  children,
}: {
  href: string;
  content_id: string;
  title: string;
  floor_code: string;
  placement: "detail_main_cta" | "detail_sample" | "detail_sticky_cta";
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={() => {
        trackProductClick({
          asp_name: "fanza",
          content_id,
          title,
          floor_code,
          placement,
          link_target: "fanza_affiliate",
          transport_type: "beacon",
        });
        trackAiAffiliateClick({
          asp_name: "fanza",
          content_id,
          title,
          floor_code,
          link_variant: "primary",
          transport_type: "beacon",
        });
      }}
    >
      {children}
    </a>
  );
}
