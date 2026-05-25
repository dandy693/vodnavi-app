import type { Metadata } from "next";
import { FanzaImage } from "@/components/fanza-image";
import { FanzaAffiliateLink } from "@/components/fanza-affiliate-link";
import {
  ConciergeCtaLink,
  ConciergeCtaPanel,
} from "@/components/concierge-cta-link";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Film, Star, Tag, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getWorkEditorial } from "@/lib/editorial";
import {
  fetchItemList,
  formatPrice,
  joinNames,
  pickImage,
} from "@/lib/fanza/client";
import { FANZA_FLOORS, type DmmItem } from "@/lib/fanza/types";
import {
  absoluteUrl,
  compactDescription,
  compactTitle,
} from "@/lib/site";
import { cn } from "@/lib/utils";

export const revalidate = 300;

type Params = { floor: string; id: string };

async function getWork(floor: string, id: string): Promise<DmmItem | null> {
  const floorMeta = FANZA_FLOORS.find((f) => f.code === floor) ?? FANZA_FLOORS[0];
  try {
    const data = await fetchItemList({
      site: "FANZA",
      service: floorMeta.service,
      floor: floorMeta.code,
      cid: id,
      hits: 1,
    });
    return data.result.items?.[0] ?? null;
  } catch {
    return null;
  }
}

async function getRelatedWorks(
  floor: string,
  genreId: number,
  excludeId: string,
  limit = 12,
): Promise<DmmItem[]> {
  const floorMeta = FANZA_FLOORS.find((f) => f.code === floor) ?? FANZA_FLOORS[0];
  try {
    const data = await fetchItemList({
      site: "FANZA",
      service: floorMeta.service,
      floor: floorMeta.code,
      article: "genre",
      article_id: String(genreId),
      hits: limit + 4,
      sort: "rank",
    });
    return (data.result.items ?? [])
      .filter((it) => it.content_id !== excludeId)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { floor, id } = await params;
  const item = await getWork(floor, id);

  if (!item) {
    return {
      title: "作品が見つかりません",
      robots: { index: false, follow: false },
    };
  }

  const actresses = joinNames(item.iteminfo?.actress, 3);
  const genres = joinNames(item.iteminfo?.genre, 5);
  const image = pickImage(item.imageURL);
  const path = `/works/${floor}/${id}`;
  const editorial = getWorkEditorial(item.content_id);

  const titleParts = [
    item.title,
    actresses ? `出演:${actresses}` : null,
  ].filter(Boolean);
  const title = compactTitle(titleParts.join(" ｜ "));
  // layout.tsx の template "%s | VODNAVI" は head <title> にだけ適用される。
  // OG/Twitter は template 非経由のため、3 surface 整合のためここで明示付与。
  // head <title> には付けない（付けると "X | VODNAVI | VODNAVI" の二重付与になる）。
  const titleWithBrand = `${title} | VODNAVI`;

  // CCO-authored editorial leads (data/works-editorial.json) take precedence
  // over the boilerplate FANZA-meta description so each indexed snippet is
  // unique. Falls back to a structured FANZA summary when no editorial yet.
  // フォールバック時は VODNAVI 固有コンテキストを末尾に動的マージして他サイトとの
  // FANZA-meta 完全重複を回避し、duplicate content 判定を避ける。
  const description = editorial?.editorialLead
    ? compactDescription(editorial.editorialLead)
    : compactDescription(
        [
          item.title,
          actresses ? `出演:${actresses}。` : "",
          genres ? `ジャンル:${genres}。` : "",
          "FANZA で今すぐ視聴できる新作 VOD 作品をスマホでチェック。",
          "今夜の作品選びを最速でナビゲーションするVODNAVI（ボドナビ）がお届けする詳細配信ステータス。",
        ].join(" "),
      );

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: titleWithBrand,
      description,
      url: absoluteUrl(path),
      type: "video.movie",
      siteName: "VODNAVI",
      locale: "ja_JP",
      images: image ? [{ url: image, width: 800, height: 1067, alt: item.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: titleWithBrand,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { floor, id } = await params;
  const item = await getWork(floor, id);
  if (!item) notFound();

  const image = pickImage(item.imageURL);
  const actresses = item.iteminfo?.actress ?? [];
  const genres = item.iteminfo?.genre ?? [];
  const makers = item.iteminfo?.maker ?? [];
  const series = item.iteminfo?.series ?? [];
  const directors = item.iteminfo?.director ?? [];
  const price = formatPrice(item.prices?.price);
  const listPrice = formatPrice(item.prices?.list_price);
  const date = item.date?.split(" ")[0];
  const review = item.review;
  const sampleImages = item.sampleImageURL?.sample_l?.image ?? [];

  const primaryGenre = genres[0];
  const relatedWorks = primaryGenre
    ? await getRelatedWorks(floor, primaryGenre.id, id, 12)
    : [];
  const editorial = getWorkEditorial(item.content_id);

  const description = [
    `${item.title}の作品情報。`,
    actresses.length > 0
      ? `${joinNames(actresses, 3)} 出演。`
      : "",
    genres.length > 0 ? `ジャンル：${joinNames(genres, 5)}。` : "",
    "FANZA で今すぐ視聴できます。",
  ]
    .filter(Boolean)
    .join(" ");

  const productLd = buildProductLd({
    item,
    floor,
    id,
    image,
    description: editorial?.editorialLead ?? description,
    actresses,
    genres,
    makers,
  });

  return (
    <article className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <script
        type="application/ld+json"
        // schema.org payload — string is the canonical wire format
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <div className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-amber-300">
          ホーム
        </Link>
        <span className="mx-2">›</span>
        <Link
          href={`/?floor=${floor}`}
          className="hover:text-amber-300"
        >
          {FANZA_FLOORS.find((f) => f.code === floor)?.label ?? floor}
        </Link>
        {primaryGenre && (
          <>
            <span className="mx-2">›</span>
            <Link
              href={`/genres/${primaryGenre.id}`}
              className="hover:text-amber-300"
            >
              {primaryGenre.name}
            </Link>
          </>
        )}
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {image && (
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
            <FanzaImage
              src={image}
              alt={item.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h1 className="font-heading text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {item.title}
          </h1>

          {editorial?.editorialLead && (
            <p
              data-editorial="lead"
              className="rounded-lg border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3 text-sm leading-relaxed text-foreground/90"
            >
              {editorial.editorialLead}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" aria-hidden /> {date}
              </span>
            )}
            {review?.average && (
              <span className="inline-flex items-center gap-1 text-amber-300">
                <Star className="size-3" aria-hidden /> {review.average}
                {review.count ? ` (${review.count})` : ""}
              </span>
            )}
            {item.volume && (
              <span className="inline-flex items-center gap-1">
                <Film className="size-3" aria-hidden /> {item.volume}
              </span>
            )}
          </div>

          {actresses.length > 0 && (
            <Field label="出演" icon={<Users className="size-3" aria-hidden />}>
              <div className="flex flex-wrap gap-1.5">
                {actresses.slice(0, 8).map((p) => (
                  <Badge
                    key={p.id}
                    variant="outline"
                    className="border-amber-400/30 bg-amber-400/5 text-amber-200"
                  >
                    {p.name}
                  </Badge>
                ))}
              </div>
            </Field>
          )}

          {genres.length > 0 && (
            <Field label="ジャンル" icon={<Tag className="size-3" aria-hidden />}>
              <div className="flex flex-wrap gap-1.5">
                {genres.slice(0, 12).map((g) => (
                  <Link
                    key={g.id}
                    href={`/genres/${g.id}`}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-foreground transition-colors hover:border-amber-400/40 hover:text-amber-300"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </Field>
          )}

          {(series.length > 0 || makers.length > 0 || directors.length > 0) && (
            <Field label="作品情報">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                {series.length > 0 && (
                  <Row label="シリーズ" value={joinNames(series, 2)} />
                )}
                {makers.length > 0 && (
                  <Row label="メーカー" value={joinNames(makers, 2)} />
                )}
                {directors.length > 0 && (
                  <Row label="監督" value={joinNames(directors, 2)} />
                )}
              </dl>
            </Field>
          )}

          <Separator className="my-2 bg-white/10" />

          <div className="flex flex-wrap items-baseline gap-3">
            {price && (
              <span className="text-3xl font-bold text-amber-300 tabular-nums">
                {price}
              </span>
            )}
            {listPrice && listPrice !== price && (
              <span className="text-sm text-muted-foreground line-through tabular-nums">
                {listPrice}
              </span>
            )}
          </div>

          <FanzaAffiliateLink
            href={item.affiliateURL ?? item.URL ?? ""}
            content_id={item.content_id}
            title={item.title}
            floor_code={floor}
            placement="detail_main_cta"
            className={cn(
              "group inline-flex h-14 items-center justify-center gap-2 rounded-xl text-base font-semibold",
              "bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-black",
              "shadow-[0_0_30px_-5px_rgba(245,200,80,0.5)]",
              "transition-all duration-300 hover:from-amber-400 hover:to-amber-300 active:translate-y-px",
            )}
          >
            FANZA で今すぐ視聴
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </FanzaAffiliateLink>

          <p className="text-[11px] leading-relaxed text-muted-foreground/70">
            ※ クリックすると FANZA 公式サイトに移動します。視聴・購入は FANZA 上で行われます。
          </p>

          {/* セカンダリ動線: FANZA メイン CTA の直下に、視線を阻害しない
             アウトラインスタイルで AI コンシェルジュへの再推薦動線を置く。
             SEO 流入の 99% が詳細ページで完結する 2026-05-25 のファネル
             断絶診断に対応するため、迷ったユーザーを次の一本へ導く脱出口。 */}
          <ConciergeCtaLink
            contentId={item.content_id}
            floorCode={floor}
            className="mt-2"
          />
        </div>
      </section>

      {sampleImages.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
            サンプル画像
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {sampleImages.slice(0, 12).map((src, idx) => (
              <FanzaAffiliateLink
                key={src}
                href={item.affiliateURL ?? item.URL ?? ""}
                content_id={item.content_id}
                title={item.title}
                floor_code={floor}
                placement="detail_sample"
                className="relative aspect-video overflow-hidden rounded-lg bg-black ring-1 ring-white/5 transition-all hover:ring-amber-400/40"
              >
                <FanzaImage
                  src={src}
                  alt={`${item.title} サンプル${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </FanzaAffiliateLink>
            ))}
          </div>
        </section>
      )}

      <Separator className="my-10 bg-white/10" />

      <section className="prose prose-invert prose-sm max-w-none text-muted-foreground">
        <p>{description}</p>
      </section>

      <ConciergeCtaPanel contentId={item.content_id} floorCode={floor} />

      {relatedWorks.length > 0 && primaryGenre && (
        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between gap-2">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              関連作品
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                同ジャンル「{primaryGenre.name}」より
              </span>
            </h2>
            <Link
              href={`/genres/${primaryGenre.id}`}
              className="text-xs text-amber-300 hover:underline"
            >
              ジャンル一覧へ
              <ArrowRight className="ml-0.5 inline size-3" aria-hidden />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {relatedWorks.map((rel) => {
              const relImage = pickImage(rel.imageURL);
              const relPrice = formatPrice(rel.prices?.price);
              return (
                <li key={rel.content_id}>
                  <Link
                    href={`/works/${rel.floor_code}/${rel.content_id}`}
                    className="group block overflow-hidden rounded-lg bg-black/30 ring-1 ring-white/5 transition-all hover:ring-amber-400/40"
                  >
                    {relImage && (
                      <div className="relative aspect-[3/4] w-full bg-black">
                        <FanzaImage
                          src={relImage}
                          alt={rel.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="line-clamp-2 text-xs font-medium leading-snug text-foreground group-hover:text-amber-300">
                        {rel.title}
                      </p>
                      {relPrice && (
                        <p className="mt-1 text-[11px] tabular-nums text-amber-300/80">
                          {relPrice}〜
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}

type ProductLdInput = {
  item: DmmItem;
  floor: string;
  id: string;
  image: string | null;
  description: string;
  actresses: { id: number; name: string }[];
  genres: { id: number; name: string }[];
  makers: { id: number; name: string }[];
};

function buildProductLd({
  item,
  floor,
  id,
  image,
  description,
  actresses,
  genres,
  makers,
}: ProductLdInput): Record<string, unknown> {
  const url = absoluteUrl(`/works/${floor}/${id}`);
  const offerUrl = item.affiliateURL ?? item.URL ?? url;
  const priceRaw = item.prices?.price ?? "";
  const priceMatch = priceRaw.match(/\d[\d,]*/);
  const priceNumber = priceMatch ? priceMatch[0].replace(/,/g, "") : undefined;

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    description,
    url,
    sku: item.content_id,
  };
  if (image) ld.image = image;
  if (genres.length > 0) ld.category = genres.map((g) => g.name).join(" / ");
  if (makers.length > 0) ld.brand = { "@type": "Brand", name: makers[0].name };
  if (actresses.length > 0) {
    ld.actor = actresses.slice(0, 8).map((a) => ({
      "@type": "Person",
      name: a.name,
    }));
  }
  if (item.date) ld.releaseDate = item.date.split(" ")[0];

  const offer: Record<string, unknown> = {
    "@type": "Offer",
    url: offerUrl,
    priceCurrency: "JPY",
    availability: "https://schema.org/InStock",
  };
  if (priceNumber) offer.price = priceNumber;
  ld.offers = offer;

  const ratingValue = item.review?.average ? Number(item.review.average) : NaN;
  const ratingCount = item.review?.count ?? 0;
  if (Number.isFinite(ratingValue) && ratingValue > 0 && ratingCount > 0) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return ld;
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
        {icon}
        {label}
      </span>
      <div>{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground/70">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </>
  );
}
