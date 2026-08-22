"use client";

import Link from "next/link";

import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * `/sale` への内部導線（第95便 CSO裁定③ / 実装 2026-08-22）。
 *
 * 【なぜ専用の部品か】`/sale` は**内部遷移**であり `FanzaAffiliateLink` を通らない。
 * そのため `product_click` / `ai_affiliate_click` の双発には乗らない。
 * **既存の `ArticleGuideLinks`（`article_guide_click`）と同型で、送客量だけを計装する。**
 * アフィリエイト URL を一切扱わないため `scripts/guard-affiliate-id.mjs` の静的検査に抵触しない。
 *
 * 【GA4】イベント名 **`sale_entry_click`**、`placement` で入口を分ける。
 * **これはアフィリエイトクリックではない。** 判定ゲート指標①の分子にも
 * `/sale` の成果判定の分子にも含めないこと。
 *
 * 【事前登録・CSO裁定③で承認済み】**押されない可能性を織り込んである。**
 * β/α では works 詳細のアンカーを3→6本に増やし mobile FV へ昇格させて
 * **8日経過して `works_to_articles_cta` が 0件**だった（2026-08-21 判定）。
 * **「張れば押される」とは想定しない。0件でも驚かない。**
 * 0件だった場合に言えるのは「その入口では押されない」までであり、
 * 「セールに需要が無い」ではない。
 */
export type SaleEntryPlacement = "nav_sale" | "footer_sale" | "detail_sale_badge";

export function SaleEntryLink({
  placement,
  children,
  className,
  ariaLabel,
  sourceId,
}: {
  placement: SaleEntryPlacement;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  /** 入口が作品固有のとき（案 a の works 詳細バッジ）に content_id を渡す。 */
  sourceId?: string;
}) {
  return (
    <Link
      href="/sale"
      aria-label={ariaLabel}
      onClick={() => {
        // transport_type=beacon: ナビゲーション中のリクエスト脱落を防ぐ
        // （ArticleGuideLinks / ConciergeCtaLink と同じ方針）。
        track("sale_entry_click", {
          placement,
          ...(sourceId ? { source_id: sourceId } : {}),
          transport_type: "beacon",
        });
      }}
      className={cn(className)}
    >
      {children}
    </Link>
  );
}
