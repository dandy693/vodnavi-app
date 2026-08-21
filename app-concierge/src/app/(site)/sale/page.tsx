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

import { EmptyState } from "@/components/empty-state";
import { ProductGrid } from "@/components/product-grid";
import type { ProductCardSale } from "@/components/product-card";
import {
  discountRate,
  formatEndsAtJst,
  groupByCampaign,
  saleBadgeOf,
} from "@/lib/fanza/sale";
import { fetchSaleItems, SALE_DISPLAY_LIMIT } from "@/lib/fanza/sale-source";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

const PATH = "/sale";
const TITLE = "FANZA セール中の作品まとめ";
const DESCRIPTION =
  "FANZA で現在セール中の作品を割引率順にまとめています。割引率・セール価格・終了日時は FANZA の配信情報から自動取得し、期限切れは自動で除外しています。";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: absoluteUrl(PATH) },
    openGraph: {
      title: `${TITLE} | VODNAVI`,
      description: DESCRIPTION,
      url: absoluteUrl(PATH),
      type: "website",
      siteName: "VODNAVI",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: `${TITLE} | VODNAVI`,
      description: DESCRIPTION,
    },
  };
}

export default async function SalePage() {
  const now = new Date();
  const { items, totalFound, failedFloors } = await fetchSaleItems({ now });

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
      itemListElement: items.slice(0, 20).map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/works/${it.floor_code}/${it.content_id}`),
        name: it.title,
      })),
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
