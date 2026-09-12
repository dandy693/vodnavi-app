import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { ProductGrid } from "@/components/product-grid";
import { fetchItemList } from "@/lib/fanza/client";
import {
  logUpstreamServed,
  resolveAcrossFloors,
} from "@/lib/fanza/upstream-failure";
import {
  FANZA_FLOORS,
  normalizeFloorForUrl,
  type DmmItem,
  type DmmSort,
} from "@/lib/fanza/types";
import { getGenreEditorial } from "@/lib/genre-editorial";
import {
  absoluteUrl,
  compactDescription,
  compactTitle,
} from "@/lib/site";

export const revalidate = 300;

type Params = { id: string };
type Search = { sort?: string };

// sitemap.ts は全フロア (videoa/anime/nikkatsu) の item から genre を収集して
// /genres/{id} を出力する。一方このページが videoa 固定で genre を引いていたため、
// anime/nikkatsu 専属ジャンルは videoa で 0件 → notFound() → 404 となり、sitemap が
// 出した URL を route 自身が殺す「能動的シグナル汚染」を起こしていた (BRIEF_060)。
// → 実在フロアを巡回し最初に items>0 のフロアを採択する (B-1)。候補は FANZA_FLOORS の
// apiFloor/code 重複排除で導出 (amateur は apiFloor=videoa に吸収)。全フロアとも
// service="digital"。
const GENRE_FLOORS = Array.from(
  new Set(FANZA_FLOORS.map((f) => f.apiFloor ?? f.code)),
);

async function getGenrePage(
  id: string,
  sort: DmmSort = "date",
): Promise<{
  items: DmmItem[];
  totalCount: number;
  genreName: string | null;
  floor: string;
}> {
  const genreId = Number(id);
  // E6①（第124便 裁定5・案A・2026-09-12）: 1 フロアの取得失敗は致命ではなく次フロアを
  // 試す（従来どおり）。ただし「どのフロアでも見つからず、かつ 1 フロアでも失敗した」
  // 場合は不在と断定できないため throw → error.tsx → HTTP 500。404（items 空）を
  // 返すのは全フロアが正常応答して該当なしのときだけ（FACT_GOVERNANCE §24-12(B)①）。
  const resolved = await resolveAcrossFloors(GENRE_FLOORS, async (floor) => {
    const data = await fetchItemList({
      site: "FANZA",
      service: "digital",
      floor,
      article: "genre",
      article_id: id,
      sort,
      hits: 30,
    });
    const items = data.result.items ?? [];
    if (items.length === 0) return null;
    return { items, totalCount: data.result.total_count ?? 0 };
  });
  if (resolved.kind === "empty") {
    // どのフロアにも該当ジャンルの作品が無い → 呼び出し側が length===0 で notFound()。
    return { items: [], totalCount: 0, genreName: null, floor: GENRE_FLOORS[0] };
  }
  const { items, totalCount } = resolved.value;
  const genreName =
    items
      .flatMap((item) => item.iteminfo?.genre ?? [])
      .find((g) => g.id === genreId)?.name ?? null;
  return { items, totalCount, genreName, floor: resolved.floor };
}

async function getRelatedGenres(
  excludeId: string,
  floor = "videoa",
  limit = 18,
): Promise<{ id: number; name: string }[]> {
  try {
    const data = await fetchItemList({
      site: "FANZA",
      service: "digital",
      floor,
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
  // E6①: 上流失敗は generateMetadata でも握らない（握ると 500 ページに
  // 「見つかりません」の title が付く）。throw → error.tsx → HTTP 500。
  const page = await getGenrePage(id);
  if (page.items.length === 0) {
    return {
      title: "ジャンルが見つかりません",
      robots: { index: false, follow: false },
    };
  }
  const metaName = page.genreName ?? "選択ジャンル";

  const title = compactTitle(`${metaName} 一覧｜新作VOD`);
  const editorial = getGenreEditorial(id);
  const description = editorial?.editorialLead
    ? compactDescription(editorial.editorialLead)
    : compactDescription(
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

function buildGenreLd({
  id,
  name,
  items,
  totalCount,
}: {
  id: string;
  name: string;
  items: DmmItem[];
  totalCount: number;
}): Record<string, unknown> {
  const url = absoluteUrl(`/genres/${id}`);
  // ItemList の url に affiliateURL（al.dmm + af_id）を置くと bot の URL fetch が
  // DMM クリックとして計上される（2026-06-24〜 クリック25倍事故の主因経路）。
  // 可視カードと同じ内部詳細 URL を記述する（af_id 入り URL の記載は禁止）。
  const itemListElement = items.slice(0, 20).map((item, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    url: absoluteUrl(
      `/works/${normalizeFloorForUrl(item.floor_code)}/${item.content_id}`,
    ),
    name: item.title,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url,
    name: `「${name}」の作品一覧`,
    about: { "@type": "Thing", name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalCount,
      itemListElement,
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
  } catch (e) {
    // E6①: 上流失敗は 404 ではなく 500（error.tsx）。真の不在は下の length===0 のみ。
    logUpstreamServed(`genres/${id}`, e, 500);
    throw e;
  }
  if (page.items.length === 0) notFound();
  const displayName = page.genreName ?? "選択ジャンル";

  const editorial = getGenreEditorial(id);
  const relatedGenres = await getRelatedGenres(id, page.floor);
  const collectionLd = buildGenreLd({
    id,
    name: displayName,
    items: page.items,
    totalCount: page.totalCount,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <script
        type="application/ld+json"
        // schema.org payload — string is the canonical wire format
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
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
        <ProductGrid items={page.items} surface="genres" />
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
