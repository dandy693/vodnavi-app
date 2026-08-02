"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * B2②-a（2026-08-03 CSO承認）: works / actresses から articles への内部送客導線。
 *
 * 目的は判定ゲート指標①（articles 面のクリック実数）。works 面には唯一の外部被リンク
 * （japanero.jp 由来・作品詳細に着地）があり、articles 面へ内部リンクで権威と流入を
 * 中継できる唯一の起点である（2026-08-01 ahrefs 実測 / `/articles/` 宛の外部被リンクは 0件）。
 *
 * 設計上の制約:
 * - **`<details>` の外に置く**＝常時可視。既存の U1（`NewUserFvModule`）はリンクを
 *   折りたたみの中に持つため、利用者から見えない状態だった。
 * - **既存 CTA を減らさない**（指標③の毀損回避）。金 CTA の直下に「追加」する。
 * - リンク先は `app.vodnavi.jp` 内部の `/articles/<slug>` のみ。af_id を含む URL は
 *   一切扱わない（`scripts/guard-affiliate-id.mjs` の静的検査に抵触しない）。
 * - `rel` に nofollow を付けない＝内部リンクとしてエクイティを流す。
 *
 * GA4: イベント名 `article_guide_click`。`placement` は面ごとに分ける。
 * **これは articles 面でのアフィリエイトクリックではなく「送客量」の計装であり、
 * 判定ゲート指標①の分子には含めない**（`management/_metrics/GATE_20260930.md`）。
 */
export type ArticleGuideSurface = "works" | "actresses";

const SURFACE_PLACEMENT = {
  works: "works_to_articles_cta",
  actresses: "actresses_to_articles_cta",
} as const;

export interface ArticleGuideLink {
  /** `editorial_articles` の公開 slug。外部 URL は受け付けない。 */
  slug: string;
  label: string;
}

export function ArticleGuideLinks({
  surface,
  sourceId,
  heading,
  links,
  className,
}: {
  surface: ArticleGuideSurface;
  /** works: content_id / actresses: 女優 ID。GA4 で送客元を識別する。 */
  sourceId: string;
  heading: string;
  links: ReadonlyArray<ArticleGuideLink>;
  className?: string;
}) {
  if (links.length === 0) return null;

  const placement = SURFACE_PLACEMENT[surface];

  return (
    <nav
      aria-label={heading}
      className={cn(
        "rounded-xl border border-amber-400/20 bg-amber-400/[0.04] px-4 py-3",
        className,
      )}
    >
      <p className="text-[11px] font-semibold tracking-wide text-amber-200/90">
        {heading}
      </p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {links.map((link) => (
          <li key={link.slug}>
            <Link
              href={`/articles/${link.slug}`}
              prefetch={false}
              onClick={() => {
                // transport_type=beacon: ナビゲーション中のリクエスト脱落を防ぐ
                // （ConciergeCtaLink と同じ方針）。
                track("article_guide_click", {
                  placement,
                  target_slug: link.slug,
                  source_surface: surface,
                  source_id: sourceId,
                  transport_type: "beacon",
                });
              }}
              className={cn(
                "group inline-flex items-start gap-1 text-xs leading-relaxed",
                "text-amber-200/90 underline decoration-amber-400/40 underline-offset-2",
                "transition-colors hover:text-amber-100 hover:decoration-amber-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60",
              )}
            >
              <ChevronRight
                className="mt-[0.15rem] size-3 shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
