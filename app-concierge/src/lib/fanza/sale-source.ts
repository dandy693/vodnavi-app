/**
 * セール中作品の取得（I/O 層）。判定そのものは `sale.ts`（純関数）に置く。
 *
 * 【方式＝rank 走査。keyword 方式は採らない】
 * 第92便で2方式を実測した:
 *   ① keyword 方式  … `keyword=<キャンペーン名>` で 16コール・1,062件を悉皆取得（100%）
 *   ② rank 走査方式 … 名称不要。videoa は 31コール（offset 1〜3001）で 98.9% を被覆
 * **①のほうが少ないコールで完全**だが、**キャンペーン名を定数で持つ必要がある**。
 * 名称が変われば `total_count=0` が返り、**0件のまま正常終了する**（静かな失敗）。
 * §13 の「ステータス=投稿済 は配信を保証しない」と同型の失敗モードであるため、
 * **本実装は②を採る。** 名称は取得結果の `campaign[0].title` から得る。
 *
 * 【コール数】4フロア × 4ページ = **16コール**。ただし `fetchItemList` は
 * `fetch(url, { next: { revalidate } })`（`client.ts:207`）で Data Cache に載るため、
 * **実際に FANZA を叩くのは revalidate 間隔に1回**。既存の sitemap 生成が
 * 16回/生成・384回/日（BRIEF_128 §2-1）であるのに対して十分小さい。
 *
 * 【なぜ上位4ページで足りるか（第90便の実測）】videoa の `campaign` 保有率は
 * rank offset=1 で 99% / 1001 で 14% / 3001 で 2% / 5001 以降は 0〜1%。
 * **セール対象は人気順の上位に集中している。**
 */
import { fetchItemList } from "./client";
import { dedupeByContentId, isOnSale, sortSaleItems } from "./sale";
import type { DmmItem } from "./types";

/** 走査対象のフロア。`videoc`（素人）は works 詳細のパスが videoa へ正規化される。 */
export const SALE_FLOORS = ["videoa", "anime", "nikkatsu", "videoc"] as const;

/** 1フロアあたりの走査ページ数（各100件）。 */
export const SALE_PAGES_PER_FLOOR = 4;

/** 画面に載せる上限。グリッドは5列なので24行ぶん。 */
export const SALE_DISPLAY_LIMIT = 120;

export interface FetchSaleItemsOptions {
  now: Date;
  floors?: readonly string[];
  pagesPerFloor?: number;
  revalidate?: number;
  limit?: number;
}

export interface SaleFetchResult {
  items: DmmItem[];
  /** 走査して得た「セール中」の総数（`limit` で切る前）。 */
  totalFound: number;
  /** 応答が得られたフロア。1つでも失敗すれば欠ける。 */
  okFloors: string[];
  /** 取得に失敗したフロア。**空でないことを黙って無視しない。** */
  failedFloors: string[];
}

/**
 * セール中の作品を集める。
 *
 * **1フロアが失敗しても他フロアの結果を返す**（`Promise.allSettled`）。
 * `fetchItemList` は API 障害時に stale-serve へ退避する（§7）ため、
 * ここでの失敗は「stale も無い」場合に限られる。
 */
export async function fetchSaleItems(
  options: FetchSaleItemsOptions,
): Promise<SaleFetchResult> {
  const {
    now,
    floors = SALE_FLOORS,
    pagesPerFloor = SALE_PAGES_PER_FLOOR,
    revalidate = 300,
    limit = SALE_DISPLAY_LIMIT,
  } = options;

  const offsets = Array.from({ length: pagesPerFloor }, (_, i) => 1 + i * 100);

  const settled = await Promise.allSettled(
    floors.flatMap((floor) =>
      offsets.map(async (offset) => {
        const data = await fetchItemList(
          // `site` は fetchItemList が既定値 "FANZA" を持つが、**`service` は持たない**
          // （`client.ts:199` は site のみ既定値を設定する）。省略すると FANZA API が
          // 400 Bad Request を返す。**既存の呼び出し（トップ / genres / actresses）が
          // すべて site と service を明示しているのと同じ規約に揃える。**
          { site: "FANZA", service: "digital", floor, sort: "rank", hits: 100, offset },
          // **画像の HEAD 検証をスキップする。** 実測（2026-08-22 のビルド）で
          // `[fanza-filter] in=100 ... head_fail=100 out=0` が16回すべてで発生し、
          // **正常な作品まで全件落ちた**。原因は §7（第53便）に記録済みの構造——
          // 未発売作品の `pl.jpg` は `now_printing.jpg` へ 302 し、リダイレクト先の
          // `imgsrc.dmm.com` が HEAD を 405 で拒否する（GET は 200 で 19,378バイト）。
          // 100件 × 16ページ = 1,600 の HEAD を1レンダリングで投げる形は成立しない。
          //
          // **安全性は落ちない**: `ProductCard` は描画側で
          // `!image || isPlaceholderImageUrl(image) || imageBroken` を判定して
          // カードごと非表示にする（`product-card.tsx`）。works 詳細も
          // `shouldFilterItems` が単体取得ではフィルタをスキップする既存設計と同じ考え方。
          { revalidate, skipImageValidation: true },
        );
        return { floor, items: data.result?.items ?? [] };
      }),
    ),
  );

  const okFloors = new Set<string>();
  const failedFloors = new Set<string>();
  const collected: DmmItem[] = [];

  settled.forEach((r, idx) => {
    // flatMap の順序から対象フロアを復元する（rejected は value を持たないため）。
    const floor = floors[Math.floor(idx / offsets.length)] ?? "unknown";
    if (r.status === "fulfilled") {
      okFloors.add(r.value.floor);
      collected.push(...r.value.items);
    } else {
      failedFloors.add(floor);
    }
  });

  const onSale = dedupeByContentId(collected).filter((it) => isOnSale(it, now));
  const sorted = sortSaleItems(onSale, now);

  return {
    items: sorted.slice(0, limit),
    totalFound: sorted.length,
    okFloors: [...okFloors],
    // 一部ページだけ失敗したフロアは ok にも failed にも入りうる。
    // **成功が1件でもあれば ok とみなし、failed からは除く。**
    failedFloors: [...failedFloors].filter((f) => !okFloors.has(f)),
  };
}
