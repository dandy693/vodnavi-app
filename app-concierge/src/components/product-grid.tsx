import { ProductCard } from "@/components/product-card";
import type { DmmItem } from "@/lib/fanza/types";

export function ProductGrid({ items }: { items: DmmItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item, idx) => (
        <ProductCard
          key={item.content_id}
          item={item}
          priority={idx < 4}
        />
      ))}
    </div>
  );
}
