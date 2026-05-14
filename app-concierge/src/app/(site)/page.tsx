import { Suspense } from "react";

import { ConfigErrorPanel } from "@/components/config-error";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { HeroSection } from "@/components/hero-section";
import { ProductGrid } from "@/components/product-grid";
import { SearchForm } from "@/components/search-form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  resolveConciergeSource,
  type ConciergeSourceProfile,
} from "@/lib/concierge/sources";
import {
  FanzaApiError,
  FanzaConfigError,
  fetchItemList,
} from "@/lib/fanza/client";
import { FANZA_FLOORS, type DmmSort } from "@/lib/fanza/types";

const DEFAULT_FLOOR = "videoa";
const DEFAULT_SORT: DmmSort = "date";
const HITS = 30;

// 一時的にキャッシュを完全無効化し、画像フィルタの動作を本番でログ確認するため。
// プレースホルダ除外が安定したら revalidate を 300 などに戻す。
export const revalidate = 0;

// ?source=moterist 等のクエリパラメータでヒーローを出し分けるため、
// 必ずリクエスト毎に動的レンダリングする (Vercel CDN の暗黙的な共有を防ぐ保険)。
// Next.js 16: cacheComponents 未使用時は引き続き有効 (v16.0.0 リリースノート参照)。
export const dynamic = "force-dynamic";

type HomeSearchParams = {
  keyword?: string;
  sort?: string;
  floor?: string;
  source?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const floor = params.floor ?? DEFAULT_FLOOR;
  const sort = (params.sort as DmmSort | undefined) ?? DEFAULT_SORT;
  const keyword = params.keyword?.trim() || undefined;
  const sourceProfile = resolveConciergeSource(params.source);

  const floorMeta =
    FANZA_FLOORS.find((f) => f.code === floor) ?? FANZA_FLOORS[0];

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <ResultsSection
          floor={floor}
          service={floorMeta.service}
          sort={sort}
          keyword={keyword}
          sourceProfile={sourceProfile}
        />
      </Suspense>
    </>
  );
}

async function ResultsSection({
  floor,
  service,
  sort,
  keyword,
  sourceProfile,
}: {
  floor: string;
  service: string;
  sort: DmmSort;
  keyword?: string;
  sourceProfile: ConciergeSourceProfile;
}) {
  let totalCount: number | undefined;
  let items: Awaited<ReturnType<typeof fetchItemList>>["result"]["items"] = [];
  let configError: string | null = null;
  let apiError: string | null = null;

  try {
    const data = await fetchItemList({
      site: "FANZA",
      service,
      floor,
      sort,
      hits: HITS,
      keyword,
    });
    items = data.result.items ?? [];
    totalCount = data.result.total_count;
  } catch (err) {
    if (err instanceof FanzaConfigError) {
      configError = err.message;
    } else if (err instanceof FanzaApiError) {
      apiError = `FANZA API でエラーが発生しました (status: ${err.status})`;
    } else {
      apiError = "予期せぬエラーが発生しました";
    }
  }

  return (
    <>
      <HeroSection totalCount={totalCount} sourceProfile={sourceProfile} />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-col gap-3">
          <SearchForm />
          <div className="flex items-center justify-between gap-3">
            <FilterBar />
            {keyword && (
              <p className="text-xs text-muted-foreground">
                <span className="text-amber-300">「{keyword}」</span>
                の検索結果
              </p>
            )}
          </div>
        </div>

        {configError ? (
          <ConfigErrorPanel message={configError} />
        ) : apiError ? (
          <EmptyState
            title="作品を取得できませんでした"
            description={apiError}
          />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <ProductGrid items={items} />
        )}
      </section>
    </>
  );
}

function HeroSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-10 w-2/3" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-[3/4] w-full rounded-xl"
          />
        ))}
      </div>
    </section>
  );
}
