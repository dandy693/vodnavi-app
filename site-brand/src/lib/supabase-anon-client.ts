/**
 * site-brand（vodnavi.jp クリーンメディア）公開閲覧用 **匿名（anon）専用** Supabase クライアント。
 *
 * 最高防衛境界（BRIEF_086 §4 / 本ファイルの不変条件・静的監査対象）:
 *   - 使用キーは **anon（public）キーのみ**。`NEXT_PUBLIC_SUPABASE_URL` /
 *     `NEXT_PUBLIC_SUPABASE_ANON_KEY` だけを参照する。
 *   - サービスロール（管理者権限・RLS バイパス）キーは **本ファイルに一切登場させない**。
 *     混入＝公開境界の崩壊につき禁止。本クライアントは anon（public）専用。
 *   - anon キーは設計上クライアント公開前提（RLS で保護）。本番 RLS は
 *     `public.editorial_articles` に published-only の anon SELECT policy を適用済
 *     （2026-06-30 / `app-concierge/supabase/patch_add_public_read_policy.sql`・
 *     anon 監査 0/0/0 で draft 物理不可視を確証）。よって anon クライアントが
 *     誤って draft を引くことはインフラ層で遮断されている（多重防御）。
 *
 * graceful: env 未配線（ローカル / 未設定）では例外を投げず null を返す。
 *   呼び出し側は null を「データ無し」として扱い、ビルド / ローカルを壊さない。
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_ 接頭辞＝ビルド時にクライアントへ埋め込まれる公開値（anon 専用）。
// ここで参照してよいのは「公開前提の値」だけ＝URL と anon キーに限る。
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// undefined = 未解決 / null = env 未配線で解決済 / client = 解決済。
let cached: SupabaseClient | null | undefined;

/**
 * 公開（anon）専用 Supabase クライアントを取得。
 * env 未配線なら null（呼び出し側で graceful フォールバック → notFound 等）。
 */
export function getAnonClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    cached = null;
    return cached;
  }

  cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      // 匿名公開閲覧＝認証セッション不要。トークン保持/更新を無効化。
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cached;
}
