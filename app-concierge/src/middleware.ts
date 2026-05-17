import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 年齢確認の盾（リーガル防衛）— 非対称型データ追尾インフラ
 *
 * BRAND_DESIGN_GUIDE.md §3「年齢確認の盾」を「データ追尾を阻害せず」
 * 実効化する非対称ガード。STRATEGY_BRIEF_002 で設計が確定：
 *
 *   - ページルート (/concierge 等)：常に通過 (next)。リダイレクトしない。
 *     Moterist 側から引き継いだ `source` / `intent` / `_gl` クエリは
 *     ブラウザに 100% 無傷で着地し、GA4 + ai_session_start イベントが
 *     発火する。視覚的な年齢確認はクライアント側モーダルで担保する。
 *
 *   - API ルート (/api/concierge/* 等)：クッキー未通過なら HTTP 403。
 *     LLM コール・FANZA API などコアデータへのアクセスはサーバー側で
 *     物理遮断する。クライアントの JS 改竄を許容しない核心防衛線。
 */

const COOKIE_NAME = "vodnavi_age_verified";
const COOKIE_VALUE = "1";

export function middleware(req: NextRequest): NextResponse {
  const verified = req.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE;
  if (verified) {
    return NextResponse.next();
  }

  // API ルート：403 を即座に返し、リクエスト本体は処理しない。
  // useChat フックは JSON を読みに来るので本文を用意する。
  return new NextResponse(
    JSON.stringify({
      error: "age_verification_required",
      message:
        "18 歳以上であることを確認してください。/concierge のページから年齢確認を完了してください。",
    }),
    {
      status: 403,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}

/**
 * 守備範囲：API ルートのみ。
 *
 * ページルート (/concierge/*) はパススルーとしクエリパラメータを完全保護。
 * 年齢確認はクライアント側オーバーレイモーダル (`ConciergeGate`) で担保。
 */
export const config = {
  matcher: ["/api/concierge/:path*"],
};
