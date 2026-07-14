/**
 * R1-b①: FANZA API 障害時の stale-serve フォールバック（設計書
 * r1b1-stale-serve-design-20260714.md / CSO裁定 2026-07-14）。
 *
 * 原則:
 *   - write-through は fire-and-forget（await しない・失敗無視）＝主経路の
 *     レイテンシ増ゼロ。Supabase 障害は FANZA 経路へ波及しない。
 *   - stale 読出しはエラー経路でのみ実行。テーブル不在・env 未配線・読出し失敗の
 *     いずれも null を返し、呼び出し側は現行どおり throw（完全 fail-safe）。
 *   - 秘密値を保存しない: DMM レスポンスの `request.parameters` は api_id を
 *     echo するため、保存前に request を必ず除去する。
 */
import { createHash } from "node:crypto";

import { getServiceRoleClient } from "@/lib/supabase/server";

import type { DmmItemListResponse } from "./types";

const TABLE = "fanza_response_cache";

/** 鮮度上限（CSO裁定 2026-07-14: 一覧系 48h / cid 単品 7日） */
export const STALE_MAX_AGE_LIST_S = 172_800;
export const STALE_MAX_AGE_CID_S = 604_800;

export type CacheKind = "list" | "cid";

/**
 * パラメータの安定ハッシュ。api_id / affiliate_id は params に含まれない
 * （fetchItemList 側で URL 構築時にのみ付与）ため、キーにも混入しない。
 * `filtered`（画像検証フィルタの有無）は出力内容を変えるためキーに含める。
 */
export function buildCacheKey(
  params: Record<string, unknown>,
  filtered: boolean,
): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v != null && v !== "")
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => [k, String(v)]);
  entries.push(["__filtered", String(filtered)]);
  return createHash("sha256").update(JSON.stringify(entries)).digest("hex");
}

/** `request`（api_id echo を含む）を落とした保存用ペイロード */
function sanitizePayload(data: DmmItemListResponse): { result: DmmItemListResponse["result"] } {
  return { result: data.result };
}

/**
 * 正常応答の write-through。呼び出し側は await しないこと（fire-and-forget）。
 * 書込み成功時、約2%の確率で期限切れ行（7日超）の機会的削除を随伴させる。
 */
export function persistStaleCandidate(
  cacheKey: string,
  kind: CacheKind,
  data: DmmItemListResponse,
): void {
  const supabase = getServiceRoleClient();
  if (!supabase) return;
  void supabase
    .from(TABLE)
    .upsert(
      {
        cache_key: cacheKey,
        kind,
        payload: sanitizePayload(data),
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "cache_key" },
    )
    .then(({ error }) => {
      if (error || Math.random() >= 0.02) return;
      const cutoff = new Date(
        Date.now() - STALE_MAX_AGE_CID_S * 1000,
      ).toISOString();
      void supabase
        .from(TABLE)
        .delete()
        .lt("fetched_at", cutoff)
        .then(() => undefined);
    });
}

/**
 * stale 読出し（エラー経路専用）。鮮度上限内の行があれば復元して返す。
 * 見つからない・古い・失敗はすべて null（呼び出し側は現行どおり throw）。
 */
export async function readStaleCache(
  cacheKey: string,
  maxAgeS: number,
): Promise<{ data: DmmItemListResponse; ageS: number } | null> {
  const supabase = getServiceRoleClient();
  if (!supabase) return null;
  try {
    const { data: row, error } = await supabase
      .from(TABLE)
      .select("payload, fetched_at")
      .eq("cache_key", cacheKey)
      .maybeSingle();
    if (error || !row?.payload || !row.fetched_at) return null;

    const ageS = Math.floor(
      (Date.now() - new Date(row.fetched_at).getTime()) / 1000,
    );
    if (!Number.isFinite(ageS) || ageS < 0 || ageS > maxAgeS) return null;

    const payload = row.payload as { result?: DmmItemListResponse["result"] };
    if (!payload.result) return null;

    // request は保存時に除去済み（api_id echo 対策）。空で復元する。
    return {
      data: { request: { parameters: {} }, result: payload.result },
      ageS,
    };
  } catch {
    return null;
  }
}
