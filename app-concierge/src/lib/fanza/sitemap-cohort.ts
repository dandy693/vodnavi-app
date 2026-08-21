/**
 * BRIEF_128 コホート1: 価格帯層化サンプル 5,000 URL の配信（CSO承認 2026-08-15 第57便 /
 * INSERT 2026-08-21 第84便 / 公開 2026-08-21 第86便）。
 *
 * `sitemap-archive.ts` と同型の読み出し専用モジュール。
 *   - Supabase の `sitemap_cohort` のみを読む（**FANZA API コールは発生しない**）
 *   - **抽出条件は `cohort_no` 一致かつ `status='live'` のみ。** `staged` / `retired` は出さない
 *   - エラー・env 未配線時は空配列 → 呼び出し側は空の整形式 urlset を返す
 *
 * 【ロールバック】第一手は `robots.ts` から宣言を外すこと（コード revert 不要）。
 * DB 側は `update public.sitemap_cohort set status='retired', retired_at=now() where cohort_no=1`。
 * 本モジュールは `status='live'` しか読まないため、`retired` にした時点で配信が止まる。
 *
 * 【権限の限界・§12 と同型】読み取りは `getServiceRoleClient()` を通り、
 * **service role は RLS を迂回する**。テーブルに RLS と policy 3件が設定されていることを
 * もって「誰も `live` を書けない」とは言えない。
 */
import { getServiceRoleClient } from "@/lib/supabase/server";

const TABLE = "sitemap_cohort";

/** PostgREST の1リクエスト上限(既定1,000行)を回避するためのページサイズ/上限 */
const PAGE_SIZE = 1000;
const MAX_PAGES = 20;

export interface CohortRow {
  content_id: string;
  floor_code: string;
  released_at: string | null;
}

/**
 * 指定コホートの `live` 行を読み出す。
 * 失敗・未配線時は空配列（呼び出し側は空の urlset を返す）。
 */
export async function fetchSitemapCohortRows(
  cohortNo: number,
): Promise<CohortRow[]> {
  const supabase = getServiceRoleClient();
  if (!supabase) return [];
  const rows: CohortRow[] = [];
  try {
    for (let page = 0; page < MAX_PAGES; page++) {
      const from = page * PAGE_SIZE;
      const { data, error } = await supabase
        .from(TABLE)
        .select("content_id, floor_code, released_at")
        .eq("cohort_no", cohortNo)
        .eq("status", "live")
        .order("content_id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error || !data) break;
      rows.push(...(data as CohortRow[]));
      if (data.length < PAGE_SIZE) break;
    }
  } catch {
    /* fail-safe: 取得できた分のみ返す */
  }
  return rows;
}
