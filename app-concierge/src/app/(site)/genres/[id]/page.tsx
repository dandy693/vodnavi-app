import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { ProductGrid } from "@/components/product-grid";
import { fetchItemList } from "@/lib/fanza/client";
import type { DmmSort } from "@/lib/fanza/types";
import {
  absoluteUrl,
  compactDescription,
  compactTitle,
} from "@/lib/site";

// 一時的にキャッシュを完全無効化し、画像フィルタの動作を本番でログ確認するため。
// プレースホルダ除外が安定したら revalidate を 300 に戻す。
export const revalidate = 0;

type Params = { id: string };
type Search = { sort?: string };

async function getGenrePage(
  id: string,
  sort: DmmSort = "date",
): Promise<{
  items: Awaited<ReturnType<typeof fetchItemList>>["result"]["items"];
  totalCount: number;
  genreName: string | null;
}> {
  const data = await fetchItemList({
    site: "FANZA",
    service: "digital",
    floor: "videoa",
    article: "genre",
    article_id: id,
    sort,
    hits: 30,
  });
  const items = data.result.items ?? [];
  const genreId = Number(id);
  const genreName =
    items
      .flatMap((item) => item.iteminfo?.genre ?? [])
      .find((g) => g.id === genreId)?.name ?? null;
  return {
    items,
    totalCount: data.result.total_count ?? 0,
    genreName,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  let page;
  try {
    page = await getGenrePage(id);
  } catch {
    return {
      title: "ジャンルが見つかりません",
      robots: { index: false, follow: false },
    };
  }
  if (!page.genreName) {
    return {
      title: "ジャンルが見つかりません",
      robots: { index: false, follow: false },
    };
  }

  const title = compactTitle(`${page.genreName} 一覧｜新作VOD`);
  const description = compactDescription(
    `「${page.genreName}」ジャンルの最新 VOD 作品 ${page.totalCount.toLocaleString(
      "ja-JP",
    )} 件。FANZA から厳選した話題作・新作をスマホで一覧。今夜の極上に最短ルートで。`,
  );

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/genres/${id}`) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/genres/${id}`),
      type: "website",
      siteName: "VODNAVI",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { id } = await params;
  const { sort: sortParam } = await searchParams;
  const sort = (sortParam as DmmSort | undefined) ?? "date";

  let page;
  try {
    page = await getGenrePage(id, sort);
  } catch {
    notFound();
  }
  if (!page.genreName) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-amber-300">
          ホーム
        </Link>
        <span className="mx-2">›</span>
        <span>ジャンル</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          <span className="text-amber-300">「{page.genreName}」</span>
          の作品一覧
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          全 <span className="font-semibold text-amber-300 tabular-nums">
            {page.totalCount.toLocaleString("ja-JP")}
          </span> 件 / FANZA 新着順
        </p>
      </header>

      {page.items.length === 0 ? (
        <EmptyState title="このジャンルの作品はまだ表示できません" />
      ) : (
        <ProductGrid items={page.items} />
      )}
    </div>
  );
}
