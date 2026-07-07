import type { Metadata } from "next";
import { cache } from "react";
import { FanzaImage } from "@/components/fanza-image";
import { FanzaAffiliateLink } from "@/components/fanza-affiliate-link";
import { NewUserFvModule } from "@/components/new-user-fv-module";
import {
  ConciergeCtaLink,
  ConciergeCtaPanel,
} from "@/components/concierge-cta-link";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Film, Star, Tag, Users } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { getWorkEditorial } from "@/lib/editorial";
import { getWorkReview } from "@/lib/work-review";
import { buildAffiliateURL } from "@/lib/concierge/url-builder";
import {
  STICKY_MAIN_LABEL,
  STICKY_SUB_LABEL,
} from "@/data/copy/sticky-cta-text";
import {
  fetchItemList,
  formatPrice,
  joinNames,
  pickImage,
} from "@/lib/fanza/client";
import {
  FANZA_FLOORS,
  normalizeFloorForUrl,
  type DmmItem,
} from "@/lib/fanza/types";
import {
  absoluteUrl,
  compactDescription,
  compactTitle,
} from "@/lib/site";
import { cn } from "@/lib/utils";

export const revalidate = 300;

type Params = { floor: string; id: string };

// generateMetadata と WorkDetailPage が同一リクエスト内で getWork() を 2 回呼ぶ。
// React cache() で request-scope メモ化することで、片方が成功し片方が transient
// 失敗するスプリットブレイン（メタは Product 出力なのに本体は notFound、または
// その逆）を構造的に排除する。Next 15 + React 19 RSC で安全に使える。
const getWork = cache(
  async (floor: string, id: string): Promise<DmmItem | null> => {
    const floorMeta =
      FANZA_FLOORS.find((f) => f.code === floor) ?? FANZA_FLOORS[0];
    // FANZA API の floor パラメータは `apiFloor` 優先。`amateur` のように UI 側
    // 擬似 floor を本物の `videoa` に吸い上げるブリッジを尊重する。これを
    // 怠ると sitemap が出力した `/works/amateur/{cid}` 等が API 側で空 / 別物
    // を引いてしまい、notFound() → 404 化する (GSC 289 件の構造発生源)。
    const apiFloorParam = floorMeta.apiFloor ?? floorMeta.code;
    try {
      const data = await fetchItemList({
        site: "FANZA",
        service: floorMeta.service,
        floor: apiFloorParam,
        cid: id,
        hits: 1,
      });
      return data.result.items?.[0] ?? null;
    } catch {
      return null;
    }
  },
);

async function getRelatedWorks(
  floor: string,
  genreId: number,
  excludeId: string,
  limit = 12,
): Promise<DmmItem[]> {
  const floorMeta = FANZA_FLOORS.find((f) => f.code === floor) ?? FANZA_FLOORS[0];
  const apiFloorParam = floorMeta.apiFloor ?? floorMeta.code;
  try {
    const data = await fetchItemList({
      site: "FANZA",
      service: floorMeta.service,
      floor: apiFloorParam,
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

/**
 * 擬似フロア（`apiFloor` 保持・例: amateur→videoa）の detail URL は実フロア側へ
 * canonical 集約する。同一 content_id が複数フロア URL で同一内容を配信すると、
 * フロア別 self-canonical が相反し Google が正規を再選択する（GSC「重複・Google に
 * より別ページが正規選択」206 件・2026-07-04 実測）。宣言側で videoa へ集約し解消。
 * noindex は使わない（FACT_GOVERNANCE §2 / self-canonical consolidation）。
 */
function canonicalWorkPath(floor: string, id: string): string {
  const floorMeta = FANZA_FLOORS.find((f) => f.code === floor);
  return `/works/${floorMeta?.apiFloor ?? floor}/${id}`;
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
  const path = canonicalWorkPath(floor, id);
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
  const ccoReview = getWorkReview(item.content_id);

  // CTA URL は `item.affiliateURL` 直渡しではなく単一ビルダ `buildAffiliateURL`
  // を通す（BRAND_DESIGN_GUIDE §4-5「af_id ハードコード禁則」+ ASP 抽象化）。
  const fanzaAffiliate = buildAffiliateURL({
    asp: "fanza",
    contentId: item.content_id,
    actressOrSku: actresses[0]?.name ?? null,
  });

  // U1 新規ユーザー向けFVモジュール（新規会員導線 設計書v1）のリリースゲート。
  // コピー確定（設計書 §4 HUMAN確認 → CSO確定版発行）まで OFF が既定。
  // 有効化は Vercel env `FEATURE_FV_NEWUSER=1` + 再デプロイ。
  const showNewUserModule = process.env.FEATURE_FV_NEWUSER === "1";

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
    <article className="mx-auto max-w-6xl px-4 py-6 pb-20 sm:px-6 sm:py-10 md:pb-10">
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
          // モバイル/タブレット (単一カラム) では 3:4 画像が縦を占有して H1+detail_fv_cta
          // をゼロ座標から押し出すため、max-h-[220px] で高さを緊縮し object-cover で
          // 中央クロップ表示する (Phase-2 追補 / 3秒の視界ハック完成)。lg 以上は
          // 2 カラムで縦に余裕があるため max-h を解除して本来の 3:4 全体を見せる。
          <div className="relative aspect-[3/4] max-h-[220px] w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 lg:max-h-none">
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

          {/* ── ファーストビュー昇格ブロック (Phase-2 / 3秒の視界ハック) ──
             GA4 物理監査 (2026-06-24): 作品詳細の平均滞在 1〜6 秒・scroll 90%
             到達はわずか 4.6%。CVR 資産 (金 CTA + 回遊ハブ) を H1 直下へ複製
             昇格し、3:4 商品画像 (~500px) で押し下げられる前に視認させる。
             `lg:hidden`: lg 以上は 2 カラムで右カラムが既にメイン CTA を FV 内に
             surface しているため非表示。単一カラム (mobile / tablet, 画像が縦を
             占有) でのみ昇格 CTA を出す。`placement="detail_fv_cta"` で GA4 上の
             成約熱量を既存 in-flow CTA (detail_main_cta) と分離計測する。
             既存の in-flow CTA / 女優・ジャンル Link は破壊せず併存 (複製昇格)。
             BRAND_DESIGN_GUIDE §2-3 ダーク×シャンパンゴールド (#D4AF37) を踏襲。 */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/[0.03] px-3 py-3 lg:hidden">
            <FanzaAffiliateLink
              href={fanzaAffiliate.primaryUrl}
              content_id={item.content_id}
              title={item.title}
              floor_code={floor}
              placement="detail_fv_cta"
              className={cn(
                "btn-luxury-gold w-full rounded-lg text-sm font-semibold",
                "min-h-11 px-4 py-2.5",
                "group",
              )}
            >
              <span className="text-center leading-tight">
                FANZA公式で今すぐ視聴・サンプルを見る（18禁）
              </span>
              <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </FanzaAffiliateLink>

            {/* U1: 新規ユーザー向けマイクロモジュール（mobile FV / CTA直下1行） */}
            {showNewUserModule && (
              <NewUserFvModule
                href={fanzaAffiliate.primaryUrl}
                content_id={item.content_id}
                title={item.title}
                floor_code={floor}
              />
            )}

            {(actresses.length > 0 || genres.length > 0) && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px]">
                {actresses.slice(0, 3).map((p) => (
                  <Link
                    key={`fv-act-${p.id}`}
                    href={`/actresses/${p.id}`}
                    className="inline-flex items-center gap-0.5 rounded-full border border-amber-400/30 bg-amber-400/5 px-2 py-0.5 text-amber-200 transition-colors hover:border-amber-400/60 hover:text-amber-100"
                  >
                    <Users className="size-3" aria-hidden />
                    {p.name}
                  </Link>
                ))}
                {genres.slice(0, 4).map((g) => (
                  <Link
                    key={`fv-gen-${g.id}`}
                    href={`/genres/${g.id}`}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-foreground/90 transition-colors hover:border-amber-400/40 hover:text-amber-300"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

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
                  <Link
                    key={p.id}
                    href={`/actresses/${p.id}`}
                    className="rounded-full border border-amber-400/30 bg-amber-400/5 px-2.5 py-0.5 text-[11px] text-amber-200 transition-colors hover:border-amber-400/60 hover:text-amber-100"
                  >
                    {p.name}
                  </Link>
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

          {/* メイン CTA: BRAND_DESIGN_GUIDE §3 §4 準拠。
             - URL は `buildAffiliateURL({ asp: "fanza", contentId, actressOrSku })`
               を単一情報源として組み立て、`af_id` は環境変数
               (`NEXT_PUBLIC_FANZA_AFFILIATE_ID` / `DMM_AFFILIATE_ID`) から
               解決する。`item.affiliateURL` の直渡しはハードコード禁則と
               同じリスクを抱えるため正規ビルダ経由へ統一。
             - 文言は BRAND_DESIGN_GUIDE L96 で規定された統一コピー。
             - 配色は `btn-luxury-gold` (シャンパンゴールド #D4AF37 ×
               リッチブラック反転) を採用、肉厚 14h + 太字。 */}
          <FanzaAffiliateLink
            href={fanzaAffiliate.primaryUrl}
            content_id={item.content_id}
            title={item.title}
            floor_code={floor}
            placement="detail_main_cta"
            className={cn(
              "btn-luxury-gold w-full rounded-xl text-base font-semibold",
              "min-h-14 px-5 py-3",
              "group",
            )}
          >
            <span className="text-center leading-tight">
              FANZA公式で作品の詳細・サンプル映像を確認する（18禁）
            </span>
            <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </FanzaAffiliateLink>

          <p className="text-[10px] leading-snug text-muted-foreground/60">
            ※ FANZA 公式サイトへ移動します。視聴・購入は FANZA 上で行われます。
          </p>

          {/* U1: 新規ユーザー向けマイクロモジュール（lg=右カラムがFVを兼ねるため
             メインCTA直下に配置。mobile では FV ブロック側で表示済みのため隠す） */}
          {showNewUserModule && (
            <NewUserFvModule
              href={fanzaAffiliate.primaryUrl}
              content_id={item.content_id}
              title={item.title}
              floor_code={floor}
              className="hidden lg:block"
            />
          )}

          {/* セカンダリ動線（回遊の盾）: 検索エンジンから本ページに直接着地した
             ユーザー (GA4 物理監査で hostname=app.vodnavi.jp が 96.99% を占有)
             に対し、女優インテントの AI コンシェルジュへ即時遷移できる脱出口を
             FANZA メイン CTA 直下に配置。`source=app_direct` で内部回遊
             (`app_detail`) と GA4 / `resolveConciergeSource` の挙動を分離。
             2026-05-28 監査で concierge_entry_click=5 / CVR 0.19% という窒息を
             受け、`variant="solid"` を渡して FANZA CTA と同等の視覚 weight に
             格上げする（FANZA メイン CTA の直下に金面 vs 金面で第二の成約口
             として並ぶ設計）。 */}
          <ConciergeCtaLink
            contentId={item.content_id}
            floorCode={floor}
            source="app_direct"
            intent="actress"
            variant="solid"
            label="気分を AI コンシェルジュに伝えて次の 1 本を選ぶ（無料）"
            className="mt-3"
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
                href={fanzaAffiliate.primaryUrl}
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

      {/* CCO 自動生成レビュー (work-reviews/{cid}.md) を Information Gain 段落として
         FANZA 公式あらすじの上に重ねる。検索エンジン直撃層が editorialLead 未配備
         でも VODNAVI 独自視座に触れられる SEO 防衛線。fixture ソースの間も UI 上は
         差別化せず（CSO レビュー後に live 切替）、視認は frontmatter で行う。 */}
      {ccoReview && (
        <>
          {/* COMPLIANCE_GUIDE.md §1.2 (ステマ規制対応) 準拠の #PR 明示。
             VODNAVI Review が文学的官能トーンを纏うため広告性が読者に
             分かりづらい構造ゆえ、レビュー本体の直前に銘記しなければならない。
             BRAND_DESIGN_GUIDE §2 のリッチブラック (#121212 = brand-dark) +
             プラチナホワイト (#E0E0E0 = brand-text-primary) + シャンパンゴールド
             (#D4AF37 = brand-gold) 三色域で構成、原色の警告色は厳禁。
             2026-05-28 CVR 改善: 文字色を `brand-text-secondary` に下げ、padding
             を縮め、視覚 weight を弱めて FANZA CTA の誤離脱トリガーを抑制する。
             景表法の明示要件は文言と margin で担保し続ける。 */}
          <aside
            role="note"
            aria-label="アフィリエイト広告に関する明示"
            data-compliance-pr="true"
            className="mb-2 rounded-r-md border-l-2 border-brand-gold/70 bg-brand-surface/80 px-3 py-2 text-[11px] leading-snug text-brand-text-secondary"
          >
            本ページにはアフィリエイトリンクが含まれます（#PR）。最新の配信状況は公式サイトでご確認ください。
          </aside>
          <section
            data-work-review-source={ccoReview.source}
            className="mb-6 rounded-2xl border border-brand-gold/20 bg-brand-dark/40 px-5 py-5 sm:px-7 sm:py-6"
          >
            <p className="font-luxury-heading text-[11px] uppercase tracking-[0.25em] text-brand-gold/80">
              VODNAVI Review
            </p>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-text-primary sm:text-base">
              {ccoReview.body.split(/\n\s*\n/).map((para: string, idx: number) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </section>
        </>
      )}

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
                    href={`/works/${normalizeFloorForUrl(rel.floor_code)}/${rel.content_id}`}
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

      {/* Sticky モバイル CTA バー — モバイル (md 未満) のみ画面最下部に固定表示。
         2026-05-28 GA4 監査で UU 2,107 → ai_session_start=8 (0.38%) / concierge_
         entry_click=4 (0.19%) の CVR ファネル窒息を確認。詳細ページ着地時に
         アスペクト 3:4 商品画像 (~500px) + H1 + メタが iPhone 11/12/13/14/15
         ファーストビュー (~667px) を完全に占有し、両 CTA は ~245-320px 下に
         埋もれている構造的問題への defense in depth。
         BRAND_DESIGN_GUIDE §2 のリッチブラック (#121212 = brand-dark) + シャン
         パンゴールド (#D4AF37 = brand-gold) のみで構成、原色禁則を維持。
         h-12 (48px) で iOS HIG タッチ規範 44px を完全クリア。`md:hidden` で
         タブレット以上の幅では 2 カラムレイアウトに任せて非表示化。 */}
      <div
        data-sticky-mobile-cta="true"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "border-t border-brand-gold/30 bg-brand-dark/95 backdrop-blur",
          "px-3 py-2",
          "grid grid-cols-2 gap-2",
        )}
      >
        <FanzaAffiliateLink
          href={fanzaAffiliate.primaryUrl}
          content_id={item.content_id}
          title={item.title}
          floor_code={floor}
          placement="detail_sticky_cta"
          className={cn(
            "flex h-12 items-center justify-center gap-1 rounded-xl",
            "bg-brand-gold text-brand-dark",
            "font-luxury-heading text-[13px] font-semibold tracking-wide leading-tight",
            "transition-all hover:bg-brand-gold-hover active:translate-y-px",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60",
          )}
        >
          <span className="text-center">{STICKY_MAIN_LABEL}</span>
        </FanzaAffiliateLink>
        <ConciergeCtaLink
          contentId={item.content_id}
          floorCode={floor}
          source="app_direct"
          intent="actress"
          variant="outline"
          label={STICKY_SUB_LABEL}
          className="h-12 px-3 text-[13px]"
        />
      </div>
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
  const url = absoluteUrl(canonicalWorkPath(floor, id));
  // Offer.url に `item.affiliateURL`（al.dmm + af_id）を置くと、構造化データを
  // 検証・巡回する bot の fetch が DMM 側で「クリック」として計上される
  // （2026-06-24〜 クリック25倍事故の主因経路）。af_id を含まない URL のみ許可。
  const offerUrl = item.URL ?? url;
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
