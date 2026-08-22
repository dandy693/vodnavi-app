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

/**
 * 新セール検知 + T3 原稿材料（第95便 CSO裁定⑥ / タスクC）。
 *
 * 【定義・最終スナップショット】cron は1日2回動くため、`snapshot_date` の全行は
 * **複数バッチの和集合**になる（upsert は消えた作品を削除しない）。
 * したがって日次比較の基準は **「`snapshot_date` ごとに `batch_at` が最大の行の集合」**
 * ＝**その日の最終スナップショット**とする。
 *
 * 【厳守】**投稿の自動生成・自動承認は行わない。** ここが出すのは「材料」だけである。
 * 原稿は CTO が作り、ガード17件を通し、`ステータス=ストック` で書き、
 * 承認・予約は別工程（§13-1）。
 */
export interface NewCampaign {
  campaign_title: string;
  /** その日の最終スナップショットでの対象件数。 */
  items: number;
  /** ISO8601。もっとも早い終了時刻。 */
  ends_at: string | null;
  /** 最大割引率（%）。 */
  max_discount: number | null;
  /** 代表作品（割引率降順 → content_id 昇順で決定的に選ぶ）。 */
  samples: { content_id: string; floor_code: string; price: number | null; list_price: number | null }[];
}

/**
 * 前日の最終スナップショットに無く、当日の最終スナップショットに現れた
 * `campaign_title` を返す。**SQL ではなく PostgREST で取得して JS 側で差分を取る**
 * （service role クライアントは任意 SQL を実行できないため）。
 *
 * env 未配線なら空配列（呼び出し側は「検知なし」ではなく「取得できず」として扱えるよう
 * `skipped` を併せて返す）。
 */
export async function detectNewCampaigns(
  today: string,
  yesterday: string,
): Promise<{ newCampaigns: NewCampaign[]; skipped: boolean; error: string | null }> {
  const supabase = getServiceRoleClient();
  if (!supabase) return { newCampaigns: [], skipped: true, error: null };

  const fetchLatestBatch = async (date: string) => {
    // その日の最大 batch_at を取る。
    const head = await supabase
      .from(TABLE)
      .select("batch_at")
      .eq("snapshot_date", date)
      .order("batch_at", { ascending: false })
      .limit(1);
    if (head.error) throw new Error(head.error.message);
    const latest = head.data?.[0]?.batch_at as string | undefined;
    if (!latest) return [];

    // その batch_at の行だけを読む＝最終スナップショット。
    const rows = await supabase
      .from(TABLE)
      .select("content_id, floor_code, price, list_price, campaign_title, campaign_end")
      .eq("snapshot_date", date)
      .eq("batch_at", latest);
    if (rows.error) throw new Error(rows.error.message);
    return rows.data ?? [];
  };

  try {
    const [todayRows, yRows] = await Promise.all([
      fetchLatestBatch(today),
      fetchLatestBatch(yesterday),
    ]);

    const known = new Set(
      yRows.map((r) => (r as { campaign_title: string | null }).campaign_title).filter(Boolean),
    );

    const byTitle = new Map<string, typeof todayRows>();
    for (const r of todayRows) {
      const t = (r as { campaign_title: string | null }).campaign_title;
      if (!t || known.has(t)) continue; // 既知のキャンペーンは新規ではない
      const cur = byTitle.get(t);
      if (cur) cur.push(r);
      else byTitle.set(t, [r]);
    }

    const rate = (r: { price: number | null; list_price: number | null }) =>
      r.price !== null && r.list_price !== null && r.price < r.list_price
        ? Math.round((1 - r.price / r.list_price) * 100)
        : null;

    const newCampaigns: NewCampaign[] = [...byTitle.entries()].map(([title, rows]) => {
      const typed = rows as unknown as {
        content_id: string; floor_code: string;
        price: number | null; list_price: number | null; campaign_end: string | null;
      }[];
      const rates = typed.map(rate).filter((x): x is number => x !== null);
      const ends = typed.map((r) => r.campaign_end).filter((x): x is string => !!x).sort();
      const samples = [...typed]
        .sort((a, b) => (rate(b) ?? 0) - (rate(a) ?? 0) || a.content_id.localeCompare(b.content_id))
        .slice(0, 3)
        .map((r) => ({
          content_id: r.content_id, floor_code: r.floor_code,
          price: r.price, list_price: r.list_price,
        }));
      return {
        campaign_title: title,
        items: typed.length,
        ends_at: ends[0] ?? null,
        max_discount: rates.length > 0 ? Math.max(...rates) : null,
        samples,
      };
    });

    // 件数の多い順（材料として扱いやすい順）。同数は名称で決定的に。
    newCampaigns.sort((a, b) => b.items - a.items || a.campaign_title.localeCompare(b.campaign_title));
    return { newCampaigns, skipped: false, error: null };
  } catch (e) {
    return {
      newCampaigns: [],
      skipped: false,
      error: e instanceof Error ? e.message : "unknown",
    };
  }
}
