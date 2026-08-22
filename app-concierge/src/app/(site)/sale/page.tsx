/**
 * /sale — FANZA のセール中作品をまとめる面（2026-08-22 新設）。
 *
 * 【この面が成立する根拠（第90便の実測 2026-08-22 06:32〜06:45）】
 * FANZA API の `ItemList` は `campaign`（`date_begin` / `date_end` / `title`）を返し、
 * `prices.price < prices.list_price` の乖離と**完全に一致する**。
 * したがって「セール中か」「いくら引きか」「いつまでか」を**機械的に確定できる**。
 * （見放題の対象判定は API では不可能＝`FACT_GOVERNANCE` §5-2-3。混同しないこと。）
 *
 * 【af_id】商品リンクは既存の `buildAffiliateURL()` 産＝**`moterist-004`**（人間導線用）。
 * FANZA API の呼び出し認証に使う `moterist-990` とは**用途が別で、混ぜない**（§8）。
 * `ProductCard` → `FanzaAffiliateLink` を通るため、この面のためのリンク組立は書いていない。
 *
 * 【計測】`surface="sale"` → GA4 `placement="sale_list_cta"`。
 * **DMM 側は af_id を全面で共有するため成果を面別に分離できない**
 * （af_id の追加発行は不可能と確定・第92便裁定(1)）。**分離できるのはクリックまで。**
 *
 * 【期限切れ】`sale.ts` の `activeCampaign` が描画のたびに `now` で切る。
 * **データ側のキャッシュが古くても、期限切れの作品は画面に出ない。**
 *
 * 【0件のとき】`notFound()` にしない。セールが無い時間帯は**正常な状態**であり、
 * sitemap に提出済みの URL を 404 にしてしまうため（genres が `notFound()` するのは
 * 「そのジャンルが存在しない」ケースで、状況が異なる）。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";

import { EmptyState } from "@/components/empty-state";
import { ProductGrid } from "@/components/product-grid";
import type { ProductCardSale } from "@/components/product-card";
import { pickImage } from "@/lib/fanza/client";
import {
  activeCampaign,
  discountRate,
  formatEndsAtJst,
  groupByCampaign,
  parseFanzaDate,
  saleBadgeOf,
  saleOfferOf,
} from "@/lib/fanza/sale";
import { fetchSaleItems, SALE_DISPLAY_LIMIT } from "@/lib/fanza/sale-source";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

/**
 * `generateMetadata` と `SalePage` が同一リクエスト内で2回呼ぶため `cache()` で束ねる
 * （works 詳細の `getWork` と同じ方針）。**`now` を引数に取らない**——
 * リクエストごとに1度だけ評価し、メタデータと本文で同じ時刻・同じ結果を使うため。
 */
const getSale = cache(async () => {
  const now = new Date();
  const result = await fetchSaleItems({ now });
  return { now, ...result };
});

const PATH = "/sale";
const TITLE = "FANZA セール中の作品まとめ";
const DESCRIPTION =
  "FANZA で現在セール中の作品を割引率順にまとめています。割引率・セール価格・終了日時は FANZA の配信情報から自動取得し、期限切れは自動で除外しています。";

/**
 * 時限のメタデータを組み立てる（第95便 CSO裁定②）。
 *
 * **【厳守・目的の明示】これは「内容の正確化」であって CTR 向上の施策ではない。**
 * §20-3 の実測——**メタデータ構造が実質同一で CTR が41倍違う組が実在する**
 * （`lulu00423` 12.3% / `hmn00874` 0.3%・順位 8.3 と 8.1）——により、
 * **当サイトの実測では「日付や割引率を入れれば CTR が上がる」とは言えない。**
 * **効果を約束しない。** 期待するのは「書いてある内容が実態と合っていること」だけである。
 *
 * 【陳腐化の限界】§16 により再クロール時期は予測できないため、
 * **検索結果に古い日付・古い割引率が出続けうる。** これは避けられない。
 */
function buildMeta(
  items: readonly import("@/lib/fanza/types").DmmItem[],
  totalFound: number,
  now: Date,
): { title: string; description: string } {
  if (items.length === 0) return { title: TITLE, description: DESCRIPTION };

  const rates = items
    .map((it) => discountRate(it))
    .filter((r): r is number => r !== null);
  const maxRate = rates.length > 0 ? Math.max(...rates) : null;

  // 最も早く終わるキャンペーンの終了時刻（＝この面の内容が変わる最短の時点）。
  const ends = items
    .map((it) => parseFanzaDate(activeCampaign(it, now)?.date_end))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());
  const soonest = ends[0] ?? null;

  const titleParts = [TITLE];
  if (maxRate !== null) titleParts.push(`最大${maxRate}%OFF`);
  if (soonest) titleParts.push(`${formatEndsAtJst(soonest)}まで`);

  const description =
    `FANZA で現在セール中の作品 ${totalFound.toLocaleString("ja-JP")} 件を割引率順にまとめています。` +
    (maxRate !== null ? `最大 ${maxRate}%OFF。` : "") +
    (soonest ? `もっとも早い終了は ${formatEndsAtJst(soonest)}。` : "") +
    "割引率・価格・終了日時は FANZA の配信情報から自動取得し、期限切れは自動で除外しています。";

  return { title: titleParts.join("｜"), description };
}

export async function generateMetadata(): Promise<Metadata> {
  const { items, totalFound, now } = await getSale();
  const { title, description } = buildMeta(items, totalFound, now);

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(PATH) },
    openGraph: {
      title: `${title} | VODNAVI`,
      description,
      url: absoluteUrl(PATH),
      type: "website",
      siteName: "VODNAVI",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | VODNAVI`,
      description,
    },
  };
}

export default async function SalePage() {
  const { items, totalFound, failedFloors, now } = await getSale();

  const groups = groupByCampaign(items, now);

  // content_id → バッジ。`saleBadgeOf` は期限切れ・乖離なしで null を返すため、
  // ここに載るのは掲載条件を満たしたものだけになる。
  const saleMap = new Map<string, ProductCardSale>();
  for (const it of items) {
    const badge = saleBadgeOf(it, now);
    if (badge) {
      saleMap.set(it.content_id, {
        rate: badge.rate,
        endsAtLabel: formatEndsAtJst(badge.endsAt),
      });
    }
  }

  const rates = items
    .map((it) => discountRate(it))
    .filter((r): r is number => r !== null);
  const maxRate = rates.length > 0 ? Math.max(...rates) : null;

  // 構造化データ（第95便 CSO裁定①）。
  // **期限切れの Offer は出力しない**——`saleOfferOf` が null を返したら
  // `offers` を持たない `Product` にする。間違った価格を主張するより主張しない。
  // **`Offer.url` にアフィリエイト URL（al.dmm.co.jp）を置かないこと**：
  // `c237e51`（2026-07-07）が JSON-LD から af_id を除去した経緯があり、
  // `scripts/guard-affiliate-id.mjs` が `url:` への `affiliateURL` 直渡しを回帰として検出する。
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    isPartOf: { "@type": "WebSite", name: "VODNAVI", url: absoluteUrl("/") },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.slice(0, 20).map((it, i) => {
        const workUrl = absoluteUrl(`/works/${it.floor_code}/${it.content_id}`);
        const image = pickImage(it.imageURL);
        const maker = it.iteminfo?.maker?.[0]?.name;
        const offer = saleOfferOf(it, now);

        const product: Record<string, unknown> = {
          "@type": "Product",
          name: it.title,
          url: workUrl,
          ...(image ? { image } : {}),
          ...(maker ? { brand: { "@type": "Brand", name: maker } } : {}),
        };
        // 有効なキャンペーンと読める価格が揃ったときだけ Offer を付ける。
        if (offer) {
          product.offers = {
            "@type": "Offer",
            price: offer.price,
            priceCurrency: "JPY",
            priceValidUntil: offer.priceValidUntil,
            availability: "https://schema.org/InStock",
            url: workUrl,
          };
        }

        return {
          "@type": "ListItem",
          position: i + 1,
          item: product,
        };
      }),
    },
  };

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
        <span className="text-foreground/80">セール</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          <span className="text-rose-400">セール中</span>の作品
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length > 0 ? (
            <>
              現在{" "}
              <span className="font-semibold text-rose-300 tabular-nums">
                {totalFound.toLocaleString("ja-JP")}
              </span>{" "}
              件
              {maxRate !== null && (
                <>
                  {" "}
                  / 最大{" "}
                  <span className="font-semibold text-rose-300 tabular-nums">
                    {maxRate}%OFF
                  </span>
                </>
              )}
              {totalFound > items.length && (
                <> / 割引率の高い順に {items.length.toLocaleString("ja-JP")} 件を表示</>
              )}
            </>
          ) : (
            <>現在このページに掲載できるセールはありません</>
          )}
        </p>
      </header>

      {groups.length > 0 && (
        <section className="mb-8 flex flex-wrap gap-2">
          {groups.map((g) => (
            <span
              key={g.title}
              className="rounded-full border border-rose-400/25 bg-rose-400/[0.06] px-3 py-1.5 text-xs text-foreground/90"
            >
              {g.title}
              <span className="ml-2 text-rose-300/90">
                〜{formatEndsAtJst(g.endsAt)}
              </span>
              <span className="ml-2 tabular-nums text-muted-foreground">
                {g.count}件
              </span>
            </span>
          ))}
        </section>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="現在セール中の作品を取得できませんでした"
          description="FANZA のセールは数日単位で入れ替わります。時間をおいて再度ご確認ください。"
        />
      ) : (
        <ProductGrid items={items} surface="sale" saleMap={saleMap} />
      )}

      <section className="mt-12 border-t border-white/5 pt-8 text-xs leading-relaxed text-muted-foreground">
        <p>
          割引率・セール価格・終了日時は FANZA
          の配信情報をもとに自動で取得しています。終了した割引は自動的に除外されますが、
          FANZA 側の変更が反映されるまで時間差が生じる場合があります。
          最新の価格は各作品ページでご確認ください。
        </p>
        {failedFloors.length > 0 && (
          <p className="mt-2">
            一部のカテゴリ（{failedFloors.join(" / ")}
            ）の情報を取得できなかったため、表示件数が通常より少ない場合があります。
          </p>
        )}
        <p className="mt-2">
          表示上限は {SALE_DISPLAY_LIMIT.toLocaleString("ja-JP")} 件です。
        </p>
      </section>
    </div>
  );
}
