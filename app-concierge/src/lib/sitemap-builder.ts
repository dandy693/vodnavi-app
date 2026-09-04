import type { MetadataRoute } from "next";

import { getPublishedArticleSlugs } from "@/lib/editorial-articles";
import { fetchItemList } from "@/lib/fanza/client";
import {
  persistSitemapWorksArchive,
  type ArchiveEntry,
} from "@/lib/fanza/sitemap-archive";
import { FANZA_FLOORS } from "@/lib/fanza/types";
import { absoluteUrl } from "@/lib/site";

/**
 * AH(rev10/承認2026-07-30): 旧 `src/app/sitemap.ts`(metadata route)の生成ロジックを
 * **そのまま**移設したもの。metadata route は `export const revalidate` の宣言値が
 * ビルド manifest に反映されず(宣言3600 に対し manifest 5m)、ランタイム再検証が
 * 一度も着地しない実測(Age 4.4日連続増・ヘッダ=静的アセット配信の特徴)があるため、
 * 配信は route handler(`src/app/sitemap.xml/route.ts`)へ移行する。
 * 生成ロジック自体は現行のまま(API ベース維持・Supabase 化しない)。
 */

const HITS_PER_REQUEST = 100;
const PAGES_PER_FLOOR = 4;
const MAX_GENRES = 200;

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const root: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      // /sale（2026-08-22 新設）: セールは数日単位で入れ替わるため daily。
      // 期限切れはページ側の `activeCampaign` が描画時に除外するため、
      // インデックスされた状態でも常に現在のセールを示す。
      url: absoluteUrl("/sale"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
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
  // D1: 観測した works を Supabase 累積テーブルへ記録するためのバッファ。
  // 回転式収録から押し出された旧作は /sitemap-archive.xml が恒久提示する。
  const archiveEntries: ArchiveEntry[] = [];

  for (const floor of FANZA_FLOORS) {
    // FANZA Webservice 側に投げる floor は `apiFloor` 優先（`amateur` のように
    // UI 上の擬似 floor を本物の `videoa` へ吸い上げるブリッジ）。これを尊重しないと
    // FANZA は不明 floor として **関係ない items** を返すか、エラーを返す。
    const apiFloorParam = floor.apiFloor ?? floor.code;
    // R2（CSO承認・案A / 2026-08-13）: 鏡像フロア（`apiFloor` が `code` と異なる＝
    // 別フロアの API 結果を UI 上の擬似フロアとして再掲するもの。現行は `amateur` のみ）
    // は **sitemap の works に出力しない**。同一作品が /works/videoa/{cid} と
    // /works/amateur/{cid} の 2 URL で提出され、GSC が後者を「代替 canonical」に
    // 分類していたため（本体 400 URL）。
    // **出力だけをスキップする**：API 呼び出し・`seenWorks`・`archiveEntries`・
    // `genreMap`・`actressMap` はいずれも変更しない。詳細ページ /works/amateur/{cid}
    // は 200 のままで canonical も従前どおり /works/videoa/{cid} を指す（404 化しない）。
    const isMirrorFloor =
      floor.apiFloor !== undefined && floor.apiFloor !== floor.code;
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
          if (!isMirrorFloor) {
            works.push({
              url: absoluteUrl(path),
              lastModified: itemDate,
              changeFrequency: "weekly",
              priority: 0.8,
            });
          }
          archiveEntries.push({
            content_id: item.content_id,
            // Q(rev7): canonicalWorkPath と同一の apiFloor 解決で記録する。
            // floor.code(UIフロア)のままだと amateur 列挙(videoa と同一リスト)が
            // 後勝ちで floor_code を amateur に上書きし、archive が代替 canonical 行きの
            // 鏡像 URL(/works/amateur/)を恒久提示してしまう(2026-07-29 実測 887 行)。
            floor_code: floor.apiFloor ?? floor.code,
            released_at: item.date
              ? new Date(item.date.replace(" ", "T")).toISOString()
              : null,
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
        // 【全損のフェイルモード・2026-08-30 第112便 タスクA(2) で特定】
        // **ここで例外を握りつぶすと、そのフロアの works が 0 件のまま先へ進む。**
        // **全フロアで失敗すれば `works` は空配列となり、`genres`・`actresses` は
        // `genreMap`・`actressMap` 由来なので連鎖して 0 件になる。**
        // **それでも `buildSitemapEntries` は正常に return するため、
        //   「works 0 件の sitemap」が成功として配信される。**
        // 実際に 2026-08-28 18:26 JST の生成で発生し、本体 sitemap は
        // 17 URL（静的 9 + articles 8）まで縮んだ（`FACT_GOVERNANCE` §22）。
        // 【2例目・2026-09-04 21:24:27 JST】同じ 17 URL まで縮む形で再発した
        // （`FACT_GOVERNANCE` §22-8）。**1例目と違い契機が特定できており、
        // デプロイ完了の 25 秒後に生成されている。** 検知は GH Actions の
        // `API Health Check`（`works=0`）と `Affiliate ID Guard`（検査 URL を
        // 解決できない）の 2 本で、いずれも 200 応答のため 404 とは無関係。
        // **Vercel の Redeploy では復旧できない**——`ignoreCommand` に弾かれ
        // `CANCELED` になることを 2026-09-05 06:16 JST に実測した。
        // 復旧には `app-concierge/` 配下への差分を伴う push が要る。
        // **本コミットは動作を変えない。** 恒久対策（件数が閾値未満なら前回値を
        // 維持する / 生成を失敗させる 等）は第112便 タスクC の提案として起案し、
        // **9/12 以降の CSO 裁定を待つ。**
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

  // 女優ハブ (柱①) は固定キャップを廃止し、floor-walk で集約できた全 actress を露出する。
  // actressMap は上の works フェッチ (PAGES_PER_FLOOR × HITS_PER_REQUEST) で収集済みの
  // item.iteminfo.actress のみで構成されるため、ここでの uncap は **追加の FANZA API
  // コールを発生させない** (スロットリング無リスク)。各 id は実フェッチ作品由来＝
  // actresses/[id] の floor-walk で必ず items>0 に着地し 404 化しない。
  // 目的: GSC「検出 - インデックス未登録」737件 (全件 /actresses/) を sitemap で明示露出し
  // クロール優先度を引き上げる (2026-06-22 診断 / 2026-06-22-gsc-unindexed-details.md)。
  const actresses: MetadataRoute.Sitemap = Array.from(actressMap.entries())
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

  // 編集記事（Supabase editorial_articles / published のみ）。記事は Studio 投入で
  // publish された時点から次回 sitemap 再生成で自動収録される
  // ＝公開ごとの手動配線・SQL 再実行は不要（今後の記事投入計画の前提条件）。
  // getPublishedArticleSlugs はエラー/未配線時に空配列を返すため、Supabase 障害時も
  // 既存の works/genres/actresses 収録には影響しない。
  // D1: fire-and-forget 記録（await しない）。Supabase 障害・env 未配線でも
  // 本体 sitemap 生成には一切影響しない（persist 内部で握り潰す）。
  persistSitemapWorksArchive(archiveEntries);

  const articleSlugs = await getPublishedArticleSlugs();
  const articles: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: absoluteUrl(`/articles/${slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...root, ...floors, ...works, ...genres, ...actresses, ...articles];
}
