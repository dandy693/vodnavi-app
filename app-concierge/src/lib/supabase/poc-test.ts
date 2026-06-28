/**
 * Supabase 接続 PoC — server-only（BRIEF_085 §4 第1段階）。
 *
 * 目的: HUMAN が Vercel に配線した SUPABASE_SERVICE_ROLE_KEY で Supabase へ
 * 到達できるかを「正直に」検証する。成功を偽装しない:
 *   - env 未配線        → "not_configured"（mock fallback・エラー扱いしない）
 *   - 接続不可          → "connection_failed"（実エラーを透過）
 *   - 接続成功・表なし  → "connected_no_table"（疎通 OK・draft schema 未適用＝想定内）
 *   - 接続成功・表あり  → "connected"（editorial_articles read 到達）
 *
 * 最高法律遵守:
 *   - SUPABASE_SERVICE_ROLE_KEY は RLS バイパスの高権限 secret。本ファイルは
 *     server-only（service key は NEXT_PUBLIC_ ではないため client では undefined）。
 *     誤って client から import された場合に備え window ガードを置く。
 *   - af_id は保存しない。CTA URL は既存 url-builder で runtime 生成（BRIEF_085 付録A）。
 *   - mock データは構造確認用 placeholder（実在品番・実在タイトルではない）。
 */
import { createClient } from "@supabase/supabase-js";

export interface PocWork {
  content_id: string;
  title: string;
  floor_code: string;
  slug: string;
}

/** 構造確認用 placeholder（実在品番ではない）。BRIEF_085 §4 の mock-10。 */
export const mockPocWorks: PocWork[] = Array.from({ length: 10 }, (_, i) => {
  const n = String(i + 1).padStart(3, "0");
  return {
    content_id: `mockcid${n}`,
    title: `（モック）検証用ダミー作品 ${i + 1}`,
    floor_code: "videoa",
    slug: `mockcid${n}-placeholder`,
  };
});

export type PocStatus =
  | "not_configured"
  | "connection_failed"
  | "connected_no_table"
  | "connected";

export interface PocResult {
  status: PocStatus;
  detail: string;
  sampleCount: number;
}

export async function verifySupabaseConnection(): Promise<PocResult> {
  if (typeof window !== "undefined") {
    throw new Error(
      "verifySupabaseConnection は server-only です（service_role key 防衛線）。",
    );
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return {
      status: "not_configured",
      detail:
        "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 未配線。Vercel 手動配線の完了を要確認（mock fallback で構造のみ検証）。",
      sampleCount: mockPocWorks.length,
    };
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // draft schema (editorial_articles) 未適用の段階では「relation does not exist」が
  // 返るのが正常。これは「DB へ到達できた」証拠＝疎通 OK と解釈する。
  const { error } = await supabase
    .from("editorial_articles")
    .select("id")
    .limit(1);

  if (!error) {
    return {
      status: "connected",
      detail: "接続成功・editorial_articles read 到達。",
      sampleCount: mockPocWorks.length,
    };
  }

  const code = (error as { code?: string }).code ?? "";
  const tableMissing =
    code === "42P01" ||
    code === "PGRST205" ||
    /relation .* does not exist|could not find the table/i.test(error.message);

  if (tableMissing) {
    return {
      status: "connected_no_table",
      detail: `接続 OK・draft schema 未適用（${error.message}）＝BRIEF_085 §5 step2 の DDL 承認待ち。`,
      sampleCount: mockPocWorks.length,
    };
  }

  return {
    status: "connection_failed",
    detail: `接続失敗: ${error.message}`,
    sampleCount: mockPocWorks.length,
  };
}
