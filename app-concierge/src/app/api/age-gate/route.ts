import { NextResponse } from "next/server";

/**
 * 年齢確認クッキー発行エンドポイント。
 *
 * POST /api/age-gate  { confirm: true }
 *
 * - 設定値: `vodnavi_age_verified=1`
 * - 有効期限: 1 年（`max-age=31536000`）
 * - Secure: true（HTTPS のみ）
 * - SameSite: Lax（クロスサイトの遷移時にも保持されつつ POST/iframe は弾く）
 * - HttpOnly: false（BRAND_DESIGN_GUIDE.md §3 の方針に従う）
 *
 * クッキー値の改ざんはアウト・オブ・スコープ（攻撃者が自分で「18 歳以上」と
 * 宣言した場合、法的にはその者の責任となる。サービス側の規約 BAN 防止が目的）。
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(req: Request): Promise<NextResponse> {
  let body: { confirm?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400 },
    );
  }

  if (body.confirm !== true) {
    return NextResponse.json(
      { error: "confirm_required" },
      { status: 400 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("vodnavi_age_verified", "1", {
    maxAge: ONE_YEAR_SECONDS,
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
