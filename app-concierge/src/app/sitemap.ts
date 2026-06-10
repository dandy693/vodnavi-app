import type { MetadataRoute } from "next";

import { fetchItemList } from "@/lib/fanza/client";
import { FANZA_FLOORS } from "@/lib/fanza/types";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const HITS_PER_REQUEST = 100;
const PAGES_PER_FLOOR = 4;
const MAX_GENRES = 200;
const MAX_ACTRESSES = 200;

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
  const actressMap = new Map<number, Date>();

  for (const floor of FANZA_FLOORS) {
    // FANZA Webservice 側に投げる floor は `apiFloor` 優先（`amateur` のように
    // UI 上の擬似 floor を本物の `videoa` へ吸い上げるブリッジ）。これを尊重しないと
    // FANZA は不明 floor として **関係ない items** を返すか、エラーを返す。
    const apiFloorParam = floor.apiFloor ?? floor.code;
    for (let page = 0; page < PAGES_PER_FLOOR; page++) {
      try {
        const data = await fetchItemList(
          {
            site: "FANZA",
            service: floor.service,
            floor: apiFloorParam,
            hits: HITS_PER_REQUEST,
            offset: page * HITS_PER_REQUEST + 1,
            sort: "date",
          },
          { skipImageValidation: true },
        );
        const items = data.result.items ?? [];
        if (items.length === 0) break;

        for (const item of items) {
          // sitemap が出力する URL の `[floor]` セグメントは **FANZA_FLOORS の
          // `code`** を単一情報源とする。`item.floor_code` (FANZA API レスポンス
          // の値) をそのまま使うと `code` リストにない値が混入し、詳細ページ
          // (works/[floor]/[id]) のフォールバック経路で別 floor で API を叩き、
          // 当然見つからず notFound() → 404 化する。GSC で本日 289 件観測の
          // 「見つかりませんでした (404)」の構造発生源。
          const path = `/works/${floor.code}/${item.content_id}`;
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

          // 女優ハブ (柱①)。works を走査した同じフロア群から actress を集約するため、
          // /actresses/{id} は actresses/[id] ページの floor-walk で必ず items>0 で着地し、
          // genre で起きた sitemap↔route のフロア不整合 (BRIEF_060) は発生しない。
          for (const actress of item.iteminfo?.actress ?? []) {
            const prev = actressMap.get(actress.id);
            if (!prev || itemDate > prev) actressMap.set(actress.id, itemDate);
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

  const actresses: MetadataRoute.Sitemap = Array.from(actressMap.entries())
    .slice(0, MAX_ACTRESSES)
    .map(([id, lastModified]) => ({
      url: absoluteUrl(`/actresses/${id}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // pagination URL (`/?floor=videoa&page=2` 等) は <loc> に **生の `&`** を出力して XML の
  // 整形式を壊す。この Next.js の sitemap serializer は `&` を `&amp;` へ自動エスケープしない
  // ため (旧コメントの「serialize されるのでエンコード不要」は事実誤認)、GSC で 52 行目
  // 「解析エラー / 認識できないエントリ」を誘発し、後続の works/genres 約1,800 URL を巻き込んで
  // 「検出 0 ページ」化していた (2026-06-10 診断 / project_app_sitemap_parse_error)。
  // SEO 価値の低い優先度0.5 の周辺 URL のため、整形式回復を最優先に pagination 出力を廃止する。
  // (floor ランディング `/?floor=videoa` は単一パラメータで `&` を含まないため維持)

  return [...root, ...floors, ...works, ...genres, ...actresses];
}
