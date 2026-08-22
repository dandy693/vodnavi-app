/**
 * セール価格の時系列を Supabase へ蓄積する（第93便 CSO裁定B(1)）。
 *
 * 【なぜ DB 化するか（裁定の転記）】
 *   「ファイル蓄積のままでは突合・時系列分析ができない。
 *    sitemap_cohort と同じ三層構成は不要（読み取り専用データ・公開面に出ない）。
 *    最小スキーマで cron 化まで実施すること」
 *
 * 【権限】`price_history` は **RLS 有効・ポリシー 0件**。anon / authenticated からは
 * 一切読めず、**service role だけが到達できる**。専用ロール・列単位 GRANT・トリガは
 * 作っていない（裁定どおり三層構成は取らない）。
 * **ただし §12 と同型の限界は残る**——service role キーを持つ主体は自由に書ける。
 * 「RLS があるから安全」とは書かないこと。
 *
 * 【冪等性】主キー `(content_id, snapshot_date)` により **1日1作品1行**。
 * cron が二重起動しても行は増えず、同日中の再取得は上書きになる。
 *
 * 【公開面から参照しない】`/sale` はこのテーブルを読まない。
 * 「最安値」表示は蓄積量が足りず現時点では成立しないため。
 */
import { getServiceRoleClient } from "@/lib/supabase/server";
import type { PriceHistoryRow } from "./sale";

const TABLE = "price_history";

/** 1リクエストで送る行数の上限（PostgREST のペイロード肥大を避ける）。 */
const CHUNK = 500;

// 行の組み立ては **純関数として `sale.ts` に置いてある**（`@/` 別名を使わないため
// node:test から直接テストできる）。本ファイルは I/O だけを持つ。
export { jstDateString, toPriceHistoryRows } from "./sale";
export type { PriceHistoryRow } from "./sale";

export interface SaveResult {
  /** 送った行数。 */
  attempted: number;
  /** 書き込みに成功した行数（チャンク単位で集計）。 */
  saved: number;
  /** env 未配線などで書き込みを行わなかった場合に true。 */
  skipped: boolean;
  /** チャンクごとのエラー文（**キーや資格情報は含めない**）。 */
  errors: string[];
}

/**
 * 保存する。**`(content_id, snapshot_date)` で upsert** するため冪等。
 *
 * env 未配線（ローカル等）では `getServiceRoleClient()` が null を返すので
 * **例外を投げずに `skipped: true` を返す**（`server.ts` の方針に揃える）。
 */
export async function savePriceHistory(
  rows: readonly PriceHistoryRow[],
): Promise<SaveResult> {
  const supabase = getServiceRoleClient();
  if (!supabase) {
    return { attempted: rows.length, saved: 0, skipped: true, errors: [] };
  }

  let saved = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase
      .from(TABLE)
      .upsert(chunk, { onConflict: "content_id,snapshot_date" });
    if (error) {
      // **メッセージのみ**を積む。キーや接続情報は載せない。
      errors.push(`chunk@${i}: ${error.message}`);
    } else {
      saved += chunk.length;
    }
  }

  return { attempted: rows.length, saved, skipped: false, errors };
}
