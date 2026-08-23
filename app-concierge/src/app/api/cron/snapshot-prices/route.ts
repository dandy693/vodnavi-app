/**
 * 価格履歴の日次スナップショット（Vercel Cron・第93便 CSO裁定B(1)）。
 *
 * 【スケジュール】`vercel.json` の `crons` で **`0 21 * * *`（UTC）= 06:00 JST**。
 * セールは実測で約3日（50%OFF）〜約7日（30%OFF）で入れ替わるため、日次で足りる。
 *
 * 【認証】Vercel の公式パターン（`Authorization: Bearer $CRON_SECRET` の自前検証）。
 * **`CRON_SECRET` を必須とする。一致しない限り 401。**
 *
 * 【2026-08-22・第94便補遺で修正した2点】
 *   ① **`x-vercel-cron-schedule` ヘッダの存在だけを見るフォールバックを廃止した。**
 *      同ヘッダは**外部から任意に付けられる**ため保護にならない。実測（本番）で
 *      **偽装ヘッダだけで 200 が返り、384件の書き込みが実行された**。
 *      「日次冪等だから被害が限定的」は**認証が無いことの正当化にならない**。
 *   ② **失敗理由を HTTP レスポンスに載せるのをやめた。** 旧実装は
 *      「CRON_SECRET 未設定」と「CRON_SECRET が一致しない」を返し分けており、
 *      **秘密が設定されているか否かを外部に開示していた**。理由はサーバログにのみ残す。
 *
 * 【env が反映されない罠】`vercel.json` の `ignoreCommand` は `app-concierge/` に
 * 差分が無いコミットのビルドをスキップする。**Dashboard からの Redeploy も同じ判定を
 * 通るため CANCELED になる**（2026-08-22 実測: `dpl_CsMib8Hy…` / `dpl_DQh63RPp…` が
 * いずれも CANCELED）。**環境変数を反映させるには `app-concierge/` 配下に差分を含む
 * コミットを push する必要がある。**
 *
 * 【冪等】同日中に何度叩かれても行数は増えない。値は最後の取得で上書きされる。
 *
 * 【公開面に影響しない】このエンドポイントは `price_history` に書くだけで、
 * `/sale` も sitemap も読まない。**失敗しても公開面は壊れない。**
 */
import type { NextRequest } from "next/server";

import {
  detectNewCampaigns,
  savePriceHistory,
  toPriceHistoryRows,
} from "@/lib/fanza/price-history";
import { jstDateString } from "@/lib/fanza/sale";
import { fetchSaleItems } from "@/lib/fanza/sale-source";
import {
  autoPostT3,
  cleanupStaleApproved,
  isT3AutoPostEnabled,
  isT3CleanupEnabled,
  STALE_GRACE_MINUTES,
  type CleanupResult,
  type T3AutoResult,
} from "@/lib/x-post/t3-auto";

/** cron は毎回実行する。キャッシュさせない。 */
export const dynamic = "force-dynamic";
/** 4フロア × 4ページ + Supabase 書き込みぶんの余裕。 */
export const maxDuration = 60;

/**
 * 認証。**理由は返り値に持たせるが、HTTP レスポンスには載せない**（サーバログのみ）。
 * `configured` は **秘密が設定されているかどうかだけ**を表し、値には一切触れない。
 */
function authorize(
  request: NextRequest,
): { ok: boolean; configured: boolean; reason: string } {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret) {
    return {
      ok: false,
      configured: false,
      reason: "CRON_SECRET が未設定（env が反映されていない可能性）",
    };
  }
  return authHeader === `Bearer ${cronSecret}`
    ? { ok: true, configured: true, reason: "ok" }
    : { ok: false, configured: true, reason: "Authorization が一致しない" };
}

export async function GET(request: NextRequest): Promise<Response> {
  const auth = authorize(request);
  if (!auth.ok) {
    // **理由はログにのみ残す。** レスポンスに含めると
    // 「秘密が設定されているか」を外部に教えることになる。
    console.warn(
      JSON.stringify({
        tag: "VODNAVI_CRON_UNAUTHORIZED",
        cron_secret_configured: auth.configured,
        reason: auth.reason,
      }),
    );
    return Response.json({ ok: false }, { status: 401 });
  }

  const startedAt = Date.now();
  const now = new Date();
  // **1回の実行内で全行に同じ値**を入れる（最終スナップショットの定義に使う）。
  const batchAt = now;

  try {
    // `/sale` と同じ取得経路を使う。**キャンペーン名は定数で持たない**（rank 走査）。
    // ここでは表示用の上限を外し、走査で見つかったセール中の作品をすべて記録する。
    const { items, totalFound, okFloors, failedFloors } = await fetchSaleItems({
      now,
      // Data Cache（300秒）に載せず、cron の時点の値を取る。
      revalidate: 0,
      limit: Number.MAX_SAFE_INTEGER,
    });

    const rows = toPriceHistoryRows(items, now, batchAt);
    const result = await savePriceHistory(rows);

    // 新セール検知（第95便 CSO裁定⑥ / タスクC）。
    // **書き込みの後に走らせる**——当日の最終スナップショットが確定してから比較するため。
    // **投稿は作らない。材料だけを出す。** 木曜サイクルの報告で参照する。
    const today = jstDateString(now);
    const yesterday = jstDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
    const detected =
      result.skipped || result.errors.length > 0
        ? { newCampaigns: [], skipped: true, error: null }
        : await detectNewCampaigns(today, yesterday);

    // 掃除処理（第101便 タスクB）。**自動投稿より先に走らせる**——
    // 取り残しを片付けてから新しい枠を選ばないと、`autoPostT3` の枠選択が
    // 「過去の予約で埋まっている」と誤判定しうる。
    // **書き込みは `T3_CLEANUP_ENABLED=1` のときだけ。既定は検知とログのみ。**
    const cleanup: CleanupResult = await cleanupStaleApproved(now);
    if (cleanup.candidates.length > 0 || cleanup.skipped) {
      console.info(
        JSON.stringify({
          tag: "VODNAVI_T3_CLEANUP",
          write_enabled: cleanup.writeEnabled,
          grace_minutes: STALE_GRACE_MINUTES,
          cutoff_utc: cleanup.cutoffUtc,
          skipped: cleanup.skipped,
          candidates: cleanup.candidates,
          // **検算の不一致は取り消さない。** 記録して人が見る（§10）。
          verify_all_ok: cleanup.candidates
            .filter((c) => c.marked)
            .every((c) => (c.verify ?? []).every((v) => v.ok)),
        }),
      );
    }

    // T3 自動投稿（第99便 タスクA / CSO裁定(1) 案α）。
    // **稼働フラグの既定は OFF。** ON は CSO の最終確認後であり、
    // **先行条件（Make.com フィルタ修正 / 専用 PAT の発行）が揃うまで ON にしない。**
    // **検知が0件なら何もしない。** 新規が無い日は T3 を作らない
    // （§13-6 の在庫アラートの判定に T3 を当て込まないこと）。
    let autoPost: (T3AutoResult & { campaign_title: string }) | null = null;
    const t3Target = detected.newCampaigns[0];
    if (t3Target) {
      // **1回の実行で扱うのは1件だけ**（`g18` が1日1件を要求するため、
      // 複数件を渡しても2件目以降は必ず落ちる。**落とすために呼ぶより、呼ばない**）。
      if (!t3Target.ends_at) {
        // **期限が無い材料は投稿しない。** `g19` が検証できず、
        // 期限切れを配信時点で判定する手段が無くなる。
        autoPost = {
          skipped: "material.ends_at が無いため投稿しない（期限を検証できない）",
          failures: [], recordId: null, verify: [], scheduledJst: null,
          campaign_title: t3Target.campaign_title,
        };
      } else {
        const r = await autoPostT3(
          { ...t3Target, ends_at: t3Target.ends_at },
          now,
        );
        autoPost = { ...r, campaign_title: t3Target.campaign_title };
      }
      console.info(
        JSON.stringify({
          tag: "VODNAVI_T3_AUTOPOST",
          enabled: isT3AutoPostEnabled(),
          campaign_title: autoPost.campaign_title,
          skipped: autoPost.skipped,
          failures: autoPost.failures,
          record_id: autoPost.recordId,
          scheduled_jst: autoPost.scheduledJst,
          verify: autoPost.verify,
          // **検算の不一致は取り消さない。** 記録して人が見る（§10）。
          verify_all_ok: autoPost.verify.length > 0 && autoPost.verify.every((v) => v.ok),
        }),
      );
    }

    const body = {
      ok: result.errors.length === 0,
      snapshot_date: rows[0]?.snapshot_date ?? null,
      batch_at: batchAt.toISOString(),
      new_campaigns: detected.newCampaigns,
      detection_skipped: detected.skipped,
      detection_error: detected.error,
      t3_autopost_enabled: isT3AutoPostEnabled(),
      t3_autopost: autoPost,
      t3_cleanup_enabled: isT3CleanupEnabled(),
      t3_cleanup: cleanup,
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

    if (detected.newCampaigns.length > 0) {
      // **専用タグ**。木曜サイクルの報告ではこのタグを拾って T3 の材料にする。
      console.info(
        JSON.stringify({
          tag: "VODNAVI_NEW_CAMPAIGN",
          snapshot_date: today,
          campaigns: detected.newCampaigns,
          sale_url: "https://app.vodnavi.jp/sale",
        }),
      );
    }
    console.info(JSON.stringify({ tag: "VODNAVI_PRICE_SNAPSHOT", ...body }));
    return Response.json(body, { status: result.errors.length === 0 ? 200 : 500 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error(JSON.stringify({ tag: "VODNAVI_PRICE_SNAPSHOT_FAILED", message }));
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
