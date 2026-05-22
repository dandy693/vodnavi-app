import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { ProductGrid } from "@/components/product-grid";
import { fetchItemList } from "@/lib/fanza/client";
import type { DmmItem, DmmSort } from "@/lib/fanza/types";
import { getGenreEditorial } from "@/lib/genre-editorial";
import {
  absoluteUrl,
  compactDescription,
  compactTitle,
} from "@/lib/site";

export const revalidate = 0;

type Params = { id: string };
type Search = { sort?: string };

async function getGenrePage(
  id: string,
  sort: DmmSort = "date",
): Promise<{
  items: DmmItem[];
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

async function getRelatedGenres(
  excludeId: string,
  limit = 18,
): Promise<{ id: number; name: string }[]> {
  try {
    const data = await fetchItemList({
      site: "FANZA",
      service: "digital",
      floor: "videoa",
      sort: "rank",
      hits: 30,
    });
    const excludeNum = Number(excludeId);
    const seen = new Set<number>();
    const out: { id: number; name: string }[] = [];
    for (const item of data.result.items ?? []) {
      for (const g of item.iteminfo?.genre ?? []) {
        if (g.id === excludeNum) continue;
        if (seen.has(g.id)) continue;
        seen.add(g.id);
        out.push({ id: g.id, name: g.name });
        if (out.length >= limit) return out;
      }
    }
    return out;
  } catch {
    return [];
  }
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
  if (page.items.length === 0) {
    return {
      title: "ジャンルが見つかりません",
      robots: { index: false, follow: false },
    };
  }
  const metaName = page.genreName ?? "選択ジャンル";

  const title = compactTitle(`${metaName} 一覧｜新作VOD`);
  const description = compactDescription(
    `「${metaName}」ジャンルの最新 VOD 作品 ${page.totalCount.toLocaleString(
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
  if (page.items.length === 0) notFound();
  const displayName = page.genreName ?? "選択ジャンル";

  const editorial = getGenreEditorial(id);
  const relatedGenres = await getRelatedGenres(id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-amber-300">
          ホーム
        </Link>
        <span className="mx-2">›</span>
        <span>ジャンル</span>
        <span className="mx-2">›</span>
        <span className="text-foreground/80">{displayName}</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          <span className="text-amber-300">「{displayName}」</span>
          の作品一覧
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          全 <span className="font-semibold text-amber-300 tabular-nums">
            {page.totalCount.toLocaleString("ja-JP")}
          </span> 件 / FANZA 新着順
        </p>
      </header>

      {editorial?.editorialLead && (
        <section className="mb-8 rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-4 text-sm leading-relaxed text-foreground/90 sm:px-6 sm:py-5">
          <p>{editorial.editorialLead}</p>
        </section>
      )}

      {page.items.length === 0 ? (
        <EmptyState title="このジャンルの作品はまだ表示できません" />
      ) : (
        <ProductGrid items={page.items} />
      )}

      {relatedGenres.length > 0 && (
        <section className="mt-12 border-t border-white/5 pt-8">
          <h2 className="mb-4 font-heading text-base font-semibold text-foreground sm:text-lg">
            他のジャンルを探す
          </h2>
          <ul className="flex flex-wrap gap-2">
            {relatedGenres.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/genres/${g.id}`}
                  className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-foreground/85 transition-colors hover:border-amber-400/40 hover:text-amber-300"
                >
                  {g.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
