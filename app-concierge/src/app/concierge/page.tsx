import type { Metadata } from "next";

import {
  ConciergeChat,
  type Work,
} from "@/components/concierge/concierge-chat";
import { ConciergeGate } from "@/components/concierge/concierge-gate";
import { ConciergeSessionInit } from "@/components/concierge/session-init";
import { DEFAULT_ASP } from "@/lib/concierge/asp";
import { resolveConciergeSource } from "@/lib/concierge/sources";
import {
  fetchItemList,
  isPlaceholderImageUrl,
  joinNames,
  pickImage,
} from "@/lib/fanza/client";
import { absoluteUrl } from "@/lib/site";
import { withUtm } from "@/lib/utm";

type Props = {
  searchParams: Promise<{
    cids?: string;
    source?: string;
    intent?: string;
  }>;
};

// cids クエリパラメータがあれば、合成 OG 画像を指す og:image / twitter:image を生成する。
// X のクローラが共有リンクを取得すると、ここで返した OG/Twitter メタタグから
// /api/og?cids=... を読み込み、3 作品の合成カード画像が表示される。
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const cids = parseCids((await searchParams).cids);
  if (cids.length === 0) return {};

  const ogImageUrl = absoluteUrl(
    `/api/og?cids=${encodeURIComponent(cids.join(","))}`,
  );

  // SNS クローラ向けに生成した og:image URL が確実に絶対 URL になっているかをログ確認。
  // Vercel Function Logs で "[/concierge] og:image=https://app.vodnavi.jp/..." として可視化。
  console.info(
    `[/concierge] generateMetadata cids=${JSON.stringify(cids)} og:image=${ogImageUrl} isAbsolute=${ogImageUrl.startsWith("https://")}`,
  );

  return {
    openGraph: {
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "AI コンシェルジュが選んだ今夜の作品",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "AI コンシェルジュが選んだ今夜の作品",
        },
      ],
    },
  };
}

function parseCids(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
}

/**
 * 与えられた content_id 群を FANZA API で逆引きし、チャット側の Work 形式に変換。
 * 並列でリクエストし、画像欠落・プレースホルダ・解決失敗は除外。
 */
async function resolveCidsToWorks(cids: string[]): Promise<Work[]> {
  const results = await Promise.all(
    cids.map(async (cid) => {
      try {
        const data = await fetchItemList(
          {
            site: "FANZA",
            service: "digital",
            floor: "videoa",
            cid,
            hits: 1,
          },
          // 単体取得時は filterItemsByImage が自動で skip される（fetchItemList 内）。
          // ここで個別に画像妥当性チェックを実施する。
        );
        const item = data.result.items?.[0];
        if (!item) return null;

        const image = pickImage(item.imageURL);
        if (!image || isPlaceholderImageUrl(image)) return null;

        const work: Work = {
          asp_name: DEFAULT_ASP,
          content_id: item.content_id,
          floor_code: item.floor_code,
          title: item.title,
          actresses: joinNames(item.iteminfo?.actress, 3),
          genres: joinNames(item.iteminfo?.genre, 4),
          review_average: item.review?.average ?? null,
          affiliateURL: withUtm(
            item.affiliateURL ?? item.URL,
            // 共有リンク経由の流入をアフィリエイト計測で識別するため utm_source=shared。
            "shared",
          ),
          detailHref: `/works/${item.floor_code}/${item.content_id}`,
          image,
        };
        return work;
      } catch {
        // 個別 cid の解決失敗は無視（他の作品は表示する）。
        return null;
      }
    }),
  );
  return results.filter((w): w is Work => w !== null);
}

export default async function ConciergePage({ searchParams }: Props) {
  const params = await searchParams;
  const cids = parseCids(params.cids);
  const initialWorks = cids.length > 0 ? await resolveCidsToWorks(cids) : [];
  const sourceProfile = resolveConciergeSource(params.source);
  const intent = params.intent ?? null;
  return (
    <>
      <ConciergeSessionInit
        source={params.source ?? null}
        intent={intent}
        shared={initialWorks.length > 0}
      />
      <ConciergeChat
        initialWorks={initialWorks}
        source={sourceProfile.id}
        greeting={sourceProfile.greeting}
      />
      <ConciergeGate />
    </>
  );
}
