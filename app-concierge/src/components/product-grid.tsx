import { ProductCard, type ListSurface } from "@/components/product-card";
import type { DmmItem } from "@/lib/fanza/types";

export function ProductGrid({
  items,
  surface,
}: {
  items: DmmItem[];
  /** S1: 面の識別を ProductCard の GA4 placement へ引き渡す（href は不変）。 */
  surface?: ListSurface;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item, idx) => (
        <ProductCard
          key={item.content_id}
          item={item}
          priority={idx < 4}
          surface={surface}
        />
      ))}
    </div>
  );
}
