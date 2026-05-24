import type { MetadataRoute } from "next";

import { fetchItemList } from "@/lib/fanza/client";
import { FANZA_FLOORS } from "@/lib/fanza/types";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const HITS_PER_REQUEST = 100;
const PAGES_PER_FLOOR = 4;
const MAX_GENRES = 200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const root: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/disclaimer"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const floors: MetadataRoute.Sitemap = FANZA_FLOORS.map((floor) => ({
    url: absoluteUrl(`/?floor=${floor.code}`),
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const seenWorks = new Set<string>();
  const works: MetadataRoute.Sitemap = [];
  const genreMap = new Map<number, Date>();

  for (const floor of FANZA_FLOORS) {
    for (let page = 0; page < PAGES_PER_FLOOR; page++) {
      try {
        const data = await fetchItemList(
          {
            site: "FANZA",
            service: floor.service,
            floor: floor.code,
            hits: HITS_PER_REQUEST,
            offset: page * HITS_PER_REQUEST + 1,
            sort: "date",
          },
          { skipImageValidation: true },
        );
        const items = data.result.items ?? [];
        if (items.length === 0) break;

        for (const item of items) {
          const path = `/works/${item.floor_code}/${item.content_id}`;
          if (seenWorks.has(path)) continue;
          seenWorks.add(path);

          const itemDate = item.date
            ? new Date(item.date.replace(" ", "T"))
            : now;
          works.push({
            url: absoluteUrl(path),
            lastModified: itemDate,
            changeFrequency: "weekly",
            priority: 0.8,
          });

          for (const genre of item.iteminfo?.genre ?? []) {
            const prev = genreMap.get(genre.id);
            if (!prev || itemDate > prev) genreMap.set(genre.id, itemDate);
          }
        }

        if (items.length < HITS_PER_REQUEST) break;
      } catch {
        break;
      }
    }
  }

  const genres: MetadataRoute.Sitemap = Array.from(genreMap.entries())
    .slice(0, MAX_GENRES)
    .map(([id, lastModified]) => ({
      url: absoluteUrl(`/genres/${id}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // 全フロアの page=2..10 を indexable に展開（pagination の SEO 母集団拡大）。
  // FANZA_FLOORS の正典 code のみを使うため、不正 code (例 adult_movie) 混入なし。
  const PAGINATION_DEPTH = 10;
  const pagination: MetadataRoute.Sitemap = FANZA_FLOORS.flatMap((floor) =>
    Array.from({ length: PAGINATION_DEPTH - 1 }, (_, i) => ({
      url: absoluteUrl(`/?floor=${floor.code}&page=${i + 2}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.5,
    })),
  );

  return [...root, ...floors, ...pagination, ...works, ...genres];
}
