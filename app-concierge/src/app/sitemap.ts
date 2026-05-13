import type { MetadataRoute } from "next";

import { fetchItemList } from "@/lib/fanza/client";
import { FANZA_FLOORS } from "@/lib/fanza/types";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const SITEMAP_HITS = 100;

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

  try {
    const data = await fetchItemList({
      site: "FANZA",
      service: "digital",
      floor: "videoa",
      hits: SITEMAP_HITS,
      sort: "date",
    });
    const items = data.result.items ?? [];

    const works: MetadataRoute.Sitemap = items.map((item) => ({
      url: absoluteUrl(`/works/${item.floor_code}/${item.content_id}`),
      lastModified: item.date
        ? new Date(item.date.replace(" ", "T"))
        : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const genreMap = new Map<number, Date>();
    for (const item of items) {
      const itemDate = item.date
        ? new Date(item.date.replace(" ", "T"))
        : now;
      for (const genre of item.iteminfo?.genre ?? []) {
        const prev = genreMap.get(genre.id);
        if (!prev || itemDate > prev) genreMap.set(genre.id, itemDate);
      }
    }

    const genres: MetadataRoute.Sitemap = Array.from(genreMap.entries())
      .slice(0, 100)
      .map(([id, lastModified]) => ({
        url: absoluteUrl(`/genres/${id}`),
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    return [...root, ...floors, ...works, ...genres];
  } catch {
    return [...root, ...floors];
  }
}
