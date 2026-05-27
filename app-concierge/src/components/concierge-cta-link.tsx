"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * 作品詳細ページ末尾に置く「AI コンシェルジュへ相談」誘導 CTA。
 *
 * SEO で /works/[floor]/[id] に着地したオーガニック流入の 99% が詳細ページで
 * 完結し /concierge に到達しない (2026-05-25 GA4 診断: organic 1,011 →
 * ai_session_start 10件) ファネル断絶を埋める。FANZA メイン CTA の視線を
 * 阻害しないアウトラインスタイルでセカンダリ動線として配置する。
 *
 * 遷移時に GA4 `concierge_entry_click` を発火 (transport_type: 'beacon' で
 * ナビゲーション中のリクエスト脱落を防止)。URL クエリで `source=app_detail`
 * `intent=re_recommend` `seed_cid=<content_id>` を引き継ぎ、コンシェルジュ
 * 側の `resolveConciergeSource` が「app_detail」プロファイルを選択して
 * 『別の作品をお探しですね』addendum 付きで会話を開始する。
 */
export function ConciergeCtaLink({
  contentId,
  floorCode,
  className,
  source = "app_detail",
  intent = "re_recommend",
  label = "この作品の余韻に合う一本を AI に相談する",
}: {
  contentId: string;
  floorCode: string;
  className?: string;
  /**
   * GA4 / URL クエリの `source`。
   * デフォルト `app_detail` = 内部回遊から詳細ページ経由のクリック。
   * 検索エンジンから作品ページに「直接着地」したユーザー向け CTA では
   * `app_direct` を渡し、ファネルを区別する。
   */
  source?: string;
  /**
   * 推薦インテント。`re_recommend` (詳細ページの代替提案) /
   * `actress` (女優繋がりの深掘り) など、BRAND_DESIGN_GUIDE §3 の
   * intent 規約に従う。
   */
  intent?: string;
  /** ボタン本文。世界観に合わせて外部から差し替え可能。 */
  label?: string;
}) {
  const href = `/concierge?source=${encodeURIComponent(source)}&intent=${encodeURIComponent(intent)}&seed_cid=${encodeURIComponent(contentId)}`;

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={() => {
        track("concierge_entry_click", {
          from_page: "detail",
          content_id: contentId,
          floor_code: floorCode,
          source,
          intent,
          transport_type: "beacon",
        });
      }}
      className={cn(
        // 視覚: リッチブラック背景 × シャンパンゴールド枠線・テキスト。
        // ホバー: 背景ゴールド × 文字ダークへエレガントに反転。
        "group inline-flex items-center justify-center gap-2",
        "h-12 w-full rounded-xl px-6",
        "bg-brand-dark text-brand-gold",
        "border border-brand-gold/70",
        "font-luxury-heading text-sm font-semibold tracking-wider",
        "transition-all duration-300 ease-out",
        "hover:bg-brand-gold hover:text-brand-dark hover:border-brand-gold",
        "hover:shadow-[0_0_40px_-10px_rgba(212,175,55,0.45)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark",
        "active:translate-y-px",
        className,
      )}
    >
      <Sparkles
        className="size-4 transition-transform duration-300 group-hover:rotate-12"
        aria-hidden
      />
      <span>{label}</span>
    </Link>
  );
}

/**
 * 詳細ページの末尾（関連作品セクションの下）に置くリッチなパネル CTA。
 *
 * スクロール最下部まで読み進めて離脱しかけているユーザーへの最後の脱出口。
 * 視覚: リッチブラック背景に金 1px ライン枠 + ゴールドの見出し + 控えめな本文 +
 * ホバー反転 CTA。`<ConciergeCtaLink>` を内包することで GA4 発火・URL 規約
 * （source=app_detail / intent=re_recommend / seed_cid）を単一情報源で集約。
 */
export function ConciergeCtaPanel({
  contentId,
  floorCode,
}: {
  contentId: string;
  floorCode: string;
}) {
  return (
    <section
      className={cn(
        "mt-12 overflow-hidden rounded-2xl",
        "bg-brand-dark",
        "border border-brand-gold/40",
        "shadow-[0_0_60px_-20px_rgba(212,175,55,0.25)]",
      )}
    >
      <div className="flex flex-col gap-5 px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-2">
          <span className="font-luxury-heading text-[11px] uppercase tracking-[0.25em] text-brand-gold/80">
            AI Concierge
          </span>
          <h2 className="font-luxury-heading text-xl font-semibold leading-tight text-brand-text-primary sm:text-2xl">
            次の一本に、AI コンシェルジュからの提案を
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-brand-text-secondary">
          この作品を観終えた夜、似た気配のもの、あるいは少し違う扉──
          あなたの今夜のお気持ちに合わせて、別の一本を静かにご案内します。
        </p>
        <div className="pt-1">
          <ConciergeCtaLink
            contentId={contentId}
            floorCode={floorCode}
            className="sm:w-auto sm:px-8"
          />
        </div>
      </div>
    </section>
  );
}
