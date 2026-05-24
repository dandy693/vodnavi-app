import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 年齢確認の盾（リーガル防衛）+ クロスドメインリンカー (_gl) 追跡
 *
 * Next.js 16 の `proxy.ts` ファイル規約（旧 `middleware.ts` の後継、
 * deprecation 警告解消）。STRATEGY_BRIEF_002 / BRAND_DESIGN_GUIDE §3
 * 「年齢確認の盾」を「データ追尾を阻害せず」実効化する非対称ガード。
 *
 *   - ページルート (/concierge 等)：常に通過 (next)。リダイレクトしない。
 *     Moterist 側から引き継いだ `source` / `intent` / `_gl` クエリは
 *     ブラウザに 100% 無傷で着地し、GA4 + ai_session_start イベントが
 *     発火する。視覚的な年齢確認はクライアント側モーダルで担保する。
 *     `_gl` 付き着地時は Vercel Logs へ構造化ログを emit（サタデー
 *     レビューでクロスドメインリンカーの実効件数を計測する）。
 *
 *   - API ルート (/api/concierge/* 等)：クッキー未通過なら HTTP 403。
 *     LLM コール・FANZA API などコアデータへのアクセスはサーバー側で
 *     物理遮断する。クライアントの JS 改竄を許容しない核心防衛線。
 */

const COOKIE_NAME = "vodnavi_age_verified";
const COOKIE_VALUE = "1";

export function proxy(req: NextRequest): NextResponse {
  const { pathname, searchParams } = req.nextUrl;

  // ページルート：_gl 着地計測 + パススルー
  if (pathname === "/concierge" || pathname.startsWith("/concierge/")) {
    const glParam = searchParams.get("_gl");
    if (glParam) {
      const source = searchParams.get("source") ?? "unknown";
      const intent = searchParams.get("intent") ?? "unknown";
      // PII 漏洩を避けるため _gl は先頭 10 文字のみ記録（プレフィックスで存在検知）
      console.log(
        `[GL_TRACKING] ts=${new Date().toISOString()} source=${source} intent=${intent} gl_prefix=${glParam.slice(0, 10)}`,
      );
    }
    return NextResponse.next();
  }

  // API ルート：年齢確認クッキー必須
  const verified = req.cookies.get(COOKIE_NAME)?.value === COOKIE_VALUE;
  if (verified) {
    return NextResponse.next();
  }

  // useChat フックは JSON を読みに来るので本文を用意する
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
 * 守備範囲：
 *   - /concierge[/...]      : page route（_gl 計測 + パススルー）
 *   - /api/concierge/...    : API route（age-gate 403 ガード）
 */
export const config = {
  matcher: ["/concierge", "/concierge/:path*", "/api/concierge/:path*"],
};
