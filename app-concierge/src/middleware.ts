import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 年齢確認の盾（リーガル防衛）— Vercel Edge Middleware
 *
 * BRAND_DESIGN_GUIDE.md §3「年齢確認の盾」を実効化する不可逆ガード。
 * クライアント JS の改ざんを許さず、サーバー側で必ず判定する。
 *
 * 動作：
 *   - `vodnavi_age_verified === "1"` クッキーがあれば通過。
 *   - クッキー未通過時：
 *     - /api/concierge/* など API ルート → HTTP 403 即座返却（JSON 本文付き）。
 *     - /concierge/* など画面ルート → /age-gate?next=<元URL> へリダイレクト。
 *
 * Vercel/mixhost/FANZA いずれの規約 BAN リスクも排除する。
 */

const COOKIE_NAME = "vodnavi_age_verified";
const COOKIE_VALUE = "1";

export function middleware(req: NextRequest): NextResponse {
  const verified = req.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE;
  if (verified) {
    return NextResponse.next();
  }

  const { pathname, search } = req.nextUrl;

  // API ルート：403 を即座に返し、リクエスト本体は処理しない。
  // chat の useChat フックは body を読みに来るので JSON 本文を用意する。
  if (pathname.startsWith("/api/")) {
    return new NextResponse(
      JSON.stringify({
        error: "age_verification_required",
        message: "18 歳以上であることを確認してください。/age-gate を訪問してください。",
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

  // 画面ルート：年齢確認ゲートへリダイレクト。
  // `next` パラメータは「内部パスのみ」を許可（オープンリダイレクト対策）。
  const gateUrl = new URL("/age-gate", req.url);
  const safeNext = pathname.startsWith("/") && !pathname.startsWith("//")
    ? pathname + search
    : "/concierge";
  gateUrl.searchParams.set("next", safeNext);
  return NextResponse.redirect(gateUrl);
}

/**
 * 守備範囲：
 *   - /concierge と配下のパス（ページ）
 *   - /api/concierge と配下のパス（チャット API）
 *
 * /age-gate と /api/age-gate は意図的に matcher から除外（ゲート自体を踏ませる必要があるため）。
 * トップページ・記事一覧・法務ページ等は対象外（公開情報のみ提供）。
 */
export const config = {
  matcher: ["/concierge/:path*", "/api/concierge/:path*"],
};
