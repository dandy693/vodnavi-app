import { ChevronDown } from "lucide-react";

import { FanzaAffiliateLink } from "@/components/fanza-affiliate-link";
import { cn } from "@/lib/utils";

/**
 * U1: 作品詳細FV 新規ユーザー向けマイクロモジュール（新規会員導線 設計書v1 / 2026-07-07 CSO発注）。
 *
 * 設計3原則の実装制約:
 * - 迂回させない: FV内・メインCTA直下1行。<details> の展開式で FV を圧迫しない
 *   （JS不要のネイティブ開閉＝server component から直接描画可能）。
 * - 検索意図に逆らわない: 訴求は「この作品を観るには→未登録なら最安」の従属順序。
 * - リンク先は変えない: 展開部の購入リンクもメインCTAと同一の
 *   `buildAffiliateURL` 産 primaryUrl（af_id=004）。クリック分散を防ぐ。
 *   placement="works_fv_newuser" で GA4 分離計測のみ行う。
 *
 * 【リリースゲート】コピーの《…》スロットは設計書 §4 の HUMAN 確認
 * （新規報酬単価・初回特典の現行内容）→ CSO コピー確定版の発行まで
 * プレースホルダ。フィーチャーフラグ `FEATURE_FV_NEWUSER=1`（server env）
 * が立つまで本モジュールは描画されない（works page 側でゲート）。
 */
export function NewUserFvModule({
  href,
  content_id,
  title,
  floor_code,
  className,
}: {
  href: string;
  content_id: string;
  title: string;
  floor_code: string;
  className?: string;
}) {
  return (
    <details
      className={cn(
        "group/newuser rounded-lg border border-amber-400/15 bg-amber-400/[0.02] px-3 py-2",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] leading-snug text-amber-200/90 [&::-webkit-details-marker]:hidden">
        <span>
          FANZAが初めての方：《初回特典スロット※§4-2
          確認待ち》で今作を観られます
        </span>
        <ChevronDown
          className="size-3 shrink-0 text-amber-400/60 transition-transform group-open/newuser:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-2 flex flex-col gap-2 border-t border-amber-400/10 pt-2">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          登録は無料です。《支払い方法要約スロット※§4
          確認待ち》。《明細表記の安心情報スロット※§4-2 確認待ち》。
        </p>
        <FanzaAffiliateLink
          href={href}
          content_id={content_id}
          title={title}
          floor_code={floor_code}
          placement="works_fv_newuser"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-amber-300 underline decoration-amber-400/40 underline-offset-2 transition-colors hover:text-amber-200"
        >
          FANZA公式でこの作品を観る（初めての方はこちらから・18禁）
        </FanzaAffiliateLink>
        <a
          href="/articles/fanza-first-guide"
          target="_blank"
          rel="noopener"
          className="text-[11px] text-muted-foreground underline decoration-white/20 underline-offset-2 transition-colors hover:text-foreground"
        >
          登録の詳しい手順はこちら（3ステップ図解）
        </a>
      </div>
    </details>
  );
}
