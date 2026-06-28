// 🚧 TEMPORARY / 使い捨て検証ルート — BRIEF_085 §5 のランタイム疎通 PoC。
//
// 目的: 本番 Vercel runtime で `SUPABASE_SERVICE_ROLE_KEY` が実際に効き、
//       Supabase へ到達できるかをファクトベースで確認する（build の型チェックだけ
//       では runtime 疎通は検証できないため）。
//
// ⚠️ 検証完了後に削除すること（恒久ルートではない）。
//
// 最高法律遵守:
//   - service_role key そのものは絶対にレスポンスへ出力しない。返すのは
//     `verifySupabaseConnection()` の PocResult（status / detail / sampleCount）のみ＝
//     secret を一切含まない。
//   - force-dynamic + no-store でリクエスト毎に実 env を読んで実行（静的キャッシュ回避）。
import { verifySupabaseConnection } from "@/lib/supabase/poc-test";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await verifySupabaseConnection();
  const reachedDb =
    result.status === "connected" || result.status === "connected_no_table";

  return Response.json(
    { ok: reachedDb, ...result },
    { headers: { "Cache-Control": "no-store" } },
  );
}
