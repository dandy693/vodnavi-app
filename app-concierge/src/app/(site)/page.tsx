import Link from "next/link";
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
  page?: string;
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

  // ページ番号を型安全に数値化（不正な値 / NaN は 1 にフォールバック）
  const parsedPage = parseInt(params.page ?? "1", 10);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  // FANZA API は 1-indexed offset (page 1 → offset 1, page 2 → offset 31, ...)
  const currentOffset = (currentPage - 1) * HITS + 1;

  const floorMeta =
    FANZA_FLOORS.find((f) => f.code === floor) ?? FANZA_FLOORS[0];

  // FANZA API 送信時の実 floor は apiFloor 指定があればそちら（例: amateur → videoa）。
  // ユーザ keyword と inject keyword は空白区切りで AND 結合（FANZA の検索は space=AND）。
  const apiFloor = floorMeta.apiFloor ?? floorMeta.code;
  const apiKeyword = floorMeta.injectKeyword
    ? [floorMeta.injectKeyword, keyword].filter(Boolean).join(" ")
    : keyword;

  // pagination URL builder — URL には raw 値 (params.floor / params.keyword) を保つ。
  // apiFloor / apiKeyword は internal で URL には現れない。
  function buildPageUrl(page: number): string {
    const sp = new URLSearchParams();
    if (params.floor && params.floor !== DEFAULT_FLOOR)
      sp.set("floor", params.floor);
    if (params.sort && params.sort !== DEFAULT_SORT) sp.set("sort", params.sort);
    if (keyword) sp.set("keyword", keyword);
    if (params.source) sp.set("source", params.source);
    if (page > 1) sp.set("page", String(page));
    const qs = sp.toString();
    return qs ? `/?${qs}` : "/";
  }

  const prevPageHref = currentPage > 1 ? buildPageUrl(currentPage - 1) : null;
  const nextPageHref = buildPageUrl(currentPage + 1);

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <ResultsSection
          floor={apiFloor}
          service={floorMeta.service}
          sort={sort}
          keyword={apiKeyword}
          source={sourceId}
          heroCopy={heroCopy}
          offset={currentOffset}
          currentPage={currentPage}
          prevPageHref={prevPageHref}
          nextPageHref={nextPageHref}
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
  offset,
  currentPage,
  prevPageHref,
  nextPageHref,
}: {
  floor: string;
  service: string;
  sort: DmmSort;
  keyword?: string;
  source: ConciergeSource;
  heroCopy: HeroCopy;
  offset: number;
  currentPage: number;
  prevPageHref: string | null;
  nextPageHref: string;
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
      offset,
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
          <>
            <ProductGrid items={items} />
            <Pagination
              currentPage={currentPage}
              hasNext={
                totalCount !== undefined && currentPage * HITS < totalCount
              }
              prevPageHref={prevPageHref}
              nextPageHref={nextPageHref}
              totalPages={
                totalCount !== undefined
                  ? Math.max(1, Math.ceil(totalCount / HITS))
                  : undefined
              }
            />
          </>
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

function Pagination({
  currentPage,
  hasNext,
  prevPageHref,
  nextPageHref,
  totalPages,
}: {
  currentPage: number;
  hasNext: boolean;
  prevPageHref: string | null;
  nextPageHref: string;
  totalPages?: number;
}) {
  if (!prevPageHref && !hasNext) return null;
  return (
    <nav
      aria-label="ページネーション"
      className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 text-sm"
    >
      {prevPageHref ? (
        <Link
          href={prevPageHref}
          className="rounded-full border border-white/15 px-4 py-2 text-muted-foreground transition-colors hover:border-amber-300/40 hover:text-amber-200"
        >
          ← 前のページ
        </Link>
      ) : (
        <span aria-hidden className="invisible">
          ← 前のページ
        </span>
      )}
      <span className="text-xs text-muted-foreground">
        ページ {currentPage}
        {totalPages !== undefined && ` / ${totalPages}`}
      </span>
      {hasNext ? (
        <Link
          href={nextPageHref}
          className="rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-amber-200 transition-colors hover:border-amber-300/60 hover:bg-amber-300/15"
        >
          次のページ →
        </Link>
      ) : (
        <span aria-hidden className="invisible">
          次のページ →
        </span>
      )}
    </nav>
  );
}
