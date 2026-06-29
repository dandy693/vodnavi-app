/**
 * Supabase サーバー専用クライアント（BRIEF_085 Option B / フェーズ2 リーダー基盤）。
 *
 * 最高法律遵守:
 *   - `SUPABASE_SERVICE_ROLE_KEY` は RLS をバイパスする高権限 secret。本ファイルは
 *     server-only。誤って client から import された場合に備え window ガードを置く
 *     （poc-test.ts と同方針）。`NEXT_PUBLIC_` ではないため client では undefined。
 *   - env 未配線（ローカル等）では **例外を投げず null を返す**。呼び出し側は
 *     null を「データ無し」として graceful に扱い、ビルド/ローカルを壊さない。
 *   - service_role は RLS をバイパスするため、公開リーダーの SELECT は呼び出し側で
 *     必ず `publish_status = 'published'` を明示フィルタする（BRIEF_086 §4 の
 *     「捏造データを本番 published にしない」境界を二重化）。
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// undefined = 未解決 / null = env 未配線で解決済 / client = 解決済。
let cachedClient: SupabaseClient | null | undefined;

export function getServiceRoleClient(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error(
      "getServiceRoleClient は server-only です（service_role key 防衛線）。",
    );
  }
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  cachedClient =
    url && serviceRoleKey
      ? createClient(url, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;

  return cachedClient;
}
