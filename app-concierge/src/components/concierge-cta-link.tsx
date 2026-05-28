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
  variant = "outline",
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
  /**
   * 視覚的ヒエラルキー切替。
   *   - `outline` (default): リッチブラック背景 × ゴールド枠線テキスト。FANZA
   *     メイン CTA を阻害しないサブ動線で、フッタパネル / 内部回遊で使う。
   *   - `solid`: シャンパンゴールド背景 × リッチブラックテキスト。FANZA CTA と
   *     並んでも見劣りしない強調バリアント。検索直撃ユーザーに対する第二の
   *     成約口として、詳細ページ上部の `source=app_direct` ルートで使う。
   *
   * 2026-05-28 物理監査で UU 2,107 vs concierge_entry_click 5 (CVR 0.19%) と
   * 著しく窒息していたことを受けて、視覚 weight を強化する選択肢として導入。
   */
  variant?: "outline" | "solid";
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
        // 共通: 大人らしい型枠、グループハバー、フォーカスリング、アクティブ tap-down。
        "group inline-flex items-center justify-center gap-2",
        "w-full rounded-xl px-6",
        "font-luxury-heading font-semibold tracking-wider",
        "transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark",
        "active:translate-y-px",
        variant === "solid"
          ? [
              // solid: シャンパンゴールド地・リッチブラック文字。常時 glow + 厚みで
              //   FANZA メイン CTA と同等の視覚 weight を確保。
              "h-14 text-base",
              "bg-brand-gold text-brand-dark border border-brand-gold",
              "shadow-[0_0_30px_-5px_rgba(212,175,55,0.55)]",
              "hover:bg-brand-gold-hover hover:border-brand-gold-hover",
              "hover:shadow-[0_0_45px_-5px_rgba(212,175,55,0.75)]",
            ].join(" ")
          : [
              // outline: 既存通り、暗背景 × 金枠。FANZA メイン CTA を阻害しない弱め。
              "h-12 text-sm",
              "bg-brand-dark text-brand-gold border border-brand-gold/70",
              "hover:bg-brand-gold hover:text-brand-dark hover:border-brand-gold",
              "hover:shadow-[0_0_40px_-10px_rgba(212,175,55,0.45)]",
            ].join(" "),
        className,
      )}
    >
      <Sparkles
        className={cn(
          "transition-transform duration-300 group-hover:rotate-12",
          variant === "solid" ? "size-5" : "size-4",
        )}
        aria-hidden
      />
      <span className="leading-tight">{label}</span>
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
