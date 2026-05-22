"use client";

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
import type { DmmItem } from "@/lib/fanza/types";
import { cn } from "@/lib/utils";

export function ProductCard({
  item,
  priority = false,
}: {
  item: DmmItem;
  priority?: boolean;
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
  const detailHref = `/works/${item.floor_code}/${item.content_id}`;
  const affiliateHref = item.affiliateURL ?? item.URL;

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

      <a
        href={affiliateHref}
        target="_blank"
        rel="noopener noreferrer sponsored"
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
      </a>
    </article>
  );
}
