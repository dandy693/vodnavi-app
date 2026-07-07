import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FanzaAffiliateLink } from "@/components/fanza-affiliate-link";
import { GuideReturnCta } from "@/components/guide-return-cta";
import { buildAffiliateURL, buildTvSignupURL } from "@/lib/concierge/url-builder";
import { getPublishedArticleBySlug } from "@/lib/editorial-articles";
import { absoluteUrl, compactDescription, compactTitle } from "@/lib/site";

// genres/[id] と同方針: 動的 SSR + on-demand ISR。generateStaticParams は
// 置かない（slug は Supabase 側で増減する＝請求時レンダ + 300s 再検証）。
export const revalidate = 300;

type Params = { slug: string };

// インデックス方針（BRIEF_085 §3 / BRIEF_086 §4 / e82a670 canonical 統制）:
//   - self-canonical でクエリを consolidation。個別 noindex は注入しない。
//   - not-found のときのみ metadata 層で noindex（genres/[id] と同型）。
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) {
    return {
      title: "記事が見つかりません",
      robots: { index: false, follow: false },
    };
  }

  const title = compactTitle(article.title);
  const description = article.description
    ? compactDescription(article.description)
    : compactDescription(article.title);
  const url = absoluteUrl(`/articles/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "VODNAVI",
      locale: "ja_JP",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  // body は空行区切りの素のテキスト。段落へ分解して描画する
  // （work-review の本文描画と同方針）。拡張（新規会員導線 発注 2026-07-07）:
  //   - "## " 始まりのブロック → <h2>
  //   - "[[CTA:tv_signup]]" → FANZA TV 登録 CTA（placement=guide_tv_signup_cta）
  //   - "[[CTA:first_purchase]]" → 作品ページへ戻る CTA（guide_first_purchase_cta）
  //   - 段落内の単一改行は whitespace-pre-line で保持（手順・FAQ の行構造用）
  // CRLF 正規化: Windows 由来の本文（Studio 貼付等）は改行が \r\n になり、
  // \n{2,} の段落分割が全滅して見出し・CTA マーカーが生テキスト露出する
  // （2026-07-08 fanza-first-guide 初回投入で実発生）。\r は無条件に除去する。
  const paragraphs = (article.body ?? "")
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  // TV 登録導線: FANZA ドメイン（dmm.co.jp）登録フォーム経由が成果条件
  // （報酬料率ページ注記）。url-builder の検証済みターゲットのみ使用。
  const tvSignupUrl = buildTvSignupURL();

  return (
    <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-amber-300">
          ホーム
        </Link>
        <span className="mx-2">›</span>
        <span>記事</span>
        <span className="mx-2">›</span>
        <span className="text-foreground/80">{article.title}</span>
      </nav>

      <header className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {article.title}
        </h1>
      </header>

      {paragraphs.length > 0 && (
        <section className="space-y-4 text-sm leading-relaxed text-foreground/90 sm:text-base">
          {paragraphs.map((p, i) => {
            if (p === "[[CTA:tv_signup]]") {
              return (
                <div key={i} className="py-2">
                  <FanzaAffiliateLink
                    href={tvSignupUrl}
                    content_id="fanza_tv_premium"
                    title="FANZA TV（DMMプレミアム）"
                    floor_code="monthly"
                    placement="guide_tv_signup_cta"
                    className="btn-luxury-gold inline-flex w-full items-center justify-center gap-2 rounded-xl min-h-12 px-5 py-3 text-sm font-semibold group"
                  >
                    <span>FANZA TVを見てみる（登録3分）</span>
                  </FanzaAffiliateLink>
                </div>
              );
            }
            if (p === "[[CTA:first_purchase]]") {
              return (
                <div key={i} className="py-2">
                  <GuideReturnCta />
                </div>
              );
            }
            if (p.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="pt-4 font-heading text-lg font-semibold text-foreground sm:text-xl"
                >
                  {p.slice(3)}
                </h2>
              );
            }
            return (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            );
          })}
        </section>
      )}

      {article.products.length > 0 && (
        <section className="mt-12 border-t border-white/5 pt-8">
          <h2 className="mb-4 font-heading text-base font-semibold text-foreground sm:text-lg">
            この記事で紹介した作品
          </h2>
          <ul className="space-y-3">
            {article.products.map((product) => {
              // af_id 入り URL は保存せず描画時生成（ID 抽象化）。env 未解決時は
              // url-builder が追跡なしの生 URL を返す（盾: ハードコードしない）。
              const { primaryUrl } = buildAffiliateURL({
                contentId: product.content_id,
              });
              return (
                <li key={product.content_id}>
                  <FanzaAffiliateLink
                    href={primaryUrl}
                    content_id={product.content_id}
                    title={product.content_id}
                    // ライブ article_products は per-product floor を保持しないため、
                    // CTA 分析用に FANZA 主力フロア videoa を既定値で渡す。
                    floor_code="videoa"
                    placement="article_product_cta"
                    className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/[0.06] px-4 py-2 text-sm font-medium text-amber-300 transition-colors hover:border-amber-400/60 hover:bg-amber-400/10"
                  >
                    FANZA で視聴する（{product.content_id}）
                  </FanzaAffiliateLink>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
