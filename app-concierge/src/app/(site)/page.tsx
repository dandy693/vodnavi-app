import { Suspense } from "react";

import { ConfigErrorPanel } from "@/components/config-error";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { HeroSection, type HeroCopy } from "@/components/hero-section";
import { ProductGrid } from "@/components/product-grid";
import { SearchForm } from "@/components/search-form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  resolveConciergeSource,
  type ConciergeSource,
} from "@/lib/concierge/sources";
import {
  FanzaApiError,
  FanzaConfigError,
  fetchItemList,
  pickImage,
} from "@/lib/fanza/client";
import { FANZA_FLOORS, type DmmSort } from "@/lib/fanza/types";
import { absoluteUrl } from "@/lib/site";

const DEFAULT_FLOOR = "videoa";
const DEFAULT_SORT: DmmSort = "date";
const HITS = 30;

export const revalidate = 300;

type HomeSearchParams = {
  keyword?: string;
  sort?: string;
  floor?: string;
  source?: string;
};

// チャネル別ヒーローコピー。null/undefined/未知の値は default に明示フォールバックする。
function selectHeroCopy(source: ConciergeSource): HeroCopy {
  switch (source) {
    case "moterist":
      return {
        badge: "MOTERIST EXPRESS",
        headlineLead: "最短30秒、迷いを断つ。VOD選びの",
        headlineHighlight: "特攻隊長",
        headlineTail: "、起動。",
        subcopy:
          "どのVODが一番得か？今すぐ観れるのはどこか？コスパとスピードを重視した最速の結論を、限定AIが即答します。",
        ctaLabel: "特攻隊長 AI を起動",
      };
    case "brand":
      return {
        badge: "VODNAVI PREMIUM",
        headlineLead: "VODナビ・",
        headlineHighlight: "プレミアム",
        headlineTail: "。あなたに相応しい、至高の視聴体験を。",
        subcopy:
          "数あるサービスの中から、あなたのライフスタイルと好みに調和する一本を。信頼と実績に基づいた、唯一無二のコンシェルジュ。",
        ctaLabel: "プレミアム・コンシェルジュへ",
      };
    case "default":
    default:
      return {
        badge: "AI VOD CONCIERGE",
        headlineLead: "あなたに、",
        headlineHighlight: "最高の『観たい』",
        headlineTail: "を。VODコンシェルジュがご案内します。",
        subcopy:
          "作品数、料金、画質。あらゆる角度から比較して、あなたにぴったりのVODサービスを無料で見つけ出します。",
        ctaLabel: "AI コンシェルジュに相談する",
      };
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const floor = params.floor ?? DEFAULT_FLOOR;
  const sort = (params.sort as DmmSort | undefined) ?? DEFAULT_SORT;
  const keyword = params.keyword?.trim() || undefined;
  const sourceId = resolveConciergeSource(params.source).id;
  const heroCopy = selectHeroCopy(sourceId);

  const floorMeta =
    FANZA_FLOORS.find((f) => f.code === floor) ?? FANZA_FLOORS[0];

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <ResultsSection
          floor={floorMeta.code}
          service={floorMeta.service}
          sort={sort}
          keyword={keyword}
          source={sourceId}
          heroCopy={heroCopy}
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
  source,
  heroCopy,
}: {
  floor: string;
  service: string;
  sort: DmmSort;
  keyword?: string;
  source: ConciergeSource;
  heroCopy: HeroCopy;
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

  // ItemList JSON-LD は items が空（FANZA 失敗 or 該当なし）の時は emit しない。
  // 空 itemListElement で Google の "missing field" 警告を出さないため。
  const itemListLd =
    items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((it, idx) => {
            const image = pickImage(it.imageURL);
            const url = absoluteUrl(
              `/works/${it.floor_code}/${it.content_id}`,
            );
            return {
              "@type": "ListItem",
              position: idx + 1,
              url,
              name: it.title,
              ...(image ? { image } : {}),
            };
          }),
        }
      : null;

  return (
    <>
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}
      <HeroSection totalCount={totalCount} source={source} copy={heroCopy} />

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
