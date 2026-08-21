import {
  ProductCard,
  type ListSurface,
  type ProductCardSale,
} from "@/components/product-card";
import type { DmmItem } from "@/lib/fanza/types";

export function ProductGrid({
  items,
  surface,
  saleMap,
}: {
  items: DmmItem[];
  /** S1: 面の識別を ProductCard の GA4 placement へ引き渡す（href は不変）。 */
  surface?: ListSurface;
  /**
   * /sale のみ指定。`content_id` → セールバッジ。
   * **未指定なら ProductCard へ何も渡さない**＝既存3面（トップ / genres / actresses）
   * の描画は変わらない。
   */
  saleMap?: ReadonlyMap<string, ProductCardSale>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item, idx) => (
        <ProductCard
          key={item.content_id}
          item={item}
          priority={idx < 4}
          surface={surface}
          sale={saleMap?.get(item.content_id)}
        />
      ))}
    </div>
  );
}
