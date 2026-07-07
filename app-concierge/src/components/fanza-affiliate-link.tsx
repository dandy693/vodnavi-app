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
  placement:
    | "detail_main_cta"
    | "detail_sample"
    | "detail_sticky_cta"
    | "detail_fv_cta"
    | "article_product_cta"
    // 新規会員導線 設計書v1 (2026-07-07 CSO発注) の3面。
    | "works_fv_newuser" // U1: 作品詳細FV 新規ユーザー向けマイクロモジュール
    | "guide_first_purchase_cta" // U2: はじめてのFANZAガイド記事末尾
    | "guide_tv_signup_cta" // U2: ガイド記事内 FANZA TV/プレミアム登録CTA
    | "article_sale_cta"; // U3: セール特集テンプレート
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener noreferrer sponsored"
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
          placement,
          transport_type: "beacon",
        });
      }}
    >
      {children}
    </a>
  );
}
