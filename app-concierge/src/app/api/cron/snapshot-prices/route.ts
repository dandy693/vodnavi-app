/**
 * 価格履歴の日次スナップショット（Vercel Cron・第93便 CSO裁定B(1)）。
 *
 * 【スケジュール】`vercel.json` の `crons` で **`0 21 * * *`（UTC）= 06:00 JST**。
 * セールは実測で約3日（50%OFF）〜約7日（30%OFF）で入れ替わるため、日次で足りる。
 *
 * 【認証】Vercel の公式パターン（`Authorization: Bearer $CRON_SECRET` の自前検証）に従う。
 *   - **`CRON_SECRET` が設定されていれば、それが一致しない限り 401。**
 *   - **未設定の場合は `x-vercel-cron-schedule` ヘッダの存在を要求する。**
 *     このヘッダは Vercel の cron 起動時にのみ付与されるが、**偽装は可能**である。
 *     そのため被害を構造的に抑えてある——
 *       ① 書き込みは `(content_id, snapshot_date)` の upsert で**日次冪等**（行が増えない）
 *       ② 上流の FANZA API は `fetchItemList` の Data Cache（300秒）に保護される
 *     **【HUMAN 枠】`CRON_SECRET` を Vercel の環境変数へ設定すること。**
 *     設定されるまでは上記のフォールバックで動く（弱い保護であることを承知のうえ）。
 *
 * 【冪等】同日中に何度叩かれても行数は増えない。値は最後の取得で上書きされる。
 *
 * 【公開面に影響しない】このエンドポイントは `price_history` に書くだけで、
 * `/sale` も sitemap も読まない。**失敗しても公開面は壊れない。**
 */
import type { NextRequest } from "next/server";

import { savePriceHistory, toPriceHistoryRows } from "@/lib/fanza/price-history";
import { fetchSaleItems } from "@/lib/fanza/sale-source";

/** cron は毎回実行する。キャッシュさせない。 */
export const dynamic = "force-dynamic";
/** 4フロア × 4ページ + Supabase 書き込みぶんの余裕。 */
export const maxDuration = 60;

function authorize(request: NextRequest): { ok: true } | { ok: false; reason: string } {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret) {
    return authHeader === `Bearer ${cronSecret}`
      ? { ok: true }
      : { ok: false, reason: "CRON_SECRET が一致しない" };
  }

  // CRON_SECRET 未設定時のフォールバック（弱い保護・上のコメント参照）。
  return request.headers.get("x-vercel-cron-schedule") !== null
    ? { ok: true }
    : { ok: false, reason: "CRON_SECRET 未設定かつ Vercel Cron 由来ではない" };
}

export async function GET(request: NextRequest): Promise<Response> {
  const auth = authorize(request);
  if (!auth.ok) {
    return Response.json({ ok: false, reason: auth.reason }, { status: 401 });
  }

  const startedAt = Date.now();
  const now = new Date();

  try {
    // `/sale` と同じ取得経路を使う。**キャンペーン名は定数で持たない**（rank 走査）。
    // ここでは表示用の上限を外し、走査で見つかったセール中の作品をすべて記録する。
    const { items, totalFound, okFloors, failedFloors } = await fetchSaleItems({
      now,
      // Data Cache（300秒）に載せず、cron の時点の値を取る。
      revalidate: 0,
      limit: Number.MAX_SAFE_INTEGER,
    });

    const rows = toPriceHistoryRows(items, now);
    const result = await savePriceHistory(rows);

    const body = {
      ok: result.errors.length === 0,
      snapshot_date: rows[0]?.snapshot_date ?? null,
      found: totalFound,
      rows: result.attempted,
      saved: result.saved,
      skipped: result.skipped,
      okFloors,
      failedFloors,
      errors: result.errors,
      took_ms: Date.now() - startedAt,
    };

    // **0件で静かに成功させない。** セールが本当に無いのか、走査が届かなかったのかを
    // 後から区別できるよう、0件は 200 だが `ok:false` として記録に残す。
    if (rows.length === 0) {
      console.warn(JSON.stringify({ tag: "VODNAVI_PRICE_SNAPSHOT_EMPTY", ...body }));
      return Response.json({ ...body, ok: false, reason: "セール中の作品を1件も取得できなかった" });
    }

    console.info(JSON.stringify({ tag: "VODNAVI_PRICE_SNAPSHOT", ...body }));
    return Response.json(body, { status: result.errors.length === 0 ? 200 : 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error(JSON.stringify({ tag: "VODNAVI_PRICE_SNAPSHOT_FAILED", message }));
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
