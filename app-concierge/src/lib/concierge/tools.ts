import { tool } from "ai";
import { z } from "zod";

import { fetchItemList, joinNames, pickImage } from "@/lib/fanza/client";
import { normalizeFloorForUrl } from "@/lib/fanza/types";
import { withUtm } from "@/lib/utm";

import { DEFAULT_ASP, type AspName } from "./asp";
import { buildAffiliateURL } from "./url-builder";

const CONCIERGE_UTM_SOURCE = "concierge";

export interface ConciergeWork {
  /**
   * 提案元 ASP（フェーズ 1 は常に "fanza"、フェーズ 2 で "dmm_tv" / "u_next" を解放）。
   * STRATEGY_BRIEF_003: SQL / API / GA4 を貫通する多 ASP 識別子。
   */
  asp_name: AspName;
  content_id: string;
  floor_code: string;
  title: string;
  actresses: string;
  genres: string;
  date: string | null;
  review_average: string | null;
  /**
   * S4: 人間 CTA 用の 004 リンク（旧名 `affiliateURL`）。API 返却の
   * `item.affiliateURL`（af_id=990）を代入してはならない。
   */
  ctaUrl: string;
  detailHref: string;
  image: string | null;
}

const searchSchema = z.object({
  keyword: z
    .string()
    .describe(
      "検索キーワード（日本語）。FANZA は AND 検索のため、必ず 2 語以内（半角スペース区切り）に絞ること。例: '癒し系 美女', 'VR 巨乳'",
    ),
  sort: z
    .enum(["rank", "date", "review", "-price"])
    .optional()
    .describe(
      "並び順。rank=人気(無難), date=新着, review=高評価, -price=高価格(プレミアム)。デフォルトは rank。",
    ),
  hits: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe(
      "取得件数 1〜20。デフォルト 10。基本的にデフォルトの 10 で十分なので明示しなくてよい。",
    ),
});

const finalizeSchema = z.object({
  content_ids: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe(
      "ユーザーに推薦する作品の content_id 一覧。search_fanza_works で取得した結果から 2〜3 件を厳選して渡すこと。",
    ),
});

/**
 * Claude が呼び出すツール群を生成する。
 * works コレクションは検索結果の蓄積場所、selectedIds は最終的に推薦する ID を受け取るためのバッファ。
 */
export function createConciergeTools(
  works: Map<string, ConciergeWork>,
  selectedIds: { current: string[] },
) {
  return {
    search_fanza_works: tool({
      description:
        "FANZA で配信中の VOD 作品データベースを検索する。ユーザーの『今の気分』『シチュエーション』『悩み』『好み』に合致しそうな作品を見つけるために使う。FANZA は AND 検索のためキーワードは 2 語以内に絞ること。",
      inputSchema: searchSchema,
      execute: async (input) => {
        const hits = Math.min(Math.max(input.hits ?? 10, 1), 20);
        const t0 = Date.now();
        // fetchItemList 側で画像 URL 未登録 + HEAD 不達の作品は自動除外される。
        const data = await fetchItemList({
          site: "FANZA",
          service: "digital",
          floor: "videoa",
          keyword: input.keyword,
          sort: input.sort ?? "rank",
          hits,
        });
        const elapsedMs = Date.now() - t0;
        const items = data.result.items ?? [];
        console.log(
          `[concierge] tool=search_fanza_works keyword="${input.keyword}" sort=${input.sort ?? "rank"} hits=${hits} valid=${items.length}/${data.result.total_count} fanza_ms=${elapsedMs}`,
        );

        // クライアントのカード表示用にフル情報を蓄積（既に画像が有効な作品のみが届く）
        for (const item of items) {
          const image = pickImage(item.imageURL);
          if (!image) continue;
          works.set(item.content_id, {
            asp_name: DEFAULT_ASP,
            content_id: item.content_id,
            floor_code: item.floor_code,
            title: item.title,
            actresses: joinNames(item.iteminfo?.actress, 3),
            genres: joinNames(item.iteminfo?.genre, 4),
            date: item.date ?? null,
            review_average: item.review?.average ?? null,
            // S4(2026-08-02 CSO承認): API 返却の `item.affiliateURL`（af_id=990 /
            // ch=api）ではなく単一ビルダ産の 004 リンクを渡す。990〜999 は API 専用 ID で
            // 人間導線への使用は台帳で禁止。遷移先（lurl）は従来と同一。
            ctaUrl: withUtm(
              buildAffiliateURL({
                asp: DEFAULT_ASP,
                contentId: item.content_id,
                floor: normalizeFloorForUrl(item.floor_code),
              }).primaryUrl,
              CONCIERGE_UTM_SOURCE,
            ),
            detailHref: `/works/${normalizeFloorForUrl(item.floor_code)}/${item.content_id}`,
            image,
          });
        }

        // モデルに返すのは決定に必要な最小フィールドのみ。
        return items.map((item) => ({
          content_id: item.content_id,
          title: item.title,
          actress: (item.iteminfo?.actress ?? []).map((a) => a.name),
          genre: (item.iteminfo?.genre ?? []).map((g) => g.name),
          review_average: item.review?.average ?? null,
        }));
      },
    }),

    finalize_recommendations: tool({
      description:
        "ユーザーに推薦する作品を確定する。テキスト応答を返す直前に必ず呼ぶこと。search_fanza_works で取得した結果から 2〜3 件を選んで content_ids として渡す。テキスト中に ID を含める必要は無い。",
      inputSchema: finalizeSchema,
      execute: async ({ content_ids }) => {
        selectedIds.current = content_ids;
        return { ok: true, accepted: content_ids.length };
      },
    }),
  };
}
