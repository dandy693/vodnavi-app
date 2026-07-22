import { ChevronDown } from "lucide-react";

import { FanzaAffiliateLink } from "@/components/fanza-affiliate-link";
import { cn } from "@/lib/utils";

/**
 * U1: 作品詳細FV 新規ユーザー向けマイクロモジュール（新規会員導線 設計書v1 / 2026-07-07 CSO発注）。
 *
 * 設計3原則の実装制約:
 * - 迂回させない: FV内・メインCTA直下1行。<details> の展開式で FV を圧迫しない
 *   （JS不要のネイティブ開閉＝server component から直接描画可能）。
 *   ※折りたたみ要件は「7/28評価までの実験期間中は展開表示（defaultOpen）を許可」
 *   （CSO裁定 2026-07-23・「折りたたみ2週 vs 展開1週」の比較評価）へ更新済み。
 * - 検索意図に逆らわない: 訴求は「この作品を観るには→未登録なら最安」の従属順序。
 * - リンク先は変えない: 展開部の購入リンクもメインCTAと同一の
 *   `buildAffiliateURL` 産 primaryUrl（af_id=004）。クリック分散を防ぐ。
 *   placement="works_fv_newuser" で GA4 分離計測のみ行う。
 *
 * コピーは 2026-07-07 CSO 確定版（設計書 §4 の HUMAN 実画面確認済み文言）。
 * **改変禁止** — 改善提案は実装せず CSO へ差し戻すこと
 * （defaultOpen による展開表示バリアントは 2026-07-23 CSO 裁定準拠の正規変更）。
 * 表示ゲートはフィーチャーフラグ `FEATURE_FV_NEWUSER=1`（server env・works page 側）。
 */
export function NewUserFvModule({
  href,
  content_id,
  title,
  floor_code,
  className,
  defaultOpen,
}: {
  href: string;
  content_id: string;
  title: string;
  floor_code: string;
  className?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className={cn(
        "group/newuser rounded-lg border border-amber-400/15 bg-amber-400/[0.02] px-3 py-2",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] leading-snug text-amber-200/90 [&::-webkit-details-marker]:hidden">
        <span>
          FANZAがはじめての方へ｜登録は無料、このページからそのまま購入できます
        </span>
        <ChevronDown
          className="size-3 shrink-0 text-amber-400/60 transition-transform group-open/newuser:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-2 flex flex-col gap-2 border-t border-amber-400/10 pt-2">
        <ul className="flex flex-col gap-1 text-[11px] leading-relaxed text-muted-foreground">
          <li>
            ・会員登録は無料。支払いはクレジットカードのほかDMMポイント（コンビニ等で購入可）にも対応
          </li>
          <li>
            ・見放題派には月額550円のFANZA
            TVも（いま登録すると550ptプレゼント＝実質初月分）
          </li>
          <li>
            ・登録3分の手順とよくある不安への答え →{" "}
            <a
              href="/articles/fanza-first-guide"
              target="_blank"
              rel="noopener"
              className="text-amber-300/90 underline decoration-amber-400/40 underline-offset-2 transition-colors hover:text-amber-200"
            >
              はじめてのFANZAガイド
            </a>
          </li>
        </ul>
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
      </div>
    </details>
  );
}
