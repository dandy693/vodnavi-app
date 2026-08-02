"use client";

import { FanzaAffiliateLink } from "@/components/fanza-affiliate-link";
import { FanzaImage } from "@/components/fanza-image";
import Link from "next/link";
import { useState } from "react";

import {
  formatPrice,
  isNewItem,
  isPlaceholderImageUrl,
  joinNames,
  pickImage,
} from "@/lib/fanza/client";
import { buildAffiliateURL } from "@/lib/concierge/url-builder";
import type { DmmItem } from "@/lib/fanza/types";
import { normalizeFloorForUrl } from "@/lib/fanza/types";
import { cn } from "@/lib/utils";

/** S1: 一覧系の面を GA4 placement へ写像する（href は変更しない）。 */
export type ListSurface = "top" | "genres" | "actresses";

const SURFACE_PLACEMENT = {
  top: "list_top_card_cta",
  genres: "list_genres_card_cta",
  actresses: "list_actresses_card_cta",
} as const;

export function ProductCard({
  item,
  priority = false,
  surface,
}: {
  item: DmmItem;
  priority?: boolean;
  /** S1: 面の識別。未指定時は placement="list_card_cta"（フォールバック）。 */
  surface?: ListSurface;
}) {
  const image = pickImage(item.imageURL);
  const [imageBroken, setImageBroken] = useState(false);

  // 最終防御: 画像 URL 欠落 / NOW PRINTING 等のプレースホルダ / onError 検知 のいずれかでカードごと非表示。
  if (!image || isPlaceholderImageUrl(image) || imageBroken) return null;

  const actresses = joinNames(item.iteminfo?.actress, 2);
  const genres = joinNames(item.iteminfo?.genre, 2);
  const price = formatPrice(item.prices?.price);
  const review = item.review;
  const isNew = isNewItem(item.date);
  const detailHref = `/works/${normalizeFloorForUrl(item.floor_code)}/${item.content_id}`;

  // S4(2026-08-02 CSO承認): メイン CTA の href を API 返却の `item.affiliateURL`
  // （af_id=990 / ch=api）から単一ビルダ `buildAffiliateURL` 産の 004 リンクへ置換。
  // 990〜999 は DMM API 専用 ID で人間導線への使用は台帳で禁止されており、works
  // 詳細だけが 004 という非対称を解消する。
  //
  // 【遷移先（lurl）は変更しない】現行 990 リンクの lurl と buildAffiliateURL の
  // フロア別パス（videoa/amateur→/av/・anime→/anime/・nikkatsu→/cinema/）が一致
  // することを 2026-08-02 23:48 JST の本番実測で 72/72 一致・不一致0 として機械確認済み。
  // 変わるのは host（al.fanza.co.jp→al.dmm.co.jp）/ af_id（990→004）/
  // ch（api→link_tool&ch_id=link）の 3 点のみ＝works 詳細と同一形式。
  //
  // 404 ダブルリンク（盾④）: メイン作品 URL が配信終了で 404 化しても報酬導線を
  // 失わないよう、女優名 / 型番（無ければ content_id）で FANZA 検索結果一覧へ飛ぶ
  // フォールバックのアフィリエイト URL を併設する。af_id は buildAffiliateURL が
  // 環境変数（NEXT_PUBLIC_FANZA_AFFILIATE_ID, 盾③）から動的に解決する。
  const primaryActress = item.iteminfo?.actress?.[0]?.name ?? null;
  const skuCode = item.maker_product ?? null;
  const { primaryUrl: affiliateHref, fallbackUrl } = buildAffiliateURL({
    asp: "fanza",
    contentId: item.content_id,
    actressOrSku: primaryActress ?? skuCode,
    // S2/S4: フロア別パス。primaryUrl（メイン CTA）の lurl はここで決まるため必須。
    floor: normalizeFloorForUrl(item.floor_code),
  });
  const fallbackLabel = primaryActress
    ? `${primaryActress}の作品を探す`
    : "関連作品を探す";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card/60",
        "ring-1 ring-white/5 backdrop-blur-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:ring-amber-400/40 hover:shadow-[0_0_40px_-10px_rgba(245,200,80,0.35)]",
      )}
    >
      <Link
        href={detailHref}
        prefetch={false}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        aria-label={item.title}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
          <FanzaImage
            src={image}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            priority={priority}
            onError={() => setImageBroken(true)}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/0" />
          {isNew && (
            <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold tracking-wider text-black shadow-lg">
              NEW
            </span>
          )}
          {price && (
            <div className="absolute bottom-2 left-2 flex items-baseline gap-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              <span className="text-base font-bold text-amber-300">{price}</span>
              <span className="text-[10px] text-amber-200/80">〜</span>
            </div>
          )}
          {review?.average && (
            <div className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-amber-300 backdrop-blur">
              <span className="leading-none">★</span>
              <span className="leading-none">{review.average}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          {/* min-h-[2.5rem] でタイトルが 1 行でも 2 行でも同じ高さを確保し、
              グリッド内のカード全体（特に「今すぐ視聴」ボタン位置）を完全に揃える。 */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground">
            {item.title}
          </h3>
          {actresses && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {actresses}
            </p>
          )}
          {genres && (
            <p className="line-clamp-1 text-[11px] text-muted-foreground/70">
              {genres}
            </p>
          )}
        </div>
      </Link>

      {/* S1(2026-07-31 CSO承認): 素の <a> から FanzaAffiliateLink へ差し替え。
         works 詳細と同等の product_click / ai_affiliate_click を発火させ、面を
         placement で区別できるようにする。
         S4(2026-08-02 CSO承認): href を 990（API 専用 ID）から 004（人間導線 ID）へ
         置換済み。遷移先は不変。 */}
      <FanzaAffiliateLink
        href={affiliateHref}
        content_id={item.content_id}
        title={item.title}
        floor_code={normalizeFloorForUrl(item.floor_code)}
        placement={surface ? SURFACE_PLACEMENT[surface] : "list_card_cta"}
        className={cn(
          "relative block h-11 overflow-hidden text-center text-sm font-semibold",
          "bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-black",
          "leading-[2.75rem] tracking-wide transition-all duration-300",
          "hover:from-amber-400 hover:via-yellow-200 hover:to-amber-400",
          "active:translate-y-px",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300",
        )}
        aria-label={`${item.title} を FANZA で視聴`}
      >
        <span className="relative z-10">今すぐ視聴 →</span>
      </FanzaAffiliateLink>

      {/* 盾④ 404 フォールバック動線: 作品が配信終了でも検索一覧へ逃がす。 */}
      <a
        href={fallbackUrl}
        target="_blank"
        rel="nofollow noopener noreferrer sponsored"
        className={cn(
          "block border-t border-white/5 bg-black/40 py-1.5 text-center",
          "text-[11px] text-amber-200/70 transition-colors duration-300",
          "hover:bg-black/60 hover:text-amber-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60",
        )}
        aria-label={`「${item.title}」が配信終了の場合に ${fallbackLabel}（FANZA 検索一覧）`}
      >
        配信終了？ {fallbackLabel} →
      </a>
    </article>
  );
}
